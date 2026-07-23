import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';

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

  private readonly pendingCountSubject = new BehaviorSubject<number>(0);
  readonly pendingCount$ = this.pendingCountSubject.asObservable();

  constructor() {
    this.refreshPendingCount();

    window.addEventListener('online', () => this.drain());
    App.addListener('resume', () => this.drain());

    if (navigator.onLine) {
      // Catch anything left over from a previous session (app was killed
      // while offline with items still queued).
      this.drain();
    }
  }

  /**
   * Registers the function that actually performs a mutation of the given
   * type. Call this once per mutation type, typically from the owning
   * service's constructor.
   */
  registerHandler(type: string, handler: MutationHandler): void {
    this.handlers.set(type, handler);
  }

  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Queues a mutation for later replay. `description` is a short,
   * user-facing summary (e.g. `Complete "Morning Run"`) used for the
   * pending-sync UI.
   */
  async enqueue(type: string, args: any[], description: string): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      args,
      description,
      createdAt: new Date().toISOString(),
      attempts: 0,
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
          await handler(...mutation.args);
          queue = queue.slice(1);
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
    } finally {
      this.draining = false;
    }
  }
}
