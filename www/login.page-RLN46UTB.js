import {
  addIcons,
  logoGoogle
} from "./chunk-DTAWB6F7.js";
import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  AlertController,
  CommonModule,
  Component,
  FormsModule,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  MaxLengthValidator,
  NgControlStatus,
  NgControlStatusGroup,
  NgForm,
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
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵproperty,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
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

// src/app/login/login.page.ts
var _LoginPage = class _LoginPage {
  constructor(authService, router, toastController, alertController) {
    this.authService = authService;
    this.router = router;
    this.toastController = toastController;
    this.alertController = alertController;
    this.email = "";
    this.password = "";
    addIcons({ logoGoogle });
  }
  ngOnInit() {
  }
  // Google OAuth login
  onGoogleLogin() {
    return __async(this, null, function* () {
      console.log("\u{1F504} Starting Google OAuth login...");
      try {
        const result = yield this.authService.signInWithGoogle();
        if (result.error) {
          console.error("\u274C Google login failed:", result.error);
          const errorToast = yield this.toastController.create({
            message: "Google login failed: " + (result.error?.message || "Unknown error"),
            duration: 3e3,
            position: "top",
            color: "danger"
          });
          yield errorToast.present();
          return;
        }
        console.log("\u2705 Google OAuth initiated successfully");
      } catch (error) {
        console.error("\u274C Unexpected Google login error:", error);
        const errorToast = yield this.toastController.create({
          message: "Unexpected error during Google login: " + error,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  onLogin() {
    return __async(this, null, function* () {
      try {
        const result = yield this.authService.signIn(this.email, this.password);
        console.log("Logged in user:", result);
        const successToast = yield this.toastController.create({
          message: "\u{1F389} Login successful! Welcome back!",
          duration: 2e3,
          position: "top",
          color: "success"
        });
        yield successToast.present();
        this.router.navigate(["/home"]);
      } catch (error) {
        console.error("Login failed:", error);
        const errorToast = yield this.toastController.create({
          message: "\u274C Login failed: " + error.message,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  onForgotPassword() {
    return __async(this, null, function* () {
      const alert = yield this.alertController.create({
        header: "Reset Password",
        message: "Enter your email address to receive a password reset link.",
        inputs: [
          {
            name: "email",
            type: "email",
            placeholder: "Email address",
            value: this.email
            // Pre-fill with current email if entered
          }
        ],
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Send Reset Link",
            handler: (data) => __async(this, null, function* () {
              if (!data.email || !data.email.trim()) {
                const errorToast = yield this.toastController.create({
                  message: "Please enter a valid email address",
                  duration: 3e3,
                  position: "top",
                  color: "warning"
                });
                yield errorToast.present();
                return false;
              }
              try {
                const result = yield this.authService.resetPassword(data.email.trim());
                if (result.error) {
                  const errorToast = yield this.toastController.create({
                    message: "Failed to send reset email: " + result.error?.message || "Unknown error",
                    duration: 4e3,
                    position: "top",
                    color: "danger"
                  });
                  yield errorToast.present();
                  return false;
                }
                const successToast = yield this.toastController.create({
                  message: "\u2709\uFE0F Password reset link sent! Check your email.",
                  duration: 5e3,
                  position: "top",
                  color: "success"
                });
                yield successToast.present();
                return true;
              } catch (error) {
                console.error("Password reset failed:", error);
                const errorToast = yield this.toastController.create({
                  message: "Failed to send reset email: " + error.message,
                  duration: 4e3,
                  position: "top",
                  color: "danger"
                });
                yield errorToast.present();
                return false;
              }
            })
          }
        ]
      });
      yield alert.present();
    });
  }
};
_LoginPage.\u0275fac = function LoginPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _LoginPage)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(ToastController), \u0275\u0275directiveInject(AlertController));
};
_LoginPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LoginPage, selectors: [["app-login"]], decls: 39, vars: 5, consts: [["loginForm", "ngForm"], [3, "translucent"], [1, "ion-padding", 3, "fullscreen"], [1, "login-container"], [1, "welcome-section"], [1, "login-card"], ["expand", "block", "fill", "outline", 1, "google-btn", 3, "click"], ["name", "logo-google", "slot", "start"], [1, "divider"], [3, "ngSubmit"], ["position", "floating"], ["type", "email", "name", "email", "required", "", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["type", "password", "name", "password", "required", "", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["expand", "block", "type", "submit", 1, "login-btn", 3, "disabled"], [1, "forgot-password"], ["fill", "clear", "size", "small", 3, "click"], [1, "signup-section"], ["routerLink", "/sign-up"]], template: function LoginPage_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-header", 1)(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "\u{1F4B0} Habit Tycoon");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(4, "ion-content", 2)(5, "div", 3)(6, "div", 4)(7, "h1");
    \u0275\u0275text(8, "Welcome Back!");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p");
    \u0275\u0275text(10, "Sign in to continue building your habit empire");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "ion-card", 5)(12, "ion-card-content")(13, "ion-button", 6);
    \u0275\u0275listener("click", function LoginPage_Template_ion_button_click_13_listener() {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onGoogleLogin());
    });
    \u0275\u0275element(14, "ion-icon", 7);
    \u0275\u0275text(15, " Continue with Google ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 8)(17, "span");
    \u0275\u0275text(18, "or");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "form", 9, 0);
    \u0275\u0275listener("ngSubmit", function LoginPage_Template_form_ngSubmit_19_listener() {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onLogin());
    });
    \u0275\u0275elementStart(21, "ion-item")(22, "ion-label", 10);
    \u0275\u0275text(23, "Email Address");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "ion-input", 11);
    \u0275\u0275twoWayListener("ngModelChange", function LoginPage_Template_ion_input_ngModelChange_24_listener($event) {
      \u0275\u0275restoreView(_r1);
      \u0275\u0275twoWayBindingSet(ctx.email, $event) || (ctx.email = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "ion-item")(26, "ion-label", 10);
    \u0275\u0275text(27, "Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "ion-input", 12);
    \u0275\u0275twoWayListener("ngModelChange", function LoginPage_Template_ion_input_ngModelChange_28_listener($event) {
      \u0275\u0275restoreView(_r1);
      \u0275\u0275twoWayBindingSet(ctx.password, $event) || (ctx.password = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "ion-button", 13);
    \u0275\u0275text(30, " Sign In ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "div", 14)(32, "ion-button", 15);
    \u0275\u0275listener("click", function LoginPage_Template_ion_button_click_32_listener() {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onForgotPassword());
    });
    \u0275\u0275text(33, " Forgot your password? ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(34, "div", 16)(35, "p");
    \u0275\u0275text(36, "New to Habit Tycoon?");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "a", 17);
    \u0275\u0275text(38, "Create Account");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    const loginForm_r2 = \u0275\u0275reference(20);
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(4);
    \u0275\u0275property("fullscreen", true);
    \u0275\u0275advance(20);
    \u0275\u0275twoWayProperty("ngModel", ctx.email);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx.password);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !loginForm_r2.form.valid);
  }
}, dependencies: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonCard, IonCardContent, IonIcon, CommonModule, FormsModule, \u0275NgNoValidate, NgControlStatus, NgControlStatusGroup, RequiredValidator, MaxLengthValidator, NgModel, NgForm, RouterLink], styles: ['\n\n.login-container[_ngcontent-%COMP%] {\n  padding-top: 40px;\n  max-width: 400px;\n  margin: 0 auto;\n}\n.welcome-section[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 32px;\n}\n.welcome-section[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  margin: 0 0 8px 0;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.welcome-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 1rem;\n  margin: 0;\n}\n.login-card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n  margin-bottom: 20px;\n}\n.login-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 24px;\n}\n.google-btn[_ngcontent-%COMP%] {\n  --background: rgba(255, 255, 255, 0.95);\n  --background-hover: rgba(255, 255, 255, 1);\n  --color: #5f6368;\n  --border-color: rgba(255, 255, 255, 0.2);\n  --border-width: 1px;\n  --border-style: solid;\n  height: 48px;\n  font-weight: 500;\n  text-transform: none;\n  margin-bottom: 20px;\n}\n.google-btn[_ngcontent-%COMP%]:hover {\n  --background: rgba(255, 255, 255, 1);\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\n.google-btn[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: #4285f4;\n  font-size: 18px;\n}\n.divider[_ngcontent-%COMP%] {\n  position: relative;\n  text-align: center;\n  margin: 24px 0;\n}\n.divider[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  padding: 0 20px;\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 16px;\n  font-weight: 500;\n  position: relative;\n  z-index: 2;\n}\n.divider[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: rgba(255, 255, 255, 0.2);\n  z-index: 1;\n}\nion-item[_ngcontent-%COMP%] {\n  --background: transparent;\n  --border-color: rgba(255, 255, 255, 0.2);\n  --color: white;\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n  margin-bottom: 16px;\n  border-radius: 8px;\n}\nion-item.item-has-focus[_ngcontent-%COMP%] {\n  --border-color: var(--ion-color-primary);\n  --highlight-color: var(--ion-color-primary);\n}\nion-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  --color: rgba(255, 255, 255, 0.7);\n}\nion-item[_ngcontent-%COMP%]   ion-input[_ngcontent-%COMP%] {\n  --color: white;\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n}\n.login-btn[_ngcontent-%COMP%] {\n  --background: var(--ion-color-primary);\n  --background-hover: var(--ion-color-primary-shade);\n  --color: var(--ion-color-primary-contrast);\n  height: 48px;\n  font-weight: 600;\n  text-transform: none;\n  margin-top: 20px;\n  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);\n}\n.login-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 15px rgba(255, 215, 0, 0.4);\n}\n.login-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n}\n.forgot-password[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-top: 16px;\n}\n.forgot-password[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --color: rgba(255, 255, 255, 0.7);\n  font-size: 0.9rem;\n}\n.forgot-password[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]:hover {\n  --color: var(--ion-color-primary);\n}\n.signup-section[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-top: 24px;\n  padding-top: 20px;\n  border-top: 1px solid rgba(255, 255, 255, 0.1);\n}\n.signup-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 0.9rem;\n  margin: 0 0 8px 0;\n}\n.signup-section[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  text-decoration: none;\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.signup-section[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=login.page.css.map */'] });
var LoginPage = _LoginPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LoginPage, [{
    type: Component,
    args: [{ selector: "app-login", standalone: true, imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonCard, IonCardContent, IonIcon, CommonModule, FormsModule, RouterLink], template: '<ion-header [translucent]="true">\n  <ion-toolbar>\n    <ion-title>\u{1F4B0} Habit Tycoon</ion-title>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content [fullscreen]="true" class="ion-padding">\n  <div class="login-container">\n    <div class="welcome-section">\n      <h1>Welcome Back!</h1>\n      <p>Sign in to continue building your habit empire</p>\n    </div>\n\n    <ion-card class="login-card">\n      <ion-card-content>\n        <!-- Google OAuth Button -->\n        <ion-button\n          expand="block"\n          fill="outline"\n          class="google-btn"\n          (click)="onGoogleLogin()"\n        >\n          <ion-icon name="logo-google" slot="start"></ion-icon>\n          Continue with Google\n        </ion-button>\n\n        <div class="divider">\n          <span>or</span>\n        </div>\n\n        <form (ngSubmit)="onLogin()" #loginForm="ngForm">\n          <ion-item>\n            <ion-label position="floating">Email Address</ion-label>\n            <ion-input\n              type="email"\n              name="email"\n              [(ngModel)]="email"\n              required\n              maxlength="100"\n            ></ion-input>\n          </ion-item>\n\n          <ion-item>\n            <ion-label position="floating">Password</ion-label>\n            <ion-input\n              type="password"\n              name="password"\n              [(ngModel)]="password"\n              required\n              maxlength="100"\n            ></ion-input>\n          </ion-item>\n\n          <ion-button\n            expand="block"\n            type="submit"\n            class="login-btn"\n            [disabled]="!loginForm.form.valid"\n          >\n            Sign In\n          </ion-button>\n        </form>\n\n        <div class="forgot-password">\n          <ion-button fill="clear" size="small" (click)="onForgotPassword()">\n            Forgot your password?\n          </ion-button>\n        </div>\n\n        <div class="signup-section">\n          <p>New to Habit Tycoon?</p>\n          <a routerLink="/sign-up">Create Account</a>\n        </div>\n      </ion-card-content>\n    </ion-card>\n  </div>\n</ion-content>\n', styles: ['/* src/app/login/login.page.scss */\n.login-container {\n  padding-top: 40px;\n  max-width: 400px;\n  margin: 0 auto;\n}\n.welcome-section {\n  text-align: center;\n  margin-bottom: 32px;\n}\n.welcome-section h1 {\n  font-size: 2rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  margin: 0 0 8px 0;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.welcome-section p {\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 1rem;\n  margin: 0;\n}\n.login-card {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n  margin-bottom: 20px;\n}\n.login-card ion-card-content {\n  padding: 24px;\n}\n.google-btn {\n  --background: rgba(255, 255, 255, 0.95);\n  --background-hover: rgba(255, 255, 255, 1);\n  --color: #5f6368;\n  --border-color: rgba(255, 255, 255, 0.2);\n  --border-width: 1px;\n  --border-style: solid;\n  height: 48px;\n  font-weight: 500;\n  text-transform: none;\n  margin-bottom: 20px;\n}\n.google-btn:hover {\n  --background: rgba(255, 255, 255, 1);\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\n.google-btn ion-icon {\n  color: #4285f4;\n  font-size: 18px;\n}\n.divider {\n  position: relative;\n  text-align: center;\n  margin: 24px 0;\n}\n.divider span {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  padding: 0 20px;\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 16px;\n  font-weight: 500;\n  position: relative;\n  z-index: 2;\n}\n.divider::before {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: rgba(255, 255, 255, 0.2);\n  z-index: 1;\n}\nion-item {\n  --background: transparent;\n  --border-color: rgba(255, 255, 255, 0.2);\n  --color: white;\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n  margin-bottom: 16px;\n  border-radius: 8px;\n}\nion-item.item-has-focus {\n  --border-color: var(--ion-color-primary);\n  --highlight-color: var(--ion-color-primary);\n}\nion-item ion-label {\n  --color: rgba(255, 255, 255, 0.7);\n}\nion-item ion-input {\n  --color: white;\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n}\n.login-btn {\n  --background: var(--ion-color-primary);\n  --background-hover: var(--ion-color-primary-shade);\n  --color: var(--ion-color-primary-contrast);\n  height: 48px;\n  font-weight: 600;\n  text-transform: none;\n  margin-top: 20px;\n  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);\n}\n.login-btn:hover:not(:disabled) {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 15px rgba(255, 215, 0, 0.4);\n}\n.login-btn:disabled {\n  opacity: 0.5;\n}\n.forgot-password {\n  text-align: center;\n  margin-top: 16px;\n}\n.forgot-password ion-button {\n  --color: rgba(255, 255, 255, 0.7);\n  font-size: 0.9rem;\n}\n.forgot-password ion-button:hover {\n  --color: var(--ion-color-primary);\n}\n.signup-section {\n  text-align: center;\n  margin-top: 24px;\n  padding-top: 20px;\n  border-top: 1px solid rgba(255, 255, 255, 0.1);\n}\n.signup-section p {\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 0.9rem;\n  margin: 0 0 8px 0;\n}\n.signup-section a {\n  color: var(--ion-color-primary);\n  text-decoration: none;\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.signup-section a:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=login.page.css.map */\n'] }]
  }], () => [{ type: AuthService }, { type: Router }, { type: ToastController }, { type: AlertController }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LoginPage, { className: "LoginPage", filePath: "src/app/login/login.page.ts", lineNumber: 17 });
})();
export {
  LoginPage
};
//# sourceMappingURL=login.page-RLN46UTB.js.map
