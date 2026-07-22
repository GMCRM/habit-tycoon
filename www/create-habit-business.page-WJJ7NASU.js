import {
  HabitBusinessService
} from "./chunk-257QJYN5.js";
import {
  add,
  addIcons,
  alertCircle,
  arrowBack,
  business,
  calendar,
  cash,
  checkmarkCircle,
  document,
  lockClosed,
  rocket,
  trophy,
  warning
} from "./chunk-DTAWB6F7.js";
import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  AlertController,
  CommonModule,
  Component,
  FormsModule,
  IonBackButton,
  IonButton,
  IonButtons,
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
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  MaxLengthValidator,
  ModalController,
  NgControlStatus,
  NgForOf,
  NgIf,
  NgModel,
  Router,
  ToastController,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
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

// src/app/create-habit-business/create-habit-business.page.ts
function CreateHabitBusinessPage_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275element(1, "ion-spinner", 9);
    \u0275\u0275elementStart(2, "p");
    \u0275\u0275text(3, "Loading business opportunities...");
    \u0275\u0275elementEnd()();
  }
}
function CreateHabitBusinessPage_div_10_div_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 28)(1, "h4");
    \u0275\u0275text(2, "\u{1F4A1} Naming Strategy:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "ul")(4, "li");
    \u0275\u0275text(5, "Keep it simple and memorable");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "li");
    \u0275\u0275text(7, 'Use action words: "Daily Walk" vs "Walking"');
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "li");
    \u0275\u0275text(9, "Make it personal and motivating");
    \u0275\u0275elementEnd()()();
  }
}
function CreateHabitBusinessPage_div_10_div_29_div_26_button_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 44);
    \u0275\u0275listener("click", function CreateHabitBusinessPage_div_10_div_29_div_26_button_4_Template_button_click_0_listener() {
      const dow_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.toggleDay(dow_r5));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dow_r5 = ctx.$implicit;
    const i_r6 = ctx.index;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275classProp("active", ctx_r1.isDayActive(dow_r5));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.dayLabels[i_r6]);
  }
}
function CreateHabitBusinessPage_div_10_div_29_div_26_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 45);
    \u0275\u0275text(1, " Select at least one active day ");
    \u0275\u0275elementEnd();
  }
}
function CreateHabitBusinessPage_div_10_div_29_div_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 39)(1, "div", 40);
    \u0275\u0275text(2, "Active Days");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 41);
    \u0275\u0275template(4, CreateHabitBusinessPage_div_10_div_29_div_26_button_4_Template, 2, 3, "button", 42);
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, CreateHabitBusinessPage_div_10_div_29_div_26_div_5_Template, 2, 0, "div", 43);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r1.dayDows);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.activeDays.length === 0);
  }
}
function CreateHabitBusinessPage_div_10_div_29_div_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 28)(1, "h4");
    \u0275\u0275text(2, "\u{1F4A1} Operations Strategy:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "ul")(4, "li");
    \u0275\u0275text(5, 'Be specific: "Walk 30 minutes" not "exercise more"');
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "li");
    \u0275\u0275text(7, ' Include when/where: "Read before bed" or "Meditate in my room" ');
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "li");
    \u0275\u0275text(9, " Start conservative: Better to exceed than underperform ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "li");
    \u0275\u0275text(11, "Focus on consistency over intensity");
    \u0275\u0275elementEnd()()();
  }
}
function CreateHabitBusinessPage_div_10_div_29_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 16)(1, "div", 17);
    \u0275\u0275element(2, "ion-icon", 29);
    \u0275\u0275elementStart(3, "h2");
    \u0275\u0275text(4, "Business Operations");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 19)(6, "div", 20)(7, "div", 21)(8, "h3");
    \u0275\u0275text(9, "Operation Details");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "p", 22);
    \u0275\u0275text(11, "Describe your habit");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 23)(13, "ion-item", 24)(14, "ion-label", 30);
    \u0275\u0275text(15, "Business Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "ion-textarea", 31);
    \u0275\u0275twoWayListener("ngModelChange", function CreateHabitBusinessPage_div_10_div_29_Template_ion_textarea_ngModelChange_16_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.habitDescription, $event) || (ctx_r1.habitDescription = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 32)(18, "ion-item", 24)(19, "ion-label", 30);
    \u0275\u0275text(20, "Schedule");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "ion-select", 33);
    \u0275\u0275twoWayListener("ngModelChange", function CreateHabitBusinessPage_div_10_div_29_Template_ion_select_ngModelChange_21_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.recurrenceInterval, $event) || (ctx_r1.recurrenceInterval = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(22, "ion-select-option", 34);
    \u0275\u0275text(23, "Every Day \u{1F525}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "ion-select-option", 35);
    \u0275\u0275text(25, "Specific Days \u{1F4C5}");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(26, CreateHabitBusinessPage_div_10_div_29_div_26_Template, 6, 2, "div", 36);
    \u0275\u0275elementStart(27, "ion-item", 24)(28, "ion-label", 30);
    \u0275\u0275text(29, "Completions per day");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "ion-input", 37);
    \u0275\u0275twoWayListener("ngModelChange", function CreateHabitBusinessPage_div_10_div_29_Template_ion_input_ngModelChange_30_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.goalValue, $event) || (ctx_r1.goalValue = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "ion-note", 38);
    \u0275\u0275text(32);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(33, CreateHabitBusinessPage_div_10_div_29_div_33_Template, 12, 0, "div", 26);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(16);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.habitDescription);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.recurrenceInterval);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", ctx_r1.recurrenceInterval === "specific_days");
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.goalValue);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.goalValue > 1 ? "Complete " + ctx_r1.goalValue + " times per active day for maximum earnings!" : "Complete once per active day.", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.habitDescription.trim());
  }
}
function CreateHabitBusinessPage_div_10_div_30_div_14_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 63)(1, "div", 64);
    \u0275\u0275text(2, "Need more capital");
    \u0275\u0275elementEnd()();
  }
}
function CreateHabitBusinessPage_div_10_div_30_div_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 49);
    \u0275\u0275listener("click", function CreateHabitBusinessPage_div_10_div_30_div_14_Template_div_click_0_listener() {
      const type_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.selectRewardLevel(type_r8));
    });
    \u0275\u0275elementStart(1, "div", 50)(2, "div", 51);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 52)(5, "div", 53);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 54);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 55);
    \u0275\u0275element(10, "ion-icon", 56);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 57)(12, "div", 58)(13, "span", 59);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span", 60);
    \u0275\u0275text(16, "per completion");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 61);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(19, CreateHabitBusinessPage_div_10_div_30_div_14_div_19_Template, 3, 0, "div", 62);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const type_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("selected", ctx_r1.selectedBusinessTypeId === type_r8.id)("affordable", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) >= type_r8.base_cost)("locked", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) < type_r8.base_cost);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(type_r8.icon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(type_r8.name);
    \u0275\u0275advance();
    \u0275\u0275classProp("unaffordable", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) < type_r8.base_cost);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" $", type_r8.base_cost, " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("name", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) >= type_r8.base_cost ? "checkmark-circle" : "lock-closed")("color", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) >= type_r8.base_cost ? "success" : "medium");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("$", type_r8.base_pay);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" Day 10 streak = $", type_r8.base_pay * 10, "/completion! ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) < type_r8.base_cost);
  }
}
function CreateHabitBusinessPage_div_10_div_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16)(1, "div", 17);
    \u0275\u0275element(2, "ion-icon", 46);
    \u0275\u0275elementStart(3, "h2");
    \u0275\u0275text(4, "Investment Packages");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 19)(6, "div", 20)(7, "div", 21)(8, "h3");
    \u0275\u0275text(9, "Choose Your Investment Level");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "p", 22);
    \u0275\u0275text(11, "Higher risk, higher rewards");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 23)(13, "div", 47);
    \u0275\u0275template(14, CreateHabitBusinessPage_div_10_div_30_div_14_Template, 20, 16, "div", 48);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(14);
    \u0275\u0275property("ngForOf", ctx_r1.businessTypes);
  }
}
function CreateHabitBusinessPage_div_10_div_31_ion_spinner_38_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "ion-spinner", 80);
  }
}
function CreateHabitBusinessPage_div_10_div_31_ion_icon_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "ion-icon", 81);
  }
}
function CreateHabitBusinessPage_div_10_div_31_div_41_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 82);
    \u0275\u0275element(1, "ion-icon", 83);
    \u0275\u0275elementStart(2, "div", 84)(3, "strong");
    \u0275\u0275text(4, "Insufficient Capital");
    \u0275\u0275elementEnd();
    \u0275\u0275element(5, "br");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate2(" Need $", ctx_r1.selectedBusinessType == null ? null : ctx_r1.selectedBusinessType.base_cost, " but only have $", ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash, " ");
  }
}
function CreateHabitBusinessPage_div_10_div_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 16)(1, "div", 17);
    \u0275\u0275element(2, "ion-icon", 65);
    \u0275\u0275elementStart(3, "h2");
    \u0275\u0275text(4, "Launch Business");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 66)(6, "div", 20)(7, "div", 21)(8, "h3");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "p", 22);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "div", 67)(13, "div", 68);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(15, "div", 23)(16, "div", 69)(17, "div", 70)(18, "span", 71);
    \u0275\u0275text(19, "Investment Package:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "span", 72);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "div", 73)(23, "span", 71);
    \u0275\u0275text(24, "Initial Investment:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "span", 72);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "div", 74)(28, "span", 71);
    \u0275\u0275text(29, "Revenue per Operation:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "span", 72);
    \u0275\u0275text(31);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "div", 75)(33, "span", 71);
    \u0275\u0275text(34, "Break-even Point:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "span", 72);
    \u0275\u0275text(36);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(37, "ion-button", 76);
    \u0275\u0275listener("click", function CreateHabitBusinessPage_div_10_div_31_Template_ion_button_click_37_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.createHabitBusiness());
    });
    \u0275\u0275template(38, CreateHabitBusinessPage_div_10_div_31_ion_spinner_38_Template, 1, 0, "ion-spinner", 77)(39, CreateHabitBusinessPage_div_10_div_31_ion_icon_39_Template, 1, 0, "ion-icon", 78);
    \u0275\u0275text(40);
    \u0275\u0275elementEnd();
    \u0275\u0275template(41, CreateHabitBusinessPage_div_10_div_31_div_41_Template, 7, 2, "div", 79);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate1('"', ctx_r1.habitName, '"');
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.habitDescription);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r1.recurrenceInterval === "specific_days" ? "\u{1F4C5} Specific Days" : "\u{1F525} Daily", " ");
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate2("", ctx_r1.selectedBusinessType == null ? null : ctx_r1.selectedBusinessType.icon, " ", ctx_r1.selectedBusinessType == null ? null : ctx_r1.selectedBusinessType.name);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("-$", ctx_r1.selectedBusinessType == null ? null : ctx_r1.selectedBusinessType.base_cost);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("+$", ctx_r1.selectedBusinessType == null ? null : ctx_r1.selectedBusinessType.base_pay);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r1.Math.ceil(((ctx_r1.selectedBusinessType == null ? null : ctx_r1.selectedBusinessType.base_cost) || 0) / ((ctx_r1.selectedBusinessType == null ? null : ctx_r1.selectedBusinessType.base_pay) || 1)), " completions ");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.canAfford || ctx_r1.creating);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.creating);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.creating);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.creating ? "Launching Business..." : "Launch My Business!", " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.canAfford);
  }
}
function CreateHabitBusinessPage_div_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div")(1, "div", 10)(2, "div", 11)(3, "div", 12)(4, "h2");
    \u0275\u0275text(5, "\u{1F680} Launch Your Habit Business");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p");
    \u0275\u0275text(7, "Transform daily habits into profitable ventures");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 13)(9, "div", 14);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 15);
    \u0275\u0275text(12, "AVAILABLE CAPITAL");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(13, "div", 16)(14, "div", 17);
    \u0275\u0275element(15, "ion-icon", 18);
    \u0275\u0275elementStart(16, "h2");
    \u0275\u0275text(17, "Business Foundation");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "div", 19)(19, "div", 20)(20, "div", 21)(21, "h3");
    \u0275\u0275text(22, "Business Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "p", 22);
    \u0275\u0275text(24, "What's your habit called?");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(25, "div", 23)(26, "ion-item", 24)(27, "ion-input", 25);
    \u0275\u0275twoWayListener("ngModelChange", function CreateHabitBusinessPage_div_10_Template_ion_input_ngModelChange_27_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.habitName, $event) || (ctx_r1.habitName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275template(28, CreateHabitBusinessPage_div_10_div_28_Template, 10, 0, "div", 26);
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(29, CreateHabitBusinessPage_div_10_div_29_Template, 34, 6, "div", 27)(30, CreateHabitBusinessPage_div_10_div_30_Template, 15, 1, "div", 27)(31, CreateHabitBusinessPage_div_10_div_31_Template, 42, 13, "div", 27);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1("$", (ctx_r1.userProfile == null ? null : ctx_r1.userProfile.cash) || "0.00");
    \u0275\u0275advance(17);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.habitName);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.habitName.trim());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.habitName.trim());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.habitDescription.trim());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.isFormValid);
  }
}
var _CreateHabitBusinessPage = class _CreateHabitBusinessPage {
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
  constructor(habitBusinessService, authService, router, alertController, modalController, toastController) {
    this.habitBusinessService = habitBusinessService;
    this.authService = authService;
    this.router = router;
    this.alertController = alertController;
    this.modalController = modalController;
    this.toastController = toastController;
    this.businessTypes = [];
    this.userProfile = null;
    this.loading = false;
    this.creating = false;
    this.Math = Math;
    this.selectedBusinessTypeId = null;
    this.selectedBusinessType = null;
    this.habitName = "";
    this.habitDescription = "";
    this.recurrenceInterval = "24h";
    this.activeDays = [1, 2, 3, 4, 5];
    this.goalValue = 1;
    this.dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    this.dayDows = [0, 1, 2, 3, 4, 5, 6];
    addIcons({ arrowBack, checkmarkCircle, document, trophy, rocket, warning, cash, business, add, calendar, alertCircle, lockClosed });
  }
  ngOnInit() {
    return __async(this, null, function* () {
      yield this.loadData();
    });
  }
  loadData() {
    return __async(this, null, function* () {
      this.loading = true;
      try {
        this.businessTypes = yield this.habitBusinessService.getBusinessTypes();
        console.log("Loaded business types:", this.businessTypes);
        const { data: { user } } = yield this.authService.getUser();
        if (user) {
          console.log("User found, ensuring profile exists for:", user.id);
          try {
            this.userProfile = yield this.authService.ensureUserProfileExists(user);
            console.log("User profile ensured:", this.userProfile);
          } catch (profileError) {
            console.error("Error ensuring profile exists:", profileError);
            yield this.showToast("Cannot connect to user profile. Please check your connection.", "danger");
            this.userProfile = {
              name: user.user_metadata?.["name"] || "Entrepreneur",
              cash: 100,
              net_worth: 100
            };
          }
        } else {
          console.log("No user found, redirecting...");
          this.router.navigate(["/login"]);
          return;
        }
      } catch (error) {
        console.error("Error loading data:", error);
        yield this.showToast("Failed to load data. Please try again.", "danger");
      } finally {
        this.loading = false;
      }
    });
  }
  onBusinessTypeChange(event) {
    const selectedId = event.detail.value;
    this.selectedBusinessTypeId = selectedId;
    this.selectedBusinessType = this.businessTypes.find((bt) => bt.id === selectedId) || null;
    console.log("Selected business type:", this.selectedBusinessType);
  }
  selectRewardLevel(businessType) {
    if (this.userProfile?.cash >= businessType.base_cost) {
      this.selectedBusinessTypeId = businessType.id;
      this.selectedBusinessType = businessType;
      console.log("Selected reward level:", businessType);
    }
  }
  get canAfford() {
    return this.userProfile && this.selectedBusinessType && this.userProfile.cash >= this.selectedBusinessType.base_cost;
  }
  get isFormValid() {
    const daysValid = this.recurrenceInterval !== "specific_days" || this.activeDays.length > 0;
    return !!(this.selectedBusinessType && this.habitName.trim() && this.habitDescription.trim() && this.recurrenceInterval && daysValid && this.goalValue > 0 && this.goalValue <= 20);
  }
  createHabitBusiness() {
    return __async(this, null, function* () {
      if (!this.isFormValid) {
        yield this.showToast("Please fill in all fields", "warning");
        return;
      }
      if (!this.canAfford) {
        yield this.showToast(`Insufficient funds. You need $${this.selectedBusinessType?.base_cost} but only have $${this.userProfile?.cash}`, "danger");
        return;
      }
      this.performCreate();
    });
  }
  performCreate() {
    return __async(this, null, function* () {
      this.creating = true;
      try {
        if (!this.userProfile) {
          throw new Error("User profile not loaded. Please refresh the page and try again.");
        }
        const request = {
          business_type_id: this.selectedBusinessType.id,
          business_name: this.habitName.trim(),
          habit_description: this.habitDescription.trim(),
          recurrence_interval: this.recurrenceInterval,
          goal_value: this.goalValue,
          active_days: this.recurrenceInterval === "specific_days" ? this.activeDays : void 0
        };
        console.log("Creating habit-business:", request);
        const result = yield this.habitBusinessService.createHabitBusiness(request);
        console.log("Created habit-business:", result);
        yield this.showToast(`\u{1F389} "${this.habitName}" created successfully!`, "success");
        this.router.navigate(["/home"]);
      } catch (error) {
        console.error("Error creating habit-business:", error);
        console.error("Error details:", {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          stack: error?.stack
        });
        let message = "Unknown error occurred";
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === "string") {
          message = error;
        } else if (error && typeof error === "object") {
          if (error.message) {
            message = error.message;
          } else if (error.error_description) {
            message = error.error_description;
          } else if (error.details) {
            message = error.details;
          }
        }
        console.log("Final error message:", message);
        if (message.includes("Could not load user profile") || message.includes("User not authenticated")) {
          yield this.showToast("Cannot connect to user profile. Please check your connection and try again.", "danger");
        } else if (message.includes("Insufficient funds")) {
          yield this.showToast(message, "warning");
        } else if (message.includes("Invalid business type")) {
          yield this.showToast("Invalid business type selected. Please refresh and try again.", "danger");
        } else {
          yield this.showToast(`Failed to create habit business: ${message}`, "danger");
        }
      } finally {
        this.creating = false;
      }
    });
  }
  showToast(message, color) {
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
  goHome() {
    this.router.navigate(["/home"]);
  }
  getBusinessTypeIcon(businessType) {
    return businessType.icon || "\u{1F3E2}";
  }
};
_CreateHabitBusinessPage.\u0275fac = function CreateHabitBusinessPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _CreateHabitBusinessPage)(\u0275\u0275directiveInject(HabitBusinessService), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(AlertController), \u0275\u0275directiveInject(ModalController), \u0275\u0275directiveInject(ToastController));
};
_CreateHabitBusinessPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CreateHabitBusinessPage, selectors: [["app-create-habit-business"]], decls: 11, vars: 5, consts: [[3, "translucent"], ["fill", "clear", "slot", "start", 3, "click"], ["name", "arrow-back"], [1, "ion-padding", 3, "fullscreen", "scrollY"], [1, "scrollable-content"], [1, "page-container"], ["class", "loading-container", 4, "ngIf"], [4, "ngIf"], [1, "loading-container"], ["name", "crescent"], [1, "user-info"], [1, "welcome-section"], [1, "welcome-text"], [1, "cash-display"], [1, "cash-amount"], [1, "cash-label"], [1, "my-habit-businesses"], [1, "section-header"], ["name", "checkmark-circle"], [1, "habit-business-item"], [1, "business-header"], [1, "business-info"], [1, "business-description"], [1, "business-content"], ["lines", "none", 1, "business-input"], ["placeholder", "e.g., Morning Walk, Reading Time, Push-ups, Meditation...", "maxlength", "50", 3, "ngModelChange", "ngModel"], ["class", "business-tips", 4, "ngIf"], ["class", "my-habit-businesses", 4, "ngIf"], [1, "business-tips"], ["name", "document"], ["position", "stacked"], ["placeholder", "e.g., Take a 30-minute walk around the neighborhood, Read for 20 minutes before bed, Do 10 push-ups in the morning...", "rows", "3", "maxlength", "200", 3, "ngModelChange", "ngModel"], [1, "business-settings"], ["placeholder", "Select schedule", 3, "ngModelChange", "ngModel"], ["value", "24h"], ["value", "specific_days"], ["class", "day-picker-section", 4, "ngIf"], ["type", "number", "min", "1", "max", "20", "placeholder", "e.g., 1, 3, 5...", 3, "ngModelChange", "ngModel"], ["slot", "helper"], [1, "day-picker-section"], [1, "day-picker-label"], [1, "day-chips"], ["class", "day-chip", "type", "button", 3, "active", "click", 4, "ngFor", "ngForOf"], ["class", "day-picker-warning", 4, "ngIf"], ["type", "button", 1, "day-chip", 3, "click"], [1, "day-picker-warning"], ["name", "trophy"], [1, "investment-options"], ["class", "investment-option", 3, "selected", "affordable", "locked", "click", 4, "ngFor", "ngForOf"], [1, "investment-option", 3, "click"], [1, "investment-header"], [1, "investment-icon"], [1, "investment-info"], [1, "investment-name"], [1, "investment-cost"], [1, "investment-status"], [3, "name", "color"], [1, "investment-details"], [1, "revenue-info"], [1, "revenue-amount"], [1, "revenue-label"], [1, "growth-example"], ["class", "locked-overlay", 4, "ngIf"], [1, "locked-overlay"], [1, "locked-text"], ["name", "rocket"], [1, "habit-business-item", "launch-summary"], [1, "business-actions"], [1, "frequency-badge"], [1, "business-summary"], [1, "summary-item"], [1, "summary-label"], [1, "summary-value"], [1, "summary-item", "cost"], [1, "summary-item", "earning"], [1, "summary-item", "highlight"], ["expand", "block", "color", "success", "size", "large", 1, "launch-button", 3, "click", "disabled"], ["slot", "start", 4, "ngIf"], ["name", "rocket", "slot", "start", 4, "ngIf"], ["class", "insufficient-capital", 4, "ngIf"], ["slot", "start"], ["name", "rocket", "slot", "start"], [1, "insufficient-capital"], ["name", "warning", "color", "danger"], [1, "warning-text"]], template: function CreateHabitBusinessPage_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header", 0)(1, "ion-toolbar")(2, "ion-button", 1);
    \u0275\u0275listener("click", function CreateHabitBusinessPage_Template_ion_button_click_2_listener() {
      return ctx.goHome();
    });
    \u0275\u0275element(3, "ion-icon", 2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-title");
    \u0275\u0275text(5, "\u{1F4B0} Launch New Business");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(6, "ion-content", 3)(7, "div", 4)(8, "div", 5);
    \u0275\u0275template(9, CreateHabitBusinessPage_div_9_Template, 4, 0, "div", 6)(10, CreateHabitBusinessPage_div_10_Template, 32, 6, "div", 7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(6);
    \u0275\u0275property("fullscreen", true)("scrollY", false);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx.loading);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.loading);
  }
}, dependencies: [
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  CommonModule,
  NgForOf,
  NgIf,
  FormsModule,
  NgControlStatus,
  MaxLengthValidator,
  NgModel,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonTextarea,
  IonNote,
  IonSpinner
], styles: ['\n\n.scrollable-content[_ngcontent-%COMP%] {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container[_ngcontent-%COMP%] {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: var(--ion-color-medium);\n}\n.loading-container[_ngcontent-%COMP%]   ion-spinner[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n  --color: var(--ion-color-primary);\n}\n.loading-container[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.8);\n  text-align: center;\n}\n.user-info[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.8);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  font-weight: bold;\n  color: var(--cash-color);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: rgba(255, 255, 255, 0.7);\n  margin-top: 2px;\n}\n.my-habit-businesses[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 0 8px;\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.habit-business-item[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 12px 0;\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\n.habit-business-item[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(255, 215, 0, 0.05) 0%,\n      transparent 50%);\n  pointer-events: none;\n}\n.habit-business-item.launch-summary[_ngcontent-%COMP%] {\n  border: 2px solid rgba(var(--ion-color-success-rgb), 0.5);\n  background:\n    linear-gradient(\n      135deg,\n      var(--business-item-background) 0%,\n      rgba(var(--ion-color-success-rgb), 0.1) 100%);\n}\n.habit-business-item.launch-summary[_ngcontent-%COMP%]::before {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(var(--ion-color-success-rgb), 0.1) 0%,\n      transparent 50%);\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 4px 0;\n  color: var(--cash-color);\n  font-size: 1.1rem;\n  font-weight: bold;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%]   .business-info[_ngcontent-%COMP%]   .business-description[_ngcontent-%COMP%] {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-header[_ngcontent-%COMP%]   .business-actions[_ngcontent-%COMP%]   .frequency-badge[_ngcontent-%COMP%] {\n  background: var(--ion-color-warning);\n  color: white;\n  padding: 4px 12px;\n  border-radius: 16px;\n  font-size: 14px;\n  font-weight: 600;\n  text-align: center;\n  min-width: 80px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-input[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  margin-bottom: 12px;\n  --background: transparent;\n  --border-color: rgba(255, 215, 0, 0.3);\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-input[_ngcontent-%COMP%]   ion-input[_ngcontent-%COMP%], \n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-input[_ngcontent-%COMP%]   ion-textarea[_ngcontent-%COMP%], \n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-input[_ngcontent-%COMP%]   ion-select[_ngcontent-%COMP%] {\n  --color: rgba(255, 255, 255, 0.9);\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-input[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  color: var(--cash-color);\n  font-weight: 600;\n  margin-bottom: 8px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-input[_ngcontent-%COMP%]   ion-note[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 12px;\n  margin-top: 4px;\n  line-height: 1.3;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-settings[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n@media (min-width: 768px) {\n  .habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-settings[_ngcontent-%COMP%] {\n    flex-direction: row;\n  }\n  .habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-settings[_ngcontent-%COMP%]   .business-input[_ngcontent-%COMP%] {\n    flex: 1;\n  }\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .day-picker-section[_ngcontent-%COMP%] {\n  padding: 8px 0 4px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .day-picker-section[_ngcontent-%COMP%]   .day-picker-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 8px;\n  padding-left: 4px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .day-picker-section[_ngcontent-%COMP%]   .day-chips[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .day-picker-section[_ngcontent-%COMP%]   .day-chip[_ngcontent-%COMP%] {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.25);\n  background: rgba(255, 255, 255, 0.07);\n  color: rgba(255, 255, 255, 0.5);\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .day-picker-section[_ngcontent-%COMP%]   .day-chip.active[_ngcontent-%COMP%] {\n  background: #FFD700;\n  border-color: #FFD700;\n  color: #000;\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .day-picker-section[_ngcontent-%COMP%]   .day-chip[_ngcontent-%COMP%]:hover {\n  border-color: #FFD700;\n  color: #FFD700;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .day-picker-section[_ngcontent-%COMP%]   .day-picker-warning[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--ion-color-danger);\n  margin-top: 6px;\n  padding-left: 4px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-tips[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  padding: 12px;\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  border-radius: 8px;\n  border-left: 3px solid var(--ion-color-primary);\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-tips[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 14px;\n  font-weight: 600;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-tips[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 16px;\n}\n.habit-business-item[_ngcontent-%COMP%]   .business-content[_ngcontent-%COMP%]   .business-tips[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin-bottom: 4px;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 13px;\n  line-height: 1.4;\n}\n.investment-options[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.investment-option[_ngcontent-%COMP%] {\n  border: 2px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  background: rgba(255, 255, 255, 0.05);\n  position: relative;\n}\n.investment-option.selected[_ngcontent-%COMP%] {\n  border-color: var(--ion-color-primary);\n  background: rgba(var(--ion-color-primary-rgb), 0.15);\n  box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.investment-option.affordable[_ngcontent-%COMP%]:not(.selected):hover {\n  border-color: var(--ion-color-primary);\n  background: rgba(var(--ion-color-primary-rgb), 0.08);\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.2);\n}\n.investment-option.locked[_ngcontent-%COMP%] {\n  opacity: 0.6;\n  cursor: not-allowed;\n  background: rgba(255, 255, 255, 0.02);\n}\n.investment-option.locked[_ngcontent-%COMP%]   .locked-overlay[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.7);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 12px;\n}\n.investment-option.locked[_ngcontent-%COMP%]   .locked-overlay[_ngcontent-%COMP%]   .locked-text[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n  font-weight: 600;\n  text-align: center;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 12px;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-header[_ngcontent-%COMP%]   .investment-icon[_ngcontent-%COMP%] {\n  font-size: 32px;\n  width: 48px;\n  text-align: center;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-header[_ngcontent-%COMP%]   .investment-info[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-header[_ngcontent-%COMP%]   .investment-info[_ngcontent-%COMP%]   .investment-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 16px;\n  color: var(--cash-color);\n  margin-bottom: 4px;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-header[_ngcontent-%COMP%]   .investment-info[_ngcontent-%COMP%]   .investment-cost[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 18px;\n  color: var(--ion-color-success);\n}\n.investment-option[_ngcontent-%COMP%]   .investment-header[_ngcontent-%COMP%]   .investment-info[_ngcontent-%COMP%]   .investment-cost.unaffordable[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.investment-option[_ngcontent-%COMP%]   .investment-header[_ngcontent-%COMP%]   .investment-status[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-details[_ngcontent-%COMP%]   .revenue-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-details[_ngcontent-%COMP%]   .revenue-info[_ngcontent-%COMP%]   .revenue-amount[_ngcontent-%COMP%] {\n  font-size: 20px;\n  font-weight: bold;\n  color: var(--ion-color-success);\n}\n.investment-option[_ngcontent-%COMP%]   .investment-details[_ngcontent-%COMP%]   .revenue-info[_ngcontent-%COMP%]   .revenue-label[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 14px;\n}\n.investment-option[_ngcontent-%COMP%]   .investment-details[_ngcontent-%COMP%]   .growth-example[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 13px;\n}\n.business-summary[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 0;\n  border-bottom: 1px solid rgba(255, 215, 0, 0.2);\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]   .summary-label[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 14px;\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--cash-color);\n  font-weight: 600;\n  text-align: right;\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item.cost[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item.earning[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item.highlight[_ngcontent-%COMP%] {\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  padding: 12px;\n  border-radius: 8px;\n  border: none;\n  margin-top: 8px;\n}\n.business-summary[_ngcontent-%COMP%]   .summary-item.highlight[_ngcontent-%COMP%]   .summary-label[_ngcontent-%COMP%], \n.business-summary[_ngcontent-%COMP%]   .summary-item.highlight[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  font-weight: 600;\n}\n.launch-button[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 600;\n  margin-bottom: 16px;\n  --border-radius: 10px;\n  --box-shadow: 0 4px 16px rgba(var(--ion-color-success-rgb), 0.3);\n  height: 56px;\n}\n.insufficient-capital[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px;\n  background: rgba(var(--ion-color-danger-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-danger-rgb), 0.3);\n  border-radius: 8px;\n}\n.insufficient-capital[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n  flex-shrink: 0;\n}\n.insufficient-capital[_ngcontent-%COMP%]   .warning-text[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 14px;\n  line-height: 1.4;\n}\n.insufficient-capital[_ngcontent-%COMP%]   .warning-text[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n@media (min-width: 768px) {\n  .page-container[_ngcontent-%COMP%] {\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 0 24px 90px 24px;\n  }\n  .investment-options[_ngcontent-%COMP%] {\n    flex-direction: row;\n    flex-wrap: wrap;\n    gap: 16px;\n  }\n  .investment-option[_ngcontent-%COMP%] {\n    flex: 1;\n    min-width: 280px;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .welcome-text[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n    font-size: 1.6rem;\n  }\n  .user-info[_ngcontent-%COMP%]   .welcome-section[_ngcontent-%COMP%]   .cash-display[_ngcontent-%COMP%]   .cash-amount[_ngcontent-%COMP%] {\n    font-size: 1.8rem;\n  }\n}\n@media (min-width: 1024px) {\n  .page-container[_ngcontent-%COMP%] {\n    max-width: 900px;\n  }\n}\n/*# sourceMappingURL=create-habit-business.page.css.map */'] });
var CreateHabitBusinessPage = _CreateHabitBusinessPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CreateHabitBusinessPage, [{
    type: Component,
    args: [{ selector: "app-create-habit-business", standalone: true, imports: [
      IonContent,
      IonHeader,
      IonTitle,
      IonToolbar,
      CommonModule,
      FormsModule,
      IonButton,
      IonItem,
      IonLabel,
      IonInput,
      IonSelect,
      IonSelectOption,
      IonCard,
      IonCardContent,
      IonCardHeader,
      IonCardTitle,
      IonIcon,
      IonTextarea,
      IonNote,
      IonSpinner,
      IonBackButton,
      IonButtons
    ], template: `<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-button fill="clear" slot="start" (click)="goHome()">
      <ion-icon name="arrow-back"></ion-icon>
    </ion-button>
    <ion-title>\u{1F4B0} Launch New Business</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding" [scrollY]="false">
  <div class="scrollable-content">
    <div class="page-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading business opportunities...</p>
      </div>

      <!-- Main Form -->
      <div *ngIf="!loading">
        <!-- Header Section -->
        <div class="user-info">
          <div class="welcome-section">
            <div class="welcome-text">
              <h2>\u{1F680} Launch Your Habit Business</h2>
              <p>Transform daily habits into profitable ventures</p>
            </div>
            <div class="cash-display">
              <div class="cash-amount">\${{ userProfile?.cash || '0.00' }}</div>
              <div class="cash-label">AVAILABLE CAPITAL</div>
            </div>
          </div>
        </div>

        <!-- Step 1: Business Foundation -->
        <div class="my-habit-businesses">
          <div class="section-header">
            <ion-icon name="checkmark-circle"></ion-icon>
            <h2>Business Foundation</h2>
          </div>

          <div class="habit-business-item">
            <div class="business-header">
              <div class="business-info">
                <h3>Business Name</h3>
                <p class="business-description">What's your habit called?</p>
              </div>
            </div>

            <div class="business-content">
              <ion-item lines="none" class="business-input">
                <ion-input
                  [(ngModel)]="habitName"
                  placeholder="e.g., Morning Walk, Reading Time, Push-ups, Meditation..."
                  maxlength="50"
                ></ion-input>
              </ion-item>

              <div *ngIf="habitName.trim()" class="business-tips">
                <h4>\u{1F4A1} Naming Strategy:</h4>
                <ul>
                  <li>Keep it simple and memorable</li>
                  <li>Use action words: "Daily Walk" vs "Walking"</li>
                  <li>Make it personal and motivating</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Business Details -->
        <div *ngIf="habitName.trim()" class="my-habit-businesses">
          <div class="section-header">
            <ion-icon name="document"></ion-icon>
            <h2>Business Operations</h2>
          </div>

          <div class="habit-business-item">
            <div class="business-header">
              <div class="business-info">
                <h3>Operation Details</h3>
                <p class="business-description">Describe your habit</p>
              </div>
            </div>

            <div class="business-content">
              <ion-item lines="none" class="business-input">
                <ion-label position="stacked">Business Description</ion-label>
                <ion-textarea
                  [(ngModel)]="habitDescription"
                  placeholder="e.g., Take a 30-minute walk around the neighborhood, Read for 20 minutes before bed, Do 10 push-ups in the morning..."
                  rows="3"
                  maxlength="200"
                ></ion-textarea>
              </ion-item>

              <div class="business-settings">
                <ion-item lines="none" class="business-input">
                  <ion-label position="stacked">Schedule</ion-label>
                  <ion-select
                    [(ngModel)]="recurrenceInterval"
                    placeholder="Select schedule"
                  >
                    <ion-select-option value="24h"
                      >Every Day \u{1F525}</ion-select-option
                    >
                    <ion-select-option value="specific_days"
                      >Specific Days \u{1F4C5}</ion-select-option
                    >
                  </ion-select>
                </ion-item>

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

                <ion-item lines="none" class="business-input">
                  <ion-label position="stacked"
                    >Completions per day</ion-label
                  >
                  <ion-input
                    [(ngModel)]="goalValue"
                    type="number"
                    min="1"
                    max="20"
                    placeholder="e.g., 1, 3, 5..."
                  ></ion-input>
                  <ion-note slot="helper">
                    {{ goalValue > 1 ? 'Complete ' + goalValue + ' times per active day for maximum earnings!' : 'Complete once per active day.' }}
                  </ion-note>
                </ion-item>
              </div>

              <div *ngIf="habitDescription.trim()" class="business-tips">
                <h4>\u{1F4A1} Operations Strategy:</h4>
                <ul>
                  <li>Be specific: "Walk 30 minutes" not "exercise more"</li>
                  <li>
                    Include when/where: "Read before bed" or "Meditate in my
                    room"
                  </li>
                  <li>
                    Start conservative: Better to exceed than underperform
                  </li>
                  <li>Focus on consistency over intensity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Investment Package -->
        <div *ngIf="habitDescription.trim()" class="my-habit-businesses">
          <div class="section-header">
            <ion-icon name="trophy"></ion-icon>
            <h2>Investment Packages</h2>
          </div>

          <div class="habit-business-item">
            <div class="business-header">
              <div class="business-info">
                <h3>Choose Your Investment Level</h3>
                <p class="business-description">Higher risk, higher rewards</p>
              </div>
            </div>

            <div class="business-content">
              <!-- Investment Options -->
              <div class="investment-options">
                <div
                  *ngFor="let type of businessTypes"
                  class="investment-option"
                  [class.selected]="selectedBusinessTypeId === type.id"
                  [class.affordable]="userProfile?.cash >= type.base_cost"
                  [class.locked]="userProfile?.cash < type.base_cost"
                  (click)="selectRewardLevel(type)"
                >
                  <div class="investment-header">
                    <div class="investment-icon">{{ type.icon }}</div>
                    <div class="investment-info">
                      <div class="investment-name">{{ type.name }}</div>
                      <div
                        class="investment-cost"
                        [class.unaffordable]="userProfile?.cash < type.base_cost"
                      >
                        \${{ type.base_cost }}
                      </div>
                    </div>
                    <div class="investment-status">
                      <ion-icon
                        [name]="userProfile?.cash >= type.base_cost ? 'checkmark-circle' : 'lock-closed'"
                        [color]="userProfile?.cash >= type.base_cost ? 'success' : 'medium'"
                      ></ion-icon>
                    </div>
                  </div>

                  <div class="investment-details">
                    <div class="revenue-info">
                      <span class="revenue-amount">\${{ type.base_pay }}</span>
                      <span class="revenue-label">per completion</span>
                    </div>
                    <div class="growth-example">
                      Day 10 streak = \${{ type.base_pay * 10 }}/completion!
                    </div>
                  </div>

                  <div
                    *ngIf="userProfile?.cash < type.base_cost"
                    class="locked-overlay"
                  >
                    <div class="locked-text">Need more capital</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Business Summary & Launch -->
        <div *ngIf="isFormValid" class="my-habit-businesses">
          <div class="section-header">
            <ion-icon name="rocket"></ion-icon>
            <h2>Launch Business</h2>
          </div>

          <div class="habit-business-item launch-summary">
            <div class="business-header">
              <div class="business-info">
                <h3>"{{ habitName }}"</h3>
                <p class="business-description">{{ habitDescription }}</p>
              </div>
              <div class="business-actions">
                <div class="frequency-badge">
                  {{ recurrenceInterval === 'specific_days' ? '\u{1F4C5} Specific Days' : '\u{1F525} Daily' }}
                </div>
              </div>
            </div>

            <div class="business-content">
              <div class="business-summary">
                <div class="summary-item">
                  <span class="summary-label">Investment Package:</span>
                  <span class="summary-value"
                    >{{ selectedBusinessType?.icon }} {{
                    selectedBusinessType?.name }}</span
                  >
                </div>
                <div class="summary-item cost">
                  <span class="summary-label">Initial Investment:</span>
                  <span class="summary-value"
                    >-\${{ selectedBusinessType?.base_cost }}</span
                  >
                </div>
                <div class="summary-item earning">
                  <span class="summary-label">Revenue per Operation:</span>
                  <span class="summary-value"
                    >+\${{ selectedBusinessType?.base_pay }}</span
                  >
                </div>
                <div class="summary-item highlight">
                  <span class="summary-label">Break-even Point:</span>
                  <span class="summary-value">
                    {{ Math.ceil((selectedBusinessType?.base_cost || 0) /
                    (selectedBusinessType?.base_pay || 1)) }} completions
                  </span>
                </div>
              </div>

              <ion-button
                expand="block"
                color="success"
                size="large"
                [disabled]="!canAfford || creating"
                (click)="createHabitBusiness()"
                class="launch-button"
              >
                <ion-spinner *ngIf="creating" slot="start"></ion-spinner>
                <ion-icon
                  *ngIf="!creating"
                  name="rocket"
                  slot="start"
                ></ion-icon>
                {{ creating ? 'Launching Business...' : 'Launch My Business!' }}
              </ion-button>

              <div *ngIf="!canAfford" class="insufficient-capital">
                <ion-icon name="warning" color="danger"></ion-icon>
                <div class="warning-text">
                  <strong>Insufficient Capital</strong><br />
                  Need \${{ selectedBusinessType?.base_cost }} but only have \${{
                  userProfile?.cash }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</ion-content>
`, styles: ['/* src/app/create-habit-business/create-habit-business.page.scss */\n.scrollable-content {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n}\n.loading-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: var(--ion-color-medium);\n}\n.loading-container ion-spinner {\n  margin-bottom: 16px;\n  --color: var(--ion-color-primary);\n}\n.loading-container p {\n  color: rgba(255, 255, 255, 0.8);\n  text-align: center;\n}\n.user-info {\n  background:\n    linear-gradient(\n      135deg,\n      #1e1e3f 0%,\n      #16213e 100%);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  margin-bottom: 20px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n}\n.user-info .welcome-section {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.user-info .welcome-section .welcome-text h2 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info .welcome-section .welcome-text p {\n  margin: 4px 0 0 0;\n  color: rgba(255, 255, 255, 0.8);\n}\n.user-info .welcome-section .cash-display {\n  text-align: right;\n}\n.user-info .welcome-section .cash-display .cash-amount {\n  font-size: 1.5rem;\n  font-weight: bold;\n  color: var(--cash-color);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.user-info .welcome-section .cash-display .cash-label {\n  font-size: 0.8rem;\n  color: rgba(255, 255, 255, 0.7);\n  margin-top: 2px;\n}\n.my-habit-businesses {\n  margin-bottom: 24px;\n}\n.my-habit-businesses .section-header {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 0 8px;\n}\n.my-habit-businesses .section-header h2 {\n  margin: 0;\n  flex: 1;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.my-habit-businesses .section-header ion-icon {\n  font-size: 1.5rem;\n  color: var(--ion-color-primary);\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));\n}\n.habit-business-item {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin: 12px 0;\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  position: relative;\n  overflow: hidden;\n}\n.habit-business-item::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(255, 215, 0, 0.05) 0%,\n      transparent 50%);\n  pointer-events: none;\n}\n.habit-business-item.launch-summary {\n  border: 2px solid rgba(var(--ion-color-success-rgb), 0.5);\n  background:\n    linear-gradient(\n      135deg,\n      var(--business-item-background) 0%,\n      rgba(var(--ion-color-success-rgb), 0.1) 100%);\n}\n.habit-business-item.launch-summary::before {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(var(--ion-color-success-rgb), 0.1) 0%,\n      transparent 50%);\n}\n.habit-business-item .business-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.habit-business-item .business-header .business-info {\n  flex: 1;\n}\n.habit-business-item .business-header .business-info h3 {\n  margin: 0 0 4px 0;\n  color: var(--cash-color);\n  font-size: 1.1rem;\n  font-weight: bold;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.habit-business-item .business-header .business-info .business-description {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n}\n.habit-business-item .business-header .business-actions .frequency-badge {\n  background: var(--ion-color-warning);\n  color: white;\n  padding: 4px 12px;\n  border-radius: 16px;\n  font-size: 14px;\n  font-weight: 600;\n  text-align: center;\n  min-width: 80px;\n}\n.habit-business-item .business-content .business-input {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  margin-bottom: 12px;\n  --background: transparent;\n  --border-color: rgba(255, 215, 0, 0.3);\n}\n.habit-business-item .business-content .business-input ion-input,\n.habit-business-item .business-content .business-input ion-textarea,\n.habit-business-item .business-content .business-input ion-select {\n  --color: rgba(255, 255, 255, 0.9);\n  --placeholder-color: rgba(255, 255, 255, 0.5);\n}\n.habit-business-item .business-content .business-input ion-label {\n  color: var(--cash-color);\n  font-weight: 600;\n  margin-bottom: 8px;\n}\n.habit-business-item .business-content .business-input ion-note {\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 12px;\n  margin-top: 4px;\n  line-height: 1.3;\n}\n.habit-business-item .business-content .business-settings {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n@media (min-width: 768px) {\n  .habit-business-item .business-content .business-settings {\n    flex-direction: row;\n  }\n  .habit-business-item .business-content .business-settings .business-input {\n    flex: 1;\n  }\n}\n.habit-business-item .business-content .day-picker-section {\n  padding: 8px 0 4px;\n}\n.habit-business-item .business-content .day-picker-section .day-picker-label {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 8px;\n  padding-left: 4px;\n}\n.habit-business-item .business-content .day-picker-section .day-chips {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.habit-business-item .business-content .day-picker-section .day-chip {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.25);\n  background: rgba(255, 255, 255, 0.07);\n  color: rgba(255, 255, 255, 0.5);\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n.habit-business-item .business-content .day-picker-section .day-chip.active {\n  background: #FFD700;\n  border-color: #FFD700;\n  color: #000;\n  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);\n}\n.habit-business-item .business-content .day-picker-section .day-chip:hover {\n  border-color: #FFD700;\n  color: #FFD700;\n}\n.habit-business-item .business-content .day-picker-section .day-picker-warning {\n  font-size: 0.75rem;\n  color: var(--ion-color-danger);\n  margin-top: 6px;\n  padding-left: 4px;\n}\n.habit-business-item .business-content .business-tips {\n  margin-top: 16px;\n  padding: 12px;\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  border-radius: 8px;\n  border-left: 3px solid var(--ion-color-primary);\n}\n.habit-business-item .business-content .business-tips h4 {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 14px;\n  font-weight: 600;\n}\n.habit-business-item .business-content .business-tips ul {\n  margin: 0;\n  padding-left: 16px;\n}\n.habit-business-item .business-content .business-tips ul li {\n  margin-bottom: 4px;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 13px;\n  line-height: 1.4;\n}\n.investment-options {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.investment-option {\n  border: 2px solid rgba(255, 215, 0, 0.3);\n  border-radius: 12px;\n  padding: 16px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  background: rgba(255, 255, 255, 0.05);\n  position: relative;\n}\n.investment-option.selected {\n  border-color: var(--ion-color-primary);\n  background: rgba(var(--ion-color-primary-rgb), 0.15);\n  box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.3);\n}\n.investment-option.affordable:not(.selected):hover {\n  border-color: var(--ion-color-primary);\n  background: rgba(var(--ion-color-primary-rgb), 0.08);\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.2);\n}\n.investment-option.locked {\n  opacity: 0.6;\n  cursor: not-allowed;\n  background: rgba(255, 255, 255, 0.02);\n}\n.investment-option.locked .locked-overlay {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.7);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 12px;\n}\n.investment-option.locked .locked-overlay .locked-text {\n  color: var(--ion-color-danger);\n  font-weight: 600;\n  text-align: center;\n}\n.investment-option .investment-header {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 12px;\n}\n.investment-option .investment-header .investment-icon {\n  font-size: 32px;\n  width: 48px;\n  text-align: center;\n}\n.investment-option .investment-header .investment-info {\n  flex: 1;\n}\n.investment-option .investment-header .investment-info .investment-name {\n  font-weight: 600;\n  font-size: 16px;\n  color: var(--cash-color);\n  margin-bottom: 4px;\n}\n.investment-option .investment-header .investment-info .investment-cost {\n  font-weight: 700;\n  font-size: 18px;\n  color: var(--ion-color-success);\n}\n.investment-option .investment-header .investment-info .investment-cost.unaffordable {\n  color: var(--ion-color-danger);\n}\n.investment-option .investment-header .investment-status ion-icon {\n  font-size: 24px;\n}\n.investment-option .investment-details .revenue-info {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.investment-option .investment-details .revenue-info .revenue-amount {\n  font-size: 20px;\n  font-weight: bold;\n  color: var(--ion-color-success);\n}\n.investment-option .investment-details .revenue-info .revenue-label {\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 14px;\n}\n.investment-option .investment-details .growth-example {\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 13px;\n}\n.business-summary {\n  margin-bottom: 20px;\n}\n.business-summary .summary-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 0;\n  border-bottom: 1px solid rgba(255, 215, 0, 0.2);\n}\n.business-summary .summary-item:last-child {\n  border-bottom: none;\n}\n.business-summary .summary-item .summary-label {\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 14px;\n}\n.business-summary .summary-item .summary-value {\n  color: var(--cash-color);\n  font-weight: 600;\n  text-align: right;\n}\n.business-summary .summary-item.cost .summary-value {\n  color: var(--ion-color-danger);\n}\n.business-summary .summary-item.earning .summary-value {\n  color: var(--ion-color-success);\n}\n.business-summary .summary-item.highlight {\n  background: rgba(var(--ion-color-primary-rgb), 0.1);\n  padding: 12px;\n  border-radius: 8px;\n  border: none;\n  margin-top: 8px;\n}\n.business-summary .summary-item.highlight .summary-label,\n.business-summary .summary-item.highlight .summary-value {\n  color: var(--ion-color-primary);\n  font-weight: 600;\n}\n.launch-button {\n  font-size: 18px;\n  font-weight: 600;\n  margin-bottom: 16px;\n  --border-radius: 10px;\n  --box-shadow: 0 4px 16px rgba(var(--ion-color-success-rgb), 0.3);\n  height: 56px;\n}\n.insufficient-capital {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px;\n  background: rgba(var(--ion-color-danger-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-danger-rgb), 0.3);\n  border-radius: 8px;\n}\n.insufficient-capital ion-icon {\n  font-size: 24px;\n  flex-shrink: 0;\n}\n.insufficient-capital .warning-text {\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 14px;\n  line-height: 1.4;\n}\n.insufficient-capital .warning-text strong {\n  color: var(--ion-color-danger);\n}\n@media (min-width: 768px) {\n  .page-container {\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 0 24px 90px 24px;\n  }\n  .investment-options {\n    flex-direction: row;\n    flex-wrap: wrap;\n    gap: 16px;\n  }\n  .investment-option {\n    flex: 1;\n    min-width: 280px;\n  }\n  .user-info .welcome-section .welcome-text h2 {\n    font-size: 1.6rem;\n  }\n  .user-info .welcome-section .cash-display .cash-amount {\n    font-size: 1.8rem;\n  }\n}\n@media (min-width: 1024px) {\n  .page-container {\n    max-width: 900px;\n  }\n}\n/*# sourceMappingURL=create-habit-business.page.css.map */\n'] }]
  }], () => [{ type: HabitBusinessService }, { type: AuthService }, { type: Router }, { type: AlertController }, { type: ModalController }, { type: ToastController }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CreateHabitBusinessPage, { className: "CreateHabitBusinessPage", filePath: "src/app/create-habit-business/create-habit-business.page.ts", lineNumber: 65 });
})();
export {
  CreateHabitBusinessPage
};
//# sourceMappingURL=create-habit-business.page-WJJ7NASU.js.map
