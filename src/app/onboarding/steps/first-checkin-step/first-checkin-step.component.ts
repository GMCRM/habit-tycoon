import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle, arrowUndo, chevronUp, chevronDown, trash, receiptOutline,
  calendarOutline, trendingUp, people, create, informationCircleOutline, arrowForward
} from 'ionicons/icons';
import { HabitBusiness, HabitBusinessService } from '../../../services/habit-business.service';
import { HabitIntervalService } from '../../../services/habit-interval.service';
import { AuthService } from '../../../services/auth.service';
import { HabitCardComponent } from '../../../shared/components/habit-card/habit-card.component';

export interface CheckinResult {
  earnings: number;
  streak: number;
}

interface WalkthroughStep {
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-first-checkin-step',
  templateUrl: './first-checkin-step.component.html',
  styleUrls: ['./first-checkin-step.component.scss', '../onboarding-step.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, HabitCardComponent],
})
export class FirstCheckinStepComponent implements OnInit {
  @Input({ required: true }) habit!: HabitBusiness;
  @Output() completed = new EventEmitter<CheckinResult>();

  result: CheckinResult | null = null;
  currentUserId: string | null = null;
  userCash = 0;

  walkthroughIndex = 0;
  readonly walkthroughSteps: WalkthroughStep[] = [
    {
      icon: 'checkmark-circle',
      label: 'Complete',
      description: 'Tap this once you\'ve actually done the habit. It pays out real Habit Cash right away — tap it again (now an undo arrow) if you tapped by mistake.'
    },
    {
      icon: 'chevron-up',
      label: 'Reorder',
      description: 'Use the up/down arrows in the top-left corner to move this habit within your To-Do or Done list on the Home screen.'
    },
    {
      icon: 'information-circle-outline',
      label: 'Description',
      description: 'Shows the notes you wrote for this habit when you created it.'
    },
    {
      icon: 'trash',
      label: 'Delete',
      description: 'Lists this business on the Marketplace so a friend can buy it — you\'re guaranteed cash for it either way, sooner if someone buys it.'
    },
    {
      icon: 'receipt-outline',
      label: 'Earnings',
      description: 'Shows exactly how much this habit pays per completion, broken down into base pay, streak bonus, and any stock boost from investors.'
    },
    {
      icon: 'calendar-outline',
      label: 'History',
      description: 'Opens your full year-long completion calendar and stock chart for this business.'
    },
    {
      icon: 'trending-up',
      label: 'Upgrade',
      description: 'Spend cash to upgrade to a better business type that pays more per completion.'
    },
    {
      icon: 'people',
      label: 'Stock Owners',
      description: 'Shows which friends own shares in this business — they earn a dividend every time you complete it.'
    },
    {
      icon: 'create',
      label: 'Edit',
      description: 'Change this habit\'s name, description, schedule, or completion goal at any time.'
    },
  ];

  private originalTotalEarnings = 0;

  constructor(
    private habitBusinessService: HabitBusinessService,
    private habitIntervalService: HabitIntervalService,
    private authService: AuthService,
  ) {
    addIcons({ checkmarkCircle, arrowUndo, chevronUp, chevronDown, trash, receiptOutline, calendarOutline, trendingUp, people, create, informationCircleOutline, arrowForward });
  }

  async ngOnInit() {
    this.originalTotalEarnings = this.habit.total_earnings;
    try {
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        this.currentUserId = user.id;
        const profile = await this.authService.getUserProfile(user.id);
        this.userCash = profile?.cash || 0;
      }
    } catch (error) {
      console.error('❌ FirstCheckinStepComponent: failed to load current user:', error);
    }
  }

  get currentWalkStep(): WalkthroughStep {
    return this.walkthroughSteps[this.walkthroughIndex];
  }

  get isLastWalkStep(): boolean {
    return this.walkthroughIndex === this.walkthroughSteps.length - 1;
  }

  goToWalkStep(index: number) {
    this.walkthroughIndex = Math.min(Math.max(index, 0), this.walkthroughSteps.length - 1);
  }

  nextWalkStep() {
    this.goToWalkStep(this.walkthroughIndex + 1);
  }

  /** The habit card completed/updated itself — refresh with the latest data so the card reflects it, and the deed is done. */
  async onCardChanged() {
    if (!this.currentUserId) return;
    try {
      const businesses = await this.habitBusinessService.getUserHabitBusinesses(this.currentUserId);
      const fresh = businesses.find(b => b.id === this.habit.id);
      if (!fresh) return;
      this.habit = fresh;

      if (!this.result && this.habitIntervalService.isHabitCompleteForCurrentPeriod(fresh)) {
        this.result = {
          earnings: fresh.total_earnings - this.originalTotalEarnings,
          streak: this.habitIntervalService.getEffectiveStreak(fresh)
        };
      }
    } catch (error) {
      console.error('❌ FirstCheckinStepComponent: failed to refresh habit after change:', error);
    }
  }

  finish() {
    if (this.result) {
      this.completed.emit(this.result);
    }
  }
}
