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
import {
  AchievementsService,
  MILESTONE_DEFINITIONS,
  MilestoneDefinition,
  GENERAL_ACHIEVEMENT_DEFINITIONS,
  GeneralAchievementDefinition,
  GeneralAchievementCategory,
} from '../services/achievements.service';
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

interface GeneralAchievementState extends GeneralAchievementDefinition {
  earned: boolean;
  progressCurrent?: number;
}

interface GeneralAchievementCategoryGroup {
  category: GeneralAchievementCategory;
  label: string;
  icon: string;
  achievements: GeneralAchievementState[];
  earnedCount: number;
}

const GENERAL_CATEGORY_META: Record<GeneralAchievementCategory, { label: string; icon: string }> = {
  net_worth: { label: 'Net Worth', icon: '💵' },
  business: { label: 'Business Empire', icon: '🏢' },
  stocks: { label: 'Stocks & Dividends', icon: '📈' },
  social: { label: 'Social', icon: '🤝' },
  completions: { label: 'Habit Completions', icon: '✅' },
  perfect: { label: 'Perfect Streaks', icon: '🗓️' },
  meta: { label: 'Meta', icon: '🏅' },
};

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

  achievementsSubTab: 'habits' | 'general' = 'habits';
  generalAchievementsLoading = true;
  generalAchievementsError: string | null = null;
  generalAchievementCategories: GeneralAchievementCategoryGroup[] = [];
  totalEarnedGeneral = 0;
  totalPossibleGeneral = 0;
  generalLegendExpanded = false;

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

  onAchievementsSubTabChange(event: any) {
    this.achievementsSubTab = event.detail.value;
    if (this.achievementsSubTab === 'general' && this.generalAchievementCategories.length === 0 && !this.generalAchievementsError) {
      this.loadGeneralAchievements();
    }
  }

  async loadGeneralAchievements() {
    this.generalAchievementsLoading = true;
    this.generalAchievementsError = null;
    try {
      const {
        data: { user },
      } = await this.authService.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const [earned, stats] = await Promise.all([
        this.achievementsService.getEarnedGeneralAchievements(user.id),
        this.achievementsService.getGeneralAchievementStats(user.id),
      ]);

      const earnedKeys = new Set(earned.map((e) => e.achievement_key));
      let runningEarnedCount = 0;

      const states: GeneralAchievementState[] = GENERAL_ACHIEVEMENT_DEFINITIONS.map((def) => {
        const isEarned = earnedKeys.has(def.key);
        if (isEarned && def.key !== 'meta_legend') {
          runningEarnedCount++;
        }

        let progressCurrent: number | undefined;
        switch (def.metric) {
          case 'net_worth':
            progressCurrent = stats.netWorth;
            break;
          case 'dividends_earned':
            progressCurrent = stats.dividendsEarned;
            break;
          case 'friend_count':
            progressCurrent = stats.friendCount;
            break;
          case 'stocks_diversified':
            progressCurrent = stats.diversifiedStockCount;
            break;
          case 'global_completions':
            progressCurrent = stats.globalCompletions;
            break;
          case 'legend_count':
            progressCurrent = runningEarnedCount;
            break;
        }

        return { ...def, earned: isEarned, progressCurrent };
      });

      const grouped = new Map<GeneralAchievementCategory, GeneralAchievementState[]>();
      for (const state of states) {
        if (!grouped.has(state.category)) {
          grouped.set(state.category, []);
        }
        grouped.get(state.category)!.push(state);
      }

      this.generalAchievementCategories = Array.from(grouped.entries()).map(([category, achievements]) => ({
        category,
        label: GENERAL_CATEGORY_META[category].label,
        icon: GENERAL_CATEGORY_META[category].icon,
        achievements,
        earnedCount: achievements.filter((a) => a.earned).length,
      }));

      this.totalEarnedGeneral = states.filter((s) => s.earned).length;
      this.totalPossibleGeneral = states.length;
    } catch (e) {
      console.error('Failed to load general achievements', e);
      this.generalAchievementsError = 'Could not load your achievements. Please try again.';
    } finally {
      this.generalAchievementsLoading = false;
    }
  }

  generalProgressPercent(a: GeneralAchievementState): number {
    if (a.earned) return 100;
    if (a.threshold === undefined || a.progressCurrent === undefined) return 0;
    return Math.max(0, Math.min(100, (a.progressCurrent / a.threshold) * 100));
  }

  generalProgressLabel(a: GeneralAchievementState): string {
    if (a.metric === 'legend_count') {
      const total = GENERAL_ACHIEVEMENT_DEFINITIONS.length - 1;
      return `${Math.min(a.progressCurrent ?? 0, total)}/${total}`;
    }
    if (a.threshold === undefined || a.progressCurrent === undefined) return '';
    const current = Math.min(a.progressCurrent, a.threshold);
    if (a.unit === '$') {
      return `${this.formatCompactNumber(current)}/${this.formatCompactNumber(a.threshold)}`;
    }
    return `${this.formatCompactNumber(current)}/${this.formatCompactNumber(a.threshold)}${a.unit ? ' ' + a.unit : ''}`;
  }

  formatCompactNumber(amount: number): string {
    if (amount >= 1000000000000) {
      const trillions = amount / 1000000000000;
      return `${trillions >= 10 ? Math.floor(trillions) : trillions.toFixed(1)}T`;
    } else if (amount >= 1000000000) {
      const billions = amount / 1000000000;
      return `${billions >= 10 ? Math.floor(billions) : billions.toFixed(1)}B`;
    } else if (amount >= 1000000) {
      const millions = amount / 1000000;
      return `${millions >= 10 ? Math.floor(millions) : millions.toFixed(1)}M`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      return `${thousands >= 10 ? Math.floor(thousands) : thousands.toFixed(1)}K`;
    }
    return `${Math.floor(amount)}`;
  }

  toggleGeneralLegend() {
    this.generalLegendExpanded = !this.generalLegendExpanded;
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
