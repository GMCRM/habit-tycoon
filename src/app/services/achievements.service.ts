import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type MilestoneType = 'streak' | 'completions';

export interface MilestoneDefinition {
  key: string;
  type: MilestoneType;
  threshold: number;
  emoji: string;
  label: string;
  description: string;
}

export interface EarnedMilestone {
  habit_business_id: string;
  milestone_key: string;
}

// Kept in sync with the milestone thresholds defined in
// habit-milestone-achievements.sql (notify_friends_of_milestone).
export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    key: 'streak_7',
    type: 'streak',
    threshold: 7,
    emoji: '🔥',
    label: '7-Day Streak',
    description: 'Complete this habit 7 days in a row without missing one.',
  },
  {
    key: 'streak_30',
    type: 'streak',
    threshold: 30,
    emoji: '🏆',
    label: '30-Day Streak',
    description: 'Keep the streak alive for a full 30 days.',
  },
  {
    key: 'streak_100',
    type: 'streak',
    threshold: 100,
    emoji: '💎',
    label: '100-Day Streak',
    description: 'Reach a legendary 100-day streak on this habit.',
  },
  {
    key: 'completions_10',
    type: 'completions',
    threshold: 10,
    emoji: '⭐',
    label: '10 Completions',
    description: 'Complete this habit 10 times in total (streaks can break — total completions never do).',
  },
  {
    key: 'completions_50',
    type: 'completions',
    threshold: 50,
    emoji: '🌟',
    label: '50 Completions',
    description: 'Rack up 50 total completions on this habit.',
  },
  {
    key: 'completions_100',
    type: 'completions',
    threshold: 100,
    emoji: '🎯',
    label: '100 Completions',
    description: 'Hit 100 total completions — a true milestone of consistency.',
  },
];

export type GeneralAchievementCategory =
  | 'net_worth'
  | 'business'
  | 'stocks'
  | 'social'
  | 'completions'
  | 'perfect'
  | 'meta';

// What client-computed stat (if any) a definition's progress bar tracks.
// Achievements with no natural "progress towards a number" (e.g. first
// sale, got backers) omit metric/threshold and just show earned/locked.
export type GeneralAchievementMetric =
  | 'net_worth'
  | 'business_type_owned'
  | 'dividends_earned'
  | 'friend_count'
  | 'stocks_diversified'
  | 'global_completions'
  | 'legend_count';

export interface GeneralAchievementDefinition {
  key: string;
  category: GeneralAchievementCategory;
  emoji: string;
  label: string;
  description: string;
  metric?: GeneralAchievementMetric;
  threshold?: number;
  unit?: string;
  businessTypeId?: number;
}

export interface EarnedGeneralAchievement {
  achievement_key: string;
}

export interface GeneralAchievementStats {
  netWorth: number;
  dividendsEarned: number;
  friendCount: number;
  diversifiedStockCount: number;
  globalCompletions: number;
}

// Kept in sync with the achievement definitions in 022-general-achievements.sql
// (check_general_achievements). Business type ids/names/icons mirror
// business-types-seed.sql.
export const GENERAL_ACHIEVEMENT_DEFINITIONS: GeneralAchievementDefinition[] = [
  // Net worth
  { key: 'networth_10k', category: 'net_worth', emoji: '💵', label: 'Getting Started', description: 'Reach a net worth of $10,000.', metric: 'net_worth', threshold: 10000, unit: '$' },
  { key: 'networth_1m', category: 'net_worth', emoji: '🤑', label: 'Millionaire', description: 'Reach a net worth of $1,000,000.', metric: 'net_worth', threshold: 1000000, unit: '$' },
  { key: 'networth_1b', category: 'net_worth', emoji: '💰', label: 'Billionaire', description: 'Reach a net worth of $1,000,000,000.', metric: 'net_worth', threshold: 1000000000, unit: '$' },
  { key: 'networth_1t', category: 'net_worth', emoji: '👑', label: 'Trillionaire', description: 'Reach a net worth of $1,000,000,000,000.', metric: 'net_worth', threshold: 1000000000000, unit: '$' },

  // Business empire — one per business type
  { key: 'business_owned_1', category: 'business', emoji: '🍋', label: 'Lemonade Stand Owner', description: 'Own a Lemonade Stand.', businessTypeId: 1 },
  { key: 'business_owned_2', category: 'business', emoji: '📰', label: 'Newspaper Route Owner', description: 'Own a Newspaper Route.', businessTypeId: 2 },
  { key: 'business_owned_3', category: 'business', emoji: '🚗', label: 'Car Wash Owner', description: 'Own a Car Wash.', businessTypeId: 3 },
  { key: 'business_owned_4', category: 'business', emoji: '🍕', label: 'Pizza Delivery Owner', description: 'Own a Pizza Delivery business.', businessTypeId: 4 },
  { key: 'business_owned_5', category: 'business', emoji: '🍩', label: 'Donut Shop Owner', description: 'Own a Donut Shop.', businessTypeId: 5 },
  { key: 'business_owned_6', category: 'business', emoji: '🦐', label: 'Shrimp Boat Owner', description: 'Own a Shrimp Boat.', businessTypeId: 6 },
  { key: 'business_owned_7', category: 'business', emoji: '🏒', label: 'Hockey Team Owner', description: 'Own a Hockey Team.', businessTypeId: 7 },
  { key: 'business_owned_8', category: 'business', emoji: '🎬', label: 'Movie Studio Owner', description: 'Own a Movie Studio.', businessTypeId: 8 },
  { key: 'business_owned_9', category: 'business', emoji: '🏦', label: 'Bank Owner', description: 'Own a Bank.', businessTypeId: 9 },
  { key: 'business_owned_10', category: 'business', emoji: '🛢️', label: 'Oil Baron', description: 'Own an Oil Company.', businessTypeId: 10 },
  { key: 'business_full_portfolio', category: 'business', emoji: '🏙️', label: 'Full Portfolio', description: 'Own all 10 business types at once.' },
  { key: 'business_first_upgrade', category: 'business', emoji: '⬆️', label: 'First Upgrade', description: 'Upgrade a habit-business to a pricier type for the first time.' },
  { key: 'business_first_sale', category: 'business', emoji: '💸', label: 'Cashing Out', description: 'Sell one of your own businesses for the first time.' },

  // Stocks & dividends
  { key: 'dividends_10', category: 'stocks', emoji: '🪙', label: 'First Dividends', description: 'Earn $10 in cumulative dividends.', metric: 'dividends_earned', threshold: 10, unit: '$' },
  { key: 'dividends_100', category: 'stocks', emoji: '💵', label: 'Dividend Earner', description: 'Earn $100 in cumulative dividends.', metric: 'dividends_earned', threshold: 100, unit: '$' },
  { key: 'dividends_1000', category: 'stocks', emoji: '💰', label: 'Dividend Investor', description: 'Earn $1,000 in cumulative dividends.', metric: 'dividends_earned', threshold: 1000, unit: '$' },
  { key: 'dividends_10000', category: 'stocks', emoji: '🏦', label: 'Dividend Tycoon', description: 'Earn $10,000 in cumulative dividends.', metric: 'dividends_earned', threshold: 10000, unit: '$' },
  { key: 'stocks_first_investment', category: 'stocks', emoji: '📈', label: 'First Investment', description: 'Buy stock in a business for the first time.' },
  { key: 'stocks_diversified', category: 'stocks', emoji: '📊', label: 'Diversified', description: 'Hold stock in 3 or more different businesses.', metric: 'stocks_diversified', threshold: 3, unit: 'businesses' },
  { key: 'stocks_got_backers', category: 'stocks', emoji: '🤝', label: 'Got Backers', description: 'Have another user buy stock in one of your businesses.' },

  // Social
  { key: 'social_first_friend', category: 'social', emoji: '🧑‍🤝‍🧑', label: 'First Friend', description: 'Make your first friend.', metric: 'friend_count', threshold: 1, unit: 'friends' },
  { key: 'social_butterfly', category: 'social', emoji: '🦋', label: 'Social Butterfly', description: 'Make 5 friends.', metric: 'friend_count', threshold: 5, unit: 'friends' },
  { key: 'social_first_poke', category: 'social', emoji: '👋', label: 'Friendly Reminder', description: 'Send a friend a reminder for the first time.' },

  // Global habit completions
  { key: 'completions_global_1', category: 'completions', emoji: '✅', label: 'First Completion', description: 'Complete a habit for the first time.', metric: 'global_completions', threshold: 1, unit: 'done' },
  { key: 'completions_global_50', category: 'completions', emoji: '⭐', label: '50 Completions', description: 'Complete habits 50 times in total, across all your businesses.', metric: 'global_completions', threshold: 50, unit: 'done' },
  { key: 'completions_global_100', category: 'completions', emoji: '🌟', label: '100 Completions', description: 'Complete habits 100 times in total, across all your businesses.', metric: 'global_completions', threshold: 100, unit: 'done' },
  { key: 'completions_global_1000', category: 'completions', emoji: '🎖️', label: '1,000 Completions', description: 'Complete habits 1,000 times in total, across all your businesses.', metric: 'global_completions', threshold: 1000, unit: 'done' },

  // Perfect periods (whole-account)
  { key: 'perfect_week', category: 'perfect', emoji: '🗓️', label: 'Perfect Week', description: 'Complete every one of your active habits every day for a full week.' },
  { key: 'perfect_month', category: 'perfect', emoji: '📆', label: 'Perfect Month', description: 'Complete every one of your active habits every day for a full month.' },

  // Meta
  { key: 'meta_completionist', category: 'meta', emoji: '🧩', label: 'Completionist', description: 'Earn all 6 milestone badges on a single habit.' },
  { key: 'meta_legend', category: 'meta', emoji: '🏅', label: 'Legend', description: 'Earn every other general achievement.', metric: 'legend_count' },
];

@Injectable({
  providedIn: 'root',
})
export class AchievementsService {
  private supabaseService = inject(SupabaseService);
  private get supabase() {
    return this.supabaseService.client;
  }

  /**
   * Every milestone the user has ever earned, across all habits.
   * Once earned, a milestone stays earned even if the habit's streak
   * later resets — see habit-milestone-achievements.sql for why.
   */
  async getEarnedMilestones(userId: string): Promise<EarnedMilestone[]> {
    const { data, error } = await this.supabase
      .from('habit_milestone_achievements')
      .select('habit_business_id, milestone_key')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching earned milestones:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Every general (account-wide) achievement the user has ever earned.
   * See check_general_achievements() in 022-general-achievements.sql.
   */
  async getEarnedGeneralAchievements(userId: string): Promise<EarnedGeneralAchievement[]> {
    const { data, error } = await this.supabase
      .from('general_achievements')
      .select('achievement_key')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching earned general achievements:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Client-side stats used purely to render progress bars for ladder-style
   * general achievements. Not authoritative — actual awarding happens
   * server-side in check_general_achievements() (022-general-achievements.sql).
   */
  async getGeneralAchievementStats(userId: string): Promise<GeneralAchievementStats> {
    const [profileResult, dividendsResult, outgoingFriends, incomingFriends, stockHoldings, completionsResult] =
      await Promise.all([
        this.supabase.from('user_profiles').select('net_worth').eq('id', userId).single(),
        this.supabase.from('stock_holdings').select('total_dividends_earned').eq('holder_id', userId),
        this.supabase.from('friendships').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'accepted'),
        this.supabase.from('friendships').select('id', { count: 'exact', head: true }).eq('friend_id', userId).eq('status', 'accepted'),
        this.supabase.from('stock_holdings').select('stock_id').eq('holder_id', userId).gt('shares_owned', 0),
        this.supabase.from('habit_completions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

    const dividendsEarned = (dividendsResult.data || []).reduce(
      (sum: number, row: any) => sum + (row.total_dividends_earned || 0),
      0
    );
    const diversifiedStockCount = new Set((stockHoldings.data || []).map((row: any) => row.stock_id)).size;

    return {
      netWorth: profileResult.data?.net_worth || 0,
      dividendsEarned,
      friendCount: (outgoingFriends.count || 0) + (incomingFriends.count || 0),
      diversifiedStockCount,
      globalCompletions: completionsResult.count || 0,
    };
  }
}
