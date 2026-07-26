import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';

const QUEUE_STORAGE_KEY = 'offline_mutation_queue_v1';

/**
 * Thrown by a mutation method (instead of the usual network/validation
 * error) when the device is offline and the action has been queued for
 * later replay instead of attempted. Callers can check for this type to
 * show a distinct "queued, will sync later" message rather than a failure.
 */
export class OfflineQueuedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfflineQueuedError';
  }
}

export interface QueuedMutation {
  id: string;
  type: string;
  args: any[];
  description: string;
  createdAt: string;
  attempts: number;
  /**
   * Set on a mutation (e.g. createHabitBusiness) whose successful replay
   * produces a real server id for something that was only known locally by
   * a client-generated placeholder id until now. When set, drain() rewrites
   * args[0] of every mutation still queued behind this one that references
   * `tempId` to the real id the handler's result comes back with, before
   * replaying them — so a habit created offline can be completed, edited,
   * or deleted offline too, in the same session, before it's ever synced.
   */
  tempId?: string;
}

type MutationHandler = (...args: any[]) => Promise<any>;

/**
 * Persists mutating actions (complete habit, buy/sell stock, undo, ...) that
 * failed because the device was offline, and replays them — by re-running
 * the exact same service call, not by re-applying cached data — once
 * connectivity returns. Re-running the original call (instead of replaying
 * captured intermediate state) is what makes replay safe: each handler's own
 * validation (goal already met, insufficient shares, etc.) runs again
 * against live server state at replay time, so a mutation that's no longer
 * valid by the time we're back online is rejected the same way it would be
 * if the user had just tried it again themselves.
 *
 * Handlers are registered by whichever service owns the mutation (see
 * HabitBusinessService's constructor) rather than injected here, to avoid a
 * circular DI dependency between this service and the services that use it.
 */
@Injectable({
  providedIn: 'root',
})
export class OfflineQueueService {
  private handlers = new Map<string, MutationHandler>();
  private draining = false;
  private drainCompleteCallbacks: Array<() => void | Promise<void>> = [];

  // Cached synchronously so isOffline() can stay a plain boolean check (it's
  // called inline from many synchronous branches), while the actual truth
  // comes from the native Network plugin — navigator.onLine is unreliable in
  // WKWebView (e.g. doesn't reflect "connected but no real internet" states).
  // Starts from navigator.onLine as a best-effort guess until the first
  // Network.getStatus() resolves just after construction.
  private online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  private readonly pendingCountSubject = new BehaviorSubject<number>(0);
  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor() {
    this.refreshPendingCount();

    Network.getStatus().then((status) => {
      this.online = status.connected;
      if (status.connected) this.drain();
    });
    Network.addListener('networkStatusChange', (status) => {
      this.online = status.connected;
      if (status.connected) this.drain();
    });
    App.addListener('resume', () => this.drain());
  }

  /**
   * Registers the function that actually performs a mutation of the given
   * type. Call this once per mutation type, typically from the owning
   * service's constructor.
   */
  registerHandler(type: string, handler: MutationHandler): void {
    this.handlers.set(type, handler);
  }

  /** Registers a callback fired once after a drain() that actually replayed at least one mutation empties the queue. */
  onDrainComplete(callback: () => void | Promise<void>): void {
    this.drainCompleteCallbacks.push(callback);
  }

  isOffline(): boolean {
    return !this.online;
  }

  /**
   * Queues a mutation for later replay. `description` is a short,
   * user-facing summary (e.g. `Complete "Morning Run"`) used for the
   * pending-sync UI. `tempId`, if given, marks this as the mutation that
   * will resolve a client-generated placeholder id to a real one (see
   * QueuedMutation.tempId).
   */
  async enqueue(type: string, args: any[], description: string, tempId?: string): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      args,
      description,
      createdAt: new Date().toISOString(),
      attempts: 0,
      ...(tempId ? { tempId } : {}),
    });
    await this.saveQueue(queue);
  }

  async getQueue(): Promise<QueuedMutation[]> {
    const { value } = await Preferences.get({ key: QUEUE_STORAGE_KEY });
    if (!value) return [];
    try {
      return JSON.parse(value) as QueuedMutation[];
    } catch {
      return [];
    }
  }

  private async saveQueue(queue: QueuedMutation[]): Promise<void> {
    await Preferences.set({ key: QUEUE_STORAGE_KEY, value: JSON.stringify(queue) });
    this.pendingCountSubject.next(queue.length);
  }

  private async refreshPendingCount(): Promise<void> {
    const queue = await this.getQueue();
    this.pendingCountSubject.next(queue.length);
  }

  /**
   * Removes and returns the most recently queued not-yet-replayed mutation
   * of `type` whose args satisfy `matchArgs`, without ever calling its
   * handler. Used to cancel a pending action out entirely (e.g. undoing a
   * completion that hasn't synced yet — there's nothing to reverse
   * server-side, so there's nothing to replay either) instead of queuing a
   * second mutation to reverse the first once both eventually replay.
   * Returns null if no matching mutation is queued (i.e. the thing being
   * undone was already synced before we went offline, and does need a real
   * replayed reversal).
   */
  async cancelLastQueued(type: string, matchArgs: (args: any[]) => boolean): Promise<QueuedMutation | null> {
    const queue = await this.getQueue();
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].type === type && matchArgs(queue[i].args)) {
        const [removed] = queue.splice(i, 1);
        await this.saveQueue(queue);
        return removed;
      }
    }
    return null;
  }

  /**
   * Removes every still-queued mutation associated with a given temp id —
   * the create itself plus anything queued against it since (completions,
   * edits). Used when a habit created offline is also deleted offline
   * before ever syncing: none of it needs to reach the server at all.
   */
  async cancelAllForTempId(tempId: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((m) => m.tempId !== tempId && m.args[0] !== tempId);
    await this.saveQueue(filtered);
  }

  /**
   * Replays every queued mutation, in the order they were queued. Stops
   * immediately (without dropping remaining items) if a replay fails
   * because we're still offline, so the whole queue is retried as a unit
   * next time. A replay that fails for a real reason (e.g. the habit's
   * goal was already completed on another device in the meantime) is
   * dropped from the queue and surfaced to whichever handler wants to
   * report it — the caller's own validation error is the source of truth,
   * not a generic retry.
   */
  async drain(): Promise<void> {
    if (this.draining || this.isOffline()) return;
    this.draining = true;
    let replayedAny = false;

    try {
      let queue = await this.getQueue();

      while (queue.length > 0) {
        const mutation = queue[0];
        const handler = this.handlers.get(mutation.type);

        if (!handler) {
          // No handler registered (shouldn't normally happen) — drop it
          // rather than getting stuck on it forever.
          queue = queue.slice(1);
          await this.saveQueue(queue);
          continue;
        }

        try {
          const result = await handler(...mutation.args);
          replayedAny = true;
          let remaining = queue.slice(1);

          // This mutation resolved a placeholder id to a real one — rewrite
          // it everywhere it's still referenced (args[0] by convention) in
          // whatever's left in the queue before any of it replays.
          if (mutation.tempId && result?.id) {
            remaining = remaining.map((m) => ({
              ...m,
              args: m.args.map((a, idx) => (idx === 0 && a === mutation.tempId ? result.id : a)),
            }));
          }

          queue = remaining;
          await this.saveQueue(queue);
        } catch (error) {
          if (this.isOffline()) {
            // Lost connectivity again mid-drain — leave the remaining
            // queue intact and try again on the next online/resume event.
            break;
          }
          // A real (non-network) failure: this mutation is no longer
          // valid, so drop it instead of retrying it forever.
          console.warn(`[OfflineQueue] Dropping queued "${mutation.description}" — replay failed:`, error);
          queue = queue.slice(1);
          await this.saveQueue(queue);
        }
      }

      if (replayedAny && queue.length === 0) {
        for (const cb of this.drainCompleteCallbacks) {
          try {
            await cb();
          } catch (error) {
            console.error('[OfflineQueue] onDrainComplete callback failed:', error);
          }
        }
      }
    } finally {
      this.draining = false;
    }
  }
}
