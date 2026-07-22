import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  Component,
  IonApp,
  IonRouterOutlet,
  IonicRouteStrategy,
  NgZone,
  PreloadAllModules,
  RouteReuseStrategy,
  Router,
  bootstrapApplication,
  inject,
  provideIonicAngular,
  provideRouter,
  setClassMetadata,
  withHashLocation,
  withPreloading,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart
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

// src/app/guards/admin.guard.ts
var adminGuard = () => __async(null, null, function* () {
  const authService = inject(AuthService);
  const router = inject(Router);
  try {
    const { data: { user } } = yield authService.getUser();
    const ADMIN_EMAIL = "grantmatai@gmail.com";
    if (user && user.email === ADMIN_EMAIL) {
      console.log("\u2705 Admin access granted for:", user.email);
      return true;
    }
    console.log("\u274C Admin access denied for:", user?.email || "no user");
    router.navigate(["/home"]);
    return false;
  } catch (error) {
    console.error("\u274C Admin guard error:", error);
    router.navigate(["/home"]);
    return false;
  }
});

// src/app/guards/auth.guard.ts
var authGuard = () => __async(null, null, function* () {
  const authService = inject(AuthService);
  const router = inject(Router);
  try {
    const { data: { session } } = yield authService.getSession();
    if (session?.user) {
      return true;
    }
    return router.createUrlTree(["/login"]);
  } catch (error) {
    console.error("Auth guard session check failed:", error);
    return router.createUrlTree(["/login"]);
  }
});

// src/app/app.routes.ts
var routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "home",
    loadComponent: () => import("./home.page-SV7G45DL.js").then((m) => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: "login",
    loadComponent: () => import("./login.page-RLN46UTB.js").then((m) => m.LoginPage)
  },
  {
    path: "sign-up",
    loadComponent: () => import("./sign-up.page-YJ6R3ECK.js").then((m) => m.SignUpPage)
  },
  {
    path: "admin",
    loadComponent: () => import("./dev-tools.page-QPRESKMR.js").then((m) => m.DevToolsPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: "create-habit-business",
    loadComponent: () => import("./create-habit-business.page-7O255EDG.js").then((m) => m.CreateHabitBusinessPage),
    canActivate: [authGuard]
  },
  {
    path: "social",
    loadComponent: () => import("./social.page-ULJQWGZ2.js").then((m) => m.SocialPage),
    canActivate: [authGuard]
  },
  {
    path: "stocks",
    loadComponent: () => import("./stocks.page-MS5BRXNB.js").then((m) => m.StocksPage),
    canActivate: [authGuard]
  },
  {
    path: "reset-password",
    loadComponent: () => import("./reset-password.page-LPVFALN4.js").then((m) => m.ResetPasswordPage)
  },
  {
    path: "settings",
    loadComponent: () => import("./settings.page-QWY76DNN.js").then((m) => m.SettingsPage),
    canActivate: [authGuard]
  },
  {
    path: "weekly-receipt",
    loadComponent: () => import("./weekly-receipt.page-2XYP25WF.js").then((m) => m.WeeklyReceiptPage),
    canActivate: [authGuard]
  },
  {
    path: "**",
    redirectTo: "login",
    pathMatch: "full"
  }
];

// src/app/app.component.ts
var STALE_THRESHOLD_MS = 10 * 60 * 1e3;
var _AppComponent = class _AppComponent {
  constructor(authService, router, ngZone) {
    this.authService = authService;
    this.router = router;
    this.ngZone = ngZone;
    this.hiddenAt = null;
    this.onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        this.hiddenAt = Date.now();
      } else {
        const hiddenMs = this.hiddenAt ? Date.now() - this.hiddenAt : 0;
        this.hiddenAt = null;
        if (hiddenMs > STALE_THRESHOLD_MS) {
          window.location.reload();
          return;
        }
        this.ngZone.run(() => __async(this, null, function* () {
          try {
            yield this.authService.supabase.auth.refreshSession();
          } catch {
          }
        }));
      }
    };
  }
  getCurrentRoutePath() {
    const hashPath = window.location.hash?.replace(/^#/, "") || "";
    if (hashPath.startsWith("/")) {
      return hashPath;
    }
    return this.router.url || "/";
  }
  ngOnInit() {
    return __async(this, null, function* () {
      window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
          window.location.reload();
        }
      });
      document.addEventListener("visibilitychange", this.onVisibilityChange);
      console.log("\u{1F50D} AppComponent: Initializing app, current path:", this.getCurrentRoutePath());
      const urlParams = new URLSearchParams(window.location.search);
      const isOAuthCallback = urlParams.has("code") || urlParams.has("error_code");
      let navigatedToHome = false;
      let isExchangingCode = false;
      const goHome = (user) => __async(this, null, function* () {
        if (navigatedToHome)
          return;
        navigatedToHome = true;
        try {
          yield this.authService.ensureUserProfileExists(user);
        } catch (e) {
          console.error("\u274C AppComponent: Failed to ensure user profile:", e);
        }
        console.log("\u{1F504} AppComponent: Navigating to home");
        yield this.router.navigate(["/home"]);
        if (window.location.search) {
          const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
          window.history.replaceState(null, "", cleanUrl);
        }
      });
      this.authService.onAuthStateChange((event, session) => __async(this, null, function* () {
        this.ngZone.run(() => __async(this, null, function* () {
          console.log("\u{1F50D} AppComponent: Auth state change:", event, "current path:", this.getCurrentRoutePath());
          if (event === "SIGNED_OUT") {
            if (isExchangingCode) {
              console.log("\u{1F50D} AppComponent: Ignoring SIGNED_OUT during OAuth code exchange");
              return;
            }
            console.log("\u{1F504} AppComponent: User signed out, redirecting to login");
            navigatedToHome = false;
            this.router.navigate(["/login"]);
          } else if (event === "SIGNED_IN") {
            console.log("\u{1F504} AppComponent: SIGNED_IN event received");
            const currentPath = this.getCurrentRoutePath();
            if (currentPath === "/login" || currentPath === "/sign-up" || currentPath === "/" || isOAuthCallback) {
              yield goHome(session?.user);
            }
          }
        }));
      }));
      if (isOAuthCallback && window.location.search && !urlParams.has("error_code")) {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState(null, "", cleanUrl);
      }
      if (!isOAuthCallback) {
        try {
          const { data: { session } } = yield this.authService.getSession();
          if (session) {
            console.log("\u2705 AppComponent: User session found");
            const currentPath = this.getCurrentRoutePath();
            if (currentPath === "/login" || currentPath === "/sign-up" || currentPath === "/") {
              this.router.navigate(["/home"]);
            }
          } else {
            console.log("\u274C AppComponent: No user session found");
            const currentPath = this.getCurrentRoutePath();
            const publicPaths = ["/login", "/sign-up", "/reset-password", "/"];
            if (!publicPaths.includes(currentPath)) {
              this.router.navigate(["/login"]);
            }
          }
        } catch (error) {
          console.log("\u274C AppComponent: Session check failed:", error);
          const currentPath = this.getCurrentRoutePath();
          const publicPaths = ["/login", "/sign-up", "/reset-password", "/"];
          if (!publicPaths.includes(currentPath)) {
            this.router.navigate(["/login"]);
          }
        }
      } else {
        if (urlParams.has("error_code")) {
          console.error("\u274C AppComponent: OAuth error:", urlParams.get("error_description"));
          this.ngZone.run(() => this.router.navigate(["/login"]));
          return;
        }
        const code = urlParams.get("code");
        console.log("\u{1F50D} AppComponent: OAuth callback \u2014 exchanging code for session...");
        isExchangingCode = true;
        try {
          const { data, error } = yield this.authService.supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("\u274C AppComponent: Code exchange failed:", error.message);
            this.ngZone.run(() => this.router.navigate(["/login"]));
          } else if (data.session) {
            console.log("\u2705 AppComponent: Code exchange succeeded");
            this.ngZone.run(() => __async(this, null, function* () {
              return yield goHome(data.session.user);
            }));
          } else {
            console.error("\u274C AppComponent: No session after code exchange");
            this.ngZone.run(() => this.router.navigate(["/login"]));
          }
        } catch (err) {
          console.error("\u274C AppComponent: Code exchange threw:", err);
          this.ngZone.run(() => this.router.navigate(["/login"]));
        } finally {
          isExchangingCode = false;
        }
      }
    });
  }
  ngOnDestroy() {
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }
};
_AppComponent.\u0275fac = function AppComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AppComponent)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(NgZone));
};
_AppComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppComponent, selectors: [["app-root"]], decls: 2, vars: 0, template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-app");
    \u0275\u0275element(1, "ion-router-outlet");
    \u0275\u0275elementEnd();
  }
}, dependencies: [IonApp, IonRouterOutlet], encapsulation: 2 });
var AppComponent = _AppComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppComponent, [{
    type: Component,
    args: [{ selector: "app-root", imports: [IonApp, IonRouterOutlet], template: "<ion-app>\n  <ion-router-outlet></ion-router-outlet>\n</ion-app>\n" }]
  }], () => [{ type: AuthService }, { type: Router }, { type: NgZone }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "src/app/app.component.ts", lineNumber: 15 });
})();

// src/main.ts
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withHashLocation())
  ]
});
//# sourceMappingURL=main.js.map
