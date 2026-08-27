import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter
} from '@ionic/angular/standalone';
import { HabitBusiness } from '../../services/habit-business.service';
import { HabitMilestoneCardComponent } from '../../shared/components/habit-milestone-card/habit-milestone-card.component';

/**
 * Shown instead of the upgrade-options list once a habit has maxed out
 * tier 1 (Oil Company) but hasn't earned all 6 milestone badges yet — the
 * Habit Tycoon (tier 2) business types stay hidden until then, so this
 * shows what's left instead of just "no upgrades available".
 */
@Component({
  selector: 'app-tycoon-progress-modal',
  templateUrl: './tycoon-progress-modal.component.html',
  styleUrls: ['./tycoon-progress-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter, HabitMilestoneCardComponent]
})
export class TycoonProgressModalComponent {
  @Input() habitBusiness!: HabitBusiness;
  @Input() earnedKeys: string[] = [];
  @Input() modalController: any;

  dismiss() {
    this.modalController.dismiss();
  }
}
