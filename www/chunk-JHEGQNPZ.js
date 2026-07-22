import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  BehaviorSubject,
  Injectable,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-AYR3XDH5.js";
import {
  __async
} from "./chunk-QXFS4N4X.js";

// src/app/services/settings.service.ts
var TAP_TO_COMPLETE_KEY = "tap-to-complete";
var _SettingsService = class _SettingsService {
  constructor(authService) {
    this.authService = authService;
    this.tapToCompleteSubject = new BehaviorSubject(localStorage.getItem(TAP_TO_COMPLETE_KEY) === "true");
    this.tapToComplete$ = this.tapToCompleteSubject.asObservable();
  }
  get tapToCompleteValue() {
    return this.tapToCompleteSubject.value;
  }
  // Pull the server-side value down whenever a fresh profile is loaded, so a
  // device that never toggled the setting locally picks up what was set elsewhere.
  syncFromProfile(profile) {
    if (!profile || typeof profile.tap_to_complete !== "boolean")
      return;
    this.tapToCompleteSubject.next(profile.tap_to_complete);
    localStorage.setItem(TAP_TO_COMPLETE_KEY, String(profile.tap_to_complete));
  }
  setTapToComplete(value) {
    return __async(this, null, function* () {
      this.tapToCompleteSubject.next(value);
      localStorage.setItem(TAP_TO_COMPLETE_KEY, String(value));
      try {
        const { data } = yield this.authService.getUser();
        if (data?.user) {
          yield this.authService.updateUserProfile(data.user.id, { tap_to_complete: value });
        }
      } catch (error) {
        console.error("\u274C Failed to sync tap-to-complete preference:", error);
      }
    });
  }
};
_SettingsService.\u0275fac = function SettingsService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _SettingsService)(\u0275\u0275inject(AuthService));
};
_SettingsService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SettingsService, factory: _SettingsService.\u0275fac, providedIn: "root" });
var SettingsService = _SettingsService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SettingsService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: AuthService }], null);
})();

export {
  SettingsService
};
//# sourceMappingURL=chunk-JHEGQNPZ.js.map
