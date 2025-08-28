import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonIcon, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { HabitBusinessService } from '../services/habit-business.service';
import { addIcons } from 'ionicons';
import { checkmarkCircle, alertCircle, refresh, logOut, home, cash, cafe, wallet } from 'ionicons/icons';

@Component({
  selector: 'app-dev-tools',
  templateUrl: 'dev-tools.page.html',
  styleUrls: ['dev-tools.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonIcon, CommonModule, RouterLink],
})
export class DevToolsPage {
  dbTestResult: any = null;
  authTestResult: any = null;
  isTestingDb = false;
  isTestingAuth = false;
  isTestingDividends = false;
  isFixingStockPrices = false;
  isFixingLemonadeStocks = false;
  isAddingMoney = false;
  currentUser: any = null;
  userProfile: any = null;
  dividendTestResult: any = null;

  constructor(
    private authService: AuthService, 
    private habitBusinessService: HabitBusinessService, 
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ checkmarkCircle, alertCircle, refresh, logOut, home, cash, cafe, wallet });
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    try {
      const { data: { user } } = await this.authService.getUser();
      console.log('Current user from auth:', user);
      this.currentUser = user;
      
      // Try to load user profile if user exists
      if (user) {
        try {
          console.log('Attempting to load profile for user ID:', user.id);
          this.userProfile = await this.authService.getUserProfile(user.id);
          console.log('Loaded user profile:', this.userProfile);
        } catch (error) {
          console.error('Profile loading failed:', error);
          // Try to create profile manually if it doesn't exist
          try {
            console.log('Attempting to create profile manually...');
            await this.authService.createUserProfile(
              user.id, 
              user.email!, 
              user.user_metadata?.['name'] || user.email!.split('@')[0]
            );
            // Try loading again
            this.userProfile = await this.authService.getUserProfile(user.id);
            console.log('Created and loaded profile:', this.userProfile);
          } catch (createError) {
            console.error('Profile creation failed:', createError);
          }
        }
      }
    } catch (error) {
      console.log('No user logged in');
    }
  }

  async testDatabaseConnection() {
    this.isTestingDb = true;
    this.dbTestResult = null;
    
    try {
      this.dbTestResult = await this.authService.testConnection();
    } catch (error) {
      this.dbTestResult = { success: false, message: 'Test failed', error };
    }
    
    this.isTestingDb = false;
  }

  async testAuthSystem() {
    this.isTestingAuth = true;
    this.authTestResult = null;
    
    try {
      this.authTestResult = await this.authService.testAuthConnection();
    } catch (error) {
      this.authTestResult = { success: false, message: 'Auth test failed', error };
    }
    
    this.isTestingAuth = false;
  }

  async runAllTests() {
    await this.testDatabaseConnection();
    await this.testAuthSystem();
  }

  async logout() {
    try {
      await this.authService.signOut();
      alert('👋 Successfully logged out!');
      this.router.navigate(['/login']);
    } catch (error) {
      alert('❌ Logout failed: ' + (error as Error).message);
    }
  }

  async refreshProfile() {
    await this.loadCurrentUser();
    alert('🔄 Profile refreshed!');
  }

  // Force create profile for current user
  async forceCreateProfile() {
    try {
      console.log('🔄 Force creating profile...');
      const profile = await this.authService.forceCreateCurrentUserProfile();
      console.log('✅ Profile force created:', profile);
      
      // Reload user data
      await this.loadCurrentUser();
      
      alert('✅ Profile created successfully!\n\nName: ' + profile.name + '\nCash: $' + profile.cash + '\nNet Worth: $' + profile.net_worth);
    } catch (error) {
      console.error('❌ Force profile creation failed:', error);
      alert('❌ Profile creation failed: ' + error);
    }
  }

  // Add method to check all profiles in database
  async checkAllProfiles() {
    console.log('🔍 Checking all profiles in database...');
    try {
      const allProfiles = await this.authService.getAllProfiles();
      console.log('All profiles found:', allProfiles);
      
      const allUsers = await this.authService.getAllAuthUsers();
      console.log('All auth users found:', allUsers);
      
      // Check current auth user
      const { data: { user } } = await this.authService.getUser();
      console.log('Current auth user:', user);
      
      // Show detailed profile info
      let profileDetails = '';
      if (allProfiles && allProfiles.length > 0) {
        profileDetails = allProfiles.map((profile: any) => {
          const isCurrentUser = user && profile.id === user.id ? ' (THIS IS YOU!)' : '';
          return `ID: ${profile.id}${isCurrentUser}\nEmail: ${profile.email}\nName: ${profile.name}\nCash: $${profile.cash}\nCreated: ${profile.created_at}`;
        }).join('\n\n');
      }
      
      const currentUserInfo = user ? `\nCurrent User ID: ${user.id}\nCurrent User Email: ${user.email}` : '\nNo current user logged in';
      
      alert(`Found ${allProfiles?.length || 0} profiles and ${allUsers?.length || 0} auth users.\n\nProfile Details:\n${profileDetails}${currentUserInfo}\n\nCheck console for more details.`);
    } catch (error) {
      console.error('Error checking profiles:', error);
      alert('Error checking profiles: ' + error);
    }
  }

  async deleteAccount() {
    if (!this.currentUser) {
      alert('No user logged in');
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to PERMANENTLY delete your account?\n\nThis will:\n- Delete your profile data\n- Delete your authentication account\n- Sign you out completely\n- Cannot be undone\n\nContinue?`
    );
    
    if (!confirmDelete) return;

    try {
      console.log('🗑️ Starting complete account deletion...');
      
      // Use the new server-side delete function
      console.log('Calling server-side delete function...');
      const { error: deleteError } = await this.authService.deleteAuthUser();
      
      if (deleteError) {
        console.error('❌ Server-side deletion failed:', deleteError);
        
        // Fallback: Delete just the profile and sign out
        console.log('Falling back to profile deletion only...');
        await this.authService.deleteUserProfile(this.currentUser.id);
        await this.authService.signOut();
        
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();
        this.currentUser = null;
        this.userProfile = null;
        
        alert('Profile deleted and signed out successfully!\n\nNote: Complete auth account deletion failed. You may be able to log in again.\n\nFor complete deletion, contact support or delete manually from Supabase dashboard.');
      } else {
        console.log('✅ Complete account deletion successful');
        
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();
        this.currentUser = null;
        this.userProfile = null;
        
        alert('Account completely deleted! You cannot log in with these credentials anymore.');
      }
      
      // Navigate to login page
      this.router.navigate(['/login']);
      
    } catch (error) {
      console.error('❌ Account deletion failed:', error);
      alert('Account deletion failed: ' + error);
    }
  }

  // Debug function to check habit business status
  async debugHabitBusinesses() {
    if (!this.currentUser) {
      alert('No user logged in');
      return;
    }

    try {
      console.log('🔍 Debugging habit businesses...');
      
      // Get all habit businesses
      const habitBusinesses = await this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
      console.log('All habit businesses:', habitBusinesses);
      
      // Check which habits need reset
      const habitsNeedingReset = await this.habitBusinessService.checkUserHabitsNeedReset(this.currentUser.id);
      console.log('Habits needing reset:', habitsNeedingReset);
      
      // Get today's earnings
      const todaysEarnings = await this.habitBusinessService.getTodaysActualEarnings(this.currentUser.id);
      console.log('Today\'s actual earnings:', todaysEarnings);
      
      // Show debug info
      let debugInfo = `Found ${habitBusinesses.length} habit businesses:\n\n`;
      
      habitBusinesses.forEach((hb: any) => {
        debugInfo += `${hb.business_name} (${hb.frequency}):\n`;
        debugInfo += `  Progress: ${hb.current_progress || 0}/${hb.goal_value || 1}\n`;
        debugInfo += `  Last completed: ${hb.last_completed_at || 'never'}\n`;
        debugInfo += `  Streak: ${hb.streak || 0}\n`;
        debugInfo += `  Earnings per completion: $${hb.earnings_per_completion}\n\n`;
      });
      
      debugInfo += `Today's actual earnings: $${todaysEarnings}\n\n`;
      
      if (habitsNeedingReset.length > 0) {
        debugInfo += `Habits needing reset: ${habitsNeedingReset.length}\n`;
        habitsNeedingReset.forEach((habit: any) => {
          debugInfo += `  ${habit.business_name} (last completed: ${habit.last_completed_date})\n`;
        });
      } else {
        debugInfo += 'No habits need reset.\n';
      }
      
      alert(debugInfo);
      
    } catch (error) {
      console.error('Error debugging habit businesses:', error);
      alert('Error debugging habit businesses: ' + error);
    }
  }

  // Test the reset function
  async testResetOutdatedHabits() {
    try {
      console.log('🔄 Testing reset outdated habits function...');
      await this.habitBusinessService.resetOutdatedDailyHabits();
      await this.showToast('✅ Reset outdated habits test completed!', 'success');
    } catch (error) {
      console.error('❌ Reset outdated habits test failed:', error);
      await this.showToast('❌ Reset outdated habits test failed', 'danger');
    }
  }

  async cleanupAllHabits() {
    try {
      console.log('🚨 Starting emergency cleanup of all habit duplicates...');
      
      if (!this.currentUser) {
        await this.showToast('❌ User not authenticated', 'danger');
        return;
      }
      
      // Get all user's habits
      const habits = await this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
      
      if (habits && habits.length > 0) {
        let totalCleaned = 0;
        
        for (const habit of habits) {
          console.log(`🧹 Cleaning habit: ${habit.business_name}`);
          await this.habitBusinessService.cleanupHabitCompletions(habit.id);
          totalCleaned++;
        }
        
        await this.showToast(`✅ Cleaned up ${totalCleaned} habits successfully!`, 'success');
        console.log(`✅ Emergency cleanup completed for ${totalCleaned} habits`);
      } else {
        await this.showToast('ℹ️ No habits found to clean up', 'warning');
      }
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      await this.showToast('❌ Emergency cleanup failed', 'danger');
    }
  }

  async testDividendProcessing() {
    if (!this.currentUser) {
      await this.showToast('No user logged in', 'danger');
      return;
    }

    this.isTestingDividends = true;
    this.dividendTestResult = null;

    try {
      console.log('🧪 Testing dividend processing...');
      
      // Get comprehensive dividend debug info
      const debugInfo = await this.habitBusinessService.getDividendSystemDebugInfo(this.currentUser.id);
      console.log('📊 Dividend system debug info:', debugInfo);
      
      if (debugInfo.userHoldings.length === 0) {
        // User has no stock holdings - create a test dividend to verify the display works
        console.log('💡 No stock holdings found. Creating test dividend...');
        await this.habitBusinessService.createTestDividend(this.currentUser.id, 7.50);
        
        // Refresh dividend info
        const updatedDividends = await this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
        
        this.dividendTestResult = {
          success: true,
          message: 'Test dividend created successfully',
          details: {
            testType: 'Created test dividend (no holdings)',
            testAmount: 7.50,
            newTotalDividends: updatedDividends,
            userHoldings: debugInfo.userHoldings.length,
            ownedBusinessStocks: debugInfo.ownedBusinessStocks.length,
            recentDistributions: debugInfo.recentDividendDistributions.length
          }
        };
      } else {
        // User has holdings - test with real dividend processing
        const habits = await this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
        console.log('Found habits:', habits);
        
        if (habits.length === 0) {
          throw new Error('No habit businesses found for testing');
        }
        
        // Get the first habit for testing
        const testHabit = habits[0];
        console.log('Testing with habit:', testHabit);
        
        // Get stock info for this habit
        const stocks = await this.habitBusinessService.getAvailableStocks(this.currentUser.id);
        const stockInfo = stocks.find(s => s.habit_business_id === testHabit.id);
        
        if (!stockInfo) {
          throw new Error('No stock information found for test habit');
        }
        
        console.log('Stock info:', stockInfo);
        
        // Get holdings for this specific stock
        const specificHoldings = debugInfo.userHoldings.filter(h => h.stock_id === stockInfo.id);
        console.log('Holdings for this stock:', specificHoldings);
        
        // Get today's dividends before test
        const dividendsBefore = debugInfo.todaysDividends;
        console.log('Dividends before test:', dividendsBefore);
        
        // Simulate a habit completion dividend processing
        if (specificHoldings.length > 0) {
          console.log('🔧 Running manual dividend processing test...');
          await this.habitBusinessService.processDividendsManually(
            testHabit.id, 
            testHabit.earnings_per_completion, 
            stockInfo.id
          );
          
          // Get dividends after test
          const dividendsAfter = await this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
          console.log('Dividends after test:', dividendsAfter);
          
          this.dividendTestResult = {
            success: true,
            message: 'Dividend processing test completed',
            details: {
              testHabit: testHabit.business_name,
              stockId: stockInfo.id,
              holdingsCount: specificHoldings.length,
              dividendsBefore,
              dividendsAfter,
              dividendsDifference: dividendsAfter - dividendsBefore,
              userHoldings: debugInfo.userHoldings.length,
              ownedBusinessStocks: debugInfo.ownedBusinessStocks.length
            }
          };
        } else {
          this.dividendTestResult = {
            success: false,
            message: 'No stockholders found for testing - creating test dividend instead',
            details: {
              testHabit: testHabit.business_name,
              stockId: stockInfo.id,
              allHoldings: debugInfo.userHoldings.length,
              specificHoldings: specificHoldings.length,
              ownedBusinessStocks: debugInfo.ownedBusinessStocks.length
            }
          };
          
          // Create a test dividend anyway
          await this.habitBusinessService.createTestDividend(this.currentUser.id, 12.34);
        }
      }

      await this.showToast('Dividend test completed - check console for details', 'success');
      
    } catch (error) {
      console.error('❌ Dividend test failed:', error);
      this.dividendTestResult = {
        success: false,
        message: `Test failed: ${(error as any)?.message || 'Unknown error'}`,
        details: {
          error: error
        }
      };
      await this.showToast(`Dividend test failed: ${(error as any)?.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isTestingDividends = false;
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  async fixStockPrices() {
    this.isFixingStockPrices = true;
    try {
      console.log('🔧 Starting stock price fix...');
      await this.habitBusinessService.fixAllStockPrices();
      await this.showToast('✅ All stock prices have been updated!', 'success');
      console.log('✅ Stock price fix completed successfully');
    } catch (error) {
      console.error('❌ Stock price fix failed:', error);
      await this.showToast(`❌ Failed to fix stock prices: ${(error as any)?.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isFixingStockPrices = false;
    }
  }

  async fixLemonadeStockPrices() {
    this.isFixingLemonadeStocks = true;
    try {
      console.log('🍋 Starting lemonade stock price fix...');
      await this.habitBusinessService.fixLemonadeStockPrices();
      await this.showToast('🍋 Lemonade stock prices fixed! ($100 → $1)', 'success');
      console.log('✅ Lemonade stock price fix completed successfully');
    } catch (error) {
      console.error('❌ Lemonade stock price fix failed:', error);
      await this.showToast(`❌ Failed to fix lemonade prices: ${(error as any)?.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isFixingLemonadeStocks = false;
    }
  }

  /**
   * Debug a specific habit's state and completion records
   */
  async debugSpecificHabit() {
    if (!this.currentUser) {
      await this.showToast('❌ User not authenticated', 'danger');
      return;
    }

    try {
      // Get all user's habits first
      const habits = await this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
      
      if (!habits || habits.length === 0) {
        await this.showToast('ℹ️ No habits found', 'warning');
        return;
      }

      // For demo, debug the first habit (usually the problematic one)
      const habitToDebug = habits[0];
      
      console.log('🔍 Starting habit debug for:', habitToDebug.business_name);
      
      const debugResult = await this.habitBusinessService.debugHabitState(habitToDebug.id);
      
      // Show summary in alert
      const summary = `Debug Results for "${habitToDebug.business_name}":

Current State:
- Progress: ${debugResult.habitBusiness.current_progress || 0}/${debugResult.habitBusiness.goal_value || 1}
- Last Completed: ${debugResult.habitBusiness.last_completed_at || 'Never'}
- Streak: ${debugResult.habitBusiness.streak || 0}

Today's Info:
- Local Date: ${debugResult.dateInfo.todayLocal}
- UTC Date: ${debugResult.dateInfo.todayUTC}
- Timezone: ${debugResult.dateInfo.timezone}

Completions Found:
- All Time: ${debugResult.allCompletions?.length || 0} records
- Today (time range): ${debugResult.todayCompletions?.length || 0} records
- Today (date string): ${debugResult.todayCompletionsByDate?.length || 0} records

UI Method Results:
- isCompletedToday: ${debugResult.uiResults.isCompletedToday}
- isGoalCompleted: ${debugResult.uiResults.isGoalCompleted}

Check console for detailed logs.`;

      alert(summary);
      await this.showToast('✅ Habit debug completed - check console and alert', 'success');
      
    } catch (error) {
      console.error('❌ Habit debug failed:', error);
      await this.showToast(`❌ Habit debug failed: ${(error as any)?.message}`, 'danger');
    }
  }

  /**
   * Add $1,000,000 test money for debugging and testing purchases
   */
  async addTestMoney() {
    this.isAddingMoney = true;
    try {
      console.log('💰 Starting add test money process...');
      
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      // Get current user profile to calculate new amounts (fresh from database)
      console.log('📊 Fetching current profile from database...');
      const currentProfile = await this.authService.getUserProfile(this.currentUser.id);
      console.log('📊 Current profile data:', currentProfile);
      
      const currentCash = currentProfile?.cash || 0;
      const newCash = currentCash + 1000000;

      console.log(`💰 Current cash: $${currentCash.toLocaleString()}, adding $1,000,000 = new cash: $${newCash.toLocaleString()}`);

      // Calculate correct net worth: new cash + business value
      console.log('🏢 Calculating business value for net worth...');
      let businessValue = 0;
      try {
        const { data: habitBusinesses, error: businessError } = await this.authService.supabase
          .from('habit_businesses')
          .select(`
            id, 
            business_type_id,
            business_types(base_cost)
          `)
          .eq('user_id', this.currentUser.id);

        if (businessError) {
          console.error('❌ Business query error:', businessError);
          throw businessError;
        }

        if (habitBusinesses && habitBusinesses.length > 0) {
          console.log(`🏢 Found ${habitBusinesses.length} businesses:`, habitBusinesses);
          businessValue = habitBusinesses.reduce((total, business: any) => {
            const baseCost = business.business_types?.base_cost || 0;
            const currentValue = baseCost * 0.7; // 70% sell value like social service
            console.log(`  - Business ${business.id}: base_cost=${baseCost}, value=${currentValue}`);
            return total + currentValue;
          }, 0);
          console.log(`🏢 Total business value: $${businessValue.toLocaleString()}`);
        } else {
          console.log('🏢 No businesses found for user');
        }
      } catch (error) {
        console.error('⚠️ Error calculating business value:', error);
      }

      const calculatedNetWorth = newCash + businessValue;
      console.log(`📈 Calculated net worth: $${newCash.toLocaleString()} (cash) + $${businessValue.toLocaleString()} (business) = $${calculatedNetWorth.toLocaleString()}`);

      // Update both cash and net worth
      console.log('💾 Updating database (cash and net worth)...');
      const { data: updateResult, error } = await this.authService.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          net_worth: calculatedNetWorth,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id)
        .select();

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Database update result:', updateResult);

      // Refresh user profile to show new amounts (fresh from database)
      console.log('🔄 Refreshing profile data...');
      await this.loadCurrentUser();
      
      const updatedCash = this.userProfile?.cash || 0;
      const updatedNetWorth = this.userProfile?.net_worth || 0;
      
      console.log(`✅ Updated profile - Cash: $${updatedCash.toLocaleString()}, Net Worth: $${updatedNetWorth.toLocaleString()}`);
      
      await this.showToast(`💰 Added $1M! Cash: $${updatedCash.toLocaleString()}, Net Worth: $${updatedNetWorth.toLocaleString()} 🚀`, 'success');
      console.log(`✅ Test money operation completed successfully`);
    } catch (error) {
      console.error('❌ Failed to add test money:', error);
      await this.showToast(`❌ Failed to add test money: ${(error as any)?.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isAddingMoney = false;
    }
  }
}
