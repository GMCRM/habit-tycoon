import {
  HabitBusinessService
} from "./chunk-GSSZ5PLU.js";
import {
  BehaviorSubject,
  CommonModule,
  Component,
  HostListener,
  Injectable,
  Input,
  IonButton,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  NgForOf,
  NgIf,
  ViewChild,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵresetView,
  ɵɵresolveWindow,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵviewQuery
} from "./chunk-AYR3XDH5.js";
import {
  __async
} from "./chunk-QXFS4N4X.js";

// src/app/services/habit-update.service.ts
var _HabitUpdateService = class _HabitUpdateService {
  constructor() {
    this.updateSubject = new BehaviorSubject(null);
    this.updates$ = this.updateSubject.asObservable();
  }
  /**
   * Get today's date in local timezone as YYYY-MM-DD string
   */
  getLocalDateString(date = /* @__PURE__ */ new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  /**
   * Emit a habit completion event
   */
  emitHabitCompletion(habitBusinessId, completionDate = this.getLocalDateString()) {
    console.log("\u{1F4E1} Emitting habit completion event:", { habitBusinessId, completionDate });
    this.updateSubject.next({
      type: "completion",
      habitBusinessId,
      completionDate,
      timestamp: Date.now()
    });
  }
  /**
   * Emit a habit undo event
   */
  emitHabitUndo(habitBusinessId, completionDate = this.getLocalDateString()) {
    console.log("\u{1F4E1} Emitting habit undo event:", { habitBusinessId, completionDate });
    this.updateSubject.next({
      type: "undo",
      habitBusinessId,
      completionDate,
      timestamp: Date.now()
    });
  }
  /**
   * Clear the current update event
   */
  clearUpdate() {
    this.updateSubject.next(null);
  }
};
_HabitUpdateService.\u0275fac = function HabitUpdateService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HabitUpdateService)();
};
_HabitUpdateService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _HabitUpdateService, factory: _HabitUpdateService.\u0275fac, providedIn: "root" });
var HabitUpdateService = _HabitUpdateService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HabitUpdateService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/shared/components/habit-grid/habit-grid.component.ts
var _c0 = ["scrollArea"];
function HabitGridComponent_ion_header_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header")(1, "ion-toolbar", 13)(2, "ion-title", 14)(3, "span", 15);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r0.businessEmoji);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r0.businessName, " - ", ctx_r0.currentYear, " Progress ");
  }
}
function HabitGridComponent_span_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 16);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const month_r2 = ctx.$implicit;
    \u0275\u0275styleProp("grid-column", month_r2.column + " / span " + month_r2.span);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", month_r2.name, " ");
  }
}
function HabitGridComponent_div_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275listener("click", function HabitGridComponent_div_9_Template_div_click_0_listener() {
      const day_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onDayClick(day_r4));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const day_r4 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("background-color", ctx_r0.getDayColor(day_r4))("border-color", ctx_r0.getDayBorderColor(day_r4))("opacity", day_r4.level === 0 ? 0.2 : 1);
    \u0275\u0275classProp("no-data", day_r4.level === 0)("missed", day_r4.level === 1)("completed", day_r4.level === 2)("streak-milestone", day_r4.level === 3)("is-today", ctx_r0.isToday(day_r4.date))("future-year", ctx_r0.isFutureYear(day_r4.date))("first-of-month", ctx_r0.isFirstOfMonth(day_r4.date));
  }
}
function HabitGridComponent_div_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18)(1, "div", 19)(2, "span", 20);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 21);
    \u0275\u0275text(5, "Completed");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 19)(7, "span", 20);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 21);
    \u0275\u0275text(10, "Success Rate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 19)(12, "span", 20);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "span", 21);
    \u0275\u0275text(15, "Current Streak");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "div", 19)(17, "span", 20);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 21);
    \u0275\u0275text(20, "Longest Streak");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.completedDays);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", (ctx_r0.completionRate * 100).toFixed(0), "%");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.currentStreak);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.longestStreak);
  }
}
function HabitGridComponent_div_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22)(1, "p");
    \u0275\u0275text(2, "\u{1F4CA} Debug Info:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Business ID: ", ctx_r0.businessId);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Data Points: ", ctx_r0.data.length);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Grid Days: ", ctx_r0.gridDays.length);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Using Real Data: ", ctx_r0.usingRealData ? "\u2705 Yes" : "\u274C No (Mock)");
  }
}
function HabitGridComponent_div_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 23)(1, "ion-button", 24);
    \u0275\u0275listener("click", function HabitGridComponent_div_12_Template_ion_button_click_1_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.closeModal());
    });
    \u0275\u0275text(2, " Close ");
    \u0275\u0275elementEnd()();
  }
}
var _HabitGridComponent = class _HabitGridComponent {
  constructor() {
    this.data = [];
    this.businessId = "";
    this.businessName = "";
    this.businessEmoji = "\u{1F4C8}";
    this.businessType = "";
    this.businessCreatedAt = "";
    this.showStats = true;
    this.weeksToShow = 53;
    this.size = "medium";
    this.isModal = false;
    this.isStockView = false;
    this.useCalendarYear = false;
    this.currentMonthOffset = 0;
    this.showMonthView = true;
    this.gridDays = [];
    this.monthLabels = [];
    this.weeks = 53;
    this.currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    this.isMobileScreen = false;
    this.totalDays = 0;
    this.completedDays = 0;
    this.completionRate = 0;
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.usingRealData = false;
    this.isDebugMode = false;
    this.habitBusinessService = inject(HabitBusinessService);
    this.habitUpdateService = inject(HabitUpdateService);
    this.businessColors = {
      "\u{1F34B}": "#FFD700",
      // Lemonade Stand - bright yellow
      "\u{1F4F0}": "#F5F5F5",
      // Paper Route - off-white
      "\u{1F9FD}": "#87CEEB",
      // Car Wash - sky blue
      "\u{1F6CD}\uFE0F": "#FFB6C1",
      // Retail Store - light pink
      "\u{1F355}": "#FF6347",
      // Pizza Delivery - tomato red
      "\u{1F331}": "#90EE90",
      // Garden Service - light green
      "\u{1F3B5}": "#DDA0DD",
      // Music Lessons - plum
      "\u{1F4BB}": "#00CED1",
      // Tech Support - dark turquoise
      "\u{1F3C3}": "#FF4500",
      // Fitness Training - orange red
      "\u{1F4DA}": "#4169E1",
      // Tutoring - royal blue
      "\u{1F3A8}": "#DA70D6",
      // Art Classes - orchid
      "\u{1F415}": "#DEB887",
      // Pet Care - burlywood
      "\u{1F370}": "#F0E68C",
      // Baking Service - khaki
      "\u{1F9F9}": "#D3D3D3",
      // Cleaning Service - light gray
      "\u{1F697}": "#708090"
      // Driving Lessons - slate gray
    };
  }
  ngOnInit() {
    console.log("\u{1F3AF} HabitGrid ngOnInit - businessId:", this.businessId, "data length:", this.data.length);
    this.checkScreenSize();
    this.setupRealTimeUpdates();
    this.loadData();
  }
  ngOnChanges(changes) {
    if (changes["data"] || changes["businessId"] || changes["weeksToShow"]) {
      console.log("\u{1F504} HabitGrid data changed, regenerating grid");
      this.loadData();
    }
  }
  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }
  /**
   * Listen for window resize events to adjust grid for mobile
   */
  onResize(event) {
    this.checkScreenSize();
  }
  /**
   * Check if current screen size is mobile and regenerate grid if needed
   */
  checkScreenSize() {
    const previousMobileState = this.isMobileScreen;
    this.isMobileScreen = window.innerWidth <= 768;
    if (previousMobileState !== this.isMobileScreen) {
      console.log("\u{1F4F1} Screen size changed - Mobile:", this.isMobileScreen);
      this.generateGrid();
    }
  }
  /**
   * Set up real-time updates for habit completions/undos
   */
  setupRealTimeUpdates() {
    this.updateSubscription = this.habitUpdateService.updates$.subscribe((event) => {
      if (!event || !this.businessId)
        return;
      if (event.habitBusinessId === this.businessId) {
        console.log("\u{1F525} Real-time update received for habit:", this.businessId, "Type:", event.type);
        this.applyRealTimeUpdate(event);
      }
    });
  }
  /**
   * Apply real-time updates directly to the grid without full reload
   */
  applyRealTimeUpdate(event) {
    const todayStr = this.getLocalDateString();
    const updateDate = event.completionDate || todayStr;
    console.log("\u{1F4CA} Applying real-time update:", {
      type: event.type,
      date: updateDate,
      businessId: event.habitBusinessId,
      todayCalculated: todayStr,
      eventCompletionDate: event.completionDate
    });
    const gridDates = this.gridDays.map((d) => d.date).slice(0, 10);
    console.log("\u{1F4C5} First 10 grid dates:", gridDates);
    console.log("\u{1F4C5} Last 10 grid dates:", this.gridDays.map((d) => d.date).slice(-10));
    const todayIndex = this.gridDays.findIndex((d) => d.date === todayStr);
    const updateIndex = this.gridDays.findIndex((d) => d.date === updateDate);
    console.log("\u{1F4CD} Today index in grid:", todayIndex, "Update date index:", updateIndex);
    if (todayIndex >= 0) {
      console.log("\u{1F4C5} Grid context around today:", {
        yesterday: this.gridDays[todayIndex - 1]?.date,
        today: this.gridDays[todayIndex]?.date,
        tomorrow: this.gridDays[todayIndex + 1]?.date
      });
    }
    let updated = false;
    for (const day of this.gridDays) {
      if (day.date === updateDate) {
        console.log("\u{1F3AF} Found matching grid cell:", {
          date: day.date,
          currentLevel: day.level,
          currentCompleted: day.completed
        });
        if (event.type === "completion") {
          day.completed = true;
          day.level = 2;
          console.log("\u2705 Updated grid cell for completion:", updateDate);
        } else if (event.type === "undo") {
          day.completed = false;
          day.level = 1;
          day.streakDay = 0;
          console.log("\u21A9\uFE0F Updated grid cell for undo:", updateDate);
        }
        updated = true;
        break;
      }
    }
    if (updated) {
      this.calculateStats();
      console.log("\u{1F4C8} Grid updated in real-time! Completed days:", this.completedDays);
    } else {
      console.warn("\u26A0\uFE0F Could not find grid cell for date:", updateDate);
      console.warn("\u26A0\uFE0F Available dates in grid:", this.gridDays.length, "total dates");
      console.warn("\u26A0\uFE0F Date range:", this.gridDays[0]?.date, "to", this.gridDays[this.gridDays.length - 1]?.date);
    }
  }
  /**
   * Get today's date in local timezone as YYYY-MM-DD string
   */
  getLocalDateString(date = /* @__PURE__ */ new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  /**
   * Get local date string from any date object
   */
  getLocalDateStringFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  trackByDate(index, day) {
    return day.date;
  }
  isToday(dateStr) {
    const todayStr = this.getLocalDateString();
    return dateStr === todayStr;
  }
  isFirstOfMonth(dateStr) {
    const date = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    return date.getDate() === 1;
  }
  isFutureYear(dateStr) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    const dayDate = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    return dayDate < startDate || dayDate > endDate;
  }
  isFutureDate(dateStr) {
    const dayDate = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    const today = /* @__PURE__ */ new Date();
    today.setHours(23, 59, 59, 999);
    return dayDate > today;
  }
  isBeforeCreationDate(dateStr) {
    if (!this.businessCreatedAt)
      return false;
    const dayDate = /* @__PURE__ */ new Date(dateStr + "T12:00:00");
    const creationDate = new Date(this.businessCreatedAt);
    return dayDate < creationDate;
  }
  onDayClick(day) {
    if (day.level === 0)
      return;
    console.log("\u{1F4C5} Clicked day:", day.date, "Completed:", day.completed, "Streak:", day.streakDay);
  }
  closeModal() {
    return __async(this, null, function* () {
      if (this.modalController) {
        yield this.modalController.dismiss();
      }
    });
  }
  getCurrentMonthName() {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const date = /* @__PURE__ */ new Date();
    date.setMonth(date.getMonth() + this.currentMonthOffset);
    return monthNames[date.getMonth()];
  }
  getCurrentYear() {
    const date = /* @__PURE__ */ new Date();
    date.setMonth(date.getMonth() + this.currentMonthOffset);
    return date.getFullYear();
  }
  // Month navigation methods
  goToPreviousMonth() {
    this.currentMonthOffset--;
    this.loadData();
  }
  goToNextMonth() {
    this.currentMonthOffset++;
    this.loadData();
  }
  goToCurrentMonth() {
    this.currentMonthOffset = 0;
    this.loadData();
  }
  toggleView() {
    console.log("\u{1F504} TOGGLE VIEW:", {
      from: this.showMonthView ? "Month" : "Year",
      to: !this.showMonthView ? "Month" : "Year"
    });
    this.showMonthView = !this.showMonthView;
    if (this.showMonthView) {
      this.currentMonthOffset = 0;
      console.log("\u{1F4C5} Switched to MONTH view - should show current month");
    } else {
      console.log("\u{1F4CA} Switched to YEAR view - should show full year");
    }
    this.loadData();
  }
  getYearMonths() {
    const currentYear = this.getCurrentYear();
    const months = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthStart = new Date(currentYear, monthIndex, 1);
      const monthEnd = new Date(currentYear, monthIndex + 1, 0);
      const daysInMonth = monthEnd.getDate();
      const firstDayOfWeek = monthStart.getDay();
      const days = [];
      for (let i = 0; i < firstDayOfWeek; i++) {
        const prevMonthDay = new Date(currentYear, monthIndex, 0 - (firstDayOfWeek - 1 - i));
        days.push({
          dayNumber: prevMonthDay.getDate(),
          date: this.getLocalDateStringFromDate(prevMonthDay),
          inMonth: false,
          completed: false,
          level: 0
        });
      }
      let completedDays = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(currentYear, monthIndex, day);
        const dateStr = this.getLocalDateStringFromDate(dayDate);
        const dayData = this.data.find((d) => d.date === dateStr);
        const isCompleted = dayData?.completed || false;
        if (isCompleted)
          completedDays++;
        days.push({
          dayNumber: day,
          date: dateStr,
          inMonth: true,
          completed: isCompleted,
          level: dayData ? dayData.completed ? 2 : 1 : 0
        });
      }
      const totalCells = 42;
      const remainingCells = totalCells - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDay = new Date(currentYear, monthIndex + 1, i);
        days.push({
          dayNumber: i,
          date: this.getLocalDateStringFromDate(nextMonthDay),
          inMonth: false,
          completed: false,
          level: 0
        });
      }
      months.push({
        name: monthNames[monthIndex],
        days,
        completedDays,
        totalDays: daysInMonth
      });
    }
    return months;
  }
  getGridTemplateColumns() {
    return "repeat(" + this.weeks + ", var(--grid-size))";
  }
  getDayNumber(dateStr) {
    const date = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
    return date.getDate();
  }
  isCurrentMonth(dateStr) {
    const date = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
    const targetDate = /* @__PURE__ */ new Date();
    targetDate.setMonth(targetDate.getMonth() + this.currentMonthOffset);
    return date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear();
  }
  getBusinessColor() {
    const color = this.businessColors[this.businessEmoji];
    if (color)
      return color;
    const lowerName = this.businessName.toLowerCase();
    const lowerType = this.businessType.toLowerCase();
    if (lowerName.includes("lemon") || lowerType.includes("lemon"))
      return "#FFD700";
    if (lowerName.includes("paper") || lowerType.includes("paper"))
      return "#F5F5F5";
    if (lowerName.includes("car") || lowerName.includes("wash"))
      return "#87CEEB";
    if (lowerName.includes("retail") || lowerName.includes("store"))
      return "#FFB6C1";
    if (lowerName.includes("pizza") || lowerName.includes("food"))
      return "#FF6347";
    if (lowerName.includes("garden") || lowerName.includes("plant"))
      return "#90EE90";
    if (lowerName.includes("music") || lowerName.includes("lesson"))
      return "#DDA0DD";
    if (lowerName.includes("tech") || lowerName.includes("computer"))
      return "#00CED1";
    if (lowerName.includes("fitness") || lowerName.includes("gym"))
      return "#FF4500";
    if (lowerName.includes("tutor") || lowerName.includes("teach"))
      return "#4169E1";
    if (lowerName.includes("art") || lowerName.includes("paint"))
      return "#DA70D6";
    if (lowerName.includes("pet") || lowerName.includes("dog"))
      return "#DEB887";
    if (lowerName.includes("bak") || lowerName.includes("cake"))
      return "#F0E68C";
    if (lowerName.includes("clean"))
      return "#D3D3D3";
    if (lowerName.includes("driv") || lowerName.includes("car"))
      return "#708090";
    return "#FFD700";
  }
  getDayColor(day) {
    if (day.level === 0) {
      return "rgba(255, 255, 255, 0.05)";
    }
    if (this.isFirstOfMonth(day.date)) {
      if (day.level === 1) {
        return "rgba(147, 112, 219, 0.15)";
      } else if (day.level === 2) {
        const baseColor = this.getBusinessColor();
        return this.mixColors(baseColor, "#6495ED", 0.3);
      } else if (day.level === 3) {
        const baseColor = this.getBusinessColor();
        return this.mixColors(baseColor, "#4169E1", 0.4);
      } else {
        return "rgba(100, 149, 237, 0.1)";
      }
    }
    if (day.level === 1) {
      return "rgba(150, 150, 150, 0.05)";
    }
    if (day.level === 2) {
      return "rgba(255, 255, 255, 0.08)";
    } else if (day.level === 3) {
      return "rgba(255, 255, 255, 0.12)";
    }
    return "rgba(255, 255, 255, 0.05)";
  }
  getDayBorderColor(day) {
    if (day.level === 0) {
      return "rgba(255, 255, 255, 0.05)";
    }
    if (day.level === 1) {
      return "rgba(150, 150, 150, 0.3)";
    }
    const baseColor = this.getBusinessColor();
    if (day.level === 2) {
      return this.hexToRgba(baseColor, 0.8);
    } else if (day.level === 3) {
      return baseColor;
    }
    return "rgba(255, 255, 255, 0.1)";
  }
  hexToRgba(hex, alpha) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  mixColors(color1, color2, alpha) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    const weight1 = 0.7;
    const weight2 = 0.3;
    const r = Math.round(rgb1.r * weight1 + rgb2.r * weight2);
    const g = Math.round(rgb1.g * weight1 + rgb2.g * weight2);
    const b = Math.round(rgb1.b * weight1 + rgb2.b * weight2);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  hexToRgb(hex) {
    hex = hex.replace("#", "");
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }
  loadData() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} Loading habit grid data for businessId:", this.businessId);
        console.log("\u{1F50D} BusinessId type:", typeof this.businessId, "Length:", this.businessId?.length);
        console.log("\u{1F50D} Stock view mode:", this.isStockView);
        if (this.businessId) {
          console.log("\u{1F4E1} Fetching real habit completion history...");
          let history;
          if (this.isStockView) {
            console.log("\u{1F4C8} Using stock completion history method");
            history = yield this.habitBusinessService.getHabitCompletionHistoryForStock(
              this.businessId,
              365
              // Get full year of data
            );
          } else {
            console.log("\uFFFD Using regular completion history method");
            history = yield this.habitBusinessService.getHabitCompletionHistory(
              this.businessId,
              365
              // Get full year of data
            );
          }
          console.log("\u{1F4E5} Received completion history:", history.length, "days");
          console.log("\u{1F4CA} Sample completion data:", history.slice(0, 10));
          if (history && history.length > 0) {
            this.data = history;
            this.usingRealData = true;
            console.log("\u2705 Using real data with", this.data.length, "data points");
            const completedCount = this.data.filter((d) => d.completed).length;
            console.log("\u{1F3AF} Found", completedCount, "completed days out of", this.data.length, "total days");
          } else {
            console.warn("\u26A0\uFE0F No completion history found for business:", this.businessId);
            this.data = [];
            this.usingRealData = false;
          }
        } else {
          console.log("\u{1F3B2} No businessId provided - grid will show empty state");
          this.data = [];
          this.usingRealData = false;
        }
        this.generateGrid();
        this.calculateStats();
      } catch (error) {
        console.error("\u274C Error loading habit grid data:", error);
        console.log("\u{1F4DD} Using empty data due to error");
        this.data = [];
        this.usingRealData = false;
        this.generateGrid();
        this.calculateStats();
      }
    });
  }
  generateMockData() {
    console.log("\u{1F6AB} Mock data generation disabled - use real habit completion data only");
    this.data = [];
  }
  generateGrid() {
    console.log("\u{1F3D7}\uFE0F Generating habit grid with", this.data.length, "data points");
    console.log("\u{1F4F1} Mobile screen:", this.isMobileScreen);
    console.log("\u2699\uFE0F WeeksToShow input:", this.weeksToShow);
    this.gridDays = [];
    this.monthLabels = [];
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const today = /* @__PURE__ */ new Date();
    const todayStr = this.getLocalDateString(today);
    let weeksNeeded = this.weeksToShow;
    let startDate;
    let endDate;
    if (this.useCalendarYear) {
      const currentYear2 = today.getFullYear();
      startDate = new Date(currentYear2, 0, 1);
      endDate = new Date(currentYear2, 11, 31);
      const startDayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - startDayOfWeek);
      const endDayOfWeek = endDate.getDay();
      const saturdayAdjustment = endDayOfWeek === 6 ? 0 : 6 - endDayOfWeek;
      endDate.setDate(endDate.getDate() + saturdayAdjustment);
      const timeDiff = endDate.getTime() - startDate.getTime();
      weeksNeeded = Math.ceil(timeDiff / (1e3 * 3600 * 24 * 7));
      console.log("\u{1F4C5} Calendar year mode:", {
        calendarStart: new Date(currentYear2, 0, 1).toDateString(),
        calendarEnd: new Date(currentYear2, 11, 31).toDateString(),
        gridStart: startDate.toDateString(),
        gridEnd: endDate.toDateString(),
        weeksCalculated: weeksNeeded
      });
    } else {
      const totalDays = weeksNeeded * 7;
      const daysFromToday = Math.floor(totalDays / 2);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysFromToday);
      const startDayOfWeek = startDate.getDay();
      const mondayAdjustment = (startDayOfWeek + 6) % 7;
      startDate.setDate(startDate.getDate() - mondayAdjustment);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + weeksNeeded * 7 - 1);
      console.log("\u{1F4C5} Dynamic range calculation:", {
        weeksToShow: this.weeksToShow,
        totalDays,
        startDate: this.getLocalDateStringFromDate(startDate),
        endDate: this.getLocalDateStringFromDate(endDate),
        mondayStart: startDate.getDay() === 1 ? "Yes" : "No (day: " + startDate.getDay() + ")"
      });
    }
    this.checkAndClearNewYearData(currentYear);
    console.log(`\u{1F4C5} Grid will show ${weeksNeeded} weeks (${this.weeksToShow} weeks requested)`);
    this.generateMonthLabels(startDate, weeksNeeded, startDate, endDate);
    for (let week = 0; week < weeksNeeded; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + week * 7 + day);
        const dateStr = this.getLocalDateStringFromDate(currentDate);
        const dataPoint = this.data.find((d) => d.date === dateStr);
        const isInTargetRange = currentDate >= startDate && currentDate <= endDate;
        let level = 0;
        if (!isInTargetRange) {
          level = 0;
        } else if (dataPoint) {
          if (dataPoint.completed) {
            level = dataPoint.streak_day >= 7 ? 3 : 2;
          } else {
            level = 1;
          }
        } else if (currentDate > today) {
          level = 0;
        } else {
          level = 0;
        }
        const isCreatedDate = this.businessCreatedAt && dateStr === this.getLocalDateStringFromDate(new Date(this.businessCreatedAt));
        this.gridDays.push({
          date: dateStr,
          completed: dataPoint?.completed || false,
          streakDay: dataPoint?.streak_day || 0,
          level,
          isInCalendarYear: isInTargetRange,
          // Rename for clarity
          isCreatedDate: isCreatedDate || false
        });
        if (week === 0) {
          const expectedMonday = day === 0 && currentDate.getDay() === 1;
          console.log(`\u{1F50D} Week 0, Day ${day}: ${dateStr} = ${currentDate.toLocaleDateString("en-US", { weekday: "short" })} (${currentDate.getDay()}) ${expectedMonday ? "\u2705 Monday start" : ""}`);
        }
      }
    }
    this.weeks = weeksNeeded;
    console.log("\u2705 Generated grid with", this.gridDays.length, "days");
    console.log("\u{1F4C5} Grid covers:", startDate.toDateString(), "to", endDate.toDateString());
    if (this.isMobileScreen) {
      this.scrollToToday();
    }
  }
  /**
   * On mobile the year strip is wider than the screen and scrolls
   * horizontally - land on today instead of leaving the user at January.
   */
  scrollToToday() {
    setTimeout(() => {
      const container = this.scrollAreaRef?.nativeElement;
      if (!container)
        return;
      const todayEl = container.querySelector(".grid-day.is-today");
      if (todayEl) {
        container.scrollLeft = Math.max(0, todayEl.offsetLeft - container.clientWidth / 2 + todayEl.clientWidth / 2);
      } else {
        container.scrollLeft = container.scrollWidth;
      }
    });
  }
  /**
   * Check if it's a new year and clear data if needed
   */
  checkAndClearNewYearData(currentYear) {
    const lastDataYear = this.data.length > 0 ? new Date(this.data[this.data.length - 1].date).getFullYear() : currentYear;
    if (lastDataYear < currentYear) {
      console.log("\u{1F5D3}\uFE0F New year detected! Clearing old year data for fresh start");
      this.data = [];
    }
  }
  generateMonthLabels(startDate, weeksToShow = this.weeksToShow, targetStartDate, targetEndDate) {
    this.monthLabels = [];
    const useTargetDates = targetStartDate && targetEndDate;
    if (useTargetDates) {
      const startMonth = targetStartDate.getMonth();
      const startYear = targetStartDate.getFullYear();
      const endMonth = targetEndDate.getMonth();
      const endYear = targetEndDate.getFullYear();
      let currentMonth = startMonth;
      let currentYear = startYear;
      while (currentYear < endYear || currentYear === endYear && currentMonth <= endMonth) {
        const firstOfMonth = new Date(currentYear, currentMonth, 1);
        const firstOfMonthStr = this.getLocalDateStringFromDate(firstOfMonth);
        let weekColumn = -1;
        for (let week = 0; week < weeksToShow; week++) {
          for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + week * 7 + day);
            const currentDateStr = this.getLocalDateStringFromDate(currentDate);
            if (currentDateStr === firstOfMonthStr) {
              weekColumn = week + 1;
              break;
            }
          }
          if (weekColumn !== -1)
            break;
        }
        if (weekColumn !== -1) {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
          ];
          this.monthLabels.push({
            name: monthNames[currentMonth],
            column: weekColumn,
            span: 1
          });
        }
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
      }
    } else {
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      for (let month = 0; month < 12; month++) {
        const firstOfMonth = new Date(currentYear, month, 1);
        const firstOfMonthStr = this.getLocalDateStringFromDate(firstOfMonth);
        let weekColumn = -1;
        for (let week = 0; week < weeksToShow; week++) {
          for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + week * 7 + day);
            const currentDateStr = this.getLocalDateStringFromDate(currentDate);
            if (currentDateStr === firstOfMonthStr) {
              weekColumn = week + 1;
              break;
            }
          }
          if (weekColumn !== -1)
            break;
        }
        if (weekColumn !== -1) {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
          ];
          this.monthLabels.push({
            name: monthNames[month],
            column: weekColumn,
            span: 1
          });
        }
      }
    }
    console.log("\u{1F4C5} Month labels positioned above 1st day columns:", this.monthLabels);
  }
  calculateStats() {
    const todayStr = this.getLocalDateString();
    const validData = this.data.filter((d) => d.date <= todayStr);
    this.totalDays = validData.length;
    this.completedDays = validData.filter((d) => d.completed).length;
    this.completionRate = this.totalDays > 0 ? this.completedDays / this.totalDays : 0;
    this.currentStreak = 0;
    for (let i = validData.length - 1; i >= 0; i--) {
      if (validData[i].completed) {
        this.currentStreak++;
      } else {
        break;
      }
    }
    this.longestStreak = 0;
    let tempStreak = 0;
    for (const day of validData) {
      if (day.completed) {
        tempStreak++;
        this.longestStreak = Math.max(this.longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    console.log("\u{1F4CA} Grid stats calculated:", {
      totalDays: this.totalDays,
      completedDays: this.completedDays,
      completionRate: (this.completionRate * 100).toFixed(1) + "%",
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak
    });
  }
};
_HabitGridComponent.\u0275fac = function HabitGridComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _HabitGridComponent)();
};
_HabitGridComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HabitGridComponent, selectors: [["app-habit-grid"]], viewQuery: function HabitGridComponent_Query(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275viewQuery(_c0, 5);
  }
  if (rf & 2) {
    let _t;
    \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.scrollAreaRef = _t.first);
  }
}, hostBindings: function HabitGridComponent_HostBindings(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275listener("resize", function HabitGridComponent_resize_HostBindingHandler($event) {
      return ctx.onResize($event);
    }, \u0275\u0275resolveWindow);
  }
}, inputs: { data: "data", businessId: "businessId", businessName: "businessName", businessEmoji: "businessEmoji", businessType: "businessType", businessCreatedAt: "businessCreatedAt", showStats: "showStats", weeksToShow: "weeksToShow", size: "size", isModal: "isModal", modalController: "modalController", isStockView: "isStockView", useCalendarYear: "useCalendarYear" }, features: [\u0275\u0275NgOnChangesFeature], decls: 13, vars: 13, consts: [["scrollArea", ""], [4, "ngIf"], [1, "content-wrapper"], [1, "habit-grid-container"], [1, "grid-scroll-area"], [1, "grid-header"], [1, "month-labels"], ["class", "month-label", 3, "grid-column", 4, "ngFor", "ngForOf"], [1, "habit-grid"], ["class", "grid-day", 3, "no-data", "missed", "completed", "streak-milestone", "is-today", "future-year", "first-of-month", "background-color", "border-color", "opacity", "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], ["class", "grid-stats", 4, "ngIf"], ["class", "debug-info", 4, "ngIf"], ["class", "modal-footer", 4, "ngIf"], [1, "custom-toolbar"], [1, "grid-title"], [1, "business-emoji"], [1, "month-label"], [1, "grid-day", 3, "click"], [1, "grid-stats"], [1, "stat"], [1, "stat-value"], [1, "stat-label"], [1, "debug-info"], [1, "modal-footer"], ["expand", "block", "fill", "clear", "color", "medium", 1, "close-button", 3, "click"]], template: function HabitGridComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, HabitGridComponent_ion_header_0_Template, 6, 3, "ion-header", 1);
    \u0275\u0275elementStart(1, "div", 2)(2, "div", 3)(3, "div", 4, 0)(5, "div", 5)(6, "div", 6);
    \u0275\u0275template(7, HabitGridComponent_span_7_Template, 2, 3, "span", 7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 8);
    \u0275\u0275template(9, HabitGridComponent_div_9_Template, 1, 20, "div", 9);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(10, HabitGridComponent_div_10_Template, 21, 4, "div", 10)(11, HabitGridComponent_div_11_Template, 11, 4, "div", 11)(12, HabitGridComponent_div_12_Template, 3, 0, "div", 12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275property("ngIf", ctx.isModal);
    \u0275\u0275advance();
    \u0275\u0275classProp("modal-content", ctx.isModal);
    \u0275\u0275advance(5);
    \u0275\u0275styleProp("grid-template-columns", "repeat(" + ctx.weeks + ", var(--grid-size))");
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx.monthLabels);
    \u0275\u0275advance();
    \u0275\u0275styleProp("grid-template-columns", ctx.getGridTemplateColumns());
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx.gridDays)("ngForTrackBy", ctx.trackByDate);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.showStats);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.isDebugMode);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.isModal);
  }
}, dependencies: [CommonModule, NgForOf, NgIf, IonHeader, IonToolbar, IonTitle, IonButton], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n  --grid-size: 12px;\n  --grid-gap: 2px;\n}\n@media (max-width: 768px) {\n  [_nghost-%COMP%] {\n    --grid-size: 8px;\n    --grid-gap: 1px;\n  }\n}\n@media (max-width: 380px) {\n  [_nghost-%COMP%] {\n    --grid-size: 7px;\n  }\n}\n.habit-grid-container[_ngcontent-%COMP%] {\n  background: rgba(0, 0, 0, 0.3);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 12px;\n  padding: 8px;\n  margin: 0;\n  width: 100%;\n  max-width: 100%;\n  box-sizing: border-box;\n  overflow: hidden;\n}\n.grid-scroll-area[_ngcontent-%COMP%] {\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n  width: 100%;\n  scrollbar-width: thin;\n}\n.custom-toolbar[_ngcontent-%COMP%] {\n  --background: rgba(0, 0, 0, 0.95);\n  --color: #fff;\n  border-bottom: 1px solid rgba(255, 215, 0, 0.3);\n}\n.grid-title[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  font-weight: bold;\n  color: #fff;\n}\n.business-emoji[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  margin-right: 8px;\n}\n.close-icon[_ngcontent-%COMP%] {\n  color: #fff !important;\n  font-size: 1.4rem;\n  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));\n}\nion-button[fill=clear][_ngcontent-%COMP%] {\n  --color: #fff !important;\n  --background: rgba(255, 255, 255, 0.1);\n  --border-radius: 8px;\n}\nion-button[fill=clear][_ngcontent-%COMP%]:hover {\n  --background: rgba(255, 255, 255, 0.2);\n}\n.content-wrapper[_ngcontent-%COMP%] {\n  padding: 8px;\n}\n.modal-content[_ngcontent-%COMP%] {\n  padding: 20px;\n  background: rgba(0, 0, 0, 0.95);\n  color: #fff;\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: auto;\n}\n.grid-header[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n.month-labels[_ngcontent-%COMP%] {\n  display: grid;\n  gap: var(--grid-gap);\n  font-size: 10px;\n  color: rgba(255, 255, 255, 0.6);\n  margin-bottom: 8px;\n  overflow: visible;\n  width: max-content;\n  align-items: baseline;\n  height: 14px;\n}\n@media (max-width: 768px) {\n  .month-labels[_ngcontent-%COMP%] {\n    font-size: 8px;\n  }\n}\n.month-label[_ngcontent-%COMP%] {\n  text-align: center;\n  font-weight: 500;\n  line-height: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n}\n.habit-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-rows: repeat(7, var(--grid-size));\n  grid-auto-flow: column;\n  gap: var(--grid-gap);\n  margin-bottom: 12px;\n  overflow: visible;\n  width: max-content;\n}\n.grid-day[_ngcontent-%COMP%] {\n  width: var(--grid-size);\n  height: var(--grid-size);\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  position: relative;\n}\n.grid-day.future-year[_ngcontent-%COMP%] {\n  visibility: hidden;\n}\n.grid-day[_ngcontent-%COMP%]:hover {\n  transform: scale(1.3);\n  z-index: 10;\n  border-width: 2px;\n}\n.grid-day.is-today[_ngcontent-%COMP%] {\n  border: 2px solid #FFD700;\n  box-shadow: 0 0 4px rgba(255, 215, 0, 0.6);\n}\n.grid-day.first-of-month[_ngcontent-%COMP%] {\n  border: 1px solid rgba(100, 149, 237, 0.5) !important;\n  box-shadow: 0 0 2px rgba(100, 149, 237, 0.3);\n}\n.day-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 18px;\n  font-weight: bold;\n  z-index: 5;\n  pointer-events: none;\n  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);\n}\n.debug-info[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  padding: 12px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 8px;\n  font-size: 11px;\n  color: rgba(255, 255, 255, 0.7);\n}\n.debug-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 4px 0;\n}\n.grid-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-around;\n  padding-top: 12px;\n  border-top: 1px solid rgba(255, 215, 0, 0.2);\n  background: rgba(255, 255, 255, 0.02);\n  border-radius: 8px;\n  margin-top: 8px;\n  padding: 16px;\n}\n@media (max-width: 480px) {\n  .grid-stats[_ngcontent-%COMP%] {\n    padding: 10px;\n    gap: 8px 4px;\n  }\n  .stat-value[_ngcontent-%COMP%] {\n    font-size: 14px;\n  }\n}\n.stat[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n}\n.stat-value[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: bold;\n  color: #FFD700;\n}\n.stat-label[_ngcontent-%COMP%] {\n  font-size: 9px;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n/*# sourceMappingURL=habit-grid.component.css.map */"] });
var HabitGridComponent = _HabitGridComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HabitGridComponent, [{
    type: Component,
    args: [{ selector: "app-habit-grid", standalone: true, imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon], template: `
    <!-- Modal Header (only shows when used as modal) -->
    <ion-header *ngIf="isModal">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="grid-title">
          <span class="business-emoji">{{ businessEmoji }}</span>
          {{ businessName }} - {{ currentYear }} Progress
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- Content wrapper -->
    <div class="content-wrapper" [class.modal-content]="isModal">
      <div class="habit-grid-container">
        <!-- Horizontally scrollable year strip (grid can be wider than the viewport on mobile) -->
        <div class="grid-scroll-area" #scrollArea>
          <!-- Header with month labels -->
          <div class="grid-header">
            <div class="month-labels" [style.grid-template-columns]="'repeat(' + weeks + ', var(--grid-size))'">
              <span
                *ngFor="let month of monthLabels"
                class="month-label"
                [style.grid-column]="month.column + ' / span ' + month.span">
                {{ month.name }}
              </span>
            </div>
          </div>

          <!-- Main grid -->
          <div class="habit-grid" [style.grid-template-columns]="getGridTemplateColumns()">
            <div
              *ngFor="let day of gridDays; trackBy: trackByDate"
              class="grid-day"
              [class.no-data]="day.level === 0"
              [class.missed]="day.level === 1"
              [class.completed]="day.level === 2"
              [class.streak-milestone]="day.level === 3"
              [class.is-today]="isToday(day.date)"
              [class.future-year]="isFutureYear(day.date)"
              [class.first-of-month]="isFirstOfMonth(day.date)"
              [style.background-color]="getDayColor(day)"
              [style.border-color]="getDayBorderColor(day)"
              [style.opacity]="day.level === 0 ? 0.2 : 1"
              (click)="onDayClick(day)">
            </div>
          </div>
        </div>

        <!-- Stats summary (kept outside the scroll area so it's always fully visible) -->
        <div class="grid-stats" *ngIf="showStats">
          <div class="stat">
            <span class="stat-value">{{ completedDays }}</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ (completionRate * 100).toFixed(0) }}%</span>
            <span class="stat-label">Success Rate</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ currentStreak }}</span>
            <span class="stat-label">Current Streak</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ longestStreak }}</span>
            <span class="stat-label">Longest Streak</span>
          </div>
        </div>

        <!-- Debug info (only visible in development) -->
        <div class="debug-info" *ngIf="isDebugMode">
          <p>\u{1F4CA} Debug Info:</p>
          <p>Business ID: {{ businessId }}</p>
          <p>Data Points: {{ data.length }}</p>
          <p>Grid Days: {{ gridDays.length }}</p>
          <p>Using Real Data: {{ usingRealData ? '\u2705 Yes' : '\u274C No (Mock)' }}</p>
        </div>

        <!-- Close Button at Bottom (like upgrade modal) -->
        <div class="modal-footer" *ngIf="isModal">
          <ion-button
            expand="block"
            fill="clear"
            color="medium"
            (click)="closeModal()"
            class="close-button">
            Close
          </ion-button>
        </div>
      </div>
    </div>
  `, styles: ["/* angular:styles/component:scss;b0fd3485b88c7af6b49e8c352ed1940149894b6c2b7ece9f8065fa416cc1f629;/Users/grantcross/Code/habit-tycoon/src/app/shared/components/habit-grid/habit-grid.component.ts */\n:host {\n  display: block;\n  width: 100%;\n  --grid-size: 12px;\n  --grid-gap: 2px;\n}\n@media (max-width: 768px) {\n  :host {\n    --grid-size: 8px;\n    --grid-gap: 1px;\n  }\n}\n@media (max-width: 380px) {\n  :host {\n    --grid-size: 7px;\n  }\n}\n.habit-grid-container {\n  background: rgba(0, 0, 0, 0.3);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 12px;\n  padding: 8px;\n  margin: 0;\n  width: 100%;\n  max-width: 100%;\n  box-sizing: border-box;\n  overflow: hidden;\n}\n.grid-scroll-area {\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n  width: 100%;\n  scrollbar-width: thin;\n}\n.custom-toolbar {\n  --background: rgba(0, 0, 0, 0.95);\n  --color: #fff;\n  border-bottom: 1px solid rgba(255, 215, 0, 0.3);\n}\n.grid-title {\n  font-size: 1.1rem;\n  font-weight: bold;\n  color: #fff;\n}\n.business-emoji {\n  font-size: 1.3rem;\n  margin-right: 8px;\n}\n.close-icon {\n  color: #fff !important;\n  font-size: 1.4rem;\n  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));\n}\nion-button[fill=clear] {\n  --color: #fff !important;\n  --background: rgba(255, 255, 255, 0.1);\n  --border-radius: 8px;\n}\nion-button[fill=clear]:hover {\n  --background: rgba(255, 255, 255, 0.2);\n}\n.content-wrapper {\n  padding: 8px;\n}\n.modal-content {\n  padding: 20px;\n  background: rgba(0, 0, 0, 0.95);\n  color: #fff;\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: auto;\n}\n.grid-header {\n  margin-bottom: 8px;\n}\n.month-labels {\n  display: grid;\n  gap: var(--grid-gap);\n  font-size: 10px;\n  color: rgba(255, 255, 255, 0.6);\n  margin-bottom: 8px;\n  overflow: visible;\n  width: max-content;\n  align-items: baseline;\n  height: 14px;\n}\n@media (max-width: 768px) {\n  .month-labels {\n    font-size: 8px;\n  }\n}\n.month-label {\n  text-align: center;\n  font-weight: 500;\n  line-height: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n}\n.habit-grid {\n  display: grid;\n  grid-template-rows: repeat(7, var(--grid-size));\n  grid-auto-flow: column;\n  gap: var(--grid-gap);\n  margin-bottom: 12px;\n  overflow: visible;\n  width: max-content;\n}\n.grid-day {\n  width: var(--grid-size);\n  height: var(--grid-size);\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  position: relative;\n}\n.grid-day.future-year {\n  visibility: hidden;\n}\n.grid-day:hover {\n  transform: scale(1.3);\n  z-index: 10;\n  border-width: 2px;\n}\n.grid-day.is-today {\n  border: 2px solid #FFD700;\n  box-shadow: 0 0 4px rgba(255, 215, 0, 0.6);\n}\n.grid-day.first-of-month {\n  border: 1px solid rgba(100, 149, 237, 0.5) !important;\n  box-shadow: 0 0 2px rgba(100, 149, 237, 0.3);\n}\n.day-icon {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 18px;\n  font-weight: bold;\n  z-index: 5;\n  pointer-events: none;\n  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);\n}\n.debug-info {\n  margin-top: 16px;\n  padding: 12px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 215, 0, 0.2);\n  border-radius: 8px;\n  font-size: 11px;\n  color: rgba(255, 255, 255, 0.7);\n}\n.debug-info p {\n  margin: 4px 0;\n}\n.grid-stats {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-around;\n  padding-top: 12px;\n  border-top: 1px solid rgba(255, 215, 0, 0.2);\n  background: rgba(255, 255, 255, 0.02);\n  border-radius: 8px;\n  margin-top: 8px;\n  padding: 16px;\n}\n@media (max-width: 480px) {\n  .grid-stats {\n    padding: 10px;\n    gap: 8px 4px;\n  }\n  .stat-value {\n    font-size: 14px;\n  }\n}\n.stat {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n}\n.stat-value {\n  font-size: 16px;\n  font-weight: bold;\n  color: #FFD700;\n}\n.stat-label {\n  font-size: 9px;\n  color: rgba(255, 255, 255, 0.6);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n/*# sourceMappingURL=habit-grid.component.css.map */\n"] }]
  }], null, { scrollAreaRef: [{
    type: ViewChild,
    args: ["scrollArea"]
  }], data: [{
    type: Input
  }], businessId: [{
    type: Input
  }], businessName: [{
    type: Input
  }], businessEmoji: [{
    type: Input
  }], businessType: [{
    type: Input
  }], businessCreatedAt: [{
    type: Input
  }], showStats: [{
    type: Input
  }], weeksToShow: [{
    type: Input
  }], size: [{
    type: Input
  }], isModal: [{
    type: Input
  }], modalController: [{
    type: Input
  }], isStockView: [{
    type: Input
  }], useCalendarYear: [{
    type: Input
  }], onResize: [{
    type: HostListener,
    args: ["window:resize", ["$event"]]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HabitGridComponent, { className: "HabitGridComponent", filePath: "src/app/shared/components/habit-grid/habit-grid.component.ts", lineNumber: 353 });
})();

export {
  HabitUpdateService,
  HabitGridComponent
};
//# sourceMappingURL=chunk-W6L7XY7U.js.map
