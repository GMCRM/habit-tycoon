import {
  addIcons,
  logoGoogle
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
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
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

// src/app/sign-up/sign-up.page.ts
var _SignUpPage = class _SignUpPage {
  constructor(authService, router) {
    this.authService = authService;
    this.router = router;
    this.email = "";
    this.displayName = "";
    this.password = "";
    addIcons({ logoGoogle });
  }
  // Google OAuth signup
  onGoogleSignUp() {
    return __async(this, null, function* () {
      console.log("\u{1F504} Starting Google OAuth signup...");
      try {
        const result = yield this.authService.signUpWithGoogle();
        if (result.error) {
          console.error("\u274C Google signup failed:", result.error);
          alert("Google signup failed: " + result.error?.message || "Unknown error");
          return;
        }
        console.log("\u2705 Google OAuth initiated successfully");
      } catch (error) {
        console.error("\u274C Unexpected Google signup error:", error);
        alert("Unexpected error during Google signup: " + error);
      }
    });
  }
  onSignUp() {
    return __async(this, null, function* () {
      const email = this.email.trim();
      const password = this.password.trim();
      const displayName = this.displayName.trim();
      if (!email || !password) {
        alert("Please fill in all required fields");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }
      console.log("\u{1F504} Starting sign-up process...");
      console.log("Email:", email);
      console.log("Display name:", displayName);
      try {
        const result = yield this.authService.signUp(email, password, displayName);
        if (result.error) {
          console.error("\u274C Sign-up failed:", result.error);
          let errorMessage = "Sign-up failed: ";
          if (result.error.message) {
            errorMessage += result.error.message;
          } else {
            errorMessage += "Unknown error occurred";
          }
          if (result.error.details) {
            console.error("Error details:", result.error.details);
          }
          alert(errorMessage);
          return;
        }
        console.log("\u2705 Sign-up successful:", result.data);
        if (result.data?.user && !result.data.user.email_confirmed_at) {
          alert("Sign-up successful! Please check your email to confirm your account before logging in.");
        } else {
          alert("Sign-up successful! You can now log in.");
        }
        this.router.navigate(["/login"]);
      } catch (error) {
        console.error("\u274C Unexpected sign-up error:", error);
        alert("Unexpected error during sign-up: " + error);
      }
    });
  }
};
_SignUpPage.\u0275fac = function SignUpPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _SignUpPage)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router));
};
_SignUpPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SignUpPage, selectors: [["app-sign-up"]], decls: 35, vars: 3, consts: [["signUpForm", "ngForm"], [1, "ion-padding"], [1, "center-card-container"], [1, "card-title"], ["expand", "block", "fill", "solid", "color", "danger", 3, "click"], ["name", "logo-google", "slot", "start"], [1, "divider", "ion-text-center", "ion-margin"], [3, "ngSubmit"], ["position", "floating"], ["type", "email", "name", "email", "required", "", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["type", "text", "name", "displayName", "required", "", "maxlength", "30", 3, "ngModelChange", "ngModel"], [1, "input-helper"], ["type", "password", "name", "password", "required", "", "maxlength", "100", 3, "ngModelChange", "ngModel"], ["expand", "block", "fill", "outline", "type", "submit", 3, "click"], [1, "login-link", "ion-text-center", "ion-margin-top"], ["routerLink", "/login"]], template: function SignUpPage_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-content", 1)(1, "div", 2)(2, "ion-card")(3, "ion-card-content")(4, "h1", 3);
    \u0275\u0275text(5, "Sign Up");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 4);
    \u0275\u0275listener("click", function SignUpPage_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onGoogleSignUp());
    });
    \u0275\u0275element(7, "ion-icon", 5);
    \u0275\u0275text(8, " Continue with Google ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 6)(10, "span");
    \u0275\u0275text(11, "or");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "form", 7, 0);
    \u0275\u0275listener("ngSubmit", function SignUpPage_Template_form_ngSubmit_12_listener() {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onSignUp());
    });
    \u0275\u0275elementStart(14, "ion-item")(15, "ion-label", 8);
    \u0275\u0275text(16, "Email");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "ion-input", 9);
    \u0275\u0275twoWayListener("ngModelChange", function SignUpPage_Template_ion_input_ngModelChange_17_listener($event) {
      \u0275\u0275restoreView(_r1);
      \u0275\u0275twoWayBindingSet(ctx.email, $event) || (ctx.email = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "ion-item")(19, "ion-label", 8);
    \u0275\u0275text(20, "Display Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "ion-input", 10);
    \u0275\u0275twoWayListener("ngModelChange", function SignUpPage_Template_ion_input_ngModelChange_21_listener($event) {
      \u0275\u0275restoreView(_r1);
      \u0275\u0275twoWayBindingSet(ctx.displayName, $event) || (ctx.displayName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "p", 11);
    \u0275\u0275text(23, "How you'll appear to friends");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "ion-item")(25, "ion-label", 8);
    \u0275\u0275text(26, "Password");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "ion-input", 12);
    \u0275\u0275twoWayListener("ngModelChange", function SignUpPage_Template_ion_input_ngModelChange_27_listener($event) {
      \u0275\u0275restoreView(_r1);
      \u0275\u0275twoWayBindingSet(ctx.password, $event) || (ctx.password = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(28, "ion-button", 13);
    \u0275\u0275listener("click", function SignUpPage_Template_ion_button_click_28_listener() {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onSignUp());
    });
    \u0275\u0275text(29, " Sign Up with Email ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "div", 14)(31, "p");
    \u0275\u0275text(32, "Already have an account?");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "a", 15);
    \u0275\u0275text(34, "Click here to log in!");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(17);
    \u0275\u0275twoWayProperty("ngModel", ctx.email);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx.displayName);
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", ctx.password);
  }
}, dependencies: [IonContent, IonInput, IonButton, IonItem, IonLabel, IonCard, IonCardContent, IonIcon, CommonModule, FormsModule, \u0275NgNoValidate, NgControlStatus, NgControlStatusGroup, RequiredValidator, MaxLengthValidator, NgModel, NgForm, RouterLink], styles: ['\n\n.center-card-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  min-height: 100vh;\n  padding: 60px 20px 20px 20px;\n}\nion-card[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 400px;\n  min-height: 500px;\n  border-radius: 16px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.card-title[_ngcontent-%COMP%] {\n  text-align: center;\n  font-size: 2rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  margin: 0 0 32px 0;\n  letter-spacing: 0.5px;\n}\nion-card-content[_ngcontent-%COMP%] {\n  padding: 32px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  height: 100%;\n}\nion-item[_ngcontent-%COMP%] {\n  --background: transparent;\n  --border-color: var(--ion-color-medium);\n  margin-bottom: 16px;\n}\nion-button[_ngcontent-%COMP%] {\n  margin-top: 24px;\n  height: 48px;\n  font-weight: 600;\n}\n.input-helper[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--ion-color-medium);\n  margin: -12px 0 8px 16px;\n  font-style: italic;\n}\n.login-link[_ngcontent-%COMP%] {\n  margin-top: 24px;\n}\n.login-link[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-medium-shade);\n  font-size: 0.9rem;\n}\n.login-link[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  text-decoration: none;\n  font-weight: 500;\n}\n.login-link[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n.divider[_ngcontent-%COMP%] {\n  margin: 1rem 0;\n  position: relative;\n}\n.divider[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: var(--ion-color-medium);\n  z-index: 1;\n}\n.divider[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  background: var(--ion-background-color);\n  padding: 0 1rem;\n  color: var(--ion-color-medium);\n  position: relative;\n  z-index: 2;\n}\n/*# sourceMappingURL=sign-up.page.css.map */'] });
var SignUpPage = _SignUpPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SignUpPage, [{
    type: Component,
    args: [{ selector: "app-sign-up", standalone: true, imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonText, IonCard, IonCardContent, IonIcon, CommonModule, FormsModule, RouterLink], template: `<ion-content class="ion-padding">
  <div class="center-card-container">
    <ion-card>
      <ion-card-content>
        <h1 class="card-title">Sign Up</h1>

        <!-- Google OAuth Button -->
        <ion-button
          expand="block"
          fill="solid"
          color="danger"
          (click)="onGoogleSignUp()"
        >
          <ion-icon name="logo-google" slot="start"></ion-icon>
          Continue with Google
        </ion-button>

        <div class="divider ion-text-center ion-margin">
          <span>or</span>
        </div>

        <form (ngSubmit)="onSignUp()" #signUpForm="ngForm">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              maxlength="100"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Display Name</ion-label>
            <ion-input
              type="text"
              name="displayName"
              [(ngModel)]="displayName"
              required
              maxlength="30"
            ></ion-input>
          </ion-item>
          <p class="input-helper">How you'll appear to friends</p>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              maxlength="100"
            ></ion-input>
          </ion-item>

          <ion-button
            expand="block"
            fill="outline"
            type="submit"
            (click)="onSignUp()"
          >
            Sign Up with Email
          </ion-button>
        </form>

        <div class="login-link ion-text-center ion-margin-top">
          <p>Already have an account?</p>
          <a routerLink="/login">Click here to log in!</a>
        </div>
      </ion-card-content>
    </ion-card>
  </div>
</ion-content>
`, styles: ['/* src/app/sign-up/sign-up.page.scss */\n.center-card-container {\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  min-height: 100vh;\n  padding: 60px 20px 20px 20px;\n}\nion-card {\n  width: 100%;\n  max-width: 400px;\n  min-height: 500px;\n  border-radius: 16px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.card-title {\n  text-align: center;\n  font-size: 2rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  margin: 0 0 32px 0;\n  letter-spacing: 0.5px;\n}\nion-card-content {\n  padding: 32px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  height: 100%;\n}\nion-item {\n  --background: transparent;\n  --border-color: var(--ion-color-medium);\n  margin-bottom: 16px;\n}\nion-button {\n  margin-top: 24px;\n  height: 48px;\n  font-weight: 600;\n}\n.input-helper {\n  font-size: 0.8rem;\n  color: var(--ion-color-medium);\n  margin: -12px 0 8px 16px;\n  font-style: italic;\n}\n.login-link {\n  margin-top: 24px;\n}\n.login-link p {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-medium-shade);\n  font-size: 0.9rem;\n}\n.login-link a {\n  color: var(--ion-color-primary);\n  text-decoration: none;\n  font-weight: 500;\n}\n.login-link a:hover {\n  text-decoration: underline;\n}\n.divider {\n  margin: 1rem 0;\n  position: relative;\n}\n.divider::before {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: var(--ion-color-medium);\n  z-index: 1;\n}\n.divider span {\n  background: var(--ion-background-color);\n  padding: 0 1rem;\n  color: var(--ion-color-medium);\n  position: relative;\n  z-index: 2;\n}\n/*# sourceMappingURL=sign-up.page.css.map */\n'] }]
  }], () => [{ type: AuthService }, { type: Router }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SignUpPage, { className: "SignUpPage", filePath: "src/app/sign-up/sign-up.page.ts", lineNumber: 17 });
})();
export {
  SignUpPage
};
//# sourceMappingURL=sign-up.page-YJ6R3ECK.js.map
