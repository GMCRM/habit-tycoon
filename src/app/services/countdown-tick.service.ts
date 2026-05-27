import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountdownTickService implements OnDestroy {
  private tickSubject = new BehaviorSubject<number>(Date.now());
  public tick$: Observable<number> = this.tickSubject.asObservable();

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private subscriberCount = 0;

  /** Start the shared 1-second ticker (called lazily on first subscription demand). */
  start(): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => {
      this.tickSubject.next(Date.now());
    }, 1000);
  }

  /** Stop the ticker (called when no components are active). */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Components call this in ngOnInit to register interest. */
  register(): void {
    this.subscriberCount++;
    this.start();
  }

  /** Components call this in ngOnDestroy to de-register. */
  unregister(): void {
    this.subscriberCount = Math.max(0, this.subscriberCount - 1);
    if (this.subscriberCount === 0) {
      this.stop();
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
