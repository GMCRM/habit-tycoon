import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons,
  IonList, IonItem, IonLabel, IonReorderGroup, IonReorder, ReorderEndCustomEvent
} from '@ionic/angular/standalone';
import { HabitBusiness } from '../../services/habit-business.service';
import { addIcons } from 'ionicons';
import { calendarOutline, close, checkmarkDoneCircle } from 'ionicons/icons';

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

  constructor() {
    addIcons({ calendarOutline, close, checkmarkDoneCircle });
  }

  ngOnInit() {
    this.orderedHabits = [...this.habits];
  }

  async handleReorder(ev: ReorderEndCustomEvent) {
    this.orderedHabits = ev.detail.complete(this.orderedHabits);
    await this.onReorder(this.orderedHabits.map(hb => hb.id));
  }

  trackByHabitId(_index: number, hb: HabitBusiness): string {
    return hb.id;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
