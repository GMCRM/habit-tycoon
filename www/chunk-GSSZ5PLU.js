import {
  Injectable,
  SupabaseService,
  ToastController,
  inject,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-AYR3XDH5.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-QXFS4N4X.js";

// src/app/services/habit-interval.service.ts
var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var _HabitIntervalService = class _HabitIntervalService {
  localMidnight(now = /* @__PURE__ */ new Date()) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }
  /**
   * Returns the start of the current interval period in local time.
   * Both '24h' and 'specific_days' use today's midnight.
   */
  getCurrentPeriodStart(interval, now = /* @__PURE__ */ new Date()) {
    return this.localMidnight(now);
  }
  /**
   * Returns the start of the next interval period (tomorrow's midnight).
   */
  getNextPeriodStart(interval, now = /* @__PURE__ */ new Date()) {
    const midnight = this.localMidnight(now);
    return new Date(midnight.getTime() + 24 * 60 * 60 * 1e3);
  }
  /**
   * Returns the start of the previous interval period (yesterday's midnight).
   */
  getPreviousPeriodStart(interval, now = /* @__PURE__ */ new Date()) {
    const midnight = this.localMidnight(now);
    return new Date(midnight.getTime() - 24 * 60 * 60 * 1e3);
  }
  /**
   * Returns true if today is an active day for this habit.
   * Always true for '24h' habits.
   */
  isTodayActiveDay(habit, now = /* @__PURE__ */ new Date()) {
    const interval = this.resolveInterval(habit);
    if (interval !== "specific_days")
      return true;
    const activeDays = habit.active_days || [];
    return activeDays.includes(now.getDay());
  }
  /**
   * Returns the start (midnight) of the most recent previous active day.
   * Walks back up to 7 days. Used for streak validation.
   */
  getPreviousActiveDayStart(activeDays, now = /* @__PURE__ */ new Date()) {
    for (let daysBack = 1; daysBack <= 7; daysBack++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack, 0, 0, 0, 0);
      if (activeDays.includes(d.getDay()))
        return d;
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
  }
  /**
   * Returns the midnight of the next upcoming active day (not counting today).
   */
  getNextActiveDayStart(activeDays, now = /* @__PURE__ */ new Date()) {
    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, 0, 0, 0, 0);
      if (activeDays.includes(d.getDay()))
        return d;
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  }
  /**
   * Returns the full day name of the next upcoming active day (e.g. "Monday").
   */
  getNextActiveDayLabel(activeDays, now = /* @__PURE__ */ new Date()) {
    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, 0, 0, 0, 0);
      if (activeDays.includes(d.getDay()))
        return DAY_NAMES[d.getDay()];
    }
    return "";
  }
  /**
   * Seconds remaining until the current period ends.
   * For 'specific_days' on a non-active day: seconds until the next active day's midnight.
   */
  getSecondsUntilReset(interval, now = /* @__PURE__ */ new Date(), activeDays) {
    if (interval === "specific_days" && activeDays && !activeDays.includes(now.getDay())) {
      const next2 = this.getNextActiveDayStart(activeDays, now);
      return Math.max(0, Math.floor((next2.getTime() - now.getTime()) / 1e3));
    }
    const next = this.getNextPeriodStart(interval, now);
    return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1e3));
  }
  /**
   * Formats a countdown in seconds to HH:MM or Xd:HH:MM.
   */
  formatCountdown(seconds, interval) {
    if (seconds <= 0)
      return "00:00";
    const totalMinutes = Math.floor(seconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const hrs = totalHours % 24;
    const days = Math.floor(totalHours / 24);
    const mm = String(mins).padStart(2, "0");
    const hh = String(hrs).padStart(2, "0");
    if (days > 0)
      return `${days}d:${hh}:${mm}`;
    return `${String(totalHours).padStart(2, "0")}:${mm}`;
  }
  /**
   * Resolves a habit's recurrence interval.
   * Maps legacy '7d' and frequency='weekly' → 'specific_days'.
   */
  resolveInterval(habit) {
    const ri = habit.recurrence_interval;
    if (ri === "specific_days" || ri === "7d")
      return "specific_days";
    if (habit.frequency === "weekly")
      return "specific_days";
    return "24h";
  }
  /**
   * Returns true if the habit has met its goal within the current active period.
   * For 'specific_days': returns false when today is not an active day.
   */
  isHabitCompleteForCurrentPeriod(habit) {
    const interval = this.resolveInterval(habit);
    if (interval === "specific_days" && !this.isTodayActiveDay(habit))
      return false;
    const goalValue = habit.goal_value || 1;
    const currentProgress = habit.current_progress || 0;
    if (currentProgress < goalValue)
      return false;
    if (!habit.last_completed_at)
      return false;
    const periodStart = this.getCurrentPeriodStart(interval);
    const lastCompleted = new Date(habit.last_completed_at);
    return lastCompleted >= periodStart;
  }
  /**
   * Returns true if the habit's last completion falls within the previous active period.
   * For 'specific_days': "previous period" = the most recent previous active day.
   */
  wasCompletedInPreviousPeriod(habit, now = /* @__PURE__ */ new Date()) {
    if (!habit.last_completed_at)
      return false;
    const interval = this.resolveInterval(habit);
    const lastCompleted = new Date(habit.last_completed_at);
    if (interval === "specific_days") {
      const activeDays = habit.active_days || [];
      if (activeDays.length === 0)
        return false;
      const prevActiveStart = this.getPreviousActiveDayStart(activeDays, now);
      const prevActiveEnd = new Date(prevActiveStart.getTime() + 24 * 60 * 60 * 1e3);
      return lastCompleted >= prevActiveStart && lastCompleted < prevActiveEnd;
    }
    const prevStart = this.getPreviousPeriodStart(interval, now);
    const currStart = this.getCurrentPeriodStart(interval, now);
    return lastCompleted >= prevStart && lastCompleted < currStart;
  }
  /**
   * Returns true if this is a daily ('24h') habit that was NOT completed yesterday.
   * Only applies to simple daily habits (goal_value === 1).
   */
  didMissYesterday(habit, now = /* @__PURE__ */ new Date()) {
    const interval = this.resolveInterval(habit);
    if (interval !== "24h") {
      console.log("[didMissYesterday] SKIP: interval is", interval);
      return false;
    }
    if ((habit.goal_value || 1) !== 1) {
      console.log("[didMissYesterday] SKIP: goal_value is", habit.goal_value);
      return false;
    }
    const yesterdayStart = this.getPreviousPeriodStart("24h", now);
    const todayStart = this.getCurrentPeriodStart("24h", now);
    const habitCreatedAt = new Date(habit.created_at);
    if (habitCreatedAt >= todayStart) {
      console.log("[didMissYesterday] SKIP: habit created today", habitCreatedAt);
      return false;
    }
    if (!habit.last_completed_at) {
      console.log("[didMissYesterday] TRUE: never completed");
      return true;
    }
    const lastCompleted = new Date(habit.last_completed_at);
    const result = lastCompleted < yesterdayStart;
    console.log("[didMissYesterday] lastCompleted:", lastCompleted, "| yesterdayStart:", yesterdayStart, "| result:", result);
    return result;
  }
  /**
   * Returns a UI label for the interval.
   */
  getIntervalLabel(interval) {
    return interval === "specific_days" ? "Specific Days" : "1 Day";
  }
};
_HabitIntervalService.\u0275fac = function HabitIntervalService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HabitIntervalService)();
};
_HabitIntervalService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _HabitIntervalService, factory: _HabitIntervalService.\u0275fac, providedIn: "root" });
var HabitIntervalService = _HabitIntervalService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HabitIntervalService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/services/habit-business.service.ts
var _HabitBusinessService = class _HabitBusinessService {
  constructor(supabaseService) {
    this.toastController = inject(ToastController);
    this.habitIntervalService = inject(HabitIntervalService);
    this.supabase = supabaseService.client;
  }
  /**
   * Recompute a user's net_worth from scratch (cash + business value + portfolio value)
   * via the recalculate_net_worth() RPC, instead of nudging it by an ad hoc delta.
   */
  recalculateNetWorth(userId) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.rpc("recalculate_net_worth", { p_user_id: userId });
      if (error) {
        console.error("Error recalculating net worth:", error);
      }
    });
  }
  /**
   * Show an error toast message to the user
   */
  showErrorToast(message, duration = 4e3) {
    return __async(this, null, function* () {
      const toast = yield this.toastController.create({
        message,
        duration,
        color: "danger",
        position: "top",
        buttons: [
          {
            text: "Dismiss",
            role: "cancel"
          }
        ]
      });
      yield toast.present();
    });
  }
  /**
   * Show a success toast message to the user
   */
  showSuccessToast(message, duration = 3e3) {
    return __async(this, null, function* () {
      const toast = yield this.toastController.create({
        message,
        duration,
        color: "success",
        position: "top"
      });
      yield toast.present();
    });
  }
  /**
   * Show a loading toast (for operations that take time)
   */
  showLoadingToast(message) {
    return __async(this, null, function* () {
      const toast = yield this.toastController.create({
        message,
        duration: 0,
        // Don't auto-dismiss
        color: "medium",
        position: "bottom"
      });
      yield toast.present();
      return toast;
    });
  }
  /**
   * Get all available business types
   */
  getBusinessTypes() {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.from("business_types").select("*").order("base_cost", { ascending: true });
        if (error) {
          console.error("Error fetching business types:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error in getBusinessTypes:", error);
        throw error;
      }
    });
  }
  /**
   * Get user's habit-businesses ordered by display_order (for user customization)
   */
  getUserHabitBusinesses(userId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.from("habit_businesses").select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `).eq("user_id", userId).eq("is_active", true).order("display_order", { ascending: true });
        if (error) {
          console.error("Error fetching habit businesses:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error in getUserHabitBusinesses:", error);
        throw error;
      }
    });
  }
  /**
   * Create a new habit-business
   */
  createHabitBusiness(request) {
    return __async(this, null, function* () {
      try {
        const { data: businessType, error: businessTypeError } = yield this.supabase.from("business_types").select("*").eq("id", request.business_type_id).single();
        if (businessTypeError || !businessType) {
          throw new Error("Invalid business type");
        }
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
        if (profileError || !profile) {
          throw new Error("Could not load user profile");
        }
        if (profile.cash < businessType.base_cost) {
          const errorMsg = `Insufficient funds. Need $${businessType.base_cost.toFixed(2)}, but you only have $${profile.cash.toFixed(2)}`;
          yield this.showErrorToast(errorMsg);
          throw new Error(errorMsg);
        }
        if (request.goal_value < 1 || request.goal_value > 20) {
          throw new Error("Goal value must be between 1 and 20");
        }
        const { data: existingHabits, error: countError } = yield this.supabase.from("habit_businesses").select("id").eq("user_id", user.id).eq("is_active", true);
        if (countError) {
          console.error("Error counting existing habits:", countError);
          throw countError;
        }
        const nextOrderValue = (existingHabits?.length || 0) + 1;
        const habitBusinessData = {
          user_id: user.id,
          business_type_id: request.business_type_id,
          business_name: request.business_name,
          business_icon: businessType.icon,
          cost: businessType.base_cost,
          habit_description: request.habit_description,
          recurrence_interval: request.recurrence_interval,
          frequency: "daily",
          // backward compat — specific_days behaves like daily
          active_days: request.recurrence_interval === "specific_days" ? request.active_days || [] : null,
          goal_value: request.goal_value,
          current_progress: 0,
          earnings_per_completion: this.calculateReasonableEarnings(businessType.base_pay, request.goal_value),
          // Use reasonable earnings calculation
          streak: 0,
          total_completions: 0,
          total_earnings: 0,
          display_order: nextOrderValue,
          user_custom_order: nextOrderValue,
          is_active: true
        };
        const { data: newHabitBusiness, error: createError } = yield this.supabase.from("habit_businesses").insert(habitBusinessData).select().single();
        if (createError) {
          console.error("Error creating habit business:", createError);
          yield this.showErrorToast("Failed to create habit business. Please try again.");
          throw createError;
        }
        const newCash = profile.cash - businessType.base_cost;
        const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
          cash: newCash,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", user.id);
        if (updateCashError) {
          console.error("Error updating user cash:", updateCashError);
          yield this.showErrorToast("Habit created but payment failed. Please contact support.");
          throw new Error("Habit-business created but failed to deduct payment");
        }
        yield this.recalculateNetWorth(user.id);
        yield this.showSuccessToast(`\u2705 ${request.business_name} created successfully!`);
        try {
          yield this.createBusinessStock(newHabitBusiness.id);
          console.log("\u2705 Business stock created for new habit business");
        } catch (stockError) {
          console.error("\u26A0\uFE0F Warning: Failed to create business stock:", stockError);
        }
        return newHabitBusiness;
      } catch (error) {
        console.error("Error in createHabitBusiness:", error);
        if (error instanceof Error && !error.message.includes("Insufficient funds")) {
          yield this.showErrorToast("Failed to create habit business. Please try again.");
        }
        throw error;
      }
    });
  }
  /**
   * Upgrade an existing habit-business to a new business type
   */
  upgradeHabitBusiness(habitBusinessId, newBusinessTypeId, upgradeCost) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data: newBusinessType, error: businessTypeError } = yield this.supabase.from("business_types").select("*").eq("id", newBusinessTypeId).single();
        if (businessTypeError || !newBusinessType) {
          throw new Error("Invalid new business type");
        }
        const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
        if (profileError || !profile) {
          throw new Error("Could not load user profile");
        }
        if (profile.cash < upgradeCost) {
          throw new Error(`Insufficient funds. Need $${upgradeCost}, but you only have $${profile.cash}`);
        }
        const { error: updateError } = yield this.supabase.from("habit_businesses").update({
          business_type_id: newBusinessTypeId,
          business_icon: newBusinessType.icon,
          cost: newBusinessType.base_cost,
          earnings_per_completion: this.calculateReasonableEarnings(newBusinessType.base_pay, 1),
          // Use reasonable earnings calculation
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", habitBusinessId).eq("user_id", user.id);
        if (updateError) {
          console.error("Error updating habit business:", updateError);
          throw updateError;
        }
        const newCash = profile.cash - upgradeCost;
        const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
          cash: newCash,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", user.id);
        if (updateCashError) {
          console.error("Error updating user cash after upgrade:", updateCashError);
          throw new Error("Business upgraded but failed to deduct payment");
        }
        console.log("\u2705 Successfully upgraded habit business");
      } catch (error) {
        console.error("Error in upgradeHabitBusiness:", error);
        throw error;
      }
    });
  }
  /**
   * Update an existing habit-business
   */
  updateHabitBusiness(habitBusinessId, updates) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data: habitBusiness, error: habitError } = yield this.supabase.from("habit_businesses").select("*").eq("id", habitBusinessId).eq("user_id", user.id).single();
        if (habitError || !habitBusiness) {
          throw new Error("Habit-business not found or you do not have permission to edit it");
        }
        if (updates.goal_value !== void 0) {
          if (updates.goal_value < 1 || updates.goal_value > 99) {
            throw new Error("Goal value must be between 1 and 99");
          }
        }
        const { error: updateError } = yield this.supabase.from("habit_businesses").update(__spreadProps(__spreadValues({}, updates), {
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        })).eq("id", habitBusinessId);
        if (updateError) {
          console.error("Error updating habit business:", updateError);
          throw updateError;
        }
      } catch (error) {
        console.error("Error in updateHabitBusiness:", error);
        throw error;
      }
    });
  }
  /**
   * Delete (sell) a habit-business with loss penalty to prevent exploitation
   */
  deleteHabitBusiness(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data: habitBusiness, error: habitError } = yield this.supabase.from("habit_businesses").select(`
          *,
          business_types (
            name,
            base_cost
          )
        `).eq("id", habitBusinessId).eq("user_id", user.id).eq("is_active", true).single();
        if (habitError || !habitBusiness) {
          throw new Error("Habit-business not found or you do not have permission to delete it");
        }
        const { data: userHabits, error: countError } = yield this.supabase.from("habit_businesses").select("id").eq("user_id", user.id).eq("is_active", true);
        if (countError) {
          throw new Error("Could not verify your habit businesses");
        }
        if (!userHabits || userHabits.length <= 1) {
          throw new Error("Cannot delete your only habit business! You must have at least one active business.");
        }
        const originalCost = habitBusiness.cost || habitBusiness.business_types?.base_cost || 1;
        const streakMultiplier = habitBusiness.streak > 1 ? (habitBusiness.streak - 1) * 0.1 : 0;
        const baseEarnings = habitBusiness.earnings_per_completion || 0;
        const perCompletionPay = baseEarnings + baseEarnings * streakMultiplier;
        const sellValue = Math.floor(originalCost * 0.7) + Math.floor(perCompletionPay);
        const { error: deleteError } = yield this.supabase.from("habit_businesses").update({
          is_active: false,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", habitBusinessId);
        if (deleteError) {
          console.error("Error deleting habit business:", deleteError);
          throw deleteError;
        }
        const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
        if (profileError || !profile) {
          throw new Error("Could not load user profile");
        }
        const newCash = profile.cash + sellValue;
        const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
          cash: newCash,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", user.id);
        if (updateCashError) {
          console.error("Error updating user cash after sale:", updateCashError);
          throw new Error("Habit business deleted but failed to add sale proceeds");
        }
        yield this.recalculateNetWorth(user.id);
        const { error: saleRecordError } = yield this.supabase.from("business_sales").insert({
          user_id: user.id,
          habit_business_id: habitBusinessId,
          business_name: habitBusiness.business_name,
          business_type_name: habitBusiness.business_types?.name || "Business",
          sell_value: sellValue,
          streak_at_sale: habitBusiness.streak || 0
        });
        if (saleRecordError) {
          console.error("Error recording business sale for receipt history:", saleRecordError);
        }
        return sellValue;
      } catch (error) {
        console.error("Error in deleteHabitBusiness:", error);
        throw error;
      }
    });
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
  getLocalDateString(date = /* @__PURE__ */ new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  /**
   * Validate that the current date is not in the future relative to UTC
   * Prevents completing habits for future dates due to timezone differences
   */
  validateNotFutureDate() {
    const now = /* @__PURE__ */ new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 6e4);
    const localToday = this.getLocalDateString(now);
    const utcToday = this.getLocalDateString(utcNow);
    if (localToday > utcToday) {
      console.warn("\u26A0\uFE0F Local date appears to be ahead of UTC. Local:", localToday, "UTC:", utcToday);
      const localDate = /* @__PURE__ */ new Date(localToday + "T00:00:00");
      const utcDate = /* @__PURE__ */ new Date(utcToday + "T00:00:00");
      const daysDiff = Math.floor((localDate.getTime() - utcDate.getTime()) / (1e3 * 60 * 60 * 24));
      if (daysDiff > 1) {
        throw new Error("Cannot complete habits for future dates. Please check your device date/time settings.");
      }
    }
  }
  completeHabit(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        this.validateNotFutureDate();
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data: habitBusiness, error: habitError } = yield this.supabase.from("habit_businesses").select("*").eq("id", habitBusinessId).eq("user_id", user.id).single();
        if (habitError || !habitBusiness) {
          throw new Error("Habit-business not found");
        }
        const interval = this.habitIntervalService.resolveInterval(habitBusiness);
        const periodStart = this.habitIntervalService.getCurrentPeriodStart(interval);
        let currentProgress = habitBusiness.current_progress || 0;
        if (habitBusiness.last_completed_at) {
          const lastCompleted = new Date(habitBusiness.last_completed_at);
          if (lastCompleted < periodStart) {
            currentProgress = 0;
          }
        }
        const goalValue = habitBusiness.goal_value || 1;
        if (currentProgress >= goalValue) {
          const countdown = this.habitIntervalService.formatCountdown(this.habitIntervalService.getSecondsUntilReset(interval), interval);
          const errorMsg = `Goal already completed! ${currentProgress}/${goalValue} done. Resets in ${countdown}.`;
          yield this.showErrorToast(errorMsg);
          throw new Error(errorMsg);
        }
        const { data: periodCompletions, error: checkError } = yield this.supabase.from("habit_completions").select("id, completed_at").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).gte("completed_at", periodStart.toISOString());
        if (checkError) {
          console.error("Error checking existing completions:", checkError);
        } else if (periodCompletions && periodCompletions.length >= goalValue) {
          const countdown = this.habitIntervalService.formatCountdown(this.habitIntervalService.getSecondsUntilReset(interval), interval);
          const errorMsg = `Already completed ${periodCompletions.length}/${goalValue} times this period. Resets in ${countdown}.`;
          yield this.showErrorToast(errorMsg);
          throw new Error(errorMsg);
        }
        currentProgress += 1;
        const now = /* @__PURE__ */ new Date();
        let newStreak = habitBusiness.streak;
        const isGoalCompleted = currentProgress >= goalValue;
        if (isGoalCompleted) {
          if (this.habitIntervalService.wasCompletedInPreviousPeriod(habitBusiness)) {
            newStreak += 1;
          } else if (habitBusiness.last_completed_at) {
            newStreak = 1;
          } else {
            newStreak = 1;
          }
        }
        const streakMultiplier = isGoalCompleted && newStreak > 1 ? (newStreak - 1) * 0.1 : 0;
        const baseEarnings = habitBusiness.earnings_per_completion;
        const bonusAmount = baseEarnings * streakMultiplier;
        const baseTotal = baseEarnings + bonusAmount;
        let stockBoost = 0;
        let stockId = null;
        if (isGoalCompleted) {
          const { data: stockData, error: stockError } = yield this.supabase.from("business_stocks").select(`
            id,
            shares_owned_by_owner,
            total_shares_issued,
            stock_holdings (
              shares_owned,
              holder_id
            )
          `).eq("habit_business_id", habitBusinessId).single();
          if (!stockError && stockData) {
            stockId = stockData.id;
            const sharesOwnedByOthers = stockData.total_shares_issued - stockData.shares_owned_by_owner;
            const otherOwnershipPercentage = sharesOwnedByOthers / stockData.total_shares_issued * 100;
            const stockBoostPercentage = Math.floor(otherOwnershipPercentage / 10) * 5;
            stockBoost = baseTotal * (stockBoostPercentage / 100);
          }
        }
        const totalEarnings = baseTotal + stockBoost;
        const currentTime = /* @__PURE__ */ new Date();
        const localDateString = this.getLocalDateString(currentTime);
        const completionTime = /* @__PURE__ */ new Date(`${localDateString}T18:00:00`);
        console.log("\u{1F550} Recording completion for USER LOCAL DATE:", {
          userLocalDate: localDateString,
          userLocalTime: currentTime.toString(),
          completionTimestamp: completionTime.toISOString(),
          serverTime: (/* @__PURE__ */ new Date()).toISOString(),
          timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        const { data: completionData, error: completionError } = yield this.supabase.from("habit_completions").insert({
          habit_business_id: habitBusinessId,
          user_id: user.id,
          earnings: totalEarnings,
          streak_count: newStreak,
          completed_at: completionTime.toISOString()
          // Use actual completion time
        }).select().single();
        if (completionError) {
          console.error("Error recording completion:", completionError);
          if (completionError.code === "23505") {
            yield this.showErrorToast("You've already completed this habit today!");
          } else {
            yield this.showErrorToast("Failed to record habit completion. Please try again.");
          }
          throw completionError;
        }
        if (isGoalCompleted) {
          try {
            console.log("\u{1F4B0} Processing dividends for completed habit:", habitBusinessId);
            const { data: stockInfo, error: stockError } = yield this.supabase.from("business_stocks").select("id, total_shares_issued, shares_owned_by_owner, current_stock_price").eq("habit_business_id", habitBusinessId).single();
            if (stockError) {
              console.warn("\u26A0\uFE0F No stock info found for business:", stockError.message);
            } else if (stockInfo) {
              const investorShares = stockInfo.total_shares_issued - stockInfo.shares_owned_by_owner;
              console.log(`\u{1F4CA} Stock info: total_shares=${stockInfo.total_shares_issued}, owner_shares=${stockInfo.shares_owned_by_owner}, investor_shares=${investorShares}, stock_price=$${stockInfo.current_stock_price}`);
              if (investorShares > 0) {
                try {
                  const { error: rpcError } = yield this.supabase.rpc("process_habit_completion_dividends", {
                    completion_uuid: completionData.id
                  });
                  if (rpcError) {
                    console.warn("\u26A0\uFE0F RPC function failed:", rpcError.message);
                    throw rpcError;
                  } else {
                    console.log("\u2705 Dividend payments processed via RPC for habit completion");
                  }
                } catch (rpcFailure) {
                  console.log("\u{1F504} RPC failed, attempting manual dividend processing...");
                  yield this.processDividendsManually(habitBusinessId, totalEarnings, stockInfo.id);
                }
              } else {
                console.log("\u{1F4A1} No external investors - skipping dividend processing");
              }
            }
          } catch (dividendError) {
            console.error("\u26A0\uFE0F Warning: Failed to process dividends:", dividendError);
            console.log("\u{1F4A1} Habit completion succeeded, but dividend processing failed. This is non-critical.");
          }
        }
        const updateData = {
          current_progress: currentProgress,
          total_completions: habitBusiness.total_completions + 1,
          total_earnings: habitBusiness.total_earnings + totalEarnings,
          last_completed_at: now.toISOString(),
          // Always update this to track when last activity happened
          updated_at: now.toISOString()
        };
        if (isGoalCompleted) {
          updateData.streak = newStreak;
        }
        const { error: updateError } = yield this.supabase.from("habit_businesses").update(updateData).eq("id", habitBusinessId);
        if (updateError) {
          throw updateError;
        }
        if (isGoalCompleted) {
          try {
            yield this.supabase.rpc("update_stock_price_by_streak", {
              habit_business_uuid: habitBusinessId
            });
            console.log("\u2705 Stock price updated based on new streak");
          } catch (priceError) {
            console.error("\u26A0\uFE0F Warning: Failed to update stock price:", priceError);
          }
          try {
            const { data: milestoneResult } = yield this.supabase.rpc("notify_friends_of_milestone", {
              habit_business_uuid: habitBusinessId,
              achiever_user_id: user.id
            });
            if (milestoneResult && milestoneResult > 0) {
              console.log(`\u{1F3C6} Milestone notifications sent to ${milestoneResult} friend(s)`);
            }
          } catch (milestoneError) {
            console.warn("\u26A0\uFE0F Warning: Failed to send milestone notifications (non-critical):", milestoneError);
          }
        }
        const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
        if (profileError || !profile) {
          throw new Error("Could not load user profile");
        }
        const newCash = profile.cash + totalEarnings;
        const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
          cash: newCash,
          updated_at: now.toISOString()
        }).eq("id", user.id);
        if (updateCashError) {
          throw new Error("Habit completed but failed to add earnings");
        }
        yield this.recalculateNetWorth(user.id);
      } catch (error) {
        console.error("Error in completeHabit:", error);
        if (error instanceof Error && !error.message.includes("already completed") && !error.message.includes("Goal already completed")) {
          yield this.showErrorToast("Failed to complete habit. Please try again.");
        }
        throw error;
      }
    });
  }
  /**
   * Complete a daily habit for YESTERDAY (backdated one day).
   * Only available for daily habits (recurrence_interval === '24h', goal_value === 1)
   * that were not completed yesterday. Pays earnings, updates streak, and
   * distributes dividends to stockholders — all at yesterday's rate.
   */
  completeHabitYesterday(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user)
          throw new Error("User not authenticated");
        const { data: habitBusiness, error: habitError } = yield this.supabase.from("habit_businesses").select("*").eq("id", habitBusinessId).eq("user_id", user.id).single();
        if (habitError || !habitBusiness)
          throw new Error("Habit-business not found");
        const interval = this.habitIntervalService.resolveInterval(habitBusiness);
        if (interval !== "24h")
          throw new Error("Backdated completion only available for daily habits");
        const now = /* @__PURE__ */ new Date();
        const yesterdayStart = this.habitIntervalService.getPreviousPeriodStart("24h", now);
        const todayStart = this.habitIntervalService.getCurrentPeriodStart("24h", now);
        const { data: yesterdayCompletions } = yield this.supabase.from("habit_completions").select("id").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).gte("completed_at", yesterdayStart.toISOString()).lt("completed_at", todayStart.toISOString());
        if (yesterdayCompletions && yesterdayCompletions.length > 0) {
          yield this.showErrorToast("This habit was already completed yesterday!");
          throw new Error("This habit was already completed yesterday");
        }
        const dayBeforeYesterdayStart = new Date(yesterdayStart.getTime() - 24 * 60 * 60 * 1e3);
        let newStreak = 1;
        if (habitBusiness.last_completed_at) {
          const lastCompleted = new Date(habitBusiness.last_completed_at);
          if (lastCompleted >= dayBeforeYesterdayStart && lastCompleted < yesterdayStart) {
            newStreak = (habitBusiness.streak || 0) + 1;
          } else {
            newStreak = 1;
          }
        }
        const streakMultiplier = newStreak > 1 ? (newStreak - 1) * 0.1 : 0;
        const baseEarnings = habitBusiness.earnings_per_completion;
        const baseTotal = baseEarnings + baseEarnings * streakMultiplier;
        let stockBoost = 0;
        let stockInfoId = null;
        const { data: stockData } = yield this.supabase.from("business_stocks").select("id, shares_owned_by_owner, total_shares_issued").eq("habit_business_id", habitBusinessId).single();
        if (stockData) {
          stockInfoId = stockData.id;
          const sharesOwnedByOthers = stockData.total_shares_issued - stockData.shares_owned_by_owner;
          const otherOwnershipPct = sharesOwnedByOthers / stockData.total_shares_issued * 100;
          const boostPct = Math.floor(otherOwnershipPct / 10) * 5;
          stockBoost = baseTotal * (boostPct / 100);
        }
        const totalEarnings = baseTotal + stockBoost;
        const yesterdayDateString = this.getLocalDateString(new Date(now.getTime() - 24 * 60 * 60 * 1e3));
        const completionTime = /* @__PURE__ */ new Date(`${yesterdayDateString}T18:00:00`);
        console.log("\u{1F4C5} Recording BACKDATED completion for yesterday:", {
          yesterday: yesterdayDateString,
          completionTimestamp: completionTime.toISOString(),
          newStreak,
          totalEarnings
        });
        const { data: completionData, error: completionError } = yield this.supabase.from("habit_completions").insert({
          habit_business_id: habitBusinessId,
          user_id: user.id,
          earnings: totalEarnings,
          streak_count: newStreak,
          completed_at: completionTime.toISOString()
        }).select().single();
        if (completionError) {
          if (completionError.code === "23505") {
            yield this.showErrorToast("This habit was already completed yesterday!");
          } else {
            yield this.showErrorToast("Failed to record backdated completion. Please try again.");
          }
          throw completionError;
        }
        if (stockInfoId) {
          try {
            if (stockData && stockData.total_shares_issued - stockData.shares_owned_by_owner > 0) {
              try {
                const { error: rpcError } = yield this.supabase.rpc("process_habit_completion_dividends", {
                  completion_uuid: completionData.id
                });
                if (rpcError)
                  throw rpcError;
                console.log("\u2705 Dividends processed for backdated completion");
              } catch {
                yield this.processDividendsManually(habitBusinessId, totalEarnings, stockInfoId);
              }
            }
          } catch (dividendError) {
            console.error("\u26A0\uFE0F Warning: Failed to process dividends for backdated completion:", dividendError);
          }
        }
        const { error: updateError } = yield this.supabase.from("habit_businesses").update({
          streak: newStreak,
          total_completions: habitBusiness.total_completions + 1,
          total_earnings: habitBusiness.total_earnings + totalEarnings,
          last_completed_at: completionTime.toISOString(),
          updated_at: now.toISOString()
        }).eq("id", habitBusinessId);
        if (updateError)
          throw updateError;
        try {
          yield this.supabase.rpc("update_stock_price_by_streak", { habit_business_uuid: habitBusinessId });
        } catch (priceError) {
          console.error("\u26A0\uFE0F Warning: Failed to update stock price:", priceError);
        }
        const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
        if (profileError || !profile)
          throw new Error("Could not load user profile");
        const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
          cash: profile.cash + totalEarnings,
          updated_at: now.toISOString()
        }).eq("id", user.id);
        if (updateCashError)
          throw new Error("Habit completed but failed to add earnings");
        yield this.recalculateNetWorth(user.id);
      } catch (error) {
        console.error("Error in completeHabitYesterday:", error);
        if (error instanceof Error && !error.message.includes("already completed yesterday")) {
          yield this.showErrorToast("Failed to complete habit for yesterday. Please try again.");
        }
        throw error;
      }
    });
  }
  /**
   * Undo a habit completion for today
   */
  undoHabitCompletion(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data: habitBusiness, error: habitError } = yield this.supabase.from("habit_businesses").select("*").eq("id", habitBusinessId).eq("user_id", user.id).single();
        if (habitError || !habitBusiness) {
          throw new Error("Habit-business not found");
        }
        const today = this.getLocalDateString();
        const lastCompleted = habitBusiness.last_completed_at ? this.getLocalDateString(new Date(habitBusiness.last_completed_at)) : null;
        console.log("\u{1F4C5} Checking undo eligibility - Today:", today, "Last completed:", lastCompleted);
        if (lastCompleted !== today) {
          throw new Error("No completion found for today to undo");
        }
        const todayStart = /* @__PURE__ */ new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = /* @__PURE__ */ new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const todayStartISO = todayStart.toISOString();
        const todayEndISO = todayEnd.toISOString();
        console.log("\u{1F50D} Looking for completion between:", todayStartISO, "and", todayEndISO);
        const { data: todaysCompletion, error: completionError } = yield this.supabase.from("habit_completions").select("*").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).gte("completed_at", todayStartISO).lte("completed_at", todayEndISO).order("completed_at", { ascending: false }).limit(1).single();
        if (completionError || !todaysCompletion) {
          console.error("\u274C Completion lookup error:", completionError);
          console.log("\u{1F50D} Checking all recent completions for debugging...");
          const { data: recentCompletions } = yield this.supabase.from("habit_completions").select("*").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).order("completed_at", { ascending: false }).limit(5);
          console.log("\u{1F4CA} Recent completions found:", recentCompletions);
          throw new Error("Could not find today's completion record");
        }
        const previousStreak = Math.max(0, habitBusiness.streak - 1);
        const { data: previousCompletion, error: prevError } = yield this.supabase.from("habit_completions").select("completed_at").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).neq("id", todaysCompletion.id).order("completed_at", { ascending: false }).limit(1).single();
        const newCurrentProgress = Math.max(0, (habitBusiness.current_progress || 0) - 1);
        const { error: updateError } = yield this.supabase.from("habit_businesses").update({
          streak: previousStreak,
          current_progress: newCurrentProgress,
          total_completions: Math.max(0, habitBusiness.total_completions - 1),
          total_earnings: Math.max(0, habitBusiness.total_earnings - todaysCompletion.earnings),
          last_completed_at: previousCompletion?.completed_at || null,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", habitBusinessId);
        console.log(`\u21A9\uFE0F Undoing completion: progress ${habitBusiness.current_progress} \u2192 ${newCurrentProgress}`);
        if (updateError) {
          throw updateError;
        }
        const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
        if (profileError || !profile) {
          throw new Error("Could not load user profile");
        }
        const newCash = profile.cash - todaysCompletion.earnings;
        const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
          cash: newCash,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", user.id);
        if (updateCashError) {
          throw new Error("Failed to remove earnings from cash");
        }
        yield this.recalculateNetWorth(user.id);
        const { error: deleteError } = yield this.supabase.from("habit_completions").delete().eq("id", todaysCompletion.id);
        if (deleteError) {
          console.error("Error deleting completion record:", deleteError);
        }
      } catch (error) {
        console.error("Error in undoHabitCompletion:", error);
        throw error;
      }
    });
  }
  /**
   * Get today's habits that can be completed
   */
  getTodaysHabits(userId) {
    return __async(this, null, function* () {
      try {
        const today = this.getLocalDateString();
        const { data, error } = yield this.supabase.from("habit_businesses").select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `).eq("user_id", userId).eq("is_active", true).order("display_order", { ascending: true });
        if (error) {
          console.error("Error fetching today's habits:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error in getTodaysHabits:", error);
        throw error;
      }
    });
  }
  /**
   * Manually process dividends when RPC function fails
   */
  processDividendsManually(habitBusinessId, totalEarnings, stockId) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F527} Manual dividend processing for business:", habitBusinessId);
        const { data: holdings, error: holdingsError } = yield this.supabase.from("stock_holdings").select("*").eq("stock_id", stockId).gt("shares_owned", 0);
        if (holdingsError) {
          throw holdingsError;
        }
        if (!holdings || holdings.length === 0) {
          console.log("\u{1F4A1} No stockholders found for dividend distribution");
          return;
        }
        const { data: stockInfo, error: stockError } = yield this.supabase.from("business_stocks").select("total_shares_issued, shares_owned_by_owner").eq("id", stockId).single();
        if (stockError || !stockInfo) {
          throw new Error("Could not get stock information");
        }
        const investorShares = stockInfo.total_shares_issued - stockInfo.shares_owned_by_owner;
        const ownershipPercentage = investorShares / stockInfo.total_shares_issued;
        const stockBoostMultiplier = Math.floor(ownershipPercentage * 10) * 0.05;
        const stockBoostAmount = totalEarnings * stockBoostMultiplier;
        const dividendPool = stockBoostAmount * 0.5;
        console.log(`\u{1F4B0} Dividend calculation: total_earnings=${totalEarnings}, ownership=${(ownershipPercentage * 100).toFixed(1)}%, boost=${stockBoostAmount.toFixed(2)}, pool=${dividendPool.toFixed(2)}`);
        if (dividendPool <= 0) {
          console.log("\u{1F4A1} No dividend pool to distribute");
          return;
        }
        const dividendPerShare = dividendPool / investorShares;
        for (const holding of holdings) {
          const dividendAmount = holding.shares_owned * dividendPerShare;
          console.log(`\u{1F4B8} Paying ${dividendAmount.toFixed(2)} dividend to holder ${holding.holder_id} (${holding.shares_owned} shares)`);
          const { error: distributionError } = yield this.supabase.from("stock_dividend_distributions").insert({
            dividend_payment_id: crypto.randomUUID(),
            stockholder_id: holding.holder_id,
            shares_owned: holding.shares_owned,
            dividend_per_share: dividendPerShare,
            total_dividend: dividendAmount
          });
          if (distributionError) {
            console.error("Error recording dividend distribution:", distributionError);
            continue;
          }
          const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", holding.holder_id).single();
          if (profileError || !profile) {
            console.error("Error getting stockholder profile:", profileError);
            continue;
          }
          const newCash = profile.cash + dividendAmount;
          const { error: updateError } = yield this.supabase.from("user_profiles").update({
            cash: newCash,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", holding.holder_id);
          if (updateError) {
            console.error("Error updating stockholder cash:", updateError);
            continue;
          }
          yield this.recalculateNetWorth(holding.holder_id);
          const { error: holdingUpdateError } = yield this.supabase.from("stock_holdings").update({
            total_dividends_earned: holding.total_dividends_earned + dividendAmount,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", holding.id);
          if (holdingUpdateError) {
            console.error("Error updating holding dividends:", holdingUpdateError);
          }
        }
        console.log("\u2705 Manual dividend processing completed");
      } catch (error) {
        console.error("\u274C Error in manual dividend processing:", error);
        throw error;
      }
    });
  }
  /**
   * Distribute dividends to stockholders
   */
  distributeDividends(stockId, totalDividendPool) {
    return __async(this, null, function* () {
      try {
        const { data: stockholders, error: stockholdersError } = yield this.supabase.from("stock_holdings").select("*").eq("stock_id", stockId).gt("shares_owned", 0);
        if (stockholdersError) {
          throw stockholdersError;
        }
        if (!stockholders || stockholders.length === 0) {
          return;
        }
        const totalInvestorShares = stockholders.reduce((sum, holding) => sum + holding.shares_owned, 0);
        if (totalInvestorShares === 0) {
          return;
        }
        const dividendPerShare = totalDividendPool / totalInvestorShares;
        for (const holding of stockholders) {
          const dividendAmount = holding.shares_owned * dividendPerShare;
          const { error: distributionError } = yield this.supabase.from("stock_dividend_distributions").insert({
            dividend_payment_id: crypto.randomUUID(),
            stockholder_id: holding.holder_id,
            shares_owned: holding.shares_owned,
            dividend_per_share: dividendPerShare,
            total_dividend: dividendAmount
          });
          if (distributionError) {
            console.error("Error recording dividend distribution:", distributionError);
            continue;
          }
          const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", holding.holder_id).single();
          if (!profileError && profile) {
            const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
              cash: profile.cash + dividendAmount,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }).eq("id", holding.holder_id);
            if (updateCashError) {
              console.error("Error updating stockholder cash:", updateCashError);
            } else {
              yield this.recalculateNetWorth(holding.holder_id);
            }
          }
          const { error: updateHoldingError } = yield this.supabase.from("stock_holdings").update({
            total_dividends_earned: holding.total_dividends_earned + dividendAmount,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", holding.id);
          if (updateHoldingError) {
            console.error("Error updating holding dividends:", updateHoldingError);
          }
        }
      } catch (error) {
        console.error("Error in distributeDividends:", error);
        throw error;
      }
    });
  }
  /**
   * Sell stock shares
   */
  sellStockShares(stockId, sharesToSell) {
    return __async(this, null, function* () {
      try {
        const { data: currentUser } = yield this.supabase.auth.getUser();
        if (!currentUser.user) {
          throw new Error("User not authenticated");
        }
        const { data, error } = yield this.supabase.rpc("sell_stock_shares", {
          seller_id: currentUser.user.id,
          stock_uuid: stockId,
          shares_to_sell: sharesToSell
        });
        if (error) {
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error selling stock shares:", error);
        throw error;
      }
    });
  }
  /**
   * Update stock price based on current streak
   */
  updateStockPrice(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.rpc("update_stock_price_by_streak", {
          habit_business_uuid: habitBusinessId
        });
        if (error) {
          throw error;
        }
        return data || 0;
      } catch (error) {
        console.error("Error updating stock price:", error);
        throw error;
      }
    });
  }
  /**
   * Calculate upgrade options for a habit business
   */
  calculateUpgradeOptions(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data: habitBusiness, error: habitError } = yield this.supabase.from("habit_businesses").select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `).eq("id", habitBusinessId).single();
        if (habitError || !habitBusiness) {
          throw new Error("Habit business not found");
        }
        const businessTypes = yield this.getBusinessTypes();
        const streakMultiplier = Math.max(1, habitBusiness.streak);
        const currentBusinessValue = habitBusiness.earnings_per_completion * streakMultiplier;
        const totalStreakValue = currentBusinessValue * habitBusiness.streak * 30;
        const availableUpgrades = businessTypes.filter((bt) => bt.base_cost > (habitBusiness.business_types?.base_cost || 0));
        const upgradeOptions = availableUpgrades.map((businessType) => {
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
        console.error("Error in calculateUpgradeOptions:", error);
        throw error;
      }
    });
  }
  /**
   * Upgrade a business by selling streak value
   */
  upgradeBusiness(oldHabitBusinessId, newBusinessTypeId, newBusinessName, newHabitDescription) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const upgradeCalc = yield this.calculateUpgradeOptions(oldHabitBusinessId);
        const upgradeOption = upgradeCalc.upgradeOptions.find((opt) => opt.businessType.id === newBusinessTypeId);
        if (!upgradeOption || !upgradeOption.canAfford) {
          throw new Error("Cannot afford this upgrade");
        }
        const { data: oldBusiness, error: oldBusinessError } = yield this.supabase.from("habit_businesses").select("*").eq("id", oldHabitBusinessId).single();
        if (oldBusinessError || !oldBusiness) {
          throw new Error("Old business not found");
        }
        const newHabitBusiness = yield this.createHabitBusiness({
          business_type_id: newBusinessTypeId,
          business_name: newBusinessName,
          habit_description: newHabitDescription,
          recurrence_interval: oldBusiness.recurrence_interval ?? (oldBusiness.frequency === "weekly" ? "7d" : "24h"),
          goal_value: oldBusiness.goal_value || 1
          // Use existing goal_value or default to 1
        });
        const { error: upgradeError } = yield this.supabase.from("business_upgrades").insert({
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
          console.error("Error recording upgrade:", upgradeError);
        }
        if (upgradeOption.profitFromUpgrade > 0) {
          const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
          if (!profileError && profile) {
            const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
              cash: profile.cash + upgradeOption.profitFromUpgrade,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }).eq("id", user.id);
            if (updateCashError) {
              console.error("Error adding upgrade profit:", updateCashError);
            }
          }
        }
        const { error: deactivateError } = yield this.supabase.from("habit_businesses").update({
          is_active: false,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", oldHabitBusinessId);
        if (deactivateError) {
          console.error("Error deactivating old business:", deactivateError);
        }
        yield this.recalculateNetWorth(user.id);
        return newHabitBusiness;
      } catch (error) {
        console.error("Error in upgradeBusiness:", error);
        throw error;
      }
    });
  }
  /**
   * Get user's stock holdings
   */
  getUserStockHoldings(userId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.from("stock_holdings").select(`
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
              is_active,
              business_types (
                name,
                icon
              )
            )
          )
        `).eq("holder_id", userId).gt("shares_owned", 0);
        if (error) {
          console.error("Error fetching stock holdings:", error);
          throw error;
        }
        const active = (data || []).filter((h) => h.business_stocks?.habit_businesses?.is_active !== false);
        return active;
      } catch (error) {
        console.error("Error in getUserStockHoldings:", error);
        throw error;
      }
    });
  }
  /**
   * Get available stocks for purchase
   */
  getAvailableStocks(userId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.from("business_stocks").select(`
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
        `).gt("shares_available", 0).neq("business_owner_id", userId);
        if (error) {
          console.error("Error fetching available stocks:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error in getAvailableStocks:", error);
        throw error;
      }
    });
  }
  /**
   * Purchase stock shares
   */
  purchaseStock(stockId, shares) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data: stock, error: stockError } = yield this.supabase.from("business_stocks").select("*").eq("id", stockId).single();
        if (stockError || !stock) {
          throw new Error("Stock not found");
        }
        if (stock.shares_available < shares) {
          const errorMsg = `Not enough shares available. Only ${stock.shares_available} shares left.`;
          yield this.showErrorToast(errorMsg);
          throw new Error(errorMsg);
        }
        const totalCost = stock.current_stock_price * shares;
        const { data: profile, error: profileError } = yield this.supabase.from("user_profiles").select("cash").eq("id", user.id).single();
        if (profileError || !profile) {
          throw new Error("Could not load user profile");
        }
        if (profile.cash < totalCost) {
          const errorMsg = `Insufficient funds. Need $${totalCost.toFixed(2)}, but you only have $${profile.cash.toFixed(2)}`;
          yield this.showErrorToast(errorMsg);
          throw new Error(errorMsg);
        }
        const { data: existingHolding, error: holdingError } = yield this.supabase.from("stock_holdings").select("*").eq("holder_id", user.id).eq("stock_id", stockId).single();
        if (holdingError && holdingError.code !== "PGRST116") {
          console.error("Error checking stock holdings:", holdingError);
          yield this.showErrorToast("Failed to check your stock holdings. Please try again.");
          throw holdingError;
        }
        if (existingHolding) {
          const newTotalShares = existingHolding.shares_owned + shares;
          const newTotalInvested = existingHolding.total_invested + totalCost;
          const newAveragePrice = newTotalInvested / newTotalShares;
          const { error: updateHoldingError } = yield this.supabase.from("stock_holdings").update({
            shares_owned: newTotalShares,
            total_invested: newTotalInvested,
            average_purchase_price: newAveragePrice,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", existingHolding.id);
          if (updateHoldingError) {
            throw updateHoldingError;
          }
        } else {
          const { error: createHoldingError } = yield this.supabase.from("stock_holdings").insert({
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
        const { error: updateStockError } = yield this.supabase.from("business_stocks").update({
          shares_available: stock.shares_available - shares,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", stockId);
        if (updateStockError) {
          throw updateStockError;
        }
        const { error: transactionError } = yield this.supabase.from("stock_transactions").insert({
          stock_id: stockId,
          buyer_id: user.id,
          seller_id: null,
          // IPO purchase
          shares_traded: shares,
          price_per_share: stock.current_stock_price,
          total_cost: totalCost,
          transaction_type: "purchase"
        });
        if (transactionError) {
          console.error("Error recording transaction:", transactionError);
        }
        const { error: updateCashError } = yield this.supabase.from("user_profiles").update({
          cash: profile.cash - totalCost,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", user.id);
        if (updateCashError) {
          console.error("Error updating user cash after stock purchase:", updateCashError);
          yield this.showErrorToast("Stock purchased but payment deduction failed. Please contact support.");
          throw new Error("Stock purchased but failed to deduct payment");
        }
        yield this.recalculateNetWorth(user.id);
        yield this.showSuccessToast(`\u2705 Purchased ${shares} shares successfully!`);
      } catch (error) {
        console.error("Error in purchaseStock:", error);
        if (error instanceof Error && !error.message.includes("Insufficient funds") && !error.message.includes("Not enough shares")) {
          yield this.showErrorToast("Failed to purchase stock. Please try again.");
        }
        throw error;
      }
    });
  }
  /**
   * Get today's actual earnings from completed habits
   */
  getTodaysActualEarnings(userId) {
    return __async(this, null, function* () {
      try {
        const todayLocalDateString = this.getLocalDateString(/* @__PURE__ */ new Date());
        console.log(`\u{1F4CA} Fetching habit earnings for ${userId} on local date: ${todayLocalDateString}`);
        const { data, error } = yield this.supabase.from("habit_completions").select("earnings, completed_at").eq("user_id", userId);
        if (error) {
          console.error("Error fetching today's actual earnings:", error);
          throw error;
        }
        const todayCompletions = data?.filter((completion) => {
          const completionLocalDate = this.getLocalDateString(new Date(completion.completed_at));
          return completionLocalDate === todayLocalDateString;
        }) || [];
        const totalEarnings = todayCompletions.reduce((total, completion) => total + completion.earnings, 0);
        console.log(`\u{1F4B0} Today's habit earnings for user: $${totalEarnings.toFixed(2)} (${todayCompletions.length} completions from ${data?.length || 0} total)`);
        console.log(`\u{1F4C5} Filtering for local date: ${todayLocalDateString}`);
        return totalEarnings;
      } catch (error) {
        console.error("Error in getTodaysActualEarnings:", error);
        throw error;
      }
    });
  }
  /**
   * Get today's stock dividend earnings for a user
   */
  getTodaysStockDividends(userId) {
    return __async(this, null, function* () {
      try {
        const now = /* @__PURE__ */ new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1e3);
        console.log(`\u{1F4CA} Fetching stock dividends for ${userId} between ${today.toISOString()} and ${tomorrow.toISOString()}`);
        const { data, error } = yield this.supabase.from("stock_dividend_distributions").select("total_dividend, created_at").eq("stockholder_id", userId).gte("created_at", today.toISOString()).lt("created_at", tomorrow.toISOString());
        if (error) {
          console.error("Error fetching today's stock dividends:", error);
          throw error;
        }
        const totalDividends = data?.reduce((total, distribution) => total + distribution.total_dividend, 0) || 0;
        console.log(`\u{1F4B0} Today's stock dividends for user: $${totalDividends.toFixed(2)} (${data?.length || 0} distributions)`);
        if (data && data.length > 0) {
          console.log("\u{1F50D} Individual dividend payments received today:");
          data.forEach((payment, index) => {
            console.log(`  ${index + 1}. $${payment.total_dividend.toFixed(4)} received at ${payment.created_at}`);
          });
        }
        try {
          const holdings = yield this.getUserStockHoldings(userId);
          if (holdings.length > 0) {
            console.log(`\u{1F4C8} User has ${holdings.length} stock holdings that could generate dividends:`, holdings.map((h) => `${h.business_stocks?.habit_businesses?.business_name}: ${h.shares_owned} shares`));
          } else {
            console.log(`\u2139\uFE0F User has no stock holdings - dividends will always be $0`);
          }
        } catch (holdingsError) {
          console.warn("Could not fetch holdings for dividend debugging:", holdingsError);
        }
        return totalDividends;
      } catch (error) {
        console.error("Error in getTodaysStockDividends:", error);
        throw error;
      }
    });
  }
  /**
   * Debug method to get comprehensive information about the dividend system
   */
  getDividendSystemDebugInfo(userId) {
    return __async(this, null, function* () {
      try {
        const userHoldings = yield this.getUserStockHoldings(userId);
        const { data: ownedBusinessStocks } = yield this.supabase.from("business_stocks").select(`
          *,
          habit_businesses!inner (
            id,
            business_name,
            user_id
          )
        `).eq("habit_businesses.user_id", userId);
        const todaysDividends = yield this.getTodaysStockDividends(userId);
        const { data: recentDistributions } = yield this.supabase.from("stock_dividend_distributions").select("*").eq("stockholder_id", userId).order("created_at", { ascending: false }).limit(10);
        return {
          userHoldings: userHoldings || [],
          ownedBusinessStocks: ownedBusinessStocks || [],
          todaysDividends,
          recentDividendDistributions: recentDistributions || []
        };
      } catch (error) {
        console.error("Error getting dividend debug info:", error);
        throw error;
      }
    });
  }
  /**
   * Create a test dividend distribution for debugging (dev mode only)
   */
  createTestDividend(userId, amount = 5) {
    return __async(this, null, function* () {
      try {
        const { error } = yield this.supabase.from("stock_dividend_distributions").insert({
          dividend_payment_id: `test-${Date.now()}`,
          stockholder_id: userId,
          shares_owned: 10,
          dividend_per_share: amount / 10,
          total_dividend: amount
        });
        if (error) {
          throw error;
        }
        console.log(`\u2705 Created test dividend of $${amount} for user ${userId}`);
      } catch (error) {
        console.error("Error creating test dividend:", error);
        throw error;
      }
    });
  }
  /**
   * Reset daily habits that are outdated (completed before today)
   * This ensures that habits completed yesterday show as incomplete today
   */
  resetOutdatedDailyHabits() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Checking for outdated daily habits to reset...");
        yield this.cleanupInvalidCompletions();
        const { data, error } = yield this.supabase.rpc("reset_outdated_habits");
        if (error) {
          console.error("Error resetting outdated daily habits:", error);
          return;
        }
        if (data && data.length > 0) {
          console.log(`\u2705 Reset ${data.length} outdated daily habit(s):`, data);
          for (const resetHabit of data) {
            try {
              yield this.supabase.rpc("update_stock_price_by_streak", {
                habit_business_uuid: resetHabit.id
              });
              console.log(`\u{1F4C8} Updated stock price for habit: ${resetHabit.business_name}`);
            } catch (priceError) {
              console.error(`\u26A0\uFE0F Failed to update stock price for habit ${resetHabit.id}:`, priceError);
            }
          }
        } else {
          console.log("\u2705 No daily habits needed resetting");
        }
      } catch (error) {
        console.error("Error in resetOutdatedDailyHabits:", error);
      }
    });
  }
  /**
   * Clean up invalid completion records (future dates, timezone issues)
   */
  cleanupInvalidCompletions() {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user)
          return;
        const now = /* @__PURE__ */ new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        console.log("\u{1F9F9} Cleaning up completion records after:", endOfToday.toISOString());
        const { data: futureCompletions, error: queryError } = yield this.supabase.from("habit_completions").select("id, completed_at, habit_business_id").eq("user_id", user.id).gt("completed_at", endOfToday.toISOString());
        if (queryError) {
          console.error("Error querying future completions:", queryError);
          return;
        }
        if (futureCompletions && futureCompletions.length > 0) {
          console.log(`\u26A0\uFE0F Found ${futureCompletions.length} future completion records to clean up:`, futureCompletions.map((c) => ({
            id: c.id,
            date: c.completed_at,
            business: c.habit_business_id?.substring(0, 8),
            isAfterToday: new Date(c.completed_at) > endOfToday
          })));
          const { error: deleteError } = yield this.supabase.from("habit_completions").delete().in("id", futureCompletions.map((c) => c.id));
          if (deleteError) {
            console.error("Error deleting future completions:", deleteError);
          } else {
            console.log("\u2705 Cleaned up future completion records");
            const affectedBusinessIds = [...new Set(futureCompletions.map((c) => c.habit_business_id))];
            for (const businessId of affectedBusinessIds) {
              if (businessId) {
                const { error: resetError } = yield this.supabase.from("habit_businesses").update({
                  current_progress: 0,
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                }).eq("id", businessId);
                if (resetError) {
                  console.error("Error resetting progress for business:", businessId, resetError);
                }
              }
            }
          }
        } else {
          console.log("\u2705 No future completion records found to clean up");
        }
      } catch (error) {
        console.error("Error in cleanupInvalidCompletions:", error);
      }
    });
  }
  /**
   * Debug function to inspect habit state and completion records
   */
  debugHabitState(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        console.log("\u{1F50D} DEBUGGING HABIT STATE for:", habitBusinessId);
        const { data: habitBusiness, error: habitError } = yield this.supabase.from("habit_businesses").select("*").eq("id", habitBusinessId).eq("user_id", user.id).single();
        console.log("\u{1F4CA} Habit Business State:", habitBusiness);
        const now = /* @__PURE__ */ new Date();
        const todayLocalString = this.getLocalDateString(now);
        const todayUTCString = now.toISOString().split("T")[0];
        console.log("\u{1F4C5} Date Info:", {
          now: now.toString(),
          nowISO: now.toISOString(),
          todayLocal: todayLocalString,
          todayUTC: todayUTCString,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: now.getTimezoneOffset()
        });
        const { data: allCompletions, error: completionsError } = yield this.supabase.from("habit_completions").select("*").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).order("completed_at", { ascending: false }).limit(10);
        console.log("\u{1F4CB} All Recent Completions:", allCompletions);
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const { data: todayCompletions, error: todayError } = yield this.supabase.from("habit_completions").select("*").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).gte("completed_at", todayStart.toISOString()).lte("completed_at", todayEnd.toISOString());
        console.log("\u{1F4C5} Today's Completions (using time range):", todayCompletions);
        const todayCompletionsByDate = allCompletions?.filter((completion) => {
          const completionDate = this.getLocalDateString(new Date(completion.completed_at));
          return completionDate === todayLocalString;
        });
        console.log("\u{1F4C5} Today's Completions (using date string):", todayCompletionsByDate);
        const isCompletedResult = this.isCompletedTodayDebug(habitBusiness);
        const isGoalCompletedResult = this.isGoalCompletedDebug(habitBusiness);
        console.log("\u{1F3AF} UI Method Results:", {
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
        console.error("\u274C Error in debugHabitState:", error);
        throw error;
      }
    });
  }
  /**
   * Debug version of isCompletedToday that logs its logic
   */
  isCompletedTodayDebug(habitBusiness) {
    console.log("\u{1F50D} isCompletedToday Debug for:", habitBusiness?.business_name);
    if (!habitBusiness?.last_completed_at) {
      console.log("\u274C No last_completed_at - returning false");
      return false;
    }
    const goalValue = habitBusiness.goal_value || 1;
    const currentProgress = habitBusiness.current_progress || 0;
    console.log("\u{1F4CA} Progress check:", { currentProgress, goalValue });
    if (goalValue > 1 && currentProgress < goalValue) {
      console.log("\u274C Multi-completion habit goal not met - returning false");
      return false;
    }
    if (currentProgress === 0) {
      console.log("\u274C Current progress is 0 - returning false");
      return false;
    }
    if (habitBusiness.frequency === "daily") {
      const today = /* @__PURE__ */ new Date();
      const todayString = this.getLocalDateString(today);
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = this.getLocalDateString(completionDate);
      console.log("\u{1F4C5} Date comparison:", {
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
  isGoalCompletedDebug(habitBusiness) {
    console.log("\u{1F50D} isGoalCompleted Debug for:", habitBusiness?.business_name);
    const goalValue = habitBusiness?.goal_value || 1;
    const currentProgress = habitBusiness?.current_progress || 0;
    console.log("\u{1F4CA} Goal check:", { currentProgress, goalValue });
    if (currentProgress < goalValue) {
      console.log("\u274C Goal not met - returning false");
      return false;
    }
    if (!habitBusiness?.last_completed_at) {
      console.log("\u274C No completion record - returning false");
      return false;
    }
    if (habitBusiness.frequency === "daily") {
      const today = /* @__PURE__ */ new Date();
      const todayString = this.getLocalDateString(today);
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = this.getLocalDateString(completionDate);
      console.log("\u{1F4C5} Date comparison for goal:", {
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
  cleanupHabitCompletions(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user)
          return;
        console.log("\u{1F6A8} Emergency cleanup for habit:", habitBusinessId);
        const { data: allCompletions, error: queryError } = yield this.supabase.from("habit_completions").select("*").eq("habit_business_id", habitBusinessId).eq("user_id", user.id).order("completed_at", { ascending: true });
        if (queryError) {
          console.error("Error fetching completions:", queryError);
          return;
        }
        if (!allCompletions || allCompletions.length === 0) {
          console.log("No completions found for this habit");
          return;
        }
        console.log(`Found ${allCompletions.length} completion records`);
        const completionsByDate = /* @__PURE__ */ new Map();
        const duplicatesToDelete = [];
        for (const completion of allCompletions) {
          const dateKey = completion.completed_at.split("T")[0];
          if (completionsByDate.has(dateKey)) {
            duplicatesToDelete.push(completion.id);
            console.log(`\u{1F5D1}\uFE0F Marking duplicate for deletion: ${completion.id} (${completion.completed_at})`);
          } else {
            completionsByDate.set(dateKey, completion);
            console.log(`\u2705 Keeping completion: ${completion.id} (${completion.completed_at})`);
          }
        }
        if (duplicatesToDelete.length > 0) {
          const { error: deleteError } = yield this.supabase.from("habit_completions").delete().in("id", duplicatesToDelete);
          if (deleteError) {
            console.error("Error deleting duplicates:", deleteError);
          } else {
            console.log(`\u2705 Deleted ${duplicatesToDelete.length} duplicate completion records`);
          }
        }
        const today = this.getLocalDateString();
        const todayCompletions = Array.from(completionsByDate.entries()).filter(([dateKey, completion]) => dateKey === today);
        const correctProgress = todayCompletions.length;
        console.log(`\u{1F4CA} Updating progress: today=${today}, todayCompletions=${correctProgress}`);
        const { error: updateError } = yield this.supabase.from("habit_businesses").update({
          current_progress: correctProgress,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", habitBusinessId);
        if (updateError) {
          console.error("Error updating habit progress:", updateError);
        } else {
          console.log(`\u2705 Updated habit progress to ${correctProgress}`);
        }
      } catch (error) {
        console.error("Error in cleanupHabitCompletions:", error);
      }
    });
  }
  /**
   * Check which habits need reset for a specific user (for debugging)
   */
  checkUserHabitsNeedReset(userId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.rpc("check_user_habits_need_reset", { user_uuid: userId });
        if (error) {
          console.error("Error checking user habits reset status:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("Error in checkUserHabitsNeedReset:", error);
        return [];
      }
    });
  }
  /**
   * Get friend businesses for the stocks page
   */
  getFriendBusinesses(userId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.rpc("get_friend_businesses_for_stocks", { user_uuid: userId });
        if (error) {
          console.error("Error loading friend businesses for stocks:", error);
          return [];
        }
        return (data || []).map((business) => ({
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
          priceMultiplier: business.price_multiplier || 1,
          sharesAvailable: business.shares_available || 200,
          totalShares: business.total_shares || 1e3,
          potentialDividend: business.potential_dividend || 0
        }));
      } catch (error) {
        console.error("Error in getFriendBusinesses:", error);
        return [];
      }
    });
  }
  /**
   * Get user's stock portfolio
   */
  getUserStockPortfolio(userId) {
    return __async(this, null, function* () {
      console.log("\u{1F50D} Loading portfolio for userId:", userId);
      console.log("\u{1F50D} User ID type:", typeof userId);
      console.log("\u{1F50D} User ID length:", userId?.length);
      try {
        console.log("\u{1F50D} About to call RPC function...");
        const { data, error } = yield this.supabase.rpc("get_user_stock_portfolio", { user_uuid: userId });
        console.log("\u{1F50D} Portfolio RPC response:", { data, error });
        console.log("\u{1F50D} Data type:", typeof data);
        console.log("\u{1F50D} Data is array:", Array.isArray(data));
        console.log("\u{1F50D} Data length:", data?.length);
        console.log("\u{1F50D} Raw data:", JSON.stringify(data, null, 2));
        if (error) {
          console.error("\u274C Error loading stock portfolio:", error);
          console.error("\u274C Error details:", error.message, error.code, error.hint);
          console.error("\u274C Full error object:", JSON.stringify(error, null, 2));
          return [];
        }
        console.log("\u{1F50D} Portfolio data length:", data?.length || 0);
        if (!data || data.length === 0) {
          console.log("\u26A0\uFE0F No portfolio data returned - checking if transactions exist...");
          const { data: rawTransactions, error: transactionsError } = yield this.supabase.from("stock_transactions").select("*").eq("buyer_id", userId).eq("transaction_type", "purchase");
          console.log("\u{1F50D} Raw transactions check:", { rawTransactions, transactionsError });
          console.log("\u{1F50D} Found", rawTransactions?.length || 0, "transactions for user");
          console.log("\u{1F50D} Testing direct RPC call...");
          const { data: testData, error: testError } = yield this.supabase.rpc("get_user_stock_portfolio", { user_uuid: "cf12469a-d7a2-40ef-82ca-21e8ade1d69b" });
          console.log("\u{1F50D} Test RPC result:", { testData, testError });
          return [];
        }
        const mappedData = (data || []).map((holding) => {
          console.log("\u{1F50D} Portfolio holding raw data:", holding);
          return {
            id: holding.holding_id,
            stockId: holding.stock_id,
            businessId: holding.business_id,
            // Add the business ID
            businessName: holding.business_name,
            businessIcon: holding.business_icon,
            ownerName: holding.owner_name,
            ownerId: holding.owner_id || holding.business_owner_id,
            // Add owner ID
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
        console.log("\u{1F50D} Mapped portfolio data:", mappedData);
        return mappedData;
      } catch (error) {
        console.error("\u274C Error in getUserStockPortfolio:", error);
        console.error("\u274C Full error object:", JSON.stringify(error, null, 2));
        return [];
      }
    });
  }
  /**
   * Purchase stock shares
   */
  purchaseStockShares(stockId, shares) {
    return __async(this, null, function* () {
      try {
        const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }
        const { data, error } = yield this.supabase.rpc("purchase_stock_shares", {
          buyer_id: user.id,
          stock_uuid: stockId,
          shares_to_buy: shares
        });
        if (error) {
          console.error("Error purchasing stock shares:", error);
          throw error;
        }
        if (!data.success) {
          throw new Error(data.error);
        }
        return data;
      } catch (error) {
        console.error("Error in purchaseStockShares:", error);
        throw error;
      }
    });
  }
  /**
   * Create business stock when a habit business is created
   */
  createBusinessStock(habitBusinessId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.rpc("create_business_stock", { habit_business_uuid: habitBusinessId });
        if (error) {
          console.error("Error creating business stock:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error in createBusinessStock:", error);
        throw error;
      }
    });
  }
  /**
   * Fix stock prices for all businesses (for debugging/maintenance)
   */
  fixAllStockPrices() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F527} Starting comprehensive stock price fix...");
        console.log("\u{1F527} Running database fixes...");
        const { error: sqlError } = yield this.supabase.rpc("execute_sql", {
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
          console.warn("SQL fix failed, continuing with individual updates:", sqlError);
        }
        const { data: businesses, error: businessError } = yield this.supabase.from("habit_businesses").select("id").eq("is_active", true);
        if (businessError) {
          throw businessError;
        }
        console.log(`\u{1F527} Updating stock prices for ${businesses?.length || 0} businesses...`);
        for (const business of businesses || []) {
          try {
            yield this.supabase.rpc("update_stock_price_by_streak", {
              habit_business_uuid: business.id
            });
            console.log(`\u2705 Updated stock price for business ${business.id}`);
          } catch (error) {
            console.warn(`\u26A0\uFE0F Failed to update stock price for business ${business.id}:`, error);
          }
        }
        console.log("\u{1F389} Comprehensive stock price fix complete!");
      } catch (error) {
        console.error("Error in fixAllStockPrices:", error);
        throw error;
      }
    });
  }
  /**
   * Fix lemonade stock prices specifically (direct database update)
   */
  fixLemonadeStockPrices() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F34B} Fixing lemonade stock prices...");
        const { data: lemonadeBusinesses, error: fetchError } = yield this.supabase.from("habit_businesses").select("id").or("business_icon.eq.\u{1F34B},earnings_per_completion.eq.1.00").eq("is_active", true);
        if (fetchError) {
          throw fetchError;
        }
        if (!lemonadeBusinesses || lemonadeBusinesses.length === 0) {
          console.log("No lemonade businesses found");
          return;
        }
        const businessIds = lemonadeBusinesses.map((b) => b.id);
        console.log(`Found ${businessIds.length} lemonade businesses:`, businessIds);
        const { error: updateError } = yield this.supabase.from("business_stocks").update({
          current_stock_price: 1,
          price_multiplier: 1,
          last_price_update: (/* @__PURE__ */ new Date()).toISOString()
        }).in("habit_business_id", businessIds);
        if (updateError) {
          throw updateError;
        }
        console.log("\u2705 Lemonade stock prices fixed!");
      } catch (error) {
        console.error("Error in fixLemonadeStockPrices:", error);
        throw error;
      }
    });
  }
  /**
   * Calculate potential dividend per share for a friend's business
   */
  calculatePotentialDividend(earningsPerCompletion, streak, currentProgress, goalValue) {
    const baseDividend = earningsPerCompletion * 0.1;
    const streakMultiplier = Math.min(1 + streak * 0.01, 2);
    const progressBonus = currentProgress >= goalValue ? 1.5 : 1;
    const totalDividendPool = baseDividend * streakMultiplier * progressBonus;
    const dividendPerShare = totalDividendPool / 100;
    return dividendPerShare;
  }
  /**
   * Get habit completion history for the specified period
   * When days = 365, returns current calendar year data (Jan 1 - Dec 31)
   * Otherwise returns the last N days from today
   */
  getHabitCompletionHistory(businessId, days = 30) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} getHabitCompletionHistory called with:", { businessId, days });
        let startDate;
        let endDate;
        if (days === 365) {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          startDate = new Date(currentYear, 0, 1);
          endDate = new Date(currentYear, 11, 31, 23, 59, 59);
          console.log("\u{1F4C5} Using calendar year mode for 365 days");
        } else {
          endDate = /* @__PURE__ */ new Date();
          startDate = /* @__PURE__ */ new Date();
          startDate.setDate(startDate.getDate() - days);
          console.log("\u{1F4C5} Using sliding window mode for", days, "days");
        }
        console.log("\u{1F4C5} Date range:", {
          startDate: this.getLocalDateString(startDate),
          endDate: this.getLocalDateString(endDate),
          mode: days === 365 ? "calendar-year" : "sliding-window"
        });
        const { data: completions, error } = yield this.supabase.from("habit_completions").select("id, completed_at, streak_count, earnings, habit_business_id").eq("habit_business_id", businessId).gte("completed_at", startDate.toISOString()).lte("completed_at", endDate.toISOString()).order("completed_at", { ascending: true });
        if (error) {
          console.error("\u274C Error fetching habit completions:", error);
          return [];
        }
        console.log("\u{1F4CA} Raw completion data from Supabase:", completions);
        console.log("\u{1F4C8} Number of completion records found:", completions?.length || 0);
        if (completions && completions.length > 0) {
          const businessIds = [...new Set(completions.map((c) => c.habit_business_id))];
          console.log("\u{1F50D} Business IDs found in completion data:", businessIds);
          console.log("\u{1F3AF} Requested business ID:", businessId);
          console.log("\u2705 Filtering match:", businessIds.includes(businessId) ? "YES" : "NO");
          const businessCompletions = completions.filter((c) => c.habit_business_id === businessId);
          console.log("\u{1F4C5} Completion dates for business", businessId.substring(0, 8) + "...:", businessCompletions.map((c) => ({
            id: c.id,
            date: c.completed_at,
            streak: c.streak_count,
            earnings: c.earnings,
            business_id: c.habit_business_id
          })));
          const uniqueDates = [...new Set(businessCompletions.map((c) => c.completed_at?.split("T")[0]))];
          console.log("\u{1F4C6} Unique completion dates:", uniqueDates.length, "dates:", uniqueDates);
          console.log("\u{1F50D} ALL completion records in query result:");
          completions.forEach((record, index) => {
            console.log(`  ${index + 1}. ID: ${record.id}, Business: ${record.habit_business_id?.substring(0, 8)}..., Date: ${record.completed_at?.split("T")[0]}, Earnings: ${record.earnings}`);
          });
        }
        const { data: allCompletions } = yield this.supabase.from("habit_completions").select("id, completed_at, streak_count, earnings, habit_business_id").order("completed_at", { ascending: true });
        console.log("\u{1F30D} TOTAL completion records in database:", allCompletions?.length);
        if (allCompletions && allCompletions.length > 0) {
          console.log("\u{1F30D} ALL completion records in database:");
          allCompletions.forEach((record, index) => {
            console.log(`  ${index + 1}. ID: ${record.id}, Business: ${record.habit_business_id?.substring(0, 8)}..., Date: ${record.completed_at?.split("T")[0]}`);
          });
          const duplicateDates = allCompletions.reduce((acc, record) => {
            const date = record.completed_at?.split("T")[0];
            if (!acc[date])
              acc[date] = [];
            acc[date].push(record);
            return acc;
          }, {});
          Object.entries(duplicateDates).forEach(([date, records]) => {
            const recordArray = records;
            if (recordArray.length > 1) {
              console.log(`\u26A0\uFE0F Date ${date} has ${recordArray.length} records:`, recordArray.map((r) => ({ id: r.id, business: r.habit_business_id?.substring(0, 8) + "..." })));
            }
          });
        }
        const dateRange = [];
        let currentStreak = 0;
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
        console.log("\u{1F4CA} Generating date range:", totalDays, "days from", this.getLocalDateString(startDate), "to", this.getLocalDateString(endDate));
        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
          const dateStr = this.getLocalDateString(currentDate);
          const completion = completions?.find((c) => c.completed_at && c.completed_at.startsWith(dateStr));
          const today = this.getLocalDateString(/* @__PURE__ */ new Date());
          if (dateStr === today || dateStr === "2025-08-20" || i < 5 || i >= totalDays - 5) {
            console.log(`\u{1F50D} Date ${i + 1}/${totalDays}: ${dateStr} = ${currentDate.toDateString()}, completion:`, completion ? "YES" : "NO");
          }
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
        console.log("\u2705 Generated date range with", dateRange.length, "days");
        const completedDates = dateRange.filter((d) => d.completed);
        console.log("\u{1F3AF} Completed days:", completedDates.length);
        console.log("\u{1F4C5} Completed dates:", completedDates.slice(0, 10).map((d) => d.date));
        return dateRange;
      } catch (error) {
        console.error("\u{1F4A5} Error in getHabitCompletionHistory:", error);
        return [];
      }
    });
  }
  /**
   * Get habit completion history for stocks - works across users for public stock data
   * This method uses a different approach that bypasses user restrictions for stock viewing
   */
  getHabitCompletionHistoryForStock(businessId, days = 30) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} getHabitCompletionHistoryForStock called with:", { businessId, days });
        let startDate;
        let endDate;
        if (days === 365) {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          startDate = new Date(currentYear, 0, 1);
          endDate = new Date(currentYear, 11, 31, 23, 59, 59);
          console.log("\u{1F4C5} Using calendar year mode for 365 days");
        } else {
          endDate = /* @__PURE__ */ new Date();
          startDate = /* @__PURE__ */ new Date();
          startDate.setDate(startDate.getDate() - days);
          console.log("\u{1F4C5} Using sliding window mode for", days, "days");
        }
        console.log("\u{1F4C5} Stock completion date range:", {
          startDate: this.getLocalDateString(startDate),
          endDate: this.getLocalDateString(endDate),
          mode: days === 365 ? "calendar-year" : "sliding-window"
        });
        console.log("\u{1F527} Calling RPC function with params:", {
          input_uuid: businessId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });
        const { data: completions, error } = yield this.supabase.rpc("get_habit_completions_for_stock", {
          input_uuid: businessId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });
        console.log("\u{1F50D} RPC Response:", { data: completions, error });
        if (error) {
          console.error("\u274C Error fetching stock habit completions:", error);
          console.error("\u274C Error details:", error.message, error.code, error.hint);
          return this.getHabitCompletionHistoryFallback(businessId, startDate, endDate);
        }
        console.log("\u{1F4CA} Raw stock completion data:", completions);
        console.log("\u{1F4C8} Number of stock completion records found:", completions?.length || 0);
        if (!completions || completions.length === 0) {
          console.warn("\u26A0\uFE0F No completion data returned for business:", businessId);
          console.log("\u{1F4DD} Debugging - params sent:", {
            input_uuid: businessId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          });
        }
        const dateRange = [];
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
        let currentStreak = 0;
        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const dateStr = this.getLocalDateString(currentDate);
          const completion = completions?.find((c) => {
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
        console.log("\u2705 Generated stock date range with", dateRange.length, "days");
        const completedDates = dateRange.filter((d) => d.completed);
        console.log("\u{1F3AF} Stock completed days:", completedDates.length);
        return dateRange;
      } catch (error) {
        console.error("\u{1F4A5} Error in getHabitCompletionHistoryForStock:", error);
        console.log("\u{1F504} Falling back to regular completion history method");
        return this.getHabitCompletionHistory(businessId, days);
      }
    });
  }
  /**
   * Calculate reasonable earnings per completion to prevent extreme values
   */
  calculateReasonableEarnings(basePay, goalValue) {
    if (!goalValue || goalValue <= 0) {
      return basePay;
    }
    const calculatedEarnings = basePay / goalValue;
    const maxEarnings = basePay;
    const minEarnings = Math.max(0.01, basePay * 0.01);
    return Math.min(maxEarnings, Math.max(minEarnings, calculatedEarnings));
  }
  /**
   * Fallback method for getting completion history when RPC is not available
   */
  getHabitCompletionHistoryFallback(businessId, startDate, endDate) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Using fallback method for completion history");
        const { data: completions, error } = yield this.supabase.from("habit_completions").select("id, completed_at, streak_count, habit_business_id").eq("habit_business_id", businessId).gte("completed_at", startDate.toISOString()).lte("completed_at", endDate.toISOString()).order("completed_at", { ascending: true });
        if (error) {
          console.error("\u274C Fallback query failed:", error);
          console.log("\u{1F6AB} No demo data - returning empty array");
          return [];
        }
        console.log("\u{1F4CA} Fallback completion data:", completions?.length || 0, "records");
        if (!completions || completions.length === 0) {
          console.log("\u{1F4ED} No completion data found - returning empty array");
          return [];
        }
        const dateRange = [];
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
        let currentStreak = 0;
        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const dateStr = this.getLocalDateString(currentDate);
          const completion = completions?.find((c) => {
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
        console.error("\u{1F4A5} Error in fallback method:", error);
        return [];
      }
    });
  }
  /**
   * Update display order for multiple habit businesses (used for drag-and-drop reordering)
   */
  updateHabitBusinessOrder(userId, orderedBusinessIds) {
    return __async(this, null, function* () {
      try {
        const updates = orderedBusinessIds.map((businessId, index) => ({
          id: businessId,
          display_order: index + 1,
          user_custom_order: index + 1,
          // Also update custom order to preserve user's choice
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }));
        for (const update of updates) {
          const { error } = yield this.supabase.from("habit_businesses").update({
            display_order: update.display_order,
            user_custom_order: update.user_custom_order,
            updated_at: update.updated_at
          }).eq("id", update.id).eq("user_id", userId);
          if (error) {
            console.error("Error updating habit business order:", error);
            throw error;
          }
        }
        console.log("\u2705 Successfully updated habit business order for", orderedBusinessIds.length, "items");
      } catch (error) {
        console.error("\u274C Error updating habit business order:", error);
        throw error;
      }
    });
  }
  /**
   * Move completed habits to bottom while preserving non-completed order
   */
  moveCompletedHabitsToBottom(userId) {
    return __async(this, null, function* () {
      try {
        const habits = yield this.getUserHabitBusinesses(userId);
        const nonCompleted = [];
        const completed = [];
        for (const habit of habits) {
          if (this.isHabitCompleteForToday(habit)) {
            completed.push(habit);
          } else {
            nonCompleted.push(habit);
          }
        }
        nonCompleted.sort((a, b) => a.user_custom_order - b.user_custom_order);
        completed.sort((a, b) => a.user_custom_order - b.user_custom_order);
        const newOrder = [...nonCompleted, ...completed];
        const orderedBusinessIds = newOrder.map((h) => h.id);
        for (let i = 0; i < orderedBusinessIds.length; i++) {
          const { error } = yield this.supabase.from("habit_businesses").update({
            display_order: i + 1,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", orderedBusinessIds[i]).eq("user_id", userId);
          if (error) {
            console.error("Error updating display order for completed habits:", error);
            throw error;
          }
        }
        console.log("\u2705 Successfully moved completed habits to bottom");
      } catch (error) {
        console.error("\u274C Error moving completed habits to bottom:", error);
        throw error;
      }
    });
  }
  /**
   * Reset habits to their user custom order (called when new day/week starts)
   */
  resetToCustomOrder(userId) {
    return __async(this, null, function* () {
      try {
        const habits = yield this.getUserHabitBusinesses(userId);
        for (const habit of habits) {
          const { error } = yield this.supabase.from("habit_businesses").update({
            display_order: habit.user_custom_order,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", habit.id).eq("user_id", userId);
          if (error) {
            console.error("Error resetting individual habit to custom order:", error);
            throw error;
          }
        }
        console.log("\u2705 Successfully reset habits to custom order");
      } catch (error) {
        console.error("\u274C Error resetting to custom order:", error);
        throw error;
      }
    });
  }
  /**
   * Check if a habit is completed for the current interval period.
   * Delegates to HabitIntervalService.
   */
  isHabitCompleteForToday(habitBusiness) {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(habitBusiness);
  }
};
_HabitBusinessService.\u0275fac = function HabitBusinessService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HabitBusinessService)(\u0275\u0275inject(SupabaseService));
};
_HabitBusinessService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _HabitBusinessService, factory: _HabitBusinessService.\u0275fac, providedIn: "root" });
var HabitBusinessService = _HabitBusinessService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HabitBusinessService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: SupabaseService }], null);
})();

export {
  HabitIntervalService,
  HabitBusinessService
};
//# sourceMappingURL=chunk-GSSZ5PLU.js.map
