import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUp } from 'ionicons/icons';
import { HabitBusiness } from '../../../services/habit-business.service';
import { CheckinResult } from '../first-checkin-step/first-checkin-step.component';

@Component({
  selector: 'app-income-explainer-step',
  templateUrl: './income-explainer-step.component.html',
  styleUrls: ['../onboarding-step.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class IncomeExplainerStepComponent {
  @Input({ required: true }) habit!: HabitBusiness;
  @Input({ required: true }) result!: CheckinResult;
  @Output() next = new EventEmitter<void>();

  constructor() {
    addIcons({ trendingUp });
  }
}
