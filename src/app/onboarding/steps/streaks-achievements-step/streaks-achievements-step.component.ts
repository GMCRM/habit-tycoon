import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trophy } from 'ionicons/icons';
import { MILESTONE_DEFINITIONS, GENERAL_ACHIEVEMENT_DEFINITIONS } from '../../../services/achievements.service';

@Component({
  selector: 'app-streaks-achievements-step',
  templateUrl: './streaks-achievements-step.component.html',
  styleUrls: ['../onboarding-step.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonIcon],
})
export class StreaksAchievementsStepComponent {
  @Output() next = new EventEmitter<void>();

  // A small, illustrative sample — the full lists live in AchievementsService.
  sampleMilestones = MILESTONE_DEFINITIONS.slice(0, 3);
  sampleAchievements = GENERAL_ACHIEVEMENT_DEFINITIONS.filter((a) =>
    ['networth_10k', 'social_first_friend', 'stocks_first_investment'].includes(a.key)
  );

  constructor() {
    addIcons({ trophy });
  }
}
