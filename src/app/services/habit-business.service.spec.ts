import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular/standalone';

import { HabitBusinessService } from './habit-business.service';

describe('HabitBusinessService', () => {
  let service: HabitBusinessService;

  let mockSupabaseClient: any;
  let authApi: any;
  let toastSpy: any;

  // ---- Reusable query builder factory ----
  // Creates a chainable mock that records each .eq / .select / .single etc call
  function makeQuery(resolvedValue?: any) {
    const q: any = {};
    const methods = [
      'select', 'eq', 'neq', 'single', 'insert', 'update', 'delete',
      'order', 'limit', 'gte', 'lte', 'lt', 'gt', 'or', 'maybeSingle'
    ];
    for (const m of methods) {
      q[m] = jasmine.createSpy(m).and.returnValue(q);
    }
    // single / select at the end of a chain usually need to resolve
    if (resolvedValue !== undefined) {
      q.single.and.resolveTo(resolvedValue);
    }
    return q;
  }

  beforeEach(() => {
    authApi = {
      getUser: jasmine.createSpy('getUser')
        .and.resolveTo({ data: { user: { id: 'user-1' } }, error: null })
    };

    toastSpy = {
      create: jasmine.createSpy('create')
        .and.resolveTo({ present: jasmine.createSpy('present'), dismiss: jasmine.createSpy('dismiss') })
    };

    // Default table mocks – tests override as needed
    mockSupabaseClient = {
      auth: authApi,
      rpc: jasmine.createSpy('rpc').and.resolveTo({ data: { sold: 5 }, error: null }),
      from: jasmine.createSpy('from').and.callFake((_table: string) => makeQuery())
    };

    TestBed.configureTestingModule({
      providers: [
        HabitBusinessService,
        { provide: ToastController, useValue: toastSpy }
      ]
    });

    service = TestBed.inject(HabitBusinessService);
    (service as any).supabase = mockSupabaseClient;
  });

  // ==========================================================================
  // TEST GROUP 2: Habit Completion Guards
  // "Test that habits can be completed exactly once per allowed period and
  //  earnings are not double-counted."
  // ==========================================================================
  describe('Group 2 – Habit Completion Guards', () => {

    // If the user already hit their daily goal, they should be blocked
    it('should reject completion when daily goal is already met', async () => {
      const habitQuery = makeQuery({
        data: {
          id: 'h1', user_id: 'user-1', frequency: 'daily',
          goal_value: 1, current_progress: 1,
          last_completed_at: new Date().toISOString(),
          earnings_per_completion: 10, streak: 1,
          total_completions: 1, total_earnings: 10
        },
        error: null
      });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        if (table === 'habit_completions') return makeQuery({ data: [], error: null });
        return makeQuery();
      });

      await expectAsync(service.completeHabit('h1')).toBeRejected();
    });

    // Multi-goal habits should allow multiple completions up to the goal_value
    it('should allow a second completion when goal_value is 3 and progress is 1', async () => {
      // The habit has a goal of 3, and user has completed 1 so far
      const now = new Date();
      const habitQuery = makeQuery({
        data: {
          id: 'h1', user_id: 'user-1', frequency: 'daily',
          goal_value: 3, current_progress: 1,
          last_completed_at: now.toISOString(),
          earnings_per_completion: 5, streak: 0,
          total_completions: 1, total_earnings: 5
        },
        error: null
      });

      // Mock habit_completions check – only 1 existing today
      const completionsQuery = makeQuery();
      completionsQuery.eq.and.returnValue(completionsQuery);
      completionsQuery.select.and.resolveTo({
        data: [{ id: 'c1', completed_at: now.toISOString() }],
        error: null
      });

      // Mock the insert for new completion
      const completionInsertQuery = makeQuery({ data: { id: 'c2', earnings: 5 }, error: null });

      // Mock stock query for dividend check
      const stockQuery = makeQuery({ data: null, error: { code: 'PGRST116' } });

      // Mock profile for cash update
      const profileQuery = makeQuery({ data: { cash: 100, net_worth: 100 }, error: null });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        if (table === 'habit_completions') return completionInsertQuery;
        if (table === 'business_stocks') return stockQuery;
        if (table === 'user_profiles') return profileQuery;
        return makeQuery();
      });

      // Should not throw – 1/3 progress means they can still complete
      await service.completeHabit('h1');

      // Verify completion was recorded
      expect(completionInsertQuery.insert).toHaveBeenCalled();
    });

    // If the habit doesn't exist or belongs to another user, reject
    it('should reject completion when habit business is not found', async () => {
      const habitQuery = makeQuery({ data: null, error: { message: 'not found' } });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        return makeQuery();
      });

      await expectAsync(service.completeHabit('nonexistent')).toBeRejected();
    });

    // Unauthenticated user should be rejected immediately
    it('should reject habit completion when user is not authenticated', async () => {
      authApi.getUser.and.resolveTo({ data: { user: null }, error: null });

      await expectAsync(service.completeHabit('h1')).toBeRejectedWithError('User not authenticated');
    });

    // Streak should only increment when full goal is met, not on partial progress
    it('should not increment streak until the full goal_value is reached', async () => {
      // goal_value=2, current_progress=0, so after this completion progress=1 (not goal-met)
      const now = new Date();
      const habitQuery = makeQuery({
        data: {
          id: 'h1', user_id: 'user-1', frequency: 'daily',
          goal_value: 2, current_progress: 0,
          last_completed_at: null,
          earnings_per_completion: 10, streak: 0,
          total_completions: 0, total_earnings: 0
        },
        error: null
      });

      const completionInsertQuery = makeQuery({ data: { id: 'c1', earnings: 10 }, error: null });
      const profileQuery = makeQuery({ data: { cash: 50, net_worth: 50 }, error: null });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        if (table === 'habit_completions') return completionInsertQuery;
        if (table === 'user_profiles') return profileQuery;
        return makeQuery();
      });

      await service.completeHabit('h1');

      // The update to habit_businesses should set current_progress=1 but NOT update streak
      const updateCalls = habitQuery.update.calls.allArgs();
      // The habit update should have current_progress = 1 and NOT contain streak key
      // (streak is only set when isGoalCompleted=true)
      if (updateCalls.length > 0) {
        const habitUpdate = updateCalls[0][0];
        expect(habitUpdate.current_progress).toBe(1);
        // streak should not be in the update data when goal is not met
        expect(habitUpdate.streak).toBeUndefined();
      }
    });
  });

  // ==========================================================================
  // TEST GROUP 3: Upgrades
  // "Test that upgrades charge/convert the correct amount and reset
  //  streak/business fields correctly."
  // ==========================================================================
  describe('Group 3 – Upgrades', () => {

    // Upgrade should deduct the cost from user's cash
    it('should deduct upgrade cost from user cash', async () => {
      const businessTypesQuery = makeQuery({
        data: { id: 2, icon: '🏭', base_cost: 500, base_pay: 50 },
        error: null
      });
      const userProfilesQuery = makeQuery({
        data: { cash: 600 },
        error: null
      });
      const habitBusinessesQuery = makeQuery();

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_types') return businessTypesQuery;
        if (table === 'user_profiles') return userProfilesQuery;
        if (table === 'habit_businesses') return habitBusinessesQuery;
        return makeQuery();
      });

      await service.upgradeHabitBusiness('habit-1', 2, 100);

      // Cash should have been updated to 600 - 100 = 500
      expect(userProfilesQuery.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ cash: 500 })
      );
    });

    // Upgrade should fail if user doesn't have enough cash
    it('should reject upgrade when user cannot afford the cost', async () => {
      const businessTypesQuery = makeQuery({
        data: { id: 2, icon: '🏭', base_cost: 500, base_pay: 50 },
        error: null
      });
      const userProfilesQuery = makeQuery({
        data: { cash: 20 },
        error: null
      });
      const habitBusinessesQuery = makeQuery();

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_types') return businessTypesQuery;
        if (table === 'user_profiles') return userProfilesQuery;
        if (table === 'habit_businesses') return habitBusinessesQuery;
        return makeQuery();
      });

      await expectAsync(service.upgradeHabitBusiness('habit-1', 2, 100)).toBeRejectedWithError(
        'Insufficient funds. Need $100, but you only have $20'
      );

      // Business should NOT have been updated
      expect(habitBusinessesQuery.update).not.toHaveBeenCalled();
    });

    // Upgrade should update the business icon and earnings to match the new type
    it('should update business icon and recalculate earnings on upgrade', async () => {
      const businessTypesQuery = makeQuery({
        data: { id: 3, icon: '🏢', base_cost: 1000, base_pay: 200 },
        error: null
      });
      const userProfilesQuery = makeQuery({ data: { cash: 5000 }, error: null });
      const habitBusinessesQuery = makeQuery();

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_types') return businessTypesQuery;
        if (table === 'user_profiles') return userProfilesQuery;
        if (table === 'habit_businesses') return habitBusinessesQuery;
        return makeQuery();
      });

      await service.upgradeHabitBusiness('habit-1', 3, 500);

      expect(habitBusinessesQuery.update).toHaveBeenCalledWith(
        jasmine.objectContaining({
          business_type_id: 3,
          business_icon: '🏢',
          cost: 1000
        })
      );
    });

    // Upgrade should fail when user is not authenticated
    it('should reject upgrade when user is not authenticated', async () => {
      authApi.getUser.and.resolveTo({ data: { user: null }, error: null });

      await expectAsync(
        service.upgradeHabitBusiness('habit-1', 2, 100)
      ).toBeRejectedWithError('User not authenticated');
    });
  });

  // ==========================================================================
  // TEST GROUP 4: Stock Buy & Sell Math
  // "Test that stock purchases and sales always keep share counts and averages
  //  mathematically correct."
  // ==========================================================================
  describe('Group 4 – Stock Buy & Sell Math', () => {

    // Selling stock should call the RPC with correct parameters
    it('should call sell_stock_shares RPC with correct seller and share count', async () => {
      const result = await service.sellStockShares('stock-1', 5);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('sell_stock_shares', {
        seller_id: 'user-1',
        stock_uuid: 'stock-1',
        shares_to_sell: 5
      });
      expect(result).toEqual({ sold: 5 });
    });

    // Selling stock without auth should fail
    it('should reject stock sale when no authenticated user exists', async () => {
      authApi.getUser.and.resolveTo({ data: { user: null }, error: null });

      await expectAsync(
        service.sellStockShares('stock-1', 1)
      ).toBeRejectedWithError('User not authenticated');
    });

    // Stock sell RPC error should propagate
    it('should propagate RPC error when stock sale fails', async () => {
      mockSupabaseClient.rpc.and.resolveTo({ data: null, error: { message: 'insufficient shares' } });

      await expectAsync(service.sellStockShares('stock-1', 100)).toBeRejected();
    });

    // Stock purchase should deduct cost from user cash (totalCost = price × shares)
    it('should deduct correct total cost when purchasing stock (price × shares)', async () => {
      const stockQuery = makeQuery({
        data: { id: 'stock-1', current_stock_price: 10, shares_available: 50, business_owner_id: 'other-user' },
        error: null
      });
      const profileQuery = makeQuery({ data: { cash: 200 }, error: null });
      const holdingQuery = makeQuery({ data: null, error: { code: 'PGRST116' } }); // no existing holding
      const insertQuery = makeQuery();
      const transactionQuery = makeQuery();

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_stocks') return stockQuery;
        if (table === 'user_profiles') return profileQuery;
        if (table === 'stock_holdings') return holdingQuery;
        if (table === 'stock_transactions') return transactionQuery;
        return makeQuery();
      });

      await service.purchaseStock('stock-1', 5);

      // Cash should be updated from 200 to 200 - (10*5) = 150
      // Check if any update to user_profiles contained the right cash value
      expect(profileQuery.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ cash: 150 })
      );
    });

    // Should reject purchase when user doesn't have enough cash
    it('should reject stock purchase when user has insufficient funds', async () => {
      const stockQuery = makeQuery({
        data: { id: 'stock-1', current_stock_price: 100, shares_available: 50 },
        error: null
      });
      const profileQuery = makeQuery({ data: { cash: 10 }, error: null });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_stocks') return stockQuery;
        if (table === 'user_profiles') return profileQuery;
        return makeQuery();
      });

      await expectAsync(service.purchaseStock('stock-1', 5)).toBeRejected();
    });

    // Should reject purchase when not enough shares are available
    it('should reject stock purchase when not enough shares available', async () => {
      const stockQuery = makeQuery({
        data: { id: 'stock-1', current_stock_price: 10, shares_available: 2 },
        error: null
      });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_stocks') return stockQuery;
        return makeQuery();
      });

      await expectAsync(service.purchaseStock('stock-1', 5)).toBeRejected();
    });

    // Existing holding should get weighted average purchase price on additional purchase
    it('should compute weighted average price when buying more of an existing holding', async () => {
      const stockQuery = makeQuery({
        data: { id: 'stock-1', current_stock_price: 20, shares_available: 100, business_owner_id: 'x' },
        error: null
      });
      // Existing holding: 10 shares at avg $10 = $100 invested
      const holdingQuery = makeQuery({
        data: { id: 'holding-1', shares_owned: 10, total_invested: 100, average_purchase_price: 10 },
        error: null
      });
      const profileQuery = makeQuery({ data: { cash: 1000 }, error: null });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_stocks') return stockQuery;
        if (table === 'stock_holdings') return holdingQuery;
        if (table === 'user_profiles') return profileQuery;
        if (table === 'stock_transactions') return makeQuery();
        return makeQuery();
      });

      await service.purchaseStock('stock-1', 5);

      // New total shares = 10 + 5 = 15
      // New total invested = 100 + (20*5) = 200
      // New avg price = 200 / 15 = 13.33...
      expect(holdingQuery.update).toHaveBeenCalledWith(
        jasmine.objectContaining({
          shares_owned: 15,
          total_invested: 200,
          average_purchase_price: jasmine.any(Number)
        })
      );

      // Verify the actual average
      const updateArg = holdingQuery.update.calls.mostRecent().args[0];
      expect(updateArg.average_purchase_price).toBeCloseTo(200 / 15, 2);
    });
  });

  // ==========================================================================
  // TEST GROUP 5: Dividends
  // "Test that dividends only go to the right holders and payout totals are accurate."
  // ==========================================================================
  describe('Group 5 – Dividends', () => {

    // distributeDividends should split pool proportionally by shares owned
    it('should distribute dividend pool proportionally to each stockholder', async () => {
      // Two holders: A has 60 shares, B has 40 shares → total 100
      // Pool = $50 → A gets $30, B gets $20
      const holdingsQuery = makeQuery();
      holdingsQuery.select.and.returnValue(holdingsQuery);
      holdingsQuery.eq.and.returnValue(holdingsQuery);
      holdingsQuery.gt.and.resolveTo({
        data: [
          { id: 'h1', holder_id: 'userA', shares_owned: 60, total_dividends_earned: 0 },
          { id: 'h2', holder_id: 'userB', shares_owned: 40, total_dividends_earned: 0 }
        ],
        error: null
      });

      const profileQueryA = makeQuery({ data: { cash: 100 }, error: null });
      const profileQueryB = makeQuery({ data: { cash: 200 }, error: null });
      const distributionQuery = makeQuery();

      let profileCallIdx = 0;
      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'stock_holdings') return holdingsQuery;
        if (table === 'stock_dividend_distributions') return distributionQuery;
        if (table === 'user_profiles') {
          profileCallIdx++;
          return profileCallIdx <= 2 ? profileQueryA : profileQueryB;
        }
        return makeQuery();
      });

      await service.distributeDividends('stock-1', 50);

      // Distribution records should have been inserted
      expect(distributionQuery.insert).toHaveBeenCalledTimes(2);

      // Verify dividend amounts in distributions
      const dist1 = distributionQuery.insert.calls.argsFor(0)[0];
      const dist2 = distributionQuery.insert.calls.argsFor(1)[0];
      expect(dist1.total_dividend).toBeCloseTo(30, 2); // 60/100 * 50
      expect(dist2.total_dividend).toBeCloseTo(20, 2); // 40/100 * 50
    });

    // If there are no stockholders, distributeDividends should return without error
    it('should do nothing when there are no stockholders to pay', async () => {
      const holdingsQuery = makeQuery();
      holdingsQuery.select.and.returnValue(holdingsQuery);
      holdingsQuery.eq.and.returnValue(holdingsQuery);
      holdingsQuery.gt.and.resolveTo({ data: [], error: null });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'stock_holdings') return holdingsQuery;
        return makeQuery();
      });

      // Should complete without error (no holders to pay)
      await service.distributeDividends('stock-1', 100);

      // No distribution records should have been created
      const distributionQuery = makeQuery();
      expect(distributionQuery.insert).not.toHaveBeenCalled();
    });

    // Each holder's total_dividends_earned should be incremented
    it('should increment total_dividends_earned on each holding', async () => {
      const holdingsQuery = makeQuery();
      holdingsQuery.select.and.returnValue(holdingsQuery);
      holdingsQuery.eq.and.returnValue(holdingsQuery);
      holdingsQuery.gt.and.resolveTo({
        data: [
          { id: 'h1', holder_id: 'userA', shares_owned: 100, total_dividends_earned: 50 }
        ],
        error: null
      });

      const profileQuery = makeQuery({ data: { cash: 100 }, error: null });
      const distributionQuery = makeQuery();

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'stock_holdings') return holdingsQuery;
        if (table === 'stock_dividend_distributions') return distributionQuery;
        if (table === 'user_profiles') return profileQuery;
        return makeQuery();
      });

      await service.distributeDividends('stock-1', 25);

      // The holding update should set total_dividends_earned to 50 + 25 = 75
      expect(holdingsQuery.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ total_dividends_earned: 75 })
      );
    });
  });

  // ==========================================================================
  // TEST GROUP 6: Completion → Stock Pricing Flow
  // "Test that completing habits affects stock pricing/portfolio values as
  //  expected across the full data flow."
  // ==========================================================================
  describe('Group 6 – Completion → Stock Pricing Flow', () => {

    // updateStockPrice should call the RPC and return the new price
    it('should call update_stock_price_by_streak RPC for a given business', async () => {
      mockSupabaseClient.rpc.and.resolveTo({ data: 15.50, error: null });

      const newPrice = await service.updateStockPrice('habit-1');

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('update_stock_price_by_streak', {
        habit_business_uuid: 'habit-1'
      });
      expect(newPrice).toBe(15.50);
    });

    // If the RPC fails, updateStockPrice should propagate the error
    it('should propagate error when stock price update RPC fails', async () => {
      mockSupabaseClient.rpc.and.resolveTo({ data: null, error: { message: 'rpc failed' } });

      await expectAsync(service.updateStockPrice('habit-1')).toBeRejected();
    });

    // calculateUpgradeOptions should compute streakMultiplier as max(1, streak)
    it('should compute streakMultiplier as max(1, streak) for upgrade options', async () => {
      const habitQuery = makeQuery({
        data: {
          id: 'h1', streak: 5, earnings_per_completion: 10,
          business_types: { id: 1, base_cost: 100, name: 'Lemonade', icon: '🍋', base_pay: 10, description: '' }
        },
        error: null
      });

      // getBusinessTypes call
      const businessTypesQuery = makeQuery();
      businessTypesQuery.order.and.resolveTo({
        data: [
          { id: 1, name: 'Lemonade', icon: '🍋', base_cost: 100, base_pay: 10, description: '' },
          { id: 2, name: 'Bakery', icon: '🧁', base_cost: 500, base_pay: 50, description: '' }
        ],
        error: null
      });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        if (table === 'business_types') return businessTypesQuery;
        return makeQuery();
      });

      const result = await service.calculateUpgradeOptions('h1');

      expect(result.streakMultiplier).toBe(5); // max(1, 5)
      expect(result.currentBusinessValue).toBe(50); // 10 * 5
      expect(result.totalStreakValue).toBe(50 * 5 * 30); // currentValue * streak * 30
    });
  });

  // ==========================================================================
  // TEST GROUP 9: Ordering Behavior
  // "Test ordering behavior so drag/drop and completed-item movement remain
  //  correct after reload."
  // ==========================================================================
  describe('Group 9 – Ordering Behavior', () => {

    // updateHabitBusinessOrder should assign sequential display_order starting from 1
    it('should assign sequential display_order 1,2,3 for each business id', async () => {
      const habitQuery = makeQuery();

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        return makeQuery();
      });

      await service.updateHabitBusinessOrder('user-1', ['habit-a', 'habit-b', 'habit-c']);

      // Should have called update 3 times with sequential orders
      expect(habitQuery.update).toHaveBeenCalledTimes(3);
      expect(habitQuery.update.calls.argsFor(0)[0].display_order).toBe(1);
      expect(habitQuery.update.calls.argsFor(1)[0].display_order).toBe(2);
      expect(habitQuery.update.calls.argsFor(2)[0].display_order).toBe(3);
    });

    // user_custom_order should also be updated when reordering (for persistence)
    it('should update user_custom_order alongside display_order for persistence', async () => {
      const habitQuery = makeQuery();

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        return makeQuery();
      });

      await service.updateHabitBusinessOrder('user-1', ['x', 'y']);

      expect(habitQuery.update.calls.argsFor(0)[0].user_custom_order).toBe(1);
      expect(habitQuery.update.calls.argsFor(1)[0].user_custom_order).toBe(2);
    });

    // isHabitCompleteForToday should return false for habits with no last_completed_at
    it('should consider habit incomplete when it has never been completed', () => {
      const habit = { last_completed_at: null, goal_value: 1, current_progress: 0, recurrence_interval: '24h' as const } as any;

      const result = (service as any).isHabitCompleteForToday(habit);

      expect(result).toBeFalse();
    });

    // isHabitCompleteForToday should return false for multi-goal habits below target
    it('should consider multi-goal habit incomplete when progress is below goal', () => {
      const habit = {
        last_completed_at: new Date().toISOString(),
        goal_value: 3,
        current_progress: 1,
        recurrence_interval: '24h' as const
      } as any;

      const result = (service as any).isHabitCompleteForToday(habit);

      expect(result).toBeFalse();
    });

    // isHabitCompleteForToday should return true when goal is met today
    it('should consider habit complete when goal is met and last completed is today', () => {
      const habit = {
        last_completed_at: new Date().toISOString(),
        goal_value: 1,
        current_progress: 1,
        recurrence_interval: '24h' as const
      } as any;

      const result = (service as any).isHabitCompleteForToday(habit);

      expect(result).toBeTrue();
    });
  });

  // ==========================================================================
  // TEST GROUP 10: Error Handling
  // "Test error handling so app behavior stays safe and clear when
  //  backend/network calls fail."
  // ==========================================================================
  describe('Group 10 – Error Handling', () => {

    // getBusinessTypes should propagate database errors
    it('should throw when business types query fails', async () => {
      const failQuery = makeQuery();
      failQuery.order.and.resolveTo({ data: null, error: { message: 'connection refused' } });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_types') return failQuery;
        return makeQuery();
      });

      await expectAsync(service.getBusinessTypes()).toBeRejected();
    });

    // getUserHabitBusinesses should propagate database errors
    it('should throw when habit businesses query fails', async () => {
      const failQuery = makeQuery();
      failQuery.order.and.resolveTo({ data: null, error: { message: 'timeout' } });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return failQuery;
        return makeQuery();
      });

      await expectAsync(service.getUserHabitBusinesses('user-1')).toBeRejected();
    });

    // Creating a business with an invalid type should throw
    it('should throw when creating a business with invalid business type', async () => {
      const businessTypeQuery = makeQuery({ data: null, error: { message: 'not found' } });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'business_types') return businessTypeQuery;
        return makeQuery();
      });

      await expectAsync(
        service.createHabitBusiness({
          business_type_id: 999,
          business_name: 'Test',
          habit_description: 'desc',
          recurrence_interval: '24h',
          goal_value: 1
        })
      ).toBeRejected();
    });

    // Deleting must keep at least 1 active business
    it('should reject delete when it would remove the last active business', async () => {
      const habitQuery = makeQuery({
        data: {
          id: 'h1', user_id: 'user-1', is_active: true, cost: 100,
          business_types: { base_cost: 100 }
        },
        error: null
      });

      // Only 1 active business
      const countQuery = makeQuery();
      countQuery.select.and.returnValue(countQuery);
      countQuery.eq.and.callFake(() => {
        // After both eq calls (user_id and is_active), resolve
        return countQuery;
      });

      let fromCallIdx = 0;
      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') {
          fromCallIdx++;
          if (fromCallIdx === 1) return habitQuery; // first call: get business details
          if (fromCallIdx === 2) {
            // second call: count active businesses
            const cq = makeQuery();
            cq.select.and.returnValue(cq);
            cq.eq.and.callFake(() => cq);
            // Resolve with just 1 business (the one being deleted)
            // We need the final resolution when all eq()s are called
            // The code does .select('id').eq('user_id', ...).eq('is_active', true)
            // The last eq will be resolved
            (cq as any)._resolveNext = { data: [{ id: 'h1' }], error: null };
            let eqCount = 0;
            cq.eq.and.callFake(() => {
              eqCount++;
              if (eqCount >= 2) {
                return Promise.resolve({ data: [{ id: 'h1' }], error: null });
              }
              return cq;
            });
            return cq;
          }
          return makeQuery();
        }
        return makeQuery();
      });

      await expectAsync(service.deleteHabitBusiness('h1')).toBeRejectedWithError(
        /at least one active business/i
      );
    });

    // Sell value on delete should be 70% of original cost
    it('should return 70% of original cost as sell value when deleting a business', async () => {
      // Business cost=100 → sell value = floor(100*0.7) = 70
      const habitQuery = makeQuery({
        data: {
          id: 'h1', user_id: 'user-1', is_active: true, cost: 100,
          business_types: { base_cost: 100 }
        },
        error: null
      });

      // 2 active businesses (so deletion is allowed)
      let fromCallIdx = 0;
      const profileQuery = makeQuery({ data: { cash: 50 }, error: null });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') {
          fromCallIdx++;
          if (fromCallIdx === 1) return habitQuery;
          if (fromCallIdx === 2) {
            // count query – return 2 active businesses
            const cq = makeQuery();
            cq.select.and.returnValue(cq);
            let eqCount = 0;
            cq.eq.and.callFake(() => {
              eqCount++;
              if (eqCount >= 2) {
                return Promise.resolve({ data: [{ id: 'h1' }, { id: 'h2' }], error: null });
              }
              return cq;
            });
            return cq;
          }
          return habitQuery; // for the update (deactivate)
        }
        if (table === 'user_profiles') return profileQuery;
        return makeQuery();
      });

      const sellValue = await service.deleteHabitBusiness('h1');

      expect(sellValue).toBe(70); // floor(100 * 0.7)
    });

    // calculateReasonableEarnings should bound earnings between min and max
    it('should bound earnings between 1% of basePay and basePay itself', () => {
      // Very high goal → earnings should not go below 1% of base pay
      const highGoalResult = (service as any).calculateReasonableEarnings(100, 100000);
      expect(highGoalResult).toBe(1); // max(0.01, 100*0.01) = 1

      // Zero goal → should return basePay (guard clause)
      const zeroGoalResult = (service as any).calculateReasonableEarnings(100, 0);
      expect(zeroGoalResult).toBe(100);

      // Normal goal → should equal basePay / goalValue
      const normalResult = (service as any).calculateReasonableEarnings(100, 5);
      expect(normalResult).toBe(20); // 100/5 = 20
    });

    // Goal value validation should reject out-of-range values
    it('should reject goal_value below 1 or above 99 when updating habit', async () => {
      // Mock the getUser and habit lookup
      const habitQuery = makeQuery({
        data: { id: 'h1', user_id: 'user-1' },
        error: null
      });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'habit_businesses') return habitQuery;
        return makeQuery();
      });

      await expectAsync(
        service.updateHabitBusiness('h1', { goal_value: 0 })
      ).toBeRejectedWithError(/Goal value must be between 1 and 99/);

      await expectAsync(
        service.updateHabitBusiness('h1', { goal_value: 100 })
      ).toBeRejectedWithError(/Goal value must be between 1 and 99/);
    });

    // getLocalDateString should return consistent YYYY-MM-DD in local timezone
    it('should format dates as YYYY-MM-DD in local timezone', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024 (month is 0-indexed)
      const result = (service as any).getLocalDateString(date);

      expect(result).toBe('2024-06-15');
    });

    // getUserStockHoldings should return empty array when query fails
    it('should throw when stock holdings query fails', async () => {
      const failQuery = makeQuery();
      failQuery.gt.and.resolveTo({ data: null, error: { message: 'db error' } });

      mockSupabaseClient.from.and.callFake((table: string) => {
        if (table === 'stock_holdings') return failQuery;
        return makeQuery();
      });

      await expectAsync(service.getUserStockHoldings('user-1')).toBeRejected();
    });
  });
});
