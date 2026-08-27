import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons,
  IonList, IonItem, IonLabel, IonReorderGroup, IonReorder, ReorderEndCustomEvent
} from '@ionic/angular/standalone';
import { HabitBusiness } from '../../services/habit-business.service';
import { HabitCompletionService } from '../../services/habit-completion.service';
import { HabitIntervalService } from '../../services/habit-interval.service';
import { addIcons } from 'ionicons';
import { calendarOutline, close, checkmarkDoneCircle, checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-pending-habits-modal',
  templateUrl: './pending-habits-modal.component.html',
  styleUrls: ['./pending-habits-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonButtons, IonList, IonItem, IonLabel, IonReorderGroup, IonReorder
  ]
})
export class PendingHabitsModalComponent {
  /** Not-yet-completed habit-businesses, in current display order. */
  @Input() habits: HabitBusiness[] = [];
  /** Called with the full reordered id list after every drag — persists immediately, mirroring the Home screen's up/down reorder. */
  @Input() onReorder!: (orderedHabitIds: string[]) => void | Promise<void>;
  @Input() modalController: any;

  /** Local working copy so drags animate instantly without waiting on the parent's own habits array to re-render. */
  orderedHabits: HabitBusiness[] = [];

  /** Ids currently mid-complete-tap, so their button can show a busy state and repeat taps are ignored. */
  completingIds = new Set<string>();

  constructor(
    private habitCompletionService: HabitCompletionService,
    private habitIntervalService: HabitIntervalService,
  ) {
    addIcons({ calendarOutline, close, checkmarkDoneCircle, checkmarkCircle });
  }

  ngOnInit() {
    this.orderedHabits = [...this.habits];
  }

  async handleReorder(ev: ReorderEndCustomEvent) {
    this.orderedHabits = ev.detail.complete(this.orderedHabits);
    await this.onReorder(this.orderedHabits.map(hb => hb.id));
  }

  /**
   * Complete a habit right from the list — same tap flow as the Home
   * screen's card. For a multi-completion goal (goal_value > 1), a tap only
   * advances progress by one and the row stays put; the server response
   * doesn't include the new progress count, so it's applied optimistically
   * here (mirroring what the completion just did server-side) rather than
   * waiting on a full dashboard refresh to reflect it. The row is only
   * dropped from the list once the goal is actually met. Joint ventures
   * don't track current_progress/goal_value at all (their "done" state is
   * per-co-owner check-in) so a single tap there still completes and
   * removes the row, exactly like today.
   */
  async handleCompleteTap(hb: HabitBusiness, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.completingIds.has(hb.id)) return;
    this.completingIds.add(hb.id);
    try {
      const result = await this.habitCompletionService.complete(hb);
      if (result.completed) {
        let goalMet = true;
        if (!hb.is_joint_venture) {
          hb.current_progress = this.habitIntervalService.getCurrentProgress(hb) + 1;
          hb.last_completed_at = new Date().toISOString();
          goalMet = this.habitIntervalService.isHabitCompleteForCurrentPeriod(hb);
        }
        if (goalMet) {
          this.orderedHabits = this.orderedHabits.filter(item => item.id !== hb.id);
        }
      }
    } finally {
      this.completingIds.delete(hb.id);
    }
  }

  /** Current/goal progress for this period — same source as the Home screen's badge. */
  getCurrentProgress(hb: HabitBusiness): number {
    return this.habitIntervalService.getCurrentProgress(hb);
  }

  trackByHabitId(_index: number, hb: HabitBusiness): string {
    return hb.id;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
