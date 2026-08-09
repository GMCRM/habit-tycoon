import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface HabitUpdateEvent {
  type: 'completion' | 'undo' | 'created';
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
   * Get today's date in local timezone as YYYY-MM-DD string
   */
  private getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Emit a habit completion event
   */
  emitHabitCompletion(habitBusinessId: string, completionDate: string = this.getLocalDateString()) {
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
  emitHabitUndo(habitBusinessId: string, completionDate: string = this.getLocalDateString()) {
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
      completionDate: this.getLocalDateString(),
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
