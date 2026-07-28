import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { HabitBusiness } from '../services/habit-business.service';
import { WelcomeStepComponent } from './steps/welcome-step/welcome-step.component';
import { CreateHabitStepComponent } from './steps/create-habit-step/create-habit-step.component';
import { FirstCheckinStepComponent, CheckinResult } from './steps/first-checkin-step/first-checkin-step.component';
import { IncomeExplainerStepComponent } from './steps/income-explainer-step/income-explainer-step.component';
import { ShopPreviewStepComponent } from './steps/shop-preview-step/shop-preview-step.component';
import { SocialPreviewStepComponent } from './steps/social-preview-step/social-preview-step.component';
import { StreaksAchievementsStepComponent } from './steps/streaks-achievements-step/streaks-achievements-step.component';

const STEP_COUNT = 7;

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    WelcomeStepComponent,
    CreateHabitStepComponent,
    FirstCheckinStepComponent,
    IncomeExplainerStepComponent,
    ShopPreviewStepComponent,
    SocialPreviewStepComponent,
    StreaksAchievementsStepComponent,
  ],
})
export class OnboardingPage implements OnInit {
  readonly stepCount = STEP_COUNT;
  stepIndex = 0;

  habit: HabitBusiness | null = null;
  checkinResult: CheckinResult | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    // A signed-in name for the welcome step's greeting, best-effort.
  }

  goToStep(index: number) {
    this.stepIndex = Math.min(Math.max(index, 0), this.stepCount - 1);
  }

  onHabitCreated(habit: HabitBusiness) {
    this.habit = habit;
    this.goToStep(2);
  }

  onCheckinCompleted(result: CheckinResult) {
    this.checkinResult = result;
    this.goToStep(3);
  }

  async onOnboardingFinished() {
    try {
      const { data: { session } } = await this.authService.getSession();
      if (session?.user) {
        await this.authService.markOnboardingComplete(session.user.id);
      }
    } catch (error) {
      console.error('❌ OnboardingPage: failed to mark onboarding complete:', error);
    }
    this.router.navigate(['/home']);
  }
}
