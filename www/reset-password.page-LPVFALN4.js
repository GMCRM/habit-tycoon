import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  ActivatedRoute,
  CommonModule,
  Component,
  FormsModule,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  MaxLengthValidator,
  MinLengthValidator,
  NgControlStatus,
  NgControlStatusGroup,
  NgForm,
  NgIf,
  NgModel,
  RequiredValidator,
  Router,
  RouterLink,
  ToastController,
  setClassMetadata,
  ɵNgNoValidate,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵproperty,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
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

// src/app/reset-password/reset-password.page.ts
function ResetPasswordPage_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1, " Password must be at least 6 characters long ");
    \u0275\u0275elementEnd();
  }
}
function ResetPasswordPage_div_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1, " Passwords do not match ");
    \u0275\u0275elementEnd();
  }
}
function ResetPasswordPage_span_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Update Password");
    \u0275\u0275elementEnd();
  }
}
function ResetPasswordPage_span_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Updating...");
    \u0275\u0275elementEnd();
  }
}
var _ResetPasswordPage = class _ResetPasswordPage {
  constructor(authService, router, route, toastController) {
    this.authService = authService;
    this.router = router;
    this.route = route;
    this.toastController = toastController;
    this.newPassword = "";
    this.confirmPassword = "";
    this.isLoading = false;
  }
  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        console.log("\u{1F504} URL fragment received:", fragment);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");
        if (type === "recovery" && accessToken && refreshToken) {
          console.log("\u2705 Valid password recovery session detected");
        } else {
          console.warn("\u26A0\uFE0F Invalid or missing recovery parameters");
          this.showErrorAndRedirect("Invalid or expired reset link");
        }
      } else {
        console.warn("\u26A0\uFE0F No URL fragment found");
        this.showErrorAndRedirect("Invalid reset link");
      }
    });
  }
  onResetPassword() {
    return __async(this, null, function* () {
      if (this.newPassword !== this.confirmPassword) {
        const errorToast = yield this.toastController.create({
          message: "Passwords do not match",
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
        return;
      }
      if (this.newPassword.length < 6) {
        const errorToast = yield this.toastController.create({
          message: "Password must be at least 6 characters long",
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
        return;
      }
      this.isLoading = true;
      try {
        const result = yield this.authService.updatePassword(this.newPassword);
        if (result.error) {
          const errorToast = yield this.toastController.create({
            message: "Failed to update password: " + result.error?.message || "Unknown error",
            duration: 4e3,
            position: "top",
            color: "danger"
          });
          yield errorToast.present();
          return;
        }
        const successToast = yield this.toastController.create({
          message: "\u2705 Password updated successfully! Please log in with your new password.",
          duration: 5e3,
          position: "top",
          color: "success"
        });
        yield successToast.present();
        this.router.navigate(["/login"]);
      } catch (error) {
        console.error("Password update failed:", error);
        const errorToast = yield this.toastController.create({
          message: "Failed to update password: " + error.message,
          duration: 4e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      } finally {
        this.isLoading = false;
      }
    });
  }
  showErrorAndRedirect(message) {
    return __async(this, null, function* () {
      const errorToast = yield this.toastController.create({
        message,
        duration: 4e3,
        position: "top",
        color: "danger"
      });
      yield errorToast.present();
      setTimeout(() => {
        this.router.navigate(["/login"]);
      }, 2e3);
    });
  }
};
_ResetPasswordPage.\u0275fac = function ResetPasswordPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _ResetPasswordPage)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(ToastController));
};
_ResetPasswordPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ResetPasswordPage, selectors: [["app-reset-password"]], decls: 32, vars: 8, consts: [["resetForm", "ngForm"], ["passwordInput", "ngModel"], ["confirmInput", "ngModel"], [3, "translucent"], [1, "ion-padding"], [1, "center-card-container"], [1, "card-title"], [1, "instruction-text"], [3, "ngSubmit"], ["position", "floating"], ["type", "password", "name", "password", "required", "", "minlength", "6", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["class", "error-message", 4, "ngIf"], ["type", "password", "name", "confirmPassword", "required", "", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["expand", "full", "type", "submit", 3, "disabled"], [4, "ngIf"], [1, "login-link", "ion-text-center", "ion-margin-top"], ["routerLink", "/login"], [1, "error-message"]], template: function ResetPasswordPage_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-header", 3)(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "Reset Password");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(4, "ion-content", 4)(5, "div", 5)(6, "ion-card")(7, "ion-card-content")(8, "h1", 6);
    \u0275\u0275text(9, "Set New Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "p", 7);
    \u0275\u0275text(11, "Enter your new password below");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "form", 8, 0);
    \u0275\u0275listener("ngSubmit", function ResetPasswordPage_Template_form_ngSubmit_12_listener() {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onResetPassword());
    });
    \u0275\u0275elementStart(14, "ion-item")(15, "ion-label", 9);
    \u0275\u0275text(16, "New Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "ion-input", 10, 1);
    \u0275\u0275twoWayListener("ngModelChange", function ResetPasswordPage_Template_ion_input_ngModelChange_17_listener($event) {
      \u0275\u0275restoreView(_r1);
      \u0275\u0275twoWayBindingSet(ctx.newPassword, $event) || (ctx.newPassword = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275template(19, ResetPasswordPage_div_19_Template, 2, 0, "div", 11);
    \u0275\u0275elementStart(20, "ion-item")(21, "ion-label", 9);
    \u0275\u0275text(22, "Confirm New Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "ion-input", 12, 2);
    \u0275\u0275twoWayListener("ngModelChange", function ResetPasswordPage_Template_ion_input_ngModelChange_23_listener($event) {
      \u0275\u0275restoreView(_r1);
      \u0275\u0275twoWayBindingSet(ctx.confirmPassword, $event) || (ctx.confirmPassword = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275template(25, ResetPasswordPage_div_25_Template, 2, 0, "div", 11);
    \u0275\u0275elementStart(26, "ion-button", 13);
    \u0275\u0275template(27, ResetPasswordPage_span_27_Template, 2, 0, "span", 14)(28, ResetPasswordPage_span_28_Template, 2, 0, "span", 14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "div", 15)(30, "a", 16);
    \u0275\u0275text(31, "Back to Login");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    const resetForm_r2 = \u0275\u0275reference(13);
    const passwordInput_r3 = \u0275\u0275reference(18);
    const confirmInput_r4 = \u0275\u0275reference(24);
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(17);
    \u0275\u0275twoWayProperty("ngModel", ctx.newPassword);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", passwordInput_r3.invalid && passwordInput_r3.touched);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx.confirmPassword);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", confirmInput_r4.touched && ctx.newPassword !== ctx.confirmPassword);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !resetForm_r2.form.valid || ctx.newPassword !== ctx.confirmPassword || ctx.isLoading);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.isLoading);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.isLoading);
  }
}, dependencies: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonItem, IonLabel, IonInput, CommonModule, NgIf, FormsModule, \u0275NgNoValidate, NgControlStatus, NgControlStatusGroup, RequiredValidator, MinLengthValidator, MaxLengthValidator, NgModel, NgForm, RouterLink], styles: ['\n\n.center-card-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  min-height: 100vh;\n  padding: 60px 20px 20px 20px;\n}\nion-card[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 400px;\n  min-height: 450px;\n  border-radius: 16px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.card-title[_ngcontent-%COMP%] {\n  text-align: center;\n  font-size: 2rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  margin-bottom: 8px;\n}\n.instruction-text[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--ion-color-medium-shade);\n  font-size: 0.95rem;\n  margin-bottom: 24px;\n}\n.divider[_ngcontent-%COMP%] {\n  position: relative;\n  margin: 24px 0;\n}\n.divider[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: var(--ion-color-light-shade);\n}\n.divider[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  background: var(--ion-background-color);\n  padding: 0 16px;\n  color: var(--ion-color-medium);\n  font-size: 0.9rem;\n}\nion-item[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  --background: var(--ion-color-light);\n  margin-bottom: 16px;\n}\nion-button[_ngcontent-%COMP%] {\n  margin-top: 24px;\n  height: 48px;\n  font-weight: 600;\n}\n.error-message[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n  font-size: 0.85rem;\n  margin-top: -12px;\n  margin-bottom: 12px;\n  padding-left: 16px;\n}\n.login-link[_ngcontent-%COMP%] {\n  margin-top: 24px;\n}\n.login-link[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  text-decoration: none;\n  font-weight: 500;\n}\n.login-link[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=reset-password.page.css.map */'] });
var ResetPasswordPage = _ResetPasswordPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ResetPasswordPage, [{
    type: Component,
    args: [{ selector: "app-reset-password", standalone: true, imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonItem, IonLabel, IonInput, CommonModule, FormsModule, RouterLink], template: '<ion-header [translucent]="true">\n  <ion-toolbar>\n    <ion-title>Reset Password</ion-title>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content class="ion-padding">\n  <div class="center-card-container">\n    <ion-card>\n      <ion-card-content>\n        <h1 class="card-title">Set New Password</h1>\n        <p class="instruction-text">Enter your new password below</p>\n\n        <form (ngSubmit)="onResetPassword()" #resetForm="ngForm">\n          <ion-item>\n            <ion-label position="floating">New Password</ion-label>\n            <ion-input\n              type="password"\n              name="password"\n              [(ngModel)]="newPassword"\n              required\n              minlength="6"\n              maxlength="100"\n              #passwordInput="ngModel"\n            ></ion-input>\n          </ion-item>\n          <div\n            *ngIf="passwordInput.invalid && passwordInput.touched"\n            class="error-message"\n          >\n            Password must be at least 6 characters long\n          </div>\n\n          <ion-item>\n            <ion-label position="floating">Confirm New Password</ion-label>\n            <ion-input\n              type="password"\n              name="confirmPassword"\n              [(ngModel)]="confirmPassword"\n              required\n              maxlength="100"\n              #confirmInput="ngModel"\n            ></ion-input>\n          </ion-item>\n          <div\n            *ngIf="confirmInput.touched && newPassword !== confirmPassword"\n            class="error-message"\n          >\n            Passwords do not match\n          </div>\n\n          <ion-button\n            expand="full"\n            type="submit"\n            [disabled]="!resetForm.form.valid || newPassword !== confirmPassword || isLoading"\n          >\n            <span *ngIf="!isLoading">Update Password</span>\n            <span *ngIf="isLoading">Updating...</span>\n          </ion-button>\n        </form>\n\n        <div class="login-link ion-text-center ion-margin-top">\n          <a routerLink="/login">Back to Login</a>\n        </div>\n      </ion-card-content>\n    </ion-card>\n  </div>\n</ion-content>\n', styles: ['/* src/app/reset-password/reset-password.page.scss */\n.center-card-container {\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  min-height: 100vh;\n  padding: 60px 20px 20px 20px;\n}\nion-card {\n  width: 100%;\n  max-width: 400px;\n  min-height: 450px;\n  border-radius: 16px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.card-title {\n  text-align: center;\n  font-size: 2rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  margin-bottom: 8px;\n}\n.instruction-text {\n  text-align: center;\n  color: var(--ion-color-medium-shade);\n  font-size: 0.95rem;\n  margin-bottom: 24px;\n}\n.divider {\n  position: relative;\n  margin: 24px 0;\n}\n.divider::before {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: var(--ion-color-light-shade);\n}\n.divider span {\n  background: var(--ion-background-color);\n  padding: 0 16px;\n  color: var(--ion-color-medium);\n  font-size: 0.9rem;\n}\nion-item {\n  --border-radius: 8px;\n  --background: var(--ion-color-light);\n  margin-bottom: 16px;\n}\nion-button {\n  margin-top: 24px;\n  height: 48px;\n  font-weight: 600;\n}\n.error-message {\n  color: var(--ion-color-danger);\n  font-size: 0.85rem;\n  margin-top: -12px;\n  margin-bottom: 12px;\n  padding-left: 16px;\n}\n.login-link {\n  margin-top: 24px;\n}\n.login-link a {\n  color: var(--ion-color-primary);\n  text-decoration: none;\n  font-weight: 500;\n}\n.login-link a:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=reset-password.page.css.map */\n'] }]
  }], () => [{ type: AuthService }, { type: Router }, { type: ActivatedRoute }, { type: ToastController }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ResetPasswordPage, { className: "ResetPasswordPage", filePath: "src/app/reset-password/reset-password.page.ts", lineNumber: 18 });
})();
export {
  ResetPasswordPage
};
//# sourceMappingURL=reset-password.page-LPVFALN4.js.map
