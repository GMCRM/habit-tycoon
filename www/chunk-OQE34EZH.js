import {
  Injectable,
  SupabaseService,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-AYR3XDH5.js";
import {
  __async
} from "./chunk-QXFS4N4X.js";

// src/app/services/auth.service.ts
var _AuthService = class _AuthService {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
    this.supabase = supabaseService.client;
  }
  // Google OAuth sign up
  signUpWithGoogle() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Starting Google OAuth signup...");
        const { data, error } = yield this.supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: this.getRedirectUrl()
          }
        });
        if (error) {
          console.error("\u274C Google OAuth failed:", error);
          throw error;
        }
        console.log("\u2705 Google OAuth initiated:", data);
        return { data, error: null };
      } catch (error) {
        console.error("\u274C Google signup failed:", error);
        return { data: null, error };
      }
    });
  }
  // Get platform-specific redirect URL
  getRedirectUrl() {
    if (this.isMobile()) {
      return `io.ionic.habittycoon://auth/callback`;
    } else {
      const isGitHubPages = window.location.hostname === "gmcrm.github.io";
      if (isGitHubPages) {
        return `${window.location.origin}/habit-tycoon/`;
      } else {
        return `${window.location.origin}/`;
      }
    }
  }
  // Check if running on mobile platform
  isMobile() {
    return window.location.protocol === "capacitor:";
  }
  // Google OAuth sign in (same as sign up)
  signInWithGoogle() {
    return __async(this, null, function* () {
      return this.signUpWithGoogle();
    });
  }
  signUp(email, password, displayName) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Starting signup process...");
        console.log("Email:", email);
        console.log("Display name:", displayName);
        const { data: authData, error: authError } = yield this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: displayName || email.split("@")[0]
            }
          }
        });
        if (authError) {
          console.error("\u274C Auth signup failed:", authError);
          throw authError;
        }
        console.log("\u2705 Auth user created:", authData.user?.id);
        if (authData.user) {
          try {
            console.log("\u{1F504} Checking if profile was created by trigger...");
            yield new Promise((resolve) => setTimeout(resolve, 1e3));
            const profile = yield this.getUserProfile(authData.user.id);
            console.log("\u2705 Profile found via trigger:", profile);
          } catch (profileError) {
            console.warn("\u26A0\uFE0F Profile not created by trigger, creating manually...");
            console.error("Profile check error:", profileError);
            try {
              const manualProfile = yield this.createUserProfile(authData.user.id, email, displayName || email.split("@")[0]);
              console.log("\u2705 Profile created manually:", manualProfile);
            } catch (manualError) {
              console.error("\u274C Manual profile creation failed:", manualError);
              console.warn("\u26A0\uFE0F Profile creation failed, but auth user exists. User can still log in.");
            }
          }
        }
        return { data: authData, error: null };
      } catch (error) {
        console.error("\u274C Complete signup failed:", error);
        if (error instanceof Error) {
          return {
            data: null,
            error: {
              message: error.message,
              details: error
            }
          };
        }
        return {
          data: null,
          error: {
            message: "Unknown signup error",
            details: error
          }
        };
      }
    });
  }
  signIn(email, password) {
    return __async(this, null, function* () {
      const { data, error } = yield this.supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error)
        throw error;
      return data;
    });
  }
  signOut() {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.auth.signOut();
      if (error)
        throw error;
    });
  }
  // Password Reset
  resetPassword(email) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Sending password reset email to:", email);
        const isGitHubPages = window.location.hostname === "gmcrm.github.io";
        const resetUrl = isGitHubPages ? `${window.location.origin}/habit-tycoon/#/reset-password` : `${window.location.origin}/#/reset-password`;
        const { data, error } = yield this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetUrl
        });
        if (error) {
          console.error("\u274C Password reset failed:", error);
          throw error;
        }
        console.log("\u2705 Password reset email sent successfully");
        return { data, error: null };
      } catch (error) {
        console.error("\u274C Password reset failed:", error);
        return { data: null, error };
      }
    });
  }
  // Update password (called from reset password page)
  updatePassword(newPassword) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Updating password...");
        const { data, error } = yield this.supabase.auth.updateUser({
          password: newPassword
        });
        if (error) {
          console.error("\u274C Password update failed:", error);
          throw error;
        }
        console.log("\u2705 Password updated successfully");
        return { data, error: null };
      } catch (error) {
        console.error("\u274C Password update failed:", error);
        return { data: null, error };
      }
    });
  }
  getUser() {
    return this.supabase.auth.getUser();
  }
  // Get current session
  getSession() {
    return this.supabase.auth.getSession();
  }
  // Listen to auth state changes
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
  // User Profile Management
  // Method to manually create user profile
  createUserProfile(userId, email, name) {
    return __async(this, null, function* () {
      console.log("\u{1F504} Creating profile manually...");
      console.log("User ID:", userId);
      console.log("Email:", email);
      console.log("Name:", name);
      try {
        const { data, error } = yield this.supabase.from("user_profiles").insert([
          {
            id: userId,
            email,
            name: name || email.split("@")[0],
            cash: 100,
            net_worth: 100
          }
        ]).select().single();
        if (error) {
          console.error("\u274C Profile creation error:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        console.log("\u2705 Profile created successfully:", data);
        return data;
      } catch (error) {
        console.error("\u274C Profile creation failed with exception:", error);
        throw error;
      }
    });
  }
  getUserProfile(userId) {
    return __async(this, null, function* () {
      const { data, error } = yield this.supabase.from("user_profiles").select("*").eq("id", userId).single();
      if (error) {
        if (error.code === "PGRST116") {
          console.log("\u2139\uFE0F Profile not found for user:", userId);
          return null;
        }
        console.error("\u274C Profile fetch error:", error);
        throw error;
      }
      return data;
    });
  }
  // Ensure user profile exists with proper cash initialization
  // This method is specifically designed to handle Safari/iPad issues with retries
  ensureUserProfileExists(user) {
    return __async(this, null, function* () {
      try {
        if (!user) {
          const { data: { user: currentUser } } = yield this.supabase.auth.getUser();
          user = currentUser;
        }
        if (!user) {
          throw new Error("No authenticated user found");
        }
        console.log("\u{1F50D} Ensuring profile exists for user:", user.id);
        let profile;
        try {
          profile = yield this.getUserProfile(user.id);
          if (profile && profile.cash !== void 0 && profile.cash !== null) {
            console.log("\u2705 Profile already exists with proper cash:", profile);
            return profile;
          }
        } catch (error) {
          console.log("\u2139\uFE0F Profile does not exist yet, will create:", error instanceof Error ? error.message : error);
        }
        console.log("\u{1F504} Creating/updating profile for user:", user.id);
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1e3;
        while (retryCount < maxRetries) {
          try {
            const { data, error } = yield this.supabase.from("user_profiles").upsert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.["full_name"] || user.user_metadata?.["name"] || user.email.split("@")[0],
              cash: 100,
              net_worth: 100
            }, {
              onConflict: "id"
            }).select().single();
            if (error) {
              console.error(`\u274C Profile creation attempt ${retryCount + 1} failed:`, error);
              if (retryCount === maxRetries - 1) {
                throw error;
              }
            } else {
              console.log("\u2705 Profile created/updated successfully:", data);
              return data;
            }
          } catch (error) {
            console.error(`\u274C Profile creation attempt ${retryCount + 1} exception:`, error);
            if (retryCount === maxRetries - 1) {
              throw error;
            }
          }
          retryCount++;
          console.log(`\u23F3 Retrying profile creation in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          yield new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error("\u274C Failed to ensure profile exists:", error);
        throw error;
      }
    });
  }
  // Force create profile for current authenticated user
  forceCreateCurrentUserProfile() {
    return __async(this, null, function* () {
      try {
        const { data: { user } } = yield this.supabase.auth.getUser();
        if (!user) {
          throw new Error("No authenticated user found");
        }
        console.log("\u{1F504} Force creating profile for current user...");
        console.log("User details:", {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.["full_name"] || user.user_metadata?.["name"]
        });
        const { data, error } = yield this.supabase.from("user_profiles").upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.["full_name"] || user.user_metadata?.["name"] || user.email.split("@")[0],
          cash: 100,
          net_worth: 100
        }, {
          onConflict: "id"
        }).select().single();
        if (error) {
          console.error("\u274C Force profile creation failed:", error);
          throw error;
        }
        console.log("\u2705 Profile force created/updated successfully:", data);
        return data;
      } catch (error) {
        console.error("\u274C Force profile creation exception:", error);
        throw error;
      }
    });
  }
  updateUserProfile(userId, updates) {
    return __async(this, null, function* () {
      const { data, error } = yield this.supabase.from("user_profiles").update(updates).eq("id", userId).select();
      if (error)
        throw error;
      return data;
    });
  }
  // Testing method to get all profiles (for debugging)
  getAllProfiles() {
    return __async(this, null, function* () {
      const { data, error } = yield this.supabase.from("user_profiles").select("*");
      if (error) {
        console.error("Error getting all profiles:", error);
        throw error;
      }
      return data;
    });
  }
  // Testing method to get all auth users (for debugging)
  getAllAuthUsers() {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.auth.admin.listUsers();
        if (error) {
          console.error("Error getting auth users:", error);
          return [];
        }
        return data.users;
      } catch (error) {
        console.error("Admin access not available:", error);
        return [];
      }
    });
  }
  deleteUserProfile(userId) {
    return __async(this, null, function* () {
      const { data, error } = yield this.supabase.from("user_profiles").delete().eq("id", userId);
      if (error)
        throw error;
      return data;
    });
  }
  // Delete the actual auth user account using SQL function
  deleteAuthUser() {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.rpc("delete_user_completely");
        if (error) {
          console.error("SQL function delete failed:", error);
          return { error };
        }
        console.log("Delete result:", data);
        if (data && data.success) {
          return { error: null };
        } else {
          return { error: new Error(data?.message || "Deletion failed") };
        }
      } catch (error) {
        console.error("Auth user deletion failed:", error);
        return { error };
      }
    });
  }
  // Reset account progress while preserving friendships and auth identity
  resetAccountProgressKeepFriends() {
    return __async(this, null, function* () {
      const { data: { user }, error: userError } = yield this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      const runDelete = (table, filters) => __async(this, null, function* () {
        let query = this.supabase.from(table).delete();
        for (const filter of filters) {
          query = query.eq(filter.column, filter.value);
        }
        const { error } = yield query;
        if (error) {
          console.warn(`Reset cleanup warning for ${table}:`, error.message);
        }
      });
      yield runDelete("social_likes", [{ column: "user_id", value: user.id }]);
      yield runDelete("social_posts", [{ column: "user_id", value: user.id }]);
      yield runDelete("challenge_participants", [{ column: "user_id", value: user.id }]);
      yield runDelete("challenges", [{ column: "creator_id", value: user.id }]);
      const { error: clearPokesError } = yield this.supabase.from("social_pokes").delete().or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
      if (clearPokesError) {
        console.warn("Reset cleanup warning for social_pokes:", clearPokesError.message);
      }
      const { data: userHoldings } = yield this.supabase.from("stock_holdings").select("stock_id, shares_owned").eq("holder_id", user.id).gt("shares_owned", 0);
      if (userHoldings && userHoldings.length > 0) {
        for (const holding of userHoldings) {
          const { data: stockRow } = yield this.supabase.from("business_stocks").select("shares_available").eq("id", holding.stock_id).single();
          if (stockRow) {
            yield this.supabase.from("business_stocks").update({
              shares_available: stockRow.shares_available + holding.shares_owned,
              updated_at: nowIso
            }).eq("id", holding.stock_id);
          }
        }
      }
      yield runDelete("stock_dividend_distributions", [{ column: "stockholder_id", value: user.id }]);
      yield runDelete("stock_holdings", [{ column: "holder_id", value: user.id }]);
      const { error: clearBuyTxError } = yield this.supabase.from("stock_transactions").delete().eq("buyer_id", user.id).eq("transaction_type", "purchase");
      if (clearBuyTxError) {
        console.warn("Reset cleanup warning for stock_transactions (purchases):", clearBuyTxError.message);
      }
      const { error: clearSellTxError } = yield this.supabase.from("stock_transactions").delete().eq("seller_id", user.id).eq("transaction_type", "sale");
      if (clearSellTxError) {
        console.warn("Reset cleanup warning for stock_transactions (sales):", clearSellTxError.message);
      }
      yield runDelete("habit_completions", [{ column: "user_id", value: user.id }]);
      const { error: deactivateHabitsError } = yield this.supabase.from("habit_businesses").update({
        is_active: false,
        current_progress: 0,
        streak: 0,
        updated_at: nowIso
      }).eq("user_id", user.id).eq("is_active", true);
      if (deactivateHabitsError) {
        throw new Error(`Failed to reset habits: ${deactivateHabitsError.message}`);
      }
      const { error: resetProfileError } = yield this.supabase.from("user_profiles").update({
        cash: 100,
        net_worth: 100,
        updated_at: nowIso
      }).eq("id", user.id);
      if (resetProfileError) {
        throw new Error(`Failed to reset profile: ${resetProfileError.message}`);
      }
      return { success: true };
    });
  }
  // Test methods for database connectivity
  testConnection() {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.from("users").select("count", { count: "exact", head: true });
        if (error && error.code !== "PGRST116") {
          throw error;
        }
        return { success: true, message: "Database connection successful!" };
      } catch (error) {
        return { success: false, message: "Database connection failed", error };
      }
    });
  }
  testAuthConnection() {
    return __async(this, null, function* () {
      try {
        const { data: { session }, error } = yield this.supabase.auth.getSession();
        if (error)
          throw error;
        return {
          success: true,
          message: "Auth system working!",
          hasActiveSession: !!session,
          sessionInfo: session ? { user: session.user.email, expires: session.expires_at } : null
        };
      } catch (error) {
        return { success: false, message: "Auth connection failed", error };
      }
    });
  }
};
_AuthService.\u0275fac = function AuthService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AuthService)(\u0275\u0275inject(SupabaseService));
};
_AuthService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthService, factory: _AuthService.\u0275fac, providedIn: "root" });
var AuthService = _AuthService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: SupabaseService }], null);
})();

export {
  AuthService
};
//# sourceMappingURL=chunk-OQE34EZH.js.map
