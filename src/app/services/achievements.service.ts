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
}
