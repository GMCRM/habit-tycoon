import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { getLocalDateString } from '../shared/date.util';

export interface HabitUpdateEvent {
  type: 'completion' | 'undo' | 'created' | 'resync';
  habitBusinessId: string;
  completionDate: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class HabitUpdateService {
  private updateSubject = new BehaviorSubject<HabitUpdateEvent | null>(null);
  public updates$: Observable<HabitUpdateEvent | null> = this.updateSubject.asObservable();

  /**
   * Emit a habit completion event
   */
  emitHabitCompletion(habitBusinessId: string, completionDate: string = getLocalDateString()) {
    this.updateSubject.next({
      type: 'completion',
      habitBusinessId,
      completionDate,
      timestamp: Date.now()
    });
  }

  /**
   * Emit a habit undo event
   */
  emitHabitUndo(habitBusinessId: string, completionDate: string = getLocalDateString()) {
    this.updateSubject.next({
      type: 'undo',
      habitBusinessId,
      completionDate,
      timestamp: Date.now()
    });
  }

  /**
   * Emit a new habit-business creation event
   */
  emitHabitCreated(habitBusinessId: string) {
    this.updateSubject.next({
      type: 'created',
      habitBusinessId,
      completionDate: getLocalDateString(),
      timestamp: Date.now()
    });
  }

  /**
   * Signal that the app regained focus and any page listening should
   * re-fetch its data — a catch-all for changes that may have happened on
   * another device while this tab/app was in the background (and so were
   * never seen by the live Realtime subscription, which only delivers
   * events while actually connected). Carries no specific habitBusinessId,
   * so per-cell live-patch listeners (which match on that id) ignore it;
   * only whole-page reload listeners like the dashboard act on it.
   */
  emitResync() {
    this.updateSubject.next({
      type: 'resync',
      habitBusinessId: '',
      completionDate: getLocalDateString(),
      timestamp: Date.now()
    });
  }

  /**
   * Clear the current update event
   */
  clearUpdate() {
    this.updateSubject.next(null);
  }
}
