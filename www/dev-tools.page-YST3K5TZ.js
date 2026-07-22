import {
  HabitBusinessService
} from "./chunk-257QJYN5.js";
import {
  addIcons,
  alertCircle,
  cafe,
  cash,
  checkmarkCircle,
  home,
  logOut,
  refresh,
  wallet
} from "./chunk-DTAWB6F7.js";
import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  CommonModule,
  Component,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  NgIf,
  Router,
  RouterLink,
  ToastController,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-AYR3XDH5.js";
import "./chunk-V2J65Z2B.js";
import "./chunk-T5LCTCQ6.js";
import "./chunk-BDY4MMQO.js";
import "./chunk-VQKLPVPX.js";
import "./chunk-B2G3T75T.js";
import "./chunk-RCE426I7.js";
import "./chunk-IHOOIKDP.js";
import "./chunk-X32UASKS.js";
import "./chunk-7GPIVXJN.js";
import "./chunk-CEAAMTO4.js";
import "./chunk-256GWCFY.js";
import "./chunk-5EU4VLVR.js";
import "./chunk-GZ5BDCOT.js";
import "./chunk-HUY7ESWV.js";
import "./chunk-GXFEW35R.js";
import {
  __async
} from "./chunk-QXFS4N4X.js";

// src/app/dev-tools/dev-tools.page.ts
function DevToolsPage_ion_button_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 31);
    \u0275\u0275listener("click", function DevToolsPage_ion_button_7_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.logout());
    });
    \u0275\u0275element(1, "ion-icon", 32);
    \u0275\u0275text(2, " Logout ");
    \u0275\u0275elementEnd();
  }
}
function DevToolsPage_div_10_span_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" with $", ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash, " cash");
  }
}
function DevToolsPage_div_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33)(1, "ion-card", 34)(2, "ion-card-content")(3, "h2");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p");
    \u0275\u0275text(6, " You're successfully logged in ");
    \u0275\u0275template(7, DevToolsPage_div_10_span_7_Template, 2, 1, "span", 35);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" \u{1F389} Welcome back, ", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.name) || (ctx_r1.currentUser.user_metadata == null ? null : ctx_r1.currentUser.user_metadata.name) || ctx_r1.currentUser.email, "! ");
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) !== void 0);
  }
}
function DevToolsPage_div_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 36)(1, "ion-card")(2, "ion-card-header")(3, "ion-card-title");
    \u0275\u0275text(4, "\u{1F464} Your Profile Data");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "ion-card-content")(6, "div", 37)(7, "p")(8, "strong");
    \u0275\u0275text(9, "User ID:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "p")(12, "strong");
    \u0275\u0275text(13, "Email:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "p")(16, "strong");
    \u0275\u0275text(17, "Auth Name:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "p")(20, "strong");
    \u0275\u0275text(21, "Profile Name:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(22);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "p")(24, "strong");
    \u0275\u0275text(25, "Cash:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(26);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "p")(28, "strong");
    \u0275\u0275text(29, "Net Worth:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(30);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "p")(32, "strong");
    \u0275\u0275text(33, "Created:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(34);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "div", 38)(36, "ion-button", 39);
    \u0275\u0275listener("click", function DevToolsPage_div_11_Template_ion_button_click_36_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.deleteAccount());
    });
    \u0275\u0275text(37, " \u{1F5D1}\uFE0F Delete Account ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "ion-button", 40);
    \u0275\u0275listener("click", function DevToolsPage_div_11_Template_ion_button_click_38_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.refreshProfile());
    });
    \u0275\u0275text(39, " \u{1F504} Refresh Profile ");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1(" ", ctx_r1.currentUser.id);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r1.currentUser.email);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", (ctx_r1.currentUser.user_metadata == null ? null : ctx_r1.currentUser.user_metadata.name) || "Not set", " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.name) || "Loading...", " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" $", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) || "Loading...", " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" $", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.net_worth) || "Loading...", " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.created_at) || "Loading...", " ");
  }
}
function DevToolsPage_div_29_p_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Error: ", ctx_r1.dbTestResult.error.message || ctx_r1.dbTestResult.error, " ");
  }
}
function DevToolsPage_div_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 41)(1, "ion-item", 42);
    \u0275\u0275element(2, "ion-icon", 43);
    \u0275\u0275elementStart(3, "ion-label")(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275template(6, DevToolsPage_div_29_p_6_Template, 2, 1, "p", 35);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("color", ctx_r1.dbTestResult.success ? "success" : "danger");
    \u0275\u0275advance();
    \u0275\u0275property("name", ctx_r1.dbTestResult.success ? "checkmark-circle" : "alert-circle");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.dbTestResult.message);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.dbTestResult.success && ctx_r1.dbTestResult.error);
  }
}
function DevToolsPage_div_40_p_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Active session found! User: ", ctx_r1.authTestResult.sessionInfo == null ? null : ctx_r1.authTestResult.sessionInfo.user, " ");
  }
}
function DevToolsPage_div_40_p_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1, " No active session (user not logged in) ");
    \u0275\u0275elementEnd();
  }
}
function DevToolsPage_div_40_p_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Error: ", ctx_r1.authTestResult.error.message || ctx_r1.authTestResult.error, " ");
  }
}
function DevToolsPage_div_40_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 41)(1, "ion-item", 42);
    \u0275\u0275element(2, "ion-icon", 43);
    \u0275\u0275elementStart(3, "ion-label")(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275template(6, DevToolsPage_div_40_p_6_Template, 2, 1, "p", 35)(7, DevToolsPage_div_40_p_7_Template, 2, 0, "p", 35)(8, DevToolsPage_div_40_p_8_Template, 2, 1, "p", 35);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("color", ctx_r1.authTestResult.success ? "success" : "danger");
    \u0275\u0275advance();
    \u0275\u0275property("name", ctx_r1.authTestResult.success ? "checkmark-circle" : "alert-circle");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.authTestResult.message);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.authTestResult.success && ctx_r1.authTestResult.hasActiveSession);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.authTestResult.success && !ctx_r1.authTestResult.hasActiveSession);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.authTestResult.success && ctx_r1.authTestResult.error);
  }
}
function DevToolsPage_div_119_p_6_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Dividend Change: $", ctx_r1.dividendTestResult.details.dividendsDifference.toFixed(2), " ");
  }
}
function DevToolsPage_div_119_p_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1);
    \u0275\u0275element(2, "br");
    \u0275\u0275text(3);
    \u0275\u0275element(4, "br");
    \u0275\u0275template(5, DevToolsPage_div_119_p_6_span_5_Template, 2, 1, "span", 35);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Test Habit: ", ctx_r1.dividendTestResult.details.testHabit);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Holdings: ", ctx_r1.dividendTestResult.details.holdingsCount || ctx_r1.dividendTestResult.details.specificHoldings);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r1.dividendTestResult.details.dividendsDifference !== void 0);
  }
}
function DevToolsPage_div_119_p_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Error: ", ctx_r1.dividendTestResult.error.message || ctx_r1.dividendTestResult.error, " ");
  }
}
function DevToolsPage_div_119_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 41)(1, "ion-item", 42);
    \u0275\u0275element(2, "ion-icon", 43);
    \u0275\u0275elementStart(3, "ion-label")(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275template(6, DevToolsPage_div_119_p_6_Template, 6, 3, "p", 35)(7, DevToolsPage_div_119_p_7_Template, 2, 1, "p", 35);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("color", ctx_r1.dividendTestResult.success ? "success" : "danger");
    \u0275\u0275advance();
    \u0275\u0275property("name", ctx_r1.dividendTestResult.success ? "checkmark-circle" : "alert-circle");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.dividendTestResult.message);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.dividendTestResult.details);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.dividendTestResult.success && ctx_r1.dividendTestResult.error);
  }
}
var _DevToolsPage = class _DevToolsPage {
  constructor(authService, habitBusinessService, router, toastController) {
    this.authService = authService;
    this.habitBusinessService = habitBusinessService;
    this.router = router;
    this.toastController = toastController;
    this.dbTestResult = null;
    this.authTestResult = null;
    this.isTestingDb = false;
    this.isTestingAuth = false;
    this.isTestingDividends = false;
    this.isFixingStockPrices = false;
    this.isFixingLemonadeStocks = false;
    this.isAddingMoney = false;
    this.isRemovingMoney = false;
    this.currentUser = null;
    this.userProfile = null;
    this.dividendTestResult = null;
    addIcons({ checkmarkCircle, alertCircle, refresh, logOut, home, cash, cafe, wallet });
    this.loadCurrentUser();
  }
  loadCurrentUser() {
    return __async(this, null, function* () {
      try {
        const { data: { user } } = yield this.authService.getUser();
        console.log("Current user from auth:", user);
        this.currentUser = user;
        if (user) {
          try {
            console.log("Attempting to load profile for user ID:", user.id);
            this.userProfile = yield this.authService.getUserProfile(user.id);
            console.log("Loaded user profile:", this.userProfile);
          } catch (error) {
            console.error("Profile loading failed:", error);
            try {
              console.log("Attempting to create profile manually...");
              yield this.authService.createUserProfile(user.id, user.email, user.user_metadata?.["name"] || user.email.split("@")[0]);
              this.userProfile = yield this.authService.getUserProfile(user.id);
              console.log("Created and loaded profile:", this.userProfile);
            } catch (createError) {
              console.error("Profile creation failed:", createError);
            }
          }
        }
      } catch (error) {
        console.log("No user logged in");
      }
    });
  }
  testDatabaseConnection() {
    return __async(this, null, function* () {
      this.isTestingDb = true;
      this.dbTestResult = null;
      try {
        this.dbTestResult = yield this.authService.testConnection();
      } catch (error) {
        this.dbTestResult = { success: false, message: "Test failed", error };
      }
      this.isTestingDb = false;
    });
  }
  testAuthSystem() {
    return __async(this, null, function* () {
      this.isTestingAuth = true;
      this.authTestResult = null;
      try {
        this.authTestResult = yield this.authService.testAuthConnection();
      } catch (error) {
        this.authTestResult = { success: false, message: "Auth test failed", error };
      }
      this.isTestingAuth = false;
    });
  }
  runAllTests() {
    return __async(this, null, function* () {
      yield this.testDatabaseConnection();
      yield this.testAuthSystem();
    });
  }
  logout() {
    return __async(this, null, function* () {
      try {
        yield this.authService.signOut();
        alert("\u{1F44B} Successfully logged out!");
        this.router.navigate(["/login"]);
      } catch (error) {
        alert("\u274C Logout failed: " + error.message);
      }
    });
  }
  refreshProfile() {
    return __async(this, null, function* () {
      yield this.loadCurrentUser();
      alert("\u{1F504} Profile refreshed!");
    });
  }
  // Force create profile for current user
  forceCreateProfile() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Force creating profile...");
        const profile = yield this.authService.forceCreateCurrentUserProfile();
        console.log("\u2705 Profile force created:", profile);
        yield this.loadCurrentUser();
        alert("\u2705 Profile created successfully!\n\nName: " + profile.name + "\nCash: $" + profile.cash + "\nNet Worth: $" + profile.net_worth);
      } catch (error) {
        console.error("\u274C Force profile creation failed:", error);
        alert("\u274C Profile creation failed: " + error);
      }
    });
  }
  // Add method to check all profiles in database
  checkAllProfiles() {
    return __async(this, null, function* () {
      console.log("\u{1F50D} Checking all profiles in database...");
      try {
        const allProfiles = yield this.authService.getAllProfiles();
        console.log("All profiles found:", allProfiles);
        const allUsers = yield this.authService.getAllAuthUsers();
        console.log("All auth users found:", allUsers);
        const { data: { user } } = yield this.authService.getUser();
        console.log("Current auth user:", user);
        let profileDetails = "";
        if (allProfiles && allProfiles.length > 0) {
          profileDetails = allProfiles.map((profile) => {
            const isCurrentUser = user && profile.id === user.id ? " (THIS IS YOU!)" : "";
            return `ID: ${profile.id}${isCurrentUser}
Email: ${profile.email}
Name: ${profile.name}
Cash: $${profile.cash}
Created: ${profile.created_at}`;
          }).join("\n\n");
        }
        const currentUserInfo = user ? `
Current User ID: ${user.id}
Current User Email: ${user.email}` : "\nNo current user logged in";
        alert(`Found ${allProfiles?.length || 0} profiles and ${allUsers?.length || 0} auth users.

Profile Details:
${profileDetails}${currentUserInfo}

Check console for more details.`);
      } catch (error) {
        console.error("Error checking profiles:", error);
        alert("Error checking profiles: " + error);
      }
    });
  }
  deleteAccount() {
    return __async(this, null, function* () {
      if (!this.currentUser) {
        alert("No user logged in");
        return;
      }
      const confirmDelete = confirm(`Are you sure you want to PERMANENTLY delete your account?

This will:
- Delete your profile data
- Delete your authentication account
- Sign you out completely
- Cannot be undone

Continue?`);
      if (!confirmDelete)
        return;
      try {
        console.log("\u{1F5D1}\uFE0F Starting complete account deletion...");
        console.log("Calling server-side delete function...");
        const { error: deleteError } = yield this.authService.deleteAuthUser();
        if (deleteError) {
          console.error("\u274C Server-side deletion failed:", deleteError);
          console.log("Falling back to profile deletion only...");
          yield this.authService.deleteUserProfile(this.currentUser.id);
          yield this.authService.signOut();
          localStorage.clear();
          sessionStorage.clear();
          this.currentUser = null;
          this.userProfile = null;
          alert("Profile deleted and signed out successfully!\n\nNote: Complete auth account deletion failed. You may be able to log in again.\n\nFor complete deletion, contact support or delete manually from Supabase dashboard.");
        } else {
          console.log("\u2705 Complete account deletion successful");
          localStorage.clear();
          sessionStorage.clear();
          this.currentUser = null;
          this.userProfile = null;
          alert("Account completely deleted! You cannot log in with these credentials anymore.");
        }
        this.router.navigate(["/login"]);
      } catch (error) {
        console.error("\u274C Account deletion failed:", error);
        alert("Account deletion failed: " + error);
      }
    });
  }
  // Debug function to check habit business status
  debugHabitBusinesses() {
    return __async(this, null, function* () {
      if (!this.currentUser) {
        alert("No user logged in");
        return;
      }
      try {
        console.log("\u{1F50D} Debugging habit businesses...");
        const habitBusinesses = yield this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
        console.log("All habit businesses:", habitBusinesses);
        const habitsNeedingReset = yield this.habitBusinessService.checkUserHabitsNeedReset(this.currentUser.id);
        console.log("Habits needing reset:", habitsNeedingReset);
        const todaysEarnings = yield this.habitBusinessService.getTodaysActualEarnings(this.currentUser.id);
        console.log("Today's actual earnings:", todaysEarnings);
        let debugInfo = `Found ${habitBusinesses.length} habit businesses:

`;
        habitBusinesses.forEach((hb) => {
          debugInfo += `${hb.business_name} (${hb.frequency}):
`;
          debugInfo += `  Progress: ${hb.current_progress || 0}/${hb.goal_value || 1}
`;
          debugInfo += `  Last completed: ${hb.last_completed_at || "never"}
`;
          debugInfo += `  Streak: ${hb.streak || 0}
`;
          debugInfo += `  Earnings per completion: $${hb.earnings_per_completion}

`;
        });
        debugInfo += `Today's actual earnings: $${todaysEarnings}

`;
        if (habitsNeedingReset.length > 0) {
          debugInfo += `Habits needing reset: ${habitsNeedingReset.length}
`;
          habitsNeedingReset.forEach((habit) => {
            debugInfo += `  ${habit.business_name} (last completed: ${habit.last_completed_date})
`;
          });
        } else {
          debugInfo += "No habits need reset.\n";
        }
        alert(debugInfo);
      } catch (error) {
        console.error("Error debugging habit businesses:", error);
        alert("Error debugging habit businesses: " + error);
      }
    });
  }
  // Test the reset function
  testResetOutdatedHabits() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Testing reset outdated habits function...");
        yield this.habitBusinessService.resetOutdatedDailyHabits();
        yield this.showToast("\u2705 Reset outdated habits test completed!", "success");
      } catch (error) {
        console.error("\u274C Reset outdated habits test failed:", error);
        yield this.showToast("\u274C Reset outdated habits test failed", "danger");
      }
    });
  }
  cleanupAllHabits() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F6A8} Starting emergency cleanup of all habit duplicates...");
        if (!this.currentUser) {
          yield this.showToast("\u274C User not authenticated", "danger");
          return;
        }
        const habits = yield this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
        if (habits && habits.length > 0) {
          let totalCleaned = 0;
          for (const habit of habits) {
            console.log(`\u{1F9F9} Cleaning habit: ${habit.business_name}`);
            yield this.habitBusinessService.cleanupHabitCompletions(habit.id);
            totalCleaned++;
          }
          yield this.showToast(`\u2705 Cleaned up ${totalCleaned} habits successfully!`, "success");
          console.log(`\u2705 Emergency cleanup completed for ${totalCleaned} habits`);
        } else {
          yield this.showToast("\u2139\uFE0F No habits found to clean up", "warning");
        }
      } catch (error) {
        console.error("\u274C Emergency cleanup failed:", error);
        yield this.showToast("\u274C Emergency cleanup failed", "danger");
      }
    });
  }
  testDividendProcessing() {
    return __async(this, null, function* () {
      if (!this.currentUser) {
        yield this.showToast("No user logged in", "danger");
        return;
      }
      this.isTestingDividends = true;
      this.dividendTestResult = null;
      try {
        console.log("\u{1F9EA} Testing dividend processing...");
        const debugInfo = yield this.habitBusinessService.getDividendSystemDebugInfo(this.currentUser.id);
        console.log("\u{1F4CA} Dividend system debug info:", debugInfo);
        if (debugInfo.userHoldings.length === 0) {
          console.log("\u{1F4A1} No stock holdings found. Creating test dividend...");
          yield this.habitBusinessService.createTestDividend(this.currentUser.id, 7.5);
          const updatedDividends = yield this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
          this.dividendTestResult = {
            success: true,
            message: "Test dividend created successfully",
            details: {
              testType: "Created test dividend (no holdings)",
              testAmount: 7.5,
              newTotalDividends: updatedDividends,
              userHoldings: debugInfo.userHoldings.length,
              ownedBusinessStocks: debugInfo.ownedBusinessStocks.length,
              recentDistributions: debugInfo.recentDividendDistributions.length
            }
          };
        } else {
          const habits = yield this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
          console.log("Found habits:", habits);
          if (habits.length === 0) {
            throw new Error("No habit businesses found for testing");
          }
          const testHabit = habits[0];
          console.log("Testing with habit:", testHabit);
          const stocks = yield this.habitBusinessService.getAvailableStocks(this.currentUser.id);
          const stockInfo = stocks.find((s) => s.habit_business_id === testHabit.id);
          if (!stockInfo) {
            throw new Error("No stock information found for test habit");
          }
          console.log("Stock info:", stockInfo);
          const specificHoldings = debugInfo.userHoldings.filter((h) => h.stock_id === stockInfo.id);
          console.log("Holdings for this stock:", specificHoldings);
          const dividendsBefore = debugInfo.todaysDividends;
          console.log("Dividends before test:", dividendsBefore);
          if (specificHoldings.length > 0) {
            console.log("\u{1F527} Running manual dividend processing test...");
            yield this.habitBusinessService.processDividendsManually(testHabit.id, testHabit.earnings_per_completion, stockInfo.id);
            const dividendsAfter = yield this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
            console.log("Dividends after test:", dividendsAfter);
            this.dividendTestResult = {
              success: true,
              message: "Dividend processing test completed",
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
              message: "No stockholders found for testing - creating test dividend instead",
              details: {
                testHabit: testHabit.business_name,
                stockId: stockInfo.id,
                allHoldings: debugInfo.userHoldings.length,
                specificHoldings: specificHoldings.length,
                ownedBusinessStocks: debugInfo.ownedBusinessStocks.length
              }
            };
            yield this.habitBusinessService.createTestDividend(this.currentUser.id, 12.34);
          }
        }
        yield this.showToast("Dividend test completed - check console for details", "success");
      } catch (error) {
        console.error("\u274C Dividend test failed:", error);
        this.dividendTestResult = {
          success: false,
          message: `Test failed: ${error?.message || "Unknown error"}`,
          details: {
            error
          }
        };
        yield this.showToast(`Dividend test failed: ${error?.message || "Unknown error"}`, "danger");
      } finally {
        this.isTestingDividends = false;
      }
    });
  }
  showToast(message, color = "success") {
    return __async(this, null, function* () {
      const toast = yield this.toastController.create({
        message,
        duration: 3e3,
        color,
        position: "top"
      });
      yield toast.present();
    });
  }
  fixStockPrices() {
    return __async(this, null, function* () {
      this.isFixingStockPrices = true;
      try {
        console.log("\u{1F527} Starting stock price fix...");
        yield this.habitBusinessService.fixAllStockPrices();
        yield this.showToast("\u2705 All stock prices have been updated!", "success");
        console.log("\u2705 Stock price fix completed successfully");
      } catch (error) {
        console.error("\u274C Stock price fix failed:", error);
        yield this.showToast(`\u274C Failed to fix stock prices: ${error?.message || "Unknown error"}`, "danger");
      } finally {
        this.isFixingStockPrices = false;
      }
    });
  }
  fixLemonadeStockPrices() {
    return __async(this, null, function* () {
      this.isFixingLemonadeStocks = true;
      try {
        console.log("\u{1F34B} Starting lemonade stock price fix...");
        yield this.habitBusinessService.fixLemonadeStockPrices();
        yield this.showToast("\u{1F34B} Lemonade stock prices fixed! ($100 \u2192 $1)", "success");
        console.log("\u2705 Lemonade stock price fix completed successfully");
      } catch (error) {
        console.error("\u274C Lemonade stock price fix failed:", error);
        yield this.showToast(`\u274C Failed to fix lemonade prices: ${error?.message || "Unknown error"}`, "danger");
      } finally {
        this.isFixingLemonadeStocks = false;
      }
    });
  }
  /**
   * Debug a specific habit's state and completion records
   */
  debugSpecificHabit() {
    return __async(this, null, function* () {
      if (!this.currentUser) {
        yield this.showToast("\u274C User not authenticated", "danger");
        return;
      }
      try {
        const habits = yield this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
        if (!habits || habits.length === 0) {
          yield this.showToast("\u2139\uFE0F No habits found", "warning");
          return;
        }
        const habitToDebug = habits[0];
        console.log("\u{1F50D} Starting habit debug for:", habitToDebug.business_name);
        const debugResult = yield this.habitBusinessService.debugHabitState(habitToDebug.id);
        const summary = `Debug Results for "${habitToDebug.business_name}":

Current State:
- Progress: ${debugResult.habitBusiness.current_progress || 0}/${debugResult.habitBusiness.goal_value || 1}
- Last Completed: ${debugResult.habitBusiness.last_completed_at || "Never"}
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
        yield this.showToast("\u2705 Habit debug completed - check console and alert", "success");
      } catch (error) {
        console.error("\u274C Habit debug failed:", error);
        yield this.showToast(`\u274C Habit debug failed: ${error?.message}`, "danger");
      }
    });
  }
  /**
   * Add $1,000,000 test money for debugging and testing purchases
   */
  addTestMoney() {
    return __async(this, null, function* () {
      this.isAddingMoney = true;
      try {
        console.log("\u{1F4B0} Starting add test money process...");
        if (!this.currentUser) {
          throw new Error("User not authenticated");
        }
        console.log("\u{1F4CA} Fetching current profile from database...");
        const currentProfile = yield this.authService.getUserProfile(this.currentUser.id);
        console.log("\u{1F4CA} Current profile data:", currentProfile);
        const currentCash = currentProfile?.cash || 0;
        const newCash = currentCash + 1e6;
        console.log(`\u{1F4B0} Current cash: $${currentCash.toLocaleString()}, adding $1,000,000 = new cash: $${newCash.toLocaleString()}`);
        console.log("\u{1F4BE} Updating database (cash)...");
        const { data: updateResult, error } = yield this.authService.supabase.from("user_profiles").update({
          cash: newCash,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", this.currentUser.id).select();
        if (error) {
          console.error("\u274C Database update error:", error);
          throw error;
        }
        const { error: recalcError } = yield this.authService.supabase.rpc("recalculate_net_worth", {
          p_user_id: this.currentUser.id
        });
        if (recalcError) {
          console.error("\u274C Error recalculating net worth:", recalcError);
        }
        console.log("\u2705 Database update result:", updateResult);
        console.log("\u{1F504} Refreshing profile data...");
        yield this.loadCurrentUser();
        const updatedCash = this.userProfile?.cash || 0;
        const updatedNetWorth = this.userProfile?.net_worth || 0;
        console.log(`\u2705 Updated profile - Cash: $${updatedCash.toLocaleString()}, Net Worth: $${updatedNetWorth.toLocaleString()}`);
        yield this.showToast(`\u{1F4B0} Added $1M! Cash: $${updatedCash.toLocaleString()}, Net Worth: $${updatedNetWorth.toLocaleString()} \u{1F680}`, "success");
        console.log(`\u2705 Test money operation completed successfully`);
      } catch (error) {
        console.error("\u274C Failed to add test money:", error);
        yield this.showToast(`\u274C Failed to add test money: ${error?.message || "Unknown error"}`, "danger");
      } finally {
        this.isAddingMoney = false;
      }
    });
  }
  /**
   * Reset user's cash to $100 for testing low-money scenarios
   */
  removeAllMoneyBut100() {
    return __async(this, null, function* () {
      this.isRemovingMoney = true;
      try {
        if (!this.currentUser) {
          throw new Error("User not authenticated");
        }
        const newCash = 100;
        const { error } = yield this.authService.supabase.from("user_profiles").update({
          cash: newCash,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", this.currentUser.id);
        if (error)
          throw error;
        const { error: recalcError } = yield this.authService.supabase.rpc("recalculate_net_worth", {
          p_user_id: this.currentUser.id
        });
        if (recalcError) {
          console.error("\u274C Error recalculating net worth:", recalcError);
        }
        yield this.loadCurrentUser();
        const updatedNetWorth = this.userProfile?.net_worth || 0;
        yield this.showToast(`\u{1F5D1}\uFE0F Cash reset to $100. Net Worth: $${updatedNetWorth.toLocaleString()}`, "warning");
      } catch (error) {
        console.error("\u274C Failed to remove money:", error);
        yield this.showToast(`\u274C Failed to remove money: ${error?.message || "Unknown error"}`, "danger");
      } finally {
        this.isRemovingMoney = false;
      }
    });
  }
};
_DevToolsPage.\u0275fac = function DevToolsPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _DevToolsPage)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(HabitBusinessService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(ToastController));
};
_DevToolsPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DevToolsPage, selectors: [["app-dev-tools"]], decls: 120, vars: 22, consts: [[3, "translucent"], ["slot", "end", "fill", "clear", "routerLink", "/home"], ["name", "home", "slot", "start"], ["slot", "end", "fill", "clear", 3, "click", 4, "ngIf"], [1, "ion-padding", 3, "fullscreen"], [1, "test-container"], ["class", "welcome-message ion-margin-bottom", 4, "ngIf"], ["class", "profile-debug ion-margin-bottom", 4, "ngIf"], ["expand", "full", "color", "primary", 1, "ion-margin-bottom", 3, "click"], ["name", "refresh", "slot", "start"], ["fill", "outline", 3, "click", "disabled"], ["class", "test-result ion-margin-top", 4, "ngIf"], [1, "instructions"], ["expand", "block", "fill", "outline", "color", "warning", 3, "click"], ["expand", "block", "fill", "outline", "color", "tertiary", 3, "click"], ["expand", "block", "fill", "solid", "color", "success", 3, "click"], ["expand", "block", "color", "danger", 3, "click"], ["expand", "block", "fill", "outline", "color", "primary", 3, "click"], ["expand", "block", "fill", "outline", "color", "secondary", 3, "click"], ["expand", "block", "fill", "outline", "color", "warning", 1, "ion-margin-top", 3, "click"], ["expand", "block", "fill", "solid", "color", "primary", 1, "ion-margin-top", 3, "click"], ["expand", "block", "fill", "solid", "color", "success", 1, "ion-margin-bottom", 3, "click", "disabled"], ["name", "wallet", "slot", "start"], ["expand", "block", "fill", "solid", "color", "danger", 1, "ion-margin-bottom", 3, "click", "disabled"], ["name", "trash", "slot", "start"], ["expand", "block", "fill", "outline", "color", "warning", 3, "click", "disabled"], ["name", "cash", "slot", "start"], ["expand", "block", "fill", "outline", "color", "primary", 1, "ion-margin-top", 3, "click", "disabled"], ["name", "trending-up", "slot", "start"], ["expand", "block", "fill", "solid", "color", "success", 1, "ion-margin-top", 3, "click", "disabled"], ["name", "cafe", "slot", "start"], ["slot", "end", "fill", "clear", 3, "click"], ["name", "log-out", "slot", "start"], [1, "welcome-message", "ion-margin-bottom"], ["color", "success"], [4, "ngIf"], [1, "profile-debug", "ion-margin-bottom"], [1, "profile-info"], [1, "profile-actions", "ion-margin-top"], ["color", "danger", "fill", "outline", 3, "click"], ["color", "warning", "fill", "outline", 3, "click"], [1, "test-result", "ion-margin-top"], [3, "color"], ["slot", "start", 3, "name"]], template: function DevToolsPage_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header", 0)(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "\uFFFD\uFE0F Admin Portal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-button", 1);
    \u0275\u0275element(5, "ion-icon", 2);
    \u0275\u0275text(6, " Home ");
    \u0275\u0275elementEnd();
    \u0275\u0275template(7, DevToolsPage_ion_button_7_Template, 3, 0, "ion-button", 3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "ion-content", 4)(9, "div", 5);
    \u0275\u0275template(10, DevToolsPage_div_10_Template, 8, 2, "div", 6)(11, DevToolsPage_div_11_Template, 40, 7, "div", 7);
    \u0275\u0275elementStart(12, "h1");
    \u0275\u0275text(13, "\u{1F9EA} Database Connection Tests");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "p");
    \u0275\u0275text(15, " Use these tests to verify your Supabase database is working correctly: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "ion-button", 8);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_16_listener() {
      return ctx.runAllTests();
    });
    \u0275\u0275element(17, "ion-icon", 9);
    \u0275\u0275text(18, " Run All Tests ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "ion-card")(20, "ion-card-header")(21, "ion-card-title");
    \u0275\u0275text(22, "Database Connection");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(23, "ion-card-content")(24, "p");
    \u0275\u0275text(25, "Tests basic connectivity to your Supabase database.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "ion-button", 10);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_26_listener() {
      return ctx.testDatabaseConnection();
    });
    \u0275\u0275element(27, "ion-icon", 9);
    \u0275\u0275text(28);
    \u0275\u0275elementEnd();
    \u0275\u0275template(29, DevToolsPage_div_29_Template, 7, 4, "div", 11);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "ion-card")(31, "ion-card-header")(32, "ion-card-title");
    \u0275\u0275text(33, "Authentication System");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(34, "ion-card-content")(35, "p");
    \u0275\u0275text(36, "Tests the Supabase authentication system and current session.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "ion-button", 10);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_37_listener() {
      return ctx.testAuthSystem();
    });
    \u0275\u0275element(38, "ion-icon", 9);
    \u0275\u0275text(39);
    \u0275\u0275elementEnd();
    \u0275\u0275template(40, DevToolsPage_div_40_Template, 9, 6, "div", 11);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(41, "ion-card")(42, "ion-card-header")(43, "ion-card-title");
    \u0275\u0275text(44, "Next Steps");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(45, "ion-card-content")(46, "div", 12)(47, "h4");
    \u0275\u0275text(48, "\u2705 If tests pass:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "p");
    \u0275\u0275text(50, "Your database is connected! You can now:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(51, "ul")(52, "li");
    \u0275\u0275text(53, "Try signing up a new user");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "li");
    \u0275\u0275text(55, "Test logging in with those credentials");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(56, "li");
    \u0275\u0275text(57, "Check your Supabase dashboard for new users");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(58, "h4");
    \u0275\u0275text(59, "\u274C If tests fail:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(60, "p");
    \u0275\u0275text(61, "Check these common issues:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(62, "ul")(63, "li");
    \u0275\u0275text(64, "Verify your Supabase URL and API key");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "li");
    \u0275\u0275text(66, "Check your internet connection");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(67, "li");
    \u0275\u0275text(68, "Ensure your Supabase project is active");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(69, "li");
    \u0275\u0275text(70, "Verify RLS (Row Level Security) settings");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(71, "ion-card")(72, "ion-card-header")(73, "ion-card-title");
    \u0275\u0275text(74, "\u{1F527} Debug Tools");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(75, "ion-card-content")(76, "ion-button", 13);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_76_listener() {
      return ctx.checkAllProfiles();
    });
    \u0275\u0275text(77, " Check All Profiles in Database ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(78, "ion-button", 14);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_78_listener() {
      return ctx.refreshProfile();
    });
    \u0275\u0275text(79, " Refresh My Profile ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(80, "ion-button", 15);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_80_listener() {
      return ctx.forceCreateProfile();
    });
    \u0275\u0275text(81, " \u{1F527} Force Create/Fix My Profile ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(82, "ion-button", 16);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_82_listener() {
      return ctx.deleteAccount();
    });
    \u0275\u0275text(83, " Delete My Account ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(84, "ion-card")(85, "ion-card-header")(86, "ion-card-title");
    \u0275\u0275text(87, "\u{1F3E2} Habit Business Debug");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(88, "ion-card-content")(89, "ion-button", 17);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_89_listener() {
      return ctx.debugHabitBusinesses();
    });
    \u0275\u0275text(90, " \u{1F50D} Debug My Habit Businesses ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(91, "ion-button", 18);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_91_listener() {
      return ctx.testResetOutdatedHabits();
    });
    \u0275\u0275text(92, " \u{1F504} Test Reset Outdated Habits ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(93, "ion-button", 19);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_93_listener() {
      return ctx.cleanupAllHabits();
    });
    \u0275\u0275text(94, " \u{1F6A8} Emergency: Clean Up All Habit Duplicates ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(95, "ion-button", 20);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_95_listener() {
      return ctx.debugSpecificHabit();
    });
    \u0275\u0275text(96, " \u{1F50D} Debug Specific Habit State ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(97, "ion-card")(98, "ion-card-header")(99, "ion-card-title");
    \u0275\u0275text(100, "\u{1F4B0} Stock Dividend Debug");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(101, "ion-card-content")(102, "p");
    \u0275\u0275text(103, "Test and debug the stock dividend payout system.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(104, "ion-button", 21);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_104_listener() {
      return ctx.addTestMoney();
    });
    \u0275\u0275element(105, "ion-icon", 22);
    \u0275\u0275text(106);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(107, "ion-button", 23);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_107_listener() {
      return ctx.removeAllMoneyBut100();
    });
    \u0275\u0275element(108, "ion-icon", 24);
    \u0275\u0275text(109);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(110, "ion-button", 25);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_110_listener() {
      return ctx.testDividendProcessing();
    });
    \u0275\u0275element(111, "ion-icon", 26);
    \u0275\u0275text(112);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(113, "ion-button", 27);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_113_listener() {
      return ctx.fixStockPrices();
    });
    \u0275\u0275element(114, "ion-icon", 28);
    \u0275\u0275text(115);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(116, "ion-button", 29);
    \u0275\u0275listener("click", function DevToolsPage_Template_ion_button_click_116_listener() {
      return ctx.fixLemonadeStockPrices();
    });
    \u0275\u0275element(117, "ion-icon", 30);
    \u0275\u0275text(118);
    \u0275\u0275elementEnd();
    \u0275\u0275template(119, DevToolsPage_div_119_Template, 8, 5, "div", 11);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(7);
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("fullscreen", true);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance(15);
    \u0275\u0275property("disabled", ctx.isTestingDb);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isTestingDb ? "Testing..." : "Test Database", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.dbTestResult);
    \u0275\u0275advance(8);
    \u0275\u0275property("disabled", ctx.isTestingAuth);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isTestingAuth ? "Testing..." : "Test Auth", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.authTestResult);
    \u0275\u0275advance(64);
    \u0275\u0275property("disabled", ctx.isAddingMoney);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isAddingMoney ? "Adding..." : "Add $1,000,000 Test Money \u{1F4B0}", " ");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx.isRemovingMoney);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isRemovingMoney ? "Removing..." : "Remove All Money But $100 \u{1F5D1}\uFE0F", " ");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx.isTestingDividends);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isTestingDividends ? "Testing..." : "Test Dividend Processing", " ");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx.isFixingStockPrices);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isFixingStockPrices ? "Fixing..." : "Fix All Stock Prices", " ");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx.isFixingLemonadeStocks);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isFixingLemonadeStocks ? "Fixing..." : "Fix Lemonade Stock Prices ($100 \u2192 $1)", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.dividendTestResult);
  }
}, dependencies: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonIcon, CommonModule, NgIf, RouterLink], styles: ['\n\n.test-container[_ngcontent-%COMP%] {\n  max-width: 800px;\n  margin: 0 auto;\n}\n.welcome-message[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.profile-debug[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n}\n.profile-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0.5rem 0;\n  font-family: "Courier New", monospace;\n  font-size: 0.9rem;\n}\n.profile-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.test-result[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n}\n.instructions[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  margin-top: 1rem;\n  margin-bottom: 0.5rem;\n}\n.instructions[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin-left: 1rem;\n}\n.instructions[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin-bottom: 0.25rem;\n}\n/*# sourceMappingURL=dev-tools.page.css.map */'] });
var DevToolsPage = _DevToolsPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DevToolsPage, [{
    type: Component,
    args: [{ selector: "app-dev-tools", imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonIcon, CommonModule, RouterLink], template: `<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>\uFFFD\uFE0F Admin Portal</ion-title>
    <ion-button slot="end" fill="clear" routerLink="/home">
      <ion-icon name="home" slot="start"></ion-icon>
      Home
    </ion-button>
    <ion-button *ngIf="currentUser" slot="end" fill="clear" (click)="logout()">
      <ion-icon name="log-out" slot="start"></ion-icon>
      Logout
    </ion-button>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding">
  <div class="test-container">
    <!-- Welcome Message for Logged In Users -->
    <div *ngIf="currentUser" class="welcome-message ion-margin-bottom">
      <ion-card color="success">
        <ion-card-content>
          <h2>
            \u{1F389} Welcome back, {{ userProfile?.name ||
            currentUser.user_metadata?.name || currentUser.email }}!
          </h2>
          <p>
            You're successfully logged in
            <span *ngIf="userProfile?.cash !== undefined">
              with \${{ userProfile?.cash }} cash</span
            >
          </p>
        </ion-card-content>
      </ion-card>
    </div>

    <!-- Profile Debug Info -->
    <div *ngIf="currentUser" class="profile-debug ion-margin-bottom">
      <ion-card>
        <ion-card-header>
          <ion-card-title>\u{1F464} Your Profile Data</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="profile-info">
            <p><strong>User ID:</strong> {{ currentUser.id }}</p>
            <p><strong>Email:</strong> {{ currentUser.email }}</p>
            <p>
              <strong>Auth Name:</strong> {{ currentUser.user_metadata?.name ||
              'Not set' }}
            </p>
            <p>
              <strong>Profile Name:</strong> {{ userProfile?.name ||
              'Loading...' }}
            </p>
            <p>
              <strong>Cash:</strong> \${{ userProfile?.cash || 'Loading...' }}
            </p>
            <p>
              <strong>Net Worth:</strong> \${{ userProfile?.net_worth ||
              'Loading...' }}
            </p>
            <p>
              <strong>Created:</strong> {{ userProfile?.created_at ||
              'Loading...' }}
            </p>
          </div>

          <div class="profile-actions ion-margin-top">
            <ion-button color="danger" fill="outline" (click)="deleteAccount()">
              \u{1F5D1}\uFE0F Delete Account
            </ion-button>
            <ion-button
              color="warning"
              fill="outline"
              (click)="refreshProfile()"
            >
              \u{1F504} Refresh Profile
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </div>

    <h1>\u{1F9EA} Database Connection Tests</h1>
    <p>
      Use these tests to verify your Supabase database is working correctly:
    </p>

    <!-- Quick Test All Button -->
    <ion-button
      expand="full"
      color="primary"
      (click)="runAllTests()"
      class="ion-margin-bottom"
    >
      <ion-icon name="refresh" slot="start"></ion-icon>
      Run All Tests
    </ion-button>

    <!-- Database Connection Test -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>Database Connection</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>Tests basic connectivity to your Supabase database.</p>
        <ion-button
          fill="outline"
          (click)="testDatabaseConnection()"
          [disabled]="isTestingDb"
        >
          <ion-icon name="refresh" slot="start"></ion-icon>
          {{ isTestingDb ? 'Testing...' : 'Test Database' }}
        </ion-button>

        <div *ngIf="dbTestResult" class="test-result ion-margin-top">
          <ion-item [color]="dbTestResult.success ? 'success' : 'danger'">
            <ion-icon
              [name]="dbTestResult.success ? 'checkmark-circle' : 'alert-circle'"
              slot="start"
            >
            </ion-icon>
            <ion-label>
              <h3>{{ dbTestResult.message }}</h3>
              <p *ngIf="!dbTestResult.success && dbTestResult.error">
                Error: {{ dbTestResult.error.message || dbTestResult.error }}
              </p>
            </ion-label>
          </ion-item>
        </div>
      </ion-card-content>
    </ion-card>

    <!-- Auth System Test -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>Authentication System</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>Tests the Supabase authentication system and current session.</p>
        <ion-button
          fill="outline"
          (click)="testAuthSystem()"
          [disabled]="isTestingAuth"
        >
          <ion-icon name="refresh" slot="start"></ion-icon>
          {{ isTestingAuth ? 'Testing...' : 'Test Auth' }}
        </ion-button>

        <div *ngIf="authTestResult" class="test-result ion-margin-top">
          <ion-item [color]="authTestResult.success ? 'success' : 'danger'">
            <ion-icon
              [name]="authTestResult.success ? 'checkmark-circle' : 'alert-circle'"
              slot="start"
            >
            </ion-icon>
            <ion-label>
              <h3>{{ authTestResult.message }}</h3>
              <p
                *ngIf="authTestResult.success && authTestResult.hasActiveSession"
              >
                Active session found! User: {{ authTestResult.sessionInfo?.user
                }}
              </p>
              <p
                *ngIf="authTestResult.success && !authTestResult.hasActiveSession"
              >
                No active session (user not logged in)
              </p>
              <p *ngIf="!authTestResult.success && authTestResult.error">
                Error: {{ authTestResult.error.message || authTestResult.error
                }}
              </p>
            </ion-label>
          </ion-item>
        </div>
      </ion-card-content>
    </ion-card>

    <!-- Instructions -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>Next Steps</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div class="instructions">
          <h4>\u2705 If tests pass:</h4>
          <p>Your database is connected! You can now:</p>
          <ul>
            <li>Try signing up a new user</li>
            <li>Test logging in with those credentials</li>
            <li>Check your Supabase dashboard for new users</li>
          </ul>

          <h4>\u274C If tests fail:</h4>
          <p>Check these common issues:</p>
          <ul>
            <li>Verify your Supabase URL and API key</li>
            <li>Check your internet connection</li>
            <li>Ensure your Supabase project is active</li>
            <li>Verify RLS (Row Level Security) settings</li>
          </ul>
        </div>
      </ion-card-content>
    </ion-card>

    <!-- Debug Tools -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>\u{1F527} Debug Tools</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-button
          expand="block"
          fill="outline"
          color="warning"
          (click)="checkAllProfiles()"
        >
          Check All Profiles in Database
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="tertiary"
          (click)="refreshProfile()"
        >
          Refresh My Profile
        </ion-button>

        <ion-button
          expand="block"
          fill="solid"
          color="success"
          (click)="forceCreateProfile()"
        >
          \u{1F527} Force Create/Fix My Profile
        </ion-button>

        <ion-button expand="block" color="danger" (click)="deleteAccount()">
          Delete My Account
        </ion-button>
      </ion-card-content>
    </ion-card>

    <!-- Habit Business Debug Tools -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>\u{1F3E2} Habit Business Debug</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-button
          expand="block"
          fill="outline"
          color="primary"
          (click)="debugHabitBusinesses()"
        >
          \u{1F50D} Debug My Habit Businesses
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="secondary"
          (click)="testResetOutdatedHabits()"
        >
          \u{1F504} Test Reset Outdated Habits
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="warning"
          (click)="cleanupAllHabits()"
          class="ion-margin-top"
        >
          \u{1F6A8} Emergency: Clean Up All Habit Duplicates
        </ion-button>

        <ion-button
          expand="block"
          fill="solid"
          color="primary"
          (click)="debugSpecificHabit()"
          class="ion-margin-top"
        >
          \u{1F50D} Debug Specific Habit State
        </ion-button>
      </ion-card-content>
    </ion-card>

    <!-- Stock Dividend Debug Tools -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>\u{1F4B0} Stock Dividend Debug</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>Test and debug the stock dividend payout system.</p>

        <!-- Add Test Money Button -->
        <ion-button
          expand="block"
          fill="solid"
          color="success"
          (click)="addTestMoney()"
          [disabled]="isAddingMoney"
          class="ion-margin-bottom"
        >
          <ion-icon name="wallet" slot="start"></ion-icon>
          {{ isAddingMoney ? 'Adding...' : 'Add $1,000,000 Test Money \u{1F4B0}' }}
        </ion-button>

        <ion-button
          expand="block"
          fill="solid"
          color="danger"
          (click)="removeAllMoneyBut100()"
          [disabled]="isRemovingMoney"
          class="ion-margin-bottom"
        >
          <ion-icon name="trash" slot="start"></ion-icon>
          {{ isRemovingMoney ? 'Removing...' : 'Remove All Money But $100 \u{1F5D1}\uFE0F' }}
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="warning"
          (click)="testDividendProcessing()"
          [disabled]="isTestingDividends"
        >
          <ion-icon name="cash" slot="start"></ion-icon>
          {{ isTestingDividends ? 'Testing...' : 'Test Dividend Processing' }}
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="primary"
          (click)="fixStockPrices()"
          [disabled]="isFixingStockPrices"
          class="ion-margin-top"
        >
          <ion-icon name="trending-up" slot="start"></ion-icon>
          {{ isFixingStockPrices ? 'Fixing...' : 'Fix All Stock Prices' }}
        </ion-button>

        <ion-button
          expand="block"
          fill="solid"
          color="success"
          (click)="fixLemonadeStockPrices()"
          [disabled]="isFixingLemonadeStocks"
          class="ion-margin-top"
        >
          <ion-icon name="cafe" slot="start"></ion-icon>
          {{ isFixingLemonadeStocks ? 'Fixing...' : 'Fix Lemonade Stock Prices
          ($100 \u2192 $1)' }}
        </ion-button>

        <div *ngIf="dividendTestResult" class="test-result ion-margin-top">
          <ion-item [color]="dividendTestResult.success ? 'success' : 'danger'">
            <ion-icon
              [name]="dividendTestResult.success ? 'checkmark-circle' : 'alert-circle'"
              slot="start"
            >
            </ion-icon>
            <ion-label>
              <h3>{{ dividendTestResult.message }}</h3>
              <p *ngIf="dividendTestResult.details">
                Test Habit: {{ dividendTestResult.details.testHabit }}<br />
                Holdings: {{ dividendTestResult.details.holdingsCount ||
                dividendTestResult.details.specificHoldings }}<br />
                <span
                  *ngIf="dividendTestResult.details.dividendsDifference !== undefined"
                >
                  Dividend Change: \${{
                  dividendTestResult.details.dividendsDifference.toFixed(2) }}
                </span>
              </p>
              <p
                *ngIf="!dividendTestResult.success && dividendTestResult.error"
              >
                Error: {{ dividendTestResult.error.message ||
                dividendTestResult.error }}
              </p>
            </ion-label>
          </ion-item>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</ion-content>
`, styles: ['/* src/app/dev-tools/dev-tools.page.scss */\n.test-container {\n  max-width: 800px;\n  margin: 0 auto;\n}\n.welcome-message {\n  text-align: center;\n}\n.profile-debug {\n  margin-bottom: 2rem;\n}\n.profile-info p {\n  margin: 0.5rem 0;\n  font-family: "Courier New", monospace;\n  font-size: 0.9rem;\n}\n.profile-actions {\n  display: flex;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.test-result {\n  margin-top: 1rem;\n}\n.instructions h4 {\n  color: var(--ion-color-primary);\n  margin-top: 1rem;\n  margin-bottom: 0.5rem;\n}\n.instructions ul {\n  margin-left: 1rem;\n}\n.instructions ul li {\n  margin-bottom: 0.25rem;\n}\n/*# sourceMappingURL=dev-tools.page.css.map */\n'] }]
  }], () => [{ type: AuthService }, { type: HabitBusinessService }, { type: Router }, { type: ToastController }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DevToolsPage, { className: "DevToolsPage", filePath: "src/app/dev-tools/dev-tools.page.ts", lineNumber: 16 });
})();
export {
  DevToolsPage
};
//# sourceMappingURL=dev-tools.page-YST3K5TZ.js.map
