import {
  SocialService
} from "./chunk-LXARDG3Y.js";
import {
  HabitGridComponent
} from "./chunk-42SKT4UA.js";
import {
  BottomNavComponent
} from "./chunk-R6NCSAED.js";
import {
  HabitBusinessService
} from "./chunk-257QJYN5.js";
import {
  add,
  addCircle,
  addIcons,
  alertCircle,
  arrowBack,
  business,
  cash,
  checkmarkCircle,
  chevronBack,
  chevronForward,
  close,
  closeCircle,
  funnel,
  helpCircle,
  helpCircleOutline,
  logOut,
  pieChart,
  pieChartOutline,
  remove,
  removeCircle,
  settings,
  star,
  swapHorizontal,
  trendingDown,
  trendingUp,
  trendingUpOutline,
  wallet
} from "./chunk-DTAWB6F7.js";
import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  AlertController,
  CommonModule,
  Component,
  FormsModule,
  HostListener,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  NgControlStatus,
  NgForOf,
  NgIf,
  NgModel,
  Router,
  RouterLink,
  ToastController,
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
  ɵɵresolveWindow,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
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
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-QXFS4N4X.js";

// src/app/stocks/stocks.page.ts
function StocksPage_ion_button_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 29);
    \u0275\u0275listener("click", function StocksPage_ion_button_4_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openWeeklyReceipt());
    });
    \u0275\u0275elementStart(1, "span", 30);
    \u0275\u0275text(2, "$");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 31);
    \u0275\u0275text(4, "Receipt");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_ion_button_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-button", 32);
    \u0275\u0275element(1, "ion-icon", 33);
    \u0275\u0275elementEnd();
  }
}
function StocksPage_ion_button_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 34);
    \u0275\u0275listener("click", function StocksPage_ion_button_6_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.logout());
    });
    \u0275\u0275element(1, "ion-icon", 35);
    \u0275\u0275text(2, " Logout ");
    \u0275\u0275elementEnd();
  }
}
function StocksPage_div_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 36)(1, "div", 37);
    \u0275\u0275listener("click", function StocksPage_div_16_Template_div_click_1_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleNetWorthDisplay());
    });
    \u0275\u0275elementStart(2, "div", 38);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 39);
    \u0275\u0275text(5, "NET WORTH");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 40);
    \u0275\u0275listener("click", function StocksPage_div_16_Template_div_click_6_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleCashDisplay());
    });
    \u0275\u0275elementStart(7, "div", 41);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 42);
    \u0275\u0275text(10, "HABIT CASH");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" $", ctx_r1.getDisplayedNetWorth(), " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("$", ctx_r1.getDisplayedCash());
  }
}
function StocksPage_div_51_ion_select_option_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-select-option", 61);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const owner_r6 = ctx.$implicit;
    \u0275\u0275property("value", owner_r6);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", owner_r6, " ");
  }
}
function StocksPage_div_51_div_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 62)(1, "div", 63)(2, "span", 64);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-button", 65);
    \u0275\u0275listener("click", function StocksPage_div_51_div_16_Template_ion_button_click_4_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.clearOwnerFilter());
    });
    \u0275\u0275element(5, "ion-icon", 66);
    \u0275\u0275text(6, " Clear Filter ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate2(" ", ctx_r1.getFilteredBusinesses().length, " of ", ctx_r1.friendBusinesses.length, " stocks ");
  }
}
function StocksPage_div_51_div_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 67)(1, "ion-icon", 68);
    \u0275\u0275listener("click", function StocksPage_div_51_div_17_Template_ion_icon_click_1_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleHelpSection());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 69);
    \u0275\u0275listener("click", function StocksPage_div_51_div_17_Template_span_click_2_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleHelpSection());
    });
    \u0275\u0275text(3, "How dividends work");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_div_51_ion_card_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 70)(1, "ion-card-content")(2, "div", 71)(3, "div", 72);
    \u0275\u0275element(4, "ion-icon", 73);
    \u0275\u0275elementStart(5, "h3");
    \u0275\u0275text(6, "How Stock Dividends Work");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "ion-button", 74);
    \u0275\u0275listener("click", function StocksPage_div_51_ion_card_18_Template_ion_button_click_7_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleHelpSection());
    });
    \u0275\u0275element(8, "ion-icon", 75);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 76)(10, "div")(11, "p");
    \u0275\u0275text(12, " Each time a business owner completes their habit, stockholders receive dividends! Dividend amount depends on: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "ul")(14, "li")(15, "strong");
    \u0275\u0275text(16, "Base earnings:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(17, " 10% of habit completion value ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "li")(19, "strong");
    \u0275\u0275text(20, "Streak bonus:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(21, " +1% per day (up to 100% bonus) ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "li")(23, "strong");
    \u0275\u0275text(24, "Your ownership:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(25, " Percentage of shares you own ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "p")(27, "em");
    \u0275\u0275text(28, "Higher streaks = higher dividends!");
    \u0275\u0275elementEnd()()()()()();
  }
}
function StocksPage_div_51_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 77);
    \u0275\u0275element(1, "ion-spinner", 78);
    \u0275\u0275elementStart(2, "p");
    \u0275\u0275text(3, "Loading stocks...");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_div_51_div_21_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 80)(1, "div", 81)(2, "div", 82);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 83)(5, "div", 84)(6, "h3", 85);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 86)(9, "span", 87);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(11, "div", 88)(12, "div", 89);
    \u0275\u0275text(13, "Business Owner:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "div", 90);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "div", 91)(17, "div", 92)(18, "div", 93);
    \u0275\u0275text(19, "Streak");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 94);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "div", 92)(23, "div", 93);
    \u0275\u0275text(24, "Available");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "div", 95);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "div", 92)(28, "div", 93);
    \u0275\u0275text(29, "Expected/Share");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "div", 96);
    \u0275\u0275text(31);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(32, "div", 97);
    \u0275\u0275element(33, "app-habit-grid", 98);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(34, "div", 99);
    \u0275\u0275elementStart(35, "div", 100)(36, "div", 101)(37, "div", 102);
    \u0275\u0275text(38);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "div", 103);
    \u0275\u0275text(40, "per share");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(41, "div", 104)(42, "ion-button", 105);
    \u0275\u0275listener("click", function StocksPage_div_51_div_21_div_1_Template_ion_button_click_42_listener() {
      const business_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.openBuyModal(business_r11));
    });
    \u0275\u0275element(43, "ion-icon", 106);
    \u0275\u0275text(44, " Buy Shares ");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const business_r11 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", business_r11.businessIcon || "\u{1F3E2}", " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(business_r11.businessName);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("$", (business_r11.stockPrice == null ? null : business_r11.stockPrice.toFixed(2)) || "0.00");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(business_r11.ownerName);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" ", business_r11.streak, " days ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", business_r11.sharesAvailable, " shares ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" $", (business_r11.potentialDividend == null ? null : business_r11.potentialDividend.toFixed(2)) || "0.00", " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("businessId", business_r11.id)("businessName", business_r11.businessName)("businessEmoji", business_r11.businessIcon)("businessType", "Stock")("isModal", false)("showStats", false)("useCalendarYear", true)("size", "medium")("isStockView", true);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" $", (business_r11.stockPrice == null ? null : business_r11.stockPrice.toFixed(2)) || "0.00", " ");
    \u0275\u0275advance(4);
    \u0275\u0275property("disabled", ctx_r1.isLoading || !business_r11.stockId || business_r11.sharesAvailable <= 0);
  }
}
function StocksPage_div_51_div_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275template(1, StocksPage_div_51_div_21_div_1_Template, 45, 18, "div", 79);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.getFilteredBusinesses());
  }
}
function StocksPage_div_51_div_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 77);
    \u0275\u0275element(1, "ion-icon", 107);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "No Stocks Match Filter");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, " No stocks found for the selected owner. Try selecting a different owner or clear the filter. ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 108);
    \u0275\u0275listener("click", function StocksPage_div_51_div_22_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.clearOwnerFilter());
    });
    \u0275\u0275element(7, "ion-icon", 66);
    \u0275\u0275text(8, " Clear Filter ");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_div_51_div_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 77);
    \u0275\u0275element(1, "ion-icon", 109);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "No Stocks Available");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, " Your friends haven't set up any habit businesses yet, or you've already invested in all available opportunities! ");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_div_51_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 43)(1, "div", 44);
    \u0275\u0275element(2, "ion-icon", 45);
    \u0275\u0275elementStart(3, "h2");
    \u0275\u0275text(4, "Available Stocks");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 46)(6, "div", 47)(7, "div", 48)(8, "ion-item", 49)(9, "ion-label", 50);
    \u0275\u0275text(10, "Filter by Owner");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "ion-select", 51);
    \u0275\u0275twoWayListener("ngModelChange", function StocksPage_div_51_Template_ion_select_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.selectedOwnerFilter, $event) || (ctx_r1.selectedOwnerFilter = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ionChange", function StocksPage_div_51_Template_ion_select_ionChange_11_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onOwnerFilterChange());
    });
    \u0275\u0275elementStart(12, "ion-select-option", 52);
    \u0275\u0275text(13, "All Owners");
    \u0275\u0275elementEnd();
    \u0275\u0275template(14, StocksPage_div_51_ion_select_option_14_Template, 2, 2, "ion-select-option", 53);
    \u0275\u0275elementEnd();
    \u0275\u0275element(15, "ion-icon", 54);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(16, StocksPage_div_51_div_16_Template, 7, 2, "div", 55);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(17, StocksPage_div_51_div_17_Template, 4, 0, "div", 56)(18, StocksPage_div_51_ion_card_18_Template, 29, 0, "ion-card", 57)(19, StocksPage_div_51_div_19_Template, 4, 0, "div", 58);
    \u0275\u0275elementStart(20, "div", 59);
    \u0275\u0275template(21, StocksPage_div_51_div_21_Template, 2, 1, "div", 60);
    \u0275\u0275elementEnd();
    \u0275\u0275template(22, StocksPage_div_51_div_22_Template, 9, 0, "div", 58)(23, StocksPage_div_51_div_23_Template, 6, 0, "div", 58);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(11);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.selectedOwnerFilter);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngForOf", ctx_r1.getUniqueOwners());
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r1.getFilteredBusinesses().length !== ctx_r1.friendBusinesses.length);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.showHelpSection);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.showHelpSection);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.isLoading);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !ctx_r1.isLoading && ctx_r1.getFilteredBusinesses().length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.isLoading && ctx_r1.getFilteredBusinesses().length === 0 && ctx_r1.friendBusinesses.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.isLoading && ctx_r1.friendBusinesses.length === 0);
  }
}
function StocksPage_div_52_div_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 67)(1, "ion-icon", 68);
    \u0275\u0275listener("click", function StocksPage_div_52_div_5_Template_ion_icon_click_1_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.togglePortfolioHelpSection());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 69);
    \u0275\u0275listener("click", function StocksPage_div_52_div_5_Template_span_click_2_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.togglePortfolioHelpSection());
    });
    \u0275\u0275text(3, "How portfolios work");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_div_52_ion_card_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 70)(1, "ion-card-content")(2, "div", 71)(3, "div", 72);
    \u0275\u0275element(4, "ion-icon", 111);
    \u0275\u0275elementStart(5, "h3");
    \u0275\u0275text(6, "How Your Portfolio Works");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "ion-button", 74);
    \u0275\u0275listener("click", function StocksPage_div_52_ion_card_6_Template_ion_button_click_7_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.togglePortfolioHelpSection());
    });
    \u0275\u0275element(8, "ion-icon", 75);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 76)(10, "div")(11, "p");
    \u0275\u0275text(12, " Your portfolio shows all the stocks you own and tracks your investment performance: ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "ul")(14, "li")(15, "strong");
    \u0275\u0275text(16, "Portfolio Value:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(17, " Total current worth of all your stocks ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "li")(19, "strong");
    \u0275\u0275text(20, "Profit/Loss:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(21, " How much you've gained or lost since buying ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "li")(23, "strong");
    \u0275\u0275text(24, "Daily Dividends:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(25, " Money earned from other users completing habits ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "li")(27, "strong");
    \u0275\u0275text(28, "Stock Performance:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(29, " Track individual stock gains and losses ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "p")(31, "em");
    \u0275\u0275text(32, "Diversify your investments for steady passive income!");
    \u0275\u0275elementEnd()()()()()();
  }
}
function StocksPage_div_52_div_7_ion_card_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-card", 121)(1, "ion-card-content")(2, "div", 13);
    \u0275\u0275element(3, "ion-icon", 122);
    \u0275\u0275elementStart(4, "div", 15)(5, "h2");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const stat_r16 = ctx.ngIf;
    \u0275\u0275advance(3);
    \u0275\u0275property("name", stat_r16.icon)("color", stat_r16.color || (stat_r16.getColor == null ? null : stat_r16.getColor()));
    \u0275\u0275advance(2);
    \u0275\u0275classMap(stat_r16.getClass == null ? null : stat_r16.getClass());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("$", stat_r16.getValue());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(stat_r16.label);
  }
}
function StocksPage_div_52_div_7_span_33_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 123);
    \u0275\u0275listener("click", function StocksPage_div_52_div_7_span_33_Template_span_click_0_listener() {
      const i_r18 = \u0275\u0275restoreView(_r17).index;
      const ctx_r1 = \u0275\u0275nextContext(3);
      ctx_r1.currentStatIndex = i_r18;
      return \u0275\u0275resetView(ctx_r1.stopAutoCarousel());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const i_r18 = ctx.index;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", i_r18 === ctx_r1.currentStatIndex);
  }
}
function StocksPage_div_52_div_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div")(1, "div", 112)(2, "ion-card", 18)(3, "ion-card-content")(4, "div", 13);
    \u0275\u0275element(5, "ion-icon", 113);
    \u0275\u0275elementStart(6, "div", 15)(7, "h2");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p");
    \u0275\u0275text(10, "Today's Actual Dividends");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(11, "ion-card", 18)(12, "ion-card-content")(13, "div", 13);
    \u0275\u0275element(14, "ion-icon", 114);
    \u0275\u0275elementStart(15, "div", 15)(16, "h2");
    \u0275\u0275text(17);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "p");
    \u0275\u0275text(19, "Portfolio Value");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(20, "ion-card", 18)(21, "ion-card-content")(22, "div", 13);
    \u0275\u0275element(23, "ion-icon", 115);
    \u0275\u0275elementStart(24, "div", 15)(25, "h2");
    \u0275\u0275text(26);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "p");
    \u0275\u0275text(28, "All-Time Gains");
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275elementStart(29, "div", 116)(30, "div", 117);
    \u0275\u0275listener("touchstart", function StocksPage_div_52_div_7_Template_div_touchstart_30_listener($event) {
      \u0275\u0275restoreView(_r15);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onStatTouchStart($event));
    })("touchend", function StocksPage_div_52_div_7_Template_div_touchend_30_listener($event) {
      \u0275\u0275restoreView(_r15);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onStatTouchEnd($event));
    });
    \u0275\u0275template(31, StocksPage_div_52_div_7_ion_card_31_Template, 9, 6, "ion-card", 118);
    \u0275\u0275elementStart(32, "div", 119);
    \u0275\u0275template(33, StocksPage_div_52_div_7_span_33_Template, 1, 2, "span", 120);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate1("$", ctx_r1.getTotalDailyDividends().toFixed(2));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate1("$", ctx_r1.getTotalPortfolioValue().toFixed(2));
    \u0275\u0275advance(6);
    \u0275\u0275property("color", ctx_r1.getTotalPortfolioProfitLoss() >= 0 ? "success" : "danger");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("profit", ctx_r1.getTotalPortfolioProfitLoss() >= 0)("loss", ctx_r1.getTotalPortfolioProfitLoss() < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r1.getTotalPortfolioProfitLoss() >= 0 ? "+" : "", "$", ctx_r1.getTotalPortfolioProfitLoss().toFixed(2), " ");
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", ctx_r1.portfolioStats[ctx_r1.currentStatIndex]);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.portfolioStats);
  }
}
function StocksPage_div_52_div_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 77);
    \u0275\u0275element(1, "ion-spinner", 78);
    \u0275\u0275elementStart(2, "p");
    \u0275\u0275text(3, "Loading portfolio...");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_div_52_div_10_div_1_span_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 124);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const business_r20 = ctx.ngIf;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", business_r20.sharesAvailable, " left to buy");
  }
}
function StocksPage_div_52_div_10_div_1_ion_button_42_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 132);
    \u0275\u0275listener("click", function StocksPage_div_52_div_10_div_1_ion_button_42_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r21);
      const holding_r22 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.openBuyModal(ctx_r1.getBusinessForHolding(holding_r22)));
    });
    \u0275\u0275element(1, "ion-icon", 106);
    \u0275\u0275text(2, " Buy ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275property("disabled", ctx_r1.isLoading);
  }
}
function StocksPage_div_52_div_10_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 80)(1, "div", 81)(2, "div", 82);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 83)(5, "div", 84)(6, "h3", 85);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 86)(9, "span", 87);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 124);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275template(13, StocksPage_div_52_div_10_div_1_span_13_Template, 2, 1, "span", 125);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 88)(15, "div", 89);
    \u0275\u0275text(16, "Business Owner:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "div", 90);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "div", 91)(20, "div", 92)(21, "div", 93);
    \u0275\u0275text(22, "Avg Price");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "div", 95);
    \u0275\u0275text(24);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "div", 92)(26, "div", 93);
    \u0275\u0275text(27, "Invested");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "div", 95);
    \u0275\u0275text(29);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "div", 92)(31, "div", 93);
    \u0275\u0275text(32, "Est./Comp.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "div", 96);
    \u0275\u0275text(34);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "div", 92)(36, "div", 93);
    \u0275\u0275text(37, "Streak");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "div", 94);
    \u0275\u0275text(39);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(40, "div", 126)(41, "div", 127);
    \u0275\u0275template(42, StocksPage_div_52_div_10_div_1_ion_button_42_Template, 3, 1, "ion-button", 128);
    \u0275\u0275elementStart(43, "ion-button", 129);
    \u0275\u0275listener("click", function StocksPage_div_52_div_10_div_1_Template_ion_button_click_43_listener() {
      const holding_r22 = \u0275\u0275restoreView(_r19).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.openSellModal(holding_r22));
    });
    \u0275\u0275element(44, "ion-icon", 130);
    \u0275\u0275text(45, " Sell ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "ion-button", 131);
    \u0275\u0275listener("click", function StocksPage_div_52_div_10_div_1_Template_ion_button_click_46_listener() {
      const holding_r22 = \u0275\u0275restoreView(_r19).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.sendReminder(holding_r22));
    });
    \u0275\u0275elementStart(47, "span");
    \u0275\u0275text(48, "\u{1F449}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "span");
    \u0275\u0275text(50);
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(51, "div", 97);
    \u0275\u0275element(52, "app-habit-grid", 98);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const holding_r22 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", holding_r22.businessIcon || "\u{1F4C8}", " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(holding_r22.businessName);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("$", (holding_r22.currentPrice == null ? null : holding_r22.currentPrice.toFixed(2)) || "0.00");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", holding_r22.sharesOwned, " shares");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.getBusinessForHolding(holding_r22));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(holding_r22.ownerName);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" $", holding_r22.averagePurchasePrice, " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("$", holding_r22.totalInvested);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" $", (holding_r22.dailyDividendRate == null ? null : holding_r22.dailyDividendRate.toFixed(2)) || "0.00", " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", holding_r22.businessStreak, " days ");
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r1.canBuyMoreShares(holding_r22));
    \u0275\u0275advance(4);
    \u0275\u0275styleProp("color", ctx_r1.isRemindButtonDisabled(holding_r22) ? "#999999 !important" : "#3880ff !important")("--color", ctx_r1.isRemindButtonDisabled(holding_r22) ? "#999999 !important" : "#3880ff !important")("opacity", ctx_r1.isRemindButtonDisabled(holding_r22) ? "0.5" : "1");
    \u0275\u0275property("disabled", ctx_r1.isRemindButtonDisabled(holding_r22));
    \u0275\u0275advance();
    \u0275\u0275styleProp("color", ctx_r1.isRemindButtonDisabled(holding_r22) ? "#999999 !important" : "#3880ff !important");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", ctx_r1.isRemindButtonDisabled(holding_r22) ? "#999999 !important" : "#3880ff !important");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.hasAlreadyRemindedToday(holding_r22.businessId) ? "Reminded" : "Remind", " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("businessId", holding_r22.stockId)("businessName", holding_r22.businessName)("businessEmoji", holding_r22.businessIcon)("businessType", "Stock")("isModal", false)("showStats", false)("useCalendarYear", true)("size", "medium")("isStockView", true);
  }
}
function StocksPage_div_52_div_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275template(1, StocksPage_div_52_div_10_div_1_Template, 53, 32, "div", 79);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.portfolio);
  }
}
function StocksPage_div_52_div_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 77);
    \u0275\u0275element(1, "ion-icon", 133);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "No Investments Yet");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, " Start investing in your friends' habit businesses to build your portfolio! ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 134);
    \u0275\u0275listener("click", function StocksPage_div_52_div_11_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.selectTab("available"));
    });
    \u0275\u0275element(7, "ion-icon", 135);
    \u0275\u0275text(8, " Browse Available Stocks ");
    \u0275\u0275elementEnd()();
  }
}
function StocksPage_div_52_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 43)(1, "div", 44);
    \u0275\u0275element(2, "ion-icon", 110);
    \u0275\u0275elementStart(3, "h2");
    \u0275\u0275text(4, "My Portfolio");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(5, StocksPage_div_52_div_5_Template, 4, 0, "div", 56)(6, StocksPage_div_52_ion_card_6_Template, 33, 0, "ion-card", 57)(7, StocksPage_div_52_div_7_Template, 34, 11, "div", 60)(8, StocksPage_div_52_div_8_Template, 4, 0, "div", 58);
    \u0275\u0275elementStart(9, "div", 59);
    \u0275\u0275template(10, StocksPage_div_52_div_10_Template, 2, 1, "div", 60);
    \u0275\u0275elementEnd();
    \u0275\u0275template(11, StocksPage_div_52_div_11_Template, 9, 0, "div", 58);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", !ctx_r1.showPortfolioHelpSection);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.showPortfolioHelpSection);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.isLoading && ctx_r1.portfolio.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.isLoading);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !ctx_r1.isLoading && ctx_r1.portfolio.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.isLoading && ctx_r1.portfolio.length === 0);
  }
}
function StocksPage_ng_template_55_div_8_ion_select_option_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-select-option", 61);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const option_r26 = ctx.$implicit;
    \u0275\u0275property("value", option_r26);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", option_r26, " ");
  }
}
function StocksPage_ng_template_55_div_8_div_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 149)(1, "p")(2, "strong");
    \u0275\u0275text(3, "Sale Amount:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" $", (ctx_r1.sellQuantity * ctx_r1.selectedHolding.sharePrice).toFixed(2), " ");
  }
}
function StocksPage_ng_template_55_div_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 141)(1, "div", 83)(2, "div", 142)(3, "span", 143);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div")(6, "h2");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(10, "div", 144)(11, "p")(12, "strong");
    \u0275\u0275text(13, "Your Holdings:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "p")(16, "strong");
    \u0275\u0275text(17, "Total Value:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "p")(20, "strong");
    \u0275\u0275text(21, "Profit/Loss:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "span");
    \u0275\u0275text(23);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(24, "div", 145)(25, "ion-item")(26, "ion-label", 50);
    \u0275\u0275text(27, "Shares to Sell");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "ion-select", 146);
    \u0275\u0275twoWayListener("ngModelChange", function StocksPage_ng_template_55_div_8_Template_ion_select_ngModelChange_28_listener($event) {
      \u0275\u0275restoreView(_r25);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.sellQuantity, $event) || (ctx_r1.sellQuantity = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275template(29, StocksPage_ng_template_55_div_8_ion_select_option_29_Template, 2, 2, "ion-select-option", 53);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(30, StocksPage_ng_template_55_div_8_div_30_Template, 5, 1, "div", 147);
    \u0275\u0275elementStart(31, "ion-button", 148);
    \u0275\u0275listener("click", function StocksPage_ng_template_55_div_8_Template_ion_button_click_31_listener() {
      \u0275\u0275restoreView(_r25);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.confirmSell());
    });
    \u0275\u0275text(32);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.selectedHolding.emoji);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.selectedHolding.businessName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Current Share Price: $", ctx_r1.selectedHolding.sharePrice.toFixed(2), " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r1.selectedHolding.shares, " shares ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" $", (ctx_r1.selectedHolding.shares * ctx_r1.selectedHolding.sharePrice).toFixed(2), " ");
    \u0275\u0275advance(4);
    \u0275\u0275classMap(ctx_r1.selectedHolding.shares * ctx_r1.selectedHolding.sharePrice - ctx_r1.selectedHolding.totalInvested >= 0 ? "profit" : "loss");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" $", (ctx_r1.selectedHolding.shares * ctx_r1.selectedHolding.sharePrice - ctx_r1.selectedHolding.totalInvested).toFixed(2), " ");
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.sellQuantity);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.getSellOptions());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.sellQuantity > 0);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.sellQuantity || ctx_r1.sellQuantity <= 0 || ctx_r1.sellQuantity > ctx_r1.selectedHolding.shares);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Sell ", ctx_r1.sellQuantity || 0, " Shares ");
  }
}
function StocksPage_ng_template_55_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-header")(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "Sell Shares");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-buttons", 136)(5, "ion-button", 137);
    \u0275\u0275listener("click", function StocksPage_ng_template_55_Template_ion_button_click_5_listener() {
      \u0275\u0275restoreView(_r24);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeSellModal());
    });
    \u0275\u0275element(6, "ion-icon", 138);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(7, "ion-content", 139);
    \u0275\u0275template(8, StocksPage_ng_template_55_div_8_Template, 33, 13, "div", 140);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(8);
    \u0275\u0275property("ngIf", ctx_r1.selectedHolding);
  }
}
function StocksPage_ng_template_57_div_8_ion_select_option_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-select-option", 61);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const option_r29 = ctx.$implicit;
    \u0275\u0275property("value", option_r29);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", option_r29, " ");
  }
}
function StocksPage_ng_template_57_div_8_p_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 149);
    \u0275\u0275text(1, " You can't afford any shares of this stock right now. ");
    \u0275\u0275elementEnd();
  }
}
function StocksPage_ng_template_57_div_8_div_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 149)(1, "p")(2, "strong");
    \u0275\u0275text(3, "Total Cost:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" $", (ctx_r1.buyQuantity * ctx_r1.selectedBuyBusiness.stockPrice).toFixed(2), " ");
  }
}
function StocksPage_ng_template_57_div_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 141)(1, "div", 83)(2, "div", 142)(3, "span", 143);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div")(6, "h2");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(10, "div", 144)(11, "p")(12, "strong");
    \u0275\u0275text(13, "Shares Available:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "p")(16, "strong");
    \u0275\u0275text(17, "Cash Available:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "div", 145)(20, "ion-item")(21, "ion-label", 50);
    \u0275\u0275text(22, "Shares to Buy");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "ion-select", 146);
    \u0275\u0275twoWayListener("ngModelChange", function StocksPage_ng_template_57_div_8_Template_ion_select_ngModelChange_23_listener($event) {
      \u0275\u0275restoreView(_r28);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.buyQuantity, $event) || (ctx_r1.buyQuantity = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275template(24, StocksPage_ng_template_57_div_8_ion_select_option_24_Template, 2, 2, "ion-select-option", 53);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(25, StocksPage_ng_template_57_div_8_p_25_Template, 2, 0, "p", 147)(26, StocksPage_ng_template_57_div_8_div_26_Template, 5, 1, "div", 147);
    \u0275\u0275elementStart(27, "ion-button", 150);
    \u0275\u0275listener("click", function StocksPage_ng_template_57_div_8_Template_ion_button_click_27_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.confirmBuy());
    });
    \u0275\u0275text(28);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.selectedBuyBusiness.businessIcon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.selectedBuyBusiness.businessName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Current Share Price: $", ctx_r1.selectedBuyBusiness.stockPrice.toFixed(2), " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r1.selectedBuyBusiness.sharesAvailable, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" $", ((ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) || 0).toFixed(2), " ");
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.buyQuantity);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.getBuyOptions());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.getBuyOptions().length === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.buyQuantity > 0);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.buyQuantity || ctx_r1.buyQuantity <= 0 || ctx_r1.buyQuantity > ctx_r1.selectedBuyBusiness.sharesAvailable || ctx_r1.buyQuantity * ctx_r1.selectedBuyBusiness.stockPrice > ((ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) || 0) || ctx_r1.isLoading);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Buy ", ctx_r1.buyQuantity || 0, " Shares ");
  }
}
function StocksPage_ng_template_57_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-header")(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "Buy Shares");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-buttons", 136)(5, "ion-button", 137);
    \u0275\u0275listener("click", function StocksPage_ng_template_57_Template_ion_button_click_5_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeBuyModal());
    });
    \u0275\u0275element(6, "ion-icon", 138);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(7, "ion-content", 139);
    \u0275\u0275template(8, StocksPage_ng_template_57_div_8_Template, 29, 11, "div", 140);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(8);
    \u0275\u0275property("ngIf", ctx_r1.selectedBuyBusiness);
  }
}
var _StocksPage = class _StocksPage {
  constructor(router, habitBusinessService, socialService, authService, toastController, alertController) {
    this.router = router;
    this.habitBusinessService = habitBusinessService;
    this.socialService = socialService;
    this.authService = authService;
    this.toastController = toastController;
    this.alertController = alertController;
    this.selectedTab = "available";
    this.friendBusinesses = [];
    this.portfolio = [];
    this.isLoading = false;
    this.currentUser = null;
    this.userProfile = null;
    this.sellQuantities = {};
    this.showHelpSection = false;
    this.showPortfolioHelpSection = false;
    this.selectedQuantities = {};
    this.todaysActualDividends = 0;
    this.showDetailedNetWorth = false;
    this.showDetailedCash = false;
    this.currentStatIndex = 0;
    this.autoCarouselInterval = null;
    this.isMobileScreen = false;
    this.isMediumSmallScreen = false;
    this.isMediumLargeScreen = false;
    this.portfolioStats = [];
    this.weeksToShow = 26;
    this.showSellModal = false;
    this.selectedHolding = null;
    this.sellQuantity = 0;
    this.showBuyModal = false;
    this.selectedBuyBusiness = null;
    this.buyQuantity = 0;
    this.dailyReminders = {};
    this.habitCompletionStatus = {};
    this.selectedOwnerFilter = "";
    addIcons({ funnel, closeCircle, settings, logOut, trendingUpOutline, pieChartOutline, swapHorizontal, helpCircle, trendingUp, close, addCircle, pieChart, wallet, trendingDown, removeCircle, helpCircleOutline, chevronBack, chevronForward, remove, add, arrowBack, star, business, cash, checkmarkCircle, alertCircle });
  }
  ngOnInit() {
    return __async(this, null, function* () {
      const savedTab = localStorage.getItem("stocks-active-tab");
      if (savedTab === "portfolio" || savedTab === "available") {
        this.selectedTab = savedTab;
      }
      const savedOwnerFilter = localStorage.getItem("stocks-owner-filter");
      if (savedOwnerFilter) {
        this.selectedOwnerFilter = savedOwnerFilter;
      }
      this.checkScreenSize();
      this.setupPortfolioStats();
      yield this.loadCurrentUser();
      yield this.loadData();
    });
  }
  ngOnDestroy() {
    this.stopAutoCarousel();
  }
  onResize(event) {
    this.checkScreenSize();
  }
  checkScreenSize() {
    const width = window.innerWidth;
    this.isMobileScreen = width <= 768;
    this.isMediumSmallScreen = width > 768 && width <= 1024;
    this.isMediumLargeScreen = width > 1024 && width <= 1400;
    if (this.isMobileScreen) {
      this.weeksToShow = 13;
      console.log("\u{1F4F1} MOBILE screen detected:", width + "px - Setting weeks to:", this.weeksToShow);
    } else if (this.isMediumSmallScreen) {
      this.weeksToShow = 17;
      console.log("\u{1F50D} SMALL-MEDIUM screen detected:", width + "px - Setting weeks to:", this.weeksToShow);
    } else if (this.isMediumLargeScreen) {
      this.weeksToShow = 26;
      console.log("\uFFFD MEDIUM-LARGE screen detected:", width + "px - Setting weeks to:", this.weeksToShow);
    } else {
      this.weeksToShow = 53;
      console.log("\u{1F5A5}\uFE0F LARGE screen detected:", width + "px - Setting weeks to:", this.weeksToShow, "(FULL YEAR)");
    }
    if (this.isMobileScreen && this.selectedTab === "portfolio" && this.portfolio.length > 0) {
      this.startAutoCarousel();
    } else {
      this.stopAutoCarousel();
    }
  }
  setupPortfolioStats() {
    this.portfolioStats = [
      {
        icon: "wallet",
        color: "secondary",
        getValue: () => this.getTotalDailyDividends().toFixed(2),
        label: "Today's Actual Dividends"
      },
      {
        icon: "wallet",
        color: "primary",
        getValue: () => this.getTotalPortfolioValue().toFixed(2),
        label: "Portfolio Value"
      },
      {
        icon: "trending-up",
        getColor: () => this.getTotalPortfolioProfitLoss() >= 0 ? "success" : "danger",
        getValue: () => `${this.getTotalPortfolioProfitLoss() >= 0 ? "+" : ""}$${this.getTotalPortfolioProfitLoss().toFixed(2)}`,
        label: "All-Time Gains",
        getClass: () => this.getTotalPortfolioProfitLoss() >= 0 ? "profit" : "loss"
      },
      {
        icon: "trending-up",
        color: "primary",
        getValue: () => this.userProfile?.net_worth || "0.00",
        label: "Net Worth"
      }
    ];
  }
  startAutoCarousel() {
    this.stopAutoCarousel();
    this.autoCarouselInterval = setInterval(() => {
      this.nextStat();
    }, 8e3);
  }
  stopAutoCarousel() {
    if (this.autoCarouselInterval) {
      clearInterval(this.autoCarouselInterval);
      this.autoCarouselInterval = null;
    }
  }
  nextStat() {
    this.currentStatIndex = (this.currentStatIndex + 1) % this.portfolioStats.length;
  }
  previousStat() {
    this.currentStatIndex = this.currentStatIndex === 0 ? this.portfolioStats.length - 1 : this.currentStatIndex - 1;
  }
  onStatTouchStart(event) {
    this.stopAutoCarousel();
  }
  onStatTouchEnd(event) {
    if (this.isMobileScreen && this.selectedTab === "portfolio" && this.portfolio.length > 0) {
      setTimeout(() => this.startAutoCarousel(), 2e3);
    }
  }
  selectTab(tab) {
    this.selectedTab = tab;
    localStorage.setItem("stocks-active-tab", tab);
    if (tab === "portfolio" && this.isMobileScreen && this.portfolio.length > 0) {
      this.setupPortfolioStats();
      this.startAutoCarousel();
    } else {
      this.stopAutoCarousel();
    }
  }
  toggleMobileTab() {
    const newTab = this.selectedTab === "available" ? "portfolio" : "available";
    this.selectTab(newTab);
  }
  toggleHelpSection() {
    this.showHelpSection = !this.showHelpSection;
  }
  togglePortfolioHelpSection() {
    this.showPortfolioHelpSection = !this.showPortfolioHelpSection;
  }
  loadCurrentUser() {
    return __async(this, null, function* () {
      try {
        const { data: { user } } = yield this.authService.getUser();
        this.currentUser = user;
        if (user?.id) {
          this.userProfile = yield this.authService.getUserProfile(user.id);
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    });
  }
  loadData() {
    return __async(this, null, function* () {
      this.isLoading = true;
      try {
        yield Promise.all([
          this.loadFriendBusinesses(),
          this.loadPortfolio()
        ]);
        this.loadReminderHistory();
        if (this.selectedTab === "portfolio" && this.isMobileScreen && this.portfolio.length > 0) {
          this.setupPortfolioStats();
          this.startAutoCarousel();
        }
      } catch (error) {
        console.error("Error loading stocks data:", error);
      }
      this.isLoading = false;
    });
  }
  loadFriendBusinesses() {
    return __async(this, null, function* () {
      if (!this.currentUser?.id) {
        console.log("No current user for loading friend businesses");
        return;
      }
      try {
        this.friendBusinesses = yield this.habitBusinessService.getFriendBusinesses(this.currentUser.id);
        console.log("\u2705 Loaded friend businesses:", this.friendBusinesses.length);
      } catch (error) {
        console.error("Error loading friend businesses:", error);
        this.friendBusinesses = [];
      }
    });
  }
  loadPortfolio() {
    return __async(this, null, function* () {
      console.log("\u{1F50D} Starting loadPortfolio...");
      if (!this.currentUser?.id) {
        console.log("\u274C No current user for loading portfolio");
        return;
      }
      console.log("\u{1F50D} Loading portfolio for user:", this.currentUser.id);
      try {
        this.portfolio = yield this.habitBusinessService.getUserStockPortfolio(this.currentUser.id);
        console.log("\u2705 Loaded portfolio:", this.portfolio.length);
        console.log("\u{1F50D} Portfolio data:", this.portfolio);
        this.todaysActualDividends = yield this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
        console.log("\u{1F4B0} Today's actual dividends:", this.todaysActualDividends);
      } catch (error) {
        console.error("\u274C Error loading portfolio:", error);
        this.portfolio = [];
        this.todaysActualDividends = 0;
      }
    });
  }
  sendHabitPoke(friendId, businessName) {
    return __async(this, null, function* () {
      if (!this.currentUser?.id) {
        console.log("No current user for sending poke");
        return;
      }
      try {
        yield this.socialService.sendHabitPoke(this.currentUser.id, friendId, businessName);
        const toast = yield this.toastController.create({
          message: `\u{1F44B} Sent motivation poke for ${businessName}!`,
          duration: 3e3,
          color: "success"
        });
        yield toast.present();
      } catch (error) {
        const toast = yield this.toastController.create({
          message: `\u274C ${error.message}`,
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  sendStockholderReminder(friendId, businessName, friendName) {
    return __async(this, null, function* () {
      if (!this.currentUser?.id) {
        console.log("No current user for sending stockholder reminder");
        return;
      }
      try {
        const currentUserName = this.userProfile?.name || this.currentUser?.email || "A stockholder";
        yield this.socialService.sendStockholderReminder(this.currentUser.id, friendId, businessName, currentUserName);
        const toast = yield this.toastController.create({
          message: `\u{1F4E9} Sent stockholder reminder to ${friendName} about ${businessName}!`,
          duration: 3e3,
          color: "success"
        });
        yield toast.present();
      } catch (error) {
        const toast = yield this.toastController.create({
          message: `\u274C ${error.message}`,
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  getPerformanceTrend() {
    const rand = Math.random();
    if (rand < 0.4)
      return "up";
    if (rand < 0.8)
      return "down";
    return "stable";
  }
  getTrendIcon(trend) {
    switch (trend) {
      case "up":
        return "\u{1F4C8}";
      case "down":
        return "\u{1F4C9}";
      default:
        return "\u27A1\uFE0F";
    }
  }
  getTrendColor(trend) {
    switch (trend) {
      case "up":
        return "success";
      case "down":
        return "danger";
      default:
        return "medium";
    }
  }
  formatCurrency(amount) {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    });
  }
  getPerformanceClass(profitLoss) {
    return profitLoss >= 0 ? "profit" : "loss";
  }
  getTotalPortfolioValue() {
    return this.portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  }
  getTotalPortfolioProfitLoss() {
    return this.portfolio.reduce((sum, item) => sum + item.profitLoss, 0);
  }
  getTotalDailyDividends() {
    return this.todaysActualDividends;
  }
  getPotentialDailyDividends() {
    return this.portfolio.reduce((sum, item) => sum + item.dailyDividendRate, 0);
  }
  /**
   * Sell stocks from portfolio
   */
  sellStocks(holding, quantityOrPercentage = 0.5) {
    return __async(this, null, function* () {
      try {
        let sharesToSell;
        let isPercentage = false;
        if (quantityOrPercentage <= 1) {
          sharesToSell = Math.floor(holding.sharesOwned * quantityOrPercentage);
          isPercentage = true;
        } else {
          sharesToSell = Math.floor(quantityOrPercentage);
        }
        if (sharesToSell <= 0) {
          const toast = yield this.toastController.create({
            message: "No shares to sell",
            duration: 2e3,
            color: "warning"
          });
          yield toast.present();
          return;
        }
        if (sharesToSell > holding.sharesOwned) {
          const toast = yield this.toastController.create({
            message: "Cannot sell more shares than you own",
            duration: 2e3,
            color: "warning"
          });
          yield toast.present();
          return;
        }
        const percentageText = isPercentage ? ` (${Math.round(quantityOrPercentage * 100)}%)` : "";
        const alert = yield this.alertController.create({
          header: "Sell Stocks",
          message: `
          <div style="text-align: left;">
            <p><strong>Stock:</strong> ${holding.businessName}</p>
            <p><strong>Shares to sell:</strong> ${sharesToSell}${percentageText}</p>
            <p><strong>Current price:</strong> $${holding.currentPrice.toFixed(2)}/share</p>
            <p><strong>Total value:</strong> $${(sharesToSell * holding.currentPrice).toFixed(2)}</p>
            <p><strong>Transaction fee:</strong> 2%</p>
            <p><strong>Net proceeds:</strong> $${(sharesToSell * holding.currentPrice * 0.98).toFixed(2)}</p>
          </div>
        `,
          buttons: [
            {
              text: "Cancel",
              role: "cancel"
            },
            {
              text: "Sell",
              cssClass: "danger",
              handler: () => __async(this, null, function* () {
                yield this.executeSale(holding, sharesToSell);
              })
            }
          ]
        });
        yield alert.present();
      } catch (error) {
        console.error("Error preparing stock sale:", error);
        const toast = yield this.toastController.create({
          message: "Error preparing sale",
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  executeSale(holding, sharesToSell) {
    return __async(this, null, function* () {
      try {
        this.isLoading = true;
        const result = yield this.habitBusinessService.sellStockShares(
          holding.stockId,
          // Use the stock_id from the portfolio
          sharesToSell
        );
        if (result.success) {
          yield this.loadPortfolio();
          yield this.loadFriendBusinesses();
          yield this.loadCurrentUser();
        } else {
          throw new Error(result.error);
        }
      } finally {
        this.isLoading = false;
      }
    });
  }
  getHalfShares(shares) {
    return Math.floor(shares / 2);
  }
  /**
   * Find the live "available stocks" entry backing a portfolio holding,
   * which is where shares_available is tracked.
   */
  getBusinessForHolding(holding) {
    return this.friendBusinesses.find((b) => b.stockId === holding.stockId);
  }
  /**
   * Whether more shares of an already-owned stock can still be bought
   */
  canBuyMoreShares(holding) {
    const business2 = this.getBusinessForHolding(holding);
    return !!business2 && business2.sharesAvailable > 0;
  }
  /**
   * Open the buy-quantity modal for a stock, whether reached from the
   * Available Stocks list or the "Buy More" button on an existing holding
   */
  openBuyModal(business2) {
    if (!business2 || !business2.stockId) {
      return;
    }
    this.selectedBuyBusiness = business2;
    this.buyQuantity = 1;
    this.showBuyModal = true;
  }
  /**
   * Close the "Buy More" modal
   */
  closeBuyModal() {
    this.showBuyModal = false;
    this.selectedBuyBusiness = null;
    this.buyQuantity = 0;
  }
  /**
   * Generate array of buy options from 1 to shares available, capped by
   * how many shares the user can actually afford with their current cash
   */
  getBuyOptions() {
    if (!this.selectedBuyBusiness)
      return [];
    const maxShares = this.selectedBuyBusiness.sharesAvailable;
    const cash2 = this.userProfile?.cash || 0;
    const affordableShares = this.selectedBuyBusiness.stockPrice > 0 ? Math.floor(cash2 / this.selectedBuyBusiness.stockPrice) : maxShares;
    const limit = Math.min(maxShares, affordableShares);
    return Array.from({ length: limit }, (_, i) => i + 1);
  }
  /**
   * Confirm and execute the purchase of additional shares from the "Buy More" modal
   */
  confirmBuy() {
    return __async(this, null, function* () {
      if (!this.selectedBuyBusiness || !this.buyQuantity || this.buyQuantity <= 0) {
        return;
      }
      const business2 = this.selectedBuyBusiness;
      const shares = this.buyQuantity;
      try {
        this.isLoading = true;
        const result = yield this.habitBusinessService.purchaseStockShares(business2.stockId, shares);
        this.closeBuyModal();
        const toast = yield this.toastController.create({
          message: `\u2705 Purchased ${result.shares_purchased} shares for $${result.total_cost.toFixed(2)}!`,
          duration: 3e3,
          color: "success"
        });
        yield toast.present();
        yield this.loadData();
        yield this.loadCurrentUser();
      } catch (error) {
        const toast = yield this.toastController.create({
          message: `\u274C ${error?.message || "Failed to purchase shares"}`,
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      } finally {
        this.isLoading = false;
      }
    });
  }
  /**
   * Get price change percentage from base price
   */
  getPriceChangePercentage(business2) {
    if (!business2.basePrice || business2.basePrice === 0)
      return 0;
    return (business2.stockPrice - business2.basePrice) / business2.basePrice * 100;
  }
  /**
   * Get price change indicator class
   */
  getPriceChangeClass(business2) {
    const change = this.getPriceChangePercentage(business2);
    if (change > 0)
      return "price-up";
    if (change < 0)
      return "price-down";
    return "price-neutral";
  }
  /**
   * Format price change for display
   */
  formatPriceChange(business2) {
    const change = this.getPriceChangePercentage(business2);
    const prefix = change > 0 ? "+" : "";
    return `${prefix}${change.toFixed(1)}%`;
  }
  /**
   * Increment sell quantity for a specific stock
   */
  incrementSellQuantity(stockId, maxShares) {
    const current = this.sellQuantities[stockId] || 1;
    if (current < maxShares) {
      this.sellQuantities[stockId] = current + 1;
    }
  }
  /**
   * Decrement sell quantity for a specific stock
   */
  decrementSellQuantity(stockId) {
    const current = this.sellQuantities[stockId] || 1;
    if (current > 1) {
      this.sellQuantities[stockId] = current - 1;
    }
  }
  /**
   * Increment buy quantity for a specific stock
   */
  incrementQuantity(stockId) {
    const current = this.selectedQuantities[stockId] || 1;
    this.selectedQuantities[stockId] = current + 1;
  }
  /**
   * Decrement buy quantity for a specific stock
   */
  decrementQuantity(stockId) {
    const current = this.selectedQuantities[stockId] || 1;
    if (current > 1) {
      this.selectedQuantities[stockId] = current - 1;
    }
  }
  /**
   * Logout user and redirect to login page
   */
  logout() {
    return __async(this, null, function* () {
      try {
        yield this.authService.signOut();
        this.router.navigate(["/login"], { replaceUrl: true });
      } catch (error) {
        console.error("Logout error:", error);
        const toast = yield this.toastController.create({
          message: "Failed to logout. Please try again.",
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  openWeeklyReceipt() {
    this.router.navigate(["/weekly-receipt"]);
  }
  goHome() {
    this.router.navigate(["/home"]);
  }
  /**
   * Open sell modal for a specific holding
   */
  openSellModal(holding) {
    this.selectedHolding = __spreadProps(__spreadValues({}, holding), {
      emoji: holding.businessIcon,
      sharePrice: holding.currentPrice,
      shares: holding.sharesOwned
    });
    this.sellQuantity = 1;
    this.showSellModal = true;
  }
  /**
   * Close sell modal
   */
  closeSellModal() {
    this.showSellModal = false;
    this.selectedHolding = null;
    this.sellQuantity = 0;
  }
  /**
   * Set sell quantity with preset amounts
   */
  setSellQuantity(quantity) {
    this.sellQuantity = Math.max(0, Math.min(quantity, this.selectedHolding?.shares || 0));
  }
  /**
   * Helper method for calculating percentages in template
   */
  calculateSellQuantity(percentage) {
    if (!this.selectedHolding)
      return 0;
    return Math.floor(this.selectedHolding.shares * percentage);
  }
  /**
   * Generate array of sell options from 1 to max shares owned
   */
  getSellOptions() {
    if (!this.selectedHolding)
      return [];
    const maxShares = this.selectedHolding.shares;
    return Array.from({ length: maxShares }, (_, i) => i + 1);
  }
  /**
   * Confirm and execute the sell transaction
   */
  confirmSell() {
    return __async(this, null, function* () {
      if (!this.selectedHolding || !this.sellQuantity || this.sellQuantity <= 0) {
        return;
      }
      const sharesToSell = this.sellQuantity;
      try {
        const portfolioItem = this.portfolio.find((p) => p.stockId === this.selectedHolding.stockId);
        if (!portfolioItem) {
          throw new Error("Portfolio item not found");
        }
        yield this.executeSale(portfolioItem, sharesToSell);
        this.closeSellModal();
        const toast = yield this.toastController.create({
          message: `\u2705 Successfully sold ${sharesToSell} shares!`,
          duration: 3e3,
          color: "success"
        });
        yield toast.present();
      } catch (error) {
        console.error("Error selling shares:", error);
        const toast = yield this.toastController.create({
          message: `\u274C Failed to sell shares: ${error?.message || error}`,
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  /**
   * Check if user has already sent a reminder today for this business
   */
  hasAlreadyRemindedToday(businessId) {
    const today = (/* @__PURE__ */ new Date()).toDateString();
    return this.dailyReminders[businessId] === today;
  }
  /**
   * Check if the habit business owner has completed their habit for the current period
   */
  isHabitCompleted(holding) {
    if (this.habitCompletionStatus[holding.businessId] !== void 0) {
      return this.habitCompletionStatus[holding.businessId];
    }
    if (holding.frequency === "daily") {
      return (holding.currentProgress || 0) >= (holding.goalValue || 1);
    }
    if (holding.frequency === "weekly") {
      return (holding.currentProgress || 0) >= (holding.goalValue || 1);
    }
    return false;
  }
  /**
   * Check if remind button should be disabled
   */
  isRemindButtonDisabled(holding) {
    return this.hasAlreadyRemindedToday(holding.businessId) || this.isHabitCompleted(holding);
  }
  /**
   * Get tooltip text for disabled remind button
   */
  getRemindButtonTooltip(holding) {
    if (this.hasAlreadyRemindedToday(holding.businessId)) {
      return "You can only send one reminder per day";
    }
    if (this.isHabitCompleted(holding)) {
      return `${holding.ownerName} has already completed their habit today`;
    }
    return "";
  }
  /**
   * Mark that a reminder was sent today for this business
   */
  markReminderSent(businessId) {
    const today = (/* @__PURE__ */ new Date()).toDateString();
    this.dailyReminders[businessId] = today;
    localStorage.setItem(`reminder_${businessId}`, today);
  }
  /**
   * Load reminder history from localStorage
   */
  loadReminderHistory() {
    this.portfolio.forEach((holding) => {
      const storedDate = localStorage.getItem(`reminder_${holding.businessId}`);
      if (storedDate) {
        this.dailyReminders[holding.businessId] = storedDate;
      }
    });
  }
  /**
   * Send a reminder to the habit business owner
   */
  sendReminder(holding) {
    return __async(this, null, function* () {
      if (!this.currentUser || !holding) {
        return;
      }
      if (this.isRemindButtonDisabled(holding)) {
        const toast = yield this.toastController.create({
          message: this.getRemindButtonTooltip(holding),
          duration: 3e3,
          color: "warning"
        });
        yield toast.present();
        return;
      }
      try {
        const alert = yield this.alertController.create({
          header: "Send Reminder",
          message: `Send a reminder to ${holding.ownerName} to complete their ${holding.businessName} habit?`,
          buttons: [
            {
              text: "Cancel",
              role: "cancel"
            },
            {
              text: "Send Reminder",
              handler: () => __async(this, null, function* () {
                try {
                  console.log("\u{1F50D} Sending reminder with data:", {
                    fromUserId: this.currentUser.id,
                    toUserId: holding.ownerId,
                    businessName: holding.businessName,
                    fromUserName: this.userProfile?.name || this.currentUser.email || "A fellow investor",
                    currentUser: this.currentUser
                  });
                  yield this.socialService.sendStockholderReminder(this.currentUser.id, holding.ownerId, holding.businessName, this.userProfile?.name || this.currentUser.email || "A fellow investor");
                  this.markReminderSent(holding.businessId);
                  const successToast = yield this.toastController.create({
                    message: `\u2705 Reminder sent to ${holding.ownerName}!`,
                    duration: 3e3,
                    color: "success"
                  });
                  yield successToast.present();
                } catch (error) {
                  console.error("\u274C Detailed error sending reminder:", {
                    error,
                    errorMessage: error?.message,
                    holding,
                    currentUser: this.currentUser
                  });
                  const errorToast = yield this.toastController.create({
                    message: `\u274C Failed to send reminder: ${error?.message || "Please try again."}`,
                    duration: 4e3,
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
        console.error("Error creating reminder alert:", error);
      }
    });
  }
  /**
   * Get unique owners from friend businesses for filter dropdown
   */
  getUniqueOwners() {
    const owners = this.friendBusinesses.map((business2) => business2.ownerName);
    return [...new Set(owners)].sort();
  }
  /**
   * Get filtered businesses based on selected owner filter
   */
  getFilteredBusinesses() {
    if (!this.selectedOwnerFilter || this.selectedOwnerFilter === "") {
      return this.friendBusinesses;
    }
    return this.friendBusinesses.filter((business2) => business2.ownerName === this.selectedOwnerFilter);
  }
  /**
   * Handle owner filter change
   */
  onOwnerFilterChange() {
    if (this.selectedOwnerFilter) {
      localStorage.setItem("stocks-owner-filter", this.selectedOwnerFilter);
    } else {
      localStorage.removeItem("stocks-owner-filter");
    }
  }
  /**
   * Get display text for current owner filter
   */
  getOwnerFilterDisplayText() {
    return this.selectedOwnerFilter || "All Owners";
  }
  /**
   * Clear the owner filter
   */
  clearOwnerFilter() {
    this.selectedOwnerFilter = "";
    localStorage.removeItem("stocks-owner-filter");
  }
  /**
   * Format large numbers with abbreviations (K, M, B, T)
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
   * Get displayed net worth (formatted or exact)
   */
  getDisplayedNetWorth() {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1e3 && !this.showDetailedNetWorth) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
   * Toggle net worth display between abbreviated and detailed
   */
  toggleNetWorthDisplay() {
    this.showDetailedNetWorth = !this.showDetailedNetWorth;
  }
  /**
   * Toggle cash display between abbreviated and detailed
   */
  toggleCashDisplay() {
    this.showDetailedCash = !this.showDetailedCash;
  }
};
_StocksPage.\u0275fac = function StocksPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _StocksPage)(\u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(HabitBusinessService), \u0275\u0275directiveInject(SocialService), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(ToastController), \u0275\u0275directiveInject(AlertController));
};
_StocksPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _StocksPage, selectors: [["app-stocks"]], hostBindings: function StocksPage_HostBindings(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275listener("resize", function StocksPage_resize_HostBindingHandler($event) {
      return ctx.onResize($event);
    }, \u0275\u0275resolveWindow);
  }
}, decls: 58, vars: 23, consts: [[3, "translucent"], [1, "page-toolbar"], ["slot", "end", "fill", "clear", "class", "header-action-btn receipt-btn", "aria-label", "Weekly Receipt", 3, "click", 4, "ngIf"], ["slot", "end", "fill", "clear", "routerLink", "/settings", 4, "ngIf"], ["slot", "end", "fill", "clear", 3, "click", 4, "ngIf"], [1, "ion-padding", 3, "fullscreen"], [1, "page-container"], [1, "user-info"], [1, "welcome-section"], [1, "welcome-text"], ["class", "cash-display", 4, "ngIf"], [1, "stats-grid", "ion-margin-bottom", "desktop-tabs", 2, "grid-template-columns", "1fr 1fr"], [1, "stat-card", "clickable-card", 3, "click"], [1, "stat-content"], ["name", "trending-up-outline", 3, "color"], [1, "stat-info"], ["name", "pie-chart-outline", 3, "color"], [1, "mobile-combined-tab", "ion-margin-bottom"], [1, "stat-card"], [1, "combined-tab-header", 3, "click"], [1, "tab-info"], [1, "tab-icon-title"], ["color", "primary", 3, "name"], [1, "toggle-indicator"], ["name", "swap-horizontal", "color", "medium"], [1, "toggle-text"], ["class", "my-habit-businesses ion-margin-bottom", 4, "ngIf"], ["mainButton", "home"], [3, "didDismiss", "isOpen"], ["slot", "end", "fill", "clear", "aria-label", "Weekly Receipt", 1, "header-action-btn", "receipt-btn", 3, "click"], ["slot", "start", 1, "receipt-coin"], [1, "btn-label"], ["slot", "end", "fill", "clear", "routerLink", "/settings"], ["name", "settings"], ["slot", "end", "fill", "clear", 3, "click"], ["name", "log-out", "slot", "start"], [1, "cash-display"], [1, "networth-display", 3, "click"], [1, "networth-amount", "clickable"], [1, "networth-label"], [1, "cash-section", 3, "click"], [1, "cash-amount", "clickable"], [1, "cash-label"], [1, "my-habit-businesses", "ion-margin-bottom"], [1, "section-header"], ["name", "trending-up-outline"], [1, "filter-section", "ion-margin-bottom"], [1, "filter-container"], [1, "filter-wrapper"], ["fill", "outline", 1, "filter-item"], ["position", "stacked"], ["placeholder", "Select Owner", "interface", "popover", "cancelText", "Cancel", "okText", "Done", 3, "ngModelChange", "ionChange", "ngModel"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], ["name", "funnel", "slot", "end", "color", "medium"], ["class", "filter-stats", 4, "ngIf"], ["class", "help-icon-container ion-margin-bottom", 4, "ngIf"], ["class", "info-card ion-margin-bottom", 4, "ngIf"], ["class", "empty-state", 4, "ngIf"], [1, "stocks-list-scroll-container"], [4, "ngIf"], [3, "value"], [1, "filter-stats"], [1, "stats-content"], [1, "filter-count"], ["fill", "clear", "size", "small", 1, "clear-filter-btn", 3, "click"], ["name", "close-circle", "slot", "start"], [1, "help-icon-container", "ion-margin-bottom"], ["name", "help-circle", "color", "medium", 3, "click"], [1, "help-text", 3, "click"], [1, "info-card", "ion-margin-bottom"], [1, "info-header"], [1, "info-title-section"], ["name", "trending-up", "color", "success"], ["fill", "clear", "size", "small", "color", "medium", 3, "click"], ["name", "close", "slot", "icon-only"], [1, "info-content"], [1, "empty-state"], ["name", "crescent"], ["class", "habit-business-item", 4, "ngFor", "ngForOf"], [1, "habit-business-item"], [1, "item-content"], [1, "business-icon"], [1, "business-info"], [2, "display", "flex", "align-items", "center", "justify-content", "space-between"], [1, "business-name"], [1, "price-badge"], [1, "current-price"], [1, "owner-section"], [1, "owner-label"], [1, "owner-name"], [1, "habit-stats"], [1, "stat-item"], [1, "stat-label"], [1, "stat-value", "streak"], [1, "stat-value"], [1, "stat-value", "dividend-potential"], [1, "habit-grid-wrapper"], [3, "businessId", "businessName", "businessEmoji", "businessType", "isModal", "showStats", "useCalendarYear", "size", "isStockView"], [2, "width", "1px", "background", "linear-gradient(\n                    to bottom,\n                    transparent 0%,\n                    var(--ion-color-medium-tint) 10%,\n                    var(--ion-color-medium) 50%,\n                    var(--ion-color-medium-tint) 90%,\n                    transparent 100%\n                  )", "margin", "0 16px", "align-self", "stretch"], [1, "earnings-section"], [1, "earnings-total"], [1, "total-amount"], [1, "earnings-label"], [1, "checkin-action"], ["fill", "solid", "color", "success", "size", "small", 3, "click", "disabled"], ["name", "add-circle", "slot", "start"], ["name", "funnel", "size", "large", "color", "medium"], ["fill", "outline", "color", "medium", 3, "click"], ["name", "trending-up-outline", "size", "large"], ["name", "pie-chart-outline"], ["name", "pie-chart", "color", "primary"], [1, "stats-grid", "ion-margin-bottom", "desktop-stats"], ["name", "wallet", "color", "secondary"], ["name", "wallet", "color", "primary"], ["name", "trending-up", 3, "color"], [1, "mobile-stats-carousel", "ion-margin-bottom"], [1, "carousel-container", 3, "touchstart", "touchend"], ["class", "stat-card carousel-card", 4, "ngIf"], [1, "carousel-indicators"], ["class", "indicator", 3, "active", "click", 4, "ngFor", "ngForOf"], [1, "stat-card", "carousel-card"], [3, "name", "color"], [1, "indicator", 3, "click"], [1, "shares-owned"], ["class", "shares-owned", 4, "ngIf"], [1, "stat-item", "holding-actions-stat"], [1, "holding-actions-buttons", 2, "display", "flex", "gap", "8px", "align-items", "center"], ["fill", "outline", "size", "small", "color", "success", "class", "buy-more-button", 3, "disabled", "click", 4, "ngIf"], ["fill", "outline", "size", "small", "color", "warning", 1, "sell-button", 3, "click"], ["name", "trending-down", "slot", "start"], ["fill", "clear", "size", "small", 1, "remind-button", 3, "click", "disabled"], ["fill", "outline", "size", "small", "color", "success", 1, "buy-more-button", 3, "click", "disabled"], ["name", "pie-chart-outline", "size", "large"], ["color", "primary", 3, "click"], ["name", "trending-up", "slot", "start"], ["slot", "end"], [3, "click"], ["name", "close"], [1, "ion-padding"], ["class", "sell-modal-content", 4, "ngIf"], [1, "sell-modal-content"], [1, "business-header"], [1, "business-emoji"], [1, "holdings-info", 2, "color", "#c0c0c0"], [1, "sell-controls"], ["placeholder", "Select quantity", "interface", "popover", 3, "ngModelChange", "ngModel"], ["class", "sell-preview", 4, "ngIf"], ["expand", "block", "color", "danger", 3, "click", "disabled"], [1, "sell-preview"], ["expand", "block", "color", "success", 3, "click", "disabled"]], template: function StocksPage_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header", 0)(1, "ion-toolbar", 1)(2, "ion-title");
    \u0275\u0275text(3, "\u{1F4C8} Stock Market");
    \u0275\u0275elementEnd();
    \u0275\u0275template(4, StocksPage_ion_button_4_Template, 5, 0, "ion-button", 2)(5, StocksPage_ion_button_5_Template, 2, 0, "ion-button", 3)(6, StocksPage_ion_button_6_Template, 3, 0, "ion-button", 4);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "ion-content", 5)(8, "div", 6)(9, "div", 7)(10, "div", 8)(11, "div", 9)(12, "h2");
    \u0275\u0275text(13, "\u{1F4B0} Friend Habit Businesses");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "p");
    \u0275\u0275text(15, "Invest in your friends' success and earn dividends!");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(16, StocksPage_div_16_Template, 11, 2, "div", 10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 11)(18, "ion-card", 12);
    \u0275\u0275listener("click", function StocksPage_Template_ion_card_click_18_listener() {
      return ctx.selectTab("available");
    });
    \u0275\u0275elementStart(19, "ion-card-content")(20, "div", 13);
    \u0275\u0275element(21, "ion-icon", 14);
    \u0275\u0275elementStart(22, "div", 15)(23, "h2");
    \u0275\u0275text(24, " Available ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "p");
    \u0275\u0275text(26, "Browse Stocks");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(27, "ion-card", 12);
    \u0275\u0275listener("click", function StocksPage_Template_ion_card_click_27_listener() {
      return ctx.selectTab("portfolio");
    });
    \u0275\u0275elementStart(28, "ion-card-content")(29, "div", 13);
    \u0275\u0275element(30, "ion-icon", 16);
    \u0275\u0275elementStart(31, "div", 15)(32, "h2");
    \u0275\u0275text(33, " Portfolio ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "p");
    \u0275\u0275text(35, "My Investments");
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275elementStart(36, "div", 17)(37, "ion-card", 18)(38, "ion-card-content")(39, "div", 19);
    \u0275\u0275listener("click", function StocksPage_Template_div_click_39_listener() {
      return ctx.toggleMobileTab();
    });
    \u0275\u0275elementStart(40, "div", 20)(41, "div", 21);
    \u0275\u0275element(42, "ion-icon", 22);
    \u0275\u0275elementStart(43, "h2");
    \u0275\u0275text(44);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(45, "p");
    \u0275\u0275text(46);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(47, "div", 23);
    \u0275\u0275element(48, "ion-icon", 24);
    \u0275\u0275elementStart(49, "span", 25);
    \u0275\u0275text(50, "Tap to switch");
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275template(51, StocksPage_div_51_Template, 24, 9, "div", 26)(52, StocksPage_div_52_Template, 12, 6, "div", 26);
    \u0275\u0275elementEnd();
    \u0275\u0275element(53, "app-bottom-nav", 27);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "ion-modal", 28);
    \u0275\u0275listener("didDismiss", function StocksPage_Template_ion_modal_didDismiss_54_listener() {
      return ctx.closeSellModal();
    });
    \u0275\u0275template(55, StocksPage_ng_template_55_Template, 9, 1, "ng-template");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(56, "ion-modal", 28);
    \u0275\u0275listener("didDismiss", function StocksPage_Template_ion_modal_didDismiss_56_listener() {
      return ctx.closeBuyModal();
    });
    \u0275\u0275template(57, StocksPage_ng_template_57_Template, 9, 1, "ng-template");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("fullscreen", true);
    \u0275\u0275advance(9);
    \u0275\u0275property("ngIf", ctx.userProfile);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active-tab", ctx.selectedTab === "available");
    \u0275\u0275advance(3);
    \u0275\u0275property("color", ctx.selectedTab === "available" ? "primary" : "medium");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", ctx.selectedTab === "available" ? "var(--ion-color-primary)" : "var(--ion-color-medium)");
    \u0275\u0275advance(4);
    \u0275\u0275classProp("active-tab", ctx.selectedTab === "portfolio");
    \u0275\u0275advance(3);
    \u0275\u0275property("color", ctx.selectedTab === "portfolio" ? "primary" : "medium");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", ctx.selectedTab === "portfolio" ? "var(--ion-color-primary)" : "var(--ion-color-medium)");
    \u0275\u0275advance(10);
    \u0275\u0275property("name", ctx.selectedTab === "available" ? "trending-up-outline" : "pie-chart-outline");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.selectedTab === "available" ? "Available Stocks" : "My Portfolio", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx.selectedTab === "available" ? "Browse investment opportunities" : "View your investments", " ");
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", ctx.selectedTab === "available");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.selectedTab === "portfolio");
    \u0275\u0275advance(2);
    \u0275\u0275property("isOpen", ctx.showSellModal);
    \u0275\u0275advance(2);
    \u0275\u0275property("isOpen", ctx.showBuyModal);
  }
}, dependencies: [
  CommonModule,
  NgForOf,
  NgIf,
  FormsModule,
  NgControlStatus,
  NgModel,
  RouterLink,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
  IonButtons,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  BottomNavComponent,
  HabitGridComponent
], styles: ['\n\n.page-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%] {\n  --padding-start: 8px;\n  --padding-end: 8px;\n}\n.page-toolbar[_ngcontent-%COMP%]   .receipt-coin[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  margin-inline-end: 6px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at 30% 30%,\n      #ffe985 0%,\n      #ffd700 45%,\n      #e6a800 100%);\n  color: #3a2a00;\n  font-size: 0.85rem;\n  font-weight: 800;\n  line-height: 1;\n  box-shadow:\n    0 0 6px rgba(255, 215, 0, 0.7),\n    0 0 14px rgba(255, 215, 0, 0.35),\n    inset 0 1px 1px rgba(255, 255, 255, 0.6),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.page-toolbar[_ngcontent-%COMP%]   .receipt-btn[_ngcontent-%COMP%]:hover   .receipt-coin[_ngcontent-%COMP%], \n.page-toolbar[_ngcontent-%COMP%]   .receipt-btn[_ngcontent-%COMP%]:focus-visible   .receipt-coin[_ngcontent-%COMP%] {\n  transform: scale(1.12) rotate(-6deg);\n  box-shadow:\n    0 0 10px rgba(255, 215, 0, 0.9),\n    0 0 22px rgba(255, 215, 0, 0.5),\n    inset 0 1px 1px rgba(255, 255, 255, 0.7),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n}\n.page-toolbar[_ngcontent-%COMP%]   .receipt-btn[_ngcontent-%COMP%]:active   .receipt-coin[_ngcontent-%COMP%] {\n  transform: scale(0.95);\n}\n@media (max-width: 480px) {\n  .page-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%] {\n    --padding-start: 6px;\n    --padding-end: 6px;\n  }\n  .page-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%]   .btn-label[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .page-toolbar[_ngcontent-%COMP%]   .header-action-btn[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    margin: 0;\n  }\n  .page-toolbar[_ngcontent-%COMP%]   .receipt-coin[_ngcontent-%COMP%] {\n    margin-inline-end: 0;\n  }\n}\nion-content[_ngcontent-%COMP%] {\n}\n@supports (-webkit-touch-callout: none) {\n  ion-content[_ngcontent-%COMP%] {\n    height: 100% !important;\n    min-height: 100% !important;\n  }\n}\n.scrollable-content[_ngcontent-%COMP%] {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n@supports (-webkit-touch-callout: none) {\n  .scrollable-content[_ngcontent-%COMP%] {\n    height: calc(100vh - 60px);\n    height: calc(100dvh - 60px);\n    overflow-y: scroll !important;\n    -webkit-overflow-scrolling: touch !important;\n  }\n}\n.scrollable-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container[_ngcontent-%COMP%] {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n}\n@supports (-webkit-touch-callout: none) {\n  .page-container[_ngcontent-%COMP%] {\n    min-height: calc(100vh - 60px);\n    min-height: calc(100dvh - 60px);\n    padding-bottom: calc(90px + env(safe-area-inset-bottom));\n  }\n}\n.filter-section[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-start;\n  width: 100%;\n  padding-left: 16px;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%] {\n  max-width: 320px;\n  width: 100%;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-start;\n  margin-bottom: 12px;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%] {\n  --background: rgba(255, 255, 255, 0.08);\n  --border-radius: 16px;\n  --padding-start: 20px;\n  --padding-end: 20px;\n  --padding-top: 16px;\n  --padding-bottom: 16px;\n  --border-color: rgba(255, 215, 0, 0.3);\n  --border-width: 2px;\n  --highlight-color-focused: var(--ion-color-primary);\n  --min-height: 70px;\n  width: 100%;\n  border: 2px solid rgba(255, 215, 0, 0.2);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  transition: all 0.3s ease;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%]:hover {\n  --border-color: rgba(255, 215, 0, 0.5);\n  transform: translateY(-1px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  color: #FFD700;\n  font-size: 0.8rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 8px;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%]   .current-filter[_ngcontent-%COMP%] {\n  color: #FFFFFF;\n  font-weight: 600;\n  font-size: 0.85rem;\n  text-transform: none;\n  letter-spacing: normal;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%]   ion-select[_ngcontent-%COMP%] {\n  color: #FFFFFF;\n  font-weight: 500;\n  font-size: 0.95rem;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n  --placeholder-color: rgba(255, 255, 255, 0.6);\n  --placeholder-opacity: 1;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%]   ion-select[_ngcontent-%COMP%]::part(text) {\n  color: #FFFFFF !important;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%]   ion-select[_ngcontent-%COMP%]::part(placeholder) {\n  color: rgba(255, 255, 255, 0.6) !important;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: #FFD700;\n  font-size: 1.2rem;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 12px;\n  padding: 8px 16px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%]   .filter-count[_ngcontent-%COMP%] {\n  color: var(--ion-color-medium);\n  font-size: 0.85rem;\n  font-weight: 500;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%]   .clear-filter-btn[_ngcontent-%COMP%] {\n  --color: #FF6B6B;\n  --background: rgba(255, 107, 107, 0.1);\n  --border-radius: 8px;\n  --padding-start: 8px;\n  --padding-end: 8px;\n  height: 28px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  border: 1px solid rgba(255, 107, 107, 0.3);\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%]   .clear-filter-btn[_ngcontent-%COMP%]:hover {\n  --background: rgba(255, 107, 107, 0.2);\n  --color: #FF5252;\n}\n.filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%]   .clear-filter-btn[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 14px;\n}\n@media (max-width: 768px) {\n  .filter-section[_ngcontent-%COMP%] {\n    justify-content: center;\n    padding-right: 0;\n  }\n  .filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%] {\n    max-width: 280px;\n  }\n  .filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%] {\n    justify-content: center;\n  }\n  .filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-wrapper[_ngcontent-%COMP%]   .filter-item[_ngcontent-%COMP%] {\n    --padding-start: 16px;\n    --padding-end: 16px;\n    --padding-top: 14px;\n    --padding-bottom: 14px;\n    --min-height: 65px;\n  }\n  .filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%] {\n    justify-content: center;\n  }\n  .filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%] {\n    padding: 6px 12px;\n    gap: 8px;\n  }\n  .filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%]   .filter-count[_ngcontent-%COMP%] {\n    font-size: 0.8rem;\n  }\n  .filter-section[_ngcontent-%COMP%]   .filter-container[_ngcontent-%COMP%]   .filter-stats[_ngcontent-%COMP%]   .stats-content[_ngcontent-%COMP%]   .clear-filter-btn[_ngcontent-%COMP%] {\n    height: 24px;\n    font-size: 0.7rem;\n  }\n}\n.header-section[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 20px;\n  padding: 16px;\n}\n.header-section[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.6rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.header-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 1rem;\n}\n.tab-switcher[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  margin-bottom: 20px;\n  padding: 0 16px;\n}\n.tab-switcher[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  flex: 1;\n  --border-radius: 10px;\n  font-weight: 600;\n}\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));\n  gap: 8px;\n  margin-bottom: 24px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.clickable-card[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.clickable-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.clickable-card[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.clickable-card.active-tab[_ngcontent-%COMP%] {\n  border: 2px solid var(--ion-color-primary);\n  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(255, 215, 0, 0.05) 0%,\n      rgba(255, 165, 0, 0.02) 100%);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 16px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.8rem;\n  font-weight: bold;\n  color: var(--cash-color);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.85rem;\n}\n.dividend-potential[_ngcontent-%COMP%] {\n  color: var(--ion-color-success) !important;\n  font-weight: 600;\n}\n.user-info[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.8);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%] {\n  text-align: right;\n  display: flex;\n  align-items: flex-end;\n  gap: 16px;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #FFD700;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]:hover {\n  transform: scale(1.02);\n  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]:active {\n  transform: scale(0.98);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]   .networth-amount[_ngcontent-%COMP%] {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #FFD700;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]   .networth-amount.clickable[_ngcontent-%COMP%] {\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%]   .networth-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #00FF7F;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(0, 255, 127, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%]:hover {\n  transform: scale(1.02);\n  box-shadow: 0 0 15px rgba(0, 255, 127, 0.5);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%]:active {\n  transform: scale(0.98);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount[_ngcontent-%COMP%] {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #00FF7F;\n  text-shadow: 0 0 8px rgba(0, 255, 127, 0.4);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount.clickable[_ngcontent-%COMP%] {\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n@media (max-width: 480px) {\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: space-between;\n    gap: 12px;\n    margin-top: 12px;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-display[_ngcontent-%COMP%], \n   .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-section[_ngcontent-%COMP%] {\n    flex: 1;\n    align-items: center;\n    padding: 8px;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .networth-amount[_ngcontent-%COMP%], \n   .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount[_ngcontent-%COMP%] {\n    font-size: 1.1rem !important;\n  }\n}\n.stocks-list-scroll-container[_ngcontent-%COMP%] {\n  max-height: calc(100vh - 450px);\n  overflow-y: auto;\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n  padding-right: 4px;\n}\n@supports (-webkit-touch-callout: none) {\n  .stocks-list-scroll-container[_ngcontent-%COMP%] {\n    max-height: calc(100vh - 450px);\n    max-height: calc(100dvh - 450px);\n    overflow-y: scroll !important;\n  }\n}\n.stocks-list-scroll-container[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 6px;\n}\n.stocks-list-scroll-container[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 3px;\n}\n.stocks-list-scroll-container[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(255, 215, 0, 0.3);\n  border-radius: 3px;\n}\n.stocks-list-scroll-container[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: rgba(255, 215, 0, 0.5);\n}\n@media (max-width: 768px) {\n  .stocks-list-scroll-container[_ngcontent-%COMP%] {\n    max-height: calc(100vh - 400px);\n    max-height: calc(100dvh - 400px);\n  }\n}\n@media (max-width: 480px) {\n  .stocks-list-scroll-container[_ngcontent-%COMP%] {\n    max-height: calc(100vh - 380px);\n    max-height: calc(100dvh - 380px);\n  }\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 0 8px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 12px 0;\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      var(--ion-color-primary),\n      transparent);\n  opacity: 0.6;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 20px;\n  position: relative;\n  min-width: 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%] {\n  font-size: 2.5rem;\n  min-width: 50px;\n  width: 50px;\n  text-align: center;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n  padding-right: 12px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-size: 1.2rem;\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .owner-section[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n  text-align: center;\n  max-width: 400px;\n  margin-left: auto;\n  margin-right: auto;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .owner-section[_ngcontent-%COMP%]   .owner-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 2px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .owner-section[_ngcontent-%COMP%]   .owner-name[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  line-height: 1.4;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-description[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  line-height: 1.4;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: nowrap;\n  gap: 10px;\n  justify-content: center;\n  max-width: 100%;\n  margin: 0 auto 12px auto;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  text-align: center;\n  flex: 1;\n  min-width: 65px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.2px;\n  margin-bottom: 2px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n  font-weight: bold;\n  font-size: 0.82rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value.streak[_ngcontent-%COMP%] {\n  color: var(--streak-color);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value.total-earned[_ngcontent-%COMP%] {\n  color: var(--earnings-color);\n  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .content-wrapper {\n  width: fit-content !important;\n  display: flex !important;\n  justify-content: center !important;\n  padding: 0 !important;\n  margin: 0 !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n  width: fit-content !important;\n  max-width: fit-content !important;\n  background: rgba(0, 0, 0, 0.3) !important;\n  border-radius: 8px !important;\n  border-top: 1px solid rgba(255, 215, 0, 0.2) !important;\n  padding: 8px !important;\n  border: 1px solid rgba(255, 215, 0, 0.2) !important;\n  margin: 0 !important;\n  overflow: visible !important;\n  display: inline-block !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .grid-header {\n  margin-bottom: 8px !important;\n  width: fit-content !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .month-labels {\n  font-size: 10px !important;\n  width: fit-content !important;\n  margin-left: 20px !important;\n  margin-bottom: 8px !important;\n  overflow: visible !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .grid-wrapper {\n  width: fit-content !important;\n  overflow: visible !important;\n  padding-bottom: 0 !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid {\n  width: fit-content !important;\n  overflow: visible !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .grid-stats {\n  display: none !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 4px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .current-price[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .price-change[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  padding: 2px 6px;\n  border-radius: 6px;\n  font-weight: 600;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .price-change.price-up[_ngcontent-%COMP%] {\n  color: #10dc60;\n  background: rgba(16, 220, 96, 0.15);\n  border: 1px solid rgba(16, 220, 96, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .price-change.price-down[_ngcontent-%COMP%] {\n  color: #ff4757;\n  background: rgba(255, 71, 87, 0.15);\n  border: 1px solid rgba(255, 71, 87, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .price-change.price-neutral[_ngcontent-%COMP%] {\n  color: #b0b0b0;\n  background: rgba(176, 176, 176, 0.15);\n  border: 1px solid rgba(176, 176, 176, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .shares-owned[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: rgba(255, 255, 255, 0.7);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%] {\n  text-align: center;\n  min-width: 120px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  font-weight: bold;\n  color: var(--earnings-color);\n  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount.profit[_ngcontent-%COMP%] {\n  color: #10dc60;\n  text-shadow: 0 0 8px rgba(16, 220, 96, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount.loss[_ngcontent-%COMP%] {\n  color: #f53d3d;\n  text-shadow: 0 0 8px rgba(245, 61, 61, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .earnings-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 4px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .profit-loss[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .profit-loss.profit[_ngcontent-%COMP%] {\n  color: #10dc60;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .profit-loss.loss[_ngcontent-%COMP%] {\n  color: #f53d3d;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%] {\n  margin-top: 8px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[color=success][_ngcontent-%COMP%] {\n  --background: var(--earnings-color);\n  --color: #000000;\n  --box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[color=secondary][_ngcontent-%COMP%] {\n  --background: rgba(255, 165, 0, 0.8);\n  --color: #000000;\n  --box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 40px 20px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 4rem;\n  color: var(--ion-color-medium);\n  margin-bottom: 16px;\n  opacity: 0.6;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-spinner[_ngcontent-%COMP%] {\n  --color: var(--ion-color-primary);\n  transform: scale(1.5);\n  margin-bottom: 16px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.8);\n  margin: 0 0 12px 0;\n  font-size: 1.2rem;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n  margin: 0 0 8px 0;\n  line-height: 1.5;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  --padding-start: 20px;\n  --padding-end: 20px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  margin-top: 16px;\n  font-size: 0.95rem;\n  font-weight: 600;\n  height: 44px;\n  width: auto;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   .button-native[_ngcontent-%COMP%] {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  margin-right: 8px;\n  display: inline-flex;\n  align-items: center;\n  vertical-align: middle;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .empty-state[_ngcontent-%COMP%]   ion-button[color=primary][_ngcontent-%COMP%] {\n  --box-shadow: 0 3px 10px rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.help-icon-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 16px;\n  cursor: pointer;\n}\n.help-icon-container[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  transition: color 0.2s ease;\n}\n.help-icon-container[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  transition: color 0.2s ease;\n}\n.help-icon-container[_ngcontent-%COMP%]:hover   ion-icon[_ngcontent-%COMP%] {\n  --ion-color-base: var(--ion-color-primary);\n}\n.help-icon-container[_ngcontent-%COMP%]:hover   .help-text[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.info-card[_ngcontent-%COMP%] {\n  margin: 16px;\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   .info-title-section[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   .info-title-section[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n}\n.info-card[_ngcontent-%COMP%]   .info-header[_ngcontent-%COMP%]   .info-title-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.1rem;\n  font-weight: 600;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  padding-left: 16px;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin: 4px 0;\n  font-size: 0.85rem;\n  line-height: 1.3;\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.info-card[_ngcontent-%COMP%]   .info-content[_ngcontent-%COMP%]   em[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--ion-color-success);\n  font-weight: 500;\n}\n@media (min-width: 1401px) {\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 12px;\n    max-width: 100%;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    flex: 1;\n    min-width: 75px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n    font-size: 0.7rem;\n    letter-spacing: 0.3px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n    font-size: 0.85rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]:last-child {\n    min-width: 160px;\n    flex: 1.5;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    --grid-size: 12px;\n    --grid-gap: 2px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .content-wrapper {\n    width: fit-content !important;\n    max-width: none !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    width: fit-content !important;\n    max-width: none !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n    padding: 8px !important;\n    margin: 0 !important;\n    overflow: visible !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .grid-header {\n    margin-bottom: 8px !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .grid-header .month-labels {\n    font-size: 0.7rem !important;\n    width: fit-content !important;\n    margin-left: 20px !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .grid-wrapper {\n    width: fit-content !important;\n    overflow: visible !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .grid-wrapper .habit-grid {\n    width: fit-content !important;\n    min-width: fit-content !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid {\n    width: fit-content !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid .grid-day {\n    width: 12px !important;\n    height: 12px !important;\n  }\n}\n@media (min-width: 1025px) and (max-width: 1400px) {\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 10px;\n    max-width: 100%;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    flex: 1;\n    min-width: 70px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n    font-size: 0.68rem;\n    letter-spacing: 0.2px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n    font-size: 0.82rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]:last-child {\n    min-width: 150px;\n    flex: 1.5;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    --grid-size: 16px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    max-width: 100% !important;\n    padding: 14px !important;\n    margin: 0 auto !important;\n    width: fit-content !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .month-labels {\n    font-size: 0.8rem !important;\n    margin-left: 20px !important;\n  }\n}\n@media (max-width: 1024px) and (min-width: 769px) {\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 8px;\n    max-width: 100%;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    flex: 1;\n    min-width: 65px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n    font-size: 0.65rem;\n    letter-spacing: 0.2px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n    font-size: 0.8rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]:last-child {\n    min-width: 140px;\n    flex: 1.5;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    --grid-size: 14px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    max-width: 100% !important;\n    padding: 12px !important;\n    margin: 0 auto !important;\n    width: fit-content !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .month-labels {\n    font-size: 0.75rem !important;\n    margin-left: 18px !important;\n  }\n}\n@media (max-width: 768px) {\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 8px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%] {\n    position: absolute;\n    top: 12px;\n    left: 12px;\n    font-size: 1.8rem;\n    min-width: auto;\n    width: 32px;\n    height: 32px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: rgba(0, 0, 0, 0.3);\n    border-radius: 8px;\n    border: 1px solid rgba(255, 215, 0, 0.3);\n    z-index: 10;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%] {\n    margin-left: 0;\n    padding-left: 0;\n    width: 100%;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n    margin-left: 48px;\n    margin-bottom: 4px;\n    font-size: 1.1rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .owner-section[_ngcontent-%COMP%] {\n    margin-left: 48px;\n    margin-bottom: 8px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .owner-section[_ngcontent-%COMP%]   .owner-label[_ngcontent-%COMP%] {\n    font-size: 0.7rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .owner-section[_ngcontent-%COMP%]   .owner-name[_ngcontent-%COMP%] {\n    font-size: 0.9rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-description[_ngcontent-%COMP%] {\n    margin-left: 48px;\n    margin-bottom: 8px;\n    font-size: 0.9rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 6px;\n    margin-bottom: 8px;\n    justify-content: center;\n    max-width: 100%;\n    margin-left: auto;\n    margin-right: auto;\n    flex-wrap: wrap;\n    row-gap: 10px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    text-align: center;\n    flex: 1;\n    min-width: 60px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n    font-size: 0.6rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    letter-spacing: 0.2px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n    font-size: 0.75rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item.holding-actions-stat[_ngcontent-%COMP%] {\n    flex: 1 1 100%;\n    min-width: 100%;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .holding-actions-buttons[_ngcontent-%COMP%] {\n    flex-wrap: wrap;\n    justify-content: center;\n    row-gap: 8px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    margin: 0 !important;\n    padding: 0 !important;\n    width: 100% !important;\n    display: block !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .content-wrapper {\n    width: 100% !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    display: block !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    padding: 12px 8px !important;\n    margin: 0 !important;\n    width: 100% !important;\n    max-width: 100% !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n    min-height: auto !important;\n    display: block !important;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%] {\n    align-items: flex-end;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .current-price[_ngcontent-%COMP%] {\n    font-size: 1.1rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .price-badge[_ngcontent-%COMP%]   .shares-owned[_ngcontent-%COMP%] {\n    font-size: 0.75rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%] {\n    min-width: auto;\n    width: 100%;\n    margin-top: 8px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount[_ngcontent-%COMP%] {\n    font-size: 1.2rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .earnings-label[_ngcontent-%COMP%] {\n    font-size: 0.7rem;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%] {\n    margin-top: 6px;\n  }\n  .my-habit-businesses[_ngcontent-%COMP%]   .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n    font-size: 0.8rem;\n    --padding-start: 12px;\n    --padding-end: 12px;\n    --padding-top: 8px;\n    --padding-bottom: 8px;\n  }\n}\n.profit[_ngcontent-%COMP%] {\n  color: #10dc60 !important;\n}\n.loss[_ngcontent-%COMP%] {\n  color: #f53d3d !important;\n}\n@media (max-width: 1299px) {\n  .desktop-only[_ngcontent-%COMP%] {\n    display: none !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 1023px) {\n  .stats-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n    gap: 16px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%] {\n    gap: 16px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%] {\n    font-size: 2.8rem;\n    min-width: 70px;\n    padding-right: 8px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%] {\n    flex: 1;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n    font-size: 1.2rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 8px;\n    flex-wrap: nowrap;\n    justify-content: center;\n    max-width: 100%;\n    margin: 0 auto 12px auto;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    flex: 1;\n    min-width: 65px;\n    text-align: center;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    padding: 10px !important;\n    margin: 0 auto !important;\n    width: 100% !important;\n    max-width: 100% !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .month-labels {\n    font-size: 9px !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%] {\n    min-width: 110px;\n    flex-shrink: 0;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount[_ngcontent-%COMP%] {\n    font-size: 1.2rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .earnings-label[_ngcontent-%COMP%] {\n    font-size: 0.7rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n    font-size: 0.8rem;\n    --padding-start: 14px;\n    --padding-end: 14px;\n  }\n}\n@media (min-width: 1025px) and (max-width: 1400px) {\n  .stats-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(3, 1fr);\n    gap: 20px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%] {\n    font-size: 3rem;\n    min-width: 80px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n    font-size: 1.4rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 12px;\n    justify-content: center;\n    max-width: 100%;\n    margin: 0 auto 12px auto;\n    flex-wrap: nowrap;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    flex: 1;\n    min-width: 75px;\n    text-align: center;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    --grid-size: 16px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    padding: 14px !important;\n    margin: 0 auto !important;\n    width: fit-content !important;\n    overflow: visible !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .month-labels {\n    font-size: 0.8rem !important;\n    margin-left: 20px !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%] {\n    min-width: 140px;\n  }\n}\n@media (max-width: 768px) {\n  .desktop-stats[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%] {\n    display: block;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%] {\n    position: relative;\n    width: 100%;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%] {\n    margin: 0;\n    width: 100%;\n    min-height: 100px;\n    background: var(--business-item-background);\n    border: var(--business-item-border);\n    border-radius: 12px;\n    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%] {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    justify-content: center;\n    text-align: center;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n    font-size: 28px;\n    min-width: 36px;\n    color: var(--ion-color-primary);\n    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n    margin: 0;\n    font-size: 1.5rem;\n    font-weight: bold;\n    color: var(--cash-color);\n    text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   h2.profit[_ngcontent-%COMP%] {\n    color: var(--ion-color-success);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   h2.loss[_ngcontent-%COMP%] {\n    color: var(--ion-color-danger);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   .stat-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n    margin: 4px 0 0 0;\n    font-size: 1rem;\n    color: rgba(255, 255, 255, 0.8);\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-indicators[_ngcontent-%COMP%] {\n    display: flex;\n    justify-content: center;\n    gap: 8px;\n    margin-top: 12px;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-indicators[_ngcontent-%COMP%]   .indicator[_ngcontent-%COMP%] {\n    width: 8px;\n    height: 8px;\n    border-radius: 50%;\n    background-color: var(--ion-color-light);\n    cursor: pointer;\n    transition: background-color 0.2s ease;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%]   .carousel-container[_ngcontent-%COMP%]   .carousel-indicators[_ngcontent-%COMP%]   .indicator.active[_ngcontent-%COMP%] {\n    background-color: var(--ion-color-primary);\n  }\n  .habit-business-item[_ngcontent-%COMP%] {\n    margin: 8px 0;\n    padding: 12px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%] {\n    flex-direction: column;\n    gap: 16px;\n    align-items: stretch;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%] {\n    font-size: 2rem;\n    min-width: auto;\n    width: auto;\n    text-align: center;\n    padding-right: 0;\n    align-self: center;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%] {\n    text-align: center;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n    font-size: 1.1rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    justify-content: center;\n    gap: 8px;\n    max-width: 100%;\n    margin: 0 auto 12px auto;\n    flex-wrap: nowrap;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    flex: 1;\n    min-width: 65px;\n    text-align: center;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    margin: 0 !important;\n    padding: 0 !important;\n    width: 100% !important;\n    display: block !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .content-wrapper {\n    width: 100% !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    display: block !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    padding: 8px 4px !important;\n    margin: 0 !important;\n    width: 100% !important;\n    max-width: 100% !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%] {\n    min-width: auto;\n    width: 100%;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount[_ngcontent-%COMP%] {\n    font-size: 1.2rem;\n  }\n}\n@media (max-width: 480px) {\n  .habit-business-item[_ngcontent-%COMP%] {\n    margin: 6px 0;\n    padding: 10px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%] {\n    gap: 12px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-name[_ngcontent-%COMP%] {\n    font-size: 1rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%] {\n    gap: 4px;\n    justify-content: center;\n    max-width: 100%;\n    margin: 0 auto 8px auto;\n    flex-wrap: nowrap;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%] {\n    text-align: center;\n    flex: 1;\n    min-width: 55px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n    font-size: 0.55rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    letter-spacing: 0.1px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .habit-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n    font-size: 0.7rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%] {\n    --grid-size: 7px;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .habit-grid-container {\n    padding: 6px !important;\n    margin: 0 auto !important;\n    width: 100% !important;\n    max-width: 100% !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   app-habit-grid[_ngcontent-%COMP%]     .month-labels {\n    font-size: 8px !important;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .total-amount[_ngcontent-%COMP%] {\n    font-size: 1.1rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .earnings-label[_ngcontent-%COMP%] {\n    font-size: 0.7rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .earnings-total[_ngcontent-%COMP%]   .profit-loss[_ngcontent-%COMP%] {\n    font-size: 0.8rem;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .item-content[_ngcontent-%COMP%]   .earnings-section[_ngcontent-%COMP%]   .checkin-action[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n    font-size: 0.8rem;\n    --padding-start: 12px;\n    --padding-end: 12px;\n    --padding-top: 8px;\n    --padding-bottom: 8px;\n  }\n}\n@media (min-width: 769px) {\n  .desktop-stats[_ngcontent-%COMP%] {\n    display: grid;\n  }\n  .mobile-stats-carousel[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n.mobile-combined-tab[_ngcontent-%COMP%] {\n  display: none;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  cursor: pointer;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .tab-info[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .tab-info[_ngcontent-%COMP%]   .tab-icon-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 4px;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .tab-info[_ngcontent-%COMP%]   .tab-icon-title[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n  min-width: 32px;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .tab-info[_ngcontent-%COMP%]   .tab-icon-title[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.3rem;\n  font-weight: 600;\n  color: var(--ion-color-primary);\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .tab-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .toggle-indicator[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  min-width: 60px;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .toggle-indicator[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n}\n.mobile-combined-tab[_ngcontent-%COMP%]   .combined-tab-header[_ngcontent-%COMP%]   .toggle-indicator[_ngcontent-%COMP%]   .toggle-text[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--ion-color-medium);\n  text-align: center;\n}\n@media (max-width: 768px) {\n  .desktop-tabs[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .mobile-combined-tab[_ngcontent-%COMP%] {\n    display: block;\n  }\n}\n@media (min-width: 769px) {\n  .desktop-tabs[_ngcontent-%COMP%] {\n    display: grid;\n  }\n  .mobile-combined-tab[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n.sell-modal-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 15px;\n  margin-bottom: 10px;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%]   .business-emoji[_ngcontent-%COMP%] {\n  font-size: 2.5rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 60px;\n  height: 60px;\n  background: var(--ion-color-light);\n  border-radius: 12px;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.4rem;\n  font-weight: 600;\n  color: var(--ion-text-color, #000);\n}\n.sell-modal-content[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 5px 0 0 0;\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 0.95rem;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .holdings-info[_ngcontent-%COMP%] {\n  background: var(--ion-color-light);\n  padding: 15px;\n  border-radius: 12px;\n  margin-bottom: 20px;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .holdings-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  font-size: 0.95rem;\n  color: #ffffff;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .holdings-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #ffffff;\n  font-weight: 600;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .holdings-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:first-child {\n  margin-top: 0;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .holdings-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .holdings-info[_ngcontent-%COMP%]   .profit[_ngcontent-%COMP%] {\n  color: var(--ion-color-success) !important;\n  font-weight: 600;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .holdings-info[_ngcontent-%COMP%]   .loss[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger) !important;\n  font-weight: 600;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%] {\n  --background: var(--ion-color-light);\n  --color: var(--ion-text-color, #000);\n  --border-radius: 12px;\n  --padding-start: 16px;\n  --padding-end: 16px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  --inner-padding-end: 8px;\n  margin-bottom: 15px;\n  min-height: 60px;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  color: var(--ion-text-color, #000) !important;\n  font-weight: 500;\n  margin-bottom: 8px !important;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%]   ion-select[_ngcontent-%COMP%] {\n  color: var(--ion-text-color, #000);\n  --placeholder-color: var(--ion-color-medium);\n  --padding-top: 4px;\n  --padding-bottom: 4px;\n  min-height: 40px;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   .sell-preview[_ngcontent-%COMP%] {\n  background: var(--ion-color-light);\n  border: 2px solid var(--ion-color-primary);\n  padding: 12px;\n  border-radius: 8px;\n  margin: 15px 0;\n  text-align: center;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   .sell-preview[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.1rem;\n  color: var(--ion-text-color, #000);\n  font-weight: 500;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   .sell-preview[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  font-size: 1.2rem;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   ion-button[expand=block][_ngcontent-%COMP%] {\n  margin-top: 20px;\n  --border-radius: 12px;\n  height: 50px;\n  font-weight: 600;\n}\n.sell-modal-content[_ngcontent-%COMP%]   .sell-controls[_ngcontent-%COMP%]   ion-button[expand=block][disabled][_ngcontent-%COMP%] {\n  opacity: 0.5;\n}\n/*# sourceMappingURL=stocks.page.css.map */'] });
var StocksPage = _StocksPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StocksPage, [{
    type: Component,
    args: [{ selector: "app-stocks", standalone: true, imports: [
      CommonModule,
      FormsModule,
      RouterLink,
      IonContent,
      IonHeader,
      IonTitle,
      IonToolbar,
      IonCard,
      IonCardContent,
      IonButton,
      IonIcon,
      IonBadge,
      IonSpinner,
      IonModal,
      IonButtons,
      IonItem,
      IonLabel,
      IonInput,
      IonSelect,
      IonSelectOption,
      BottomNavComponent,
      HabitGridComponent
    ], template: `<ion-header [translucent]="true">
  <ion-toolbar class="page-toolbar">
    <ion-title>\u{1F4C8} Stock Market</ion-title>
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
    >
      <ion-icon name="settings"></ion-icon>
    </ion-button>
    <ion-button *ngIf="currentUser" slot="end" fill="clear" (click)="logout()">
      <ion-icon name="log-out" slot="start"></ion-icon>
      Logout
    </ion-button>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding">
  <div class="page-container">
    <!-- Header Section -->
    <div class="user-info">
      <div class="welcome-section">
        <div class="welcome-text">
          <h2>\u{1F4B0} Friend Habit Businesses</h2>
          <p>Invest in your friends' success and earn dividends!</p>
        </div>
        <div class="cash-display" *ngIf="userProfile">
          <div class="networth-display" (click)="toggleNetWorthDisplay()">
            <div class="networth-amount clickable">
              \${{ getDisplayedNetWorth() }}
            </div>
            <div class="networth-label">NET WORTH</div>
          </div>
          <div class="cash-section" (click)="toggleCashDisplay()">
            <div class="cash-amount clickable">\${{ getDisplayedCash() }}</div>
            <div class="cash-label">HABIT CASH</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Switcher -->
    <!-- Desktop Tabs -->
    <div
      class="stats-grid ion-margin-bottom desktop-tabs"
      style="grid-template-columns: 1fr 1fr"
    >
      <ion-card
        class="stat-card clickable-card"
        [class.active-tab]="selectedTab === 'available'"
        (click)="selectTab('available')"
      >
        <ion-card-content>
          <div class="stat-content">
            <ion-icon
              name="trending-up-outline"
              [color]="selectedTab === 'available' ? 'primary' : 'medium'"
            ></ion-icon>
            <div class="stat-info">
              <h2
                [style.color]="selectedTab === 'available' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)'"
              >
                Available
              </h2>
              <p>Browse Stocks</p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card
        class="stat-card clickable-card"
        [class.active-tab]="selectedTab === 'portfolio'"
        (click)="selectTab('portfolio')"
      >
        <ion-card-content>
          <div class="stat-content">
            <ion-icon
              name="pie-chart-outline"
              [color]="selectedTab === 'portfolio' ? 'primary' : 'medium'"
            ></ion-icon>
            <div class="stat-info">
              <h2
                [style.color]="selectedTab === 'portfolio' ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)'"
              >
                Portfolio
              </h2>
              <p>My Investments</p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
    </div>

    <!-- Mobile Combined Tab -->
    <div class="mobile-combined-tab ion-margin-bottom">
      <ion-card class="stat-card">
        <ion-card-content>
          <div class="combined-tab-header" (click)="toggleMobileTab()">
            <div class="tab-info">
              <div class="tab-icon-title">
                <ion-icon
                  [name]="selectedTab === 'available' ? 'trending-up-outline' : 'pie-chart-outline'"
                  color="primary"
                >
                </ion-icon>
                <h2>
                  {{ selectedTab === 'available' ? 'Available Stocks' : 'My
                  Portfolio' }}
                </h2>
              </div>
              <p>
                {{ selectedTab === 'available' ? 'Browse investment
                opportunities' : 'View your investments' }}
              </p>
            </div>
            <div class="toggle-indicator">
              <ion-icon name="swap-horizontal" color="medium"></ion-icon>
              <span class="toggle-text">Tap to switch</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
    </div>

    <!-- Available Stocks Section -->
    <div
      *ngIf="selectedTab === 'available'"
      class="my-habit-businesses ion-margin-bottom"
    >
      <div class="section-header">
        <ion-icon name="trending-up-outline"></ion-icon>
        <h2>Available Stocks</h2>
      </div>

      <!-- Filter Section -->
      <div class="filter-section ion-margin-bottom">
        <div class="filter-container">
          <div class="filter-wrapper">
            <ion-item fill="outline" class="filter-item">
              <ion-label position="stacked">Filter by Owner</ion-label>
              <ion-select
                [(ngModel)]="selectedOwnerFilter"
                placeholder="Select Owner"
                interface="popover"
                (ionChange)="onOwnerFilterChange()"
                cancelText="Cancel"
                okText="Done"
              >
                <ion-select-option value="">All Owners</ion-select-option>
                <ion-select-option
                  *ngFor="let owner of getUniqueOwners()"
                  [value]="owner"
                >
                  {{ owner }}
                </ion-select-option>
              </ion-select>
              <ion-icon name="funnel" slot="end" color="medium"></ion-icon>
            </ion-item>
          </div>

          <div
            class="filter-stats"
            *ngIf="getFilteredBusinesses().length !== friendBusinesses.length"
          >
            <div class="stats-content">
              <span class="filter-count">
                {{ getFilteredBusinesses().length }} of {{
                friendBusinesses.length }} stocks
              </span>
              <ion-button
                fill="clear"
                size="small"
                (click)="clearOwnerFilter()"
                class="clear-filter-btn"
              >
                <ion-icon name="close-circle" slot="start"></ion-icon>
                Clear Filter
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Icon (shows when help section is hidden) -->
      <div
        *ngIf="!showHelpSection"
        class="help-icon-container ion-margin-bottom"
      >
        <ion-icon
          name="help-circle"
          color="medium"
          (click)="toggleHelpSection()"
        >
        </ion-icon>
        <span class="help-text" (click)="toggleHelpSection()"
          >How dividends work</span
        >
      </div>

      <!-- Dividend Explanation Card -->
      <ion-card *ngIf="showHelpSection" class="info-card ion-margin-bottom">
        <ion-card-content>
          <div class="info-header">
            <div class="info-title-section">
              <ion-icon name="trending-up" color="success"></ion-icon>
              <h3>How Stock Dividends Work</h3>
            </div>
            <ion-button
              fill="clear"
              size="small"
              color="medium"
              (click)="toggleHelpSection()"
            >
              <ion-icon name="close" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
          <div class="info-content">
            <div>
              <p>
                Each time a business owner completes their habit, stockholders
                receive dividends! Dividend amount depends on:
              </p>
              <ul>
                <li>
                  <strong>Base earnings:</strong> 10% of habit completion value
                </li>
                <li>
                  <strong>Streak bonus:</strong> +1% per day (up to 100% bonus)
                </li>
                <li>
                  <strong>Your ownership:</strong> Percentage of shares you own
                </li>
              </ul>
              <p><em>Higher streaks = higher dividends!</em></p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="empty-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading stocks...</p>
      </div>

      <!-- Available Stocks List -->
      <div class="stocks-list-scroll-container">
        <div *ngIf="!isLoading && getFilteredBusinesses().length > 0">
          <div
            *ngFor="let business of getFilteredBusinesses()"
            class="habit-business-item"
          >
            <div class="item-content">
              <div class="business-icon">
                {{ business.businessIcon || '\u{1F3E2}' }}
              </div>
              <div class="business-info">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                  "
                >
                  <h3 class="business-name">{{ business.businessName }}</h3>
                  <div class="price-badge">
                    <span class="current-price"
                      >\${{ business.stockPrice?.toFixed(2) || '0.00' }}</span
                    >
                  </div>
                </div>
                <div class="owner-section">
                  <div class="owner-label">Business Owner:</div>
                  <div class="owner-name">{{ business.ownerName }}</div>
                </div>
                <div class="habit-stats">
                  <div class="stat-item">
                    <div class="stat-label">Streak</div>
                    <div class="stat-value streak">
                      {{ business.streak }} days
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Available</div>
                    <div class="stat-value">
                      {{ business.sharesAvailable }} shares
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Expected/Share</div>
                    <div class="stat-value dividend-potential">
                      \${{ business.potentialDividend?.toFixed(2) || '0.00' }}
                    </div>
                  </div>
                </div>

                <!-- Habit Grid showing habit completion pattern -->
                <div class="habit-grid-wrapper">
                  <app-habit-grid
                    [businessId]="business.id"
                    [businessName]="business.businessName"
                    [businessEmoji]="business.businessIcon"
                    [businessType]="'Stock'"
                    [isModal]="false"
                    [showStats]="false"
                    [useCalendarYear]="true"
                    [size]="'medium'"
                    [isStockView]="true"
                  >
                  </app-habit-grid>
                </div>
              </div>

              <!-- Vertical separator line -->
              <div
                style="
                  width: 1px;
                  background: linear-gradient(
                    to bottom,
                    transparent 0%,
                    var(--ion-color-medium-tint) 10%,
                    var(--ion-color-medium) 50%,
                    var(--ion-color-medium-tint) 90%,
                    transparent 100%
                  );
                  margin: 0 16px;
                  align-self: stretch;
                "
              ></div>

              <div class="earnings-section">
                <div class="earnings-total">
                  <div class="total-amount">
                    \${{ business.stockPrice?.toFixed(2) || '0.00' }}
                  </div>
                  <div class="earnings-label">per share</div>
                </div>

                <!-- Buy Action -->
                <div class="checkin-action">
                  <ion-button
                    fill="solid"
                    color="success"
                    size="small"
                    (click)="openBuyModal(business)"
                    [disabled]="isLoading || !business.stockId || business.sharesAvailable <= 0"
                  >
                    <ion-icon name="add-circle" slot="start"></ion-icon>
                    Buy Shares
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for Available Stocks -->
      <div
        *ngIf="!isLoading && getFilteredBusinesses().length === 0 && friendBusinesses.length > 0"
        class="empty-state"
      >
        <ion-icon name="funnel" size="large" color="medium"></ion-icon>
        <h3>No Stocks Match Filter</h3>
        <p>
          No stocks found for the selected owner. Try selecting a different
          owner or clear the filter.
        </p>
        <ion-button fill="outline" color="medium" (click)="clearOwnerFilter()">
          <ion-icon name="close-circle" slot="start"></ion-icon>
          Clear Filter
        </ion-button>
      </div>

      <!-- Empty State for No Stocks Available -->
      <div
        *ngIf="!isLoading && friendBusinesses.length === 0"
        class="empty-state"
      >
        <ion-icon name="trending-up-outline" size="large"></ion-icon>
        <h3>No Stocks Available</h3>
        <p>
          Your friends haven't set up any habit businesses yet, or you've
          already invested in all available opportunities!
        </p>
      </div>
    </div>

    <!-- Portfolio Section -->
    <div
      *ngIf="selectedTab === 'portfolio'"
      class="my-habit-businesses ion-margin-bottom"
    >
      <div class="section-header">
        <ion-icon name="pie-chart-outline"></ion-icon>
        <h2>My Portfolio</h2>
      </div>

      <div
        *ngIf="!showPortfolioHelpSection"
        class="help-icon-container ion-margin-bottom"
      >
        <ion-icon
          name="help-circle"
          color="medium"
          (click)="togglePortfolioHelpSection()"
        >
        </ion-icon>
        <span class="help-text" (click)="togglePortfolioHelpSection()"
          >How portfolios work</span
        >
      </div>

      <!-- Portfolio Explanation Card -->
      <ion-card
        *ngIf="showPortfolioHelpSection"
        class="info-card ion-margin-bottom"
      >
        <ion-card-content>
          <div class="info-header">
            <div class="info-title-section">
              <ion-icon name="pie-chart" color="primary"></ion-icon>
              <h3>How Your Portfolio Works</h3>
            </div>
            <ion-button
              fill="clear"
              size="small"
              color="medium"
              (click)="togglePortfolioHelpSection()"
            >
              <ion-icon name="close" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
          <div class="info-content">
            <div>
              <p>
                Your portfolio shows all the stocks you own and tracks your
                investment performance:
              </p>
              <ul>
                <li>
                  <strong>Portfolio Value:</strong> Total current worth of all
                  your stocks
                </li>
                <li>
                  <strong>Profit/Loss:</strong> How much you've gained or lost
                  since buying
                </li>
                <li>
                  <strong>Daily Dividends:</strong> Money earned from other
                  users completing habits
                </li>
                <li>
                  <strong>Stock Performance:</strong> Track individual stock
                  gains and losses
                </li>
              </ul>
              <p>
                <em>Diversify your investments for steady passive income!</em>
              </p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Portfolio Summary Stats -->
      <div *ngIf="!isLoading && portfolio.length > 0">
        <!-- Desktop: Original 4-card grid -->
        <div class="stats-grid ion-margin-bottom desktop-stats">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <ion-icon name="wallet" color="secondary"></ion-icon>
                <div class="stat-info">
                  <h2>\${{ getTotalDailyDividends().toFixed(2) }}</h2>
                  <p>Today's Actual Dividends</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <ion-icon name="wallet" color="primary"></ion-icon>
                <div class="stat-info">
                  <h2>\${{ getTotalPortfolioValue().toFixed(2) }}</h2>
                  <p>Portfolio Value</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <ion-icon
                  name="trending-up"
                  [color]="getTotalPortfolioProfitLoss() >= 0 ? 'success' : 'danger'"
                ></ion-icon>
                <div class="stat-info">
                  <h2
                    [class.profit]="getTotalPortfolioProfitLoss() >= 0"
                    [class.loss]="getTotalPortfolioProfitLoss() < 0"
                  >
                    {{ getTotalPortfolioProfitLoss() >= 0 ? '+' : '' }}\${{
                    getTotalPortfolioProfitLoss().toFixed(2) }}
                  </h2>
                  <p>All-Time Gains</p>
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
              *ngIf="portfolioStats[currentStatIndex] as stat"
            >
              <ion-card-content>
                <div class="stat-content">
                  <ion-icon
                    [name]="stat.icon"
                    [color]="stat.color || stat.getColor?.()"
                  >
                  </ion-icon>
                  <div class="stat-info">
                    <h2 [class]="stat.getClass?.()">\${{ stat.getValue() }}</h2>
                    <p>{{ stat.label }}</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Carousel indicators -->
            <div class="carousel-indicators">
              <span
                *ngFor="let stat of portfolioStats; let i = index"
                class="indicator"
                [class.active]="i === currentStatIndex"
                (click)="currentStatIndex = i; stopAutoCarousel()"
              >
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="empty-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading portfolio...</p>
      </div>

      <!-- Portfolio Holdings -->
      <div class="stocks-list-scroll-container">
        <div *ngIf="!isLoading && portfolio.length > 0">
          <div *ngFor="let holding of portfolio" class="habit-business-item">
            <div class="item-content">
              <div class="business-icon">
                {{ holding.businessIcon || '\u{1F4C8}' }}
              </div>
              <div class="business-info">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                  "
                >
                  <h3 class="business-name">{{ holding.businessName }}</h3>
                  <div class="price-badge">
                    <span class="current-price"
                      >\${{ holding.currentPrice?.toFixed(2) || '0.00' }}</span
                    >
                    <span class="shares-owned"
                      >{{ holding.sharesOwned }} shares</span
                    >
                    <span
                      class="shares-owned"
                      *ngIf="getBusinessForHolding(holding) as business"
                      >{{ business.sharesAvailable }} left to buy</span
                    >
                  </div>
                </div>
                <div class="owner-section">
                  <div class="owner-label">Business Owner:</div>
                  <div class="owner-name">{{ holding.ownerName }}</div>
                </div>
                <div class="habit-stats">
                  <div class="stat-item">
                    <div class="stat-label">Avg Price</div>
                    <div class="stat-value">
                      \${{ holding.averagePurchasePrice }}
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Invested</div>
                    <div class="stat-value">\${{ holding.totalInvested }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Est./Comp.</div>
                    <div class="stat-value dividend-potential">
                      \${{ holding.dailyDividendRate?.toFixed(2) || '0.00' }}
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Streak</div>
                    <div class="stat-value streak">
                      {{ holding.businessStreak }} days
                    </div>
                  </div>
                  <div class="stat-item holding-actions-stat">
                    <div
                      class="holding-actions-buttons"
                      style="display: flex; gap: 8px; align-items: center"
                    >
                      <ion-button
                        *ngIf="canBuyMoreShares(holding)"
                        fill="outline"
                        size="small"
                        color="success"
                        (click)="openBuyModal(getBusinessForHolding(holding))"
                        [disabled]="isLoading"
                        class="buy-more-button"
                      >
                        <ion-icon name="add-circle" slot="start"></ion-icon>
                        Buy
                      </ion-button>
                      <ion-button
                        fill="outline"
                        size="small"
                        color="warning"
                        (click)="openSellModal(holding)"
                        class="sell-button"
                      >
                        <ion-icon name="trending-down" slot="start"></ion-icon>
                        Sell
                      </ion-button>
                      <ion-button
                        fill="clear"
                        size="small"
                        (click)="sendReminder(holding)"
                        class="remind-button"
                        [disabled]="isRemindButtonDisabled(holding)"
                        [style.color]="isRemindButtonDisabled(holding) ? '#999999 !important' : '#3880ff !important'"
                        [style.--color]="isRemindButtonDisabled(holding) ? '#999999 !important' : '#3880ff !important'"
                        [style.opacity]="isRemindButtonDisabled(holding) ? '0.5' : '1'"
                      >
                        <span
                          [style.color]="isRemindButtonDisabled(holding) ? '#999999 !important' : '#3880ff !important'"
                          >\u{1F449}</span
                        >
                        <span
                          [style.color]="isRemindButtonDisabled(holding) ? '#999999 !important' : '#3880ff !important'"
                        >
                          {{ hasAlreadyRemindedToday(holding.businessId) ?
                          'Reminded' : 'Remind' }}
                        </span>
                      </ion-button>
                    </div>
                  </div>
                </div>

                <!-- Habit Grid showing habit completion pattern -->
                <!-- DEBUG: stockId={{holding.stockId}} -->
                <div class="habit-grid-wrapper">
                  <app-habit-grid
                    [businessId]="holding.stockId"
                    [businessName]="holding.businessName"
                    [businessEmoji]="holding.businessIcon"
                    [businessType]="'Stock'"
                    [isModal]="false"
                    [showStats]="false"
                    [useCalendarYear]="true"
                    [size]="'medium'"
                    [isStockView]="true"
                  >
                  </app-habit-grid>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for Portfolio -->
      <div *ngIf="!isLoading && portfolio.length === 0" class="empty-state">
        <ion-icon name="pie-chart-outline" size="large"></ion-icon>
        <h3>No Investments Yet</h3>
        <p>
          Start investing in your friends' habit businesses to build your
          portfolio!
        </p>
        <ion-button (click)="selectTab('available')" color="primary">
          <ion-icon name="trending-up" slot="start"></ion-icon>
          Browse Available Stocks
        </ion-button>
      </div>
    </div>
  </div>

  <!-- Fixed Bottom Navigation -->
  <app-bottom-nav mainButton="home"></app-bottom-nav>
</ion-content>

<!-- Sell Modal -->
<ion-modal [isOpen]="showSellModal" (didDismiss)="closeSellModal()">
  <ng-template>
    <ion-header>
      <ion-toolbar>
        <ion-title>Sell Shares</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeSellModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div *ngIf="selectedHolding" class="sell-modal-content">
        <div class="business-info">
          <div class="business-header">
            <span class="business-emoji">{{ selectedHolding.emoji }}</span>
            <div>
              <h2>{{ selectedHolding.businessName }}</h2>
              <p>
                Current Share Price: \${{ selectedHolding.sharePrice.toFixed(2)
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="holdings-info" style="color: #c0c0c0">
          <p>
            <strong>Your Holdings:</strong> {{ selectedHolding.shares }} shares
          </p>
          <p>
            <strong>Total Value:</strong> \${{ (selectedHolding.shares *
            selectedHolding.sharePrice).toFixed(2) }}
          </p>
          <p>
            <strong>Profit/Loss:</strong>
            <span
              [class]="(selectedHolding.shares * selectedHolding.sharePrice - selectedHolding.totalInvested) >= 0 ? 'profit' : 'loss'"
            >
              \${{ (selectedHolding.shares * selectedHolding.sharePrice -
              selectedHolding.totalInvested).toFixed(2) }}
            </span>
          </p>
        </div>

        <div class="sell-controls">
          <ion-item>
            <ion-label position="stacked">Shares to Sell</ion-label>
            <ion-select
              [(ngModel)]="sellQuantity"
              placeholder="Select quantity"
              interface="popover"
            >
              <ion-select-option
                *ngFor="let option of getSellOptions()"
                [value]="option"
              >
                {{ option }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <div *ngIf="sellQuantity > 0" class="sell-preview">
            <p>
              <strong>Sale Amount:</strong> \${{ (sellQuantity *
              selectedHolding.sharePrice).toFixed(2) }}
            </p>
          </div>

          <ion-button
            expand="block"
            color="danger"
            [disabled]="!sellQuantity || sellQuantity <= 0 || sellQuantity > selectedHolding.shares"
            (click)="confirmSell()"
          >
            Sell {{ sellQuantity || 0 }} Shares
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ng-template>
</ion-modal>

<!-- Buy More Modal -->
<ion-modal [isOpen]="showBuyModal" (didDismiss)="closeBuyModal()">
  <ng-template>
    <ion-header>
      <ion-toolbar>
        <ion-title>Buy Shares</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeBuyModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div *ngIf="selectedBuyBusiness" class="sell-modal-content">
        <div class="business-info">
          <div class="business-header">
            <span class="business-emoji">{{ selectedBuyBusiness.businessIcon }}</span>
            <div>
              <h2>{{ selectedBuyBusiness.businessName }}</h2>
              <p>
                Current Share Price: \${{ selectedBuyBusiness.stockPrice.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <div class="holdings-info" style="color: #c0c0c0">
          <p>
            <strong>Shares Available:</strong> {{ selectedBuyBusiness.sharesAvailable }}
          </p>
          <p>
            <strong>Cash Available:</strong> \${{ (userProfile?.cash || 0).toFixed(2) }}
          </p>
        </div>

        <div class="sell-controls">
          <ion-item>
            <ion-label position="stacked">Shares to Buy</ion-label>
            <ion-select
              [(ngModel)]="buyQuantity"
              placeholder="Select quantity"
              interface="popover"
            >
              <ion-select-option
                *ngFor="let option of getBuyOptions()"
                [value]="option"
              >
                {{ option }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <p *ngIf="getBuyOptions().length === 0" class="sell-preview">
            You can't afford any shares of this stock right now.
          </p>

          <div *ngIf="buyQuantity > 0" class="sell-preview">
            <p>
              <strong>Total Cost:</strong> \${{ (buyQuantity *
              selectedBuyBusiness.stockPrice).toFixed(2) }}
            </p>
          </div>

          <ion-button
            expand="block"
            color="success"
            [disabled]="!buyQuantity || buyQuantity <= 0 || buyQuantity > selectedBuyBusiness.sharesAvailable || (buyQuantity * selectedBuyBusiness.stockPrice) > (userProfile?.cash || 0) || isLoading"
            (click)="confirmBuy()"
          >
            Buy {{ buyQuantity || 0 }} Shares
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ng-template>
</ion-modal>
`, styles: ['/* src/app/stocks/stocks.page.scss */\n.page-toolbar .header-action-btn {\n  --padding-start: 8px;\n  --padding-end: 8px;\n}\n.page-toolbar .receipt-coin {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  margin-inline-end: 6px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at 30% 30%,\n      #ffe985 0%,\n      #ffd700 45%,\n      #e6a800 100%);\n  color: #3a2a00;\n  font-size: 0.85rem;\n  font-weight: 800;\n  line-height: 1;\n  box-shadow:\n    0 0 6px rgba(255, 215, 0, 0.7),\n    0 0 14px rgba(255, 215, 0, 0.35),\n    inset 0 1px 1px rgba(255, 255, 255, 0.6),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.page-toolbar .receipt-btn:hover .receipt-coin,\n.page-toolbar .receipt-btn:focus-visible .receipt-coin {\n  transform: scale(1.12) rotate(-6deg);\n  box-shadow:\n    0 0 10px rgba(255, 215, 0, 0.9),\n    0 0 22px rgba(255, 215, 0, 0.5),\n    inset 0 1px 1px rgba(255, 255, 255, 0.7),\n    inset 0 -1px 2px rgba(0, 0, 0, 0.25);\n}\n.page-toolbar .receipt-btn:active .receipt-coin {\n  transform: scale(0.95);\n}\n@media (max-width: 480px) {\n  .page-toolbar .header-action-btn {\n    --padding-start: 6px;\n    --padding-end: 6px;\n  }\n  .page-toolbar .header-action-btn .btn-label {\n    display: none;\n  }\n  .page-toolbar .header-action-btn ion-icon {\n    margin: 0;\n  }\n  .page-toolbar .receipt-coin {\n    margin-inline-end: 0;\n  }\n}\nion-content {\n}\n@supports (-webkit-touch-callout: none) {\n  ion-content {\n    height: 100% !important;\n    min-height: 100% !important;\n  }\n}\n.scrollable-content {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n@supports (-webkit-touch-callout: none) {\n  .scrollable-content {\n    height: calc(100vh - 60px);\n    height: calc(100dvh - 60px);\n    overflow-y: scroll !important;\n    -webkit-overflow-scrolling: touch !important;\n  }\n}\n.scrollable-content::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n}\n@supports (-webkit-touch-callout: none) {\n  .page-container {\n    min-height: calc(100vh - 60px);\n    min-height: calc(100dvh - 60px);\n    padding-bottom: calc(90px + env(safe-area-inset-bottom));\n  }\n}\n.filter-section {\n  display: flex;\n  justify-content: flex-start;\n  width: 100%;\n  padding-left: 16px;\n}\n.filter-section .filter-container {\n  max-width: 320px;\n  width: 100%;\n}\n.filter-section .filter-container .filter-wrapper {\n  display: flex;\n  justify-content: flex-start;\n  margin-bottom: 12px;\n}\n.filter-section .filter-container .filter-wrapper .filter-item {\n  --background: rgba(255, 255, 255, 0.08);\n  --border-radius: 16px;\n  --padding-start: 20px;\n  --padding-end: 20px;\n  --padding-top: 16px;\n  --padding-bottom: 16px;\n  --border-color: rgba(255, 215, 0, 0.3);\n  --border-width: 2px;\n  --highlight-color-focused: var(--ion-color-primary);\n  --min-height: 70px;\n  width: 100%;\n  border: 2px solid rgba(255, 215, 0, 0.2);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  transition: all 0.3s ease;\n}\n.filter-section .filter-container .filter-wrapper .filter-item:hover {\n  --border-color: rgba(255, 215, 0, 0.5);\n  transform: translateY(-1px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.filter-section .filter-container .filter-wrapper .filter-item ion-label {\n  color: #FFD700;\n  font-size: 0.8rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 8px;\n}\n.filter-section .filter-container .filter-wrapper .filter-item ion-label .current-filter {\n  color: #FFFFFF;\n  font-weight: 600;\n  font-size: 0.85rem;\n  text-transform: none;\n  letter-spacing: normal;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n.filter-section .filter-container .filter-wrapper .filter-item ion-select {\n  color: #FFFFFF;\n  font-weight: 500;\n  font-size: 0.95rem;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n  --placeholder-color: rgba(255, 255, 255, 0.6);\n  --placeholder-opacity: 1;\n}\n.filter-section .filter-container .filter-wrapper .filter-item ion-select::part(text) {\n  color: #FFFFFF !important;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n.filter-section .filter-container .filter-wrapper .filter-item ion-select::part(placeholder) {\n  color: rgba(255, 255, 255, 0.6) !important;\n}\n.filter-section .filter-container .filter-wrapper .filter-item ion-icon {\n  color: #FFD700;\n  font-size: 1.2rem;\n}\n.filter-section .filter-container .filter-stats {\n  display: flex;\n  justify-content: flex-end;\n}\n.filter-section .filter-container .filter-stats .stats-content {\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 12px;\n  padding: 8px 16px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n.filter-section .filter-container .filter-stats .stats-content .filter-count {\n  color: var(--ion-color-medium);\n  font-size: 0.85rem;\n  font-weight: 500;\n}\n.filter-section .filter-container .filter-stats .stats-content .clear-filter-btn {\n  --color: #FF6B6B;\n  --background: rgba(255, 107, 107, 0.1);\n  --border-radius: 8px;\n  --padding-start: 8px;\n  --padding-end: 8px;\n  height: 28px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  border: 1px solid rgba(255, 107, 107, 0.3);\n}\n.filter-section .filter-container .filter-stats .stats-content .clear-filter-btn:hover {\n  --background: rgba(255, 107, 107, 0.2);\n  --color: #FF5252;\n}\n.filter-section .filter-container .filter-stats .stats-content .clear-filter-btn ion-icon {\n  font-size: 14px;\n}\n@media (max-width: 768px) {\n  .filter-section {\n    justify-content: center;\n    padding-right: 0;\n  }\n  .filter-section .filter-container {\n    max-width: 280px;\n  }\n  .filter-section .filter-container .filter-wrapper {\n    justify-content: center;\n  }\n  .filter-section .filter-container .filter-wrapper .filter-item {\n    --padding-start: 16px;\n    --padding-end: 16px;\n    --padding-top: 14px;\n    --padding-bottom: 14px;\n    --min-height: 65px;\n  }\n  .filter-section .filter-container .filter-stats {\n    justify-content: center;\n  }\n  .filter-section .filter-container .filter-stats .stats-content {\n    padding: 6px 12px;\n    gap: 8px;\n  }\n  .filter-section .filter-container .filter-stats .stats-content .filter-count {\n    font-size: 0.8rem;\n  }\n  .filter-section .filter-container .filter-stats .stats-content .clear-filter-btn {\n    height: 24px;\n    font-size: 0.7rem;\n  }\n}\n.header-section {\n  text-align: center;\n  margin-bottom: 20px;\n  padding: 16px;\n}\n.header-section h1 {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.6rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.header-section p {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 1rem;\n}\n.tab-switcher {\n  display: flex;\n  gap: 12px;\n  margin-bottom: 20px;\n  padding: 0 16px;\n}\n.tab-switcher ion-button {\n  flex: 1;\n  --border-radius: 10px;\n  font-weight: 600;\n}\n.stats-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));\n  gap: 8px;\n  margin-bottom: 24px;\n}\n.stats-grid .stat-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.stats-grid .stat-card.clickable-card {\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.stats-grid .stat-card.clickable-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.stats-grid .stat-card.clickable-card:active {\n  transform: translateY(0);\n}\n.stats-grid .stat-card.clickable-card.active-tab {\n  border: 2px solid var(--ion-color-primary);\n  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);\n  background:\n    linear-gradient(\n      135deg,\n      rgba(255, 215, 0, 0.05) 0%,\n      rgba(255, 165, 0, 0.02) 100%);\n}\n.stats-grid .stat-card ion-card-content {\n  padding: 16px;\n}\n.stats-grid .stat-card ion-card-content .stat-content {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.stats-grid .stat-card ion-card-content .stat-content ion-icon {\n  font-size: 2rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.stats-grid .stat-card ion-card-content .stat-content .stat-info h2 {\n  margin: 0;\n  font-size: 1.8rem;\n  font-weight: bold;\n  color: var(--cash-color);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.stats-grid .stat-card ion-card-content .stat-content .stat-info p {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.85rem;\n}\n.dividend-potential {\n  color: var(--ion-color-success) !important;\n  font-weight: 600;\n}\n.user-info {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n}\n.user-info .welcome-section {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n}\n.user-info .welcome-section .welcome-text {\n  text-align: center;\n}\n.user-info .welcome-section .welcome-text h2 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info .welcome-section .welcome-text p {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.8);\n}\n.user-info .welcome-section .cash-display {\n  text-align: right;\n  display: flex;\n  align-items: flex-end;\n  gap: 16px;\n}\n.user-info .welcome-section .cash-display .networth-display {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #FFD700;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.user-info .welcome-section .cash-display .networth-display:hover {\n  transform: scale(1.02);\n  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);\n}\n.user-info .welcome-section .cash-display .networth-display:active {\n  transform: scale(0.98);\n}\n.user-info .welcome-section .cash-display .networth-display .networth-amount {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #FFD700;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);\n}\n.user-info .welcome-section .cash-display .networth-display .networth-amount.clickable {\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info .welcome-section .cash-display .networth-display .networth-label {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n.user-info .welcome-section .cash-display .cash-section {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  padding: 8px 12px;\n  background: var(--ion-color-dark);\n  border: 2px solid #00FF7F;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(0, 255, 127, 0.3);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.user-info .welcome-section .cash-display .cash-section:hover {\n  transform: scale(1.02);\n  box-shadow: 0 0 15px rgba(0, 255, 127, 0.5);\n}\n.user-info .welcome-section .cash-display .cash-section:active {\n  transform: scale(0.98);\n}\n.user-info .welcome-section .cash-display .cash-amount {\n  font-size: 1.3rem !important;\n  font-weight: 700;\n  color: #00FF7F;\n  text-shadow: 0 0 8px rgba(0, 255, 127, 0.4);\n}\n.user-info .welcome-section .cash-display .cash-amount.clickable {\n  -webkit-user-select: none;\n  user-select: none;\n}\n.user-info .welcome-section .cash-display .cash-label {\n  font-size: 0.75rem;\n  color: white;\n  margin-top: 2px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n}\n@media (max-width: 480px) {\n  .user-info .welcome-section {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .user-info .welcome-section .cash-display {\n    width: 100%;\n    justify-content: space-between;\n    gap: 12px;\n    margin-top: 12px;\n  }\n  .user-info .welcome-section .cash-display .networth-display,\n  .user-info .welcome-section .cash-display .cash-section {\n    flex: 1;\n    align-items: center;\n    padding: 8px;\n  }\n  .user-info .welcome-section .cash-display .networth-amount,\n  .user-info .welcome-section .cash-display .cash-amount {\n    font-size: 1.1rem !important;\n  }\n}\n.stocks-list-scroll-container {\n  max-height: calc(100vh - 450px);\n  overflow-y: auto;\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n  padding-right: 4px;\n}\n@supports (-webkit-touch-callout: none) {\n  .stocks-list-scroll-container {\n    max-height: calc(100vh - 450px);\n    max-height: calc(100dvh - 450px);\n    overflow-y: scroll !important;\n  }\n}\n.stocks-list-scroll-container::-webkit-scrollbar {\n  width: 6px;\n}\n.stocks-list-scroll-container::-webkit-scrollbar-track {\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 3px;\n}\n.stocks-list-scroll-container::-webkit-scrollbar-thumb {\n  background: rgba(255, 215, 0, 0.3);\n  border-radius: 3px;\n}\n.stocks-list-scroll-container::-webkit-scrollbar-thumb:hover {\n  background: rgba(255, 215, 0, 0.5);\n}\n@media (max-width: 768px) {\n  .stocks-list-scroll-container {\n    max-height: calc(100vh - 400px);\n    max-height: calc(100dvh - 400px);\n  }\n}\n@media (max-width: 480px) {\n  .stocks-list-scroll-container {\n    max-height: calc(100vh - 380px);\n    max-height: calc(100dvh - 380px);\n  }\n}\n.my-habit-businesses .section-header {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 0 8px;\n}\n.my-habit-businesses .section-header h2 {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses .section-header ion-icon {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.my-habit-businesses .habit-business-item {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 12px 0;\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\n.my-habit-businesses .habit-business-item::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background:\n    linear-gradient(\n      90deg,\n      transparent,\n      var(--ion-color-primary),\n      transparent);\n  opacity: 0.6;\n}\n.my-habit-businesses .habit-business-item .item-content {\n  display: flex;\n  align-items: center;\n  gap: 20px;\n  position: relative;\n  min-width: 0;\n}\n.my-habit-businesses .habit-business-item .item-content .business-icon {\n  font-size: 2.5rem;\n  min-width: 50px;\n  width: 50px;\n  text-align: center;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n  padding-right: 12px;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info {\n  flex: 1;\n  min-width: 0;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .business-name {\n  margin: 0 0 8px 0;\n  font-size: 1.2rem;\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .owner-section {\n  margin-bottom: 12px;\n  text-align: center;\n  max-width: 400px;\n  margin-left: auto;\n  margin-right: auto;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .owner-section .owner-label {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 2px;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .owner-section .owner-name {\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  line-height: 1.4;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-description {\n  margin: 0 0 12px 0;\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  line-height: 1.4;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats {\n  display: flex;\n  flex-wrap: nowrap;\n  gap: 10px;\n  justify-content: center;\n  max-width: 100%;\n  margin: 0 auto 12px auto;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item {\n  display: flex;\n  flex-direction: column;\n  text-align: center;\n  flex: 1;\n  min-width: 65px;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-label {\n  font-size: 0.68rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.2px;\n  margin-bottom: 2px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value {\n  font-weight: bold;\n  font-size: 0.82rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value.streak {\n  color: var(--streak-color);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value.total-earned {\n  color: var(--earnings-color);\n  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid {\n  margin: 8px 0;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .content-wrapper {\n  width: fit-content !important;\n  display: flex !important;\n  justify-content: center !important;\n  padding: 0 !important;\n  margin: 0 !important;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n  width: fit-content !important;\n  max-width: fit-content !important;\n  background: rgba(0, 0, 0, 0.3) !important;\n  border-radius: 8px !important;\n  border-top: 1px solid rgba(255, 215, 0, 0.2) !important;\n  padding: 8px !important;\n  border: 1px solid rgba(255, 215, 0, 0.2) !important;\n  margin: 0 !important;\n  overflow: visible !important;\n  display: inline-block !important;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .grid-header {\n  margin-bottom: 8px !important;\n  width: fit-content !important;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .month-labels {\n  font-size: 10px !important;\n  width: fit-content !important;\n  margin-left: 20px !important;\n  margin-bottom: 8px !important;\n  overflow: visible !important;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .grid-wrapper {\n  width: fit-content !important;\n  overflow: visible !important;\n  padding-bottom: 0 !important;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid {\n  width: fit-content !important;\n  overflow: visible !important;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .grid-stats {\n  display: none !important;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .price-badge {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 4px;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .price-badge .current-price {\n  font-size: 1.2rem;\n  font-weight: bold;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .price-badge .price-change {\n  font-size: 0.8rem;\n  padding: 2px 6px;\n  border-radius: 6px;\n  font-weight: 600;\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .price-badge .price-change.price-up {\n  color: #10dc60;\n  background: rgba(16, 220, 96, 0.15);\n  border: 1px solid rgba(16, 220, 96, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .price-badge .price-change.price-down {\n  color: #ff4757;\n  background: rgba(255, 71, 87, 0.15);\n  border: 1px solid rgba(255, 71, 87, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .price-badge .price-change.price-neutral {\n  color: #b0b0b0;\n  background: rgba(176, 176, 176, 0.15);\n  border: 1px solid rgba(176, 176, 176, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .business-info .price-badge .shares-owned {\n  font-size: 0.8rem;\n  color: rgba(255, 255, 255, 0.7);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section {\n  text-align: center;\n  min-width: 120px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .total-amount {\n  font-size: 1.3rem;\n  font-weight: bold;\n  color: var(--earnings-color);\n  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .total-amount.profit {\n  color: #10dc60;\n  text-shadow: 0 0 8px rgba(16, 220, 96, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .total-amount.loss {\n  color: #f53d3d;\n  text-shadow: 0 0 8px rgba(245, 61, 61, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .earnings-label {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 4px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .profit-loss {\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .profit-loss.profit {\n  color: #10dc60;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .profit-loss.loss {\n  color: #f53d3d;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action {\n  margin-top: 8px;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action ion-button {\n  --border-radius: 8px;\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action ion-button[color=success] {\n  --background: var(--earnings-color);\n  --color: #000000;\n  --box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);\n}\n.my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action ion-button[color=secondary] {\n  --background: rgba(255, 165, 0, 0.8);\n  --color: #000000;\n  --box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);\n}\n.my-habit-businesses .empty-state {\n  text-align: center;\n  padding: 40px 20px;\n}\n.my-habit-businesses .empty-state ion-icon {\n  font-size: 4rem;\n  color: var(--ion-color-medium);\n  margin-bottom: 16px;\n  opacity: 0.6;\n}\n.my-habit-businesses .empty-state ion-spinner {\n  --color: var(--ion-color-primary);\n  transform: scale(1.5);\n  margin-bottom: 16px;\n}\n.my-habit-businesses .empty-state h3 {\n  color: rgba(255, 255, 255, 0.8);\n  margin: 0 0 12px 0;\n  font-size: 1.2rem;\n}\n.my-habit-businesses .empty-state p {\n  color: rgba(255, 255, 255, 0.6);\n  margin: 0 0 8px 0;\n  line-height: 1.5;\n}\n.my-habit-businesses .empty-state ion-button {\n  --border-radius: 8px;\n  --padding-start: 20px;\n  --padding-end: 20px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  margin-top: 16px;\n  font-size: 0.95rem;\n  font-weight: 600;\n  height: 44px;\n  width: auto;\n}\n.my-habit-businesses .empty-state ion-button .button-native {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n}\n.my-habit-businesses .empty-state ion-button ion-icon {\n  font-size: 1.1rem;\n  margin-right: 8px;\n  display: inline-flex;\n  align-items: center;\n  vertical-align: middle;\n}\n.my-habit-businesses .empty-state ion-button[color=primary] {\n  --box-shadow: 0 3px 10px rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.help-icon-container {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 16px;\n  cursor: pointer;\n}\n.help-icon-container ion-icon {\n  font-size: 1.4rem;\n  transition: color 0.2s ease;\n}\n.help-icon-container .help-text {\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n  transition: color 0.2s ease;\n}\n.help-icon-container:hover ion-icon {\n  --ion-color-base: var(--ion-color-primary);\n}\n.help-icon-container:hover .help-text {\n  color: var(--ion-color-primary);\n}\n.info-card {\n  margin: 16px;\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.info-card .info-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.info-card .info-header .info-title-section {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.info-card .info-header .info-title-section ion-icon {\n  font-size: 1.5rem;\n}\n.info-card .info-header .info-title-section h3 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.1rem;\n  font-weight: 600;\n}\n.info-card .info-content p {\n  margin: 0 0 8px 0;\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n.info-card .info-content ul {\n  margin: 8px 0;\n  padding-left: 16px;\n}\n.info-card .info-content ul li {\n  margin: 4px 0;\n  font-size: 0.85rem;\n  line-height: 1.3;\n}\n.info-card .info-content ul li strong {\n  color: var(--ion-color-primary);\n}\n.info-card .info-content em {\n  font-size: 0.85rem;\n  color: var(--ion-color-success);\n  font-weight: 500;\n}\n@media (min-width: 1401px) {\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats {\n    gap: 12px;\n    max-width: 100%;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    flex: 1;\n    min-width: 75px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-label {\n    font-size: 0.7rem;\n    letter-spacing: 0.3px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value {\n    font-size: 0.85rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item:last-child {\n    min-width: 160px;\n    flex: 1.5;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid {\n    --grid-size: 12px;\n    --grid-gap: 2px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .content-wrapper {\n    width: fit-content !important;\n    max-width: none !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    width: fit-content !important;\n    max-width: none !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n    padding: 8px !important;\n    margin: 0 !important;\n    overflow: visible !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .grid-header {\n    margin-bottom: 8px !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .grid-header .month-labels {\n    font-size: 0.7rem !important;\n    width: fit-content !important;\n    margin-left: 20px !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .grid-wrapper {\n    width: fit-content !important;\n    overflow: visible !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .grid-wrapper .habit-grid {\n    width: fit-content !important;\n    min-width: fit-content !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid {\n    width: fit-content !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid .grid-day {\n    width: 12px !important;\n    height: 12px !important;\n  }\n}\n@media (min-width: 1025px) and (max-width: 1400px) {\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats {\n    gap: 10px;\n    max-width: 100%;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    flex: 1;\n    min-width: 70px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-label {\n    font-size: 0.68rem;\n    letter-spacing: 0.2px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value {\n    font-size: 0.82rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item:last-child {\n    min-width: 150px;\n    flex: 1.5;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid {\n    --grid-size: 16px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    max-width: 100% !important;\n    padding: 14px !important;\n    margin: 0 auto !important;\n    width: fit-content !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .month-labels {\n    font-size: 0.8rem !important;\n    margin-left: 20px !important;\n  }\n}\n@media (max-width: 1024px) and (min-width: 769px) {\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats {\n    gap: 8px;\n    max-width: 100%;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    flex: 1;\n    min-width: 65px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-label {\n    font-size: 0.65rem;\n    letter-spacing: 0.2px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value {\n    font-size: 0.8rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item:last-child {\n    min-width: 140px;\n    flex: 1.5;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid {\n    --grid-size: 14px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    max-width: 100% !important;\n    padding: 12px !important;\n    margin: 0 auto !important;\n    width: fit-content !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .month-labels {\n    font-size: 0.75rem !important;\n    margin-left: 18px !important;\n  }\n}\n@media (max-width: 768px) {\n  .my-habit-businesses .habit-business-item .item-content {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 8px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-icon {\n    position: absolute;\n    top: 12px;\n    left: 12px;\n    font-size: 1.8rem;\n    min-width: auto;\n    width: 32px;\n    height: 32px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: rgba(0, 0, 0, 0.3);\n    border-radius: 8px;\n    border: 1px solid rgba(255, 215, 0, 0.3);\n    z-index: 10;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info {\n    margin-left: 0;\n    padding-left: 0;\n    width: 100%;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .business-name {\n    margin-left: 48px;\n    margin-bottom: 4px;\n    font-size: 1.1rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .owner-section {\n    margin-left: 48px;\n    margin-bottom: 8px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .owner-section .owner-label {\n    font-size: 0.7rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .owner-section .owner-name {\n    font-size: 0.9rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-description {\n    margin-left: 48px;\n    margin-bottom: 8px;\n    font-size: 0.9rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats {\n    gap: 6px;\n    margin-bottom: 8px;\n    justify-content: center;\n    max-width: 100%;\n    margin-left: auto;\n    margin-right: auto;\n    flex-wrap: wrap;\n    row-gap: 10px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    text-align: center;\n    flex: 1;\n    min-width: 60px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-label {\n    font-size: 0.6rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    letter-spacing: 0.2px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value {\n    font-size: 0.75rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .stat-item.holding-actions-stat {\n    flex: 1 1 100%;\n    min-width: 100%;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .habit-stats .holding-actions-buttons {\n    flex-wrap: wrap;\n    justify-content: center;\n    row-gap: 8px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid {\n    margin: 0 !important;\n    padding: 0 !important;\n    width: 100% !important;\n    display: block !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .content-wrapper {\n    width: 100% !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    display: block !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    padding: 12px 8px !important;\n    margin: 0 !important;\n    width: 100% !important;\n    max-width: 100% !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n    min-height: auto !important;\n    display: block !important;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .price-badge {\n    align-items: flex-end;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .price-badge .current-price {\n    font-size: 1.1rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .business-info .price-badge .shares-owned {\n    font-size: 0.75rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .earnings-section {\n    min-width: auto;\n    width: 100%;\n    margin-top: 8px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .total-amount {\n    font-size: 1.2rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .earnings-section .earnings-total .earnings-label {\n    font-size: 0.7rem;\n  }\n  .my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action {\n    margin-top: 6px;\n  }\n  .my-habit-businesses .habit-business-item .item-content .earnings-section .checkin-action ion-button {\n    font-size: 0.8rem;\n    --padding-start: 12px;\n    --padding-end: 12px;\n    --padding-top: 8px;\n    --padding-bottom: 8px;\n  }\n}\n.profit {\n  color: #10dc60 !important;\n}\n.loss {\n  color: #f53d3d !important;\n}\n@media (max-width: 1299px) {\n  .desktop-only {\n    display: none !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 1023px) {\n  .stats-grid {\n    grid-template-columns: repeat(2, 1fr);\n    gap: 16px;\n  }\n  .habit-business-item .item-content {\n    gap: 16px;\n  }\n  .habit-business-item .item-content .business-icon {\n    font-size: 2.8rem;\n    min-width: 70px;\n    padding-right: 8px;\n  }\n  .habit-business-item .item-content .business-info {\n    flex: 1;\n  }\n  .habit-business-item .item-content .business-info .business-name {\n    font-size: 1.2rem;\n  }\n  .habit-business-item .item-content .business-info .habit-stats {\n    gap: 8px;\n    flex-wrap: nowrap;\n    justify-content: center;\n    max-width: 100%;\n    margin: 0 auto 12px auto;\n  }\n  .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    flex: 1;\n    min-width: 65px;\n    text-align: center;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    padding: 10px !important;\n    margin: 0 auto !important;\n    width: 100% !important;\n    max-width: 100% !important;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .month-labels {\n    font-size: 9px !important;\n  }\n  .habit-business-item .item-content .earnings-section {\n    min-width: 110px;\n    flex-shrink: 0;\n  }\n  .habit-business-item .item-content .earnings-section .earnings-total .total-amount {\n    font-size: 1.2rem;\n  }\n  .habit-business-item .item-content .earnings-section .earnings-total .earnings-label {\n    font-size: 0.7rem;\n  }\n  .habit-business-item .item-content .earnings-section .checkin-action ion-button {\n    font-size: 0.8rem;\n    --padding-start: 14px;\n    --padding-end: 14px;\n  }\n}\n@media (min-width: 1025px) and (max-width: 1400px) {\n  .stats-grid {\n    grid-template-columns: repeat(3, 1fr);\n    gap: 20px;\n  }\n  .habit-business-item .item-content .business-icon {\n    font-size: 3rem;\n    min-width: 80px;\n  }\n  .habit-business-item .item-content .business-info .business-name {\n    font-size: 1.4rem;\n  }\n  .habit-business-item .item-content .business-info .habit-stats {\n    gap: 12px;\n    justify-content: center;\n    max-width: 100%;\n    margin: 0 auto 12px auto;\n    flex-wrap: nowrap;\n  }\n  .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    flex: 1;\n    min-width: 75px;\n    text-align: center;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid {\n    --grid-size: 16px;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    padding: 14px !important;\n    margin: 0 auto !important;\n    width: fit-content !important;\n    overflow: visible !important;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .month-labels {\n    font-size: 0.8rem !important;\n    margin-left: 20px !important;\n  }\n  .habit-business-item .item-content .earnings-section {\n    min-width: 140px;\n  }\n}\n@media (max-width: 768px) {\n  .desktop-stats {\n    display: none;\n  }\n  .mobile-stats-carousel {\n    display: block;\n  }\n  .mobile-stats-carousel .carousel-container {\n    position: relative;\n    width: 100%;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card {\n    margin: 0;\n    width: 100%;\n    min-height: 100px;\n    background: var(--business-item-background);\n    border: var(--business-item-border);\n    border-radius: 12px;\n    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    justify-content: center;\n    text-align: center;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content ion-icon {\n    font-size: 28px;\n    min-width: 36px;\n    color: var(--ion-color-primary);\n    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content .stat-info h2 {\n    margin: 0;\n    font-size: 1.5rem;\n    font-weight: bold;\n    color: var(--cash-color);\n    text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content .stat-info h2.profit {\n    color: var(--ion-color-success);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content .stat-info h2.loss {\n    color: var(--ion-color-danger);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-card .stat-content .stat-info p {\n    margin: 4px 0 0 0;\n    font-size: 1rem;\n    color: rgba(255, 255, 255, 0.8);\n  }\n  .mobile-stats-carousel .carousel-container .carousel-indicators {\n    display: flex;\n    justify-content: center;\n    gap: 8px;\n    margin-top: 12px;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-indicators .indicator {\n    width: 8px;\n    height: 8px;\n    border-radius: 50%;\n    background-color: var(--ion-color-light);\n    cursor: pointer;\n    transition: background-color 0.2s ease;\n  }\n  .mobile-stats-carousel .carousel-container .carousel-indicators .indicator.active {\n    background-color: var(--ion-color-primary);\n  }\n  .habit-business-item {\n    margin: 8px 0;\n    padding: 12px;\n  }\n  .habit-business-item .item-content {\n    flex-direction: column;\n    gap: 16px;\n    align-items: stretch;\n  }\n  .habit-business-item .item-content .business-icon {\n    font-size: 2rem;\n    min-width: auto;\n    width: auto;\n    text-align: center;\n    padding-right: 0;\n    align-self: center;\n  }\n  .habit-business-item .item-content .business-info {\n    text-align: center;\n  }\n  .habit-business-item .item-content .business-info .business-name {\n    font-size: 1.1rem;\n  }\n  .habit-business-item .item-content .business-info .habit-stats {\n    justify-content: center;\n    gap: 8px;\n    max-width: 100%;\n    margin: 0 auto 12px auto;\n    flex-wrap: nowrap;\n  }\n  .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    flex: 1;\n    min-width: 65px;\n    text-align: center;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid {\n    margin: 0 !important;\n    padding: 0 !important;\n    width: 100% !important;\n    display: block !important;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .content-wrapper {\n    width: 100% !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    display: block !important;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    padding: 8px 4px !important;\n    margin: 0 !important;\n    width: 100% !important;\n    max-width: 100% !important;\n    background: rgba(0, 0, 0, 0.3) !important;\n    border-radius: 8px !important;\n    border: 1px solid rgba(255, 215, 0, 0.2) !important;\n  }\n  .habit-business-item .item-content .earnings-section {\n    min-width: auto;\n    width: 100%;\n  }\n  .habit-business-item .item-content .earnings-section .earnings-total .total-amount {\n    font-size: 1.2rem;\n  }\n}\n@media (max-width: 480px) {\n  .habit-business-item {\n    margin: 6px 0;\n    padding: 10px;\n  }\n  .habit-business-item .item-content {\n    gap: 12px;\n  }\n  .habit-business-item .item-content .business-info .business-name {\n    font-size: 1rem;\n  }\n  .habit-business-item .item-content .business-info .habit-stats {\n    gap: 4px;\n    justify-content: center;\n    max-width: 100%;\n    margin: 0 auto 8px auto;\n    flex-wrap: nowrap;\n  }\n  .habit-business-item .item-content .business-info .habit-stats .stat-item {\n    text-align: center;\n    flex: 1;\n    min-width: 55px;\n  }\n  .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-label {\n    font-size: 0.55rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    letter-spacing: 0.1px;\n  }\n  .habit-business-item .item-content .business-info .habit-stats .stat-item .stat-value {\n    font-size: 0.7rem;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid {\n    --grid-size: 7px;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .habit-grid-container {\n    padding: 6px !important;\n    margin: 0 auto !important;\n    width: 100% !important;\n    max-width: 100% !important;\n  }\n  .habit-business-item .item-content .business-info app-habit-grid ::ng-deep .month-labels {\n    font-size: 8px !important;\n  }\n  .habit-business-item .item-content .earnings-section .earnings-total .total-amount {\n    font-size: 1.1rem;\n  }\n  .habit-business-item .item-content .earnings-section .earnings-total .earnings-label {\n    font-size: 0.7rem;\n  }\n  .habit-business-item .item-content .earnings-section .earnings-total .profit-loss {\n    font-size: 0.8rem;\n  }\n  .habit-business-item .item-content .earnings-section .checkin-action ion-button {\n    font-size: 0.8rem;\n    --padding-start: 12px;\n    --padding-end: 12px;\n    --padding-top: 8px;\n    --padding-bottom: 8px;\n  }\n}\n@media (min-width: 769px) {\n  .desktop-stats {\n    display: grid;\n  }\n  .mobile-stats-carousel {\n    display: none;\n  }\n}\n.mobile-combined-tab {\n  display: none;\n}\n.mobile-combined-tab .stat-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.mobile-combined-tab .stat-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.2);\n}\n.mobile-combined-tab .stat-card:active {\n  transform: translateY(0);\n}\n.mobile-combined-tab .combined-tab-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  cursor: pointer;\n}\n.mobile-combined-tab .combined-tab-header .tab-info {\n  flex: 1;\n}\n.mobile-combined-tab .combined-tab-header .tab-info .tab-icon-title {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 4px;\n}\n.mobile-combined-tab .combined-tab-header .tab-info .tab-icon-title ion-icon {\n  font-size: 24px;\n  min-width: 32px;\n}\n.mobile-combined-tab .combined-tab-header .tab-info .tab-icon-title h2 {\n  margin: 0;\n  font-size: 1.3rem;\n  font-weight: 600;\n  color: var(--ion-color-primary);\n}\n.mobile-combined-tab .combined-tab-header .tab-info p {\n  margin: 0;\n  font-size: 0.9rem;\n  color: var(--ion-color-medium);\n}\n.mobile-combined-tab .combined-tab-header .toggle-indicator {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  min-width: 60px;\n}\n.mobile-combined-tab .combined-tab-header .toggle-indicator ion-icon {\n  font-size: 20px;\n}\n.mobile-combined-tab .combined-tab-header .toggle-indicator .toggle-text {\n  font-size: 0.75rem;\n  color: var(--ion-color-medium);\n  text-align: center;\n}\n@media (max-width: 768px) {\n  .desktop-tabs {\n    display: none;\n  }\n  .mobile-combined-tab {\n    display: block;\n  }\n}\n@media (min-width: 769px) {\n  .desktop-tabs {\n    display: grid;\n  }\n  .mobile-combined-tab {\n    display: none;\n  }\n}\n.sell-modal-content .business-info {\n  margin-bottom: 20px;\n}\n.sell-modal-content .business-info .business-header {\n  display: flex;\n  align-items: center;\n  gap: 15px;\n  margin-bottom: 10px;\n}\n.sell-modal-content .business-info .business-header .business-emoji {\n  font-size: 2.5rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 60px;\n  height: 60px;\n  background: var(--ion-color-light);\n  border-radius: 12px;\n}\n.sell-modal-content .business-info .business-header h2 {\n  margin: 0;\n  font-size: 1.4rem;\n  font-weight: 600;\n  color: var(--ion-text-color, #000);\n}\n.sell-modal-content .business-info .business-header p {\n  margin: 5px 0 0 0;\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 0.95rem;\n}\n.sell-modal-content .holdings-info {\n  background: var(--ion-color-light);\n  padding: 15px;\n  border-radius: 12px;\n  margin-bottom: 20px;\n}\n.sell-modal-content .holdings-info p {\n  margin: 8px 0;\n  font-size: 0.95rem;\n  color: #ffffff;\n}\n.sell-modal-content .holdings-info p strong {\n  color: #ffffff;\n  font-weight: 600;\n}\n.sell-modal-content .holdings-info p:first-child {\n  margin-top: 0;\n}\n.sell-modal-content .holdings-info p:last-child {\n  margin-bottom: 0;\n}\n.sell-modal-content .holdings-info .profit {\n  color: var(--ion-color-success) !important;\n  font-weight: 600;\n}\n.sell-modal-content .holdings-info .loss {\n  color: var(--ion-color-danger) !important;\n  font-weight: 600;\n}\n.sell-modal-content .sell-controls ion-item {\n  --background: var(--ion-color-light);\n  --color: var(--ion-text-color, #000);\n  --border-radius: 12px;\n  --padding-start: 16px;\n  --padding-end: 16px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  --inner-padding-end: 8px;\n  margin-bottom: 15px;\n  min-height: 60px;\n}\n.sell-modal-content .sell-controls ion-item ion-label {\n  color: var(--ion-text-color, #000) !important;\n  font-weight: 500;\n  margin-bottom: 8px !important;\n}\n.sell-modal-content .sell-controls ion-item ion-select {\n  color: var(--ion-text-color, #000);\n  --placeholder-color: var(--ion-color-medium);\n  --padding-top: 4px;\n  --padding-bottom: 4px;\n  min-height: 40px;\n}\n.sell-modal-content .sell-controls .sell-preview {\n  background: var(--ion-color-light);\n  border: 2px solid var(--ion-color-primary);\n  padding: 12px;\n  border-radius: 8px;\n  margin: 15px 0;\n  text-align: center;\n}\n.sell-modal-content .sell-controls .sell-preview p {\n  margin: 0;\n  font-size: 1.1rem;\n  color: var(--ion-text-color, #000);\n  font-weight: 500;\n}\n.sell-modal-content .sell-controls .sell-preview p strong {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  font-size: 1.2rem;\n}\n.sell-modal-content .sell-controls ion-button[expand=block] {\n  margin-top: 20px;\n  --border-radius: 12px;\n  height: 50px;\n  font-weight: 600;\n}\n.sell-modal-content .sell-controls ion-button[expand=block][disabled] {\n  opacity: 0.5;\n}\n/*# sourceMappingURL=stocks.page.css.map */\n'] }]
  }], () => [{ type: Router }, { type: HabitBusinessService }, { type: SocialService }, { type: AuthService }, { type: ToastController }, { type: AlertController }], { onResize: [{
    type: HostListener,
    args: ["window:resize", ["$event"]]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(StocksPage, { className: "StocksPage", filePath: "src/app/stocks/stocks.page.ts", lineNumber: 82 });
})();
export {
  StocksPage
};
//# sourceMappingURL=stocks.page-Z3WBZVB5.js.map
