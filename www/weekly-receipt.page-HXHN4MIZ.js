import {
  addIcons,
  alertCircleOutline,
  arrowBack,
  chevronBack,
  chevronForward,
  close,
  documentTextOutline,
  receiptOutline,
  trendingDownOutline,
  trendingUpOutline,
  walletOutline
} from "./chunk-DTAWB6F7.js";
import {
  CommonModule,
  Component,
  Injectable,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
  NgForOf,
  NgIf,
  Router,
  SupabaseService,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
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

// src/app/services/weekly-receipt.service.ts
var DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var _WeeklyReceiptService = class _WeeklyReceiptService {
  constructor() {
    this.supabaseService = inject(SupabaseService);
  }
  get supabase() {
    return this.supabaseService.client;
  }
  /** Monday 12:00 AM local time for the week containing `referenceDate`. */
  getWeekStart(referenceDate = /* @__PURE__ */ new Date()) {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    return start;
  }
  getWeekEnd(weekStart) {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }
  addWeeks(weekStart, delta) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    return next;
  }
  getWeeklyReceipt(weekStart) {
    return __async(this, null, function* () {
      const weekEnd = this.getWeekEnd(weekStart);
      const { data, error } = yield this.supabase.rpc("get_weekly_receipt", {
        p_week_start: weekStart.toISOString(),
        p_week_end: weekEnd.toISOString()
      });
      if (error) {
        console.error("Error fetching weekly receipt:", error);
        throw error;
      }
      const items = (data || []).map((row) => this.toLineItem(row));
      return this.bucketByDay(weekStart, weekEnd, items);
    });
  }
  toLineItem(row) {
    const amount = Number(row.amount) || 0;
    let title = row.primary_label;
    let subtitle = row.secondary_label;
    let icon = row.icon;
    switch (row.item_type) {
      case "habit_earning":
        icon = row.icon || "\u2705";
        break;
      case "dividend":
        title = "Dividend";
        subtitle = `${row.primary_label}'s ${row.secondary_label}`;
        icon = "\u{1F4C8}";
        break;
      case "stock_purchase":
        title = `Bought shares \u2014 ${row.primary_label}`;
        subtitle = `Owned by ${row.secondary_label}`;
        icon = "\u{1F4CA}";
        break;
      case "stock_sale":
        title = `Sold shares \u2014 ${row.primary_label}`;
        subtitle = `Owned by ${row.secondary_label}`;
        icon = "\u{1F4CA}";
        break;
      case "stock_refund":
        title = `Shares refunded \u2014 ${row.primary_label}`;
        subtitle = "Business was closed by the owner";
        icon = "\u21A9\uFE0F";
        break;
      case "business_sale":
        title = `Sold business \u2014 ${row.primary_label}`;
        subtitle = row.secondary_label;
        icon = "\u{1F4B0}";
        break;
    }
    return {
      id: `${row.item_type}-${row.occurred_at}-${Math.random().toString(36).slice(2, 8)}`,
      type: row.item_type,
      timestamp: row.occurred_at,
      amount,
      icon,
      title,
      subtitle
    };
  }
  bucketByDay(weekStart, weekEnd, items) {
    const today = this.startOfLocalDay(/* @__PURE__ */ new Date());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        dayName: DAY_NAMES[i],
        dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isToday: date.getTime() === today.getTime(),
        items: [],
        total: 0
      });
    }
    let totalIn = 0;
    let totalOut = 0;
    for (const item of items) {
      const ts = new Date(item.timestamp);
      if (ts < weekStart || ts >= weekEnd)
        continue;
      const dayIndex = Math.round((this.startOfLocalDay(ts).getTime() - weekStart.getTime()) / 864e5);
      if (dayIndex < 0 || dayIndex > 6)
        continue;
      days[dayIndex].items.push(item);
      days[dayIndex].total += item.amount;
      if (item.amount >= 0) {
        totalIn += item.amount;
      } else {
        totalOut += item.amount;
      }
    }
    for (const day of days) {
      day.items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      day.total = Math.round(day.total * 100) / 100;
    }
    return {
      weekStart,
      weekEnd,
      days,
      totalIn: Math.round(totalIn * 100) / 100,
      totalOut: Math.round(totalOut * 100) / 100,
      net: Math.round((totalIn + totalOut) * 100) / 100,
      itemCount: items.length
    };
  }
  startOfLocalDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
};
_WeeklyReceiptService.\u0275fac = function WeeklyReceiptService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _WeeklyReceiptService)();
};
_WeeklyReceiptService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _WeeklyReceiptService, factory: _WeeklyReceiptService.\u0275fac, providedIn: "root" });
var WeeklyReceiptService = _WeeklyReceiptService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WeeklyReceiptService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/weekly-receipt/weekly-receipt.page.ts
function WeeklyReceiptPage_span_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 19);
    \u0275\u0275text(1, "This week");
    \u0275\u0275elementEnd();
  }
}
function WeeklyReceiptPage_div_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 20);
    \u0275\u0275element(1, "ion-spinner", 21);
    \u0275\u0275elementStart(2, "p");
    \u0275\u0275text(3, "Tallying up your week...");
    \u0275\u0275elementEnd()();
  }
}
function WeeklyReceiptPage_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275element(1, "ion-icon", 23);
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.error);
  }
}
function WeeklyReceiptPage_ng_container_20_div_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 41);
    \u0275\u0275element(1, "ion-icon", 42);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "No transactions this week");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, "Complete habits, trade stocks, or sell a business to see it itemized here.");
    \u0275\u0275elementEnd()();
  }
}
function WeeklyReceiptPage_ng_container_20_div_31_span_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 51);
    \u0275\u0275text(1, "Today");
    \u0275\u0275elementEnd();
  }
}
function WeeklyReceiptPage_ng_container_20_div_31_span_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 52);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const day_r3 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("positive", day_r3.total > 0)("negative", day_r3.total < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.amountLabel(day_r3.total));
  }
}
function WeeklyReceiptPage_ng_container_20_div_31_div_9_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 55)(1, "div", 56);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 57)(4, "div", 58);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 59);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 60)(9, "div", 61);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 62);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r4.icon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(item_r4.title);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r4.subtitle);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("positive", item_r4.amount > 0)("negative", item_r4.amount < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.amountLabel(item_r4.amount), " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.timeLabel(item_r4.timestamp));
  }
}
function WeeklyReceiptPage_ng_container_20_div_31_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 53);
    \u0275\u0275template(1, WeeklyReceiptPage_ng_container_20_div_31_div_9_div_1_Template, 13, 9, "div", 54);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const day_r3 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", day_r3.items);
  }
}
function WeeklyReceiptPage_ng_container_20_div_31_ng_template_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 63);
    \u0275\u0275text(1, "No transactions");
    \u0275\u0275elementEnd();
  }
}
function WeeklyReceiptPage_ng_container_20_div_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 43)(1, "div", 44)(2, "div", 45)(3, "span", 46);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 47);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275template(7, WeeklyReceiptPage_ng_container_20_div_31_span_7_Template, 2, 0, "span", 48);
    \u0275\u0275elementEnd();
    \u0275\u0275template(8, WeeklyReceiptPage_ng_container_20_div_31_span_8_Template, 2, 5, "span", 49);
    \u0275\u0275elementEnd();
    \u0275\u0275template(9, WeeklyReceiptPage_ng_container_20_div_31_div_9_Template, 2, 1, "div", 50)(10, WeeklyReceiptPage_ng_container_20_div_31_ng_template_10_Template, 2, 0, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const day_r3 = ctx.$implicit;
    const noItems_r5 = \u0275\u0275reference(11);
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(day_r3.dayName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(day_r3.dateLabel);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", day_r3.isToday);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.hasAnyItems(day_r3));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.hasAnyItems(day_r3))("ngIfElse", noItems_r5);
  }
}
function WeeklyReceiptPage_ng_container_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275elementStart(1, "div", 24)(2, "div", 25);
    \u0275\u0275element(3, "ion-icon", 26);
    \u0275\u0275elementStart(4, "div", 27)(5, "div", 28);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 29);
    \u0275\u0275text(8, "Total In");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "div", 30);
    \u0275\u0275element(10, "ion-icon", 31);
    \u0275\u0275elementStart(11, "div", 27)(12, "div", 28);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "div", 29);
    \u0275\u0275text(15, "Total Out");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "div", 32);
    \u0275\u0275element(17, "ion-icon", 33);
    \u0275\u0275elementStart(18, "div", 27)(19, "div", 28);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "div", 29);
    \u0275\u0275text(22, "Net");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(23, "button", 34);
    \u0275\u0275listener("click", function WeeklyReceiptPage_ng_container_20_Template_button_click_23_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.showSummaryModal = true);
    });
    \u0275\u0275element(24, "ion-icon", 35);
    \u0275\u0275elementStart(25, "span", 36);
    \u0275\u0275text(26, "Weekly Totals");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "span", 37);
    \u0275\u0275text(28);
    \u0275\u0275elementEnd();
    \u0275\u0275element(29, "ion-icon", 38);
    \u0275\u0275elementEnd();
    \u0275\u0275template(30, WeeklyReceiptPage_ng_container_20_div_30_Template, 6, 0, "div", 39)(31, WeeklyReceiptPage_ng_container_20_div_31_Template, 12, 6, "div", 40);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1("+$", ctx_r0.formatMoney(ctx_r0.receipt.totalIn));
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1("-$", ctx_r0.formatMoney(ctx_r0.receipt.totalOut * -1));
    \u0275\u0275advance(6);
    \u0275\u0275classProp("negative", ctx_r0.receipt.net < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r0.receipt.net >= 0 ? "+" : "-", "$", ctx_r0.formatMoney(ctx_r0.receipt.net < 0 ? ctx_r0.receipt.net * -1 : ctx_r0.receipt.net), " ");
    \u0275\u0275advance(7);
    \u0275\u0275classProp("negative", ctx_r0.receipt.net < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r0.receipt.net >= 0 ? "+" : "-", "$", ctx_r0.formatMoney(ctx_r0.receipt.net < 0 ? ctx_r0.receipt.net * -1 : ctx_r0.receipt.net), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r0.receipt.itemCount === 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.receipt.days);
  }
}
function WeeklyReceiptPage_ng_template_22_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 65)(1, "div", 66)(2, "h2");
    \u0275\u0275text(3, "Weekly Totals");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 67);
    \u0275\u0275listener("click", function WeeklyReceiptPage_ng_template_22_div_0_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.showSummaryModal = false);
    });
    \u0275\u0275element(5, "ion-icon", 68);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 69)(7, "div", 70);
    \u0275\u0275element(8, "ion-icon", 26);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 71)(10, "div", 72);
    \u0275\u0275text(11, "Total In");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 73);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(14, "div", 74)(15, "div", 70);
    \u0275\u0275element(16, "ion-icon", 31);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "div", 71)(18, "div", 72);
    \u0275\u0275text(19, "Total Out");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 73);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(22, "div", 75)(23, "div", 70);
    \u0275\u0275element(24, "ion-icon", 33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "div", 71)(26, "div", 72);
    \u0275\u0275text(27, "Net");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "div", 73);
    \u0275\u0275text(29);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(13);
    \u0275\u0275textInterpolate1("+$", ctx_r0.formatMoney(ctx_r0.receipt.totalIn));
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate1("-$", ctx_r0.formatMoney(ctx_r0.receipt.totalOut * -1));
    \u0275\u0275advance(7);
    \u0275\u0275classProp("negative", ctx_r0.receipt.net < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r0.receipt.net >= 0 ? "+" : "-", "$", ctx_r0.formatMoney(ctx_r0.receipt.net < 0 ? ctx_r0.receipt.net * -1 : ctx_r0.receipt.net), " ");
  }
}
function WeeklyReceiptPage_ng_template_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, WeeklyReceiptPage_ng_template_22_div_0_Template, 30, 6, "div", 64);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("ngIf", ctx_r0.receipt);
  }
}
var _WeeklyReceiptPage = class _WeeklyReceiptPage {
  constructor(receiptService, router) {
    this.receiptService = receiptService;
    this.router = router;
    this.loading = true;
    this.error = null;
    this.receipt = null;
    this.isCurrentWeek = false;
    this.showSummaryModal = false;
    addIcons({
      arrowBack,
      chevronBack,
      chevronForward,
      receiptOutline,
      trendingUpOutline,
      trendingDownOutline,
      walletOutline,
      alertCircleOutline,
      documentTextOutline,
      close
    });
  }
  ngOnInit() {
    return __async(this, null, function* () {
      this.weekStart = this.receiptService.getWeekStart();
      yield this.loadWeek();
    });
  }
  loadWeek() {
    return __async(this, null, function* () {
      this.loading = true;
      this.error = null;
      try {
        this.receipt = yield this.receiptService.getWeeklyReceipt(this.weekStart);
        const currentWeekStart = this.receiptService.getWeekStart();
        this.isCurrentWeek = this.weekStart.getTime() === currentWeekStart.getTime();
      } catch (e) {
        console.error("Failed to load weekly receipt", e);
        this.error = "Could not load your receipt. Please try again.";
      } finally {
        this.loading = false;
      }
    });
  }
  previousWeek() {
    return __async(this, null, function* () {
      this.weekStart = this.receiptService.addWeeks(this.weekStart, -1);
      yield this.loadWeek();
    });
  }
  nextWeek() {
    return __async(this, null, function* () {
      if (this.isCurrentWeek)
        return;
      this.weekStart = this.receiptService.addWeeks(this.weekStart, 1);
      yield this.loadWeek();
    });
  }
  get weekRangeLabel() {
    if (!this.receipt)
      return "";
    const end = new Date(this.receipt.weekEnd);
    end.setDate(end.getDate() - 1);
    const startLabel = this.receipt.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${startLabel} \u2013 ${endLabel}`;
  }
  hasAnyItems(day) {
    return day.items.length > 0;
  }
  timeLabel(iso) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  amountLabel(amount) {
    const sign = amount >= 0 ? "+" : "-";
    return `${sign}$${this.formatMoney(Math.abs(amount))}`;
  }
  formatMoney(amount) {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  goHome() {
    this.router.navigate(["/home"]);
  }
};
_WeeklyReceiptPage.\u0275fac = function WeeklyReceiptPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _WeeklyReceiptPage)(\u0275\u0275directiveInject(WeeklyReceiptService), \u0275\u0275directiveInject(Router));
};
_WeeklyReceiptPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _WeeklyReceiptPage, selectors: [["app-weekly-receipt"]], decls: 23, vars: 11, consts: [["noItems", ""], [3, "translucent"], ["fill", "clear", "slot", "start", 3, "click"], ["name", "arrow-back"], [1, "ion-padding", 3, "fullscreen", "scrollY"], [1, "scrollable-content"], [1, "page-container"], [1, "week-nav"], ["aria-label", "Previous week", 1, "week-nav-arrow", 3, "click", "disabled"], ["name", "chevron-back"], [1, "week-nav-label"], [1, "week-range"], ["class", "week-current-tag", 4, "ngIf"], ["aria-label", "Next week", 1, "week-nav-arrow", 3, "click", "disabled"], ["name", "chevron-forward"], ["class", "loading-container", 4, "ngIf"], ["class", "error-banner", 4, "ngIf"], [4, "ngIf"], [1, "summary-modal", 3, "didDismiss", "isOpen"], [1, "week-current-tag"], [1, "loading-container"], ["name", "crescent"], [1, "error-banner"], ["name", "alert-circle-outline"], [1, "summary-card"], [1, "summary-item", "in"], ["name", "trending-up-outline"], [1, "summary-info"], [1, "summary-value"], [1, "summary-label"], [1, "summary-item", "out"], ["name", "trending-down-outline"], [1, "summary-item", "net"], ["name", "wallet-outline"], [1, "summary-toggle-btn", 3, "click"], ["name", "receipt-outline"], [1, "summary-toggle-label"], [1, "summary-toggle-net"], ["name", "chevron-forward", 1, "summary-toggle-chevron"], ["class", "empty-week", 4, "ngIf"], ["class", "day-section", 4, "ngFor", "ngForOf"], [1, "empty-week"], ["name", "document-text-outline"], [1, "day-section"], [1, "day-header"], [1, "day-header-left"], [1, "day-name"], [1, "day-date"], ["class", "day-today-tag", 4, "ngIf"], ["class", "day-total", 3, "positive", "negative", 4, "ngIf"], ["class", "receipt-list", 4, "ngIf", "ngIfElse"], [1, "day-today-tag"], [1, "day-total"], [1, "receipt-list"], ["class", "receipt-row", 4, "ngFor", "ngForOf"], [1, "receipt-row"], [1, "item-icon"], [1, "item-info"], [1, "item-title"], [1, "item-subtitle"], [1, "item-right"], [1, "item-amount"], [1, "item-time"], [1, "no-items"], ["class", "summary-modal-content", 4, "ngIf"], [1, "summary-modal-content"], [1, "summary-modal-header"], ["aria-label", "Close", 1, "summary-modal-close", 3, "click"], ["name", "close"], [1, "summary-modal-row", "in"], [1, "summary-modal-icon"], [1, "summary-modal-info"], [1, "summary-modal-label"], [1, "summary-modal-value"], [1, "summary-modal-row", "out"], [1, "summary-modal-row", "net"]], template: function WeeklyReceiptPage_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header", 1)(1, "ion-toolbar")(2, "ion-button", 2);
    \u0275\u0275listener("click", function WeeklyReceiptPage_Template_ion_button_click_2_listener() {
      return ctx.goHome();
    });
    \u0275\u0275element(3, "ion-icon", 3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-title");
    \u0275\u0275text(5, "\u{1F9FE} Weekly Receipt");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(6, "ion-content", 4)(7, "div", 5)(8, "div", 6)(9, "div", 7)(10, "button", 8);
    \u0275\u0275listener("click", function WeeklyReceiptPage_Template_button_click_10_listener() {
      return ctx.previousWeek();
    });
    \u0275\u0275element(11, "ion-icon", 9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 10)(13, "span", 11);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275template(15, WeeklyReceiptPage_span_15_Template, 2, 0, "span", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "button", 13);
    \u0275\u0275listener("click", function WeeklyReceiptPage_Template_button_click_16_listener() {
      return ctx.nextWeek();
    });
    \u0275\u0275element(17, "ion-icon", 14);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(18, WeeklyReceiptPage_div_18_Template, 4, 0, "div", 15)(19, WeeklyReceiptPage_div_19_Template, 4, 1, "div", 16)(20, WeeklyReceiptPage_ng_container_20_Template, 32, 12, "ng-container", 17);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(21, "ion-modal", 18);
    \u0275\u0275listener("didDismiss", function WeeklyReceiptPage_Template_ion_modal_didDismiss_21_listener() {
      return ctx.showSummaryModal = false;
    });
    \u0275\u0275template(22, WeeklyReceiptPage_ng_template_22_Template, 1, 1, "ng-template");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(6);
    \u0275\u0275property("fullscreen", true)("scrollY", false);
    \u0275\u0275advance(4);
    \u0275\u0275property("disabled", ctx.loading);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx.weekRangeLabel);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.isCurrentWeek);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx.loading || ctx.isCurrentWeek);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx.loading);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.loading && ctx.error);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.loading && !ctx.error && ctx.receipt);
    \u0275\u0275advance();
    \u0275\u0275property("isOpen", ctx.showSummaryModal);
  }
}, dependencies: [CommonModule, NgForOf, NgIf, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonSpinner, IonModal], styles: ["\n\n.scrollable-content[_ngcontent-%COMP%] {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container[_ngcontent-%COMP%] {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: var(--ion-color-medium);\n}\n.loading-container[_ngcontent-%COMP%]   ion-spinner[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n  --color: var(--ion-color-primary);\n}\n.loading-container[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.8);\n  text-align: center;\n}\n.error-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 14px 16px;\n  background: rgba(var(--ion-color-danger-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-danger-rgb), 0.3);\n  border-radius: 10px;\n  color: rgba(255, 255, 255, 0.9);\n  margin-bottom: 16px;\n}\n.error-banner[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 22px;\n  color: var(--ion-color-danger);\n  flex-shrink: 0;\n}\n.week-nav[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 10px 6px;\n}\n.week-nav[_ngcontent-%COMP%]   .week-nav-arrow[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  background: rgba(255, 255, 255, 0.05);\n  color: var(--ion-color-primary);\n  flex-shrink: 0;\n}\n.week-nav[_ngcontent-%COMP%]   .week-nav-arrow[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n}\n.week-nav[_ngcontent-%COMP%]   .week-nav-arrow[_ngcontent-%COMP%]:disabled {\n  opacity: 0.3;\n}\n.week-nav[_ngcontent-%COMP%]   .week-nav-arrow[_ngcontent-%COMP%]:not(:disabled):active {\n  background: rgba(255, 215, 0, 0.15);\n}\n.week-nav[_ngcontent-%COMP%]   .week-nav-label[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  flex: 1;\n  text-align: center;\n}\n.week-nav[_ngcontent-%COMP%]   .week-nav-label[_ngcontent-%COMP%]   .week-range[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  font-size: 1.05rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.week-nav[_ngcontent-%COMP%]   .week-nav-label[_ngcontent-%COMP%]   .week-current-tag[_ngcontent-%COMP%] {\n  margin-top: 2px;\n  font-size: 0.7rem;\n  color: var(--ion-color-success);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.summary-card[_ngcontent-%COMP%] {\n  display: flex;\n  background: var(--ion-card-background);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 12px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n  margin-bottom: 20px;\n  overflow: hidden;\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  padding: 14px 8px;\n  border-right: 1px solid rgba(255, 255, 255, 0.08);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]:last-child {\n  border-right: none;\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item.in[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item.out[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item.net[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]   .summary-info[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 1rem;\n  font-variant-numeric: tabular-nums;\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item.in[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item.out[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item.net[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--cash-color);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item.net[_ngcontent-%COMP%]   .summary-value.negative[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.summary-card[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%]   .summary-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.4px;\n  margin-top: 2px;\n}\n.summary-toggle-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  background: var(--ion-card-background);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 12px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n  padding: 14px 16px;\n  margin-bottom: 20px;\n  color: rgba(255, 255, 255, 0.9);\n}\n.summary-toggle-btn[_ngcontent-%COMP%]:active {\n  background: rgba(255, 215, 0, 0.08);\n}\n.summary-toggle-btn[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%]:first-child {\n  font-size: 20px;\n  color: var(--ion-color-primary);\n  flex-shrink: 0;\n}\n.summary-toggle-btn[_ngcontent-%COMP%]   .summary-toggle-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 0.92rem;\n}\n.summary-toggle-btn[_ngcontent-%COMP%]   .summary-toggle-net[_ngcontent-%COMP%] {\n  margin-left: auto;\n  font-weight: 700;\n  font-size: 0.95rem;\n  font-variant-numeric: tabular-nums;\n  color: var(--cash-color);\n}\n.summary-toggle-btn[_ngcontent-%COMP%]   .summary-toggle-net.negative[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.summary-toggle-btn[_ngcontent-%COMP%]   .summary-toggle-chevron[_ngcontent-%COMP%] {\n  font-size: 16px;\n  color: rgba(255, 255, 255, 0.35);\n  flex-shrink: 0;\n}\n@media (min-width: 768px) {\n  .summary-toggle-btn[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n@media (max-width: 767.98px) {\n  .summary-card[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n.empty-week[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  padding: 48px 24px;\n  color: rgba(255, 255, 255, 0.6);\n}\n.empty-week[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 48px;\n  color: var(--ion-color-medium);\n  margin-bottom: 12px;\n}\n.empty-week[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 6px 0;\n  color: rgba(255, 255, 255, 0.85);\n}\n.empty-week[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9rem;\n  max-width: 280px;\n}\n.day-section[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.day-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  padding: 0 6px 8px 6px;\n  border-bottom: 2px solid rgba(255, 215, 0, 0.25);\n  margin-bottom: 4px;\n}\n.day-header[_ngcontent-%COMP%]   .day-header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n}\n.day-header[_ngcontent-%COMP%]   .day-name[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  font-size: 1.05rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.day-header[_ngcontent-%COMP%]   .day-date[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.55);\n  font-size: 0.85rem;\n}\n.day-header[_ngcontent-%COMP%]   .day-today-tag[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: var(--ion-color-success);\n  border: 1px solid rgba(var(--ion-color-success-rgb), 0.4);\n  border-radius: 8px;\n  padding: 1px 6px;\n  text-transform: uppercase;\n  letter-spacing: 0.4px;\n}\n.day-header[_ngcontent-%COMP%]   .day-total[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.9rem;\n  font-variant-numeric: tabular-nums;\n  color: rgba(255, 255, 255, 0.7);\n}\n.day-header[_ngcontent-%COMP%]   .day-total.positive[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.day-header[_ngcontent-%COMP%]   .day-total.negative[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.no-items[_ngcontent-%COMP%] {\n  padding: 12px 8px;\n  color: rgba(255, 255, 255, 0.35);\n  font-size: 0.85rem;\n  font-style: italic;\n}\n.receipt-list[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: 1px solid rgba(255, 215, 0, 0.15);\n  border-radius: 10px;\n  overflow: hidden;\n}\n.receipt-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px 14px;\n  border-bottom: 1px dashed rgba(255, 255, 255, 0.12);\n}\n.receipt-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.receipt-row[_ngcontent-%COMP%]   .item-icon[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  width: 32px;\n  text-align: center;\n  flex-shrink: 0;\n}\n.receipt-row[_ngcontent-%COMP%]   .item-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.receipt-row[_ngcontent-%COMP%]   .item-info[_ngcontent-%COMP%]   .item-title[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.95);\n  font-weight: 600;\n  font-size: 0.92rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.receipt-row[_ngcontent-%COMP%]   .item-info[_ngcontent-%COMP%]   .item-subtitle[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.55);\n  font-size: 0.78rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin-top: 1px;\n}\n.receipt-row[_ngcontent-%COMP%]   .item-right[_ngcontent-%COMP%] {\n  text-align: right;\n  flex-shrink: 0;\n}\n.receipt-row[_ngcontent-%COMP%]   .item-right[_ngcontent-%COMP%]   .item-amount[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.92rem;\n  font-variant-numeric: tabular-nums;\n  color: rgba(255, 255, 255, 0.8);\n}\n.receipt-row[_ngcontent-%COMP%]   .item-right[_ngcontent-%COMP%]   .item-amount.positive[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.receipt-row[_ngcontent-%COMP%]   .item-right[_ngcontent-%COMP%]   .item-amount.negative[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.receipt-row[_ngcontent-%COMP%]   .item-right[_ngcontent-%COMP%]   .item-time[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.4);\n  font-size: 0.7rem;\n  margin-top: 2px;\n}\nion-modal.summary-modal[_ngcontent-%COMP%] {\n  --width: min(320px, 88vw);\n  --height: auto;\n  --border-radius: 18px;\n  --box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);\n  --background: var(--ion-card-background);\n}\nion-modal.summary-modal[_ngcontent-%COMP%]::part(backdrop) {\n  background: rgba(0, 0, 0, 0.6);\n  opacity: 1;\n}\n.summary-modal-content[_ngcontent-%COMP%] {\n  padding: 20px;\n  border: 1px solid rgba(255, 215, 0, 0.25);\n  border-radius: 18px;\n}\n.summary-modal-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n}\n.summary-modal-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.summary-modal-header[_ngcontent-%COMP%]   .summary-modal-close[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.08);\n  color: rgba(255, 255, 255, 0.7);\n  flex-shrink: 0;\n}\n.summary-modal-header[_ngcontent-%COMP%]   .summary-modal-close[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 16px;\n}\n.summary-modal-header[_ngcontent-%COMP%]   .summary-modal-close[_ngcontent-%COMP%]:active {\n  background: rgba(255, 255, 255, 0.16);\n}\n.summary-modal-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 12px 4px;\n  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);\n}\n.summary-modal-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.summary-modal-row[_ngcontent-%COMP%]   .summary-modal-icon[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 38px;\n  height: 38px;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.06);\n  flex-shrink: 0;\n}\n.summary-modal-row[_ngcontent-%COMP%]   .summary-modal-icon[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n}\n.summary-modal-row.in[_ngcontent-%COMP%]   .summary-modal-icon[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.summary-modal-row.out[_ngcontent-%COMP%]   .summary-modal-icon[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.summary-modal-row.net[_ngcontent-%COMP%]   .summary-modal-icon[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n}\n.summary-modal-row[_ngcontent-%COMP%]   .summary-modal-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.4px;\n}\n.summary-modal-row[_ngcontent-%COMP%]   .summary-modal-value[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 1.1rem;\n  font-variant-numeric: tabular-nums;\n  margin-top: 2px;\n}\n.summary-modal-row.in[_ngcontent-%COMP%]   .summary-modal-value[_ngcontent-%COMP%] {\n  color: var(--ion-color-success);\n}\n.summary-modal-row.out[_ngcontent-%COMP%]   .summary-modal-value[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n.summary-modal-row.net[_ngcontent-%COMP%]   .summary-modal-value[_ngcontent-%COMP%] {\n  color: var(--cash-color);\n}\n.summary-modal-row.net[_ngcontent-%COMP%]   .summary-modal-value.negative[_ngcontent-%COMP%] {\n  color: var(--ion-color-danger);\n}\n@media (min-width: 768px) {\n  .page-container[_ngcontent-%COMP%] {\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 0 24px 90px 24px;\n  }\n}\n@media (min-width: 1024px) {\n  .page-container[_ngcontent-%COMP%] {\n    max-width: 900px;\n  }\n}\n/*# sourceMappingURL=weekly-receipt.page.css.map */"] });
var WeeklyReceiptPage = _WeeklyReceiptPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WeeklyReceiptPage, [{
    type: Component,
    args: [{ selector: "app-weekly-receipt", standalone: true, imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonSpinner, IonModal], template: `<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-button fill="clear" slot="start" (click)="goHome()">
      <ion-icon name="arrow-back"></ion-icon>
    </ion-button>
    <ion-title>\u{1F9FE} Weekly Receipt</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding" [scrollY]="false">
  <div class="scrollable-content">
    <div class="page-container">

      <!-- Week navigator -->
      <div class="week-nav">
        <button class="week-nav-arrow" (click)="previousWeek()" [disabled]="loading" aria-label="Previous week">
          <ion-icon name="chevron-back"></ion-icon>
        </button>
        <div class="week-nav-label">
          <span class="week-range">{{ weekRangeLabel }}</span>
          <span class="week-current-tag" *ngIf="isCurrentWeek">This week</span>
        </div>
        <button class="week-nav-arrow" (click)="nextWeek()" [disabled]="loading || isCurrentWeek" aria-label="Next week">
          <ion-icon name="chevron-forward"></ion-icon>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Tallying up your week...</p>
      </div>

      <!-- Error -->
      <div *ngIf="!loading && error" class="error-banner">
        <ion-icon name="alert-circle-outline"></ion-icon>
        <span>{{ error }}</span>
      </div>

      <ng-container *ngIf="!loading && !error && receipt">

        <!-- Weekly summary (desktop / wide screens) -->
        <div class="summary-card">
          <div class="summary-item in">
            <ion-icon name="trending-up-outline"></ion-icon>
            <div class="summary-info">
              <div class="summary-value">+\${{ formatMoney(receipt.totalIn) }}</div>
              <div class="summary-label">Total In</div>
            </div>
          </div>
          <div class="summary-item out">
            <ion-icon name="trending-down-outline"></ion-icon>
            <div class="summary-info">
              <div class="summary-value">-\${{ formatMoney(receipt.totalOut * -1) }}</div>
              <div class="summary-label">Total Out</div>
            </div>
          </div>
          <div class="summary-item net">
            <ion-icon name="wallet-outline"></ion-icon>
            <div class="summary-info">
              <div class="summary-value" [class.negative]="receipt.net < 0">
                {{ receipt.net >= 0 ? '+' : '-' }}\${{ formatMoney(receipt.net < 0 ? receipt.net * -1 : receipt.net) }}
              </div>
              <div class="summary-label">Net</div>
            </div>
          </div>
        </div>

        <!-- Weekly summary toggle (mobile / narrow screens) -->
        <button class="summary-toggle-btn" (click)="showSummaryModal = true">
          <ion-icon name="receipt-outline"></ion-icon>
          <span class="summary-toggle-label">Weekly Totals</span>
          <span class="summary-toggle-net" [class.negative]="receipt.net < 0">
            {{ receipt.net >= 0 ? '+' : '-' }}\${{ formatMoney(receipt.net < 0 ? receipt.net * -1 : receipt.net) }}
          </span>
          <ion-icon name="chevron-forward" class="summary-toggle-chevron"></ion-icon>
        </button>

        <!-- Empty week -->
        <div class="empty-week" *ngIf="receipt.itemCount === 0">
          <ion-icon name="document-text-outline"></ion-icon>
          <h3>No transactions this week</h3>
          <p>Complete habits, trade stocks, or sell a business to see it itemized here.</p>
        </div>

        <!-- Days -->
        <div class="day-section" *ngFor="let day of receipt.days">
          <div class="day-header">
            <div class="day-header-left">
              <span class="day-name">{{ day.dayName }}</span>
              <span class="day-date">{{ day.dateLabel }}</span>
              <span class="day-today-tag" *ngIf="day.isToday">Today</span>
            </div>
            <span
              class="day-total"
              *ngIf="hasAnyItems(day)"
              [class.positive]="day.total > 0"
              [class.negative]="day.total < 0"
            >{{ amountLabel(day.total) }}</span>
          </div>

          <div class="receipt-list" *ngIf="hasAnyItems(day); else noItems">
            <div class="receipt-row" *ngFor="let item of day.items">
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-subtitle">{{ item.subtitle }}</div>
              </div>
              <div class="item-right">
                <div class="item-amount" [class.positive]="item.amount > 0" [class.negative]="item.amount < 0">
                  {{ amountLabel(item.amount) }}
                </div>
                <div class="item-time">{{ timeLabel(item.timestamp) }}</div>
              </div>
            </div>
          </div>
          <ng-template #noItems>
            <div class="no-items">No transactions</div>
          </ng-template>
        </div>

      </ng-container>
    </div>
  </div>
</ion-content>

<!-- Weekly summary popup (mobile) -->
<ion-modal
  class="summary-modal"
  [isOpen]="showSummaryModal"
  (didDismiss)="showSummaryModal = false"
>
  <ng-template>
    <div class="summary-modal-content" *ngIf="receipt">
      <div class="summary-modal-header">
        <h2>Weekly Totals</h2>
        <button class="summary-modal-close" (click)="showSummaryModal = false" aria-label="Close">
          <ion-icon name="close"></ion-icon>
        </button>
      </div>

      <div class="summary-modal-row in">
        <div class="summary-modal-icon">
          <ion-icon name="trending-up-outline"></ion-icon>
        </div>
        <div class="summary-modal-info">
          <div class="summary-modal-label">Total In</div>
          <div class="summary-modal-value">+\${{ formatMoney(receipt.totalIn) }}</div>
        </div>
      </div>

      <div class="summary-modal-row out">
        <div class="summary-modal-icon">
          <ion-icon name="trending-down-outline"></ion-icon>
        </div>
        <div class="summary-modal-info">
          <div class="summary-modal-label">Total Out</div>
          <div class="summary-modal-value">-\${{ formatMoney(receipt.totalOut * -1) }}</div>
        </div>
      </div>

      <div class="summary-modal-row net">
        <div class="summary-modal-icon">
          <ion-icon name="wallet-outline"></ion-icon>
        </div>
        <div class="summary-modal-info">
          <div class="summary-modal-label">Net</div>
          <div class="summary-modal-value" [class.negative]="receipt.net < 0">
            {{ receipt.net >= 0 ? '+' : '-' }}\${{ formatMoney(receipt.net < 0 ? receipt.net * -1 : receipt.net) }}
          </div>
        </div>
      </div>
    </div>
  </ng-template>
</ion-modal>
`, styles: ["/* src/app/weekly-receipt/weekly-receipt.page.scss */\n.scrollable-content {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.scrollable-content::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding-bottom: 90px;\n}\n.loading-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: var(--ion-color-medium);\n}\n.loading-container ion-spinner {\n  margin-bottom: 16px;\n  --color: var(--ion-color-primary);\n}\n.loading-container p {\n  color: rgba(255, 255, 255, 0.8);\n  text-align: center;\n}\n.error-banner {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 14px 16px;\n  background: rgba(var(--ion-color-danger-rgb), 0.1);\n  border: 1px solid rgba(var(--ion-color-danger-rgb), 0.3);\n  border-radius: 10px;\n  color: rgba(255, 255, 255, 0.9);\n  margin-bottom: 16px;\n}\n.error-banner ion-icon {\n  font-size: 22px;\n  color: var(--ion-color-danger);\n  flex-shrink: 0;\n}\n.week-nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 16px;\n  padding: 10px 6px;\n}\n.week-nav .week-nav-arrow {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  background: rgba(255, 255, 255, 0.05);\n  color: var(--ion-color-primary);\n  flex-shrink: 0;\n}\n.week-nav .week-nav-arrow ion-icon {\n  font-size: 20px;\n}\n.week-nav .week-nav-arrow:disabled {\n  opacity: 0.3;\n}\n.week-nav .week-nav-arrow:not(:disabled):active {\n  background: rgba(255, 215, 0, 0.15);\n}\n.week-nav .week-nav-label {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  flex: 1;\n  text-align: center;\n}\n.week-nav .week-nav-label .week-range {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  font-size: 1.05rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.week-nav .week-nav-label .week-current-tag {\n  margin-top: 2px;\n  font-size: 0.7rem;\n  color: var(--ion-color-success);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.summary-card {\n  display: flex;\n  background: var(--ion-card-background);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 12px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n  margin-bottom: 20px;\n  overflow: hidden;\n}\n.summary-card .summary-item {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  padding: 14px 8px;\n  border-right: 1px solid rgba(255, 255, 255, 0.08);\n}\n.summary-card .summary-item:last-child {\n  border-right: none;\n}\n.summary-card .summary-item ion-icon {\n  font-size: 18px;\n}\n.summary-card .summary-item.in ion-icon {\n  color: var(--ion-color-success);\n}\n.summary-card .summary-item.out ion-icon {\n  color: var(--ion-color-danger);\n}\n.summary-card .summary-item.net ion-icon {\n  color: var(--ion-color-primary);\n}\n.summary-card .summary-item .summary-info {\n  text-align: center;\n}\n.summary-card .summary-item .summary-value {\n  font-weight: 700;\n  font-size: 1rem;\n  font-variant-numeric: tabular-nums;\n}\n.summary-card .summary-item.in .summary-value {\n  color: var(--ion-color-success);\n}\n.summary-card .summary-item.out .summary-value {\n  color: var(--ion-color-danger);\n}\n.summary-card .summary-item.net .summary-value {\n  color: var(--cash-color);\n}\n.summary-card .summary-item.net .summary-value.negative {\n  color: var(--ion-color-danger);\n}\n.summary-card .summary-item .summary-label {\n  font-size: 0.68rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.4px;\n  margin-top: 2px;\n}\n.summary-toggle-btn {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  background: var(--ion-card-background);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 12px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n  padding: 14px 16px;\n  margin-bottom: 20px;\n  color: rgba(255, 255, 255, 0.9);\n}\n.summary-toggle-btn:active {\n  background: rgba(255, 215, 0, 0.08);\n}\n.summary-toggle-btn ion-icon:first-child {\n  font-size: 20px;\n  color: var(--ion-color-primary);\n  flex-shrink: 0;\n}\n.summary-toggle-btn .summary-toggle-label {\n  font-weight: 600;\n  font-size: 0.92rem;\n}\n.summary-toggle-btn .summary-toggle-net {\n  margin-left: auto;\n  font-weight: 700;\n  font-size: 0.95rem;\n  font-variant-numeric: tabular-nums;\n  color: var(--cash-color);\n}\n.summary-toggle-btn .summary-toggle-net.negative {\n  color: var(--ion-color-danger);\n}\n.summary-toggle-btn .summary-toggle-chevron {\n  font-size: 16px;\n  color: rgba(255, 255, 255, 0.35);\n  flex-shrink: 0;\n}\n@media (min-width: 768px) {\n  .summary-toggle-btn {\n    display: none;\n  }\n}\n@media (max-width: 767.98px) {\n  .summary-card {\n    display: none;\n  }\n}\n.empty-week {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  padding: 48px 24px;\n  color: rgba(255, 255, 255, 0.6);\n}\n.empty-week ion-icon {\n  font-size: 48px;\n  color: var(--ion-color-medium);\n  margin-bottom: 12px;\n}\n.empty-week h3 {\n  margin: 0 0 6px 0;\n  color: rgba(255, 255, 255, 0.85);\n}\n.empty-week p {\n  margin: 0;\n  font-size: 0.9rem;\n  max-width: 280px;\n}\n.day-section {\n  margin-bottom: 20px;\n}\n.day-header {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  padding: 0 6px 8px 6px;\n  border-bottom: 2px solid rgba(255, 215, 0, 0.25);\n  margin-bottom: 4px;\n}\n.day-header .day-header-left {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n}\n.day-header .day-name {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  font-size: 1.05rem;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.day-header .day-date {\n  color: rgba(255, 255, 255, 0.55);\n  font-size: 0.85rem;\n}\n.day-header .day-today-tag {\n  font-size: 0.65rem;\n  color: var(--ion-color-success);\n  border: 1px solid rgba(var(--ion-color-success-rgb), 0.4);\n  border-radius: 8px;\n  padding: 1px 6px;\n  text-transform: uppercase;\n  letter-spacing: 0.4px;\n}\n.day-header .day-total {\n  font-weight: 700;\n  font-size: 0.9rem;\n  font-variant-numeric: tabular-nums;\n  color: rgba(255, 255, 255, 0.7);\n}\n.day-header .day-total.positive {\n  color: var(--ion-color-success);\n}\n.day-header .day-total.negative {\n  color: var(--ion-color-danger);\n}\n.no-items {\n  padding: 12px 8px;\n  color: rgba(255, 255, 255, 0.35);\n  font-size: 0.85rem;\n  font-style: italic;\n}\n.receipt-list {\n  background: var(--business-item-background);\n  border: 1px solid rgba(255, 215, 0, 0.15);\n  border-radius: 10px;\n  overflow: hidden;\n}\n.receipt-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px 14px;\n  border-bottom: 1px dashed rgba(255, 255, 255, 0.12);\n}\n.receipt-row:last-child {\n  border-bottom: none;\n}\n.receipt-row .item-icon {\n  font-size: 1.4rem;\n  width: 32px;\n  text-align: center;\n  flex-shrink: 0;\n}\n.receipt-row .item-info {\n  flex: 1;\n  min-width: 0;\n}\n.receipt-row .item-info .item-title {\n  color: rgba(255, 255, 255, 0.95);\n  font-weight: 600;\n  font-size: 0.92rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.receipt-row .item-info .item-subtitle {\n  color: rgba(255, 255, 255, 0.55);\n  font-size: 0.78rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin-top: 1px;\n}\n.receipt-row .item-right {\n  text-align: right;\n  flex-shrink: 0;\n}\n.receipt-row .item-right .item-amount {\n  font-weight: 700;\n  font-size: 0.92rem;\n  font-variant-numeric: tabular-nums;\n  color: rgba(255, 255, 255, 0.8);\n}\n.receipt-row .item-right .item-amount.positive {\n  color: var(--ion-color-success);\n}\n.receipt-row .item-right .item-amount.negative {\n  color: var(--ion-color-danger);\n}\n.receipt-row .item-right .item-time {\n  color: rgba(255, 255, 255, 0.4);\n  font-size: 0.7rem;\n  margin-top: 2px;\n}\nion-modal.summary-modal {\n  --width: min(320px, 88vw);\n  --height: auto;\n  --border-radius: 18px;\n  --box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);\n  --background: var(--ion-card-background);\n}\nion-modal.summary-modal::part(backdrop) {\n  background: rgba(0, 0, 0, 0.6);\n  opacity: 1;\n}\n.summary-modal-content {\n  padding: 20px;\n  border: 1px solid rgba(255, 215, 0, 0.25);\n  border-radius: 18px;\n}\n.summary-modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n}\n.summary-modal-header h2 {\n  margin: 0;\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: var(--ion-color-primary);\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.summary-modal-header .summary-modal-close {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 30px;\n  height: 30px;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.08);\n  color: rgba(255, 255, 255, 0.7);\n  flex-shrink: 0;\n}\n.summary-modal-header .summary-modal-close ion-icon {\n  font-size: 16px;\n}\n.summary-modal-header .summary-modal-close:active {\n  background: rgba(255, 255, 255, 0.16);\n}\n.summary-modal-row {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 12px 4px;\n  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);\n}\n.summary-modal-row:last-child {\n  border-bottom: none;\n}\n.summary-modal-row .summary-modal-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 38px;\n  height: 38px;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.06);\n  flex-shrink: 0;\n}\n.summary-modal-row .summary-modal-icon ion-icon {\n  font-size: 18px;\n}\n.summary-modal-row.in .summary-modal-icon ion-icon {\n  color: var(--ion-color-success);\n}\n.summary-modal-row.out .summary-modal-icon ion-icon {\n  color: var(--ion-color-danger);\n}\n.summary-modal-row.net .summary-modal-icon ion-icon {\n  color: var(--ion-color-primary);\n}\n.summary-modal-row .summary-modal-label {\n  font-size: 0.72rem;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.4px;\n}\n.summary-modal-row .summary-modal-value {\n  font-weight: 700;\n  font-size: 1.1rem;\n  font-variant-numeric: tabular-nums;\n  margin-top: 2px;\n}\n.summary-modal-row.in .summary-modal-value {\n  color: var(--ion-color-success);\n}\n.summary-modal-row.out .summary-modal-value {\n  color: var(--ion-color-danger);\n}\n.summary-modal-row.net .summary-modal-value {\n  color: var(--cash-color);\n}\n.summary-modal-row.net .summary-modal-value.negative {\n  color: var(--ion-color-danger);\n}\n@media (min-width: 768px) {\n  .page-container {\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 0 24px 90px 24px;\n  }\n}\n@media (min-width: 1024px) {\n  .page-container {\n    max-width: 900px;\n  }\n}\n/*# sourceMappingURL=weekly-receipt.page.css.map */\n"] }]
  }], () => [{ type: WeeklyReceiptService }, { type: Router }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(WeeklyReceiptPage, { className: "WeeklyReceiptPage", filePath: "src/app/weekly-receipt/weekly-receipt.page.ts", lineNumber: 36 });
})();
export {
  WeeklyReceiptPage
};
//# sourceMappingURL=weekly-receipt.page-HXHN4MIZ.js.map
