import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';
import { HabitBusiness, HabitBusinessService } from '../../../services/habit-business.service';

export interface CheckinResult {
  earnings: number;
  streak: number;
}

@Component({
  selector: 'app-first-checkin-step',
  templateUrl: './first-checkin-step.component.html',
  styleUrls: ['../onboarding-step.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonSpinner],
})
export class FirstCheckinStepComponent {
  @Input({ required: true }) habit!: HabitBusiness;
  @Output() completed = new EventEmitter<CheckinResult>();

  completing = false;
  result: CheckinResult | null = null;
  errorMessage: string | null = null;

  constructor(private habitBusinessService: HabitBusinessService) {
    addIcons({ checkmarkCircle });
  }

  async completeNow() {
    if (this.completing || this.result) return;
    this.completing = true;
    this.errorMessage = null;
    try {
      const { earnings, streak } = await this.habitBusinessService.completeHabit(this.habit.id);
      this.result = { earnings, streak };
    } catch (error: any) {
      this.errorMessage = error?.message || 'Something went wrong completing your habit — try again.';
    } finally {
      this.completing = false;
    }
  }

  continue() {
    if (this.result) {
      this.completed.emit(this.result);
    }
  }
}
