import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { WeeklyReceiptService, WeeklyReceipt, ReceiptDay } from '../services/weekly-receipt.service';
import { HabitBusinessService, HabitBusiness } from '../services/habit-business.service';
import { AchievementsService, MILESTONE_DEFINITIONS, MilestoneDefinition } from '../services/achievements.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  chevronBack,
  chevronForward,
  receiptOutline,
  trophyOutline,
  trendingUpOutline,
  trendingDownOutline,
  walletOutline,
  alertCircleOutline,
  documentTextOutline,
  close,
  lockClosedOutline,
  chevronDown,
  chevronUp,
} from 'ionicons/icons';

interface HabitMilestoneState extends MilestoneDefinition {
  earned: boolean;
  progressCurrent: number;
}

interface HabitAchievements {
  habit: HabitBusiness;
  milestones: HabitMilestoneState[];
  earnedCount: number;
}

@Component({
  selector: 'app-weekly-receipt',
  templateUrl: './weekly-receipt.page.html',
  styleUrls: ['./weekly-receipt.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonSpinner,
    IonModal,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class WeeklyReceiptPage implements OnInit {
  loading = true;
  error: string | null = null;
  receipt: WeeklyReceipt | null = null;
  weekStart!: Date;
  isCurrentWeek = false;
  showSummaryModal = false;

  activeTab: 'receipt' | 'achievements' = 'receipt';

  milestoneDefinitions = MILESTONE_DEFINITIONS;
  achievementsLoading = true;
  achievementsError: string | null = null;
  habitAchievements: HabitAchievements[] = [];
  totalEarnedMilestones = 0;
  totalPossibleMilestones = 0;
  legendExpanded = false;

  constructor(
    private receiptService: WeeklyReceiptService,
    private habitBusinessService: HabitBusinessService,
    private achievementsService: AchievementsService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      arrowBack,
      chevronBack,
      chevronForward,
      receiptOutline,
      trophyOutline,
      trendingUpOutline,
      trendingDownOutline,
      walletOutline,
      alertCircleOutline,
      documentTextOutline,
      close,
      lockClosedOutline,
      chevronDown,
      chevronUp,
    });
  }

  async ngOnInit() {
    this.weekStart = this.receiptService.getWeekStart();
    await this.loadWeek();
  }

  onTabChange(event: any) {
    this.activeTab = event.detail.value;
    if (this.activeTab === 'achievements' && this.habitAchievements.length === 0 && !this.achievementsError) {
      this.loadAchievements();
    }
  }

  async loadAchievements() {
    this.achievementsLoading = true;
    this.achievementsError = null;
    try {
      const {
        data: { user },
      } = await this.authService.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const [habits, earned] = await Promise.all([
        this.habitBusinessService.getUserHabitBusinesses(user.id),
        this.achievementsService.getEarnedMilestones(user.id),
      ]);

      const earnedKeysByHabit = new Map<string, Set<string>>();
      for (const e of earned) {
        if (!earnedKeysByHabit.has(e.habit_business_id)) {
          earnedKeysByHabit.set(e.habit_business_id, new Set());
        }
        earnedKeysByHabit.get(e.habit_business_id)!.add(e.milestone_key);
      }

      this.habitAchievements = habits.map((habit) => {
        const earnedKeys = earnedKeysByHabit.get(habit.id) || new Set<string>();
        const milestones: HabitMilestoneState[] = this.milestoneDefinitions.map((def) => ({
          ...def,
          earned: earnedKeys.has(def.key),
          progressCurrent: def.type === 'streak' ? habit.longest_streak ?? habit.streak : habit.total_completions,
        }));
        return {
          habit,
          milestones,
          earnedCount: milestones.filter((m) => m.earned).length,
        };
      });

      this.totalEarnedMilestones = this.habitAchievements.reduce((sum, h) => sum + h.earnedCount, 0);
      this.totalPossibleMilestones = this.habitAchievements.length * this.milestoneDefinitions.length;
    } catch (e) {
      console.error('Failed to load achievements', e);
      this.achievementsError = 'Could not load your achievements. Please try again.';
    } finally {
      this.achievementsLoading = false;
    }
  }

  milestoneProgressLabel(milestone: HabitMilestoneState): string {
    const current = Math.min(milestone.progressCurrent, milestone.threshold);
    const unit = milestone.type === 'streak' ? 'days' : 'done';
    return `${current}/${milestone.threshold} ${unit}`;
  }

  milestoneProgressPercent(milestone: HabitMilestoneState): number {
    if (milestone.earned) return 100;
    return Math.max(0, Math.min(100, (milestone.progressCurrent / milestone.threshold) * 100));
  }

  toggleLegend() {
    this.legendExpanded = !this.legendExpanded;
  }

  async loadWeek() {
    this.loading = true;
    this.error = null;
    try {
      this.receipt = await this.receiptService.getWeeklyReceipt(this.weekStart);
      const currentWeekStart = this.receiptService.getWeekStart();
      this.isCurrentWeek = this.weekStart.getTime() === currentWeekStart.getTime();
    } catch (e) {
      console.error('Failed to load weekly receipt', e);
      this.error = 'Could not load your receipt. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async previousWeek() {
    this.weekStart = this.receiptService.addWeeks(this.weekStart, -1);
    await this.loadWeek();
  }

  async nextWeek() {
    if (this.isCurrentWeek) return;
    this.weekStart = this.receiptService.addWeeks(this.weekStart, 1);
    await this.loadWeek();
  }

  get weekRangeLabel(): string {
    if (!this.receipt) return '';
    const end = new Date(this.receipt.weekEnd);
    end.setDate(end.getDate() - 1); // display inclusive Sunday, not exclusive next Monday
    const startLabel = this.receipt.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }

  hasAnyItems(day: ReceiptDay): boolean {
    return day.items.length > 0;
  }

  timeLabel(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  amountLabel(amount: number): string {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${this.formatMoney(Math.abs(amount))}`;
  }

  formatMoney(amount: number): string {
    return (amount === 0 ? 0 : amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
