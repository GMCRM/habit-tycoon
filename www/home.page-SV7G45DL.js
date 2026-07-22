import {
  HabitGridComponent,
  HabitUpdateService
} from "./chunk-W6L7XY7U.js";
import {
  SettingsService
} from "./chunk-JHEGQNPZ.js";
import {
  BottomNavComponent
} from "./chunk-R6NCSAED.js";
import {
  HabitBusinessService,
  HabitIntervalService
} from "./chunk-GSSZ5PLU.js";
import {
  add,
  addCircle,
  addIcons,
  alertCircle,
  analytics,
  arrowBack,
  arrowUndo,
  business,
  calendar,
  calendarOutline,
  cash,
  checkmarkCircle,
  chevronDown,
  chevronUp,
  close,
  construct,
  create,
  ellipseOutline,
  helpCircle,
  lockClosed,
  logIn,
  logOut,
  refresh,
  settings,
  shield,
  time,
  trash,
  trendingUp,
  wallet
} from "./chunk-DTAWB6F7.js";
import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  AlertController,
  BehaviorSubject,
  CommonModule,
  Component,
  FormsModule,
  HostListener,
  Injectable,
  Input,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
  NgControlStatus,
  NgForOf,
  NgIf,
  NgModel,
  NgTemplateOutlet,
  Router,
  RouterLink,
  ToastController,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction3,
  ɵɵreference,
  ɵɵresetView,
  ɵɵresolveWindow,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
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

// src/app/home/upgrade-modal/upgrade-modal.component.ts
function UpgradeModalComponent_div_41_div_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 38);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const businessType_r2 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Need $", ctx_r2.getUpgradeCost(businessType_r2) - ctx_r2.userCash, " more ");
  }
}
function UpgradeModalComponent_div_41_ion_button_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-button", 39);
    \u0275\u0275element(1, "ion-icon", 40);
    \u0275\u0275text(2, " Upgrade Now ");
    \u0275\u0275elementEnd();
  }
}
function UpgradeModalComponent_div_41_ion_button_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-button", 41);
    \u0275\u0275element(1, "ion-icon", 42);
    \u0275\u0275text(2, " Can't Afford ");
    \u0275\u0275elementEnd();
  }
}
function UpgradeModalComponent_div_41_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 26);
    \u0275\u0275listener("click", function UpgradeModalComponent_div_41_Template_div_click_0_listener() {
      const businessType_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.selectUpgrade(businessType_r2));
    });
    \u0275\u0275elementStart(1, "div", 27)(2, "div", 28);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 29);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 30)(7, "div", 31)(8, "span", 32);
    \u0275\u0275text(9, "Upgrade Cost:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 33);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(12, UpgradeModalComponent_div_41_div_12_Template, 2, 1, "div", 34);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "div", 35);
    \u0275\u0275template(14, UpgradeModalComponent_div_41_ion_button_14_Template, 3, 0, "ion-button", 36)(15, UpgradeModalComponent_div_41_ion_button_15_Template, 3, 0, "ion-button", 37);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const businessType_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("affordable", ctx_r2.canAffordUpgrade(businessType_r2))("expensive", !ctx_r2.canAffordUpgrade(businessType_r2));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(businessType_r2.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(businessType_r2.name);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("affordable-text", ctx_r2.canAffordUpgrade(businessType_r2))("expensive-text", !ctx_r2.canAffordUpgrade(businessType_r2));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("$", ctx_r2.getUpgradeCost(businessType_r2));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.canAffordUpgrade(businessType_r2));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r2.canAffordUpgrade(businessType_r2));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.canAffordUpgrade(businessType_r2));
  }
}
var _UpgradeModalComponent = class _UpgradeModalComponent {
  constructor() {
    this.upgradeOptions = [];
    this.userCash = 0;
    this.currentBusinessValue = 0;
  }
  ngOnInit() {
  }
  dismiss() {
    this.modalController.dismiss();
  }
  selectUpgrade(businessType) {
    const upgradeCost = businessType.base_cost - this.currentBusinessValue;
    const canAfford = this.userCash >= upgradeCost;
    if (!canAfford) {
      this.showErrorToast(`You need $${upgradeCost - this.userCash} more to afford this upgrade.`);
      return;
    }
    this.modalController.dismiss({
      selectedBusinessType: businessType,
      upgradeCost
    });
  }
  getUpgradeCost(businessType) {
    return businessType.base_cost - this.currentBusinessValue;
  }
  canAffordUpgrade(businessType) {
    return this.userCash >= this.getUpgradeCost(businessType);
  }
  showErrorToast(message) {
    return __async(this, null, function* () {
      const toast = yield this.toastController.create({
        message: `\u274C ${message}`,
        duration: 3e3,
        position: "top",
        color: "danger"
      });
      yield toast.present();
    });
  }
};
_UpgradeModalComponent.\u0275fac = function UpgradeModalComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _UpgradeModalComponent)();
};
_UpgradeModalComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _UpgradeModalComponent, selectors: [["app-upgrade-modal"]], inputs: { habitBusiness: "habitBusiness", upgradeOptions: "upgradeOptions", userCash: "userCash", currentBusinessValue: "currentBusinessValue", modalController: "modalController", toastController: "toastController" }, decls: 48, vars: 7, consts: [[1, "modal-title"], ["name", "trending-up", "color", "success"], ["slot", "end"], ["fill", "clear", 3, "click"], ["name", "close"], [1, "upgrade-modal-content", 3, "scrollY"], [1, "scrollable-content"], [1, "current-business-info"], [1, "business-header"], [1, "business-icon"], [1, "business-details"], [1, "habit-description"], [1, "financial-info"], [1, "info-card"], ["name", "cash", "color", "success"], [1, "info-content"], [1, "info-label"], [1, "info-value"], ["name", "wallet", "color", "primary"], [1, "upgrade-options"], [1, "upgrade-subtitle"], [1, "options-grid"], ["class", "upgrade-option", 3, "affordable", "expensive", "click", 4, "ngFor", "ngForOf"], [1, "footer-content"], ["fill", "clear", "color", "warning", 3, "click"], ["name", "arrow-back", "slot", "start"], [1, "upgrade-option", 3, "click"], [1, "option-header"], [1, "business-type-icon"], [1, "business-type-name"], [1, "pricing-info"], [1, "upgrade-cost"], [1, "cost-label"], [1, "cost-amount"], ["class", "need-more", 4, "ngIf"], [1, "action-area"], ["fill", "solid", "color", "success", "size", "small", "expand", "block", 4, "ngIf"], ["fill", "outline", "color", "medium", "size", "small", "expand", "block", "disabled", "", 4, "ngIf"], [1, "need-more"], ["fill", "solid", "color", "success", "size", "small", "expand", "block"], ["name", "arrow-up", "slot", "start"], ["fill", "outline", "color", "medium", "size", "small", "expand", "block", "disabled", ""], ["name", "lock-closed", "slot", "start"]], template: function UpgradeModalComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header")(1, "ion-toolbar")(2, "ion-title")(3, "div", 0);
    \u0275\u0275element(4, "ion-icon", 1);
    \u0275\u0275text(5, " Upgrade Business ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "ion-buttons", 2)(7, "ion-button", 3);
    \u0275\u0275listener("click", function UpgradeModalComponent_Template_ion_button_click_7_listener() {
      return ctx.dismiss();
    });
    \u0275\u0275element(8, "ion-icon", 4);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(9, "ion-content", 5)(10, "div", 6)(11, "div", 7)(12, "div", 8)(13, "div", 9);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "div", 10)(16, "h2");
    \u0275\u0275text(17);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "p", 11);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "div", 12)(21, "div", 13);
    \u0275\u0275element(22, "ion-icon", 14);
    \u0275\u0275elementStart(23, "div", 15)(24, "div", 16);
    \u0275\u0275text(25, "Sell Value");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "div", 17);
    \u0275\u0275text(27);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(28, "div", 13);
    \u0275\u0275element(29, "ion-icon", 18);
    \u0275\u0275elementStart(30, "div", 15)(31, "div", 16);
    \u0275\u0275text(32, "Your Cash");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "div", 17);
    \u0275\u0275text(34);
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(35, "div", 19)(36, "h3");
    \u0275\u0275text(37, "Choose Your Upgrade");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "p", 20);
    \u0275\u0275text(39, " Select a better business type to upgrade to: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "div", 21);
    \u0275\u0275template(41, UpgradeModalComponent_div_41_Template, 16, 14, "div", 22);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(42, "ion-footer")(43, "ion-toolbar")(44, "div", 23)(45, "ion-button", 24);
    \u0275\u0275listener("click", function UpgradeModalComponent_Template_ion_button_click_45_listener() {
      return ctx.dismiss();
    });
    \u0275\u0275element(46, "ion-icon", 25);
    \u0275\u0275text(47, " Cancel ");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(9);
    \u0275\u0275property("scrollY", false);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx.habitBusiness.business_icon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx.habitBusiness.business_name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx.habitBusiness.habit_description);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate1("$", ctx.currentBusinessValue);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1("$", ctx.userCash);
    \u0275\u0275advance(7);
    \u0275\u0275property("ngForOf", ctx.upgradeOptions);
  }
}, dependencies: [CommonModule, NgForOf, NgIf, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter], styles: ["\n\n.upgrade-modal-content[_ngcontent-%COMP%] {\n  --background: var(--ion-color-light);\n  overflow: hidden;\n}\n.scrollable-content[_ngcontent-%COMP%] {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n[_nghost-%COMP%]     .upgrade-modal-content, \n[_nghost-%COMP%]     .scroll-content, \n[_nghost-%COMP%]     .scroll-y, \n[_nghost-%COMP%]     .inner-scroll {\n  scrollbar-width: none !important;\n  -ms-overflow-style: none !important;\n}\n[_nghost-%COMP%]     .upgrade-modal-content::-webkit-scrollbar, \n[_nghost-%COMP%]     .scroll-content::-webkit-scrollbar, \n[_nghost-%COMP%]     .scroll-y::-webkit-scrollbar, \n[_nghost-%COMP%]     .inner-scroll::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.modal-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-weight: 600;\n}\n.current-business-info[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  margin: 16px;\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n}\n.business-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  margin-bottom: 20px;\n}\n.business-icon[_ngcontent-%COMP%] {\n  font-size: 48px;\n  width: 64px;\n  height: 64px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 12px;\n  border: 2px solid rgba(255, 215, 0, 0.3);\n}\n.business-details[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 24px;\n  font-weight: 600;\n  color: #ffffff;\n}\n.habit-description[_ngcontent-%COMP%] {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 14px;\n}\n.financial-info[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.info-card[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 120px;\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: 8px;\n  padding: 16px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n.info-content[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.info-label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  font-weight: 500;\n  margin: 0;\n}\n.info-value[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 600;\n  color: #ffffff;\n  margin: 2px 0 0 0;\n}\n.upgrade-options[_ngcontent-%COMP%] {\n  padding: 0 16px 16px 16px;\n}\n.upgrade-options[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-size: 20px;\n  font-weight: 600;\n  color: white;\n}\n.upgrade-subtitle[_ngcontent-%COMP%] {\n  margin: 0 0 20px 0;\n  color: white;\n  font-size: 14px;\n}\n.options-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.upgrade-option[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  border: 2px solid transparent;\n}\n.upgrade-option.affordable[_ngcontent-%COMP%] {\n  border-color: var(--ion-color-success-tint);\n}\n.upgrade-option.affordable[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);\n  border-color: var(--ion-color-success);\n}\n.upgrade-option.expensive[_ngcontent-%COMP%] {\n  opacity: 0.7;\n  border-color: var(--ion-color-medium-tint);\n}\n.option-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  margin-bottom: 16px;\n}\n.business-type-icon[_ngcontent-%COMP%] {\n  font-size: 32px;\n  width: 48px;\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n}\n.business-type-name[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 600;\n  color: #ffffff;\n}\n.pricing-info[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.upgrade-cost[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-weight: 600;\n  font-size: 16px;\n  margin-bottom: 4px;\n}\n.affordable-text[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.expensive-text[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.cost-label[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n  font-weight: 500;\n}\n.need-more[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--ion-color-danger);\n  font-style: italic;\n}\n.action-area[_ngcontent-%COMP%] {\n  margin-top: 16px;\n}\n.footer-content[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  display: flex;\n  justify-content: center;\n}\n.footer-content[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --color: #ffdb1a !important;\n  color: #ffdb1a !important;\n}\n.footer-content[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: #ffdb1a !important;\n}\n@media (max-width: 768px) {\n  .business-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    text-align: center;\n  }\n  .financial-info[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n}\n/*# sourceMappingURL=upgrade-modal.component.css.map */"] });
var UpgradeModalComponent = _UpgradeModalComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(UpgradeModalComponent, [{
    type: Component,
    args: [{ selector: "app-upgrade-modal", standalone: true, imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter], template: '<ion-header>\n  <ion-toolbar>\n    <ion-title>\n      <div class="modal-title">\n        <ion-icon name="trending-up" color="success"></ion-icon>\n        Upgrade Business\n      </div>\n    </ion-title>\n    <ion-buttons slot="end">\n      <ion-button fill="clear" (click)="dismiss()">\n        <ion-icon name="close"></ion-icon>\n      </ion-button>\n    </ion-buttons>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content class="upgrade-modal-content" [scrollY]="false">\n  <div class="scrollable-content">\n    <div class="current-business-info">\n      <div class="business-header">\n        <div class="business-icon">{{ habitBusiness.business_icon }}</div>\n        <div class="business-details">\n          <h2>{{ habitBusiness.business_name }}</h2>\n          <p class="habit-description">{{ habitBusiness.habit_description }}</p>\n        </div>\n      </div>\n\n      <div class="financial-info">\n        <div class="info-card">\n          <ion-icon name="cash" color="success"></ion-icon>\n          <div class="info-content">\n            <div class="info-label">Sell Value</div>\n            <div class="info-value">${{ currentBusinessValue }}</div>\n          </div>\n        </div>\n        <div class="info-card">\n          <ion-icon name="wallet" color="primary"></ion-icon>\n          <div class="info-content">\n            <div class="info-label">Your Cash</div>\n            <div class="info-value">${{ userCash }}</div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class="upgrade-options">\n      <h3>Choose Your Upgrade</h3>\n      <p class="upgrade-subtitle">\n        Select a better business type to upgrade to:\n      </p>\n\n      <div class="options-grid">\n        <div\n          *ngFor="let businessType of upgradeOptions"\n          class="upgrade-option"\n          [class.affordable]="canAffordUpgrade(businessType)"\n          [class.expensive]="!canAffordUpgrade(businessType)"\n          (click)="selectUpgrade(businessType)"\n        >\n          <div class="option-header">\n            <div class="business-type-icon">{{ businessType.icon }}</div>\n            <div class="business-type-name">{{ businessType.name }}</div>\n          </div>\n\n          <div class="pricing-info">\n            <div\n              class="upgrade-cost"\n              [class.affordable-text]="canAffordUpgrade(businessType)"\n              [class.expensive-text]="!canAffordUpgrade(businessType)"\n            >\n              <span class="cost-label">Upgrade Cost:</span>\n              <span class="cost-amount"\n                >${{ getUpgradeCost(businessType) }}</span\n              >\n            </div>\n\n            <div *ngIf="!canAffordUpgrade(businessType)" class="need-more">\n              Need ${{ getUpgradeCost(businessType) - userCash }} more\n            </div>\n          </div>\n\n          <div class="action-area">\n            <ion-button\n              *ngIf="canAffordUpgrade(businessType)"\n              fill="solid"\n              color="success"\n              size="small"\n              expand="block"\n            >\n              <ion-icon name="arrow-up" slot="start"></ion-icon>\n              Upgrade Now\n            </ion-button>\n\n            <ion-button\n              *ngIf="!canAffordUpgrade(businessType)"\n              fill="outline"\n              color="medium"\n              size="small"\n              expand="block"\n              disabled\n            >\n              <ion-icon name="lock-closed" slot="start"></ion-icon>\n              Can\'t Afford\n            </ion-button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</ion-content>\n\n<ion-footer>\n  <ion-toolbar>\n    <div class="footer-content">\n      <ion-button fill="clear" color="warning" (click)="dismiss()">\n        <ion-icon name="arrow-back" slot="start"></ion-icon>\n        Cancel\n      </ion-button>\n    </div>\n  </ion-toolbar>\n</ion-footer>\n', styles: ["/* src/app/home/upgrade-modal/upgrade-modal.component.scss */\n.upgrade-modal-content {\n  --background: var(--ion-color-light);\n  overflow: hidden;\n}\n.scrollable-content {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n:host ::ng-deep .upgrade-modal-content,\n:host ::ng-deep .scroll-content,\n:host ::ng-deep .scroll-y,\n:host ::ng-deep .inner-scroll {\n  scrollbar-width: none !important;\n  -ms-overflow-style: none !important;\n}\n:host ::ng-deep .upgrade-modal-content::-webkit-scrollbar,\n:host ::ng-deep .scroll-content::-webkit-scrollbar,\n:host ::ng-deep .scroll-y::-webkit-scrollbar,\n:host ::ng-deep .inner-scroll::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.modal-title {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-weight: 600;\n}\n.current-business-info {\n  background: var(--business-item-background);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  margin: 16px;\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n}\n.business-header {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  margin-bottom: 20px;\n}\n.business-icon {\n  font-size: 48px;\n  width: 64px;\n  height: 64px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 12px;\n  border: 2px solid rgba(255, 215, 0, 0.3);\n}\n.business-details h2 {\n  margin: 0;\n  font-size: 24px;\n  font-weight: 600;\n  color: #ffffff;\n}\n.habit-description {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 14px;\n}\n.financial-info {\n  display: flex;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.info-card {\n  flex: 1;\n  min-width: 120px;\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: 8px;\n  padding: 16px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n.info-content {\n  flex: 1;\n}\n.info-label {\n  font-size: 12px;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  font-weight: 500;\n  margin: 0;\n}\n.info-value {\n  font-size: 18px;\n  font-weight: 600;\n  color: #ffffff;\n  margin: 2px 0 0 0;\n}\n.upgrade-options {\n  padding: 0 16px 16px 16px;\n}\n.upgrade-options h3 {\n  margin: 0 0 8px 0;\n  font-size: 20px;\n  font-weight: 600;\n  color: white;\n}\n.upgrade-subtitle {\n  margin: 0 0 20px 0;\n  color: white;\n  font-size: 14px;\n}\n.options-grid {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.upgrade-option {\n  background: var(--business-item-background);\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  border: 2px solid transparent;\n}\n.upgrade-option.affordable {\n  border-color: var(--ion-color-success-tint);\n}\n.upgrade-option.affordable:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);\n  border-color: var(--ion-color-success);\n}\n.upgrade-option.expensive {\n  opacity: 0.7;\n  border-color: var(--ion-color-medium-tint);\n}\n.option-header {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  margin-bottom: 16px;\n}\n.business-type-icon {\n  font-size: 32px;\n  width: 48px;\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n}\n.business-type-name {\n  font-size: 18px;\n  font-weight: 600;\n  color: #ffffff;\n}\n.pricing-info {\n  margin-bottom: 16px;\n}\n.upgrade-cost {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-weight: 600;\n  font-size: 16px;\n  margin-bottom: 4px;\n}\n.affordable-text {\n  color: var(--ion-color-success);\n}\n.expensive-text {\n  color: var(--ion-color-danger);\n}\n.cost-label {\n  color: rgba(255, 255, 255, 0.6);\n  font-weight: 500;\n}\n.need-more {\n  font-size: 12px;\n  color: var(--ion-color-danger);\n  font-style: italic;\n}\n.action-area {\n  margin-top: 16px;\n}\n.footer-content {\n  padding: 8px 16px;\n  display: flex;\n  justify-content: center;\n}\n.footer-content ion-button {\n  --color: #ffdb1a !important;\n  color: #ffdb1a !important;\n}\n.footer-content ion-button ion-icon {\n  color: #ffdb1a !important;\n}\n@media (max-width: 768px) {\n  .business-header {\n    flex-direction: column;\n    text-align: center;\n  }\n  .financial-info {\n    flex-direction: column;\n  }\n}\n/*# sourceMappingURL=upgrade-modal.component.css.map */\n"] }]
  }], () => [], { habitBusiness: [{
    type: Input
  }], upgradeOptions: [{
    type: Input
  }], userCash: [{
    type: Input
  }], currentBusinessValue: [{
    type: Input
  }], modalController: [{
    type: Input
  }], toastController: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(UpgradeModalComponent, { className: "UpgradeModalComponent", filePath: "src/app/home/upgrade-modal/upgrade-modal.component.ts", lineNumber: 15 });
})();

// src/app/home/edit-habit-modal/edit-habit-modal.component.ts
function EditHabitModalComponent_div_25_button_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 18);
    \u0275\u0275listener("click", function EditHabitModalComponent_div_25_button_4_Template_button_click_0_listener() {
      const dow_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleDay(dow_r2));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dow_r2 = ctx.$implicit;
    const i_r4 = ctx.index;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("active", ctx_r2.isDayActive(dow_r2));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.dayLabels[i_r4]);
  }
}
function EditHabitModalComponent_div_25_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19);
    \u0275\u0275text(1, " Select at least one active day ");
    \u0275\u0275elementEnd();
  }
}
function EditHabitModalComponent_div_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 13)(1, "div", 14);
    \u0275\u0275text(2, "Active Days");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 15);
    \u0275\u0275template(4, EditHabitModalComponent_div_25_button_4_Template, 2, 3, "button", 16);
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, EditHabitModalComponent_div_25_div_5_Template, 2, 0, "div", 17);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r2.dayDows);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.activeDays.length === 0);
  }
}
var _EditHabitModalComponent = class _EditHabitModalComponent {
  constructor() {
    this.businessName = "";
    this.habitDescription = "";
    this.recurrenceInterval = "24h";
    this.activeDays = [1, 2, 3, 4, 5];
    this.goalValue = 1;
    this.dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    this.dayDows = [0, 1, 2, 3, 4, 5, 6];
  }
  ngOnInit() {
    this.businessName = this.habitBusiness.business_name;
    this.habitDescription = this.habitBusiness.habit_description;
    const ri = this.habitBusiness.recurrence_interval;
    if (ri === "specific_days" || ri === "7d" || this.habitBusiness.frequency === "weekly") {
      this.recurrenceInterval = "specific_days";
    } else {
      this.recurrenceInterval = "24h";
    }
    this.activeDays = this.habitBusiness.active_days && this.habitBusiness.active_days.length > 0 ? [...this.habitBusiness.active_days] : [1, 2, 3, 4, 5];
    this.goalValue = this.habitBusiness.goal_value || 1;
  }
  toggleDay(dow) {
    const idx = this.activeDays.indexOf(dow);
    if (idx >= 0) {
      this.activeDays = this.activeDays.filter((d) => d !== dow);
    } else {
      this.activeDays = [...this.activeDays, dow].sort((a, b) => a - b);
    }
  }
  isDayActive(dow) {
    return this.activeDays.includes(dow);
  }
  get isSaveValid() {
    if (!this.businessName.trim() || !this.habitDescription.trim())
      return false;
    if (this.recurrenceInterval === "specific_days" && this.activeDays.length === 0)
      return false;
    return true;
  }
  dismiss() {
    this.modalController.dismiss(null, "cancel");
  }
  save() {
    if (!this.isSaveValid)
      return;
    const result = {
      businessName: this.businessName.trim(),
      habitDescription: this.habitDescription.trim(),
      recurrenceInterval: this.recurrenceInterval,
      goalValue: Math.max(1, Math.min(20, this.goalValue || 1)),
      activeDays: this.recurrenceInterval === "specific_days" ? this.activeDays : []
    };
    this.modalController.dismiss(result, "save");
  }
};
_EditHabitModalComponent.\u0275fac = function EditHabitModalComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _EditHabitModalComponent)();
};
_EditHabitModalComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _EditHabitModalComponent, selectors: [["app-edit-habit-modal"]], inputs: { habitBusiness: "habitBusiness", modalController: "modalController" }, decls: 33, vars: 6, consts: [["slot", "end"], [3, "click"], [1, "ion-padding"], ["position", "stacked"], ["placeholder", "Enter business name", 3, "ngModelChange", "ngModel"], ["placeholder", "Enter habit description", "rows", "3", "autoGrow", "true", 3, "ngModelChange", "ngModel"], [1, "segment-label"], [3, "ngModelChange", "ngModel"], ["value", "24h"], ["value", "specific_days"], ["class", "day-picker-section", 4, "ngIf"], ["type", "number", "min", "1", "max", "20", "placeholder", "1", 3, "ngModelChange", "ngModel"], ["expand", "block", 3, "click", "disabled"], [1, "day-picker-section"], [1, "day-picker-label"], [1, "day-chips"], ["class", "day-chip", "type", "button", 3, "active", "click", 4, "ngFor", "ngForOf"], ["class", "day-picker-warning", 4, "ngIf"], ["type", "button", 1, "day-chip", 3, "click"], [1, "day-picker-warning"]], template: function EditHabitModalComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header")(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "Edit Habit Business");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-buttons", 0)(5, "ion-button", 1);
    \u0275\u0275listener("click", function EditHabitModalComponent_Template_ion_button_click_5_listener() {
      return ctx.dismiss();
    });
    \u0275\u0275text(6, "Cancel");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(7, "ion-content", 2)(8, "ion-item")(9, "ion-label", 3);
    \u0275\u0275text(10, "Business Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "ion-input", 4);
    \u0275\u0275twoWayListener("ngModelChange", function EditHabitModalComponent_Template_ion_input_ngModelChange_11_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.businessName, $event) || (ctx.businessName = $event);
      return $event;
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "ion-item")(13, "ion-label", 3);
    \u0275\u0275text(14, "Habit Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "ion-textarea", 5);
    \u0275\u0275twoWayListener("ngModelChange", function EditHabitModalComponent_Template_ion_textarea_ngModelChange_15_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.habitDescription, $event) || (ctx.habitDescription = $event);
      return $event;
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "div", 6);
    \u0275\u0275text(17, "Schedule");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "ion-segment", 7);
    \u0275\u0275twoWayListener("ngModelChange", function EditHabitModalComponent_Template_ion_segment_ngModelChange_18_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.recurrenceInterval, $event) || (ctx.recurrenceInterval = $event);
      return $event;
    });
    \u0275\u0275elementStart(19, "ion-segment-button", 8)(20, "ion-label");
    \u0275\u0275text(21, "Daily \u{1F525}");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "ion-segment-button", 9)(23, "ion-label");
    \u0275\u0275text(24, "Specific Days \u{1F4C5}");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(25, EditHabitModalComponent_div_25_Template, 6, 2, "div", 10);
    \u0275\u0275elementStart(26, "ion-item")(27, "ion-label", 3);
    \u0275\u0275text(28, "Completions per day");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "ion-input", 11);
    \u0275\u0275twoWayListener("ngModelChange", function EditHabitModalComponent_Template_ion_input_ngModelChange_29_listener($event) {
      \u0275\u0275twoWayBindingSet(ctx.goalValue, $event) || (ctx.goalValue = $event);
      return $event;
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(30, "ion-footer", 2)(31, "ion-button", 12);
    \u0275\u0275listener("click", function EditHabitModalComponent_Template_ion_button_click_31_listener() {
      return ctx.save();
    });
    \u0275\u0275text(32, " Save Changes ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(11);
    \u0275\u0275twoWayProperty("ngModel", ctx.businessName);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx.habitDescription);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx.recurrenceInterval);
    \u0275\u0275advance(7);
    \u0275\u0275property("ngIf", ctx.recurrenceInterval === "specific_days");
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx.goalValue);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", !ctx.isSaveValid);
  }
}, dependencies: [
  CommonModule,
  NgForOf,
  NgIf,
  FormsModule,
  NgControlStatus,
  NgModel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonFooter,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSegment,
  IonSegmentButton
], styles: ["\n\n.segment-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--ion-color-medium);\n  padding: 16px 16px 4px;\n}\nion-segment[_ngcontent-%COMP%] {\n  margin: 0 16px 8px;\n}\n.day-picker-section[_ngcontent-%COMP%] {\n  padding: 12px 16px 4px;\n}\n.day-picker-section[_ngcontent-%COMP%]   .day-picker-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--ion-color-medium);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 8px;\n}\n.day-picker-section[_ngcontent-%COMP%]   .day-chips[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.day-picker-section[_ngcontent-%COMP%]   .day-chip[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.2);\n  background: rgba(255, 255, 255, 0.06);\n  color: rgba(255, 255, 255, 0.45);\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n.day-picker-section[_ngcontent-%COMP%]   .day-chip.active[_ngcontent-%COMP%] {\n  background: #FFD700;\n  border-color: #FFD700;\n  color: #000;\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.35);\n}\n.day-picker-section[_ngcontent-%COMP%]   .day-chip[_ngcontent-%COMP%]:hover {\n  border-color: #FFD700;\n  color: #FFD700;\n}\n.day-picker-section[_ngcontent-%COMP%]   .day-picker-warning[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--ion-color-danger);\n  margin-top: 6px;\n}\n/*# sourceMappingURL=edit-habit-modal.component.css.map */"] });
var EditHabitModalComponent = _EditHabitModalComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EditHabitModalComponent, [{
    type: Component,
    args: [{ selector: "app-edit-habit-modal", standalone: true, imports: [
      CommonModule,
      FormsModule,
      IonHeader,
      IonToolbar,
      IonTitle,
      IonContent,
      IonButton,
      IonButtons,
      IonFooter,
      IonItem,
      IonLabel,
      IonInput,
      IonTextarea,
      IonSegment,
      IonSegmentButton
    ], template: `<ion-header>
  <ion-toolbar>
    <ion-title>Edit Habit Business</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="dismiss()">Cancel</ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <ion-item>
    <ion-label position="stacked">Business Name</ion-label>
    <ion-input
      [(ngModel)]="businessName"
      placeholder="Enter business name"
    ></ion-input>
  </ion-item>

  <ion-item>
    <ion-label position="stacked">Habit Description</ion-label>
    <ion-textarea
      [(ngModel)]="habitDescription"
      placeholder="Enter habit description"
      rows="3"
      autoGrow="true"
    ></ion-textarea>
  </ion-item>

  <div class="segment-label">Schedule</div>
  <ion-segment [(ngModel)]="recurrenceInterval">
    <ion-segment-button value="24h">
      <ion-label>Daily \u{1F525}</ion-label>
    </ion-segment-button>
    <ion-segment-button value="specific_days">
      <ion-label>Specific Days \u{1F4C5}</ion-label>
    </ion-segment-button>
  </ion-segment>

  <!-- Day picker \u2014 only shown for specific_days -->
  <div *ngIf="recurrenceInterval === 'specific_days'" class="day-picker-section">
    <div class="day-picker-label">Active Days</div>
    <div class="day-chips">
      <button
        *ngFor="let dow of dayDows; let i = index"
        class="day-chip"
        [class.active]="isDayActive(dow)"
        (click)="toggleDay(dow)"
        type="button"
      >{{ dayLabels[i] }}</button>
    </div>
    <div *ngIf="activeDays.length === 0" class="day-picker-warning">
      Select at least one active day
    </div>
  </div>

  <ion-item>
    <ion-label position="stacked">Completions per day</ion-label>
    <ion-input
      type="number"
      [(ngModel)]="goalValue"
      min="1"
      max="20"
      placeholder="1"
    ></ion-input>
  </ion-item>
</ion-content>

<ion-footer class="ion-padding">
  <ion-button
    expand="block"
    (click)="save()"
    [disabled]="!isSaveValid"
  >
    Save Changes
  </ion-button>
</ion-footer>
`, styles: ["/* src/app/home/edit-habit-modal/edit-habit-modal.component.scss */\n.segment-label {\n  font-size: 0.75rem;\n  color: var(--ion-color-medium);\n  padding: 16px 16px 4px;\n}\nion-segment {\n  margin: 0 16px 8px;\n}\n.day-picker-section {\n  padding: 12px 16px 4px;\n}\n.day-picker-section .day-picker-label {\n  font-size: 0.75rem;\n  color: var(--ion-color-medium);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 8px;\n}\n.day-picker-section .day-chips {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.day-picker-section .day-chip {\n  width: 36px;\n  height: 36px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.2);\n  background: rgba(255, 255, 255, 0.06);\n  color: rgba(255, 255, 255, 0.45);\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n.day-picker-section .day-chip.active {\n  background: #FFD700;\n  border-color: #FFD700;\n  color: #000;\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.35);\n}\n.day-picker-section .day-chip:hover {\n  border-color: #FFD700;\n  color: #FFD700;\n}\n.day-picker-section .day-picker-warning {\n  font-size: 0.72rem;\n  color: var(--ion-color-danger);\n  margin-top: 6px;\n}\n/*# sourceMappingURL=edit-habit-modal.component.css.map */\n"] }]
  }], null, { habitBusiness: [{
    type: Input
  }], modalController: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(EditHabitModalComponent, { className: "EditHabitModalComponent", filePath: "src/app/home/edit-habit-modal/edit-habit-modal.component.ts", lineNumber: 31 });
})();

// src/app/services/admin.service.ts
var _AdminService = class _AdminService {
  constructor(authService) {
    this.authService = authService;
    this.ADMIN_EMAIL = "grantmatai@gmail.com";
  }
  isAdmin() {
    return __async(this, null, function* () {
      try {
        const { data: { user } } = yield this.authService.getUser();
        console.log("\u{1F510} Admin check - User email:", user?.email);
        console.log("\u{1F510} Admin check - Admin email:", this.ADMIN_EMAIL);
        console.log("\u{1F510} Admin check - Match:", user?.email === this.ADMIN_EMAIL);
        return user?.email === this.ADMIN_EMAIL;
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    });
  }
  getCurrentUserEmail() {
    return __async(this, null, function* () {
      try {
        const { data: { user } } = yield this.authService.getUser();
        return user?.email || null;
      } catch (error) {
        console.error("Error getting user email:", error);
        return null;
      }
    });
  }
};
_AdminService.\u0275fac = function AdminService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AdminService)(\u0275\u0275inject(AuthService));
};
_AdminService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AdminService, factory: _AdminService.\u0275fac, providedIn: "root" });
var AdminService = _AdminService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AdminService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: AuthService }], null);
})();

// src/app/services/countdown-tick.service.ts
var _CountdownTickService = class _CountdownTickService {
  constructor() {
    this.tickSubject = new BehaviorSubject(Date.now());
    this.tick$ = this.tickSubject.asObservable();
    this.intervalId = null;
    this.subscriberCount = 0;
  }
  /** Start the shared 1-second ticker (called lazily on first subscription demand). */
  start() {
    if (this.intervalId !== null)
      return;
    this.intervalId = setInterval(() => {
      this.tickSubject.next(Date.now());
    }, 1e3);
  }
  /** Stop the ticker (called when no components are active). */
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  /** Components call this in ngOnInit to register interest. */
  register() {
    this.subscriberCount++;
    this.start();
  }
  /** Components call this in ngOnDestroy to de-register. */
  unregister() {
    this.subscriberCount = Math.max(0, this.subscriberCount - 1);
    if (this.subscriberCount === 0) {
      this.stop();
    }
  }
  ngOnDestroy() {
    this.stop();
  }
};
_CountdownTickService.\u0275fac = function CountdownTickService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _CountdownTickService)();
};
_CountdownTickService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CountdownTickService, factory: _CountdownTickService.\u0275fac, providedIn: "root" });
var CountdownTickService = _CountdownTickService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CountdownTickService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/home/home.page.ts
var _c0 = () => [];
var _c1 = (a0, a1, a2) => ({ $implicit: a0, isFirst: a1, isLast: a2 });
function HomePage_ion_button_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-button", 32);
    \u0275\u0275element(1, "ion-icon", 33);
    \u0275\u0275elementStart(2, "span", 34);
    \u0275\u0275text(3, "Admin");
    \u0275\u0275elementEnd()();
  }
}
function HomePage_ion_button_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 35);
    \u0275\u0275listener("click", function HomePage_ion_button_5_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.openWeeklyReceipt());
    });
    \u0275\u0275elementStart(1, "span", 36);
    \u0275\u0275text(2, "$");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 34);
    \u0275\u0275text(4, "Receipt");
    \u0275\u0275elementEnd()();
  }
}
function HomePage_ion_button_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-button", 37);
    \u0275\u0275element(1, "ion-icon", 38);
    \u0275\u0275elementStart(2, "span", 34);
    \u0275\u0275text(3, "Settings");
    \u0275\u0275elementEnd()();
  }
}
function HomePage_ion_button_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 39);
    \u0275\u0275listener("click", function HomePage_ion_button_7_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.logout());
    });
    \u0275\u0275element(1, "ion-icon", 40);
    \u0275\u0275elementStart(2, "span", 34);
    \u0275\u0275text(3, "Logout");
    \u0275\u0275elementEnd()();
  }
}
function HomePage_div_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 41)(1, "div", 42)(2, "div", 43)(3, "h2");
    \u0275\u0275text(4, " Welcome back, ");
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "p");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 44)(10, "div", 45);
    \u0275\u0275listener("click", function HomePage_div_11_Template_div_click_10_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleNetWorthDetail());
    });
    \u0275\u0275elementStart(11, "div", 46);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "div", 47);
    \u0275\u0275text(14, "NET WORTH");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 48);
    \u0275\u0275listener("click", function HomePage_div_11_Template_div_click_15_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleCashDetail());
    });
    \u0275\u0275elementStart(16, "div", 49);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 50);
    \u0275\u0275text(19, "HABIT CASH");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" ", (ctx_r2.userProfile == null ? null : ctx_r2.userProfile.name) || (ctx_r2.currentUser == null ? null : ctx_r2.currentUser.user_metadata == null ? null : ctx_r2.currentUser.user_metadata["name"]) || "Entrepreneur", "! ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.currentTagline);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("$", ctx_r2.getDisplayedNetWorth());
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("$", ctx_r2.getDisplayedCash());
  }
}
function HomePage_div_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 51)(1, "h2");
    \u0275\u0275text(2, "Welcome to Habit Tycoon! \u{1F4B0}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p");
    \u0275\u0275text(4, "Your adventure awaits...");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "ion-button", 52);
    \u0275\u0275text(6, " Login to Start ");
    \u0275\u0275elementEnd()();
  }
}
function HomePage_div_13_div_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 55)(1, "ion-icon", 56);
    \u0275\u0275listener("click", function HomePage_div_13_div_5_Template_ion_icon_click_1_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleStatsHelpSection());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 57);
    \u0275\u0275listener("click", function HomePage_div_13_div_5_Template_span_click_2_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleStatsHelpSection());
    });
    \u0275\u0275text(3, "How stats work");
    \u0275\u0275elementEnd()();
  }
}
function HomePage_div_13_ion_card_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 58)(1, "ion-card-content")(2, "div", 59)(3, "div", 60);
    \u0275\u0275element(4, "ion-icon", 61);
    \u0275\u0275elementStart(5, "h3");
    \u0275\u0275text(6, "How Your Daily Stats Work");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "ion-button", 62);
    \u0275\u0275listener("click", function HomePage_div_13_ion_card_6_Template_ion_button_click_7_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleStatsHelpSection());
    });
    \u0275\u0275element(8, "ion-icon", 63);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 64)(10, "div")(11, "p");
    \u0275\u0275text(12, "Your dashboard shows key metrics to track your progress:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "ul")(14, "li")(15, "strong");
    \u0275\u0275text(16, "Pending Habits:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(17, " Number of habits you can complete today ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "li")(19, "strong");
    \u0275\u0275text(20, "Today's Habit Earnings:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(21, " Money earned from completing your own habits ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "li")(23, "strong");
    \u0275\u0275text(24, "Today's Stock Dividends:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(25, " Passive income from your stock investments ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "li")(27, "strong");
    \u0275\u0275text(28, "Net Worth & Habit Cash:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(29, " Click the money cards for an explanation of each value ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "p")(31, "em");
    \u0275\u0275text(32, "Complete habits daily to maximize your earnings!");
    \u0275\u0275elementEnd()()()()()();
  }
}
function HomePage_div_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 53)(1, "div", 27);
    \u0275\u0275element(2, "ion-icon", 54);
    \u0275\u0275elementStart(3, "h2");
    \u0275\u0275text(4, "Daily Stats");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(5, HomePage_div_13_div_5_Template, 4, 0, "div", 29)(6, HomePage_div_13_ion_card_6_Template, 33, 0, "ion-card", 30);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", !ctx_r2.showStatsHelpSection);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.showStatsHelpSection);
  }
}
function HomePage_ion_card_44_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 65);
    \u0275\u0275listener("click", function HomePage_ion_card_44_Template_ion_card_click_0_listener() {
      const stat_r9 = \u0275\u0275restoreView(_r8).ngIf;
      return \u0275\u0275resetView(stat_r9.clickAction && stat_r9.clickAction());
    });
    \u0275\u0275elementStart(1, "ion-card-content")(2, "div", 16);
    \u0275\u0275element(3, "ion-icon", 66);
    \u0275\u0275elementStart(4, "div", 18)(5, "h2");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const stat_r9 = ctx.ngIf;
    \u0275\u0275classProp("clickable-card", stat_r9.clickAction);
    \u0275\u0275advance(3);
    \u0275\u0275property("name", stat_r9.icon)("color", stat_r9.color);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(stat_r9.getValue());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(stat_r9.label);
  }
}
function HomePage_span_46_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 67);
    \u0275\u0275listener("click", function HomePage_span_46_Template_span_click_0_listener() {
      const i_r11 = \u0275\u0275restoreView(_r10).index;
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.currentStatIndex = i_r11;
      return \u0275\u0275resetView(ctx_r2.stopAutoCarousel());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const i_r11 = ctx.index;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", i_r11 === ctx_r2.currentStatIndex);
  }
}
function HomePage_div_52_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 55)(1, "ion-icon", 56);
    \u0275\u0275listener("click", function HomePage_div_52_Template_ion_icon_click_1_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleHabitProgressHelpSection());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 57);
    \u0275\u0275listener("click", function HomePage_div_52_Template_span_click_2_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleHabitProgressHelpSection());
    });
    \u0275\u0275text(3, "How habit businesses work");
    \u0275\u0275elementEnd()();
  }
}
function HomePage_ion_card_53_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 58)(1, "ion-card-content")(2, "div", 59)(3, "div", 60);
    \u0275\u0275element(4, "ion-icon", 68);
    \u0275\u0275elementStart(5, "h3");
    \u0275\u0275text(6, "How Habit Businesses Work");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "ion-button", 62);
    \u0275\u0275listener("click", function HomePage_ion_card_53_Template_ion_button_click_7_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleHabitProgressHelpSection());
    });
    \u0275\u0275element(8, "ion-icon", 63);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 64)(10, "div")(11, "p");
    \u0275\u0275text(12, " Turn your habits into profitable businesses that generate income: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "ul")(14, "li")(15, "strong");
    \u0275\u0275text(16, "Complete Habits:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(17, " Each completion earns money and builds streaks ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "li")(19, "strong");
    \u0275\u0275text(20, "Habit Streaks:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(21, " Longer streaks increase your earnings multiplier ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "li")(23, "strong");
    \u0275\u0275text(24, "Business Value:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(25, " Consistent habits increase your business's stock price ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "li")(27, "strong");
    \u0275\u0275text(28, "Stockholders:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(29, " Others can invest in your habits and earn dividends ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "p")(31, "em");
    \u0275\u0275text(32, "Consistency is the key to building a successful habit empire!");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(33, "p", 69)(34, "strong");
    \u0275\u0275text(35, "Disclaimer:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(36, ' All in-game "Habit Cash" and currency are virtual and hold no real-world monetary value. This is a gamification tool designed to motivate habit building. ');
    \u0275\u0275elementEnd()()()()();
  }
}
function HomePage_div_54_ng_template_1_div_25_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 116);
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("width", (ctx_r2.holdingStates[hb_r15.id] == null ? null : ctx_r2.holdingStates[hb_r15.id].progress) || 0, "%");
  }
}
function HomePage_div_54_ng_template_1_div_25_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 117);
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("width", (ctx_r2.holdingStates[hb_r15.id] == null ? null : ctx_r2.holdingStates[hb_r15.id].undoProgress) || 0, "%");
  }
}
function HomePage_div_54_ng_template_1_div_25_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 118);
    \u0275\u0275text(1, " Undo ");
    \u0275\u0275elementEnd();
  }
}
function HomePage_div_54_ng_template_1_div_25_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 118);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" Complete (", hb_r15.current_progress || 0, "/", hb_r15.goal_value, ") ");
  }
}
function HomePage_div_54_ng_template_1_div_25_span_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 118);
    \u0275\u0275text(1, " Complete ");
    \u0275\u0275elementEnd();
  }
}
function HomePage_div_54_ng_template_1_div_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 111);
    \u0275\u0275listener("touchstart", function HomePage_div_54_ng_template_1_div_25_Template_div_touchstart_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.startUndoHolding(hb_r15, $event) : ctx_r2.startHolding(hb_r15, $event));
    })("touchend", function HomePage_div_54_ng_template_1_div_25_Template_div_touchend_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.stopUndoHolding(hb_r15, $event) : ctx_r2.stopHolding(hb_r15, $event));
    })("touchleave", function HomePage_div_54_ng_template_1_div_25_Template_div_touchleave_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.stopUndoHolding(hb_r15, $event) : ctx_r2.stopHolding(hb_r15, $event));
    })("touchcancel", function HomePage_div_54_ng_template_1_div_25_Template_div_touchcancel_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.stopUndoHolding(hb_r15, $event) : ctx_r2.stopHolding(hb_r15, $event));
    })("mousedown", function HomePage_div_54_ng_template_1_div_25_Template_div_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.startUndoHolding(hb_r15, $event) : ctx_r2.startHolding(hb_r15, $event));
    })("mouseup", function HomePage_div_54_ng_template_1_div_25_Template_div_mouseup_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.stopUndoHolding(hb_r15, $event) : ctx_r2.stopHolding(hb_r15, $event));
    })("mouseleave", function HomePage_div_54_ng_template_1_div_25_Template_div_mouseleave_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.stopUndoHolding(hb_r15, $event) : ctx_r2.stopHolding(hb_r15, $event));
    })("contextmenu", function HomePage_div_54_ng_template_1_div_25_Template_div_contextmenu_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      return \u0275\u0275resetView($event.preventDefault());
    });
    \u0275\u0275template(1, HomePage_div_54_ng_template_1_div_25_div_1_Template, 1, 2, "div", 112)(2, HomePage_div_54_ng_template_1_div_25_div_2_Template, 1, 2, "div", 113);
    \u0275\u0275element(3, "ion-icon", 114);
    \u0275\u0275template(4, HomePage_div_54_ng_template_1_div_25_span_4_Template, 2, 0, "span", 115)(5, HomePage_div_54_ng_template_1_div_25_span_5_Template, 2, 2, "span", 115)(6, HomePage_div_54_ng_template_1_div_25_span_6_Template, 2, 0, "span", 115);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("is-holding", ctx_r2.holdingStates[hb_r15.id] == null ? null : ctx_r2.holdingStates[hb_r15.id].isHolding)("is-completing", ctx_r2.holdingStates[hb_r15.id] == null ? null : ctx_r2.holdingStates[hb_r15.id].isCompleting)("is-undo-mode", ctx_r2.isGoalCompleted(hb_r15) && (hb_r15.current_progress || 0) > 0)("is-undoing", ctx_r2.holdingStates[hb_r15.id] == null ? null : ctx_r2.holdingStates[hb_r15.id].isUndoing);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.isGoalCompleted(hb_r15));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.isGoalCompleted(hb_r15));
    \u0275\u0275advance();
    \u0275\u0275property("name", ctx_r2.isGoalCompleted(hb_r15) ? "arrow-undo" : "checkmark-circle");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.isGoalCompleted(hb_r15));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.isGoalCompleted(hb_r15) && (hb_r15.goal_value && hb_r15.goal_value > 1));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.isGoalCompleted(hb_r15) && (!hb_r15.goal_value || hb_r15.goal_value <= 1));
  }
}
function HomePage_div_54_ng_template_1_div_26_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 118);
    \u0275\u0275text(1, " Undo ");
    \u0275\u0275elementEnd();
  }
}
function HomePage_div_54_ng_template_1_div_26_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 118);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" Complete (", hb_r15.current_progress || 0, "/", hb_r15.goal_value, ") ");
  }
}
function HomePage_div_54_ng_template_1_div_26_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 118);
    \u0275\u0275text(1, " Complete ");
    \u0275\u0275elementEnd();
  }
}
function HomePage_div_54_ng_template_1_div_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 119);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_div_26_Template_div_click_0_listener($event) {
      \u0275\u0275restoreView(_r17);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.isGoalCompleted(hb_r15) ? ctx_r2.handleUndoTap(hb_r15, $event) : ctx_r2.handleCompleteTap(hb_r15, $event));
    });
    \u0275\u0275element(1, "ion-icon", 114);
    \u0275\u0275template(2, HomePage_div_54_ng_template_1_div_26_span_2_Template, 2, 0, "span", 115)(3, HomePage_div_54_ng_template_1_div_26_span_3_Template, 2, 2, "span", 115)(4, HomePage_div_54_ng_template_1_div_26_span_4_Template, 2, 0, "span", 115);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("is-completing", ctx_r2.holdingStates[hb_r15.id] == null ? null : ctx_r2.holdingStates[hb_r15.id].isCompleting)("is-undo-mode", ctx_r2.isGoalCompleted(hb_r15) && (hb_r15.current_progress || 0) > 0)("is-undoing", ctx_r2.holdingStates[hb_r15.id] == null ? null : ctx_r2.holdingStates[hb_r15.id].isUndoing);
    \u0275\u0275advance();
    \u0275\u0275property("name", ctx_r2.isGoalCompleted(hb_r15) ? "arrow-undo" : "checkmark-circle");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.isGoalCompleted(hb_r15));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.isGoalCompleted(hb_r15) && (hb_r15.goal_value && hb_r15.goal_value > 1));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.isGoalCompleted(hb_r15) && (!hb_r15.goal_value || hb_r15.goal_value <= 1));
  }
}
function HomePage_div_54_ng_template_1_div_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 120);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_div_27_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r18);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.undoLastCompletion(hb_r15));
    });
    \u0275\u0275element(1, "ion-icon", 121);
    \u0275\u0275elementEnd();
  }
}
function HomePage_div_54_ng_template_1_ion_button_28_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" Goal Complete (", hb_r15.current_progress, "/", hb_r15.goal_value, ") ");
  }
}
function HomePage_div_54_ng_template_1_ion_button_28_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, " Completed Today ");
    \u0275\u0275elementEnd();
  }
}
function HomePage_div_54_ng_template_1_ion_button_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-button", 122);
    \u0275\u0275element(1, "ion-icon", 123);
    \u0275\u0275template(2, HomePage_div_54_ng_template_1_ion_button_28_span_2_Template, 2, 2, "span", 124)(3, HomePage_div_54_ng_template_1_ion_button_28_span_3_Template, 2, 0, "span", 124);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", hb_r15.goal_value && hb_r15.goal_value > 1);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !hb_r15.goal_value || hb_r15.goal_value <= 1);
  }
}
function HomePage_div_54_ng_template_1_div_42_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 128);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dow_r19 = ctx.$implicit;
    const i_r20 = ctx.index;
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("active", (hb_r15.active_days || \u0275\u0275pureFunction0(5, _c0)).includes(dow_r19))("today", dow_r19 === ctx_r2.today.getDay());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.dayChipLabels[i_r20]);
  }
}
function HomePage_div_54_ng_template_1_div_42_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 129);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Next: ", ctx_r2.getNextActiveDayLabel(hb_r15), " ");
  }
}
function HomePage_div_54_ng_template_1_div_42_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 125);
    \u0275\u0275template(1, HomePage_div_54_ng_template_1_div_42_span_1_Template, 2, 6, "span", 126)(2, HomePage_div_54_ng_template_1_div_42_span_2_Template, 2, 1, "span", 127);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r2.allDows);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.isTodayActiveDay(hb_r15));
  }
}
function HomePage_div_54_ng_template_1_span_46_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 130);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2022 resets in ", ctx_r2.countdowns[hb_r15.id] || "...");
  }
}
function HomePage_div_54_ng_template_1_span_47_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 131);
    \u0275\u0275text(1, "\u2022 rest day");
    \u0275\u0275elementEnd();
  }
}
function HomePage_div_54_ng_template_1_div_48_div_9_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 139)(1, "span", 140);
    \u0275\u0275text(2, "Streak Bonus:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 141);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(3).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("+$", ctx_r2.getEarningsBreakdown(hb_r15).streakBonus.toFixed(2));
  }
}
function HomePage_div_54_ng_template_1_div_48_div_9_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 139)(1, "span", 140);
    \u0275\u0275text(2, "Stock Boost:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 141);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(3).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("+$", ctx_r2.getEarningsBreakdown(hb_r15).stockBoost.toFixed(2));
  }
}
function HomePage_div_54_ng_template_1_div_48_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 138)(1, "div", 139)(2, "span", 140);
    \u0275\u0275text(3, "Base Pay:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 141);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(6, HomePage_div_54_ng_template_1_div_48_div_9_div_6_Template, 5, 1, "div", 142)(7, HomePage_div_54_ng_template_1_div_48_div_9_div_7_Template, 5, 1, "div", 142);
    \u0275\u0275elementStart(8, "div", 143)(9, "span", 140);
    \u0275\u0275text(10, "Total:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 141);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("$", ctx_r2.getEarningsBreakdown(hb_r15).baseEarnings.toFixed(2));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.getEarningsBreakdown(hb_r15).streakBonus > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.getEarningsBreakdown(hb_r15).stockBoost > 0);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("$", ctx_r2.getEarningsBreakdown(hb_r15).totalEarnings.toFixed(2));
  }
}
function HomePage_div_54_ng_template_1_div_48_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 132)(1, "div", 133)(2, "div", 134);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 135);
    \u0275\u0275text(5, "total per completion");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 62);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_div_48_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r21);
      const hb_r15 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleEarningsBreakdown(hb_r15.id));
    });
    \u0275\u0275element(7, "ion-icon", 136);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(9, HomePage_div_54_ng_template_1_div_48_div_9_Template, 13, 4, "div", 137);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" $", ctx_r2.getEarningsBreakdown(hb_r15).totalEarnings.toFixed(2), " ");
    \u0275\u0275advance(4);
    \u0275\u0275property("name", ctx_r2.showEarningsBreakdown[hb_r15.id] ? "chevron-up" : "chevron-down");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r2.showEarningsBreakdown[hb_r15.id] ? "Hide Details" : "Itemized", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.showEarningsBreakdown[hb_r15.id]);
  }
}
function HomePage_div_54_ng_template_1_div_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 144)(1, "div");
    \u0275\u0275element(2, "app-habit-grid", 145);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const hb_r15 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275property("businessId", hb_r15.id)("businessName", hb_r15.business_name)("businessEmoji", hb_r15.business_icon)("businessType", (hb_r15.business_types == null ? null : hb_r15.business_types.name) || hb_r15.business_name || "")("businessCreatedAt", hb_r15.created_at)("isModal", false)("showStats", true)("useCalendarYear", true);
  }
}
function HomePage_div_54_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 71)(1, "div", 72)(2, "div", 73)(3, "div", 74)(4, "div", 75)(5, "div", 76)(6, "button", 77);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_Template_button_click_6_listener() {
      const hb_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.moveHabitBusiness(hb_r15, "up"));
    });
    \u0275\u0275element(7, "ion-icon", 78);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 79);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_Template_button_click_8_listener() {
      const hb_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.moveHabitBusiness(hb_r15, "down"));
    });
    \u0275\u0275element(9, "ion-icon", 80);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "span", 81);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "h3", 82);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 83)(15, "ion-button", 84);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_Template_ion_button_click_15_listener() {
      const hb_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.deleteHabitBusiness(hb_r15));
    });
    \u0275\u0275text(16, " Sell ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "div", 85);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_Template_div_click_17_listener() {
      const hb_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleEarningsVisibility(hb_r15.id));
    });
    \u0275\u0275element(18, "ion-icon", 86);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "ion-button", 87);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_Template_ion_button_click_19_listener() {
      const hb_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleHabitGrid(hb_r15));
    });
    \u0275\u0275element(20, "ion-icon", 88);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "ion-button", 89);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_Template_ion_button_click_21_listener() {
      const hb_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.upgradeHabitBusiness(hb_r15));
    });
    \u0275\u0275element(22, "ion-icon", 90);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "ion-button", 91);
    \u0275\u0275listener("click", function HomePage_div_54_ng_template_1_Template_ion_button_click_23_listener() {
      const hb_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.editHabitBusiness(hb_r15));
    });
    \u0275\u0275element(24, "ion-icon", 92);
    \u0275\u0275elementEnd();
    \u0275\u0275template(25, HomePage_div_54_ng_template_1_div_25_Template, 7, 14, "div", 93)(26, HomePage_div_54_ng_template_1_div_26_Template, 5, 10, "div", 94)(27, HomePage_div_54_ng_template_1_div_27_Template, 2, 0, "div", 95)(28, HomePage_div_54_ng_template_1_ion_button_28_Template, 4, 2, "ion-button", 96);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "p", 97);
    \u0275\u0275text(30);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "div", 98)(32, "div", 99)(33, "div", 100);
    \u0275\u0275text(34, "Streak");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "div", 101);
    \u0275\u0275text(36);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(37, "div", 99)(38, "div", 100);
    \u0275\u0275text(39, "Total Earned");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "div", 102);
    \u0275\u0275text(41);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(42, HomePage_div_54_ng_template_1_div_42_Template, 3, 2, "div", 103);
    \u0275\u0275elementStart(43, "div", 104)(44, "span", 105);
    \u0275\u0275text(45);
    \u0275\u0275elementEnd();
    \u0275\u0275template(46, HomePage_div_54_ng_template_1_span_46_Template, 2, 1, "span", 106)(47, HomePage_div_54_ng_template_1_span_47_Template, 2, 0, "span", 107);
    \u0275\u0275elementEnd();
    \u0275\u0275template(48, HomePage_div_54_ng_template_1_div_48_Template, 10, 4, "div", 108)(49, HomePage_div_54_ng_template_1_div_49_Template, 3, 8, "div", 109);
    \u0275\u0275element(50, "div", 110);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const hb_r15 = ctx.$implicit;
    const isFirst_r22 = ctx.isFirst;
    const isLast_r23 = ctx.isLast;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275property("disabled", isFirst_r22);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", isLast_r23);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(hb_r15.business_icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(hb_r15.business_name);
    \u0275\u0275advance(12);
    \u0275\u0275property("ngIf", !ctx_r2.tapToComplete && (!ctx_r2.isGoalCompleted(hb_r15) || (hb_r15.current_progress || 0) > 0));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.tapToComplete && (!ctx_r2.isGoalCompleted(hb_r15) || (hb_r15.current_progress || 0) > 0));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", hb_r15.goal_value && hb_r15.goal_value > 1 && (hb_r15.current_progress || 0) > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.isGoalCompleted(hb_r15) && (hb_r15.current_progress || 0) === 0);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(hb_r15.habit_description);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" ", hb_r15.streak, " days ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" $", ctx_r2.formatLargeNumber(hb_r15.total_earnings), " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", hb_r15.recurrence_interval === "specific_days" || hb_r15.frequency === "weekly");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate2("", hb_r15.current_progress || 0, "/", hb_r15.goal_value || 1, " completions");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.isTodayActiveDay(hb_r15));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r2.isTodayActiveDay(hb_r15));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.showEarningsSection[hb_r15.id]);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.expandedGrids[hb_r15.id]);
  }
}
function HomePage_div_54_div_3_ng_container_4_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function HomePage_div_54_div_3_ng_container_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, HomePage_div_54_div_3_ng_container_4_ng_container_1_Template, 1, 0, "ng-container", 150);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const hb_r24 = ctx.$implicit;
    const i_r25 = ctx.index;
    const last_r26 = ctx.last;
    \u0275\u0275nextContext(2);
    const habitBusinessCard_r27 = \u0275\u0275reference(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", habitBusinessCard_r27)("ngTemplateOutletContext", \u0275\u0275pureFunction3(2, _c1, hb_r24, i_r25 === 0, last_r26));
  }
}
function HomePage_div_54_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 146)(1, "h4", 147);
    \u0275\u0275text(2, "To-Do");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 148);
    \u0275\u0275template(4, HomePage_div_54_div_3_ng_container_4_Template, 2, 6, "ng-container", 149);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r2.todoHabitBusinesses);
  }
}
function HomePage_div_54_div_4_ng_container_4_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function HomePage_div_54_div_4_ng_container_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, HomePage_div_54_div_4_ng_container_4_ng_container_1_Template, 1, 0, "ng-container", 150);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const hb_r28 = ctx.$implicit;
    const i_r29 = ctx.index;
    const last_r30 = ctx.last;
    \u0275\u0275nextContext(2);
    const habitBusinessCard_r27 = \u0275\u0275reference(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", habitBusinessCard_r27)("ngTemplateOutletContext", \u0275\u0275pureFunction3(2, _c1, hb_r28, i_r29 === 0, last_r30));
  }
}
function HomePage_div_54_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 146)(1, "h4", 147);
    \u0275\u0275text(2, "Done");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 148);
    \u0275\u0275template(4, HomePage_div_54_div_4_ng_container_4_Template, 2, 6, "ng-container", 149);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r2.doneHabitBusinesses);
  }
}
function HomePage_div_54_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275template(1, HomePage_div_54_ng_template_1_Template, 51, 18, "ng-template", null, 1, \u0275\u0275templateRefExtractor)(3, HomePage_div_54_div_3_Template, 5, 1, "div", 70)(4, HomePage_div_54_div_4_Template, 5, 1, "div", 70);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r2.todoHabitBusinesses.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.doneHabitBusinesses.length > 0);
  }
}
function HomePage_ng_template_55_Template(rf, ctx) {
  if (rf & 1) {
    const _r31 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 151);
    \u0275\u0275element(1, "ion-icon", 152);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "No habit-businesses yet");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, " Create your first habit-business to start earning money from your habits! ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 153);
    \u0275\u0275text(7, " \u{1F4A1} ");
    \u0275\u0275elementStart(8, "em");
    \u0275\u0275text(9, "Each habit comes with its own business - buy the business, do the habit, earn money!");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "ion-button", 154);
    \u0275\u0275listener("click", function HomePage_ng_template_55_Template_ion_button_click_10_listener() {
      \u0275\u0275restoreView(_r31);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createNewHabitBusiness());
    });
    \u0275\u0275element(11, "ion-icon", 155);
    \u0275\u0275text(12, " Create Habit-Business ");
    \u0275\u0275elementEnd()();
  }
}
var _HomePage = class _HomePage {
  constructor(router, authService, settingsService, adminService, habitBusinessService, habitUpdateService, toastController, alertController, modalController, habitIntervalService, countdownTickService) {
    this.router = router;
    this.authService = authService;
    this.settingsService = settingsService;
    this.adminService = adminService;
    this.habitBusinessService = habitBusinessService;
    this.habitUpdateService = habitUpdateService;
    this.toastController = toastController;
    this.alertController = alertController;
    this.modalController = modalController;
    this.habitIntervalService = habitIntervalService;
    this.countdownTickService = countdownTickService;
    this.currentUser = null;
    this.userProfile = null;
    this.hasCheckedAuth = false;
    this.isLoading = false;
    this.isAdmin = false;
    this.todaysEarnings = 0;
    this.todaysStockEarnings = 0;
    this.pendingHabitsCount = 0;
    this.habitBusinesses = [];
    this.todaysHabits = [];
    this.primaryHabitBusiness = null;
    this.additionalHabitBusinesses = [];
    this.motivationalTaglines = [
      "Time to turn habits into profit!",
      "Your habits are your business!",
      "Build better habits, build bigger profits!",
      "Every habit completed is money earned!",
      "Productive habits = profitable business!",
      "Turn your routine into revenue!",
      "From habits to riches!",
      "Consistency is currency!",
      "Daily grind, daily gold!",
      "Habits today, wealth tomorrow!",
      "Make your habits work for you!",
      "Success is just habits in disguise!"
    ];
    this.currentTagline = "";
    this.currentStatIndex = 0;
    this.autoCarouselInterval = null;
    this.isMobileScreen = false;
    this.statsCards = [];
    this.countdowns = {};
    this.allDows = [0, 1, 2, 3, 4, 5, 6];
    this.dayChipLabels = ["S", "M", "T", "W", "T", "F", "S"];
    this.today = /* @__PURE__ */ new Date();
    this.expandedGrids = {};
    this.showEarningsBreakdown = {};
    this.showEarningsSection = {};
    this.showDetailedCash = false;
    this.showDetailedNetWorth = false;
    this.showStatsHelpSection = false;
    this.showHabitProgressHelpSection = false;
    this.holdingStates = {};
    this.holdDuration = 1500;
    this.updateInterval = 50;
    this.tapToComplete = false;
    addIcons({ checkmarkCircle, alertCircle, refresh, logOut, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, arrowUndo, create, trash, trendingUp, chevronUp, chevronDown, wallet, cash, arrowBack, settings, helpCircle, close, analytics, shield });
    this.setRandomTagline();
    this.checkScreenSize();
    this.setupStatsCards();
  }
  /**
   * Set a daily motivational tagline based on the current date
   * This ensures the same tagline shows all day until midnight
   */
  setRandomTagline() {
    const today = /* @__PURE__ */ new Date();
    const dateString = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % this.motivationalTaglines.length;
    this.currentTagline = this.motivationalTaglines[index];
    console.log(`\u{1F3AF} Today's motivation (${dateString}):`, this.currentTagline);
  }
  // Refresh data whenever the page is entered
  ionViewWillEnter() {
    console.log("\u{1F504} HomePage: ionViewWillEnter - refreshing data...");
    this.setRandomTagline();
    if (!this.isLoading) {
      console.log("\u{1F504} Verifying auth state before loading home data...");
      this.loadCurrentUser();
    }
  }
  /**
   * Refresh user profile data without reloading everything
   */
  refreshUserProfile() {
    return __async(this, null, function* () {
      if (!this.currentUser)
        return;
      try {
        console.log("\u{1F504} Refreshing user profile for ID:", this.currentUser.id);
        this.userProfile = yield this.authService.getUserProfile(this.currentUser.id);
        console.log("\u2705 Refreshed user profile:", this.userProfile);
        this.settingsService.syncFromProfile(this.userProfile);
      } catch (error) {
        console.error("\u274C Error refreshing user profile:", error);
      }
    });
  }
  loadCurrentUser() {
    return __async(this, null, function* () {
      if (this.isLoading) {
        console.log("\u{1F504} Already loading user, skipping...");
        return;
      }
      this.isLoading = true;
      try {
        const { data: { user } } = yield this.authService.getUser();
        console.log("Current user from auth:", user);
        this.currentUser = user;
        if (!user) {
          console.log("\u274C No authenticated user found, redirecting to login");
          this.hasCheckedAuth = true;
          this.habitBusinesses = [];
          this.userProfile = null;
          this.currentUser = null;
          this.todaysHabits = [];
          this.todaysEarnings = 0;
          this.todaysStockEarnings = 0;
          this.pendingHabitsCount = 0;
          this.router.navigate(["/login"], { replaceUrl: true });
          return;
        }
        this.isAdmin = yield this.adminService.isAdmin();
        console.log("\u{1F464} Admin status:", this.isAdmin);
        try {
          console.log("Attempting to ensure profile exists for user ID:", user.id);
          this.userProfile = yield this.authService.ensureUserProfileExists(user);
          console.log("User profile ensured:", this.userProfile);
          this.settingsService.syncFromProfile(this.userProfile);
        } catch (error) {
          console.error("Profile creation/loading failed:", error);
          this.userProfile = {
            name: user.user_metadata?.["name"] || "Entrepreneur",
            cash: 100,
            net_worth: 100
          };
        }
        this.isLoading = false;
        yield this.loadDashboardData();
        this.hasCheckedAuth = true;
      } catch (error) {
        console.log("\u274C No user logged in, redirecting to login");
        console.error("Auth error details:", error);
        this.hasCheckedAuth = true;
        this.habitBusinesses = [];
        this.userProfile = null;
        this.currentUser = null;
        setTimeout(() => {
          console.log("\u{1F504} Redirecting to login...");
          this.router.navigate(["/login"]);
        }, 1e3);
      } finally {
        this.isLoading = false;
      }
    });
  }
  loadDashboardData() {
    return __async(this, null, function* () {
      if (this.isLoading) {
        console.log("\u{1F4CA} Already loading dashboard, skipping...");
        return;
      }
      this.isLoading = true;
      try {
        console.log("\u{1F4CA} Loading dashboard data for user:", this.currentUser?.id);
        if (this.currentUser) {
          try {
            yield this.habitBusinessService.resetOutdatedDailyHabits();
            yield this.resetHabitsToCustomOrder();
          } catch (resetError) {
            console.warn("\u26A0\uFE0F Non-critical error resetting outdated habits:", resetError);
          }
          this.habitBusinesses = yield this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
          this.todaysHabits = yield this.habitBusinessService.getTodaysHabits(this.currentUser.id);
          try {
            this.todaysEarnings = yield this.habitBusinessService.getTodaysActualEarnings(this.currentUser.id);
          } catch (earningsError) {
            console.error("\u274C Error loading today's earnings (non-critical):", earningsError);
            this.todaysEarnings = 0;
          }
          try {
            this.todaysStockEarnings = yield this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
          } catch (stockError) {
            console.error("\u274C Error loading today's stock dividends (non-critical):", stockError);
            this.todaysStockEarnings = 0;
          }
          this.pendingHabitsCount = this.habitBusinesses.filter((hb) => {
            const isCompleted = this.isGoalCompleted(hb);
            console.log(`\u{1F50D} Habit ${hb.business_name}: progress=${hb.current_progress}/${hb.goal_value || 1}, frequency=${hb.frequency}, lastCompleted=${hb.last_completed_at}, isCompleted=${isCompleted}`);
            return !isCompleted;
          }).length;
          console.log(`\u{1F4CA} Dashboard calculations complete: pending=${this.pendingHabitsCount}, habit earnings=$${this.todaysEarnings.toFixed(2)}, stock dividends=$${this.todaysStockEarnings.toFixed(2)}`);
          this.setupStatsCards();
          if (this.isMobileScreen && this.statsCards.length > 0) {
            this.startAutoCarousel();
          }
        } else {
          console.warn("\u26A0\uFE0F  No current user found, cannot load dashboard data");
        }
      } catch (error) {
        console.error("\u274C Error loading dashboard data:", error);
        if (!this.habitBusinesses || this.habitBusinesses.length === 0) {
          this.habitBusinesses = [];
        }
        if (!this.todaysHabits || this.todaysHabits.length === 0) {
          this.todaysHabits = [];
        }
        this.todaysEarnings = this.todaysEarnings || 0;
        this.todaysStockEarnings = this.todaysStockEarnings || 0;
        this.pendingHabitsCount = this.pendingHabitsCount || 0;
      } finally {
        this.isLoading = false;
      }
    });
  }
  logout() {
    return __async(this, null, function* () {
      try {
        yield this.authService.signOut();
        this.currentUser = null;
        this.userProfile = null;
        this.hasCheckedAuth = false;
        this.habitBusinesses = [];
        this.todaysHabits = [];
        this.todaysEarnings = 0;
        this.todaysStockEarnings = 0;
        this.pendingHabitsCount = 0;
        const toast = yield this.toastController.create({
          message: "\u{1F44B} Successfully logged out!",
          duration: 2e3,
          position: "top",
          color: "success"
        });
        yield toast.present();
        this.router.navigate(["/login"], { replaceUrl: true });
      } catch (error) {
        const errorToast = yield this.toastController.create({
          message: "\u274C Logout failed: " + error.message,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  createNewHabitBusiness() {
    console.log("\u{1F3E2} Creating new habit-business...");
    this.router.navigate(["/create-habit-business"]);
  }
  completeHabitBusiness(habitBusiness) {
    return __async(this, null, function* () {
      console.log("\u2705 Completing habit business:", habitBusiness);
      try {
        yield this.habitBusinessService.completeHabit(habitBusiness.id);
        const toast = yield this.toastController.create({
          message: `\u{1F389} Habit "${habitBusiness.business_name}" completed! +$${habitBusiness.earnings_per_completion} earned`,
          duration: 3e3,
          position: "top",
          color: "success"
        });
        yield toast.present();
        this.habitUpdateService.emitHabitCompletion(habitBusiness.id);
        yield this.loadCurrentUser();
        yield this.loadDashboardData();
      } catch (error) {
        console.error("Error completing habit:", error);
        const errorMessage = error?.message || "Unknown error occurred";
        const errorToast = yield this.toastController.create({
          message: `\u274C Failed to complete habit: ${errorMessage}`,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  completeHabit() {
    console.log("\u{1F3AF} Opening habit check-in page...");
    this.router.navigate(["/habit-checkin"]);
  }
  toggleHabit(habit) {
    return __async(this, null, function* () {
      console.log("\u{1F504} Toggling habit:", habit);
      habit.completed = !habit.completed;
      if (habit.completed) {
        const toast = yield this.toastController.create({
          message: `\u2705 Habit "${habit.name}" completed! +$${habit.earnings} earned`,
          duration: 3e3,
          position: "top",
          color: "success"
        });
        yield toast.present();
      }
    });
  }
  /**
   * Check if a habit has been completed for the current interval period.
   */
  isCompletedToday(habitBusiness) {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(habitBusiness);
  }
  /**
   * Check if a multi-completion habit has reached its goal for the current period.
   */
  isGoalCompleted(habitBusiness) {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(habitBusiness);
  }
  /** Habit-businesses not yet completed for the current period, in display order. */
  get todoHabitBusinesses() {
    return this.habitBusinesses.filter((hb) => !this.isGoalCompleted(hb));
  }
  /** Habit-businesses completed for the current period, in display order. */
  get doneHabitBusinesses() {
    return this.habitBusinesses.filter((hb) => this.isGoalCompleted(hb));
  }
  /** True when today is one of the habit's active days (or it's a daily habit). */
  isTodayActiveDay(habitBusiness) {
    return this.habitIntervalService.isTodayActiveDay(habitBusiness);
  }
  /** Label of the next active day for a specific_days habit (e.g. "Monday"). */
  getNextActiveDayLabel(habitBusiness) {
    return this.habitIntervalService.getNextActiveDayLabel(habitBusiness.active_days || []);
  }
  /**
   * Undo habit completion for today
   */
  undoHabitCompletion(habitBusiness) {
    return __async(this, null, function* () {
      console.log("\u21A9\uFE0F Undoing habit completion:", habitBusiness);
      try {
        yield this.habitBusinessService.undoHabitCompletion(habitBusiness.id);
        const toast = yield this.toastController.create({
          message: `\u21A9\uFE0F Completion undone for "${habitBusiness.business_name}"! -$${habitBusiness.earnings_per_completion} removed`,
          duration: 3e3,
          position: "top",
          color: "warning"
        });
        yield toast.present();
        this.habitUpdateService.emitHabitUndo(habitBusiness.id);
        yield this.loadCurrentUser();
        yield this.loadDashboardData();
      } catch (error) {
        console.error("Error undoing habit completion:", error);
        const errorMessage = error?.message || "Unknown error occurred";
        const errorToast = yield this.toastController.create({
          message: `\u274C Failed to undo completion: ${errorMessage}`,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  /**
   * Open the 365-day habit grid modal for a specific habit business
   */
  /**
   * Toggle the inline 365-day habit grid for a specific habit business
   */
  toggleHabitGrid(habitBusiness) {
    console.log("\u{1F4C5} Toggling habit grid for:", habitBusiness);
    const currentState = this.expandedGrids[habitBusiness.id] || false;
    this.expandedGrids = {};
    this.expandedGrids[habitBusiness.id] = !currentState;
    console.log("Grid expanded state for", habitBusiness.business_name, ":", this.expandedGrids[habitBusiness.id]);
  }
  /**
   * Upgrade a habit business to a better business type
   */
  upgradeHabitBusiness(habitBusiness) {
    return __async(this, null, function* () {
      console.log("\u{1F4C8} Upgrading habit business:", habitBusiness);
      try {
        const businessTypes = yield this.habitBusinessService.getBusinessTypes();
        const upgradeOptions = businessTypes.filter((bt) => bt.base_cost > (habitBusiness.cost || 0) && bt.id !== habitBusiness.business_type_id);
        if (upgradeOptions.length === 0) {
          const toast = yield this.toastController.create({
            message: "\u{1F389} You already have the best business type available!",
            duration: 3e3,
            position: "top",
            color: "success"
          });
          yield toast.present();
          return;
        }
        const currentBusinessValue = Math.floor((habitBusiness.cost || 0) * 0.7);
        const modal = yield this.modalController.create({
          component: UpgradeModalComponent,
          componentProps: {
            habitBusiness,
            upgradeOptions,
            userCash: this.userProfile?.cash || 0,
            currentBusinessValue,
            modalController: this.modalController,
            toastController: this.toastController
          },
          cssClass: "upgrade-modal"
        });
        yield modal.present();
        const { data } = yield modal.onDidDismiss();
        if (data && data.selectedBusinessType) {
          yield this.performUpgrade(habitBusiness, data.selectedBusinessType, data.upgradeCost);
        }
      } catch (error) {
        console.error("Error showing upgrade options:", error);
        const errorToast = yield this.toastController.create({
          message: `\u274C Failed to load upgrade options: ${error}`,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  /**
   * Perform the actual business upgrade
   */
  performUpgrade(habitBusiness, newBusinessType, upgradeCost) {
    return __async(this, null, function* () {
      try {
        yield this.habitBusinessService.upgradeHabitBusiness(habitBusiness.id, newBusinessType.id, upgradeCost);
        const successToast = yield this.toastController.create({
          message: `\u{1F389} Successfully upgraded "${habitBusiness.business_name}" to ${newBusinessType.icon} ${newBusinessType.name}!`,
          duration: 4e3,
          position: "top",
          color: "success"
        });
        yield successToast.present();
        yield this.loadCurrentUser();
        yield this.loadDashboardData();
      } catch (error) {
        console.error("Error upgrading habit business:", error);
        const errorMessage = error?.message || "Unknown error occurred";
        const errorToast = yield this.toastController.create({
          message: `\u274C Failed to upgrade business: ${errorMessage}`,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  editHabitBusiness(habitBusiness) {
    return __async(this, null, function* () {
      console.log("\u270F\uFE0F Editing habit business:", habitBusiness);
      try {
        const modal = yield this.modalController.create({
          component: EditHabitModalComponent,
          componentProps: {
            habitBusiness,
            modalController: this.modalController
          },
          breakpoints: [0, 1],
          initialBreakpoint: 1
        });
        yield modal.present();
        const { data, role } = yield modal.onWillDismiss();
        if (role !== "save" || !data)
          return;
        try {
          yield this.habitBusinessService.updateHabitBusiness(habitBusiness.id, {
            business_name: data.businessName,
            habit_description: data.habitDescription,
            recurrence_interval: data.recurrenceInterval,
            goal_value: data.goalValue,
            active_days: data.activeDays
          });
          const successToast = yield this.toastController.create({
            message: `\u2705 "${data.businessName}" updated successfully!`,
            duration: 2e3,
            position: "top",
            color: "success"
          });
          yield successToast.present();
          yield this.loadDashboardData();
        } catch (error) {
          const errorToast = yield this.toastController.create({
            message: `\u274C Failed to update: ${error?.message || "Unknown error"}`,
            duration: 3e3,
            position: "top",
            color: "danger"
          });
          yield errorToast.present();
        }
      } catch (error) {
        console.error("Error opening edit modal:", error);
      }
    });
  }
  /**
   * Delete (sell) a habit business with loss penalty
   */
  deleteHabitBusiness(habitBusiness) {
    return __async(this, null, function* () {
      console.log("\u{1F5D1}\uFE0F Deleting habit business:", habitBusiness);
      try {
        if (this.habitBusinesses.length <= 1) {
          const warningToast = yield this.toastController.create({
            message: "\u26A0\uFE0F Cannot delete your only habit business! You must have at least one active business.",
            duration: 4e3,
            position: "top",
            color: "warning"
          });
          yield warningToast.present();
          return;
        }
        const originalCost = habitBusiness.cost || 100;
        const sellValue = Math.floor(originalCost * 0.7);
        const loss = originalCost - sellValue;
        const alert = yield this.alertController.create({
          header: "\u{1F5D1}\uFE0F Sell Habit Business",
          message: `Are you sure you want to sell "${habitBusiness.business_name}"?

\u{1F4B0} You will receive: $${sellValue}
\u26A0\uFE0F You will lose: $${loss} from your original investment

This action cannot be undone.`,
          buttons: [
            {
              text: "Cancel",
              role: "cancel"
            },
            {
              text: "Sell & Delete",
              role: "destructive",
              handler: () => __async(this, null, function* () {
                try {
                  const sellValue2 = yield this.habitBusinessService.deleteHabitBusiness(habitBusiness.id);
                  const successToast = yield this.toastController.create({
                    message: `\u{1F4B0} Habit business "${habitBusiness.business_name}" sold for $${sellValue2}!`,
                    duration: 3e3,
                    position: "top",
                    color: "success"
                  });
                  yield successToast.present();
                  yield this.loadCurrentUser();
                  yield this.loadDashboardData();
                } catch (error) {
                  console.error("Error deleting habit business:", error);
                  const errorMessage = error?.message || "Unknown error occurred";
                  const errorToast = yield this.toastController.create({
                    message: `\u274C Failed to sell habit business: ${errorMessage}`,
                    duration: 3e3,
                    position: "top",
                    color: "danger"
                  });
                  yield errorToast.present();
                }
              })
            }
          ]
        });
        yield alert.present();
      } catch (error) {
        console.error("Error creating delete alert:", error);
      }
    });
  }
  /**
   * Calculate earnings breakdown for a habit business
   */
  getEarningsBreakdown(habitBusiness) {
    const baseEarnings = habitBusiness.earnings_per_completion;
    const currentStreak = habitBusiness.streak || 0;
    const nextStreak = currentStreak + 1;
    const streakMultiplier = nextStreak === 1 ? 0 : (nextStreak - 1) * 0.1;
    const baseTotal = baseEarnings + baseEarnings * streakMultiplier;
    const streakBonus = baseTotal - baseEarnings;
    let stockBoost = 0;
    const totalEarnings = baseTotal + stockBoost;
    return {
      baseEarnings,
      streakBonus,
      stockBoost,
      totalEarnings
    };
  }
  /**
   * Toggle earnings breakdown visibility for a specific habit
   */
  toggleEarningsBreakdown(habitBusinessId) {
    const currentState = this.showEarningsBreakdown[habitBusinessId] || false;
    this.showEarningsBreakdown[habitBusinessId] = !currentState;
  }
  /**
   * Toggle entire earnings section visibility for a specific habit
   */
  toggleEarningsVisibility(habitBusinessId) {
    const currentState = this.showEarningsSection[habitBusinessId];
    this.showEarningsSection[habitBusinessId] = currentState === void 0 ? true : !currentState;
  }
  // Carousel methods for mobile stats
  onResize(event) {
    this.checkScreenSize();
  }
  checkScreenSize() {
    const width = window.innerWidth;
    this.isMobileScreen = width <= 768;
    if (this.isMobileScreen && this.statsCards.length > 0) {
      this.startAutoCarousel();
    } else {
      this.stopAutoCarousel();
    }
  }
  setupStatsCards() {
    this.statsCards = [
      {
        icon: "checkmark-circle",
        color: "success",
        getValue: () => this.pendingHabitsCount.toString(),
        label: "Pending Habits"
      },
      {
        icon: "business",
        color: "success",
        getValue: () => "$" + this.todaysEarnings.toFixed(2),
        label: "Today's Habit Earnings"
      },
      {
        icon: "wallet",
        color: "secondary",
        getValue: () => "$" + this.todaysStockEarnings.toFixed(2),
        label: "Today's Stock Dividends"
      }
    ];
  }
  startAutoCarousel() {
    this.stopAutoCarousel();
    this.autoCarouselInterval = setInterval(() => {
      this.nextStat();
    }, 4e3);
  }
  stopAutoCarousel() {
    if (this.autoCarouselInterval) {
      clearInterval(this.autoCarouselInterval);
      this.autoCarouselInterval = null;
    }
  }
  nextStat() {
    this.currentStatIndex = (this.currentStatIndex + 1) % this.statsCards.length;
  }
  previousStat() {
    this.currentStatIndex = this.currentStatIndex === 0 ? this.statsCards.length - 1 : this.currentStatIndex - 1;
  }
  onStatTouchStart(event) {
    this.stopAutoCarousel();
  }
  onStatTouchEnd(event) {
    if (this.isMobileScreen && this.statsCards.length > 0) {
      setTimeout(() => this.startAutoCarousel(), 2e3);
    }
  }
  ngOnInit() {
    this.tapToCompleteSub = this.settingsService.tapToComplete$.subscribe((value) => this.tapToComplete = value);
    this.countdownTickService.register();
    this.tickSub = this.countdownTickService.tick$.subscribe(() => {
      this.habitBusinesses.forEach((hb) => {
        const interval = this.habitIntervalService.resolveInterval(hb);
        const secs = this.habitIntervalService.getSecondsUntilReset(interval, /* @__PURE__ */ new Date(), hb.active_days);
        this.countdowns[hb.id] = this.habitIntervalService.formatCountdown(secs, interval);
      });
    });
  }
  ngOnDestroy() {
    this.tickSub?.unsubscribe();
    this.tapToCompleteSub?.unsubscribe();
    this.countdownTickService.unregister();
    this.stopAutoCarousel();
    Object.values(this.holdingStates).forEach((state) => {
      if (state.timer)
        clearTimeout(state.timer);
      if (state.interval)
        clearInterval(state.interval);
      if (state.undoTimer)
        clearTimeout(state.undoTimer);
      if (state.undoInterval)
        clearInterval(state.undoInterval);
    });
  }
  /**
   * Start holding down the complete button
   */
  startHolding(habitBusiness, event) {
    event.preventDefault();
    if (!this.holdingStates[habitBusiness.id]) {
      this.holdingStates[habitBusiness.id] = {
        isHolding: false,
        progress: 0,
        isCompleting: false,
        isUndoing: false,
        undoProgress: 0
      };
    }
    const state = this.holdingStates[habitBusiness.id];
    if (state.isCompleting)
      return;
    state.isHolding = true;
    state.progress = 0;
    state.interval = setInterval(() => {
      if (state.isHolding) {
        state.progress += this.updateInterval / this.holdDuration * 100;
        if (state.progress >= 100) {
          this.completeHolding(habitBusiness);
        }
      }
    }, this.updateInterval);
    state.timer = setTimeout(() => {
      if (state.isHolding) {
        this.completeHolding(habitBusiness);
      }
    }, this.holdDuration);
  }
  /**
   * Stop holding down the complete button
   */
  stopHolding(habitBusiness, event) {
    const state = this.holdingStates[habitBusiness.id];
    if (!state || state.isCompleting)
      return;
    state.isHolding = false;
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = void 0;
    }
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = void 0;
    }
    if (state.progress < 100) {
      const resetInterval = setInterval(() => {
        state.progress -= 10;
        if (state.progress <= 0) {
          state.progress = 0;
          clearInterval(resetInterval);
        }
      }, 20);
    }
  }
  /**
   * Complete the holding action
   */
  completeHolding(habitBusiness) {
    return __async(this, null, function* () {
      const state = this.holdingStates[habitBusiness.id];
      if (!state)
        return;
      state.isCompleting = true;
      state.progress = 100;
      state.isHolding = false;
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = void 0;
      }
      if (state.interval) {
        clearInterval(state.interval);
        state.interval = void 0;
      }
      setTimeout(() => __async(this, null, function* () {
        yield this.runCompleteHabit(habitBusiness);
        state.isCompleting = false;
        state.progress = 0;
      }), 300);
    });
  }
  /**
   * Shared completion logic used by both the hold-to-complete and tap-to-complete flows
   */
  runCompleteHabit(habitBusiness) {
    return __async(this, null, function* () {
      const missedYesterday = this.habitIntervalService.didMissYesterday(habitBusiness);
      console.log("[runCompleteHabit] habit:", habitBusiness.business_name, "| recurrence_interval:", habitBusiness.recurrence_interval, "| goal_value:", habitBusiness.goal_value, "| created_at:", habitBusiness.created_at, "| last_completed_at:", habitBusiness.last_completed_at, "| didMissYesterday:", missedYesterday);
      if (missedYesterday) {
        yield this.showMissedYesterdayAlert(habitBusiness);
      } else {
        yield this.completeHabitBusiness(habitBusiness);
      }
    });
  }
  /**
   * Instantly complete a habit on a single tap (used when tap-to-complete is enabled)
   */
  handleCompleteTap(habitBusiness, event) {
    return __async(this, null, function* () {
      event.preventDefault();
      if (!this.holdingStates[habitBusiness.id]) {
        this.holdingStates[habitBusiness.id] = {
          isHolding: false,
          progress: 0,
          isCompleting: false,
          isUndoing: false,
          undoProgress: 0
        };
      }
      const state = this.holdingStates[habitBusiness.id];
      if (state.isCompleting)
        return;
      state.isCompleting = true;
      try {
        yield this.runCompleteHabit(habitBusiness);
      } finally {
        state.isCompleting = false;
      }
    });
  }
  /**
   * Show a prompt when the user tries to complete a habit they missed yesterday.
   * Lets them choose to mark yesterday or today as complete.
   */
  showMissedYesterdayAlert(habitBusiness) {
    return __async(this, null, function* () {
      const alert = yield this.alertController.create({
        header: "\u23F0 Forgot to mark your habit yesterday?",
        message: "You missed marking this habit yesterday. Did you complete it? You can still mark it as complete.\n\nSelect which day to complete:",
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Yesterday",
            handler: () => {
              (() => __async(this, null, function* () {
                try {
                  yield this.habitBusinessService.completeHabitYesterday(habitBusiness.id);
                  const toast = yield this.toastController.create({
                    message: `\u2705 "${habitBusiness.business_name}" marked complete for yesterday! Earnings added.`,
                    duration: 3e3,
                    position: "top",
                    color: "success"
                  });
                  yield toast.present();
                  this.habitUpdateService.emitHabitCompletion(habitBusiness.id);
                  yield this.loadCurrentUser();
                  yield this.loadDashboardData();
                } catch (error) {
                  const errorMessage = error?.message || "Unknown error occurred";
                  const errorToast = yield this.toastController.create({
                    message: `\u274C Failed: ${errorMessage}`,
                    duration: 3e3,
                    position: "top",
                    color: "danger"
                  });
                  yield errorToast.present();
                }
              }))();
            }
          },
          {
            text: "Today",
            handler: () => {
              (() => __async(this, null, function* () {
                yield this.completeHabitBusiness(habitBusiness);
              }))();
            }
          }
        ]
      });
      yield alert.present();
    });
  }
  /**
   * Start holding for undo action
   */
  startUndoHolding(habitBusiness, event) {
    event.preventDefault();
    if (!this.holdingStates[habitBusiness.id]) {
      this.holdingStates[habitBusiness.id] = {
        isHolding: false,
        progress: 0,
        isCompleting: false,
        isUndoing: false,
        undoProgress: 0
      };
    }
    const state = this.holdingStates[habitBusiness.id];
    if (state.isUndoing)
      return;
    state.isUndoing = true;
    state.undoProgress = 0;
    state.undoInterval = setInterval(() => {
      state.undoProgress += 100 / this.holdDuration * this.updateInterval;
      if (state.undoProgress >= 100) {
        state.undoProgress = 100;
        this.completeUndoHolding(habitBusiness);
      }
    }, this.updateInterval);
    state.undoTimer = setTimeout(() => {
      this.completeUndoHolding(habitBusiness);
    }, this.holdDuration);
  }
  /**
   * Stop holding for undo action
   */
  stopUndoHolding(habitBusiness, event) {
    event.preventDefault();
    const state = this.holdingStates[habitBusiness.id];
    if (!state || !state.isUndoing)
      return;
    if (state.undoTimer) {
      clearTimeout(state.undoTimer);
      state.undoTimer = void 0;
    }
    if (state.undoInterval) {
      clearInterval(state.undoInterval);
      state.undoInterval = void 0;
    }
    state.isUndoing = false;
    const resetInterval = setInterval(() => {
      state.undoProgress -= 10;
      if (state.undoProgress <= 0) {
        state.undoProgress = 0;
        clearInterval(resetInterval);
      }
    }, 20);
  }
  /**
   * Complete the undo holding action
   */
  completeUndoHolding(habitBusiness) {
    return __async(this, null, function* () {
      const state = this.holdingStates[habitBusiness.id];
      if (!state)
        return;
      state.undoProgress = 100;
      state.isUndoing = false;
      if (state.undoTimer) {
        clearTimeout(state.undoTimer);
        state.undoTimer = void 0;
      }
      if (state.undoInterval) {
        clearInterval(state.undoInterval);
        state.undoInterval = void 0;
      }
      setTimeout(() => __async(this, null, function* () {
        yield this.undoHabitCompletion(habitBusiness);
        state.undoProgress = 0;
      }), 300);
    });
  }
  /**
   * Instantly undo a habit completion on a single tap (used when tap-to-complete is enabled)
   */
  handleUndoTap(habitBusiness, event) {
    return __async(this, null, function* () {
      event.preventDefault();
      if (!this.holdingStates[habitBusiness.id]) {
        this.holdingStates[habitBusiness.id] = {
          isHolding: false,
          progress: 0,
          isCompleting: false,
          isUndoing: false,
          undoProgress: 0
        };
      }
      const state = this.holdingStates[habitBusiness.id];
      if (state.isUndoing)
        return;
      state.isUndoing = true;
      try {
        yield this.undoHabitCompletion(habitBusiness);
      } finally {
        state.isUndoing = false;
      }
    });
  }
  /**
   * Format large numbers for display (1.1K, 1.1M, 1.1B, 1.1T, etc.)
   */
  formatLargeNumber(amount) {
    if (amount >= 1e12) {
      const trillions = amount / 1e12;
      return trillions >= 10 ? `${Math.floor(trillions)}T` : `${trillions.toFixed(1)}T`;
    } else if (amount >= 1e9) {
      const billions = amount / 1e9;
      return billions >= 10 ? `${Math.floor(billions)}B` : `${billions.toFixed(1)}B`;
    } else if (amount >= 1e6) {
      const millions = amount / 1e6;
      return millions >= 10 ? `${Math.floor(millions)}M` : `${millions.toFixed(1)}M`;
    } else if (amount >= 1e3) {
      const thousands = amount / 1e3;
      return thousands >= 10 ? `${Math.floor(thousands)}K` : `${thousands.toFixed(1)}K`;
    } else {
      return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }
  /**
   * Get displayed cash amount (formatted or exact)
   */
  getDisplayedCash() {
    const cash2 = this.userProfile?.cash || 0;
    if (cash2 >= 1e3 && !this.showDetailedCash) {
      return this.formatLargeNumber(cash2);
    }
    return cash2.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  /**
   * Get displayed net worth amount (formatted or exact)
   */
  getDisplayedNetWorth() {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1e3 && !this.showDetailedNetWorth) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  /**
   * Toggle detailed view for cash card
   */
  toggleCashDetail() {
    this.showDetailedCash = !this.showDetailedCash;
  }
  /**
   * Toggle detailed view for net worth card
   */
  toggleNetWorthDetail() {
    this.showDetailedNetWorth = !this.showDetailedNetWorth;
  }
  /**
   * Toggle stats help section
   */
  toggleStatsHelpSection() {
    this.showStatsHelpSection = !this.showStatsHelpSection;
  }
  /**
   * Navigate to the itemized Weekly Receipt page
   */
  openWeeklyReceipt() {
    this.router.navigate(["/weekly-receipt"]);
  }
  /**
   * Toggle habit progress help section
   */
  toggleHabitProgressHelpSection() {
    this.showHabitProgressHelpSection = !this.showHabitProgressHelpSection;
  }
  /**
   * Undo the last completion for multi-completion habits
   */
  undoLastCompletion(habitBusiness) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F504} Undoing last completion for habit:", habitBusiness.business_name);
        yield this.habitBusinessService.undoHabitCompletion(habitBusiness.id);
        const toast = yield this.toastController.create({
          message: `\u21A9\uFE0F Undid completion for "${habitBusiness.business_name}"`,
          duration: 2e3,
          position: "top",
          color: "warning"
        });
        yield toast.present();
        this.habitUpdateService.emitHabitCompletion(habitBusiness.id);
        yield this.loadCurrentUser();
        yield this.loadDashboardData();
      } catch (error) {
        console.error("Error undoing completion:", error);
        const errorToast = yield this.toastController.create({
          message: `\u274C Failed to undo completion: ${error?.message || "Unknown error"}`,
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  /**
   * Move a habit-business up or down within its own group (to-do or done).
   */
  moveHabitBusiness(habitBusiness, direction) {
    return __async(this, null, function* () {
      const group = this.isGoalCompleted(habitBusiness) ? this.doneHabitBusinesses : this.todoHabitBusinesses;
      const groupIndex = group.findIndex((hb) => hb.id === habitBusiness.id);
      const targetGroupIndex = direction === "up" ? groupIndex - 1 : groupIndex + 1;
      if (groupIndex === -1 || targetGroupIndex < 0 || targetGroupIndex >= group.length) {
        return;
      }
      const swapWith = group[targetGroupIndex];
      const indexA = this.habitBusinesses.findIndex((hb) => hb.id === habitBusiness.id);
      const indexB = this.habitBusinesses.findIndex((hb) => hb.id === swapWith.id);
      [this.habitBusinesses[indexA], this.habitBusinesses[indexB]] = [this.habitBusinesses[indexB], this.habitBusinesses[indexA]];
      try {
        const orderedBusinessIds = this.habitBusinesses.map((hb) => hb.id);
        yield this.habitBusinessService.updateHabitBusinessOrder(this.currentUser.id, orderedBusinessIds);
      } catch (error) {
        console.error("Error updating habit order:", error);
        yield this.loadDashboardData();
        const errorToast = yield this.toastController.create({
          message: "\u274C Failed to update order. Please try again.",
          duration: 3e3,
          position: "top",
          color: "danger"
        });
        yield errorToast.present();
      }
    });
  }
  /**
   * Reset habits to user's custom order (called when new day/week starts)
   */
  resetHabitsToCustomOrder() {
    return __async(this, null, function* () {
      try {
        yield this.habitBusinessService.resetToCustomOrder(this.currentUser.id);
        yield this.loadDashboardData();
      } catch (error) {
        console.error("Error resetting habits to custom order:", error);
      }
    });
  }
};
_HomePage.\u0275fac = function HomePage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HomePage)(\u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(SettingsService), \u0275\u0275directiveInject(AdminService), \u0275\u0275directiveInject(HabitBusinessService), \u0275\u0275directiveInject(HabitUpdateService), \u0275\u0275directiveInject(ToastController), \u0275\u0275directiveInject(AlertController), \u0275\u0275directiveInject(ModalController), \u0275\u0275directiveInject(HabitIntervalService), \u0275\u0275directiveInject(CountdownTickService));
};
_HomePage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HomePage, selectors: [["app-home"]], hostBindings: function HomePage_HostBindings(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275listener("resize", function HomePage_resize_HostBindingHandler($event) {
      return ctx.onResize($event);
    }, \u0275\u0275resolveWindow);
  }
}, decls: 58, vars: 19, consts: [["noHabitBusinesses", ""], ["habitBusinessCard", ""], [3, "translucent"], [1, "home-toolbar"], ["slot", "end", "fill", "clear", "routerLink", "/admin", "color", "warning", "class", "header-action-btn", 4, "ngIf"], ["slot", "end", "fill", "clear", "class", "header-action-btn receipt-btn", "aria-label", "Weekly Receipt", 3, "click", 4, "ngIf"], ["slot", "end", "fill", "clear", "routerLink", "/settings", "class", "header-action-btn", 4, "ngIf"], ["slot", "end", "fill", "clear", "class", "header-action-btn", 3, "click", 4, "ngIf"], [1, "ion-padding", 3, "fullscreen", "scrollY"], [1, "scrollable-content"], [1, "page-container"], ["class", "user-info", 4, "ngIf"], ["class", "guest-view", 4, "ngIf"], ["class", "section-header-container", 4, "ngIf"], [1, "stats-grid", "ion-margin-bottom", "desktop-stats"], [1, "stat-card"], [1, "stat-content"], ["name", "checkmark-circle", "color", "success"], [1, "stat-info"], ["name", "business", "color", "success"], ["name", "wallet", "color", "secondary"], [1, "mobile-stats-carousel", "ion-margin-bottom"], [1, "carousel-container", 3, "touchstart", "touchend"], ["class", "stat-card carousel-card", 3, "clickable-card", "click", 4, "ngIf"], [1, "carousel-indicators"], ["class", "indicator", 3, "active", "click", 4, "ngFor", "ngForOf"], [1, "my-habit-businesses", "ion-margin-bottom"], [1, "section-header"], ["name", "business"], ["class", "help-icon-container ion-margin-bottom", 4, "ngIf"], ["class", "info-card ion-margin-bottom", 4, "ngIf"], [4, "ngIf", "ngIfElse"], ["slot", "end", "fill", "clear", "routerLink", "/admin", "color", "warning", 1, "header-action-btn"], ["name", "shield", "slot", "start"], [1, "btn-label"], ["slot", "end", "fill", "clear", "aria-label", "Weekly Receipt", 1, "header-action-btn", "receipt-btn", 3, "click"], ["slot", "start", 1, "receipt-coin"], ["slot", "end", "fill", "clear", "routerLink", "/settings", 1, "header-action-btn"], ["name", "settings", "slot", "start"], ["slot", "end", "fill", "clear", 1, "header-action-btn", 3, "click"], ["name", "log-out", "slot", "start"], [1, "user-info"], [1, "welcome-section"], [1, "welcome-text"], [1, "cash-display"], [1, "networth-display", 3, "click"], [1, "networth-amount", "clickable"], [1, "networth-label"], [1, "cash-section", 3, "click"], [1, "cash-amount", "clickable"], [1, "cash-label"], [1, "guest-view"], ["routerLink", "/login", "color", "primary"], [1, "section-header-container"], ["name", "analytics-outline"], [1, "help-icon-container", "ion-margin-bottom"], ["name", "help-circle", 1, "help-icon", 3, "click"], [1, "help-text", 3, "click"], [1, "info-card", "ion-margin-bottom"], [1, "info-header"], [1, "info-title-section"], ["name", "analytics", "color", "success"], ["fill", "clear", "size", "small", "color", "medium", 3, "click"], ["name", "close", "slot", "icon-only"], [1, "info-content"], [1, "stat-card", "carousel-card", 3, "click"], [3, "name", "color"], [1, "indicator", 3, "click"], ["name", "business", "color", "primary"], [1, "disclaimer"], ["class", "habit-group-section", 4, "ngIf"], [1, "habit-business-item"], [1, "item-content"], [1, "business-info"], [1, "card-header-row"], [1, "business-title-row"], [1, "reorder-controls"], ["type", "button", "aria-label", "Move up", 1, "reorder-btn", 3, "click", "disabled"], ["name", "chevron-up"], ["type", "button", "aria-label", "Move down", 1, "reorder-btn", 3, "click", "disabled"], ["name", "chevron-down"], [1, "business-icon"], [1, "business-name"], [1, "card-actions"], ["fill", "clear", "color", "danger", "size", "small", 2, "margin", "0", "--padding-start", "10px", "--padding-end", "10px", 3, "click"], [1, "earnings-toggle-button", 3, "click"], ["name", "cash", 1, "dollar-icon"], ["fill", "clear", "color", "tertiary", "size", "default", 1, "calendar-toggle-button", 2, "margin", "0", "--padding-start", "12px", "--padding-end", "12px", 3, "click"], ["name", "calendar-outline", "slot", "icon-only"], ["fill", "clear", "color", "warning", "size", "default", 2, "margin", "0", "--padding-start", "12px", "--padding-end", "12px", 3, "click"], ["name", "trending-up", "slot", "icon-only"], ["fill", "clear", "size", "default", 2, "margin", "0", "--padding-start", "12px", "--padding-end", "12px", "--color", "#7ecfff", "opacity", "1", 3, "click"], ["name", "create", "slot", "icon-only"], ["class", "hold-complete-button", 3, "is-holding", "is-completing", "is-undo-mode", "is-undoing", "touchstart", "touchend", "touchleave", "touchcancel", "mousedown", "mouseup", "mouseleave", "contextmenu", 4, "ngIf"], ["class", "hold-complete-button", 3, "is-completing", "is-undo-mode", "is-undoing", "click", 4, "ngIf"], ["class", "back-button", 3, "click", 4, "ngIf"], ["fill", "outline", "color", "medium", "size", "small", "disabled", "", 4, "ngIf"], [1, "habit-description"], [1, "habit-stats"], [1, "stat-item"], [1, "stat-label"], [1, "stat-value", "streak"], [1, "stat-value", "total-earned"], ["class", "habit-day-chips", 4, "ngIf"], [1, "habit-period-status"], [1, "period-progress"], ["class", "period-reset", 4, "ngIf"], ["class", "period-reset rest-day", 4, "ngIf"], ["class", "earnings-section", 4, "ngIf"], ["class", "inline-habit-grid", 4, "ngIf"], [1, "checkin-action"], [1, "hold-complete-button", 3, "touchstart", "touchend", "touchleave", "touchcancel", "mousedown", "mouseup", "mouseleave", "contextmenu"], ["class", "hold-progress", 3, "width", 4, "ngIf"], ["class", "undo-progress", 3, "width", 4, "ngIf"], [1, "button-icon", 3, "name"], ["class", "button-text", 4, "ngIf"], [1, "hold-progress"], [1, "undo-progress"], [1, "button-text"], [1, "hold-complete-button", 3, "click"], [1, "back-button", 3, "click"], ["name", "arrow-back", 1, "back-icon"], ["fill", "outline", "color", "medium", "size", "small", "disabled", ""], ["name", "checkmark-circle", "slot", "start"], [4, "ngIf"], [1, "habit-day-chips"], ["class", "habit-day-chip", 3, "active", "today", 4, "ngFor", "ngForOf"], ["class", "next-active-label", 4, "ngIf"], [1, "habit-day-chip"], [1, "next-active-label"], [1, "period-reset"], [1, "period-reset", "rest-day"], [1, "earnings-section"], [1, "earnings-total"], [1, "total-amount"], [1, "earnings-label"], ["slot", "end", 3, "name"], ["class", "earnings-breakdown", 4, "ngIf"], [1, "earnings-breakdown"], [1, "breakdown-item"], [1, "breakdown-label"], [1, "breakdown-value"], ["class", "breakdown-item", 4, "ngIf"], [1, "breakdown-item", "breakdown-total"], [1, "inline-habit-grid"], [3, "businessId", "businessName", "businessEmoji", "businessType", "businessCreatedAt", "isModal", "showStats", "useCalendarYear"], [1, "habit-group-section"], [1, "habit-group-title"], [1, "habit-businesses-container"], [4, "ngFor", "ngForOf"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "empty-state"], ["name", "business", "size", "large", "color", "medium"], [1, "tip"], ["fill", "solid", "color", "success", 3, "click"], ["name", "add", "slot", "start"]], template: function HomePage_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-header", 2)(1, "ion-toolbar", 3)(2, "ion-title");
    \u0275\u0275text(3, "\u{1F4B0} Habit Tycoon");
    \u0275\u0275elementEnd();
    \u0275\u0275template(4, HomePage_ion_button_4_Template, 4, 0, "ion-button", 4)(5, HomePage_ion_button_5_Template, 5, 0, "ion-button", 5)(6, HomePage_ion_button_6_Template, 4, 0, "ion-button", 6)(7, HomePage_ion_button_7_Template, 4, 0, "ion-button", 7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "ion-content", 8)(9, "div", 9)(10, "div", 10);
    \u0275\u0275template(11, HomePage_div_11_Template, 20, 4, "div", 11)(12, HomePage_div_12_Template, 7, 0, "div", 12)(13, HomePage_div_13_Template, 7, 2, "div", 13);
    \u0275\u0275elementStart(14, "div", 14)(15, "ion-card", 15)(16, "ion-card-content")(17, "div", 16);
    \u0275\u0275element(18, "ion-icon", 17);
    \u0275\u0275elementStart(19, "div", 18)(20, "h2");
    \u0275\u0275text(21);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "p");
    \u0275\u0275text(23, "Pending Habits");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(24, "ion-card", 15)(25, "ion-card-content")(26, "div", 16);
    \u0275\u0275element(27, "ion-icon", 19);
    \u0275\u0275elementStart(28, "div", 18)(29, "h2");
    \u0275\u0275text(30);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "p");
    \u0275\u0275text(32, "Today's Habit Earnings");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(33, "ion-card", 15)(34, "ion-card-content")(35, "div", 16);
    \u0275\u0275element(36, "ion-icon", 20);
    \u0275\u0275elementStart(37, "div", 18)(38, "h2");
    \u0275\u0275text(39);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "p");
    \u0275\u0275text(41, "Today's Stock Dividends");
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275elementStart(42, "div", 21)(43, "div", 22);
    \u0275\u0275listener("touchstart", function HomePage_Template_div_touchstart_43_listener($event) {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onStatTouchStart($event));
    })("touchend", function HomePage_Template_div_touchend_43_listener($event) {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView(ctx.onStatTouchEnd($event));
    });
    \u0275\u0275template(44, HomePage_ion_card_44_Template, 9, 6, "ion-card", 23);
    \u0275\u0275elementStart(45, "div", 24);
    \u0275\u0275template(46, HomePage_span_46_Template, 1, 2, "span", 25);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(47, "div", 26)(48, "div", 27);
    \u0275\u0275element(49, "ion-icon", 28);
    \u0275\u0275elementStart(50, "h2");
    \u0275\u0275text(51, "My Habit-Businesses");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(52, HomePage_div_52_Template, 4, 0, "div", 29)(53, HomePage_ion_card_53_Template, 37, 0, "ion-card", 30)(54, HomePage_div_54_Template, 5, 2, "div", 31)(55, HomePage_ng_template_55_Template, 13, 0, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275element(57, "app-bottom-nav");
  }
  if (rf & 2) {
    const noHabitBusinesses_r32 = \u0275\u0275reference(56);
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx.isAdmin);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("fullscreen", true)("scrollY", false);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(ctx.pendingHabitsCount);
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate1("$", ctx.todaysEarnings.toFixed(2));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate1("$", ctx.todaysStockEarnings.toFixed(2));
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", ctx.statsCards[ctx.currentStatIndex]);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx.statsCards);
    \u0275\u0275advance(6);
    \u0275\u0275property("ngIf", !ctx.showHabitProgressHelpSection);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.showHabitProgressHelpSection);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.habitBusinesses && ctx.habitBusinesses.length > 0)("ngIfElse", noHabitBusinesses_r32);
  }
}, dependencies: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonIcon, CommonModule, NgForOf, NgIf, NgTemplateOutlet, FormsModule, RouterLink, BottomNavComponent, HabitGridComponent], styles: ['\n\nbutton[_ngcontent-%COMP%], \nspan[_ngcontent-%COMP%], \ndiv[_ngcontent-%COMP%], \nion-button[_ngcontent-%COMP%] {\n  list-style: none !important;\n  list-style-type: none !important;\n}\nbutton[_ngcontent-%COMP%]::before, \nspan[_ngcontent-%COMP%]::before, \ndiv[_ngcontent-%COMP%]::before, \nion-button[_ngcontent-%COMP%]::before {\n  content: none !important;\n}\n.scrollable-content[_ngcontent-%COMP%] {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container[_ngcontent-%COMP%] {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n  overflow-x: hidden;\n}\n.home-toolbar[_ngcontent-%COMP%]   ion-title[_ngcontent-%COMP%] {\n  padding-inline-start: 12px;\n}\n.home-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%] {\n  --padding-start: 8px;\n  --padding-end: 8px;\n}\n.home-toolbar[_ngcontent-%COMP%]   .receipt-coin[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  margin-inline-end: 6px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at 30% 30%,\n      #ffe985 0%,\n      #ffd700 45%,\n      #e6a800 100%);\n  color: #3a2a00;\n  font-size: 0.85rem;\n  font-weight: 800;\n  line-height: 1;\n  box-shadow:\n    0 0 6px rgba(255, 215, 0, 0.7),\n    0 0 14px rgba(255, 215, 0, 0.35),\n    inset 0 1px 1px rgba(255, 255, 255, 0.6),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.home-toolbar[_ngcontent-%COMP%]   .receipt-btn[_ngcontent-%COMP%]:hover   .receipt-coin[_ngcontent-%COMP%], \n.home-toolbar[_ngcontent-%COMP%]   .receipt-btn[_ngcontent-%COMP%]:focus-visible   .receipt-coin[_ngcontent-%COMP%] {\n  transform: scale(1.12) rotate(-6deg);\n  box-shadow:\n    0 0 10px rgba(255, 215, 0, 0.9),\n    0 0 22px rgba(255, 215, 0, 0.5),\n    inset 0 1px 1px rgba(255, 255, 255, 0.7),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n}\n.home-toolbar[_ngcontent-%COMP%]   .receipt-btn[_ngcontent-%COMP%]:active   .receipt-coin[_ngcontent-%COMP%] {\n  transform: scale(0.95);\n}\n@media (max-width: 480px) {\n  .home-toolbar[_ngcontent-%COMP%]   ion-title[_ngcontent-%COMP%] {\n    font-size: 1rem;\n    padding-inline-start: 8px;\n  }\n  .home-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%] {\n    --padding-start: 6px;\n    --padding-end: 6px;\n  }\n  .home-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%]   .btn-label[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .home-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    margin: 0;\n  }\n  .home-toolbar[_ngcontent-%COMP%]   .receipt-coin[_ngcontent-%COMP%] {\n    margin-inline-end: 0;\n  }\n}\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n  margin-bottom: 24px;\n  width: 100%;\n  padding: 0 16px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.clickable-card[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.clickable-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.clickable-card[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 16px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.8rem;\n  font-weight: bold;\n  color: var(--cash-color);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n}\n.user-info[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.8);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%] {\n  text-align: right;\n  display: flex;\n  align-items: flex-end;\n  gap: 16px;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #FFD700;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 15px rgba(255, 215, 0, 0.4);\n  border-color: #FFED4E;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]   .networth-amount[_ngcontent-%COMP%] {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #FFD700;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]   .networth-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]   .networth-label[_ngcontent-%COMP%]   .click-hint[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  opacity: 0.7;\n  font-weight: 400;\n  text-transform: lowercase;\n  letter-spacing: 0;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #00FF7F;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(0, 255, 127, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 15px rgba(0, 255, 127, 0.4);\n  border-color: #4AFF85;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n  box-shadow: 0 0 8px rgba(0, 255, 127, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount[_ngcontent-%COMP%] {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #00FF7F;\n  text-shadow: 0 0 8px rgba(0, 255, 127, 0.4);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .click-hint[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  opacity: 0.7;\n  font-weight: 400;\n  text-transform: lowercase;\n  letter-spacing: 0;\n}\n@media (max-width: 480px) {\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: space-between;\n    gap: 12px;\n    margin-top: 12px;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%], \n   .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%] {\n    flex: 1;\n    align-items: center;\n    padding: 8px;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-amount[_ngcontent-%COMP%], \n   .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount[_ngcontent-%COMP%] {\n    font-size: 1.1rem !important;\n  }\n}\n.quick-actions[_ngcontent-%COMP%]   ion-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n}\n.quick-actions[_ngcontent-%COMP%]   ion-card[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.quick-actions[_ngcontent-%COMP%]   ion-card[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 10px;\n  font-weight: 600;\n}\n.quick-actions[_ngcontent-%COMP%]   ion-card[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   ion-button.button-solid[_ngcontent-%COMP%] {\n  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 0 8px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 12px 0;\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      var(--ion-color-primary),\n      transparent);\n  opacity: 0.6;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%] {\n  display: block;\n  min-width: 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .card-header-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-title-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%] {\n  font-size: 2.2rem;\n  flex-shrink: 0;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .card-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-items: center;\n  justify-content: center;\n  row-gap: 8px;\n  width: 100%;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.2rem;\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n  min-width: 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-description[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  line-height: 1.4;\n  text-align: center;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-day-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-period-status[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n  justify-content: center;\n  margin-top: 8px;\n  font-size: 0.78rem;\n  color: rgba(255, 255, 255, 0.55);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-period-status[_ngcontent-%COMP%]   .period-progress[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: rgba(255, 255, 255, 0.75);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: 16px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 2px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n  font-weight: bold;\n  font-size: 0.9rem;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value.streak[_ngcontent-%COMP%] {\n  color: var(--streak-color);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value.total-earned[_ngcontent-%COMP%] {\n  color: var(--earnings-color);\n  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  padding: 16px;\n  background: rgba(0, 255, 136, 0.05);\n  border: 1px solid rgba(0, 255, 136, 0.2);\n  border-radius: 8px;\n  width: 100%;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  font-weight: bold;\n  color: var(--earnings-color);\n  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .earnings-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 4px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --color: rgba(255, 255, 255, 0.7);\n  --padding-top: 4px;\n  --padding-bottom: 4px;\n  font-size: 0.7rem;\n  margin: 0;\n  height: auto;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]:hover {\n  --color: rgba(255, 255, 255, 0.9);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%] {\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  padding: 8px;\n  margin-top: 8px;\n  font-size: 0.75rem;\n  min-width: 140px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 4px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-item[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-item[_ngcontent-%COMP%]   .breakdown-label[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.7rem;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-item[_ngcontent-%COMP%]   .breakdown-value[_ngcontent-%COMP%] {\n  color: var(--earnings-color);\n  font-weight: 600;\n  font-size: 0.7rem;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-item.breakdown-total[_ngcontent-%COMP%] {\n  border-top: 1px solid rgba(255, 255, 255, 0.2);\n  padding-top: 4px;\n  margin-top: 4px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-item.breakdown-total[_ngcontent-%COMP%]   .breakdown-label[_ngcontent-%COMP%] {\n  font-weight: bold;\n  color: rgba(255, 255, 255, 0.9);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-item.breakdown-total[_ngcontent-%COMP%]   .breakdown-value[_ngcontent-%COMP%] {\n  font-weight: bold;\n  font-size: 0.8rem;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-breakdown[_ngcontent-%COMP%]   .breakdown-divider[_ngcontent-%COMP%] {\n  height: 1px;\n  background: rgba(255, 255, 255, 0.1);\n  margin: 4px 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-per-completion[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  font-weight: bold;\n  color: var(--earnings-color);\n  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%] {\n  margin-top: 8px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  padding: 8px 16px;\n  background: #FFB800;\n  color: #000000;\n  border: none;\n  border-radius: 8px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  cursor: pointer;\n  user-select: none;\n  -webkit-user-select: none;\n  -webkit-tap-highlight-color: transparent;\n  overflow: hidden;\n  transition: all 0.2s ease;\n  box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3);\n  min-width: 100px;\n  width: 100px;\n  height: 36px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]   .hold-progress[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  background:\n    linear-gradient(\n      90deg,\n      #22C55E,\n      #16A34A);\n  transition: width 0.05s ease-out;\n  z-index: 1;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]   .undo-progress[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  right: 0;\n  height: 100%;\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800);\n  transition: width 0.05s ease-out;\n  z-index: 1;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]   .button-icon[_ngcontent-%COMP%], \n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n  pointer-events: none;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]   .button-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  color: inherit;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%] {\n  font-size: inherit;\n  font-weight: inherit;\n  color: inherit;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]:hover:not(.is-holding):not(.is-completing):not(.is-undo-mode):not(.is-undoing) {\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(255, 184, 0, 0.4);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]:active:not(.is-undo-mode):not(.is-undoing), \n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-holding[_ngcontent-%COMP%] {\n  transform: translateY(0);\n  box-shadow: 0 1px 4px rgba(255, 184, 0, 0.2);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-completing[_ngcontent-%COMP%] {\n  background: #22C55E;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-completing[_ngcontent-%COMP%]   .hold-progress[_ngcontent-%COMP%] {\n  width: 100% !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-undo-mode[_ngcontent-%COMP%] {\n  background: #22C55E;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-undo-mode[_ngcontent-%COMP%]:hover:not(.is-undoing) {\n  background: #16A34A;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-undo-mode[_ngcontent-%COMP%]:active:not(.is-undoing), \n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-undo-mode.is-undoing[_ngcontent-%COMP%] {\n  transform: translateY(0);\n  background: #15803D;\n  box-shadow: 0 1px 4px rgba(34, 197, 94, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-undo-mode[_ngcontent-%COMP%]   .hold-progress[_ngcontent-%COMP%] {\n  display: none;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-undoing[_ngcontent-%COMP%] {\n  background: #22C55E;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button.is-undoing[_ngcontent-%COMP%]   .undo-progress[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .business-header-actions[_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%], \n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   div[style*=flex][_ngcontent-%COMP%]   .hold-complete-button[_ngcontent-%COMP%] {\n  background: #FFB800 !important;\n  color: #000000 !important;\n  border: none !important;\n  font-weight: 600 !important;\n  box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3) !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .business-header-actions[_ngcontent-%COMP%]   .hold-complete-button.is-undo-mode[_ngcontent-%COMP%], \n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   div[style*=flex][_ngcontent-%COMP%]   .hold-complete-button.is-undo-mode[_ngcontent-%COMP%] {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .business-header-actions[_ngcontent-%COMP%]   .hold-complete-button.is-completing[_ngcontent-%COMP%], \n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   div[style*=flex][_ngcontent-%COMP%]   .hold-complete-button.is-completing[_ngcontent-%COMP%] {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[color=success][_ngcontent-%COMP%] {\n  --background: var(--earnings-color);\n  --color: #000000;\n  --box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .completed-badge[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 12px;\n  background: rgba(0, 255, 136, 0.1);\n  border: 1px solid rgba(0, 255, 136, 0.3);\n  border-radius: 8px;\n  color: var(--earnings-color);\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   .completed-badge[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 40px 20px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 4rem;\n  color: var(--ion-color-medium);\n  margin-bottom: 16px;\n  opacity: 0.6;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.8);\n  margin: 0 0 12px 0;\n  font-size: 1.2rem;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n  margin: 0 0 8px 0;\n  line-height: 1.5;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   p.tip[_ngcontent-%COMP%] {\n  font-style: italic;\n  margin-bottom: 24px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  --padding-start: 20px;\n  --padding-end: 20px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  margin-top: 16px;\n  font-size: 0.95rem;\n  font-weight: 600;\n  height: 44px;\n  width: auto;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   .button-native[_ngcontent-%COMP%] {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  margin-right: 8px;\n  display: inline-flex;\n  align-items: center;\n  vertical-align: middle;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[color=success][_ngcontent-%COMP%] {\n  --box-shadow: 0 3px 10px rgba(var(--ion-color-success-rgb), 0.3);\n}\n.todays-habits[_ngcontent-%COMP%]   .habit-item[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 8px 0;\n  padding: 12px 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.todays-habits[_ngcontent-%COMP%]   .habit-item[_ngcontent-%COMP%]   .habit-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.todays-habits[_ngcontent-%COMP%]   .habit-item[_ngcontent-%COMP%]   .habit-content[_ngcontent-%COMP%]   .habit-info[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.todays-habits[_ngcontent-%COMP%]   .habit-item[_ngcontent-%COMP%]   .habit-content[_ngcontent-%COMP%]   .habit-info[_ngcontent-%COMP%]   .habit-name[_ngcontent-%COMP%] {\n  margin: 0 0 4px 0;\n  font-weight: 600;\n  color: #ffffff;\n}\n.todays-habits[_ngcontent-%COMP%]   .habit-item[_ngcontent-%COMP%]   .habit-content[_ngcontent-%COMP%]   .habit-info[_ngcontent-%COMP%]   .habit-earnings[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--earnings-color);\n  font-weight: 500;\n}\n.todays-habits[_ngcontent-%COMP%]   .habit-item[_ngcontent-%COMP%]   .habit-content[_ngcontent-%COMP%]   ion-checkbox[_ngcontent-%COMP%] {\n  --size: 24px;\n  --checkmark-color: #000000;\n  --background-checked: var(--earnings-color);\n  --border-color-checked: var(--earnings-color);\n}\n@media (min-width: 768px) {\n  .stats-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(3, 1fr);\n    gap: 20px;\n    padding: 0 20px;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n    font-size: 1.6rem;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount[_ngcontent-%COMP%] {\n    font-size: 1.3rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%] {\n    font-size: 3rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n    font-size: 1.4rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 24px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%] {\n    margin-top: 16px;\n    padding: 16px;\n    background: rgba(0, 255, 136, 0.05);\n    border: 1px solid rgba(0, 255, 136, 0.2);\n    border-radius: 8px;\n    width: 100%;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%] {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 4px;\n  }\n}\n.habit-grid-modal[_ngcontent-%COMP%]   ion-modal[_ngcontent-%COMP%] {\n  --width: 100%;\n  --height: 100%;\n  --border-radius: 0;\n  --background: rgba(0, 0, 0, 0.95);\n}\n.habit-grid-modal[_ngcontent-%COMP%]   .modal-wrapper[_ngcontent-%COMP%] {\n  overflow: hidden;\n}\n@media (min-width: 768px) {\n  .habit-grid-modal[_ngcontent-%COMP%]   ion-modal[_ngcontent-%COMP%] {\n    --width: 98%;\n    --height: 95%;\n    --border-radius: 12px;\n    --background: rgba(0, 0, 0, 0.95);\n    border: 1px solid rgba(255, 215, 0, 0.3);\n  }\n}\n@media (min-width: 1024px) {\n  .habit-grid-modal[_ngcontent-%COMP%]   ion-modal[_ngcontent-%COMP%] {\n    --width: 95%;\n    --height: 90%;\n    max-width: none;\n    min-width: 1200px;\n  }\n}\n@media (min-width: 1200px) {\n  .habit-grid-modal[_ngcontent-%COMP%]   ion-modal[_ngcontent-%COMP%] {\n    --width: 92%;\n    --height: 85%;\n    min-width: 1400px;\n  }\n}\n@media (min-width: 1600px) {\n  .habit-grid-modal[_ngcontent-%COMP%]   ion-modal[_ngcontent-%COMP%] {\n    --width: 88%;\n    --height: 80%;\n    min-width: 1600px;\n  }\n}\n.habit-grid-modal[_ngcontent-%COMP%]   .modal-footer[_ngcontent-%COMP%] {\n  padding: 20px;\n  border-top: 1px solid rgba(255, 215, 0, 0.2);\n  background: rgba(0, 0, 0, 0.3);\n  margin-top: auto;\n}\n.habit-grid-modal[_ngcontent-%COMP%]   .close-button[_ngcontent-%COMP%] {\n  margin-top: 0 !important;\n  --color: #ffffff !important;\n  --color-hover: #ffd700 !important;\n  --color-focused: #ffd700 !important;\n  --background-hover: rgba(255, 215, 0, 0.1) !important;\n  --border-color: rgba(255, 215, 0, 0.3) !important;\n  height: 48px !important;\n  font-size: 16px !important;\n  font-weight: 500 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n}\n.inline-habit-grid[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  margin-top: 16px;\n}\n.inline-habit-grid[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 16px;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 8px;\n  border-top: 1px solid rgba(255, 215, 0, 0.2);\n  max-width: 100%;\n  overflow-x: auto;\n}\n@media (max-width: 480px) {\n  .inline-habit-grid[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    --grid-size: 7px;\n  }\n}\n@media (max-width: 768px) {\n  .stats-grid[_ngcontent-%COMP%] {\n    gap: 8px;\n    padding: 0 12px;\n  }\n  .hold-complete-button[_ngcontent-%COMP%] {\n    min-width: 100px !important;\n    width: 100px !important;\n    height: 34px !important;\n    padding: 7px 14px !important;\n    font-size: 0.75rem !important;\n  }\n  .hold-complete-button[_ngcontent-%COMP%]   .button-icon[_ngcontent-%COMP%] {\n    font-size: 0.95rem !important;\n  }\n  .hold-complete-button[_ngcontent-%COMP%]::before {\n    content: "";\n    position: absolute;\n    top: -8px;\n    left: -8px;\n    right: -8px;\n    bottom: -8px;\n    z-index: -1;\n  }\n  .earnings-toggle-button[_ngcontent-%COMP%] {\n    width: 32px !important;\n    height: 32px !important;\n  }\n  .earnings-toggle-button[_ngcontent-%COMP%]   .dollar-icon[_ngcontent-%COMP%] {\n    font-size: 1rem !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .card-header-row[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 4px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .card-actions[_ngcontent-%COMP%] {\n    justify-content: center;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   ion-button[color=warning][_ngcontent-%COMP%], \n   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   ion-button[color=danger][_ngcontent-%COMP%] {\n    --padding-start: 8px !important;\n    --padding-end: 8px !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   ion-button[color=tertiary][_ngcontent-%COMP%], \n   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[name=create][_ngcontent-%COMP%] {\n    font-size: 1.1rem;\n  }\n  .inline-habit-grid[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    margin: 0 !important;\n    padding: 0 !important;\n    width: 100% !important;\n    display: block !important;\n  }\n  .inline-habit-grid[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .content-wrapper {\n    width: 100% !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    display: block !important;\n  }\n  .inline-habit-grid[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    width: 100% !important;\n    max-width: 100% !important;\n    padding: 8px 4px !important;\n    margin: 0 !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n  }\n}\n@media (min-width: 769px) {\n  .desktop-stats[_ngcontent-%COMP%] {\n    display: grid;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n@media (max-width: 768px) {\n  .desktop-stats[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%] {\n    display: block;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%] {\n    position: relative;\n    width: 100%;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%] {\n    margin: 0;\n    width: 100%;\n    min-height: 100px;\n    background: var(--business-item-background);\n    border: var(--business-item-border);\n    border-radius: 12px;\n    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card.clickable-card[_ngcontent-%COMP%] {\n    cursor: pointer;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card.clickable-card[_ngcontent-%COMP%]:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card.clickable-card[_ngcontent-%COMP%]:active {\n    transform: translateY(0);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%] {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    justify-content: center;\n    text-align: center;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    font-size: 28px;\n    min-width: 36px;\n    color: var(--ion-color-primary);\n    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n    margin: 0;\n    font-size: 1.5rem;\n    font-weight: bold;\n    color: var(--cash-color);\n    text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n    margin: 4px 0 0 0;\n    font-size: 1rem;\n    color: rgba(255, 255, 255, 0.8);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-indicators[_ngcontent-%COMP%] {\n    display: flex;\n    justify-content: center;\n    gap: 8px;\n    margin-top: 12px;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-indicators[_ngcontent-%COMP%]   .indicator[_ngcontent-%COMP%] {\n    width: 8px;\n    height: 8px;\n    border-radius: 50%;\n    background-color: var(--ion-color-light);\n    cursor: pointer;\n    transition: background-color 0.2s ease;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-indicators[_ngcontent-%COMP%]   .indicator.active[_ngcontent-%COMP%] {\n    background-color: var(--ion-color-primary);\n  }\n}\n@media (max-width: 480px) {\n  .stats-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    gap: 12px;\n    padding: 0 16px;\n  }\n  .stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n    padding: 14px;\n  }\n  .stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%] {\n    gap: 10px;\n  }\n  .stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    font-size: 1.8rem;\n  }\n  .stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n    font-size: 1.6rem;\n  }\n  .stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n    font-size: 0.85rem;\n  }\n}\n.hold-complete-button[_ngcontent-%COMP%] {\n  position: relative !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  padding: 8px 16px !important;\n  background: #FFB800 !important;\n  color: #000000 !important;\n  border: none !important;\n  border-radius: 8px !important;\n  font-size: 0.75rem !important;\n  font-weight: 600 !important;\n  cursor: pointer !important;\n  user-select: none !important;\n  -webkit-user-select: none !important;\n  -webkit-tap-highlight-color: transparent !important;\n  overflow: hidden !important;\n  transition: all 0.2s ease !important;\n  box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3) !important;\n  min-width: 100px !important;\n  width: 100px !important;\n  height: 36px !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .hold-progress[_ngcontent-%COMP%] {\n  position: absolute !important;\n  top: 0 !important;\n  left: 0 !important;\n  height: 100% !important;\n  background:\n    linear-gradient(\n      90deg,\n      #22C55E,\n      #16A34A) !important;\n  transition: width 0.05s ease-out !important;\n  z-index: 1 !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .undo-progress[_ngcontent-%COMP%] {\n  position: absolute !important;\n  top: 0 !important;\n  right: 0 !important;\n  height: 100% !important;\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800) !important;\n  transition: width 0.05s ease-out !important;\n  z-index: 1 !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .button-icon[_ngcontent-%COMP%], \n.hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%] {\n  position: relative !important;\n  z-index: 2 !important;\n  pointer-events: none !important;\n  color: inherit !important;\n  list-style: none !important;\n  list-style-type: none !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .button-icon[_ngcontent-%COMP%]::before, \n.hold-complete-button[_ngcontent-%COMP%]   .button-icon[_ngcontent-%COMP%]::after, \n.hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%]::before, \n.hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%]::after {\n  display: none !important;\n  content: none !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%] {\n  margin: 0 !important;\n  padding: 0 !important;\n  list-style: none !important;\n  list-style-type: none !important;\n  text-indent: 0 !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%]::before {\n  display: none !important;\n  content: none !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%]::after {\n  display: none !important;\n  content: none !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]   .button-icon[_ngcontent-%COMP%] {\n  font-size: 1rem !important;\n}\n.hold-complete-button.is-completing[_ngcontent-%COMP%] {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.hold-complete-button.is-completing[_ngcontent-%COMP%]   .hold-progress[_ngcontent-%COMP%] {\n  width: 100% !important;\n}\n.hold-complete-button.is-undo-mode[_ngcontent-%COMP%] {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.hold-complete-button.is-undo-mode[_ngcontent-%COMP%]   .hold-progress[_ngcontent-%COMP%] {\n  display: none !important;\n}\n.hold-complete-button.is-undoing[_ngcontent-%COMP%] {\n  background: #22C55E !important;\n}\n.hold-complete-button.is-undoing[_ngcontent-%COMP%]   .undo-progress[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800) !important;\n}\n.hold-complete-button[_ngcontent-%COMP%]:hover:not(.is-holding):not(.is-completing):not(.is-undo-mode):not(.is-undoing) {\n  transform: translateY(-1px) !important;\n  box-shadow: 0 4px 12px rgba(255, 184, 0, 0.4) !important;\n}\n.hold-complete-button.is-undo-mode[_ngcontent-%COMP%]:hover:not(.is-undoing) {\n  background: #16A34A !important;\n  transform: translateY(-1px) !important;\n  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5) !important;\n}\n.earnings-toggle-button[_ngcontent-%COMP%] {\n  position: relative !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  width: 36px !important;\n  height: 36px !important;\n  background: #22C55E !important;\n  border: none !important;\n  border-radius: 8px !important;\n  cursor: pointer !important;\n  user-select: none !important;\n  -webkit-user-select: none !important;\n  -webkit-tap-highlight-color: transparent !important;\n  transition: all 0.2s ease !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3) !important;\n}\n.earnings-toggle-button[_ngcontent-%COMP%]   .dollar-icon[_ngcontent-%COMP%] {\n  font-size: 1.2rem !important;\n  color: #FFFFFF !important;\n  pointer-events: none !important;\n}\n.earnings-toggle-button[_ngcontent-%COMP%]:hover {\n  background: #16A34A !important;\n  transform: translateY(-1px) !important;\n  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4) !important;\n}\n.earnings-toggle-button[_ngcontent-%COMP%]:active {\n  transform: translateY(0) !important;\n  background: #15803D !important;\n  box-shadow: 0 1px 4px rgba(34, 197, 94, 0.2) !important;\n}\n.back-button[_ngcontent-%COMP%] {\n  background: rgba(255, 140, 0, 0.1);\n  border: 1px solid rgba(255, 140, 0, 0.3);\n  border-radius: 6px;\n  padding: 8px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 36px;\n  height: 36px;\n}\n.back-button[_ngcontent-%COMP%]   .back-icon[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n  color: var(--ion-color-warning);\n}\n.back-button[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 140, 0, 0.2);\n  border-color: rgba(255, 140, 0, 0.5);\n  transform: translateY(-1px);\n}\n.back-button[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n  background: rgba(255, 140, 0, 0.3);\n}\n.help-icon-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 16px;\n  cursor: pointer;\n}\n.help-icon-container[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%], \n.help-icon-container[_ngcontent-%COMP%]   .help-icon[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  color: var(--ion-color-medium);\n  transition: color 0.2s ease;\n}\n.help-icon-container[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%]:hover, \n.help-icon-container[_ngcontent-%COMP%]   .help-icon[_ngcontent-%COMP%]:hover {\n  color: var(--ion-color-primary);\n}\n.help-icon-container[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  transition: color 0.2s ease;\n}\n.help-icon-container[_ngcontent-%COMP%]:hover   .help-text[_ngcontent-%COMP%], \n.help-icon-container[_ngcontent-%COMP%]:hover   ion-icon[_ngcontent-%COMP%], \n.help-icon-container[_ngcontent-%COMP%]:hover   .help-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.section-header-container[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 24px 8px 16px 0;\n}\n.section-header-container[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  color: var(--ion-color-primary);\n}\n.section-header-container[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.3rem;\n  font-weight: 600;\n}\n.section-header-container[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  cursor: pointer;\n  transition: color 0.2s ease;\n}\n.section-header-container[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]:hover   .help-text[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.habit-progress-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin: 0 16px 16px 16px;\n}\n.habit-progress-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n}\n.habit-progress-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.3rem;\n  font-weight: 600;\n}\n.habit-progress-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  cursor: pointer;\n  transition: color 0.2s ease;\n}\n.habit-progress-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]:hover   .help-text[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.info-card[_ngcontent-%COMP%] {\n  margin: 16px;\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   .info-title-section[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   .info-title-section[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   .info-title-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.1rem;\n  font-weight: 600;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --padding-start: 8px;\n  --padding-end: 8px;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n  min-width: 32px;\n  min-height: 32px;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  padding-left: 16px;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin: 4px 0;\n  font-size: 0.85rem;\n  line-height: 1.3;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   em[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--ion-color-success);\n  font-weight: 500;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   .disclaimer[_ngcontent-%COMP%] {\n  margin-top: 12px !important;\n  padding: 8px 12px;\n  background: rgba(var(--ion-color-warning-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-warning-rgb), 0.3);\n  border-radius: 6px;\n  font-size: 0.8rem !important;\n  line-height: 1.3;\n  color: var(--ion-color-medium);\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   .disclaimer[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--ion-color-warning);\n}\n.habit-group-section[_ngcontent-%COMP%]   .habit-group-title[_ngcontent-%COMP%] {\n  margin: 20px 0 8px;\n  font-size: 0.9rem;\n  font-weight: 700;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n  color: var(--ion-color-medium);\n}\n.habit-group-section[_ngcontent-%COMP%]:first-of-type   .habit-group-title[_ngcontent-%COMP%] {\n  margin-top: 8px;\n}\n.habit-business-item[_ngcontent-%COMP%] {\n  position: relative;\n}\n.habit-business-item[_ngcontent-%COMP%]   .reorder-controls[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 0;\n  flex-shrink: 0;\n}\n.habit-business-item[_ngcontent-%COMP%]   .reorder-controls[_ngcontent-%COMP%]   .reorder-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 20px;\n  border: none;\n  background: transparent;\n  color: var(--ion-color-medium);\n  cursor: pointer;\n  border-radius: 6px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .reorder-controls[_ngcontent-%COMP%]   .reorder-btn[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 16px;\n  pointer-events: none;\n}\n.habit-business-item[_ngcontent-%COMP%]   .reorder-controls[_ngcontent-%COMP%]   .reorder-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  color: var(--ion-color-primary);\n  background: rgba(255, 255, 255, 0.06);\n}\n.habit-business-item[_ngcontent-%COMP%]   .reorder-controls[_ngcontent-%COMP%]   .reorder-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n.habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%] {\n  flex: 1;\n}\n/*# sourceMappingURL=home.page.css.map */'] });
var HomePage = _HomePage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HomePage, [{
    type: Component,
    args: [{ selector: "app-home", imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonIcon, IonInput, CommonModule, FormsModule, RouterLink, BottomNavComponent, HabitGridComponent], template: `<ion-header [translucent]="true">
  <ion-toolbar class="home-toolbar">
    <ion-title>\u{1F4B0} Habit Tycoon</ion-title>
    <ion-button
      *ngIf="isAdmin"
      slot="end"
      fill="clear"
      routerLink="/admin"
      color="warning"
      class="header-action-btn"
    >
      <ion-icon name="shield" slot="start"></ion-icon>
      <span class="btn-label">Admin</span>
    </ion-button>
    <ion-button
      *ngIf="currentUser"
      slot="end"
      fill="clear"
      (click)="openWeeklyReceipt()"
      class="header-action-btn receipt-btn"
      aria-label="Weekly Receipt"
    >
      <span class="receipt-coin" slot="start">$</span>
      <span class="btn-label">Receipt</span>
    </ion-button>
    <ion-button
      *ngIf="currentUser"
      slot="end"
      fill="clear"
      routerLink="/settings"
      class="header-action-btn"
    >
      <ion-icon name="settings" slot="start"></ion-icon>
      <span class="btn-label">Settings</span>
    </ion-button>
    <ion-button *ngIf="currentUser" slot="end" fill="clear" (click)="logout()" class="header-action-btn">
      <ion-icon name="log-out" slot="start"></ion-icon>
      <span class="btn-label">Logout</span>
    </ion-button>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding" [scrollY]="false">
  <div class="scrollable-content">
    <div class="page-container">
      <!-- User Stats Header -->
      <div *ngIf="currentUser" class="user-info">
        <div class="welcome-section">
          <div class="welcome-text">
            <h2>
              Welcome back,
              <span>
                {{ userProfile?.name || currentUser?.user_metadata?.['name'] ||
                'Entrepreneur' }}!
              </span>
            </h2>
            <p>{{ currentTagline }}</p>
          </div>
          <div class="cash-display">
            <div class="networth-display" (click)="toggleNetWorthDetail()">
              <div class="networth-amount clickable">\${{ getDisplayedNetWorth() }}</div>
              <div class="networth-label">NET WORTH</div>
            </div>
            <div class="cash-section" (click)="toggleCashDetail()">
              <div class="cash-amount clickable">\${{ getDisplayedCash() }}</div>
              <div class="cash-label">HABIT CASH</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple fallback if no user -->
      <div *ngIf="!currentUser" class="guest-view">
        <h2>Welcome to Habit Tycoon! \u{1F4B0}</h2>
        <p>Your adventure awaits...</p>
        <ion-button routerLink="/login" color="primary">
          Login to Start
        </ion-button>
      </div>

      <!-- Daily Stats Section -->
      <div *ngIf="currentUser" class="section-header-container">
        <div class="section-header">
          <ion-icon name="analytics-outline"></ion-icon>
          <h2>Daily Stats</h2>
        </div>

        <div
          *ngIf="!showStatsHelpSection"
          class="help-icon-container ion-margin-bottom"
        >
          <ion-icon
            name="help-circle"
            class="help-icon"
            (click)="toggleStatsHelpSection()"
          >
          </ion-icon>
          <span class="help-text" (click)="toggleStatsHelpSection()"
            >How stats work</span
          >
        </div>

        <!-- Stats Explanation Card -->
        <ion-card
          *ngIf="showStatsHelpSection"
          class="info-card ion-margin-bottom"
        >
          <ion-card-content>
            <div class="info-header">
              <div class="info-title-section">
                <ion-icon name="analytics" color="success"></ion-icon>
                <h3>How Your Daily Stats Work</h3>
              </div>
              <ion-button
                fill="clear"
                size="small"
                color="medium"
                (click)="toggleStatsHelpSection()"
              >
                <ion-icon name="close" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
            <div class="info-content">
              <div>
                <p>Your dashboard shows key metrics to track your progress:</p>
                <ul>
                  <li>
                    <strong>Pending Habits:</strong> Number of habits you can
                    complete today
                  </li>
                  <li>
                    <strong>Today's Habit Earnings:</strong> Money earned from
                    completing your own habits
                  </li>
                  <li>
                    <strong>Today's Stock Dividends:</strong> Passive income
                    from your stock investments
                  </li>
                  <li>
                    <strong>Net Worth & Habit Cash:</strong> Click the money
                    cards for an explanation of each value
                  </li>
                </ul>
                <p><em>Complete habits daily to maximize your earnings!</em></p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Stats Grid -->
      <!-- Desktop: All 3 cards -->
      <div class="stats-grid ion-margin-bottom desktop-stats">
        <ion-card class="stat-card">
          <ion-card-content>
            <div class="stat-content">
              <ion-icon name="checkmark-circle" color="success"></ion-icon>
              <div class="stat-info">
                <h2>{{ pendingHabitsCount }}</h2>
                <p>Pending Habits</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="stat-card">
          <ion-card-content>
            <div class="stat-content">
              <ion-icon name="business" color="success"></ion-icon>
              <div class="stat-info">
                <h2>\${{ todaysEarnings.toFixed(2) }}</h2>
                <p>Today's Habit Earnings</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="stat-card">
          <ion-card-content>
            <div class="stat-content">
              <ion-icon name="wallet" color="secondary"></ion-icon>
              <div class="stat-info">
                <h2>\${{ todaysStockEarnings.toFixed(2) }}</h2>
                <p>Today's Stock Dividends</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Mobile: Carousel with single card -->
      <div class="mobile-stats-carousel ion-margin-bottom">
        <div
          class="carousel-container"
          (touchstart)="onStatTouchStart($event)"
          (touchend)="onStatTouchEnd($event)"
        >
          <ion-card
            class="stat-card carousel-card"
            *ngIf="statsCards[currentStatIndex] as stat"
            [class.clickable-card]="stat.clickAction"
            (click)="stat.clickAction && stat.clickAction()"
          >
            <ion-card-content>
              <div class="stat-content">
                <ion-icon [name]="stat.icon" [color]="stat.color"></ion-icon>
                <div class="stat-info">
                  <h2>{{ stat.getValue() }}</h2>
                  <p>{{ stat.label }}</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Carousel indicators -->
          <div class="carousel-indicators">
            <span
              *ngFor="let stat of statsCards; let i = index"
              class="indicator"
              [class.active]="i === currentStatIndex"
              (click)="currentStatIndex = i; stopAutoCarousel()"
            >
            </span>
          </div>
        </div>
      </div>

      <!-- My Habit-Businesses - NO CARD BACKGROUND -->
      <div class="my-habit-businesses ion-margin-bottom">
        <div class="section-header">
          <ion-icon name="business"></ion-icon>
          <h2>My Habit-Businesses</h2>
        </div>

        <div
          *ngIf="!showHabitProgressHelpSection"
          class="help-icon-container ion-margin-bottom"
        >
          <ion-icon
            name="help-circle"
            class="help-icon"
            (click)="toggleHabitProgressHelpSection()"
          >
          </ion-icon>
          <span class="help-text" (click)="toggleHabitProgressHelpSection()"
            >How habit businesses work</span
          >
        </div>

        <!-- Habit Progress Explanation Card -->
        <ion-card
          *ngIf="showHabitProgressHelpSection"
          class="info-card ion-margin-bottom"
        >
          <ion-card-content>
            <div class="info-header">
              <div class="info-title-section">
                <ion-icon name="business" color="primary"></ion-icon>
                <h3>How Habit Businesses Work</h3>
              </div>
              <ion-button
                fill="clear"
                size="small"
                color="medium"
                (click)="toggleHabitProgressHelpSection()"
              >
                <ion-icon name="close" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
            <div class="info-content">
              <div>
                <p>
                  Turn your habits into profitable businesses that generate
                  income:
                </p>
                <ul>
                  <li>
                    <strong>Complete Habits:</strong> Each completion earns
                    money and builds streaks
                  </li>
                  <li>
                    <strong>Habit Streaks:</strong> Longer streaks increase your
                    earnings multiplier
                  </li>
                  <li>
                    <strong>Business Value:</strong> Consistent habits increase
                    your business's stock price
                  </li>
                  <li>
                    <strong>Stockholders:</strong> Others can invest in your
                    habits and earn dividends
                  </li>
                </ul>
                <p>
                  <em
                    >Consistency is the key to building a successful habit
                    empire!</em
                  >
                </p>
                <p class="disclaimer">
                  <strong>Disclaimer:</strong> All in-game "Habit Cash" and
                  currency are virtual and hold no real-world monetary value.
                  This is a gamification tool designed to motivate habit
                  building.
                </p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <div
          *ngIf="habitBusinesses && habitBusinesses.length > 0; else noHabitBusinesses"
        >
          <!-- Shared card markup, rendered once per habit-business in either group below -->
          <ng-template
            #habitBusinessCard
            let-hb
            let-isFirst="isFirst"
            let-isLast="isLast"
          >
            <div class="habit-business-item">
              <div class="item-content">
                <div class="business-info">
                  <div class="card-header-row">
                    <div class="business-title-row">
                      <!-- Reorder Controls -->
                      <div class="reorder-controls">
                        <button
                          type="button"
                          class="reorder-btn"
                          [disabled]="isFirst"
                          (click)="moveHabitBusiness(hb, 'up')"
                          aria-label="Move up"
                        >
                          <ion-icon name="chevron-up"></ion-icon>
                        </button>
                        <button
                          type="button"
                          class="reorder-btn"
                          [disabled]="isLast"
                          (click)="moveHabitBusiness(hb, 'down')"
                          aria-label="Move down"
                        >
                          <ion-icon name="chevron-down"></ion-icon>
                        </button>
                      </div>
                      <span class="business-icon">{{ hb.business_icon }}</span>
                      <h3 class="business-name">{{ hb.business_name }}</h3>
                    </div>
                    <div class="card-actions">
                      <!-- Sell/Delete button -->
                      <ion-button
                        fill="clear"
                        color="danger"
                        size="small"
                        (click)="deleteHabitBusiness(hb)"
                        style="
                          margin: 0;
                          --padding-start: 10px;
                          --padding-end: 10px;
                        "
                      >
                        Sell
                      </ion-button>

                      <!-- Earnings Toggle Button -->
                      <div
                        class="earnings-toggle-button"
                        (click)="toggleEarningsVisibility(hb.id)"
                      >
                        <ion-icon name="cash" class="dollar-icon"></ion-icon>
                      </div>

                      <ion-button
                        fill="clear"
                        color="tertiary"
                        size="default"
                        class="calendar-toggle-button"
                        (click)="toggleHabitGrid(hb)"
                        style="
                          margin: 0;
                          --padding-start: 12px;
                          --padding-end: 12px;
                        "
                      >
                        <ion-icon
                          name="calendar-outline"
                          slot="icon-only"
                        ></ion-icon>
                      </ion-button>
                      <ion-button
                        fill="clear"
                        color="warning"
                        size="default"
                        (click)="upgradeHabitBusiness(hb)"
                        style="
                          margin: 0;
                          --padding-start: 12px;
                          --padding-end: 12px;
                        "
                      >
                        <ion-icon
                          name="trending-up"
                          slot="icon-only"
                        ></ion-icon>
                      </ion-button>
                      <ion-button
                        fill="clear"
                        size="default"
                        (click)="editHabitBusiness(hb)"
                        style="
                          margin: 0;
                          --padding-start: 12px;
                          --padding-end: 12px;
                          --color: #7ecfff;
                          opacity: 1;
                        "
                      >
                        <ion-icon name="create" slot="icon-only"></ion-icon>
                      </ion-button>

                      <!-- Complete/Undo buttons moved to far right -->
                      <!-- Single transforming button: Complete -> Undo -->
                      <div
                        *ngIf="!tapToComplete && (!isGoalCompleted(hb) || (hb.current_progress || 0) > 0)"
                        class="hold-complete-button"
                        [class.is-holding]="holdingStates[hb.id]?.isHolding"
                        [class.is-completing]="holdingStates[hb.id]?.isCompleting"
                        [class.is-undo-mode]="isGoalCompleted(hb) && (hb.current_progress || 0) > 0"
                        [class.is-undoing]="holdingStates[hb.id]?.isUndoing"
                        (touchstart)="isGoalCompleted(hb) ? startUndoHolding(hb, $event) : startHolding(hb, $event)"
                        (touchend)="isGoalCompleted(hb) ? stopUndoHolding(hb, $event) : stopHolding(hb, $event)"
                        (touchleave)="isGoalCompleted(hb) ? stopUndoHolding(hb, $event) : stopHolding(hb, $event)"
                        (touchcancel)="isGoalCompleted(hb) ? stopUndoHolding(hb, $event) : stopHolding(hb, $event)"
                        (mousedown)="isGoalCompleted(hb) ? startUndoHolding(hb, $event) : startHolding(hb, $event)"
                        (mouseup)="isGoalCompleted(hb) ? stopUndoHolding(hb, $event) : stopHolding(hb, $event)"
                        (mouseleave)="isGoalCompleted(hb) ? stopUndoHolding(hb, $event) : stopHolding(hb, $event)"
                        (contextmenu)="$event.preventDefault()"
                      >
                        <!-- Complete progress bar (only visible during complete hold) -->
                        <div
                          class="hold-progress"
                          [style.width.%]="holdingStates[hb.id]?.progress || 0"
                          *ngIf="!isGoalCompleted(hb)"
                        ></div>

                        <!-- Undo progress bar (only visible during undo hold) -->
                        <div
                          class="undo-progress"
                          [style.width.%]="holdingStates[hb.id]?.undoProgress || 0"
                          *ngIf="isGoalCompleted(hb)"
                        ></div>

                        <!-- Icon changes based on mode -->
                        <ion-icon
                          [name]="isGoalCompleted(hb) ? 'arrow-undo' : 'checkmark-circle'"
                          class="button-icon"
                        ></ion-icon>

                        <!-- Text changes based on mode and progress -->
                        <span class="button-text" *ngIf="isGoalCompleted(hb)">
                          Undo
                        </span>
                        <span
                          class="button-text"
                          *ngIf="!isGoalCompleted(hb) && (hb.goal_value && hb.goal_value > 1)"
                        >
                          Complete ({{ hb.current_progress || 0 }}/{{
                          hb.goal_value }})
                        </span>
                        <span
                          class="button-text"
                          *ngIf="!isGoalCompleted(hb) && (!hb.goal_value || hb.goal_value <= 1)"
                        >
                          Complete
                        </span>
                      </div>

                      <!-- Tap-to-complete variant: single tap instead of holding -->
                      <div
                        *ngIf="tapToComplete && (!isGoalCompleted(hb) || (hb.current_progress || 0) > 0)"
                        class="hold-complete-button"
                        [class.is-completing]="holdingStates[hb.id]?.isCompleting"
                        [class.is-undo-mode]="isGoalCompleted(hb) && (hb.current_progress || 0) > 0"
                        [class.is-undoing]="holdingStates[hb.id]?.isUndoing"
                        (click)="isGoalCompleted(hb) ? handleUndoTap(hb, $event) : handleCompleteTap(hb, $event)"
                      >
                        <!-- Icon changes based on mode -->
                        <ion-icon
                          [name]="isGoalCompleted(hb) ? 'arrow-undo' : 'checkmark-circle'"
                          class="button-icon"
                        ></ion-icon>

                        <!-- Text changes based on mode and progress -->
                        <span class="button-text" *ngIf="isGoalCompleted(hb)">
                          Undo
                        </span>
                        <span
                          class="button-text"
                          *ngIf="!isGoalCompleted(hb) && (hb.goal_value && hb.goal_value > 1)"
                        >
                          Complete ({{ hb.current_progress || 0 }}/{{
                          hb.goal_value }})
                        </span>
                        <span
                          class="button-text"
                          *ngIf="!isGoalCompleted(hb) && (!hb.goal_value || hb.goal_value <= 1)"
                        >
                          Complete
                        </span>
                      </div>

                      <!-- Simple back button for multi-completion habits with progress -->
                      <div
                        *ngIf="(hb.goal_value && hb.goal_value > 1) && (hb.current_progress || 0) > 0"
                        class="back-button"
                        (click)="undoLastCompletion(hb)"
                      >
                        <ion-icon
                          name="arrow-back"
                          class="back-icon"
                        ></ion-icon>
                      </div>

                      <!-- Show completed status if goal is fully completed but no undo available -->
                      <ion-button
                        *ngIf="isGoalCompleted(hb) && (hb.current_progress || 0) === 0"
                        fill="outline"
                        color="medium"
                        size="small"
                        disabled
                      >
                        <ion-icon
                          name="checkmark-circle"
                          slot="start"
                        ></ion-icon>
                        <!-- Show progress for multi-completion habits -->
                        <span *ngIf="hb.goal_value && hb.goal_value > 1">
                          Goal Complete ({{ hb.current_progress }}/{{
                          hb.goal_value }})
                        </span>
                        <!-- Simple text for single completion habits -->
                        <span *ngIf="!hb.goal_value || hb.goal_value <= 1">
                          Completed Today
                        </span>
                      </ion-button>
                    </div>
                  </div>
                  <p class="habit-description">{{ hb.habit_description }}</p>
                  <div class="habit-stats">
                    <div class="stat-item">
                      <div class="stat-label">Streak</div>
                      <div class="stat-value streak">
                        {{ hb.streak }} days
                      </div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">Total Earned</div>
                      <div class="stat-value total-earned">
                        \${{ formatLargeNumber(hb.total_earnings) }}
                      </div>
                    </div>
                  </div>

                  <!-- Day chips \u2014 only shown for specific_days habits -->
                  <div *ngIf="hb.recurrence_interval === 'specific_days' || hb.frequency === 'weekly'" class="habit-day-chips">
                    <span
                      *ngFor="let dow of allDows; let i = index"
                      class="habit-day-chip"
                      [class.active]="(hb.active_days || []).includes(dow)"
                      [class.today]="dow === today.getDay()"
                    >{{ dayChipLabels[i] }}</span>
                    <span *ngIf="!isTodayActiveDay(hb)" class="next-active-label">
                      Next: {{ getNextActiveDayLabel(hb) }}
                    </span>
                  </div>

                  <div class="habit-period-status">
                    <span class="period-progress"
                      >{{ hb.current_progress || 0 }}/{{ hb.goal_value || 1 }}
                      completions</span
                    >
                    <span *ngIf="isTodayActiveDay(hb)" class="period-reset"
                      >&bull; resets in {{ countdowns[hb.id] || '...' }}</span
                    >
                    <span *ngIf="!isTodayActiveDay(hb)" class="period-reset rest-day"
                      >&bull; rest day</span
                    >
                  </div>

                  <!-- Earnings Section (toggleable) - Now displayed below the main content -->
                  <div
                    class="earnings-section"
                    *ngIf="showEarningsSection[hb.id]"
                  >
                    <div class="earnings-total">
                      <div class="total-amount">
                        \${{ getEarningsBreakdown(hb).totalEarnings.toFixed(2) }}
                      </div>
                      <div class="earnings-label">total per completion</div>

                      <!-- Itemized Earnings Toggle Button -->
                      <ion-button
                        fill="clear"
                        size="small"
                        color="medium"
                        (click)="toggleEarningsBreakdown(hb.id)"
                      >
                        <ion-icon
                          [name]="showEarningsBreakdown[hb.id] ? 'chevron-up' : 'chevron-down'"
                          slot="end"
                        ></ion-icon>
                        {{ showEarningsBreakdown[hb.id] ? 'Hide Details' :
                        'Itemized' }}
                      </ion-button>
                    </div>

                    <!-- Earnings Breakdown (Collapsible) -->
                    <div
                      class="earnings-breakdown"
                      *ngIf="showEarningsBreakdown[hb.id]"
                    >
                      <div class="breakdown-item">
                        <span class="breakdown-label">Base Pay:</span>
                        <span class="breakdown-value"
                          >\${{ getEarningsBreakdown(hb).baseEarnings.toFixed(2)
                          }}</span
                        >
                      </div>
                      <div
                        class="breakdown-item"
                        *ngIf="getEarningsBreakdown(hb).streakBonus > 0"
                      >
                        <span class="breakdown-label">Streak Bonus:</span>
                        <span class="breakdown-value"
                          >+\${{ getEarningsBreakdown(hb).streakBonus.toFixed(2)
                          }}</span
                        >
                      </div>
                      <div
                        class="breakdown-item"
                        *ngIf="getEarningsBreakdown(hb).stockBoost > 0"
                      >
                        <span class="breakdown-label">Stock Boost:</span>
                        <span class="breakdown-value"
                          >+\${{ getEarningsBreakdown(hb).stockBoost.toFixed(2)
                          }}</span
                        >
                      </div>
                      <div class="breakdown-item breakdown-total">
                        <span class="breakdown-label">Total:</span>
                        <span class="breakdown-value"
                          >\${{ getEarningsBreakdown(hb).totalEarnings.toFixed(2)
                          }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Inline Year-Long Habit Grid (Expandable) -->
                  <div *ngIf="expandedGrids[hb.id]" class="inline-habit-grid">
                    <div>
                      <!-- DEBUG: Display businessId -->
                      <app-habit-grid
                        [businessId]="hb.id"
                        [businessName]="hb.business_name"
                        [businessEmoji]="hb.business_icon"
                        [businessType]="hb.business_types?.name || hb.business_name || ''"
                        [businessCreatedAt]="hb.created_at"
                        [isModal]="false"
                        [showStats]="true"
                        [useCalendarYear]="true"
                      >
                      </app-habit-grid>
                    </div>
                  </div>

                  <!-- Daily Check-in Action -->
                  <div class="checkin-action">
                    <!-- Complete button moved to header area next to calendar button -->
                  </div>
                </div>
              </div>
            </div>
          </ng-template>

          <!-- To-Do Group -->
          <div *ngIf="todoHabitBusinesses.length > 0" class="habit-group-section">
            <h4 class="habit-group-title">To-Do</h4>
            <div class="habit-businesses-container">
              <ng-container
                *ngFor="let hb of todoHabitBusinesses; let i = index; let last = last"
              >
                <ng-container
                  *ngTemplateOutlet="habitBusinessCard; context: { $implicit: hb, isFirst: i === 0, isLast: last }"
                ></ng-container>
              </ng-container>
            </div>
          </div>

          <!-- Done Group -->
          <div *ngIf="doneHabitBusinesses.length > 0" class="habit-group-section">
            <h4 class="habit-group-title">Done</h4>
            <div class="habit-businesses-container">
              <ng-container
                *ngFor="let hb of doneHabitBusinesses; let i = index; let last = last"
              >
                <ng-container
                  *ngTemplateOutlet="habitBusinessCard; context: { $implicit: hb, isFirst: i === 0, isLast: last }"
                ></ng-container>
              </ng-container>
            </div>
          </div>
        </div>

        <ng-template #noHabitBusinesses>
          <div class="empty-state">
            <ion-icon name="business" size="large" color="medium"></ion-icon>
            <h3>No habit-businesses yet</h3>
            <p>
              Create your first habit-business to start earning money from your
              habits!
            </p>
            <p class="tip">
              \u{1F4A1}
              <em
                >Each habit comes with its own business - buy the business, do
                the habit, earn money!</em
              >
            </p>
            <ion-button
              fill="solid"
              color="success"
              (click)="createNewHabitBusiness()"
            >
              <ion-icon name="add" slot="start"></ion-icon>
              Create Habit-Business
            </ion-button>
          </div>
        </ng-template>
      </div>
    </div>
  </div>
</ion-content>

<!-- Fixed Bottom Navigation -->
<app-bottom-nav></app-bottom-nav>
`, styles: ['/* src/app/home/home.page.scss */\nbutton,\nspan,\ndiv,\nion-button {\n  list-style: none !important;\n  list-style-type: none !important;\n}\nbutton::before,\nspan::before,\ndiv::before,\nion-button::before {\n  content: none !important;\n}\n.scrollable-content {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n  overflow-x: hidden;\n}\n.home-toolbar ion-title {\n  padding-inline-start: 12px;\n}\n.home-toolbar .header-action-btn {\n  --padding-start: 8px;\n  --padding-end: 8px;\n}\n.home-toolbar .receipt-coin {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  margin-inline-end: 6px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at 30% 30%,\n      #ffe985 0%,\n      #ffd700 45%,\n      #e6a800 100%);\n  color: #3a2a00;\n  font-size: 0.85rem;\n  font-weight: 800;\n  line-height: 1;\n  box-shadow:\n    0 0 6px rgba(255, 215, 0, 0.7),\n    0 0 14px rgba(255, 215, 0, 0.35),\n    inset 0 1px 1px rgba(255, 255, 255, 0.6),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.home-toolbar .receipt-btn:hover .receipt-coin,\n.home-toolbar .receipt-btn:focus-visible .receipt-coin {\n  transform: scale(1.12) rotate(-6deg);\n  box-shadow:\n    0 0 10px rgba(255, 215, 0, 0.9),\n    0 0 22px rgba(255, 215, 0, 0.5),\n    inset 0 1px 1px rgba(255, 255, 255, 0.7),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n}\n.home-toolbar .receipt-btn:active .receipt-coin {\n  transform: scale(0.95);\n}\n@media (max-width: 480px) {\n  .home-toolbar ion-title {\n    font-size: 1rem;\n    padding-inline-start: 8px;\n  }\n  .home-toolbar .header-action-btn {\n    --padding-start: 6px;\n    --padding-end: 6px;\n  }\n  .home-toolbar .header-action-btn .btn-label {\n    display: none;\n  }\n  .home-toolbar .header-action-btn ion-icon {\n    margin: 0;\n  }\n  .home-toolbar .receipt-coin {\n    margin-inline-end: 0;\n  }\n}\n.stats-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n  margin-bottom: 24px;\n  width: 100%;\n  padding: 0 16px;\n}\n.stats-grid .stat-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.stats-grid .stat-card.clickable-card {\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.stats-grid .stat-card.clickable-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.stats-grid .stat-card.clickable-card:active {\n  transform: translateY(0);\n}\n.stats-grid .stat-card ion-card-content {\n  padding: 16px;\n}\n.stats-grid .stat-card ion-card-content .stat-content {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.stats-grid .stat-card ion-card-content .stat-content ion-icon {\n  font-size: 2rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.stats-grid .stat-card ion-card-content .stat-content .stat-info h2 {\n  margin: 0;\n  font-size: 1.8rem;\n  font-weight: bold;\n  color: var(--cash-color);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.stats-grid .stat-card ion-card-content .stat-content .stat-info p {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n}\n.user-info {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n}\n.user-info .welcome-section {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n}\n.user-info .welcome-section .welcome-text h2 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info .welcome-section .welcome-text p {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.8);\n}\n.user-info .welcome-section .cash-display {\n  text-align: right;\n  display: flex;\n  align-items: flex-end;\n  gap: 16px;\n}\n.user-info .welcome-section .cash-display .networth-display {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #FFD700;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info .welcome-section .cash-display .networth-display:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 15px rgba(255, 215, 0, 0.4);\n  border-color: #FFED4E;\n}\n.user-info .welcome-section .cash-display .networth-display:active {\n  transform: translateY(0);\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info .welcome-section .cash-display .networth-display .networth-amount {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #FFD700;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);\n}\n.user-info .welcome-section .cash-display .networth-display .networth-label {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n.user-info .welcome-section .cash-display .networth-display .networth-label .click-hint {\n  font-size: 0.6rem;\n  opacity: 0.7;\n  font-weight: 400;\n  text-transform: lowercase;\n  letter-spacing: 0;\n}\n.user-info .welcome-section .cash-display .cash-section {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #00FF7F;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(0, 255, 127, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info .welcome-section .cash-display .cash-section:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 15px rgba(0, 255, 127, 0.4);\n  border-color: #4AFF85;\n}\n.user-info .welcome-section .cash-display .cash-section:active {\n  transform: translateY(0);\n  box-shadow: 0 0 8px rgba(0, 255, 127, 0.3);\n}\n.user-info .welcome-section .cash-display .cash-amount {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #00FF7F;\n  text-shadow: 0 0 8px rgba(0, 255, 127, 0.4);\n}\n.user-info .welcome-section .cash-display .cash-label {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n.user-info .welcome-section .cash-display .click-hint {\n  font-size: 0.6rem;\n  opacity: 0.7;\n  font-weight: 400;\n  text-transform: lowercase;\n  letter-spacing: 0;\n}\n@media (max-width: 480px) {\n  .user-info .welcome-section {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .user-info .welcome-section .cash-display {\n    width: 100%;\n    justify-content: space-between;\n    gap: 12px;\n    margin-top: 12px;\n  }\n  .user-info .welcome-section .cash-display .networth-display,\n  .user-info .welcome-section .cash-display .cash-section {\n    flex: 1;\n    align-items: center;\n    padding: 8px;\n  }\n  .user-info .welcome-section .cash-display .networth-amount,\n  .user-info .welcome-section .cash-display .cash-amount {\n    font-size: 1.1rem !important;\n  }\n}\n.quick-actions ion-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n}\n.quick-actions ion-card .action-buttons {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.quick-actions ion-card .action-buttons ion-button {\n  --border-radius: 10px;\n  font-weight: 600;\n}\n.quick-actions ion-card .action-buttons ion-button.button-solid {\n  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.my-habit-businesses .section-header {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 0 8px;\n}\n.my-habit-businesses .section-header h2 {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses .section-header ion-icon {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.my-habit-businesses .habit-business-item {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 12px 0;\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\n.my-habit-businesses .habit-business-item::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      var(--ion-color-primary),\n      transparent);\n  opacity: 0.6;\n}\n.my-habit-businesses .habit-business-item .item-content {\n  display: block;\n  min-width: 0;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info {\n  min-width: 0;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .card-header-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .business-title-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .business-icon {\n  font-size: 2.2rem;\n  flex-shrink: 0;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .card-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-items: center;\n  justify-content: center;\n  row-gap: 8px;\n  width: 100%;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .business-name {\n  margin: 0;\n  font-size: 1.2rem;\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n  min-width: 0;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-description {\n  margin: 0 0 12px 0;\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  line-height: 1.4;\n  text-align: center;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-day-chips {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-period-status {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n  justify-content: center;\n  margin-top: 8px;\n  font-size: 0.78rem;\n  color: rgba(255, 255, 255, 0.55);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-period-status .period-progress {\n  font-weight: 600;\n  color: rgba(255, 255, 255, 0.75);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: 16px;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-label {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 2px;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value {\n  font-weight: bold;\n  font-size: 0.9rem;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value.streak {\n  color: var(--streak-color);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value.total-earned {\n  color: var(--earnings-color);\n  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section {\n  margin-top: 16px;\n  padding: 16px;\n  background: rgba(0, 255, 136, 0.05);\n  border: 1px solid rgba(0, 255, 136, 0.2);\n  border-radius: 8px;\n  width: 100%;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .total-amount {\n  font-size: 1.3rem;\n  font-weight: bold;\n  color: var(--earnings-color);\n  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .earnings-label {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 4px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total ion-button {\n  --color: rgba(255, 255, 255, 0.7);\n  --padding-top: 4px;\n  --padding-bottom: 4px;\n  font-size: 0.7rem;\n  margin: 0;\n  height: auto;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total ion-button:hover {\n  --color: rgba(255, 255, 255, 0.9);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown {\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  padding: 8px;\n  margin-top: 8px;\n  font-size: 0.75rem;\n  min-width: 140px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 4px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-item:last-child {\n  margin-bottom: 0;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-item .breakdown-label {\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.7rem;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-item .breakdown-value {\n  color: var(--earnings-color);\n  font-weight: 600;\n  font-size: 0.7rem;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-item.breakdown-total {\n  border-top: 1px solid rgba(255, 255, 255, 0.2);\n  padding-top: 4px;\n  margin-top: 4px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-item.breakdown-total .breakdown-label {\n  font-weight: bold;\n  color: rgba(255, 255, 255, 0.9);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-item.breakdown-total .breakdown-value {\n  font-weight: bold;\n  font-size: 0.8rem;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-breakdown .breakdown-divider {\n  height: 1px;\n  background: rgba(255, 255, 255, 0.1);\n  margin: 4px 0;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-per-completion {\n  font-size: 1.3rem;\n  font-weight: bold;\n  color: var(--earnings-color);\n  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-label {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action {\n  margin-top: 8px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  padding: 8px 16px;\n  background: #FFB800;\n  color: #000000;\n  border: none;\n  border-radius: 8px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  cursor: pointer;\n  user-select: none;\n  -webkit-user-select: none;\n  -webkit-tap-highlight-color: transparent;\n  overflow: hidden;\n  transition: all 0.2s ease;\n  box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3);\n  min-width: 100px;\n  width: 100px;\n  height: 36px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button .hold-progress {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  background:\n    linear-gradient(\n      90deg,\n      #22C55E,\n      #16A34A);\n  transition: width 0.05s ease-out;\n  z-index: 1;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button .undo-progress {\n  position: absolute;\n  top: 0;\n  right: 0;\n  height: 100%;\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800);\n  transition: width 0.05s ease-out;\n  z-index: 1;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button .button-icon,\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button .button-text {\n  position: relative;\n  z-index: 2;\n  pointer-events: none;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button .button-icon {\n  font-size: 1rem;\n  color: inherit;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button .button-text {\n  font-size: inherit;\n  font-weight: inherit;\n  color: inherit;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button:hover:not(.is-holding):not(.is-completing):not(.is-undo-mode):not(.is-undoing) {\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(255, 184, 0, 0.4);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button:active:not(.is-undo-mode):not(.is-undoing),\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-holding {\n  transform: translateY(0);\n  box-shadow: 0 1px 4px rgba(255, 184, 0, 0.2);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-completing {\n  background: #22C55E;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-completing .hold-progress {\n  width: 100% !important;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-undo-mode {\n  background: #22C55E;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-undo-mode:hover:not(.is-undoing) {\n  background: #16A34A;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-undo-mode:active:not(.is-undoing),\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-undo-mode.is-undoing {\n  transform: translateY(0);\n  background: #15803D;\n  box-shadow: 0 1px 4px rgba(34, 197, 94, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-undo-mode .hold-progress {\n  display: none;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-undoing {\n  background: #22C55E;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button.is-undoing .undo-progress {\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .hold-complete-button:focus {\n  outline: none;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .business-header-actions .hold-complete-button,\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action div[style*=flex] .hold-complete-button {\n  background: #FFB800 !important;\n  color: #000000 !important;\n  border: none !important;\n  font-weight: 600 !important;\n  box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3) !important;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .business-header-actions .hold-complete-button.is-undo-mode,\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action div[style*=flex] .hold-complete-button.is-undo-mode {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .business-header-actions .hold-complete-button.is-completing,\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action div[style*=flex] .hold-complete-button.is-completing {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action ion-button {\n  --border-radius: 8px;\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action ion-button[color=success] {\n  --background: var(--earnings-color);\n  --color: #000000;\n  --box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .completed-badge {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 12px;\n  background: rgba(0, 255, 136, 0.1);\n  border: 1px solid rgba(0, 255, 136, 0.3);\n  border-radius: 8px;\n  color: var(--earnings-color);\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action .completed-badge ion-icon {\n  font-size: 1.1rem;\n}\n.my-habit-businesses .empty-state {\n  text-align: center;\n  padding: 40px 20px;\n}\n.my-habit-businesses .empty-state ion-icon {\n  font-size: 4rem;\n  color: var(--ion-color-medium);\n  margin-bottom: 16px;\n  opacity: 0.6;\n}\n.my-habit-businesses .empty-state h3 {\n  color: rgba(255, 255, 255, 0.8);\n  margin: 0 0 12px 0;\n  font-size: 1.2rem;\n}\n.my-habit-businesses .empty-state p {\n  color: rgba(255, 255, 255, 0.6);\n  margin: 0 0 8px 0;\n  line-height: 1.5;\n}\n.my-habit-businesses .empty-state p.tip {\n  font-style: italic;\n  margin-bottom: 24px;\n}\n.my-habit-businesses .empty-state ion-button {\n  --border-radius: 8px;\n  --padding-start: 20px;\n  --padding-end: 20px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  margin-top: 16px;\n  font-size: 0.95rem;\n  font-weight: 600;\n  height: 44px;\n  width: auto;\n}\n.my-habit-businesses .empty-state ion-button .button-native {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n}\n.my-habit-businesses .empty-state ion-button ion-icon {\n  font-size: 1.1rem;\n  margin-right: 8px;\n  display: inline-flex;\n  align-items: center;\n  vertical-align: middle;\n}\n.my-habit-businesses .empty-state ion-button[color=success] {\n  --box-shadow: 0 3px 10px rgba(var(--ion-color-success-rgb), 0.3);\n}\n.todays-habits .habit-item {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 8px 0;\n  padding: 12px 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.todays-habits .habit-item .habit-content {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.todays-habits .habit-item .habit-content .habit-info {\n  flex: 1;\n}\n.todays-habits .habit-item .habit-content .habit-info .habit-name {\n  margin: 0 0 4px 0;\n  font-weight: 600;\n  color: #ffffff;\n}\n.todays-habits .habit-item .habit-content .habit-info .habit-earnings {\n  font-size: 0.9rem;\n  color: var(--earnings-color);\n  font-weight: 500;\n}\n.todays-habits .habit-item .habit-content ion-checkbox {\n  --size: 24px;\n  --checkmark-color: #000000;\n  --background-checked: var(--earnings-color);\n  --border-color-checked: var(--earnings-color);\n}\n@media (min-width: 768px) {\n  .stats-grid {\n    grid-template-columns: repeat(3, 1fr);\n    gap: 20px;\n    padding: 0 20px;\n  }\n  .user-info .welcome-section .welcome-text h2 {\n    font-size: 1.6rem;\n  }\n  .user-info .welcome-section .cash-display .cash-amount {\n    font-size: 1.3rem;\n  }\n  .habit-business-item .item-content .business-icon {\n    font-size: 3rem;\n  }\n  .habit-business-item .item-content .business-info .business-name {\n    font-size: 1.4rem;\n  }\n  .habit-business-item .item-content .business-info .habit-stats {\n    gap: 24px;\n  }\n  .habit-business-item .item-content .earnings-section {\n    margin-top: 16px;\n    padding: 16px;\n    background: rgba(0, 255, 136, 0.05);\n    border: 1px solid rgba(0, 255, 136, 0.2);\n    border-radius: 8px;\n    width: 100%;\n  }\n  .habit-business-item .item-content .earnings-section .earnings-total {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 4px;\n  }\n}\n.habit-grid-modal ion-modal {\n  --width: 100%;\n  --height: 100%;\n  --border-radius: 0;\n  --background: rgba(0, 0, 0, 0.95);\n}\n.habit-grid-modal .modal-wrapper {\n  overflow: hidden;\n}\n@media (min-width: 768px) {\n  .habit-grid-modal ion-modal {\n    --width: 98%;\n    --height: 95%;\n    --border-radius: 12px;\n    --background: rgba(0, 0, 0, 0.95);\n    border: 1px solid rgba(255, 215, 0, 0.3);\n  }\n}\n@media (min-width: 1024px) {\n  .habit-grid-modal ion-modal {\n    --width: 95%;\n    --height: 90%;\n    max-width: none;\n    min-width: 1200px;\n  }\n}\n@media (min-width: 1200px) {\n  .habit-grid-modal ion-modal {\n    --width: 92%;\n    --height: 85%;\n    min-width: 1400px;\n  }\n}\n@media (min-width: 1600px) {\n  .habit-grid-modal ion-modal {\n    --width: 88%;\n    --height: 80%;\n    min-width: 1600px;\n  }\n}\n.habit-grid-modal .modal-footer {\n  padding: 20px;\n  border-top: 1px solid rgba(255, 215, 0, 0.2);\n  background: rgba(0, 0, 0, 0.3);\n  margin-top: auto;\n}\n.habit-grid-modal .close-button {\n  margin-top: 0 !important;\n  --color: #ffffff !important;\n  --color-hover: #ffd700 !important;\n  --color-focused: #ffd700 !important;\n  --background-hover: rgba(255, 215, 0, 0.1) !important;\n  --border-color: rgba(255, 215, 0, 0.3) !important;\n  height: 48px !important;\n  font-size: 16px !important;\n  font-weight: 500 !important;\n  text-transform: uppercase !important;\n  letter-spacing: 0.5px !important;\n}\n.inline-habit-grid {\n  display: flex;\n  justify-content: center;\n  margin-top: 16px;\n}\n.inline-habit-grid > div {\n  display: inline-block;\n  padding: 16px;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 8px;\n  border-top: 1px solid rgba(255, 215, 0, 0.2);\n  max-width: 100%;\n  overflow-x: auto;\n}\n@media (max-width: 480px) {\n  .inline-habit-grid app-habit-grid {\n    --grid-size: 7px;\n  }\n}\n@media (max-width: 768px) {\n  .stats-grid {\n    gap: 8px;\n    padding: 0 12px;\n  }\n  .hold-complete-button {\n    min-width: 100px !important;\n    width: 100px !important;\n    height: 34px !important;\n    padding: 7px 14px !important;\n    font-size: 0.75rem !important;\n  }\n  .hold-complete-button .button-icon {\n    font-size: 0.95rem !important;\n  }\n  .hold-complete-button::before {\n    content: "";\n    position: absolute;\n    top: -8px;\n    left: -8px;\n    right: -8px;\n    bottom: -8px;\n    z-index: -1;\n  }\n  .earnings-toggle-button {\n    width: 32px !important;\n    height: 32px !important;\n  }\n  .earnings-toggle-button .dollar-icon {\n    font-size: 1rem !important;\n  }\n  .habit-business-item .item-content .business-info .card-header-row {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 4px;\n  }\n  .habit-business-item .item-content .business-info .card-actions {\n    justify-content: center;\n  }\n  .habit-business-item .item-content .business-info ion-button[color=warning],\n  .habit-business-item .item-content .business-info ion-button[color=danger] {\n    --padding-start: 8px !important;\n    --padding-end: 8px !important;\n  }\n  .habit-business-item .item-content .business-info ion-button[color=tertiary],\n  .habit-business-item .item-content .business-info ion-button ion-icon[name=create] {\n    font-size: 1.1rem;\n  }\n  .inline-habit-grid app-habit-grid {\n    margin: 0 !important;\n    padding: 0 !important;\n    width: 100% !important;\n    display: block !important;\n  }\n  .inline-habit-grid app-habit-grid ::ng-deep .content-wrapper {\n    width: 100% !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    display: block !important;\n  }\n  .inline-habit-grid app-habit-grid ::ng-deep .habit-grid-container {\n    width: 100% !important;\n    max-width: 100% !important;\n    padding: 8px 4px !important;\n    margin: 0 !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n  }\n}\n@media (min-width: 769px) {\n  .desktop-stats {\n    display: grid;\n  }\n  .mobile-stats-carousel {\n    display: none;\n  }\n}\n@media (max-width: 768px) {\n  .desktop-stats {\n    display: none;\n  }\n  .mobile-stats-carousel {\n    display: block;\n  }\n  .mobile-stats-carousel .carousel-container {\n    position: relative;\n    width: 100%;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card {\n    margin: 0;\n    width: 100%;\n    min-height: 100px;\n    background: var(--business-item-background);\n    border: var(--business-item-border);\n    border-radius: 12px;\n    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card.clickable-card {\n    cursor: pointer;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card.clickable-card:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card.clickable-card:active {\n    transform: translateY(0);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    justify-content: center;\n    text-align: center;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content ion-icon {\n    font-size: 28px;\n    min-width: 36px;\n    color: var(--ion-color-primary);\n    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content .stat-info h2 {\n    margin: 0;\n    font-size: 1.5rem;\n    font-weight: bold;\n    color: var(--cash-color);\n    text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content .stat-info p {\n    margin: 4px 0 0 0;\n    font-size: 1rem;\n    color: rgba(255, 255, 255, 0.8);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-indicators {\n    display: flex;\n    justify-content: center;\n    gap: 8px;\n    margin-top: 12px;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-indicators .indicator {\n    width: 8px;\n    height: 8px;\n    border-radius: 50%;\n    background-color: var(--ion-color-light);\n    cursor: pointer;\n    transition: background-color 0.2s ease;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-indicators .indicator.active {\n    background-color: var(--ion-color-primary);\n  }\n}\n@media (max-width: 480px) {\n  .stats-grid {\n    grid-template-columns: 1fr;\n    gap: 12px;\n    padding: 0 16px;\n  }\n  .stats-grid .stat-card ion-card-content {\n    padding: 14px;\n  }\n  .stats-grid .stat-card ion-card-content .stat-content {\n    gap: 10px;\n  }\n  .stats-grid .stat-card ion-card-content .stat-content ion-icon {\n    font-size: 1.8rem;\n  }\n  .stats-grid .stat-card ion-card-content .stat-content .stat-info h2 {\n    font-size: 1.6rem;\n  }\n  .stats-grid .stat-card ion-card-content .stat-content .stat-info p {\n    font-size: 0.85rem;\n  }\n}\n.hold-complete-button {\n  position: relative !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  padding: 8px 16px !important;\n  background: #FFB800 !important;\n  color: #000000 !important;\n  border: none !important;\n  border-radius: 8px !important;\n  font-size: 0.75rem !important;\n  font-weight: 600 !important;\n  cursor: pointer !important;\n  user-select: none !important;\n  -webkit-user-select: none !important;\n  -webkit-tap-highlight-color: transparent !important;\n  overflow: hidden !important;\n  transition: all 0.2s ease !important;\n  box-shadow: 0 2px 8px rgba(255, 184, 0, 0.3) !important;\n  min-width: 100px !important;\n  width: 100px !important;\n  height: 36px !important;\n}\n.hold-complete-button .hold-progress {\n  position: absolute !important;\n  top: 0 !important;\n  left: 0 !important;\n  height: 100% !important;\n  background:\n    linear-gradient(\n      90deg,\n      #22C55E,\n      #16A34A) !important;\n  transition: width 0.05s ease-out !important;\n  z-index: 1 !important;\n}\n.hold-complete-button .undo-progress {\n  position: absolute !important;\n  top: 0 !important;\n  right: 0 !important;\n  height: 100% !important;\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800) !important;\n  transition: width 0.05s ease-out !important;\n  z-index: 1 !important;\n}\n.hold-complete-button .button-icon,\n.hold-complete-button .button-text {\n  position: relative !important;\n  z-index: 2 !important;\n  pointer-events: none !important;\n  color: inherit !important;\n  list-style: none !important;\n  list-style-type: none !important;\n}\n.hold-complete-button .button-icon::before,\n.hold-complete-button .button-icon::after,\n.hold-complete-button .button-text::before,\n.hold-complete-button .button-text::after {\n  display: none !important;\n  content: none !important;\n}\n.hold-complete-button .button-text {\n  margin: 0 !important;\n  padding: 0 !important;\n  list-style: none !important;\n  list-style-type: none !important;\n  text-indent: 0 !important;\n}\n.hold-complete-button .button-text::before {\n  display: none !important;\n  content: none !important;\n}\n.hold-complete-button .button-text::after {\n  display: none !important;\n  content: none !important;\n}\n.hold-complete-button .button-icon {\n  font-size: 1rem !important;\n}\n.hold-complete-button.is-completing {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.hold-complete-button.is-completing .hold-progress {\n  width: 100% !important;\n}\n.hold-complete-button.is-undo-mode {\n  background: #22C55E !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;\n}\n.hold-complete-button.is-undo-mode .hold-progress {\n  display: none !important;\n}\n.hold-complete-button.is-undoing {\n  background: #22C55E !important;\n}\n.hold-complete-button.is-undoing .undo-progress {\n  background:\n    linear-gradient(\n      270deg,\n      #FFB800,\n      #FF8800) !important;\n}\n.hold-complete-button:hover:not(.is-holding):not(.is-completing):not(.is-undo-mode):not(.is-undoing) {\n  transform: translateY(-1px) !important;\n  box-shadow: 0 4px 12px rgba(255, 184, 0, 0.4) !important;\n}\n.hold-complete-button.is-undo-mode:hover:not(.is-undoing) {\n  background: #16A34A !important;\n  transform: translateY(-1px) !important;\n  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5) !important;\n}\n.earnings-toggle-button {\n  position: relative !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  width: 36px !important;\n  height: 36px !important;\n  background: #22C55E !important;\n  border: none !important;\n  border-radius: 8px !important;\n  cursor: pointer !important;\n  user-select: none !important;\n  -webkit-user-select: none !important;\n  -webkit-tap-highlight-color: transparent !important;\n  transition: all 0.2s ease !important;\n  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3) !important;\n}\n.earnings-toggle-button .dollar-icon {\n  font-size: 1.2rem !important;\n  color: #FFFFFF !important;\n  pointer-events: none !important;\n}\n.earnings-toggle-button:hover {\n  background: #16A34A !important;\n  transform: translateY(-1px) !important;\n  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4) !important;\n}\n.earnings-toggle-button:active {\n  transform: translateY(0) !important;\n  background: #15803D !important;\n  box-shadow: 0 1px 4px rgba(34, 197, 94, 0.2) !important;\n}\n.back-button {\n  background: rgba(255, 140, 0, 0.1);\n  border: 1px solid rgba(255, 140, 0, 0.3);\n  border-radius: 6px;\n  padding: 8px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 36px;\n  height: 36px;\n}\n.back-button .back-icon {\n  font-size: 1.2rem;\n  color: var(--ion-color-warning);\n}\n.back-button:hover {\n  background: rgba(255, 140, 0, 0.2);\n  border-color: rgba(255, 140, 0, 0.5);\n  transform: translateY(-1px);\n}\n.back-button:active {\n  transform: translateY(0);\n  background: rgba(255, 140, 0, 0.3);\n}\n.help-icon-container {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 16px;\n  cursor: pointer;\n}\n.help-icon-container ion-icon,\n.help-icon-container .help-icon {\n  font-size: 1.4rem;\n  color: var(--ion-color-medium);\n  transition: color 0.2s ease;\n}\n.help-icon-container ion-icon:hover,\n.help-icon-container .help-icon:hover {\n  color: var(--ion-color-primary);\n}\n.help-icon-container .help-text {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  transition: color 0.2s ease;\n}\n.help-icon-container:hover .help-text,\n.help-icon-container:hover ion-icon,\n.help-icon-container:hover .help-icon {\n  color: var(--ion-color-primary);\n}\n.section-header-container .section-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 24px 8px 16px 0;\n}\n.section-header-container .section-header ion-icon {\n  font-size: 1.3rem;\n  color: var(--ion-color-primary);\n}\n.section-header-container .section-header h2 {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.3rem;\n  font-weight: 600;\n}\n.section-header-container .section-header .help-text {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  cursor: pointer;\n  transition: color 0.2s ease;\n}\n.section-header-container .section-header:hover .help-text {\n  color: var(--ion-color-primary);\n}\n.habit-progress-section .section-header {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin: 0 16px 16px 16px;\n}\n.habit-progress-section .section-header ion-icon {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n}\n.habit-progress-section .section-header h2 {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.3rem;\n  font-weight: 600;\n}\n.habit-progress-section .section-header .help-text {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  cursor: pointer;\n  transition: color 0.2s ease;\n}\n.habit-progress-section .section-header:hover .help-text {\n  color: var(--ion-color-primary);\n}\n.info-card {\n  margin: 16px;\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.info-card .info-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.info-card .info-header .info-title-section {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.info-card .info-header .info-title-section ion-icon {\n  font-size: 1.5rem;\n}\n.info-card .info-header .info-title-section h3 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.1rem;\n  font-weight: 600;\n}\n.info-card .info-header ion-button {\n  --padding-start: 8px;\n  --padding-end: 8px;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n  min-width: 32px;\n  min-height: 32px;\n}\n.info-card .info-header ion-button ion-icon {\n  font-size: 1.2rem;\n}\n.info-card .info-content p {\n  margin: 0 0 8px 0;\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n.info-card .info-content ul {\n  margin: 8px 0;\n  padding-left: 16px;\n}\n.info-card .info-content ul li {\n  margin: 4px 0;\n  font-size: 0.85rem;\n  line-height: 1.3;\n}\n.info-card .info-content ul li strong {\n  color: var(--ion-color-primary);\n}\n.info-card .info-content em {\n  font-size: 0.85rem;\n  color: var(--ion-color-success);\n  font-weight: 500;\n}\n.info-card .info-content .disclaimer {\n  margin-top: 12px !important;\n  padding: 8px 12px;\n  background: rgba(var(--ion-color-warning-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-warning-rgb), 0.3);\n  border-radius: 6px;\n  font-size: 0.8rem !important;\n  line-height: 1.3;\n  color: var(--ion-color-medium);\n}\n.info-card .info-content .disclaimer strong {\n  color: var(--ion-color-warning);\n}\n.habit-group-section .habit-group-title {\n  margin: 20px 0 8px;\n  font-size: 0.9rem;\n  font-weight: 700;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n  color: var(--ion-color-medium);\n}\n.habit-group-section:first-of-type .habit-group-title {\n  margin-top: 8px;\n}\n.habit-business-item {\n  position: relative;\n}\n.habit-business-item .reorder-controls {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 0;\n  flex-shrink: 0;\n}\n.habit-business-item .reorder-controls .reorder-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 20px;\n  border: none;\n  background: transparent;\n  color: var(--ion-color-medium);\n  cursor: pointer;\n  border-radius: 6px;\n}\n.habit-business-item .reorder-controls .reorder-btn ion-icon {\n  font-size: 16px;\n  pointer-events: none;\n}\n.habit-business-item .reorder-controls .reorder-btn:hover:not(:disabled) {\n  color: var(--ion-color-primary);\n  background: rgba(255, 255, 255, 0.06);\n}\n.habit-business-item .reorder-controls .reorder-btn:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n.habit-business-item .item-content {\n  flex: 1;\n}\n/*# sourceMappingURL=home.page.css.map */\n'] }]
  }], () => [{ type: Router }, { type: AuthService }, { type: SettingsService }, { type: AdminService }, { type: HabitBusinessService }, { type: HabitUpdateService }, { type: ToastController }, { type: AlertController }, { type: ModalController }, { type: HabitIntervalService }, { type: CountdownTickService }], { onResize: [{
    type: HostListener,
    args: ["window:resize", ["$event"]]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HomePage, { className: "HomePage", filePath: "src/app/home/home.page.ts", lineNumber: 31 });
})();
export {
  HomePage
};
//# sourceMappingURL=home.page-SV7G45DL.js.map
