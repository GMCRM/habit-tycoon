import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface BusinessType {
  id: number;
  name: string;
  icon: string;
  base_cost: number;
  base_pay: number;
  description: string;
}

export interface HabitBusiness {
  id: string;
  user_id: string;
  business_type_id: number;
  business_name: string;
  business_icon: string;
  cost: number;
  habit_description: string;
  frequency: 'daily' | 'weekly';
  goal_value: number; // How many times per frequency period (e.g., 10/day, 3/week)
  current_progress: number; // Current completions for today/this week
  earnings_per_completion: number;
  streak: number;
  total_completions: number;
  total_earnings: number;
  last_completed_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  business_types?: BusinessType;
}

export interface CreateHabitBusinessRequest {
  business_type_id: number;
  business_name: string;
  habit_description: string;
  frequency: 'daily' | 'weekly';
  goal_value: number;
}

export interface BusinessStock {
  id: string;
  habit_business_id: string;
  business_owner_id: string;
  current_stock_price: number;
  total_shares_issued: number;
  shares_owned_by_owner: number;
  shares_available: number;
  price_multiplier: number;
  last_price_update: string;
  created_at: string;
  updated_at: string;
  habit_businesses?: {
    id: string;
    business_name: string;
    business_icon: string;
    streak: number;
    user_id: string;
    business_types?: {
      name: string;
      icon: string;
    };
  };
}

export interface StockHolding {
  id: string;
  holder_id: string;
  stock_id: string;
  shares_owned: number;
  average_purchase_price: number;
  total_invested: number;
  total_dividends_earned: number;
  business_stocks?: {
    id: string;
    current_stock_price: number;
    habit_businesses?: {
      id: string;
      business_name: string;
      business_icon: string;
      streak: number;
      business_types?: {
        name: string;
        icon: string;
      };
    };
  };
}

export interface BusinessUpgrade {
  id: string;
  user_id: string;
  old_habit_business_id: string;
  new_habit_business_id: string;
  old_business_type_id: number;
  new_business_type_id: number;
  streak_value_sold: number;
  upgrade_cost: number;
  profit_from_upgrade: number;
  old_streak_count: number;
  created_at: string;
}

export interface UpgradeCalculation {
  currentBusinessValue: number;
  streakMultiplier: number;
  totalStreakValue: number;
  availableUpgrades: BusinessType[];
  upgradeOptions: Array<{
    businessType: BusinessType;
    upgradeCost: number;
    profitFromUpgrade: number;
    canAfford: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class HabitBusinessService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * Get all available business types
   */
  async getBusinessTypes(): Promise<BusinessType[]> {
    try {
      const { data, error } = await this.supabase
        .from('business_types')
        .select('*')
        .order('base_cost', { ascending: true });

      if (error) {
        console.error('Error fetching business types:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBusinessTypes:', error);
      throw error;
    }
  }

  /**
   * Get user's habit-businesses
   */
  async getUserHabitBusinesses(userId: string): Promise<HabitBusiness[]> {
    try {
      const { data, error } = await this.supabase
        .from('habit_businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching habit businesses:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserHabitBusinesses:', error);
      throw error;
    }
  }

  /**
   * Create a new habit-business
   */
  async createHabitBusiness(request: CreateHabitBusinessRequest): Promise<HabitBusiness> {
    try {
      // First, get the business type to determine cost and earnings
      const { data: businessType, error: businessTypeError } = await this.supabase
        .from('business_types')
        .select('*')
        .eq('id', request.business_type_id)
        .single();

      if (businessTypeError || !businessType) {
        throw new Error('Invalid business type');
      }

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if user has enough cash
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      if (profile.cash < businessType.base_cost) {
        throw new Error(`Insufficient funds. Need $${businessType.base_cost}, but you only have $${profile.cash}`);
      }

      // Validate goal_value
      if (request.goal_value < 1 || request.goal_value > 99) {
        throw new Error('Goal value must be between 1 and 99');
      }

      // Create the habit-business
      const habitBusinessData = {
        user_id: user.id,
        business_type_id: request.business_type_id,
        business_name: request.business_name,
        business_icon: businessType.icon,
        cost: businessType.base_cost,
        habit_description: request.habit_description,
        frequency: request.frequency,
        goal_value: request.goal_value,
        current_progress: 0,
        earnings_per_completion: this.calculateReasonableEarnings(businessType.base_pay, request.goal_value), // Use reasonable earnings calculation
        streak: 0,
        total_completions: 0,
        total_earnings: 0,
        is_active: true
      };

      const { data: newHabitBusiness, error: createError } = await this.supabase
        .from('habit_businesses')
        .insert(habitBusinessData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating habit business:', createError);
        throw createError;
      }

      // Deduct cost from user's cash
      const newCash = profile.cash - businessType.base_cost;
      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        console.error('Error updating user cash:', updateCashError);
        // Note: The habit-business was created but cash wasn't deducted
        // In a production app, you'd want to use a database transaction
        throw new Error('Habit-business created but failed to deduct payment');
      }

      // Create business stock for this habit business
      try {
        await this.createBusinessStock(newHabitBusiness.id);
        console.log('✅ Business stock created for new habit business');
      } catch (stockError) {
        console.error('⚠️ Warning: Failed to create business stock:', stockError);
        // Don't fail the entire creation for this - stock can be created later
      }

      return newHabitBusiness;
    } catch (error) {
      console.error('Error in createHabitBusiness:', error);
      throw error;
    }
  }

  /**
   * Upgrade an existing habit-business to a new business type
   */
  async upgradeHabitBusiness(habitBusinessId: string, newBusinessTypeId: number, upgradeCost: number): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the new business type details
      const { data: newBusinessType, error: businessTypeError } = await this.supabase
        .from('business_types')
        .select('*')
        .eq('id', newBusinessTypeId)
        .single();

      if (businessTypeError || !newBusinessType) {
        throw new Error('Invalid new business type');
      }

      // Check if user has enough cash for the upgrade
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      if (profile.cash < upgradeCost) {
        throw new Error(`Insufficient funds. Need $${upgradeCost}, but you only have $${profile.cash}`);
      }

      // Update the habit-business with new business type details
      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update({
          business_type_id: newBusinessTypeId,
          business_icon: newBusinessType.icon,
          cost: newBusinessType.base_cost,
          earnings_per_completion: this.calculateReasonableEarnings(newBusinessType.base_pay, 1), // Use reasonable earnings calculation
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId)
        .eq('user_id', user.id); // Ensure user owns this business

      if (updateError) {
        console.error('Error updating habit business:', updateError);
        throw updateError;
      }

      // Deduct upgrade cost from user's cash
      const newCash = profile.cash - upgradeCost;
      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        console.error('Error updating user cash after upgrade:', updateCashError);
        // Note: The business was upgraded but cash wasn't deducted
        // In a production app, you'd want to use a database transaction
        throw new Error('Business upgraded but failed to deduct payment');
      }

      console.log('✅ Successfully upgraded habit business');
    } catch (error) {
      console.error('Error in upgradeHabitBusiness:', error);
      throw error;
    }
  }

  /**
   * Update an existing habit-business
   */
  async updateHabitBusiness(habitBusinessId: string, updates: {
    business_name?: string;
    habit_description?: string;
    frequency?: 'daily' | 'weekly';
    goal_value?: number;
  }): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify the habit business belongs to the user
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .single();

      if (habitError || !habitBusiness) {
        throw new Error('Habit-business not found or you do not have permission to edit it');
      }

      // Validate goal_value if provided
      if (updates.goal_value !== undefined) {
        if (updates.goal_value < 1 || updates.goal_value > 99) {
          throw new Error('Goal value must be between 1 and 99');
        }
      }

      // Update the habit-business
      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId);

      if (updateError) {
        console.error('Error updating habit business:', updateError);
        throw updateError;
      }

    } catch (error) {
      console.error('Error in updateHabitBusiness:', error);
      throw error;
    }
  }

  /**
   * Delete (sell) a habit-business with loss penalty to prevent exploitation
   */
  async deleteHabitBusiness(habitBusinessId: string): Promise<number> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the habit-business details with business type
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select(`
          *,
          business_types (
            base_cost
          )
        `)
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (habitError || !habitBusiness) {
        throw new Error('Habit-business not found or you do not have permission to delete it');
      }

      // Check how many active habit businesses the user has
      const { data: userHabits, error: countError } = await this.supabase
        .from('habit_businesses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (countError) {
        throw new Error('Could not verify your habit businesses');
      }

      if (!userHabits || userHabits.length <= 1) {
        throw new Error('Cannot delete your only habit business! You must have at least one active business.');
      }

      // Calculate sell value (70% of original cost to prevent exploitation)
      const originalCost = habitBusiness.cost || habitBusiness.business_types?.base_cost || 1;
      const sellValue = Math.floor(originalCost * 0.7);

      // Deactivate the habit-business (soft delete to preserve history)
      // Note: Database trigger will automatically refund all stockholders at current stock price
      const { error: deleteError } = await this.supabase
        .from('habit_businesses')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId);

      if (deleteError) {
        console.error('Error deleting habit business:', deleteError);
        throw deleteError;
      }

      // Add sell value to user's cash
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      const newCash = profile.cash + sellValue;

      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        console.error('Error updating user cash after sale:', updateCashError);
        throw new Error('Habit business deleted but failed to add sale proceeds');
      }

      return sellValue;
    } catch (error) {
      console.error('Error in deleteHabitBusiness:', error);
      throw error;
    }
  }

  /**
   * Complete a habit and earn money
   */
  /**
   * Get today's date in local timezone as YYYY-MM-DD string
   */
  /**
   * Get date as YYYY-MM-DD string in user's local timezone
   * This ensures consistent date representation regardless of timezone differences
   */
  private getLocalDateString(date: Date = new Date()): string {
    // Use local timezone to get consistent YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Validate that the current date is not in the future relative to UTC
   * Prevents completing habits for future dates due to timezone differences
   */
  private validateNotFutureDate(): void {
    const now = new Date();
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const localToday = this.getLocalDateString(now);
    const utcToday = this.getLocalDateString(utcNow);
    
    // If local date is ahead of UTC date, we might be in a future timezone
    if (localToday > utcToday) {
      console.warn('⚠️ Local date appears to be ahead of UTC. Local:', localToday, 'UTC:', utcToday);
      // Allow completion if the difference is just one day (timezone difference)
      const localDate = new Date(localToday + 'T00:00:00');
      const utcDate = new Date(utcToday + 'T00:00:00');
      const daysDiff = Math.floor((localDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        throw new Error('Cannot complete habits for future dates. Please check your device date/time settings.');
      }
    }
  }

  async completeHabit(habitBusinessId: string): Promise<void> {
    try {
      // Validate that we're not trying to complete a habit for a future date
      this.validateNotFutureDate();
      
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the habit-business details
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .single();

      if (habitError || !habitBusiness) {
        throw new Error('Habit-business not found');
      }

      // Handle goal-based completion system
      const today = this.getLocalDateString();
      const lastCompleted = habitBusiness.last_completed_at ? 
        this.getLocalDateString(new Date(habitBusiness.last_completed_at)) : null;
      
      let currentProgress = habitBusiness.current_progress || 0;
      
      // Debug info for multi-completion habits
      if ((habitBusiness.goal_value || 1) > 1) {
        console.log(`🔍 Multi-completion check: ${habitBusiness.business_name} (${currentProgress}/${habitBusiness.goal_value || 1})`);
      }
      
      // Reset progress if it's a new day/week
      if (habitBusiness.frequency === 'daily' && lastCompleted !== today) {
        currentProgress = 0;
      } else if (habitBusiness.frequency === 'weekly') {
        // For weekly habits, reset if it's a new week (Monday to Sunday)
        if (lastCompleted) {
          const now = new Date();
          const lastDate = new Date(habitBusiness.last_completed_at!);
          
          // Calculate the start of this week (Monday)
          const startOfThisWeek = new Date(now);
          const dayOfWeek = startOfThisWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
          startOfThisWeek.setDate(startOfThisWeek.getDate() - daysUntilMonday);
          startOfThisWeek.setHours(0, 0, 0, 0);
          
          // Calculate the start of the completion week
          const startOfCompletionWeek = new Date(lastDate);
          const completionDayOfWeek = startOfCompletionWeek.getDay();
          const completionDaysUntilMonday = completionDayOfWeek === 0 ? 6 : completionDayOfWeek - 1;
          startOfCompletionWeek.setDate(startOfCompletionWeek.getDate() - completionDaysUntilMonday);
          startOfCompletionWeek.setHours(0, 0, 0, 0);
          
          // If the completion was in a different week, reset progress
          if (startOfThisWeek.getTime() !== startOfCompletionWeek.getTime()) {
            currentProgress = 0;
          }
        }
      }
      
      // Check if goal is already completed for this period
      const goalValue = habitBusiness.goal_value || 1;
      
      if (currentProgress >= goalValue) {
        throw new Error(`Goal already completed! You've done ${currentProgress}/${goalValue} for today.`);
      }

      // Double-check: prevent duplicate completions for the same day using proper date comparison
      const todayDateString = this.getLocalDateString(); // Get today as YYYY-MM-DD string
      
      const { data: existingCompletions, error: checkError } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id);
      
      if (checkError) {
        console.error('Error checking existing completions:', checkError);
      } else if (existingCompletions && existingCompletions.length > 0) {
        // Check if any completion was recorded for today (using date string comparison)
        const todayCompletions = existingCompletions.filter(completion => {
          const completionDate = this.getLocalDateString(new Date(completion.completed_at));
          return completionDate === todayDateString;
        });
        
        console.log(`📅 Found ${todayCompletions.length} existing completions for today (${todayDateString}):`, 
          todayCompletions.map(c => ({ id: c.id, date: c.completed_at })));
        
        if (todayCompletions.length >= goalValue) {
          throw new Error(`Already completed ${todayCompletions.length}/${goalValue} times today. Cannot complete again.`);
        }
      }

      // Increment progress
      currentProgress += 1;
      
      // Calculate streak only when the full goal is completed
      const now = new Date();
      let newStreak = habitBusiness.streak;
      const isGoalCompleted = currentProgress >= goalValue;
      
      if (isGoalCompleted) {
        if (habitBusiness.last_completed_at) {
          const lastCompleted = new Date(habitBusiness.last_completed_at);
          const timeDiff = now.getTime() - lastCompleted.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
          
          if (habitBusiness.frequency === 'daily' && daysDiff === 1) {
            newStreak += 1; // Consecutive day
          } else if (habitBusiness.frequency === 'weekly' && daysDiff >= 7 && daysDiff < 14) {
            newStreak += 1; // Consecutive week
          } else if (daysDiff > (habitBusiness.frequency === 'daily' ? 1 : 7)) {
            newStreak = 1; // Streak broken, start over
          } else {
            newStreak += 1; // First completion or continuing streak
          }
        } else {
          newStreak = 1; // First completion
        }
      }

      // Calculate earnings with streak multiplier + stock boost
      // Apply streak bonus only if the full goal is completed
      const streakMultiplier = isGoalCompleted && newStreak > 1 ? (newStreak - 1) * 0.1 : 0;
      const baseEarnings = habitBusiness.earnings_per_completion; // This is already divided by goal_value
      const bonusAmount = baseEarnings * streakMultiplier;
      const baseTotal = baseEarnings + bonusAmount;

      // Calculate stock boost from investors (only apply if goal is completed)
      let stockBoost = 0;
      let stockId: string | null = null;
      if (isGoalCompleted) {
        const { data: stockData, error: stockError } = await this.supabase
          .from('business_stocks')
          .select(`
            id,
            shares_owned_by_owner,
            total_shares_issued,
            stock_holdings (
              shares_owned,
              holder_id
            )
          `)
          .eq('habit_business_id', habitBusinessId)
          .single();

        if (!stockError && stockData) {
          stockId = stockData.id;
          // Calculate stock boost: 5% bonus per 10% of shares owned by others
          const sharesOwnedByOthers = stockData.total_shares_issued - stockData.shares_owned_by_owner;
          const otherOwnershipPercentage = (sharesOwnedByOthers / stockData.total_shares_issued) * 100;
          const stockBoostPercentage = Math.floor(otherOwnershipPercentage / 10) * 5; // 5% per 10% owned
          stockBoost = baseTotal * (stockBoostPercentage / 100);
        }
      }

      const totalEarnings = baseTotal + stockBoost;

      // CRITICAL FIX: Ensure completion is recorded for "today" in local timezone
      // This prevents habits from being marked as completed "tomorrow" due to UTC conversion
      const currentTime = new Date();
      const localDateString = this.getLocalDateString(currentTime); // Get today as YYYY-MM-DD in local timezone
      
      // Create a completion timestamp that represents local noon today
      // This ensures consistent date interpretation regardless of timezone
      const completionTime = new Date(`${localDateString}T12:00:00`);
      
      console.log('🕐 Recording completion for:', {
        localDate: localDateString,
        originalTime: currentTime.toString(),
        completionTime: completionTime.toString(),
        completionTimestamp: completionTime.toISOString()
      });

      // Record the completion with actual timestamp
      const { data: completionData, error: completionError } = await this.supabase
        .from('habit_completions')
        .insert({
          habit_business_id: habitBusinessId,
          user_id: user.id,
          earnings: totalEarnings,
          streak_count: newStreak,
          completed_at: completionTime.toISOString() // Use actual completion time
        })
        .select()
        .single();

      if (completionError) {
        throw completionError;
      }

      // Process dividend payments for stockholders
      if (isGoalCompleted) {
        try {
          console.log('💰 Processing dividends for completed habit:', habitBusinessId);
          
          // Check if there are stockholders first
          const { data: stockInfo, error: stockError } = await this.supabase
            .from('business_stocks')
            .select('id, total_shares_issued, shares_owned_by_owner, current_stock_price')
            .eq('habit_business_id', habitBusinessId)
            .single();
            
          if (stockError) {
            console.warn('⚠️ No stock info found for business:', stockError.message);
          } else if (stockInfo) {
            const investorShares = stockInfo.total_shares_issued - stockInfo.shares_owned_by_owner;
            console.log(`📊 Stock info: total_shares=${stockInfo.total_shares_issued}, owner_shares=${stockInfo.shares_owned_by_owner}, investor_shares=${investorShares}, stock_price=$${stockInfo.current_stock_price}`);
            
            if (investorShares > 0) {
              // Try RPC function first
              try {
                const { error: rpcError } = await this.supabase.rpc('process_habit_completion_dividends', { 
                  completion_uuid: completionData.id 
                });
                
                if (rpcError) {
                  console.warn('⚠️ RPC function failed:', rpcError.message);
                  throw rpcError;
                } else {
                  console.log('✅ Dividend payments processed via RPC for habit completion');
                }
              } catch (rpcFailure) {
                console.log('🔄 RPC failed, attempting manual dividend processing...');
                await this.processDividendsManually(habitBusinessId, totalEarnings, stockInfo.id);
              }
            } else {
              console.log('💡 No external investors - skipping dividend processing');
            }
          }
        } catch (dividendError) {
          console.error('⚠️ Warning: Failed to process dividends:', dividendError);
          // Don't fail the completion for this - dividends can be processed later
          // But let's add a note to help debugging
          console.log('💡 Habit completion succeeded, but dividend processing failed. This is non-critical.');
        }
      }

      // Update habit-business stats
      const updateData: any = {
        current_progress: currentProgress,
        total_completions: habitBusiness.total_completions + 1,
        total_earnings: habitBusiness.total_earnings + totalEarnings,
        last_completed_at: now.toISOString(), // Always update this to track when last activity happened
        updated_at: now.toISOString()
      };
      
      // Only update streak when the full goal is completed
      if (isGoalCompleted) {
        updateData.streak = newStreak;
        // Don't reset progress immediately - let the daily/weekly reset logic handle it
        // This keeps the progress value so isCompletedToday() works correctly
      }

      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update(updateData)
        .eq('id', habitBusinessId);

      if (updateError) {
        throw updateError;
      }

      // Update stock price based on new streak (if goal was completed)
      if (isGoalCompleted) {
        try {
          await this.supabase.rpc('update_stock_price_by_streak', {
            habit_business_uuid: habitBusinessId
          });
          console.log('✅ Stock price updated based on new streak');
        } catch (priceError) {
          console.error('⚠️ Warning: Failed to update stock price:', priceError);
          // Don't fail the completion for this
        }
      }

      // Add earnings to user's cash
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash, net_worth')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      const newCash = profile.cash + totalEarnings;
      const newNetWorth = profile.net_worth + totalEarnings;

      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          net_worth: newNetWorth,
          updated_at: now.toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        throw new Error('Habit completed but failed to add earnings');
      }

    } catch (error) {
      console.error('Error in completeHabit:', error);
      throw error;
    }
  }

  /**
   * Undo a habit completion for today
   */
  async undoHabitCompletion(habitBusinessId: string): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the habit-business details
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .single();

      if (habitError || !habitBusiness) {
        throw new Error('Habit-business not found');
      }

      // Check if there's a completion to undo for today
      // Use local date comparison to check last_completed_at
      const today = this.getLocalDateString();
      const lastCompleted = habitBusiness.last_completed_at ? 
        this.getLocalDateString(new Date(habitBusiness.last_completed_at)) : null;
      
      console.log('📅 Checking undo eligibility - Today:', today, 'Last completed:', lastCompleted);
      
      if (lastCompleted !== today) {
        throw new Error('No completion found for today to undo');
      }

      // Get today's completion record - use broader time range to account for timezone differences
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      // Convert to ISO strings for database query
      const todayStartISO = todayStart.toISOString();
      const todayEndISO = todayEnd.toISOString();
      
      console.log('🔍 Looking for completion between:', todayStartISO, 'and', todayEndISO);

      const { data: todaysCompletion, error: completionError } = await this.supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .gte('completed_at', todayStartISO)
        .lte('completed_at', todayEndISO)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (completionError || !todaysCompletion) {
        console.error('❌ Completion lookup error:', completionError);
        console.log('🔍 Checking all recent completions for debugging...');
        
        // Debug: Get recent completions to see what's available
        const { data: recentCompletions } = await this.supabase
          .from('habit_completions')
          .select('*')
          .eq('habit_business_id', habitBusinessId)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5);
          
        console.log('📊 Recent completions found:', recentCompletions);
        throw new Error('Could not find today\'s completion record');
      }

      // Calculate what the streak should be after undoing
      const previousStreak = Math.max(0, habitBusiness.streak - 1);
      
      // Find the previous completion to set as last_completed_at
      const { data: previousCompletion, error: prevError } = await this.supabase
        .from('habit_completions')
        .select('completed_at')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .neq('id', todaysCompletion.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      // Update habit-business stats (reverse the completion)
      const newCurrentProgress = Math.max(0, (habitBusiness.current_progress || 0) - 1);
      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update({
          streak: previousStreak,
          current_progress: newCurrentProgress,
          total_completions: Math.max(0, habitBusiness.total_completions - 1),
          total_earnings: Math.max(0, habitBusiness.total_earnings - todaysCompletion.earnings),
          last_completed_at: previousCompletion?.completed_at || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId);

      console.log(`↩️ Undoing completion: progress ${habitBusiness.current_progress} → ${newCurrentProgress}`);

      if (updateError) {
        throw updateError;
      }

      // Remove earnings from user's cash
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash, net_worth')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      const newCash = Math.max(0, profile.cash - todaysCompletion.earnings);
      const newNetWorth = Math.max(0, profile.net_worth - todaysCompletion.earnings);

      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          net_worth: newNetWorth,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        throw new Error('Failed to remove earnings from cash');
      }

      // Delete the completion record
      const { error: deleteError } = await this.supabase
        .from('habit_completions')
        .delete()
        .eq('id', todaysCompletion.id);

      if (deleteError) {
        console.error('Error deleting completion record:', deleteError);
        // Continue anyway as the main reversal is done
      }

    } catch (error) {
      console.error('Error in undoHabitCompletion:', error);
      throw error;
    }
  }

  /**
   * Get today's habits that can be completed
   */
  async getTodaysHabits(userId: string): Promise<HabitBusiness[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await this.supabase
        .from('habit_businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('frequency', 'daily')
        .or(`last_completed_at.is.null,last_completed_at.lt.${today}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching today\'s habits:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTodaysHabits:', error);
      throw error;
    }
  }

  /**
   * Manually process dividends when RPC function fails
   */
  async processDividendsManually(habitBusinessId: string, totalEarnings: number, stockId: string): Promise<void> {
    try {
      console.log('🔧 Manual dividend processing for business:', habitBusinessId);
      
      // Get stock holdings for this business
      const { data: holdings, error: holdingsError } = await this.supabase
        .from('stock_holdings')
        .select('*')
        .eq('stock_id', stockId)
        .gt('shares_owned', 0);
        
      if (holdingsError) {
        throw holdingsError;
      }
      
      if (!holdings || holdings.length === 0) {
        console.log('💡 No stockholders found for dividend distribution');
        return;
      }
      
      // Calculate dividend pool - typically 50% of the stock boost amount
      // Stock boost is 5% bonus per 10% external ownership
      const { data: stockInfo, error: stockError } = await this.supabase
        .from('business_stocks')
        .select('total_shares_issued, shares_owned_by_owner')
        .eq('id', stockId)
        .single();
        
      if (stockError || !stockInfo) {
        throw new Error('Could not get stock information');
      }
      
      const investorShares = stockInfo.total_shares_issued - stockInfo.shares_owned_by_owner;
      const ownershipPercentage = investorShares / stockInfo.total_shares_issued;
      const stockBoostMultiplier = Math.floor(ownershipPercentage * 10) * 0.05; // 5% per 10% ownership
      const stockBoostAmount = totalEarnings * stockBoostMultiplier;
      const dividendPool = stockBoostAmount * 0.5; // Investors get 50% of the boost
      
      console.log(`💰 Dividend calculation: total_earnings=${totalEarnings}, ownership=${(ownershipPercentage*100).toFixed(1)}%, boost=${stockBoostAmount.toFixed(2)}, pool=${dividendPool.toFixed(2)}`);
      
      if (dividendPool <= 0) {
        console.log('💡 No dividend pool to distribute');
        return;
      }
      
      // Calculate dividend per share
      const dividendPerShare = dividendPool / investorShares;
      
      // Distribute dividends to each stockholder
      for (const holding of holdings) {
        const dividendAmount = holding.shares_owned * dividendPerShare;
        
        console.log(`💸 Paying ${dividendAmount.toFixed(2)} dividend to holder ${holding.holder_id} (${holding.shares_owned} shares)`);
        
        // Record dividend distribution
        const { error: distributionError } = await this.supabase
          .from('stock_dividend_distributions')
          .insert({
            dividend_payment_id: crypto.randomUUID(),
            stockholder_id: holding.holder_id,
            shares_owned: holding.shares_owned,
            dividend_per_share: dividendPerShare,
            total_dividend: dividendAmount
          });
          
        if (distributionError) {
          console.error('Error recording dividend distribution:', distributionError);
          continue;
        }
        
        // Update stockholder's cash
        const { data: profile, error: profileError } = await this.supabase
          .from('user_profiles')
          .select('cash, net_worth')
          .eq('id', holding.holder_id)
          .single();
          
        if (profileError || !profile) {
          console.error('Error getting stockholder profile:', profileError);
          continue;
        }
        
        const newCash = profile.cash + dividendAmount;
        const newNetWorth = profile.net_worth + dividendAmount;
        
        const { error: updateError } = await this.supabase
          .from('user_profiles')
          .update({
            cash: newCash,
            net_worth: newNetWorth,
            updated_at: new Date().toISOString()
          })
          .eq('id', holding.holder_id);
          
        if (updateError) {
          console.error('Error updating stockholder cash:', updateError);
          continue;
        }
        
        // Update holding's total dividends earned
        const { error: holdingUpdateError } = await this.supabase
          .from('stock_holdings')
          .update({
            total_dividends_earned: holding.total_dividends_earned + dividendAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', holding.id);
          
        if (holdingUpdateError) {
          console.error('Error updating holding dividends:', holdingUpdateError);
        }
      }
      
      console.log('✅ Manual dividend processing completed');
      
    } catch (error) {
      console.error('❌ Error in manual dividend processing:', error);
      throw error;
    }
  }

  /**
   * Distribute dividends to stockholders
   */
  async distributeDividends(stockId: string, totalDividendPool: number): Promise<void> {
    try {
      // Get all stockholders for this business
      const { data: stockholders, error: stockholdersError } = await this.supabase
        .from('stock_holdings')
        .select('*')
        .eq('stock_id', stockId)
        .gt('shares_owned', 0);

      if (stockholdersError) {
        throw stockholdersError;
      }

      if (!stockholders || stockholders.length === 0) {
        return; // No stockholders to pay
      }

      // Get total shares owned by investors (excluding business owner)
      const totalInvestorShares = stockholders.reduce((sum, holding) => sum + holding.shares_owned, 0);
      
      if (totalInvestorShares === 0) {
        return; // No investor shares
      }

      // Calculate dividend per share
      const dividendPerShare = totalDividendPool / totalInvestorShares;

      // Create dividend distributions and update user cash
      for (const holding of stockholders) {
        const dividendAmount = holding.shares_owned * dividendPerShare;
        
        // Record the dividend distribution
        const { error: distributionError } = await this.supabase
          .from('stock_dividend_distributions')
          .insert({
            dividend_payment_id: crypto.randomUUID(),
            stockholder_id: holding.holder_id,
            shares_owned: holding.shares_owned,
            dividend_per_share: dividendPerShare,
            total_dividend: dividendAmount
          });

        if (distributionError) {
          console.error('Error recording dividend distribution:', distributionError);
          continue;
        }

        // Add dividend to stockholder's cash
        const { data: profile, error: profileError } = await this.supabase
          .from('user_profiles')
          .select('cash')
          .eq('id', holding.holder_id)
          .single();

        if (!profileError && profile) {
          const { error: updateCashError } = await this.supabase
            .from('user_profiles')
            .update({ 
              cash: profile.cash + dividendAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', holding.holder_id);

          if (updateCashError) {
            console.error('Error updating stockholder cash:', updateCashError);
          }
        }

        // Update total dividends earned in holding
        const { error: updateHoldingError } = await this.supabase
          .from('stock_holdings')
          .update({
            total_dividends_earned: holding.total_dividends_earned + dividendAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', holding.id);

        if (updateHoldingError) {
          console.error('Error updating holding dividends:', updateHoldingError);
        }
      }
    } catch (error) {
      console.error('Error in distributeDividends:', error);
      throw error;
    }
  }

  /**
   * Sell stock shares
   */
  async sellStockShares(stockId: string, sharesToSell: number): Promise<any> {
    try {
      const { data: currentUser } = await this.supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase.rpc('sell_stock_shares', {
        seller_id: currentUser.user.id,
        stock_uuid: stockId,
        shares_to_sell: sharesToSell
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error selling stock shares:', error);
      throw error;
    }
  }

  /**
   * Update stock price based on current streak
   */
  async updateStockPrice(habitBusinessId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('update_stock_price_by_streak', {
        habit_business_uuid: habitBusinessId
      });

      if (error) {
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Error updating stock price:', error);
      throw error;
    }
  }

  /**
   * Calculate upgrade options for a habit business
   */
  async calculateUpgradeOptions(habitBusinessId: string): Promise<UpgradeCalculation> {
    try {
      // Get the current habit business
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `)
        .eq('id', habitBusinessId)
        .single();

      if (habitError || !habitBusiness) {
        throw new Error('Habit business not found');
      }

      // Get all business types for upgrade options
      const businessTypes = await this.getBusinessTypes();
      
      // Calculate current business value based on streak
      const streakMultiplier = Math.max(1, habitBusiness.streak);
      const currentBusinessValue = habitBusiness.earnings_per_completion * streakMultiplier;
      
      // Calculate total streak value (simplified: daily earnings × streak × 30 days)
      // This represents the "investment value" of the current streak
      const totalStreakValue = currentBusinessValue * habitBusiness.streak * 30;

      // Find upgrade options (businesses that cost more than current)
      const availableUpgrades = businessTypes.filter(bt => 
        bt.base_cost > (habitBusiness.business_types?.base_cost || 0)
      );

      const upgradeOptions = availableUpgrades.map(businessType => {
        const upgradeCost = businessType.base_cost;
        const profitFromUpgrade = totalStreakValue - upgradeCost;
        const canAfford = totalStreakValue >= upgradeCost;

        return {
          businessType,
          upgradeCost,
          profitFromUpgrade,
          canAfford
        };
      });

      return {
        currentBusinessValue,
        streakMultiplier,
        totalStreakValue,
        availableUpgrades,
        upgradeOptions
      };
    } catch (error) {
      console.error('Error in calculateUpgradeOptions:', error);
      throw error;
    }
  }

  /**
   * Upgrade a business by selling streak value
   */
  async upgradeBusiness(
    oldHabitBusinessId: string, 
    newBusinessTypeId: number,
    newBusinessName: string,
    newHabitDescription: string
  ): Promise<HabitBusiness> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get upgrade calculation
      const upgradeCalc = await this.calculateUpgradeOptions(oldHabitBusinessId);
      const upgradeOption = upgradeCalc.upgradeOptions.find(opt => 
        opt.businessType.id === newBusinessTypeId
      );

      if (!upgradeOption || !upgradeOption.canAfford) {
        throw new Error('Cannot afford this upgrade');
      }

      // Get old habit business details
      const { data: oldBusiness, error: oldBusinessError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', oldHabitBusinessId)
        .single();

      if (oldBusinessError || !oldBusiness) {
        throw new Error('Old business not found');
      }

      // Create new habit business
      const newHabitBusiness = await this.createHabitBusiness({
        business_type_id: newBusinessTypeId,
        business_name: newBusinessName,
        habit_description: newHabitDescription,
        frequency: oldBusiness.frequency,
        goal_value: oldBusiness.goal_value || 1 // Use existing goal_value or default to 1
      });

      // Record the upgrade transaction
      const { error: upgradeError } = await this.supabase
        .from('business_upgrades')
        .insert({
          user_id: user.id,
          old_habit_business_id: oldHabitBusinessId,
          new_habit_business_id: newHabitBusiness.id,
          old_business_type_id: oldBusiness.business_type_id,
          new_business_type_id: newBusinessTypeId,
          streak_value_sold: upgradeCalc.totalStreakValue,
          upgrade_cost: upgradeOption.upgradeCost,
          profit_from_upgrade: upgradeOption.profitFromUpgrade,
          old_streak_count: oldBusiness.streak
        });

      if (upgradeError) {
        console.error('Error recording upgrade:', upgradeError);
      }

      // Add profit to user's cash
      if (upgradeOption.profitFromUpgrade > 0) {
        const { data: profile, error: profileError } = await this.supabase
          .from('user_profiles')
          .select('cash')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          const { error: updateCashError } = await this.supabase
            .from('user_profiles')
            .update({ 
              cash: profile.cash + upgradeOption.profitFromUpgrade,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateCashError) {
            console.error('Error adding upgrade profit:', updateCashError);
          }
        }
      }

      // Deactivate old business
      const { error: deactivateError } = await this.supabase
        .from('habit_businesses')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', oldHabitBusinessId);

      if (deactivateError) {
        console.error('Error deactivating old business:', deactivateError);
      }

      return newHabitBusiness;
    } catch (error) {
      console.error('Error in upgradeBusiness:', error);
      throw error;
    }
  }

  /**
   * Get user's stock holdings
   */
  async getUserStockHoldings(userId: string): Promise<StockHolding[]> {
    try {
      const { data, error } = await this.supabase
        .from('stock_holdings')
        .select(`
          *,
          business_stocks (
            id,
            habit_business_id,
            business_owner_id,
            current_stock_price,
            total_shares_issued,
            shares_owned_by_owner,
            shares_available,
            price_multiplier,
            habit_businesses (
              id,
              business_name,
              business_icon,
              streak,
              business_types (
                name,
                icon
              )
            )
          )
        `)
        .eq('holder_id', userId)
        .gt('shares_owned', 0);

      if (error) {
        console.error('Error fetching stock holdings:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserStockHoldings:', error);
      throw error;
    }
  }

  /**
   * Get available stocks for purchase
   */
  async getAvailableStocks(userId: string): Promise<BusinessStock[]> {
    try {
      const { data, error } = await this.supabase
        .from('business_stocks')
        .select(`
          *,
          habit_businesses (
            id,
            business_name,
            business_icon,
            streak,
            user_id,
            business_types (
              name,
              icon
            )
          )
        `)
        .gt('shares_available', 0)
        .neq('business_owner_id', userId); // Don't show user's own stocks

      if (error) {
        console.error('Error fetching available stocks:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableStocks:', error);
      throw error;
    }
  }

  /**
   * Purchase stock shares
   */
  async purchaseStock(stockId: string, shares: number): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get stock details
      const { data: stock, error: stockError } = await this.supabase
        .from('business_stocks')
        .select('*')
        .eq('id', stockId)
        .single();

      if (stockError || !stock) {
        throw new Error('Stock not found');
      }

      if (stock.shares_available < shares) {
        throw new Error('Not enough shares available');
      }

      const totalCost = stock.current_stock_price * shares;

      // Check user's cash
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      if (profile.cash < totalCost) {
        throw new Error(`Insufficient funds. Need $${totalCost}, but you only have $${profile.cash}`);
      }

      // Update or create stock holding
      const { data: existingHolding, error: holdingError } = await this.supabase
        .from('stock_holdings')
        .select('*')
        .eq('holder_id', user.id)
        .eq('stock_id', stockId)
        .single();

      if (holdingError && holdingError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw holdingError;
      }

      if (existingHolding) {
        // Update existing holding
        const newTotalShares = existingHolding.shares_owned + shares;
        const newTotalInvested = existingHolding.total_invested + totalCost;
        const newAveragePrice = newTotalInvested / newTotalShares;

        const { error: updateHoldingError } = await this.supabase
          .from('stock_holdings')
          .update({
            shares_owned: newTotalShares,
            total_invested: newTotalInvested,
            average_purchase_price: newAveragePrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingHolding.id);

        if (updateHoldingError) {
          throw updateHoldingError;
        }
      } else {
        // Create new holding
        const { error: createHoldingError } = await this.supabase
          .from('stock_holdings')
          .insert({
            holder_id: user.id,
            stock_id: stockId,
            shares_owned: shares,
            average_purchase_price: stock.current_stock_price,
            total_invested: totalCost
          });

        if (createHoldingError) {
          throw createHoldingError;
        }
      }

      // Update stock availability
      const { error: updateStockError } = await this.supabase
        .from('business_stocks')
        .update({
          shares_available: stock.shares_available - shares,
          updated_at: new Date().toISOString()
        })
        .eq('id', stockId);

      if (updateStockError) {
        throw updateStockError;
      }

      // Record transaction
      const { error: transactionError } = await this.supabase
        .from('stock_transactions')
        .insert({
          stock_id: stockId,
          buyer_id: user.id,
          seller_id: null, // IPO purchase
          shares_traded: shares,
          price_per_share: stock.current_stock_price,
          total_cost: totalCost,
          transaction_type: 'purchase'
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
      }

      // Deduct cost from user's cash
      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: profile.cash - totalCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        throw new Error('Stock purchased but failed to deduct payment');
      }

    } catch (error) {
      console.error('Error in purchaseStock:', error);
      throw error;
    }
  }

  /**
   * Get today's actual earnings from completed habits
   */
  async getTodaysActualEarnings(userId: string): Promise<number> {
    try {
      // Get today's date range in local timezone
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      console.log(`📊 Fetching habit earnings for ${userId} between ${today.toISOString()} and ${tomorrow.toISOString()}`);
      
      const { data, error } = await this.supabase
        .from('habit_completions')
        .select('earnings, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', tomorrow.toISOString());

      if (error) {
        console.error('Error fetching today\'s actual earnings:', error);
        throw error;
      }

      const totalEarnings = data?.reduce((total, completion) => total + completion.earnings, 0) || 0;
      console.log(`💰 Today's habit earnings for user: $${totalEarnings.toFixed(2)} (${data?.length || 0} completions)`);
      
      return totalEarnings;
    } catch (error) {
      console.error('Error in getTodaysActualEarnings:', error);
      throw error;
    }
  }

  /**
   * Get today's stock dividend earnings for a user
   */
  async getTodaysStockDividends(userId: string): Promise<number> {
    try {
      // Get today's date range in local timezone
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      console.log(`📊 Fetching stock dividends for ${userId} between ${today.toISOString()} and ${tomorrow.toISOString()}`);
      
      const { data, error } = await this.supabase
        .from('stock_dividend_distributions')
        .select('total_dividend, created_at')
        .eq('stockholder_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (error) {
        console.error('Error fetching today\'s stock dividends:', error);
        throw error;
      }

      const totalDividends = data?.reduce((total, distribution) => total + distribution.total_dividend, 0) || 0;
      console.log(`💰 Today's stock dividends for user: $${totalDividends.toFixed(2)} (${data?.length || 0} distributions)`);
      
      // Debug: Show each individual dividend payment
      if (data && data.length > 0) {
        console.log('🔍 Individual dividend payments received today:');
        data.forEach((payment, index) => {
          console.log(`  ${index + 1}. $${payment.total_dividend.toFixed(4)} received at ${payment.created_at}`);
        });
      }
      
      // For debugging: also check if user has any stock holdings that should generate dividends
      try {
        const holdings = await this.getUserStockHoldings(userId);
        if (holdings.length > 0) {
          console.log(`📈 User has ${holdings.length} stock holdings that could generate dividends:`, 
            holdings.map(h => `${h.business_stocks?.habit_businesses?.business_name}: ${h.shares_owned} shares`));
        } else {
          console.log(`ℹ️ User has no stock holdings - dividends will always be $0`);
        }
      } catch (holdingsError) {
        console.warn('Could not fetch holdings for dividend debugging:', holdingsError);
      }
      
      return totalDividends;
    } catch (error) {
      console.error('Error in getTodaysStockDividends:', error);
      throw error;
    }
  }

  /**
   * Debug method to get comprehensive information about the dividend system
   */
  async getDividendSystemDebugInfo(userId: string): Promise<{
    userHoldings: any[],
    ownedBusinessStocks: any[],
    todaysDividends: number,
    recentDividendDistributions: any[]
  }> {
    try {
      // Get user's stock holdings
      const userHoldings = await this.getUserStockHoldings(userId);
      
      // Get stocks for businesses owned by this user
      const { data: ownedBusinessStocks } = await this.supabase
        .from('business_stocks')
        .select(`
          *,
          habit_businesses!inner (
            id,
            business_name,
            user_id
          )
        `)
        .eq('habit_businesses.user_id', userId);
      
      // Get today's dividends
      const todaysDividends = await this.getTodaysStockDividends(userId);
      
      // Get recent dividend distributions
      const { data: recentDistributions } = await this.supabase
        .from('stock_dividend_distributions')
        .select('*')
        .eq('stockholder_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      return {
        userHoldings: userHoldings || [],
        ownedBusinessStocks: ownedBusinessStocks || [],
        todaysDividends,
        recentDividendDistributions: recentDistributions || []
      };
    } catch (error) {
      console.error('Error getting dividend debug info:', error);
      throw error;
    }
  }

  /**
   * Create a test dividend distribution for debugging (dev mode only)
   */
  async createTestDividend(userId: string, amount: number = 5.0): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('stock_dividend_distributions')
        .insert({
          dividend_payment_id: `test-${Date.now()}`,
          stockholder_id: userId,
          shares_owned: 10,
          dividend_per_share: amount / 10,
          total_dividend: amount
        });

      if (error) {
        throw error;
      }

      console.log(`✅ Created test dividend of $${amount} for user ${userId}`);
    } catch (error) {
      console.error('Error creating test dividend:', error);
      throw error;
    }
  }

  /**
   * Reset daily habits that are outdated (completed before today)
   * This ensures that habits completed yesterday show as incomplete today
   */
  async resetOutdatedDailyHabits(): Promise<void> {
    try {
      console.log('🔄 Checking for outdated daily habits to reset...');
      
      // First, clean up any future date completions that shouldn't exist
      await this.cleanupInvalidCompletions();
      
      const { data, error } = await this.supabase
        .rpc('reset_outdated_daily_habits');

      if (error) {
        console.error('Error resetting outdated daily habits:', error);
        // Don't throw error - this is a nice-to-have feature, not critical
        return;
      }

      if (data && data.length > 0) {
        console.log(`✅ Reset ${data.length} outdated daily habit(s):`, data);
        
        // Update stock prices for habits that had their streaks reset
        for (const resetHabit of data) {
          try {
            await this.supabase.rpc('update_stock_price_by_streak', {
              habit_business_uuid: resetHabit.id
            });
            console.log(`📈 Updated stock price for habit: ${resetHabit.business_name}`);
          } catch (priceError) {
            console.error(`⚠️ Failed to update stock price for habit ${resetHabit.id}:`, priceError);
          }
        }
      } else {
        console.log('✅ No daily habits needed resetting');
      }
    } catch (error) {
      console.error('Error in resetOutdatedDailyHabits:', error);
      // Don't throw error - this is a nice-to-have feature
    }
  }

  /**
   * Clean up invalid completion records (future dates, timezone issues)
   */
  private async cleanupInvalidCompletions(): Promise<void> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) return;

      const now = new Date();
      // Be more strict: anything beyond today should be cleaned up
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      console.log('🧹 Cleaning up completion records after:', endOfToday.toISOString());
      
      // Find and remove completion records that are in the future
      const { data: futureCompletions, error: queryError } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at, habit_business_id')
        .eq('user_id', user.id)
        .gt('completed_at', endOfToday.toISOString());

      if (queryError) {
        console.error('Error querying future completions:', queryError);
        return;
      }

      if (futureCompletions && futureCompletions.length > 0) {
        console.log(`⚠️ Found ${futureCompletions.length} future completion records to clean up:`, 
          futureCompletions.map(c => ({ 
            id: c.id, 
            date: c.completed_at, 
            business: c.habit_business_id?.substring(0, 8),
            isAfterToday: new Date(c.completed_at) > endOfToday
          })));
        
        // Delete the invalid records
        const { error: deleteError } = await this.supabase
          .from('habit_completions')
          .delete()
          .in('id', futureCompletions.map(c => c.id));

        if (deleteError) {
          console.error('Error deleting future completions:', deleteError);
        } else {
          console.log('✅ Cleaned up future completion records');
          
          // Reset the progress for affected habit businesses
          const affectedBusinessIds = [...new Set(futureCompletions.map(c => c.habit_business_id))];
          for (const businessId of affectedBusinessIds) {
            if (businessId) {
              const { error: resetError } = await this.supabase
                .from('habit_businesses')
                .update({ 
                  current_progress: 0,
                  updated_at: new Date().toISOString()
                })
                .eq('id', businessId);
              
              if (resetError) {
                console.error('Error resetting progress for business:', businessId, resetError);
              }
            }
          }
        }
      } else {
        console.log('✅ No future completion records found to clean up');
      }
    } catch (error) {
      console.error('Error in cleanupInvalidCompletions:', error);
    }
  }

  /**
   * Debug function to inspect habit state and completion records
   */
  async debugHabitState(habitBusinessId: string): Promise<any> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 DEBUGGING HABIT STATE for:', habitBusinessId);

      // Get habit business details
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .single();

      console.log('📊 Habit Business State:', habitBusiness);

      // Get today's date info
      const now = new Date();
      const todayLocalString = this.getLocalDateString(now);
      const todayUTCString = now.toISOString().split('T')[0];
      
      console.log('📅 Date Info:', {
        now: now.toString(),
        nowISO: now.toISOString(),
        todayLocal: todayLocalString,
        todayUTC: todayUTCString,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: now.getTimezoneOffset()
      });

      // Get ALL completion records for this habit
      const { data: allCompletions, error: completionsError } = await this.supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      console.log('📋 All Recent Completions:', allCompletions);

      // Check for today's completions specifically
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      const { data: todayCompletions, error: todayError } = await this.supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .gte('completed_at', todayStart.toISOString())
        .lte('completed_at', todayEnd.toISOString());

      console.log('📅 Today\'s Completions (using time range):', todayCompletions);

      // Check completions using date string comparison
      const todayCompletionsByDate = allCompletions?.filter(completion => {
        const completionDate = this.getLocalDateString(new Date(completion.completed_at));
        return completionDate === todayLocalString;
      });

      console.log('📅 Today\'s Completions (using date string):', todayCompletionsByDate);

      // Calculate what the UI methods would return
      const isCompletedResult = this.isCompletedTodayDebug(habitBusiness);
      const isGoalCompletedResult = this.isGoalCompletedDebug(habitBusiness);

      console.log('🎯 UI Method Results:', {
        isCompletedToday: isCompletedResult,
        isGoalCompleted: isGoalCompletedResult,
        currentProgress: habitBusiness?.current_progress,
        goalValue: habitBusiness?.goal_value,
        lastCompletedAt: habitBusiness?.last_completed_at
      });

      return {
        habitBusiness,
        dateInfo: {
          now: now.toString(),
          todayLocal: todayLocalString,
          todayUTC: todayUTCString,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        allCompletions,
        todayCompletions,
        todayCompletionsByDate,
        uiResults: {
          isCompletedToday: isCompletedResult,
          isGoalCompleted: isGoalCompletedResult
        }
      };

    } catch (error) {
      console.error('❌ Error in debugHabitState:', error);
      throw error;
    }
  }

  /**
   * Debug version of isCompletedToday that logs its logic
   */
  private isCompletedTodayDebug(habitBusiness: any): boolean {
    console.log('🔍 isCompletedToday Debug for:', habitBusiness?.business_name);
    
    if (!habitBusiness?.last_completed_at) {
      console.log('❌ No last_completed_at - returning false');
      return false;
    }
    
    const goalValue = habitBusiness.goal_value || 1;
    const currentProgress = habitBusiness.current_progress || 0;
    
    console.log('📊 Progress check:', { currentProgress, goalValue });
    
    // Check if goal is fully completed
    if (goalValue > 1 && currentProgress < goalValue) {
      console.log('❌ Multi-completion habit goal not met - returning false');
      return false;
    }
    
    // Check if progress is 0
    if (currentProgress === 0) {
      console.log('❌ Current progress is 0 - returning false');
      return false;
    }
    
    if (habitBusiness.frequency === 'daily') {
      const today = new Date();
      const todayString = this.getLocalDateString(today);
      
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = this.getLocalDateString(completionDate);
      
      console.log('📅 Date comparison:', { 
        todayString, 
        completionString, 
        match: completionString === todayString 
      });
      
      return completionString === todayString;
    }
    
    return false;
  }

  /**
   * Debug version of isGoalCompleted that logs its logic
   */
  private isGoalCompletedDebug(habitBusiness: any): boolean {
    console.log('🔍 isGoalCompleted Debug for:', habitBusiness?.business_name);
    
    const goalValue = habitBusiness?.goal_value || 1;
    const currentProgress = habitBusiness?.current_progress || 0;
    
    console.log('📊 Goal check:', { currentProgress, goalValue });
    
    // First check if the progress meets the goal
    if (currentProgress < goalValue) {
      console.log('❌ Goal not met - returning false');
      return false;
    }
    
    if (!habitBusiness?.last_completed_at) {
      console.log('❌ No completion record - returning false');
      return false;
    }
    
    if (habitBusiness.frequency === 'daily') {
      const today = new Date();
      const todayString = this.getLocalDateString(today);
      
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = this.getLocalDateString(completionDate);
      
      console.log('📅 Date comparison for goal:', { 
        todayString, 
        completionString, 
        match: completionString === todayString 
      });
      
      return completionString === todayString;
    }
    
    return false;
  }

  /**
   * Emergency cleanup function to remove duplicate/invalid completions for a specific habit
   */
  async cleanupHabitCompletions(habitBusinessId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) return;

      console.log('🚨 Emergency cleanup for habit:', habitBusinessId);

      // Get all completions for this habit
      const { data: allCompletions, error: queryError } = await this.supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true });

      if (queryError) {
        console.error('Error fetching completions:', queryError);
        return;
      }

      if (!allCompletions || allCompletions.length === 0) {
        console.log('No completions found for this habit');
        return;
      }

      console.log(`Found ${allCompletions.length} completion records`);

      // Group by date and keep only the first completion per day
      const completionsByDate = new Map<string, any>();
      const duplicatesToDelete: string[] = [];

      for (const completion of allCompletions) {
        const dateKey = completion.completed_at.split('T')[0]; // Get YYYY-MM-DD
        
        if (completionsByDate.has(dateKey)) {
          // This is a duplicate - mark for deletion
          duplicatesToDelete.push(completion.id);
          console.log(`🗑️ Marking duplicate for deletion: ${completion.id} (${completion.completed_at})`);
        } else {
          completionsByDate.set(dateKey, completion);
          console.log(`✅ Keeping completion: ${completion.id} (${completion.completed_at})`);
        }
      }

      // Delete duplicates
      if (duplicatesToDelete.length > 0) {
        const { error: deleteError } = await this.supabase
          .from('habit_completions')
          .delete()
          .in('id', duplicatesToDelete);

        if (deleteError) {
          console.error('Error deleting duplicates:', deleteError);
        } else {
          console.log(`✅ Deleted ${duplicatesToDelete.length} duplicate completion records`);
        }
      }

      // Calculate correct current_progress based on today's remaining completions
      const today = this.getLocalDateString();
      const todayCompletions = Array.from(completionsByDate.entries())
        .filter(([dateKey, completion]) => dateKey === today);
      
      const correctProgress = todayCompletions.length;
      
      console.log(`📊 Updating progress: today=${today}, todayCompletions=${correctProgress}`);
      
      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update({ 
          current_progress: correctProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId);

      if (updateError) {
        console.error('Error updating habit progress:', updateError);
      } else {
        console.log(`✅ Updated habit progress to ${correctProgress}`);
      }

    } catch (error) {
      console.error('Error in cleanupHabitCompletions:', error);
    }
  }

  /**
   * Check which habits need reset for a specific user (for debugging)
   */
  async checkUserHabitsNeedReset(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_user_habits_need_reset', { user_uuid: userId });

      if (error) {
        console.error('Error checking user habits reset status:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in checkUserHabitsNeedReset:', error);
      return [];
    }
  }

  /**
   * Get friend businesses for the stocks page
   */
  async getFriendBusinesses(userId: string): Promise<any[]> {
    try {
      // Use the new SQL function to get friend businesses optimized for stocks
      const { data, error } = await this.supabase
        .rpc('get_friend_businesses_for_stocks', { user_uuid: userId });

      if (error) {
        console.error('Error loading friend businesses for stocks:', error);
        return [];
      }

      // Format for the frontend
      return (data || []).map((business: any) => ({
        id: business.business_id,
        businessName: business.business_name,
        businessIcon: business.business_icon,
        ownerName: business.owner_name,
        ownerId: business.owner_id,
        streak: business.streak || 0,
        frequency: business.frequency,
        goalValue: business.goal_value || 1,
        currentProgress: business.current_progress || 0,
        earningsPerCompletion: business.earnings_per_completion || 0,
        // Stock information
        stockId: business.stock_id,
        stockPrice: business.stock_price,
        basePrice: business.base_price || 100,
        priceMultiplier: business.price_multiplier || 1.0,
        sharesAvailable: business.shares_available || 200,
        totalShares: business.total_shares || 1000,
        potentialDividend: business.potential_dividend || 0
      }));

    } catch (error) {
      console.error('Error in getFriendBusinesses:', error);
      return [];
    }
  }

  /**
   * Get user's stock portfolio
   */
  async getUserStockPortfolio(userId: string): Promise<any[]> {
    console.log('🔍 Loading portfolio for userId:', userId);
    console.log('🔍 User ID type:', typeof userId);
    console.log('🔍 User ID length:', userId?.length);
    
    try {
      console.log('🔍 About to call RPC function...');
      const { data, error } = await this.supabase
        .rpc('get_user_stock_portfolio', { user_uuid: userId });

      console.log('🔍 Portfolio RPC response:', { data, error });
      console.log('🔍 Data type:', typeof data);
      console.log('🔍 Data is array:', Array.isArray(data));
      console.log('🔍 Data length:', data?.length);
      console.log('🔍 Raw data:', JSON.stringify(data, null, 2));

      if (error) {
        console.error('❌ Error loading stock portfolio:', error);
        console.error('❌ Error details:', error.message, error.code, error.hint);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        return [];
      }

      console.log('🔍 Portfolio data length:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('⚠️ No portfolio data returned - checking if transactions exist...');
        // Let's check raw transactions instead of non-existent stock_holdings
        const { data: rawTransactions, error: transactionsError } = await this.supabase
          .from('stock_transactions')
          .select('*')
          .eq('buyer_id', userId)
          .eq('transaction_type', 'purchase');
        
        console.log('🔍 Raw transactions check:', { rawTransactions, transactionsError });
        console.log('🔍 Found', rawTransactions?.length || 0, 'transactions for user');
        
        // Also check if RPC function works with direct SQL
        console.log('🔍 Testing direct RPC call...');
        const { data: testData, error: testError } = await this.supabase
          .rpc('get_user_stock_portfolio', { user_uuid: 'cf12469a-d7a2-40ef-82ca-21e8ade1d69b' });
        console.log('🔍 Test RPC result:', { testData, testError });
        
        return [];
      }

      const mappedData = (data || []).map((holding: any) => {
        console.log('🔍 Portfolio holding raw data:', holding);
        return {
          id: holding.holding_id,
          stockId: holding.stock_id,
          businessId: holding.business_id, // Add the business ID
          businessName: holding.business_name,
          businessIcon: holding.business_icon,
          ownerName: holding.owner_name,
          ownerId: holding.owner_id || holding.business_owner_id, // Add owner ID
          sharesOwned: holding.shares_owned,
          averagePurchasePrice: holding.average_purchase_price,
          currentPrice: holding.current_stock_price,
          totalInvested: holding.total_invested,
          currentValue: holding.current_value,
          profitLoss: holding.profit_loss,
          totalDividendsEarned: holding.total_dividends_earned,
          dailyDividendRate: holding.daily_dividend_rate,
          businessStreak: holding.business_streak
        };
      });
      
      console.log('🔍 Mapped portfolio data:', mappedData);
      return mappedData;

    } catch (error) {
      console.error('❌ Error in getUserStockPortfolio:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  /**
   * Purchase stock shares
   */
  async purchaseStockShares(stockId: string, shares: number): Promise<any> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .rpc('purchase_stock_shares', { 
          buyer_id: user.id, 
          stock_uuid: stockId, 
          shares_to_buy: shares 
        });

      if (error) {
        console.error('Error purchasing stock shares:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;

    } catch (error) {
      console.error('Error in purchaseStockShares:', error);
      throw error;
    }
  }

  /**
   * Create business stock when a habit business is created
   */
  async createBusinessStock(habitBusinessId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('create_business_stock', { habit_business_uuid: habitBusinessId });

      if (error) {
        console.error('Error creating business stock:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createBusinessStock:', error);
      throw error;
    }
  }

  /**
   * Fix stock prices for all businesses (for debugging/maintenance)
   */
  async fixAllStockPrices(): Promise<void> {
    try {
      console.log('🔧 Starting comprehensive stock price fix...');

      // First, run the SQL fix for earnings and stock prices
      console.log('🔧 Running database fixes...');
      const { error: sqlError } = await this.supabase.rpc('execute_sql', {
        sql: `
          -- Fix earnings_per_completion for businesses with incorrect values
          UPDATE habit_businesses 
          SET earnings_per_completion = CASE
              WHEN earnings_per_completion > (
                  SELECT base_pay 
                  FROM business_types bt 
                  WHERE bt.id = habit_businesses.business_type_id
              ) THEN (
                  SELECT base_pay 
                  FROM business_types bt 
                  WHERE bt.id = habit_businesses.business_type_id
              )
              WHEN earnings_per_completion < 0.01 THEN GREATEST(0.01, (
                  SELECT base_pay / 100
                  FROM business_types bt 
                  WHERE bt.id = habit_businesses.business_type_id
              ))
              ELSE earnings_per_completion
          END;

          -- Update stock prices to be reasonable (base_cost * 0.1 * multiplier)
          UPDATE business_stocks 
          SET current_stock_price = ROUND(
              (bt.base_cost * 0.1) * COALESCE(price_multiplier, 1.0), 2
          ),
          last_price_update = NOW()
          FROM habit_businesses hb
          JOIN business_types bt ON hb.business_type_id = bt.id
          WHERE business_stocks.habit_business_id = hb.id;
        `
      });

      if (sqlError) {
        console.warn('SQL fix failed, continuing with individual updates:', sqlError);
      }

      // Get all habit businesses and update their stock prices
      const { data: businesses, error: businessError } = await this.supabase
        .from('habit_businesses')
        .select('id')
        .eq('is_active', true);

      if (businessError) {
        throw businessError;
      }

      console.log(`🔧 Updating stock prices for ${businesses?.length || 0} businesses...`);

      // Update stock price for each business using the updated function
      for (const business of businesses || []) {
        try {
          await this.supabase.rpc('update_stock_price_by_streak', { 
            habit_business_uuid: business.id 
          });
          console.log(`✅ Updated stock price for business ${business.id}`);
        } catch (error) {
          console.warn(`⚠️ Failed to update stock price for business ${business.id}:`, error);
        }
      }

      console.log('🎉 Comprehensive stock price fix complete!');
    } catch (error) {
      console.error('Error in fixAllStockPrices:', error);
      throw error;
    }
  }

  /**
   * Fix lemonade stock prices specifically (direct database update)
   */
  async fixLemonadeStockPrices(): Promise<void> {
    try {
      console.log('🍋 Fixing lemonade stock prices...');
      
      // First get lemonade habit business IDs
      const { data: lemonadeBusinesses, error: fetchError } = await this.supabase
        .from('habit_businesses')
        .select('id')
        .or('business_icon.eq.🍋,earnings_per_completion.eq.1.00')
        .eq('is_active', true);

      if (fetchError) {
        throw fetchError;
      }

      if (!lemonadeBusinesses || lemonadeBusinesses.length === 0) {
        console.log('No lemonade businesses found');
        return;
      }

      const businessIds = lemonadeBusinesses.map(b => b.id);
      console.log(`Found ${businessIds.length} lemonade businesses:`, businessIds);

      // Direct update to fix lemonade stocks showing $100 instead of $1
      const { error: updateError } = await this.supabase
        .from('business_stocks')
        .update({
          current_stock_price: 1.00,
          price_multiplier: 1.0,
          last_price_update: new Date().toISOString()
        })
        .in('habit_business_id', businessIds);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Lemonade stock prices fixed!');
    } catch (error) {
      console.error('Error in fixLemonadeStockPrices:', error);
      throw error;
    }
  }

  /**
   * Calculate potential dividend per share for a friend's business
   */
  private calculatePotentialDividend(earningsPerCompletion: number, streak: number, currentProgress: number, goalValue: number): number {
    // Base dividend is a percentage of earnings per completion
    const baseDividend = earningsPerCompletion * 0.1; // 10% base dividend

    // Streak multiplier (1x to 2x based on streak)
    const streakMultiplier = Math.min(1 + (streak * 0.01), 2); // +1% per day of streak, max 2x

    // Progress bonus (if they're likely to complete today)
    const progressBonus = currentProgress >= goalValue ? 1.5 : 1;

    // Total dividend pool per completion
    const totalDividendPool = baseDividend * streakMultiplier * progressBonus;
    
    // Divide by typical total shares (100) to get per-share dividend
    const dividendPerShare = totalDividendPool / 100;

    return dividendPerShare;
  }

  /**
   * Get habit completion history for the specified period
   * When days = 365, returns current calendar year data (Jan 1 - Dec 31)
   * Otherwise returns the last N days from today
   */
  async getHabitCompletionHistory(businessId: string, days: number = 30): Promise<{ date: string; completed: boolean; streakDay: number }[]> {
    try {
      console.log('🔍 getHabitCompletionHistory called with:', { businessId, days });
      
      let startDate: Date;
      let endDate: Date;
      
      if (days === 365) {
        // For full year view (365 days), show current calendar year
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1); // January 1st
        endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st end of day
        console.log('📅 Using calendar year mode for 365 days');
      } else {
        // For other day counts, use the traditional "last N days" approach
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        console.log('📅 Using sliding window mode for', days, 'days');
      }

      console.log('📅 Date range:', {
        startDate: this.getLocalDateString(startDate),
        endDate: this.getLocalDateString(endDate),
        mode: days === 365 ? 'calendar-year' : 'sliding-window'
      });

      // Get completion data - using correct column names from schema
      const { data: completions, error } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at, streak_count, earnings, habit_business_id')
        .eq('habit_business_id', businessId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching habit completions:', error);
        return [];
      }

      console.log('📊 Raw completion data from Supabase:', completions);
      console.log('📈 Number of completion records found:', completions?.length || 0);
      
      // Debug: Show which business IDs we found in the data
      if (completions && completions.length > 0) {
        const businessIds = [...new Set(completions.map(c => c.habit_business_id))];
        console.log('🔍 Business IDs found in completion data:', businessIds);
        console.log('🎯 Requested business ID:', businessId);
        console.log('✅ Filtering match:', businessIds.includes(businessId) ? 'YES' : 'NO');
        
        // Log the actual completion dates for this business
        const businessCompletions = completions.filter(c => c.habit_business_id === businessId);
        console.log('📅 Completion dates for business', businessId.substring(0, 8) + '...:', 
          businessCompletions.map(c => ({
            id: c.id,
            date: c.completed_at,
            streak: c.streak_count,
            earnings: c.earnings,
            business_id: c.habit_business_id
          })));
        
        const uniqueDates = [...new Set(businessCompletions.map(c => c.completed_at?.split('T')[0]))];
        console.log('📆 Unique completion dates:', uniqueDates.length, 'dates:', uniqueDates);
        
        // Log ALL completion records to see if there's data sharing
        console.log('🔍 ALL completion records in query result:');
        completions.forEach((record, index) => {
          console.log(`  ${index + 1}. ID: ${record.id}, Business: ${record.habit_business_id?.substring(0, 8)}..., Date: ${record.completed_at?.split('T')[0]}, Earnings: ${record.earnings}`);
        });
      }

      // Debug: Query ALL completion records in the database to investigate data integrity
      const { data: allCompletions } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at, streak_count, earnings, habit_business_id')
        .order('completed_at', { ascending: true });
      
      console.log('🌍 TOTAL completion records in database:', allCompletions?.length);
      if (allCompletions && allCompletions.length > 0) {
        console.log('🌍 ALL completion records in database:');
        allCompletions.forEach((record, index) => {
          console.log(`  ${index + 1}. ID: ${record.id}, Business: ${record.habit_business_id?.substring(0, 8)}..., Date: ${record.completed_at?.split('T')[0]}`);
        });
        
        // Check for duplicate records
        const duplicateDates = allCompletions.reduce((acc: any, record) => {
          const date = record.completed_at?.split('T')[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(record);
          return acc;
        }, {});
        
        Object.entries(duplicateDates).forEach(([date, records]) => {
          const recordArray = records as any[];
          if (recordArray.length > 1) {
            console.log(`⚠️ Date ${date} has ${recordArray.length} records:`, 
              recordArray.map(r => ({ id: r.id, business: r.habit_business_id?.substring(0, 8) + '...' }))
            );
          }
        });
      }

      // Create a complete date range
      const dateRange: { date: string; completed: boolean; streakDay: number }[] = [];
      let currentStreak = 0;
      
      // Calculate total days in the range
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      console.log('📊 Generating date range:', totalDays, 'days from', this.getLocalDateString(startDate), 'to', this.getLocalDateString(endDate));
      
      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const dateStr = this.getLocalDateString(currentDate);
        
        // Check if there was a completion on this date
        const completion = completions?.find(c => 
          c.completed_at && c.completed_at.startsWith(dateStr)
        );
        
        // Debug for current date or specific dates
        const today = this.getLocalDateString(new Date());
        if (dateStr === today || dateStr === '2025-08-20' || i < 5 || i >= totalDays - 5) {
          console.log(`🔍 Date ${i + 1}/${totalDays}: ${dateStr} = ${currentDate.toDateString()}, completion:`, completion ? 'YES' : 'NO');
        }
        
        const wasCompleted = !!completion;
        
        // Update streak - use the streak_count from the completion record if available
        if (wasCompleted) {
          currentStreak = completion.streak_count || currentStreak + 1;
        } else {
          currentStreak = 0;
        }
        
        dateRange.push({
          date: dateStr,
          completed: wasCompleted,
          streakDay: currentStreak
        });
      }

      console.log('✅ Generated date range with', dateRange.length, 'days');
      const completedDates = dateRange.filter(d => d.completed);
      console.log('🎯 Completed days:', completedDates.length);
      console.log('📅 Completed dates:', completedDates.slice(0, 10).map(d => d.date)); // Show first 10 dates
      return dateRange;
    } catch (error) {
      console.error('💥 Error in getHabitCompletionHistory:', error);
      return [];
    }
  }

  /**
   * Get habit completion history for stocks - works across users for public stock data
   * This method uses a different approach that bypasses user restrictions for stock viewing
   */
  async getHabitCompletionHistoryForStock(businessId: string, days: number = 30): Promise<{ date: string; completed: boolean; streakDay: number }[]> {
    try {
      console.log('🔍 getHabitCompletionHistoryForStock called with:', { businessId, days });
      
      let startDate: Date;
      let endDate: Date;
      
      if (days === 365) {
        // For full year view (365 days), show current calendar year
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1); // January 1st
        endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st end of day
        console.log('📅 Using calendar year mode for 365 days');
      } else {
        // For other day counts, use the traditional "last N days" approach
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        console.log('📅 Using sliding window mode for', days, 'days');
      }

      console.log('📅 Stock completion date range:', {
        startDate: this.getLocalDateString(startDate),
        endDate: this.getLocalDateString(endDate),
        mode: days === 365 ? 'calendar-year' : 'sliding-window'
      });

      // Use RPC function to get completion history for stocks (bypasses RLS)
      console.log('🔧 Calling RPC function with params:', {
        input_uuid: businessId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
      const { data: completions, error } = await this.supabase
        .rpc('get_habit_completions_for_stock', {
          input_uuid: businessId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      console.log('🔍 RPC Response:', { data: completions, error: error });

      if (error) {
        console.error('❌ Error fetching stock habit completions:', error);
        console.error('❌ Error details:', error.message, error.code, error.hint);
        // Fall back to direct query if RPC doesn't exist yet
        return this.getHabitCompletionHistoryFallback(businessId, startDate, endDate);
      }

      console.log('📊 Raw stock completion data:', completions);
      console.log('📈 Number of stock completion records found:', completions?.length || 0);
      
      if (!completions || completions.length === 0) {
        console.warn('⚠️ No completion data returned for business:', businessId);
        console.log('📝 Debugging - params sent:', {
          input_uuid: businessId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });
      }

      // Create date range array
      const dateRange: { date: string; completed: boolean; streakDay: number }[] = [];
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      let currentStreak = 0;

      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = this.getLocalDateString(currentDate);
        
        // Find completion for this date
        const completion = completions?.find((c: any) => {
          const completionDate = this.getLocalDateString(new Date(c.completed_at));
          return completionDate === dateStr;
        });
        
        const wasCompleted = !!completion;
        
        // Update streak
        if (wasCompleted) {
          currentStreak = completion.streak_count || currentStreak + 1;
        } else {
          currentStreak = 0;
        }
        
        dateRange.push({
          date: dateStr,
          completed: wasCompleted,
          streakDay: currentStreak
        });
      }

      console.log('✅ Generated stock date range with', dateRange.length, 'days');
      const completedDates = dateRange.filter(d => d.completed);
      console.log('🎯 Stock completed days:', completedDates.length);
      return dateRange;

    } catch (error) {
      console.error('💥 Error in getHabitCompletionHistoryForStock:', error);
      // Fall back to regular method as last resort
      console.log('🔄 Falling back to regular completion history method');
      return this.getHabitCompletionHistory(businessId, days);
    }
  }

  /**
   * Calculate reasonable earnings per completion to prevent extreme values
   */
  private calculateReasonableEarnings(basePay: number, goalValue: number): number {
    if (!goalValue || goalValue <= 0) {
      return basePay; // Default to base pay if goal value is invalid
    }

    const calculatedEarnings = basePay / goalValue;
    
    // Apply reasonable bounds:
    // - Never more than base pay (prevents inflated earnings from tiny goals)
    // - Never less than 1% of base pay (prevents earnings too small to be meaningful)
    const maxEarnings = basePay;
    const minEarnings = Math.max(0.01, basePay * 0.01);
    
    return Math.min(maxEarnings, Math.max(minEarnings, calculatedEarnings));
  }

  /**
   * Fallback method for getting completion history when RPC is not available
   */
  private async getHabitCompletionHistoryFallback(businessId: string, startDate: Date, endDate: Date): Promise<{ date: string; completed: boolean; streakDay: number }[]> {
    try {
      console.log('🔄 Using fallback method for completion history');
      
      // Try direct query (this might fail due to RLS but let's try)
      const { data: completions, error } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at, streak_count, habit_business_id')
        .eq('habit_business_id', businessId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('❌ Fallback query failed:', error);
        console.log('🚫 No demo data - returning empty array');
        return [];
      }

      console.log('📊 Fallback completion data:', completions?.length || 0, 'records');

      // If no data found, return empty array
      if (!completions || completions.length === 0) {
        console.log('📭 No completion data found - returning empty array');
        return [];
      }

      // Create date range array
      const dateRange: { date: string; completed: boolean; streakDay: number }[] = [];
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      let currentStreak = 0;

      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = this.getLocalDateString(currentDate);
        
        const completion = completions?.find((c: any) => {
          const completionDate = this.getLocalDateString(new Date(c.completed_at));
          return completionDate === dateStr;
        });
        
        const wasCompleted = !!completion;
        
        if (wasCompleted) {
          currentStreak = completion.streak_count || currentStreak + 1;
        } else {
          currentStreak = 0;
        }
        
        dateRange.push({
          date: dateStr,
          completed: wasCompleted,
          streakDay: currentStreak
        });
      }

      return dateRange;

    } catch (error) {
      console.error('💥 Error in fallback method:', error);
      return [];
    }
  }
}
