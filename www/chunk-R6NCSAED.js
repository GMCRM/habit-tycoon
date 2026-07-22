import {
  add,
  addIcons,
  home,
  people,
  trendingUp
} from "./chunk-DTAWB6F7.js";
import {
  CommonModule,
  Component,
  Input,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  Router,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵproperty,
  ɵɵtext
} from "./chunk-AYR3XDH5.js";
import {
  __async
} from "./chunk-QXFS4N4X.js";

// src/app/shared/bottom-nav/bottom-nav.component.ts
var _BottomNavComponent = class _BottomNavComponent {
  constructor(router) {
    this.router = router;
    this.mainButton = "add";
    addIcons({ add, people, trendingUp, home });
  }
  addHabitBusiness() {
    if (this.mainButton === "home") {
      this.router.navigate(["/home"]);
    } else {
      this.router.navigate(["/create-habit-business"]);
    }
  }
  openSocial() {
    return __async(this, null, function* () {
      console.log("\u{1F50D} BottomNav: Social button clicked");
      try {
        yield this.router.navigate(["/social"]);
        console.log("\u2705 BottomNav: Navigated to social");
      } catch (error) {
        console.error("\u274C BottomNav: Navigation failed:", error);
      }
    });
  }
  openStocks() {
    return __async(this, null, function* () {
      console.log("\u{1F50D} BottomNav: Stocks button clicked - DEBUGGING");
      console.log("\u{1F50D} BottomNav: Stocks button clicked");
      try {
        yield this.router.navigate(["/stocks"]);
        console.log("\u2705 BottomNav: Navigated to stocks");
      } catch (error) {
        console.error("\u274C BottomNav: Navigation failed:", error);
      }
    });
  }
};
_BottomNavComponent.\u0275fac = function BottomNavComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _BottomNavComponent)(\u0275\u0275directiveInject(Router));
};
_BottomNavComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BottomNavComponent, selectors: [["app-bottom-nav"]], inputs: { mainButton: "mainButton" }, decls: 13, vars: 1, consts: [[1, "bottom-nav-container"], [1, "custom-tab-bar"], [1, "nav-button", 3, "click"], ["name", "people"], [1, "add-button", 3, "click"], [1, "add-circle"], [3, "name"], ["name", "trending-up"]], template: function BottomNavComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0)(1, "ion-tab-bar", 1)(2, "ion-tab-button", 2);
    \u0275\u0275listener("click", function BottomNavComponent_Template_ion_tab_button_click_2_listener() {
      return ctx.openSocial();
    });
    \u0275\u0275element(3, "ion-icon", 3);
    \u0275\u0275elementStart(4, "ion-label");
    \u0275\u0275text(5, "Social");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "ion-tab-button", 4);
    \u0275\u0275listener("click", function BottomNavComponent_Template_ion_tab_button_click_6_listener() {
      return ctx.addHabitBusiness();
    });
    \u0275\u0275elementStart(7, "div", 5);
    \u0275\u0275element(8, "ion-icon", 6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "ion-tab-button", 2);
    \u0275\u0275listener("click", function BottomNavComponent_Template_ion_tab_button_click_9_listener() {
      return ctx.openStocks();
    });
    \u0275\u0275element(10, "ion-icon", 7);
    \u0275\u0275elementStart(11, "ion-label");
    \u0275\u0275text(12, "Stocks");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(8);
    \u0275\u0275property("name", ctx.mainButton === "home" ? "home" : "add");
  }
}, dependencies: [CommonModule, IonTabBar, IonTabButton, IonIcon, IonLabel], styles: ["\n\n.bottom-nav-container[_ngcontent-%COMP%] {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 1000;\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border-top: 1px solid #FFD700;\n  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);\n}\n.custom-tab-bar[_ngcontent-%COMP%] {\n  --background: transparent;\n  --border: none;\n  height: 70px;\n  padding: 0 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.add-button[_ngcontent-%COMP%] {\n  --color: white;\n  --color-selected: white;\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.add-circle[_ngcontent-%COMP%] {\n  width: 56px;\n  height: 56px;\n  background:\n    linear-gradient(\n      135deg,\n      #00ff88 0%,\n      #00e676 100%);\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);\n  transition: all 0.2s ease;\n}\n.add-circle[_ngcontent-%COMP%]:hover {\n  transform: scale(1.05);\n  box-shadow: 0 6px 16px rgba(0, 255, 136, 0.4);\n}\n.add-circle[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 28px;\n  color: #1e1e3f;\n  font-weight: bold;\n}\n.nav-button[_ngcontent-%COMP%] {\n  --color: #ffdb1a;\n  --color-selected: #ffdb1a;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 50px;\n  transition: all 0.2s ease;\n}\n.nav-button[_ngcontent-%COMP%]:hover {\n  --color: #FFD700;\n}\n.nav-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n  margin-bottom: 4px;\n}\n.nav-button[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 500;\n}\n@media (max-width: 480px) {\n  .custom-tab-bar[_ngcontent-%COMP%] {\n    padding: 0 15px;\n  }\n  .add-circle[_ngcontent-%COMP%] {\n    width: 50px;\n    height: 50px;\n  }\n  .add-circle[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    font-size: 24px;\n  }\n  .nav-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    font-size: 22px;\n  }\n  .nav-button[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n    font-size: 11px;\n  }\n}\n/*# sourceMappingURL=bottom-nav.component.css.map */"] });
var BottomNavComponent = _BottomNavComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BottomNavComponent, [{
    type: Component,
    args: [{ selector: "app-bottom-nav", standalone: true, imports: [CommonModule, IonTabBar, IonTabButton, IonIcon, IonLabel], template: `<div class="bottom-nav-container">
  <ion-tab-bar class="custom-tab-bar">
    <!-- Social Button -->
    <ion-tab-button class="nav-button" (click)="openSocial()">
      <ion-icon name="people"></ion-icon>
      <ion-label>Social</ion-label>
    </ion-tab-button>

    <!-- Main Button: Add or Home -->
    <ion-tab-button class="add-button" (click)="addHabitBusiness()">
      <div class="add-circle">
        <ion-icon [name]="mainButton === 'home' ? 'home' : 'add'"></ion-icon>
      </div>
    </ion-tab-button>

    <!-- Stocks/Leaderboard Button -->
    <ion-tab-button class="nav-button" (click)="openStocks()">
      <ion-icon name="trending-up"></ion-icon>
      <ion-label>Stocks</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</div>
`, styles: ["/* src/app/shared/bottom-nav/bottom-nav.component.scss */\n.bottom-nav-container {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 1000;\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border-top: 1px solid #FFD700;\n  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);\n}\n.custom-tab-bar {\n  --background: transparent;\n  --border: none;\n  height: 70px;\n  padding: 0 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.add-button {\n  --color: white;\n  --color-selected: white;\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.add-circle {\n  width: 56px;\n  height: 56px;\n  background:\n    linear-gradient(\n      135deg,\n      #00ff88 0%,\n      #00e676 100%);\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);\n  transition: all 0.2s ease;\n}\n.add-circle:hover {\n  transform: scale(1.05);\n  box-shadow: 0 6px 16px rgba(0, 255, 136, 0.4);\n}\n.add-circle ion-icon {\n  font-size: 28px;\n  color: #1e1e3f;\n  font-weight: bold;\n}\n.nav-button {\n  --color: #ffdb1a;\n  --color-selected: #ffdb1a;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 50px;\n  transition: all 0.2s ease;\n}\n.nav-button:hover {\n  --color: #FFD700;\n}\n.nav-button ion-icon {\n  font-size: 24px;\n  margin-bottom: 4px;\n}\n.nav-button ion-label {\n  font-size: 12px;\n  font-weight: 500;\n}\n@media (max-width: 480px) {\n  .custom-tab-bar {\n    padding: 0 15px;\n  }\n  .add-circle {\n    width: 50px;\n    height: 50px;\n  }\n  .add-circle ion-icon {\n    font-size: 24px;\n  }\n  .nav-button ion-icon {\n    font-size: 22px;\n  }\n  .nav-button ion-label {\n    font-size: 11px;\n  }\n}\n/*# sourceMappingURL=bottom-nav.component.css.map */\n"] }]
  }], () => [{ type: Router }], { mainButton: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BottomNavComponent, { className: "BottomNavComponent", filePath: "src/app/shared/bottom-nav/bottom-nav.component.ts", lineNumber: 15 });
})();

export {
  BottomNavComponent
};
//# sourceMappingURL=chunk-R6NCSAED.js.map
