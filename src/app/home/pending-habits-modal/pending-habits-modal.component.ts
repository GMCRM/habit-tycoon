import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons,
  IonList, IonItem, IonLabel, IonReorderGroup, IonReorder, ReorderEndCustomEvent
} from '@ionic/angular/standalone';
import { HabitBusiness } from '../../services/habit-business.service';
import { HabitCompletionService } from '../../services/habit-completion.service';
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

  constructor(private habitCompletionService: HabitCompletionService) {
    addIcons({ calendarOutline, close, checkmarkDoneCircle, checkmarkCircle });
  }

  ngOnInit() {
    this.orderedHabits = [...this.habits];
  }

  async handleReorder(ev: ReorderEndCustomEvent) {
    this.orderedHabits = ev.detail.complete(this.orderedHabits);
    await this.onReorder(this.orderedHabits.map(hb => hb.id));
  }

  /** Complete a habit right from the list — same one-tap flow as the Home screen's card, minus the wait to see it disappear there too. */
  async handleCompleteTap(hb: HabitBusiness, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.completingIds.has(hb.id)) return;
    this.completingIds.add(hb.id);
    try {
      const result = await this.habitCompletionService.complete(hb);
      if (result.completed) {
        this.orderedHabits = this.orderedHabits.filter(item => item.id !== hb.id);
      }
    } finally {
      this.completingIds.delete(hb.id);
    }
  }

  trackByHabitId(_index: number, hb: HabitBusiness): string {
    return hb.id;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
