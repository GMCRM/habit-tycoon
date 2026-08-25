import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { AchievementReaction } from '../achievement-reaction-bar/achievement-reaction-bar.component';

/**
 * Lists who reacted to an achievement and with what emoji. Presented via
 * ModalController from AchievementReactionBarComponent so it renders as a
 * real ion-modal (overlaying the whole app) instead of a div pinned inside
 * the notification card.
 */
@Component({
  selector: 'app-achievement-reactions-modal',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons],
  templateUrl: './achievement-reactions-modal.component.html',
  styleUrls: ['./achievement-reactions-modal.component.scss']
})
export class AchievementReactionsModalComponent {
  @Input() reactions: AchievementReaction[] = [];
  @Input() modalController: any;

  constructor() {
    addIcons({ close });
  }

  dismiss(): void {
    this.modalController.dismiss();
  }
}
