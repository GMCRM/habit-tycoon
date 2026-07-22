import {
  SettingsService
} from "./chunk-JHEGQNPZ.js";
import {
  BottomNavComponent
} from "./chunk-R6NCSAED.js";
import {
  addIcons,
  fingerPrint,
  lockClosed,
  logoGoogle,
  person,
  save,
  trash,
  warning
} from "./chunk-DTAWB6F7.js";
import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  CommonModule,
  Component,
  FormsModule,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
  MaxLengthValidator,
  NgControlStatus,
  NgIf,
  NgModel,
  Router,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
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
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
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

// src/app/settings/settings.page.ts
function SettingsPage_div_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 27);
    \u0275\u0275text(1, " Username is required ");
    \u0275\u0275elementEnd();
  }
}
function SettingsPage_ion_card_35_div_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 27);
    \u0275\u0275text(1, " Passwords do not match ");
    \u0275\u0275elementEnd();
  }
}
function SettingsPage_ion_card_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card")(1, "ion-card-header")(2, "ion-card-title");
    \u0275\u0275element(3, "ion-icon", 28);
    \u0275\u0275text(4, " Change Password ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "ion-card-content")(6, "div", 5)(7, "ion-item")(8, "ion-label", 6);
    \u0275\u0275text(9, "New Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "ion-input", 29);
    \u0275\u0275twoWayListener("ngModelChange", function SettingsPage_ion_card_35_Template_ion_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newPassword, $event) || (ctx_r1.newPassword = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(11, "div", 5)(12, "ion-item")(13, "ion-label", 6);
    \u0275\u0275text(14, "Confirm New Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "ion-input", 30);
    \u0275\u0275twoWayListener("ngModelChange", function SettingsPage_ion_card_35_Template_ion_input_ngModelChange_15_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.confirmPassword, $event) || (ctx_r1.confirmPassword = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275template(16, SettingsPage_ion_card_35_div_16_Template, 2, 0, "div", 8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "ion-button", 31);
    \u0275\u0275listener("click", function SettingsPage_ion_card_35_Template_ion_button_click_17_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.updatePassword());
    });
    \u0275\u0275element(18, "ion-icon", 10);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newPassword);
    \u0275\u0275advance();
    \u0275\u0275classProp("has-error", ctx_r1.newPassword !== ctx_r1.confirmPassword && ctx_r1.confirmPassword !== "");
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.confirmPassword);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.newPassword !== ctx_r1.confirmPassword && ctx_r1.confirmPassword !== "");
    \u0275\u0275advance();
    \u0275\u0275classProp("loading-button", ctx_r1.isUpdatingPassword);
    \u0275\u0275property("disabled", ctx_r1.isUpdatingPassword || !ctx_r1.newPassword || !ctx_r1.confirmPassword || ctx_r1.newPassword !== ctx_r1.confirmPassword);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.isUpdatingPassword ? "Updating..." : "Update Password", " ");
  }
}
function SettingsPage_ion_card_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-card", 32)(1, "ion-card-header")(2, "ion-card-title");
    \u0275\u0275element(3, "ion-icon", 33);
    \u0275\u0275text(4, " Google Account ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "ion-card-content")(6, "div", 34)(7, "p", 35);
    \u0275\u0275text(8, " You're signed in with your Google account. Your password is managed by Google, so you can't change it here. ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 36);
    \u0275\u0275text(10, " To update your password, visit your ");
    \u0275\u0275elementStart(11, "a", 37);
    \u0275\u0275text(12, " Google Account Security settings ");
    \u0275\u0275elementEnd();
    \u0275\u0275text(13, ". ");
    \u0275\u0275elementEnd()()()();
  }
}
function SettingsPage_ng_template_56_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-header")(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "Confirm Account Deletion");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-button", 38);
    \u0275\u0275listener("click", function SettingsPage_ng_template_56_Template_ion_button_click_4_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelDeleteProfile());
    });
    \u0275\u0275text(5, "Cancel");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(6, "ion-content", 39)(7, "div", 40)(8, "div", 41);
    \u0275\u0275element(9, "ion-icon", 42);
    \u0275\u0275elementStart(10, "h2");
    \u0275\u0275text(11, "Are you absolutely sure?");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "p");
    \u0275\u0275text(13, " This will permanently delete your account and all associated data including: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "ul")(15, "li");
    \u0275\u0275text(16, "Your profile and personal information");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "li");
    \u0275\u0275text(18, "All habit businesses and progress");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "li");
    \u0275\u0275text(20, "Your stock portfolio and investments");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "li");
    \u0275\u0275text(22, "Social connections and friendships");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "li");
    \u0275\u0275text(24, "All financial data and achievements");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "p", 43)(26, "strong");
    \u0275\u0275text(27, "This action cannot be undone.");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(28, "div", 44)(29, "ion-item")(30, "ion-label", 6);
    \u0275\u0275text(31, " Type ");
    \u0275\u0275elementStart(32, "strong");
    \u0275\u0275text(33, "DELETE");
    \u0275\u0275elementEnd();
    \u0275\u0275text(34, " to confirm: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "ion-input", 45);
    \u0275\u0275twoWayListener("ngModelChange", function SettingsPage_ng_template_56_Template_ion_input_ngModelChange_35_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.deleteConfirmationText, $event) || (ctx_r1.deleteConfirmationText = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(36, "div", 46)(37, "ion-button", 47);
    \u0275\u0275listener("click", function SettingsPage_ng_template_56_Template_ion_button_click_37_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelDeleteProfile());
    });
    \u0275\u0275text(38, " Cancel ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "ion-button", 48);
    \u0275\u0275listener("click", function SettingsPage_ng_template_56_Template_ion_button_click_39_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.confirmDeleteProfile());
    });
    \u0275\u0275element(40, "ion-icon", 23);
    \u0275\u0275text(41);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(35);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.deleteConfirmationText);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.isDeletingProfile);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("loading-button", ctx_r1.isDeletingProfile);
    \u0275\u0275property("disabled", ctx_r1.isDeletingProfile || ctx_r1.deleteConfirmationText.toLowerCase() !== "delete");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.isDeletingProfile ? "Deleting..." : "Delete Forever", " ");
  }
}
function SettingsPage_ng_template_58_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-header")(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "Confirm Account Reset");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-button", 38);
    \u0275\u0275listener("click", function SettingsPage_ng_template_58_Template_ion_button_click_4_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelResetAccount());
    });
    \u0275\u0275text(5, "Cancel");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(6, "ion-content", 39)(7, "div", 40)(8, "div", 41);
    \u0275\u0275element(9, "ion-icon", 49);
    \u0275\u0275elementStart(10, "h2");
    \u0275\u0275text(11, "Start over from default?");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "p");
    \u0275\u0275text(13, " This reset keeps your social friendships, but clears your progress including: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "ul")(15, "li");
    \u0275\u0275text(16, "Cash and net worth reset to default");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "li");
    \u0275\u0275text(18, "All habits and progress");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "li");
    \u0275\u0275text(20, "Stock holdings and investment progress");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "li");
    \u0275\u0275text(22, "Social posts/challenges/notifications you created");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(23, "p", 43)(24, "strong");
    \u0275\u0275text(25, "This cannot be undone.");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(26, "div", 44)(27, "ion-item")(28, "ion-label", 6);
    \u0275\u0275text(29, " Type ");
    \u0275\u0275elementStart(30, "strong");
    \u0275\u0275text(31, "RESET");
    \u0275\u0275elementEnd();
    \u0275\u0275text(32, " to confirm: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "ion-input", 50);
    \u0275\u0275twoWayListener("ngModelChange", function SettingsPage_ng_template_58_Template_ion_input_ngModelChange_33_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.resetConfirmationText, $event) || (ctx_r1.resetConfirmationText = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(34, "div", 46)(35, "ion-button", 47);
    \u0275\u0275listener("click", function SettingsPage_ng_template_58_Template_ion_button_click_35_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelResetAccount());
    });
    \u0275\u0275text(36, " Cancel ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "ion-button", 51);
    \u0275\u0275listener("click", function SettingsPage_ng_template_58_Template_ion_button_click_37_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.confirmResetAccount());
    });
    \u0275\u0275element(38, "ion-icon", 21);
    \u0275\u0275text(39);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(33);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.resetConfirmationText);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.isResettingAccount);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("loading-button", ctx_r1.isResettingAccount);
    \u0275\u0275property("disabled", ctx_r1.isResettingAccount || ctx_r1.resetConfirmationText.toLowerCase() !== "reset");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.isResettingAccount ? "Resetting..." : "Reset Progress", " ");
  }
}
var _SettingsPage = class _SettingsPage {
  constructor(authService, settingsService, router) {
    this.authService = authService;
    this.settingsService = settingsService;
    this.router = router;
    this.username = "";
    this.currentPassword = "";
    this.newPassword = "";
    this.confirmPassword = "";
    this.isUpdatingProfile = false;
    this.isUpdatingPassword = false;
    this.isDeletingProfile = false;
    this.isResettingAccount = false;
    this.showToast = false;
    this.toastMessage = "";
    this.toastColor = "success";
    this.showDeleteConfirmation = false;
    this.deleteConfirmationText = "";
    this.showResetConfirmation = false;
    this.resetConfirmationText = "";
    this.currentUser = null;
    this.isGoogleUser = false;
    this.tapToComplete = false;
    addIcons({ person, save, lockClosed, logoGoogle, trash, warning, fingerPrint });
  }
  ngOnInit() {
    return __async(this, null, function* () {
      this.tapToCompleteSub = this.settingsService.tapToComplete$.subscribe((value) => this.tapToComplete = value);
      yield this.loadUserData();
    });
  }
  ngOnDestroy() {
    this.tapToCompleteSub?.unsubscribe();
  }
  onTapToCompleteChange(event) {
    this.settingsService.setTapToComplete(event.detail.checked);
  }
  loadUserData() {
    return __async(this, null, function* () {
      try {
        const { data: user } = yield this.authService.getUser();
        if (user?.user) {
          this.currentUser = user.user;
          this.isGoogleUser = user.user.app_metadata?.provider === "google";
          console.log("User auth provider:", user.user.app_metadata?.provider);
          console.log("Is Google user:", this.isGoogleUser);
          const profile = yield this.authService.getUserProfile(user.user.id);
          if (profile) {
            this.username = profile.name || "";
            this.settingsService.syncFromProfile(profile);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    });
  }
  updateProfile() {
    return __async(this, null, function* () {
      if (!this.currentUser || !this.username.trim()) {
        this.showToastMessage("Please enter a valid username", "danger");
        return;
      }
      this.isUpdatingProfile = true;
      try {
        yield this.authService.updateUserProfile(this.currentUser.id, {
          name: this.username.trim()
        });
        this.showToastMessage("Profile updated successfully!", "success");
      } catch (error) {
        console.error("Error updating profile:", error);
        this.showToastMessage("Failed to update profile", "danger");
      } finally {
        this.isUpdatingProfile = false;
      }
    });
  }
  updatePassword() {
    return __async(this, null, function* () {
      if (!this.newPassword || !this.confirmPassword) {
        this.showToastMessage("Please fill in all password fields", "danger");
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.showToastMessage("New passwords do not match", "danger");
        return;
      }
      if (this.newPassword.length < 6) {
        this.showToastMessage("Password must be at least 6 characters", "danger");
        return;
      }
      this.isUpdatingPassword = true;
      try {
        yield this.authService.updatePassword(this.newPassword);
        this.showToastMessage("Password updated successfully!", "success");
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
      } catch (error) {
        console.error("Error updating password:", error);
        this.showToastMessage(error.message || "Failed to update password", "danger");
      } finally {
        this.isUpdatingPassword = false;
      }
    });
  }
  showToastMessage(message, color) {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }
  showDeleteProfileConfirmation() {
    this.showDeleteConfirmation = true;
  }
  cancelDeleteProfile() {
    this.showDeleteConfirmation = false;
    this.deleteConfirmationText = "";
  }
  showResetAccountConfirmation() {
    this.showResetConfirmation = true;
  }
  cancelResetAccount() {
    this.showResetConfirmation = false;
    this.resetConfirmationText = "";
  }
  confirmResetAccount() {
    return __async(this, null, function* () {
      if (this.resetConfirmationText.toLowerCase() !== "reset") {
        this.showToastMessage('Please type "RESET" to confirm', "danger");
        return;
      }
      if (!this.currentUser) {
        this.showToastMessage("No user found to reset", "danger");
        return;
      }
      this.isResettingAccount = true;
      try {
        yield this.authService.resetAccountProgressKeepFriends();
        this.showToastMessage("Account reset complete. Friend connections were kept.", "success");
        this.showResetConfirmation = false;
        this.resetConfirmationText = "";
        yield this.loadUserData();
        setTimeout(() => {
          this.router.navigate(["/home"], { replaceUrl: true });
        }, 1200);
      } catch (error) {
        console.error("Error resetting account:", error);
        this.showToastMessage(error.message || "Failed to reset account", "danger");
      } finally {
        this.isResettingAccount = false;
      }
    });
  }
  confirmDeleteProfile() {
    return __async(this, null, function* () {
      if (this.deleteConfirmationText.toLowerCase() !== "delete") {
        this.showToastMessage('Please type "DELETE" to confirm', "danger");
        return;
      }
      if (!this.currentUser) {
        this.showToastMessage("No user found to delete", "danger");
        return;
      }
      this.isDeletingProfile = true;
      try {
        yield this.authService.deleteUserProfile(this.currentUser.id);
        const { error } = yield this.authService.deleteAuthUser();
        if (error) {
          throw error;
        }
        this.showToastMessage("Profile deleted successfully", "success");
        setTimeout(() => {
          this.router.navigate(["/login"]);
        }, 2e3);
      } catch (error) {
        console.error("Error deleting profile:", error);
        this.showToastMessage(error.message || "Failed to delete profile", "danger");
      } finally {
        this.isDeletingProfile = false;
        this.showDeleteConfirmation = false;
        this.deleteConfirmationText = "";
      }
    });
  }
  goBack() {
    this.router.navigate(["/home"]);
  }
};
_SettingsPage.\u0275fac = function SettingsPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _SettingsPage)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(SettingsService), \u0275\u0275directiveInject(Router));
};
_SettingsPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SettingsPage, selectors: [["app-settings"]], decls: 61, vars: 26, consts: [[3, "translucent"], [3, "fullscreen", "scrollY"], [1, "scrollable-content"], [1, "settings-content"], ["name", "person"], [1, "form-field"], ["position", "stacked"], ["placeholder", "Enter your username", "type", "text", "maxlength", "30", 3, "ngModelChange", "ngModel"], ["class", "validation-error", 4, "ngIf"], ["expand", "block", "color", "primary", 3, "click", "disabled"], ["name", "save", "slot", "start"], ["name", "finger-print"], ["lines", "none"], ["slot", "end", 3, "ionChange", "checked"], [4, "ngIf"], ["class", "google-info-card", 4, "ngIf"], [1, "danger-zone-card"], ["name", "warning"], [1, "danger-info"], [1, "danger-message"], ["expand", "block", "color", "warning", "fill", "outline", 3, "click", "disabled"], ["name", "warning", "slot", "start"], ["expand", "block", "color", "danger", "fill", "outline", 3, "click", "disabled"], ["name", "trash", "slot", "start"], [3, "willDismiss", "isOpen"], [3, "didDismiss", "isOpen", "message", "duration", "color"], ["mainButton", "home"], [1, "validation-error"], ["name", "lock-closed"], ["placeholder", "Enter new password", "type", "password", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["placeholder", "Confirm new password", "type", "password", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["expand", "block", "color", "secondary", 3, "click", "disabled"], [1, "google-info-card"], ["name", "logo-google"], [1, "google-info"], [1, "google-message"], [1, "google-tip"], ["href", "https://myaccount.google.com/security", "target", "_blank", 1, "google-link"], ["slot", "end", "fill", "clear", 3, "click"], [1, "ion-padding"], [1, "delete-confirmation"], [1, "warning-section"], ["name", "warning", "color", "danger"], [1, "final-warning"], [1, "confirmation-input"], ["placeholder", "Type DELETE here", "type", "text", "maxlength", "10", 3, "ngModelChange", "ngModel"], [1, "action-buttons"], ["expand", "block", "fill", "outline", "color", "medium", 3, "click", "disabled"], ["expand", "block", "color", "danger", 3, "click", "disabled"], ["name", "warning", "color", "warning"], ["placeholder", "Type RESET here", "type", "text", "maxlength", "10", 3, "ngModelChange", "ngModel"], ["expand", "block", "color", "warning", 3, "click", "disabled"]], template: function SettingsPage_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header", 0)(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "\u2699\uFE0F Settings");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(4, "ion-content", 1)(5, "div", 2)(6, "div", 3)(7, "ion-card")(8, "ion-card-header")(9, "ion-card-title");
    \u0275\u0275element(10, "ion-icon", 4);
    \u0275\u0275text(11, " Profile Settings ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "ion-card-content")(13, "div", 5)(14, "ion-item")(15, "ion-label", 6);
    \u0275\u0275text(16, "Username");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "ion-input", 7);
    \u0275\u0275twoWayListener("ngModelChange", function SettingsPage_Template_ion_input_ngModelChange_17_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.username, $event) || (ctx.username = $event);
      return $event;
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275template(18, SettingsPage_div_18_Template, 2, 0, "div", 8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "ion-button", 9);
    \u0275\u0275listener("click", function SettingsPage_Template_ion_button_click_19_listener() {
      return ctx.updateProfile();
    });
    \u0275\u0275element(20, "ion-icon", 10);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(22, "ion-card")(23, "ion-card-header")(24, "ion-card-title");
    \u0275\u0275element(25, "ion-icon", 11);
    \u0275\u0275text(26, " Habit Completion ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "ion-card-content")(28, "ion-item", 12)(29, "ion-label")(30, "h3");
    \u0275\u0275text(31, "Tap to complete");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "p");
    \u0275\u0275text(33);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(34, "ion-toggle", 13);
    \u0275\u0275listener("ionChange", function SettingsPage_Template_ion_toggle_ionChange_34_listener($event) {
      return ctx.onTapToCompleteChange($event);
    });
    \u0275\u0275elementEnd()()()();
    \u0275\u0275template(35, SettingsPage_ion_card_35_Template, 20, 9, "ion-card", 14)(36, SettingsPage_ion_card_36_Template, 14, 0, "ion-card", 15);
    \u0275\u0275elementStart(37, "ion-card", 16)(38, "ion-card-header")(39, "ion-card-title");
    \u0275\u0275element(40, "ion-icon", 17);
    \u0275\u0275text(41, " Danger Zone ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(42, "ion-card-content")(43, "div", 18)(44, "p", 19);
    \u0275\u0275text(45, " Reset your game progress to default values while keeping your friendships intact. ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(46, "ion-button", 20);
    \u0275\u0275listener("click", function SettingsPage_Template_ion_button_click_46_listener() {
      return ctx.showResetAccountConfirmation();
    });
    \u0275\u0275element(47, "ion-icon", 21);
    \u0275\u0275text(48);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "div", 18)(50, "p", 19);
    \u0275\u0275text(51, " Permanently delete your account and all associated data. This action cannot be undone. ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(52, "ion-button", 22);
    \u0275\u0275listener("click", function SettingsPage_Template_ion_button_click_52_listener() {
      return ctx.showDeleteProfileConfirmation();
    });
    \u0275\u0275element(53, "ion-icon", 23);
    \u0275\u0275text(54, " Delete Account ");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(55, "ion-modal", 24);
    \u0275\u0275listener("willDismiss", function SettingsPage_Template_ion_modal_willDismiss_55_listener() {
      return ctx.cancelDeleteProfile();
    });
    \u0275\u0275template(56, SettingsPage_ng_template_56_Template, 42, 6, "ng-template");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(57, "ion-modal", 24);
    \u0275\u0275listener("willDismiss", function SettingsPage_Template_ion_modal_willDismiss_57_listener() {
      return ctx.cancelResetAccount();
    });
    \u0275\u0275template(58, SettingsPage_ng_template_58_Template, 40, 6, "ng-template");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(59, "ion-toast", 25);
    \u0275\u0275listener("didDismiss", function SettingsPage_Template_ion_toast_didDismiss_59_listener() {
      return ctx.showToast = false;
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275element(60, "app-bottom-nav", 26);
  }
  if (rf & 2) {
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(4);
    \u0275\u0275property("fullscreen", true)("scrollY", false);
    \u0275\u0275advance(9);
    \u0275\u0275classProp("has-error", !ctx.username.trim() && ctx.username !== "");
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx.username);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.username.trim() && ctx.username !== "");
    \u0275\u0275advance();
    \u0275\u0275classProp("loading-button", ctx.isUpdatingProfile);
    \u0275\u0275property("disabled", ctx.isUpdatingProfile || !ctx.username.trim());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isUpdatingProfile ? "Updating..." : "Update Profile", " ");
    \u0275\u0275advance(12);
    \u0275\u0275textInterpolate1(" ", ctx.tapToComplete ? "A single tap marks a habit complete or undoes it." : "Hold down the complete button to confirm.", " ");
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx.tapToComplete);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.isGoogleUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.isGoogleUser);
    \u0275\u0275advance(10);
    \u0275\u0275property("disabled", ctx.isResettingAccount || ctx.isDeletingProfile);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.isResettingAccount ? "Resetting..." : "Start Over (Keep Friends)", " ");
    \u0275\u0275advance(4);
    \u0275\u0275property("disabled", ctx.isDeletingProfile);
    \u0275\u0275advance(3);
    \u0275\u0275property("isOpen", ctx.showDeleteConfirmation);
    \u0275\u0275advance(2);
    \u0275\u0275property("isOpen", ctx.showResetConfirmation);
    \u0275\u0275advance(2);
    \u0275\u0275classMap("toast-" + ctx.toastColor);
    \u0275\u0275property("isOpen", ctx.showToast)("message", ctx.toastMessage)("duration", 3e3)("color", ctx.toastColor);
  }
}, dependencies: [
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  CommonModule,
  NgIf,
  FormsModule,
  NgControlStatus,
  MaxLengthValidator,
  NgModel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonToast,
  IonModal,
  IonToggle,
  BottomNavComponent
], styles: ['\n\n.scrollable-content[_ngcontent-%COMP%] {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.settings-content[_ngcontent-%COMP%] {\n  padding: 20px 16px 90px 16px;\n  background: var(--ion-background-color);\n  min-height: 100vh;\n}\n@media (min-width: 768px) {\n  .settings-content[_ngcontent-%COMP%] {\n    padding: 24px 20px 90px 20px;\n    max-width: 600px;\n    margin: 0 auto;\n  }\n}\nion-content[_ngcontent-%COMP%] {\n  --background: var(--ion-background-color);\n}\nion-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\nion-card[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      var(--ion-color-primary),\n      transparent);\n  opacity: 0.6;\n}\nion-card[_ngcontent-%COMP%]   ion-card-header[_ngcontent-%COMP%] {\n  padding: 20px 20px 12px 20px;\n  border-bottom: 1px solid rgba(255, 215, 0, 0.2);\n  background: rgba(0, 0, 0, 0.1);\n}\nion-card[_ngcontent-%COMP%]   ion-card-header[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  color: var(--ion-color-primary);\n  font-size: 1.3rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  margin: 0;\n}\nion-card[_ngcontent-%COMP%]   ion-card-header[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\nion-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 20px;\n  background: transparent;\n}\nion-item[_ngcontent-%COMP%] {\n  --background: rgba(0, 0, 0, 0.2);\n  --color: #ffffff;\n  --border-color: rgba(255, 215, 0, 0.3);\n  --inner-padding-end: 16px;\n  --padding-start: 16px;\n  border-radius: 8px;\n  margin-bottom: 16px;\n  border: 1px solid rgba(255, 215, 0, 0.2);\n}\nion-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  margin-bottom: 8px;\n}\nion-item[_ngcontent-%COMP%]   ion-input[_ngcontent-%COMP%] {\n  --background: rgba(30, 30, 63, 0.6);\n  --color: #ffffff;\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  border-radius: 6px;\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  font-size: 1rem;\n}\nion-item[_ngcontent-%COMP%]   ion-input[_ngcontent-%COMP%]:focus-within {\n  --border-color: var(--ion-color-primary);\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\nion-button[_ngcontent-%COMP%] {\n  --border-radius: 10px;\n  font-weight: 600;\n  margin-top: 16px;\n  height: 48px;\n}\nion-button[color=primary][_ngcontent-%COMP%] {\n  --background:\n    linear-gradient(\n      135deg,\n      #FFD700 0%,\n      #ff8c00 100%);\n  --color: #000000;\n  --box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);\n}\nion-button[color=primary][_ngcontent-%COMP%]:hover {\n  --box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);\n  transform: translateY(-1px);\n}\nion-button[color=primary][_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\nion-button[color=primary][disabled][_ngcontent-%COMP%] {\n  --background: rgba(255, 215, 0, 0.3);\n  --color: rgba(0, 0, 0, 0.5);\n  --box-shadow: none;\n  transform: none;\n  opacity: 0.6;\n}\nion-button[color=secondary][_ngcontent-%COMP%] {\n  --background:\n    linear-gradient(\n      135deg,\n      #00ff88 0%,\n      #00cc6a 100%);\n  --color: #000000;\n  --box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);\n}\nion-button[color=secondary][_ngcontent-%COMP%]:hover {\n  --box-shadow: 0 6px 16px rgba(0, 255, 136, 0.4);\n  transform: translateY(-1px);\n}\nion-button[color=secondary][_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\nion-button[color=secondary][disabled][_ngcontent-%COMP%] {\n  --background: rgba(0, 255, 136, 0.3);\n  --color: rgba(0, 0, 0, 0.5);\n  --box-shadow: none;\n  transform: none;\n  opacity: 0.6;\n}\n.loading-button[_ngcontent-%COMP%] {\n  position: relative;\n  overflow: hidden;\n}\n.loading-button[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: -100%;\n  width: 100%;\n  height: 100%;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      rgba(255, 255, 255, 0.3),\n      transparent);\n  animation: _ngcontent-%COMP%_loading-shimmer 1.5s infinite;\n}\n@keyframes _ngcontent-%COMP%_loading-shimmer {\n  0% {\n    left: -100%;\n  }\n  100% {\n    left: 100%;\n  }\n}\nion-toast[_ngcontent-%COMP%] {\n  --background: var(--business-item-background);\n  --color: #ffffff;\n  --border: 1px solid rgba(255, 215, 0, 0.3);\n  --border-radius: 12px;\n  --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n}\nion-toast.toast-success[_ngcontent-%COMP%] {\n  --background:\n    linear-gradient(\n      135deg,\n      #00ff88 0%,\n      #00cc6a 100%);\n  --color: #000000;\n  --border: 1px solid rgba(0, 255, 136, 0.5);\n}\nion-toast.toast-danger[_ngcontent-%COMP%] {\n  --background:\n    linear-gradient(\n      135deg,\n      #ff3366 0%,\n      #e62e5a 100%);\n  --color: #ffffff;\n  --border: 1px solid rgba(255, 51, 102, 0.5);\n}\nion-header[_ngcontent-%COMP%]   ion-toolbar[_ngcontent-%COMP%] {\n  --background: var(--ion-toolbar-background);\n  --color: var(--ion-toolbar-color);\n  --border-color: rgba(255, 215, 0, 0.2);\n}\nion-header[_ngcontent-%COMP%]   ion-toolbar[_ngcontent-%COMP%]   ion-title[_ngcontent-%COMP%] {\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  font-size: 1.4rem;\n}\nion-header[_ngcontent-%COMP%]   ion-toolbar[_ngcontent-%COMP%]   ion-back-button[_ngcontent-%COMP%] {\n  --color: var(--ion-color-primary);\n  --icon-font-size: 1.5rem;\n}\nion-header[_ngcontent-%COMP%]   ion-toolbar[_ngcontent-%COMP%]   ion-back-button[_ngcontent-%COMP%]:hover {\n  --color: var(--ion-color-primary-shade);\n}\n.validation-error[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n  font-size: 0.85rem;\n  margin-top: 4px;\n  margin-left: 16px;\n  font-weight: 500;\n}\n.form-field[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.form-field.has-error[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%] {\n  --border-color: var(--ion-color-danger);\n  border-color: var(--ion-color-danger);\n}\n.form-field.has-error[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%]   ion-input[_ngcontent-%COMP%] {\n  --border-color: var(--ion-color-danger);\n}\n.success-feedback[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  color: var(--earnings-color);\n  font-size: 0.9rem;\n  font-weight: 600;\n  margin-top: 8px;\n}\n.success-feedback[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n}\n@media (max-width: 768px) {\n  .settings-content[_ngcontent-%COMP%] {\n    padding: 16px 12px;\n  }\n  ion-card[_ngcontent-%COMP%] {\n    margin-bottom: 16px;\n  }\n  ion-card[_ngcontent-%COMP%]   ion-card-header[_ngcontent-%COMP%] {\n    padding: 16px 16px 10px 16px;\n  }\n  ion-card[_ngcontent-%COMP%]   ion-card-header[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%] {\n    font-size: 1.2rem;\n  }\n  ion-card[_ngcontent-%COMP%]   ion-card-header[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    font-size: 1.3rem;\n  }\n  ion-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n    padding: 16px;\n  }\n  ion-item[_ngcontent-%COMP%] {\n    margin-bottom: 12px;\n  }\n  ion-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n    font-size: 0.9rem;\n  }\n  ion-item[_ngcontent-%COMP%]   ion-input[_ngcontent-%COMP%] {\n    font-size: 0.95rem;\n  }\n  ion-button[_ngcontent-%COMP%] {\n    height: 44px;\n    font-size: 0.95rem;\n  }\n}\n.google-info-card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #2a5298 0%,\n      #1e3c72 100%);\n  border: 2px solid #4169E1;\n  box-shadow: 0 8px 32px rgba(65, 105, 225, 0.4);\n}\n.google-info-card[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%] {\n  color: #ffffff;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.google-info-card[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  color: #FFD700;\n}\n.google-info[_ngcontent-%COMP%]   .google-message[_ngcontent-%COMP%] {\n  color: #ffffff;\n  font-size: 1rem;\n  line-height: 1.5;\n  margin-bottom: 12px;\n}\n.google-info[_ngcontent-%COMP%]   .google-tip[_ngcontent-%COMP%] {\n  color: #b8c6db;\n  font-size: 0.9rem;\n  line-height: 1.4;\n  margin-bottom: 0;\n}\n.google-info[_ngcontent-%COMP%]   .google-link[_ngcontent-%COMP%] {\n  color: #FFD700;\n  text-decoration: none;\n  font-weight: 600;\n  transition: all 0.3s ease;\n}\n.google-info[_ngcontent-%COMP%]   .google-link[_ngcontent-%COMP%]:hover {\n  color: #FFF;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);\n}\n.danger-zone-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.danger-zone-card[_ngcontent-%COMP%]::before {\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      #FF6B6B,\n      transparent);\n}\n.danger-zone-card[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%] {\n  color: #ffffff;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.danger-zone-card[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  color: #FF6B6B;\n}\n.danger-info[_ngcontent-%COMP%]   .danger-message[_ngcontent-%COMP%] {\n  color: #ffffff;\n  font-size: 1rem;\n  line-height: 1.5;\n  margin-bottom: 16px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .warning-section[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 24px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .warning-section[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 4rem;\n  margin-bottom: 16px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .warning-section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n  margin-bottom: 16px;\n  font-weight: bold;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .warning-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n  line-height: 1.5;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .warning-section[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  text-align: left;\n  margin: 16px 0;\n  padding-left: 20px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .warning-section[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n  line-height: 1.4;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .warning-section[_ngcontent-%COMP%]   .final-warning[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n  font-size: 1.1rem;\n  margin-top: 20px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .confirmation-input[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .confirmation-input[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%] {\n  --background: var(--ion-color-light);\n  --border-color: var(--ion-color-danger);\n  border: 2px solid var(--ion-color-danger);\n  border-radius: 8px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .confirmation-input[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--ion-color-danger);\n}\n.delete-confirmation[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  height: auto;\n  min-height: 48px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  white-space: normal;\n  text-wrap: wrap;\n  font-size: 0.9rem;\n}\n.delete-confirmation[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   ion-button[color=danger][_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n@media (min-width: 768px) {\n  .delete-confirmation[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%] {\n    flex-direction: row;\n  }\n  .delete-confirmation[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n    flex: 1;\n    font-size: 0.85rem;\n  }\n}\n@media (max-width: 400px) {\n  .delete-confirmation[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n    font-size: 0.8rem;\n    --padding-start: 8px;\n    --padding-end: 8px;\n  }\n}\n/*# sourceMappingURL=settings.page.css.map */'] });
var SettingsPage = _SettingsPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SettingsPage, [{
    type: Component,
    args: [{ selector: "app-settings", standalone: true, imports: [
      IonContent,
      IonHeader,
      IonTitle,
      IonToolbar,
      CommonModule,
      FormsModule,
      IonCard,
      IonCardHeader,
      IonCardTitle,
      IonCardContent,
      IonItem,
      IonLabel,
      IonInput,
      IonButton,
      IonIcon,
      IonToast,
      IonModal,
      IonTextarea,
      IonToggle,
      BottomNavComponent
    ], template: `<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>\u2699\uFE0F Settings</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" [scrollY]="false">
  <div class="scrollable-content">
    <div class="settings-content">
      <!-- Profile Settings Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="person"></ion-icon>
            Profile Settings
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div
            class="form-field"
            [class.has-error]="!username.trim() && username !== ''"
          >
            <ion-item>
              <ion-label position="stacked">Username</ion-label>
              <ion-input
                [(ngModel)]="username"
                placeholder="Enter your username"
                type="text"
                maxlength="30"
              >
              </ion-input>
            </ion-item>
            <div
              class="validation-error"
              *ngIf="!username.trim() && username !== ''"
            >
              Username is required
            </div>
          </div>

          <ion-button
            expand="block"
            (click)="updateProfile()"
            [disabled]="isUpdatingProfile || !username.trim()"
            color="primary"
            [class.loading-button]="isUpdatingProfile"
          >
            <ion-icon name="save" slot="start"></ion-icon>
            {{ isUpdatingProfile ? 'Updating...' : 'Update Profile' }}
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Habit Completion Settings Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="finger-print"></ion-icon>
            Habit Completion
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-label>
              <h3>Tap to complete</h3>
              <p>
                {{ tapToComplete ? 'A single tap marks a habit complete or
                undoes it.' : 'Hold down the complete button to confirm.' }}
              </p>
            </ion-label>
            <ion-toggle
              slot="end"
              [checked]="tapToComplete"
              (ionChange)="onTapToCompleteChange($event)"
            ></ion-toggle>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <!-- Password Settings Card - Only show for email/password users -->
      <ion-card *ngIf="!isGoogleUser">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="lock-closed"></ion-icon>
            Change Password
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="form-field">
            <ion-item>
              <ion-label position="stacked">New Password</ion-label>
              <ion-input
                [(ngModel)]="newPassword"
                placeholder="Enter new password"
                type="password"
                maxlength="100"
              >
              </ion-input>
            </ion-item>
          </div>

          <div
            class="form-field"
            [class.has-error]="newPassword !== confirmPassword && confirmPassword !== ''"
          >
            <ion-item>
              <ion-label position="stacked">Confirm New Password</ion-label>
              <ion-input
                [(ngModel)]="confirmPassword"
                placeholder="Confirm new password"
                type="password"
                maxlength="100"
              >
              </ion-input>
            </ion-item>
            <div
              class="validation-error"
              *ngIf="newPassword !== confirmPassword && confirmPassword !== ''"
            >
              Passwords do not match
            </div>
          </div>

          <ion-button
            expand="block"
            (click)="updatePassword()"
            [disabled]="isUpdatingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword"
            color="secondary"
            [class.loading-button]="isUpdatingPassword"
          >
            <ion-icon name="save" slot="start"></ion-icon>
            {{ isUpdatingPassword ? 'Updating...' : 'Update Password' }}
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Google Account Info Card - Only show for Google users -->
      <ion-card *ngIf="isGoogleUser" class="google-info-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="logo-google"></ion-icon>
            Google Account
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="google-info">
            <p class="google-message">
              You're signed in with your Google account. Your password is
              managed by Google, so you can't change it here.
            </p>
            <p class="google-tip">
              To update your password, visit your
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                class="google-link"
              >
                Google Account Security settings </a
              >.
            </p>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Danger Zone Card -->
      <ion-card class="danger-zone-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="warning"></ion-icon>
            Danger Zone
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="danger-info">
            <p class="danger-message">
              Reset your game progress to default values while keeping your
              friendships intact.
            </p>
          </div>

          <ion-button
            expand="block"
            color="warning"
            fill="outline"
            (click)="showResetAccountConfirmation()"
            [disabled]="isResettingAccount || isDeletingProfile"
          >
            <ion-icon name="warning" slot="start"></ion-icon>
            {{ isResettingAccount ? 'Resetting...' : 'Start Over (Keep Friends)'
            }}
          </ion-button>

          <div class="danger-info">
            <p class="danger-message">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>

          <ion-button
            expand="block"
            color="danger"
            fill="outline"
            (click)="showDeleteProfileConfirmation()"
            [disabled]="isDeletingProfile"
          >
            <ion-icon name="trash" slot="start"></ion-icon>
            Delete Account
          </ion-button>
        </ion-card-content>
      </ion-card>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <ion-modal
    [isOpen]="showDeleteConfirmation"
    (willDismiss)="cancelDeleteProfile()"
  >
    <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Confirm Account Deletion</ion-title>
          <ion-button slot="end" fill="clear" (click)="cancelDeleteProfile()"
            >Cancel</ion-button
          >
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="delete-confirmation">
          <div class="warning-section">
            <ion-icon name="warning" color="danger"></ion-icon>
            <h2>Are you absolutely sure?</h2>
            <p>
              This will permanently delete your account and all associated data
              including:
            </p>
            <ul>
              <li>Your profile and personal information</li>
              <li>All habit businesses and progress</li>
              <li>Your stock portfolio and investments</li>
              <li>Social connections and friendships</li>
              <li>All financial data and achievements</li>
            </ul>
            <p class="final-warning">
              <strong>This action cannot be undone.</strong>
            </p>
          </div>

          <div class="confirmation-input">
            <ion-item>
              <ion-label position="stacked">
                Type <strong>DELETE</strong> to confirm:
              </ion-label>
              <ion-input
                [(ngModel)]="deleteConfirmationText"
                placeholder="Type DELETE here"
                type="text"
                maxlength="10"
              >
              </ion-input>
            </ion-item>
          </div>

          <div class="action-buttons">
            <ion-button
              expand="block"
              fill="outline"
              color="medium"
              (click)="cancelDeleteProfile()"
              [disabled]="isDeletingProfile"
            >
              Cancel
            </ion-button>

            <ion-button
              expand="block"
              color="danger"
              (click)="confirmDeleteProfile()"
              [disabled]="isDeletingProfile || deleteConfirmationText.toLowerCase() !== 'delete'"
              [class.loading-button]="isDeletingProfile"
            >
              <ion-icon name="trash" slot="start"></ion-icon>
              {{ isDeletingProfile ? 'Deleting...' : 'Delete Forever' }}
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ng-template>
  </ion-modal>

  <!-- Reset Confirmation Modal -->
  <ion-modal
    [isOpen]="showResetConfirmation"
    (willDismiss)="cancelResetAccount()"
  >
    <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Confirm Account Reset</ion-title>
          <ion-button slot="end" fill="clear" (click)="cancelResetAccount()"
            >Cancel</ion-button
          >
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="delete-confirmation">
          <div class="warning-section">
            <ion-icon name="warning" color="warning"></ion-icon>
            <h2>Start over from default?</h2>
            <p>
              This reset keeps your social friendships, but clears your progress
              including:
            </p>
            <ul>
              <li>Cash and net worth reset to default</li>
              <li>All habits and progress</li>
              <li>Stock holdings and investment progress</li>
              <li>Social posts/challenges/notifications you created</li>
            </ul>
            <p class="final-warning">
              <strong>This cannot be undone.</strong>
            </p>
          </div>

          <div class="confirmation-input">
            <ion-item>
              <ion-label position="stacked">
                Type <strong>RESET</strong> to confirm:
              </ion-label>
              <ion-input
                [(ngModel)]="resetConfirmationText"
                placeholder="Type RESET here"
                type="text"
                maxlength="10"
              >
              </ion-input>
            </ion-item>
          </div>

          <div class="action-buttons">
            <ion-button
              expand="block"
              fill="outline"
              color="medium"
              (click)="cancelResetAccount()"
              [disabled]="isResettingAccount"
            >
              Cancel
            </ion-button>

            <ion-button
              expand="block"
              color="warning"
              (click)="confirmResetAccount()"
              [disabled]="isResettingAccount || resetConfirmationText.toLowerCase() !== 'reset'"
              [class.loading-button]="isResettingAccount"
            >
              <ion-icon name="warning" slot="start"></ion-icon>
              {{ isResettingAccount ? 'Resetting...' : 'Reset Progress' }}
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ng-template>
  </ion-modal>

  <!-- Toast for feedback messages -->
  <ion-toast
    [isOpen]="showToast"
    [message]="toastMessage"
    [duration]="3000"
    [color]="toastColor"
    [class]="'toast-' + toastColor"
    (didDismiss)="showToast = false"
  >
  </ion-toast>
</ion-content>

<!-- Bottom Navigation -->
<app-bottom-nav mainButton="home"></app-bottom-nav>
`, styles: ['/* src/app/settings/settings.page.scss */\n.scrollable-content {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.settings-content {\n  padding: 20px 16px 90px 16px;\n  background: var(--ion-background-color);\n  min-height: 100vh;\n}\n@media (min-width: 768px) {\n  .settings-content {\n    padding: 24px 20px 90px 20px;\n    max-width: 600px;\n    margin: 0 auto;\n  }\n}\nion-content {\n  --background: var(--ion-background-color);\n}\nion-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\nion-card::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      var(--ion-color-primary),\n      transparent);\n  opacity: 0.6;\n}\nion-card ion-card-header {\n  padding: 20px 20px 12px 20px;\n  border-bottom: 1px solid rgba(255, 215, 0, 0.2);\n  background: rgba(0, 0, 0, 0.1);\n}\nion-card ion-card-header ion-card-title {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  color: var(--ion-color-primary);\n  font-size: 1.3rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  margin: 0;\n}\nion-card ion-card-header ion-card-title ion-icon {\n  font-size: 1.5rem;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\nion-card ion-card-content {\n  padding: 20px;\n  background: transparent;\n}\nion-item {\n  --background: rgba(0, 0, 0, 0.2);\n  --color: #ffffff;\n  --border-color: rgba(255, 215, 0, 0.3);\n  --inner-padding-end: 16px;\n  --padding-start: 16px;\n  border-radius: 8px;\n  margin-bottom: 16px;\n  border: 1px solid rgba(255, 215, 0, 0.2);\n}\nion-item ion-label {\n  font-weight: 600;\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  margin-bottom: 8px;\n}\nion-item ion-input {\n  --background: rgba(30, 30, 63, 0.6);\n  --color: #ffffff;\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  border-radius: 6px;\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  font-size: 1rem;\n}\nion-item ion-input:focus-within {\n  --border-color: var(--ion-color-primary);\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\nion-button {\n  --border-radius: 10px;\n  font-weight: 600;\n  margin-top: 16px;\n  height: 48px;\n}\nion-button[color=primary] {\n  --background:\n    linear-gradient(\n      135deg,\n      #FFD700 0%,\n      #ff8c00 100%);\n  --color: #000000;\n  --box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);\n}\nion-button[color=primary]:hover {\n  --box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);\n  transform: translateY(-1px);\n}\nion-button[color=primary]:active {\n  transform: translateY(0);\n}\nion-button[color=primary][disabled] {\n  --background: rgba(255, 215, 0, 0.3);\n  --color: rgba(0, 0, 0, 0.5);\n  --box-shadow: none;\n  transform: none;\n  opacity: 0.6;\n}\nion-button[color=secondary] {\n  --background:\n    linear-gradient(\n      135deg,\n      #00ff88 0%,\n      #00cc6a 100%);\n  --color: #000000;\n  --box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);\n}\nion-button[color=secondary]:hover {\n  --box-shadow: 0 6px 16px rgba(0, 255, 136, 0.4);\n  transform: translateY(-1px);\n}\nion-button[color=secondary]:active {\n  transform: translateY(0);\n}\nion-button[color=secondary][disabled] {\n  --background: rgba(0, 255, 136, 0.3);\n  --color: rgba(0, 0, 0, 0.5);\n  --box-shadow: none;\n  transform: none;\n  opacity: 0.6;\n}\n.loading-button {\n  position: relative;\n  overflow: hidden;\n}\n.loading-button::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: -100%;\n  width: 100%;\n  height: 100%;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      rgba(255, 255, 255, 0.3),\n      transparent);\n  animation: loading-shimmer 1.5s infinite;\n}\n@keyframes loading-shimmer {\n  0% {\n    left: -100%;\n  }\n  100% {\n    left: 100%;\n  }\n}\nion-toast {\n  --background: var(--business-item-background);\n  --color: #ffffff;\n  --border: 1px solid rgba(255, 215, 0, 0.3);\n  --border-radius: 12px;\n  --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n}\nion-toast.toast-success {\n  --background:\n    linear-gradient(\n      135deg,\n      #00ff88 0%,\n      #00cc6a 100%);\n  --color: #000000;\n  --border: 1px solid rgba(0, 255, 136, 0.5);\n}\nion-toast.toast-danger {\n  --background:\n    linear-gradient(\n      135deg,\n      #ff3366 0%,\n      #e62e5a 100%);\n  --color: #ffffff;\n  --border: 1px solid rgba(255, 51, 102, 0.5);\n}\nion-header ion-toolbar {\n  --background: var(--ion-toolbar-background);\n  --color: var(--ion-toolbar-color);\n  --border-color: rgba(255, 215, 0, 0.2);\n}\nion-header ion-toolbar ion-title {\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  font-size: 1.4rem;\n}\nion-header ion-toolbar ion-back-button {\n  --color: var(--ion-color-primary);\n  --icon-font-size: 1.5rem;\n}\nion-header ion-toolbar ion-back-button:hover {\n  --color: var(--ion-color-primary-shade);\n}\n.validation-error {\n  color: var(--ion-color-danger);\n  font-size: 0.85rem;\n  margin-top: 4px;\n  margin-left: 16px;\n  font-weight: 500;\n}\n.form-field {\n  margin-bottom: 20px;\n}\n.form-field.has-error ion-item {\n  --border-color: var(--ion-color-danger);\n  border-color: var(--ion-color-danger);\n}\n.form-field.has-error ion-item ion-input {\n  --border-color: var(--ion-color-danger);\n}\n.success-feedback {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  color: var(--earnings-color);\n  font-size: 0.9rem;\n  font-weight: 600;\n  margin-top: 8px;\n}\n.success-feedback ion-icon {\n  font-size: 1.1rem;\n}\n@media (max-width: 768px) {\n  .settings-content {\n    padding: 16px 12px;\n  }\n  ion-card {\n    margin-bottom: 16px;\n  }\n  ion-card ion-card-header {\n    padding: 16px 16px 10px 16px;\n  }\n  ion-card ion-card-header ion-card-title {\n    font-size: 1.2rem;\n  }\n  ion-card ion-card-header ion-card-title ion-icon {\n    font-size: 1.3rem;\n  }\n  ion-card ion-card-content {\n    padding: 16px;\n  }\n  ion-item {\n    margin-bottom: 12px;\n  }\n  ion-item ion-label {\n    font-size: 0.9rem;\n  }\n  ion-item ion-input {\n    font-size: 0.95rem;\n  }\n  ion-button {\n    height: 44px;\n    font-size: 0.95rem;\n  }\n}\n.google-info-card {\n  background:\n    linear-gradient(\n      135deg,\n      #2a5298 0%,\n      #1e3c72 100%);\n  border: 2px solid #4169E1;\n  box-shadow: 0 8px 32px rgba(65, 105, 225, 0.4);\n}\n.google-info-card ion-card-title {\n  color: #ffffff;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.google-info-card ion-card-title ion-icon {\n  font-size: 1.5rem;\n  color: #FFD700;\n}\n.google-info .google-message {\n  color: #ffffff;\n  font-size: 1rem;\n  line-height: 1.5;\n  margin-bottom: 12px;\n}\n.google-info .google-tip {\n  color: #b8c6db;\n  font-size: 0.9rem;\n  line-height: 1.4;\n  margin-bottom: 0;\n}\n.google-info .google-link {\n  color: #FFD700;\n  text-decoration: none;\n  font-weight: 600;\n  transition: all 0.3s ease;\n}\n.google-info .google-link:hover {\n  color: #FFF;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);\n}\n.danger-zone-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.danger-zone-card::before {\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      #FF6B6B,\n      transparent);\n}\n.danger-zone-card ion-card-title {\n  color: #ffffff;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.danger-zone-card ion-card-title ion-icon {\n  font-size: 1.5rem;\n  color: #FF6B6B;\n}\n.danger-info .danger-message {\n  color: #ffffff;\n  font-size: 1rem;\n  line-height: 1.5;\n  margin-bottom: 16px;\n}\n.delete-confirmation .warning-section {\n  text-align: center;\n  margin-bottom: 24px;\n}\n.delete-confirmation .warning-section ion-icon {\n  font-size: 4rem;\n  margin-bottom: 16px;\n}\n.delete-confirmation .warning-section h2 {\n  color: var(--ion-color-danger);\n  margin-bottom: 16px;\n  font-weight: bold;\n}\n.delete-confirmation .warning-section p {\n  margin-bottom: 12px;\n  line-height: 1.5;\n}\n.delete-confirmation .warning-section ul {\n  text-align: left;\n  margin: 16px 0;\n  padding-left: 20px;\n}\n.delete-confirmation .warning-section ul li {\n  margin-bottom: 8px;\n  line-height: 1.4;\n}\n.delete-confirmation .warning-section .final-warning {\n  color: var(--ion-color-danger);\n  font-size: 1.1rem;\n  margin-top: 20px;\n}\n.delete-confirmation .confirmation-input {\n  margin-bottom: 24px;\n}\n.delete-confirmation .confirmation-input ion-item {\n  --background: var(--ion-color-light);\n  --border-color: var(--ion-color-danger);\n  border: 2px solid var(--ion-color-danger);\n  border-radius: 8px;\n}\n.delete-confirmation .confirmation-input ion-label {\n  font-weight: 600;\n  color: var(--ion-color-danger);\n}\n.delete-confirmation .action-buttons {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.delete-confirmation .action-buttons ion-button {\n  height: auto;\n  min-height: 48px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  white-space: normal;\n  text-wrap: wrap;\n  font-size: 0.9rem;\n}\n.delete-confirmation .action-buttons ion-button[color=danger] {\n  font-weight: 600;\n}\n@media (min-width: 768px) {\n  .delete-confirmation .action-buttons {\n    flex-direction: row;\n  }\n  .delete-confirmation .action-buttons ion-button {\n    flex: 1;\n    font-size: 0.85rem;\n  }\n}\n@media (max-width: 400px) {\n  .delete-confirmation .action-buttons ion-button {\n    font-size: 0.8rem;\n    --padding-start: 8px;\n    --padding-end: 8px;\n  }\n}\n/*# sourceMappingURL=settings.page.css.map */\n'] }]
  }], () => [{ type: AuthService }, { type: SettingsService }, { type: Router }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SettingsPage, { className: "SettingsPage", filePath: "src/app/settings/settings.page.ts", lineNumber: 59 });
})();
export {
  SettingsPage
};
//# sourceMappingURL=settings.page-QWY76DNN.js.map
