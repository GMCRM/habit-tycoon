import {
  SocialService
} from "./chunk-LXARDG3Y.js";
import {
  BottomNavComponent
} from "./chunk-R6NCSAED.js";
import {
  HabitBusinessService
} from "./chunk-GSSZ5PLU.js";
import {
  addIcons,
  arrowBack,
  business,
  checkmark,
  checkmarkCircle,
  close,
  logOut,
  medalOutline,
  notifications,
  notificationsOutline,
  people,
  personAdd,
  settings,
  star,
  trashOutline
} from "./chunk-DTAWB6F7.js";
import {
  AuthService
} from "./chunk-OQE34EZH.js";
import {
  AlertController,
  CommonModule,
  Component,
  DecimalPipe,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
  NgForOf,
  NgIf,
  Router,
  RouterLink,
  ToastController,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
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

// src/app/social/social.page.ts
function SocialPage_ion_button_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-button", 14);
    \u0275\u0275element(1, "ion-icon", 15);
    \u0275\u0275elementEnd();
  }
}
function SocialPage_ion_button_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 16);
    \u0275\u0275listener("click", function SocialPage_ion_button_5_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.logout());
    });
    \u0275\u0275element(1, "ion-icon", 17);
    \u0275\u0275text(2, " Logout ");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18);
    \u0275\u0275element(1, "ion-spinner", 19);
    \u0275\u0275elementStart(2, "p");
    \u0275\u0275text(3, "Loading social data...");
    \u0275\u0275elementEnd()();
  }
}
function SocialPage_div_10_ion_badge_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-badge", 31);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.totalNotificationsBadgeCount);
  }
}
function SocialPage_div_10_div_15_div_7_ion_card_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 39)(1, "ion-card-content")(2, "div", 40)(3, "div", 41)(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "ion-button", 42);
    \u0275\u0275listener("click", function SocialPage_div_10_div_15_div_7_ion_card_1_Template_ion_button_click_6_listener() {
      const friend_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.removeFriend(friend_r6));
    });
    \u0275\u0275element(7, "ion-icon", 43);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const friend_r6 = ctx.$implicit;
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(friend_r6.friend_profile == null ? null : friend_r6.friend_profile.name);
  }
}
function SocialPage_div_10_div_15_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37);
    \u0275\u0275template(1, SocialPage_div_10_div_15_div_7_ion_card_1_Template, 8, 1, "ion-card", 38);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.friends);
  }
}
function SocialPage_div_10_div_15_ng_template_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 44);
    \u0275\u0275element(1, "ion-icon", 27);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "No friends yet");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, " Add friends to see their habit progress and compete together! ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 34);
    \u0275\u0275listener("click", function SocialPage_div_10_div_15_ng_template_8_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.addFriend());
    });
    \u0275\u0275element(7, "ion-icon", 35);
    \u0275\u0275text(8, " Add Your First Friend ");
    \u0275\u0275elementEnd()();
  }
}
function SocialPage_div_10_div_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 32)(1, "div", 33)(2, "h2");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "ion-button", 34);
    \u0275\u0275listener("click", function SocialPage_div_10_div_15_Template_ion_button_click_4_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addFriend());
    });
    \u0275\u0275element(5, "ion-icon", 35);
    \u0275\u0275text(6, " Add Friend ");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(7, SocialPage_div_10_div_15_div_7_Template, 2, 1, "div", 36)(8, SocialPage_div_10_div_15_ng_template_8_Template, 9, 0, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const noFriends_r8 = \u0275\u0275reference(9);
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.friends.length, " Friends");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx_r1.friends.length > 0)("ngIfElse", noFriends_r8);
  }
}
function SocialPage_div_10_div_16_ion_button_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-button", 50);
    \u0275\u0275listener("click", function SocialPage_div_10_div_16_ion_button_4_Template_ion_button_click_0_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.markAllNotificationsAsRead());
    });
    \u0275\u0275text(1, " Mark All Read ");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_5_ion_card_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 55)(1, "ion-card-content")(2, "div", 56)(3, "div", 57)(4, "h4");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 58);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 59);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 60)(11, "ion-button", 61);
    \u0275\u0275listener("click", function SocialPage_div_10_div_16_div_5_ion_card_4_Template_ion_button_click_11_listener() {
      const request_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.acceptRequest(request_r11.id));
    });
    \u0275\u0275element(12, "ion-icon", 62);
    \u0275\u0275text(13, " Accept ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "ion-button", 63);
    \u0275\u0275listener("click", function SocialPage_div_10_div_16_div_5_ion_card_4_Template_ion_button_click_14_listener() {
      const request_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.declineRequest(request_r11.id));
    });
    \u0275\u0275element(15, "ion-icon", 64);
    \u0275\u0275text(16, " Decline ");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const request_r11 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", (request_r11.sender_profile == null ? null : request_r11.sender_profile.name) || "Unknown User", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", request_r11.sender_profile == null ? null : request_r11.sender_profile.email, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.formatTimeAgo(request_r11.created_at), " ");
  }
}
function SocialPage_div_10_div_16_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 51)(1, "h3", 52);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 53);
    \u0275\u0275template(4, SocialPage_div_10_div_16_div_5_ion_card_4_Template, 17, 3, "ion-card", 54);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" \u{1F4EC} Friend Requests (", ctx_r1.pendingRequests.length, ") ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.pendingRequests);
  }
}
function SocialPage_div_10_div_16_div_6_ion_card_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-card", 55)(1, "ion-card-content")(2, "div", 56)(3, "div", 57)(4, "h4");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 58);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 65);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const request_r12 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", (request_r12.recipient_profile == null ? null : request_r12.recipient_profile.name) || "Unknown User", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", request_r12.recipient_profile == null ? null : request_r12.recipient_profile.email, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Pending since ", ctx_r1.formatTimeAgo(request_r12.created_at), " ");
  }
}
function SocialPage_div_10_div_16_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 51)(1, "h3", 52);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 53);
    \u0275\u0275template(4, SocialPage_div_10_div_16_div_6_ion_card_4_Template, 10, 3, "ion-card", 54);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" \u{1F4E4} Sent Requests (", ctx_r1.sentRequests.length, ") ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.sentRequests);
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F44B}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F4C8}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F525}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F3C6}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F48E}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u2B50");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F31F}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F3AF}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_1_Template, 2, 0, "span", 12)(2, SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_2_Template, 2, 0, "span", 12)(3, SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_3_Template, 2, 0, "span", 12)(4, SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_4_Template, 2, 0, "span", 12)(5, SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_5_Template, 2, 0, "span", 12)(6, SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_span_6_Template, 2, 0, "span", 12);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const notification_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (notification_r14.metadata == null ? null : notification_r14.metadata.milestone_key) === "streak_7");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (notification_r14.metadata == null ? null : notification_r14.metadata.milestone_key) === "streak_30");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (notification_r14.metadata == null ? null : notification_r14.metadata.milestone_key) === "streak_100");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (notification_r14.metadata == null ? null : notification_r14.metadata.milestone_key) === "completions_10");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (notification_r14.metadata == null ? null : notification_r14.metadata.milestone_key) === "completions_50");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (notification_r14.metadata == null ? null : notification_r14.metadata.milestone_key) === "completions_100");
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_span_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F514}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_ion_badge_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-badge", 77);
    \u0275\u0275text(1, " New ");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_16_div_7_ion_card_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "ion-card", 68)(1, "ion-card-content")(2, "div", 69)(3, "div", 70);
    \u0275\u0275template(4, SocialPage_div_10_div_16_div_7_ion_card_1_span_4_Template, 2, 0, "span", 12)(5, SocialPage_div_10_div_16_div_7_ion_card_1_span_5_Template, 2, 0, "span", 12)(6, SocialPage_div_10_div_16_div_7_ion_card_1_ng_container_6_Template, 7, 6, "ng-container", 12)(7, SocialPage_div_10_div_16_div_7_ion_card_1_span_7_Template, 2, 0, "span", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 71);
    \u0275\u0275listener("click", function SocialPage_div_10_div_16_div_7_ion_card_1_Template_div_click_8_listener() {
      const notification_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.markNotificationAsRead(notification_r14.id));
    });
    \u0275\u0275elementStart(9, "div", 72)(10, "p", 73);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275template(12, SocialPage_div_10_div_16_div_7_ion_card_1_ion_badge_12_Template, 2, 0, "ion-badge", 74);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "p", 75);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 76)(16, "ion-button", 42);
    \u0275\u0275listener("click", function SocialPage_div_10_div_16_div_7_ion_card_1_Template_ion_button_click_16_listener() {
      const notification_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.deleteNotification(notification_r14.id));
    });
    \u0275\u0275element(17, "ion-icon", 43);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const notification_r14 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275classProp("unread", !notification_r14.is_read);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", notification_r14.type === "habit_reminder");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", notification_r14.type === "stockholder_reminder");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", notification_r14.type === "friend_milestone");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !notification_r14.type || notification_r14.type !== "habit_reminder" && notification_r14.type !== "stockholder_reminder" && notification_r14.type !== "friend_milestone");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", notification_r14.message, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !notification_r14.is_read);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.formatTimeAgo(notification_r14.created_at), " ");
  }
}
function SocialPage_div_10_div_16_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 66);
    \u0275\u0275template(1, SocialPage_div_10_div_16_div_7_ion_card_1_Template, 18, 9, "ion-card", 67);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.notifications);
  }
}
function SocialPage_div_10_div_16_ng_template_8_div_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 44);
    \u0275\u0275element(1, "ion-icon", 24);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "No notifications");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, " You'll see notifications here when friends send reminders, hit habit milestones, or send you friend requests! ");
    \u0275\u0275elementEnd()();
  }
}
function SocialPage_div_10_div_16_ng_template_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, SocialPage_div_10_div_16_ng_template_8_div_0_Template, 6, 0, "div", 78);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("ngIf", ctx_r1.pendingRequests.length === 0 && ctx_r1.sentRequests.length === 0);
  }
}
function SocialPage_div_10_div_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 45)(1, "div", 46)(2, "h2");
    \u0275\u0275text(3, "\u{1F514} Notifications");
    \u0275\u0275elementEnd();
    \u0275\u0275template(4, SocialPage_div_10_div_16_ion_button_4_Template, 2, 0, "ion-button", 47);
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, SocialPage_div_10_div_16_div_5_Template, 5, 2, "div", 48)(6, SocialPage_div_10_div_16_div_6_Template, 5, 2, "div", 48)(7, SocialPage_div_10_div_16_div_7_Template, 2, 1, "div", 49)(8, SocialPage_div_10_div_16_ng_template_8_Template, 1, 1, "ng-template", null, 1, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const noNotifications_r15 = \u0275\u0275reference(9);
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx_r1.hasUnreadNotifications);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.pendingRequests.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.sentRequests.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.notifications.length > 0)("ngIfElse", noNotifications_r15);
  }
}
function SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F947}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F948}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F949}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const user_r17 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("#", user_r17.rank);
  }
}
function SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_div_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 91);
  }
}
function SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 86)(1, "div", 87);
    \u0275\u0275template(2, SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_2_Template, 2, 0, "span", 12)(3, SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_3_Template, 2, 0, "span", 12)(4, SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_4_Template, 2, 0, "span", 12)(5, SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_span_5_Template, 2, 1, "span", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 88)(7, "h3");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 89);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "number");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(12, SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_div_12_Template, 1, 0, "div", 90);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const user_r17 = ctx.$implicit;
    const last_r18 = ctx.last;
    \u0275\u0275classProp("current-user", user_r17.name === "You");
    \u0275\u0275advance();
    \u0275\u0275classProp("top-three", user_r17.rank <= 3);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r17.rank === 1);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r17.rank === 2);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r17.rank === 3);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r17.rank > 3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(user_r17.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Net Worth: $", \u0275\u0275pipeBind2(11, 11, user_r17.net_worth || 0, "1.2-2"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !last_r18);
  }
}
function SocialPage_div_10_div_17_ng_container_9_ion_card_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-card", 84)(1, "ion-card-content");
    \u0275\u0275template(2, SocialPage_div_10_div_17_ng_container_9_ion_card_1_div_2_Template, 13, 14, "div", 85);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.friendsLeaderboard);
  }
}
function SocialPage_div_10_div_17_ng_container_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SocialPage_div_10_div_17_ng_container_9_ion_card_1_Template, 3, 1, "ion-card", 83);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext();
    const noLeaderboard_r19 = \u0275\u0275reference(12);
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.friendsLeaderboard.length > 0)("ngIfElse", noLeaderboard_r19);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 97);
    \u0275\u0275element(1, "ion-spinner", 19);
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F947}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F948}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F949}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const user_r21 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("#", user_r21.rank);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_div_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 91);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 86)(1, "div", 87);
    \u0275\u0275template(2, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_2_Template, 2, 0, "span", 12)(3, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_3_Template, 2, 0, "span", 12)(4, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_4_Template, 2, 0, "span", 12)(5, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_span_5_Template, 2, 1, "span", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 88)(7, "h3");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 89);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "number");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(12, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_div_12_Template, 1, 0, "div", 90);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const user_r21 = ctx.$implicit;
    const last_r22 = ctx.last;
    \u0275\u0275classProp("current-user", user_r21.name === "You");
    \u0275\u0275advance();
    \u0275\u0275classProp("top-three", user_r21.rank <= 3);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r21.rank === 1);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r21.rank === 2);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r21.rank === 3);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r21.rank > 3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(user_r21.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Earned: $", \u0275\u0275pipeBind2(11, 11, user_r21.cash_earned, "1.2-2"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !last_r22);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-card", 84)(1, "ion-card-content");
    \u0275\u0275template(2, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_div_2_Template, 13, 14, "div", 85);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.cashLeaderboard);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ng_template_3_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 44);
    \u0275\u0275element(1, "ion-icon", 22);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "Add friends to see leaderboard");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, "Connect with friends to compare habit cash earned!");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 34);
    \u0275\u0275listener("click", function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ng_template_3_div_0_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r1 = \u0275\u0275nextContext(6);
      return \u0275\u0275resetView(ctx_r1.selectedSegment = "friends");
    });
    \u0275\u0275element(7, "ion-icon", 35);
    \u0275\u0275text(8, " Add Friends ");
    \u0275\u0275elementEnd()();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ng_template_3_div_0_Template, 9, 0, "div", 78);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275property("ngIf", !ctx_r1.isLoadingCash);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SocialPage_div_10_div_17_ng_container_10_ng_container_10_div_1_Template, 2, 0, "div", 96)(2, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ion_card_2_Template, 3, 1, "ion-card", 83)(3, SocialPage_div_10_div_17_ng_container_10_ng_container_10_ng_template_3_Template, 1, 1, "ng-template", null, 3, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const noCashLeaderboard_r24 = \u0275\u0275reference(4);
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.isLoadingCash);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.isLoadingCash && ctx_r1.cashLeaderboard.length > 0)("ngIfElse", noCashLeaderboard_r24);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 97);
    \u0275\u0275element(1, "ion-spinner", 19);
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F947}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F948}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u{1F949}");
    \u0275\u0275elementEnd();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const user_r25 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("#", user_r25.rank);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_div_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 91);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 86)(1, "div", 87);
    \u0275\u0275template(2, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_2_Template, 2, 0, "span", 12)(3, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_3_Template, 2, 0, "span", 12)(4, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_4_Template, 2, 0, "span", 12)(5, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_span_5_Template, 2, 1, "span", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 88)(7, "h3");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 89);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(11, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_div_11_Template, 1, 0, "div", 90);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const user_r25 = ctx.$implicit;
    const last_r26 = ctx.last;
    \u0275\u0275classProp("current-user", user_r25.name === "You");
    \u0275\u0275advance();
    \u0275\u0275classProp("top-three", user_r25.rank <= 3);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r25.rank === 1);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r25.rank === 2);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r25.rank === 3);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", user_r25.rank > 3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(user_r25.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Completed: ", user_r25.habits_completed, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !last_r26);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-card", 84)(1, "ion-card-content");
    \u0275\u0275template(2, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_div_2_Template, 12, 11, "div", 85);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.completedLeaderboard);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ng_template_3_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 44);
    \u0275\u0275element(1, "ion-icon", 22);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "Add friends to see leaderboard");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, "Connect with friends to compare habits completed!");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 34);
    \u0275\u0275listener("click", function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ng_template_3_div_0_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r1 = \u0275\u0275nextContext(6);
      return \u0275\u0275resetView(ctx_r1.selectedSegment = "friends");
    });
    \u0275\u0275element(7, "ion-icon", 35);
    \u0275\u0275text(8, " Add Friends ");
    \u0275\u0275elementEnd()();
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ng_template_3_div_0_Template, 9, 0, "div", 78);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275property("ngIf", !ctx_r1.isLoadingCompleted);
  }
}
function SocialPage_div_10_div_17_ng_container_10_ng_container_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, SocialPage_div_10_div_17_ng_container_10_ng_container_11_div_1_Template, 2, 0, "div", 96)(2, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ion_card_2_Template, 3, 1, "ion-card", 83)(3, SocialPage_div_10_div_17_ng_container_10_ng_container_11_ng_template_3_Template, 1, 1, "ng-template", null, 4, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const noCompletedLeaderboard_r28 = \u0275\u0275reference(4);
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.isLoadingCompleted);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.isLoadingCompleted && ctx_r1.completedLeaderboard.length > 0)("ngIfElse", noCompletedLeaderboard_r28);
  }
}
function SocialPage_div_10_div_17_ng_container_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275elementStart(1, "p", 92);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "ion-segment", 93);
    \u0275\u0275listener("ionChange", function SocialPage_div_10_div_17_ng_container_10_Template_ion_segment_ionChange_3_listener($event) {
      \u0275\u0275restoreView(_r20);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onCashMetricChange($event));
    });
    \u0275\u0275elementStart(4, "ion-segment-button", 94)(5, "ion-label");
    \u0275\u0275text(6, "Weekly Cash");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "ion-segment-button", 95)(8, "ion-label");
    \u0275\u0275text(9, "Weekly Habits");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(10, SocialPage_div_10_div_17_ng_container_10_ng_container_10_Template, 5, 3, "ng-container", 12)(11, SocialPage_div_10_div_17_ng_container_10_ng_container_11_Template, 5, 3, "ng-container", 12);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" \u23F1\uFE0F Resets in ", ctx_r1.getWeeklyResetCountdown(), " ");
    \u0275\u0275advance();
    \u0275\u0275property("value", ctx_r1.cashMetricFilter);
    \u0275\u0275advance(7);
    \u0275\u0275property("ngIf", ctx_r1.cashMetricFilter === "cash");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.cashMetricFilter === "completed");
  }
}
function SocialPage_div_10_div_17_ng_template_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r29 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 44);
    \u0275\u0275element(1, "ion-icon", 22);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3, "Add friends to see leaderboard");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, "Connect with friends to compare your net worth and compete!");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "ion-button", 34);
    \u0275\u0275listener("click", function SocialPage_div_10_div_17_ng_template_11_Template_ion_button_click_6_listener() {
      \u0275\u0275restoreView(_r29);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.selectedSegment = "friends");
    });
    \u0275\u0275element(7, "ion-icon", 35);
    \u0275\u0275text(8, " Add Friends ");
    \u0275\u0275elementEnd()();
  }
}
function SocialPage_div_10_div_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 79)(1, "div", 80)(2, "h2");
    \u0275\u0275text(3, "\u{1F3C6} Friends Leaderboard");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 81)(5, "button", 82);
    \u0275\u0275listener("click", function SocialPage_div_10_div_17_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r16);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onLeaderboardViewChange("networth"));
    });
    \u0275\u0275text(6, " \u{1F3C6} Networth Leaderboard ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 82);
    \u0275\u0275listener("click", function SocialPage_div_10_div_17_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r16);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onLeaderboardViewChange("cashearned"));
    });
    \u0275\u0275text(8, " \u{1F4B5} Weekly Leaderboard ");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(9, SocialPage_div_10_div_17_ng_container_9_Template, 2, 2, "ng-container", 12)(10, SocialPage_div_10_div_17_ng_container_10_Template, 12, 4, "ng-container", 12)(11, SocialPage_div_10_div_17_ng_template_11_Template, 9, 0, "ng-template", null, 2, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275classProp("active", ctx_r1.leaderboardView === "networth");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r1.leaderboardView === "cashearned");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r1.leaderboardView === "networth");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.leaderboardView === "cashearned");
  }
}
function SocialPage_div_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div")(1, "ion-segment", 20);
    \u0275\u0275listener("ionChange", function SocialPage_div_10_Template_ion_segment_ionChange_1_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSegmentChange($event));
    });
    \u0275\u0275elementStart(2, "ion-segment-button", 21);
    \u0275\u0275element(3, "ion-icon", 22);
    \u0275\u0275elementStart(4, "ion-label");
    \u0275\u0275text(5, "Leaderboard");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "ion-segment-button", 23);
    \u0275\u0275element(7, "ion-icon", 24);
    \u0275\u0275elementStart(8, "ion-label");
    \u0275\u0275text(9, "Notifications");
    \u0275\u0275elementEnd();
    \u0275\u0275template(10, SocialPage_div_10_ion_badge_10_Template, 2, 1, "ion-badge", 25);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "ion-segment-button", 26);
    \u0275\u0275element(12, "ion-icon", 27);
    \u0275\u0275elementStart(13, "ion-label");
    \u0275\u0275text(14, "Friends");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(15, SocialPage_div_10_div_15_Template, 10, 3, "div", 28)(16, SocialPage_div_10_div_16_Template, 10, 5, "div", 29)(17, SocialPage_div_10_div_17_Template, 13, 6, "div", 30);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("value", ctx_r1.selectedSegment);
    \u0275\u0275advance(9);
    \u0275\u0275property("ngIf", ctx_r1.totalNotificationsBadgeCount > 0);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", ctx_r1.selectedSegment === "friends");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.selectedSegment === "notifications");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.selectedSegment === "leaderboard");
  }
}
var _SocialPage = class _SocialPage {
  constructor(router, authService, socialService, habitBusinessService, toastController, alertController) {
    this.router = router;
    this.authService = authService;
    this.socialService = socialService;
    this.habitBusinessService = habitBusinessService;
    this.toastController = toastController;
    this.alertController = alertController;
    this.isInitialized = false;
    this.timeRefreshInterval = null;
    this.timeRefreshTick = 0;
    this.currentUser = null;
    this.userProfile = null;
    this.selectedSegment = "leaderboard";
    this.friends = [];
    this.notifications = [];
    this.pendingRequests = [];
    this.sentRequests = [];
    this.friendsLeaderboard = [];
    this.leaderboardView = "networth";
    this.cashMetricFilter = "cash";
    this.cashLeaderboard = [];
    this.completedLeaderboard = [];
    this.isLoadingCash = false;
    this.isLoadingCompleted = false;
    this.isLoading = false;
    addIcons({ settings, logOut, people, notificationsOutline, notifications, medalOutline, personAdd, trashOutline, checkmark, close, arrowBack, star, checkmarkCircle, business });
    const savedTab = localStorage.getItem("social-selected-tab");
    if (savedTab && ["friends", "notifications", "leaderboard"].includes(savedTab)) {
      this.selectedSegment = savedTab;
    } else {
      this.selectedSegment = "leaderboard";
    }
  }
  ionViewWillEnter() {
    return __async(this, null, function* () {
      console.log("\u{1F50D} SocialPage: ionViewWillEnter");
      if (!this.timeRefreshInterval) {
        this.timeRefreshInterval = setInterval(() => {
          this.timeRefreshTick++;
        }, 6e4);
      }
      if (!this.isInitialized) {
        yield this.initializePage();
      } else {
        yield this.loadSocialData();
      }
    });
  }
  initializePage() {
    return __async(this, null, function* () {
      console.log("\u{1F50D} SocialPage: initializePage started");
      if (this.isInitialized) {
        console.log("\u{1F50D} SocialPage: Already initialized in initializePage, skipping");
        return;
      }
      this.isLoading = true;
      try {
        console.log("\u{1F50D} SocialPage: Loading current user...");
        yield this.loadCurrentUser();
        if (this.currentUser) {
          console.log("\u2705 SocialPage: User found, loading social data...");
          yield this.loadSocialData();
          console.log("\u2705 SocialPage: Social data loaded successfully");
          this.isInitialized = true;
        } else {
          console.log("\u274C SocialPage: No user found, redirecting to login");
          this.router.navigate(["/login"]);
          return;
        }
      } catch (error) {
        console.error("\u274C SocialPage: Error initializing social page:", error);
      } finally {
        this.isLoading = false;
        console.log("\u2705 SocialPage: Initialization complete");
      }
    });
  }
  ngOnInit() {
    return __async(this, null, function* () {
      console.log("\u{1F50D} SocialPage: ngOnInit started");
      if (this.isInitialized) {
        console.log("\u{1F50D} SocialPage: Already initialized, skipping");
        return;
      }
      yield this.initializePage();
    });
  }
  loadCurrentUser() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} SocialPage: Loading current user...");
        const { data: { user }, error: userError } = yield this.authService.getUser();
        if (userError) {
          console.error("\u274C SocialPage: Error getting user from auth:", userError);
          this.currentUser = null;
          return;
        }
        this.currentUser = user;
        console.log("\u2705 SocialPage: User loaded successfully:", user?.id);
        if (user) {
          try {
            const { data: profile, error } = yield this.authService.supabase.from("user_profiles").select("*").eq("id", user.id).single();
            if (error) {
              console.log("\u26A0\uFE0F SocialPage: User profile not found, will use defaults:", error.message);
              this.userProfile = null;
            } else {
              this.userProfile = profile;
              console.log("User profile loaded:", profile.name);
            }
          } catch (profileError) {
            console.log("Error loading user profile, continuing without it:", profileError);
            this.userProfile = null;
          }
        }
      } catch (error) {
        console.error("Error in loadCurrentUser:", error);
        this.currentUser = null;
      }
    });
  }
  loadSocialData() {
    return __async(this, null, function* () {
      if (!this.currentUser) {
        console.log("No current user, skipping social data load");
        return;
      }
      console.log("Loading social data for user:", this.currentUser.id);
      try {
        const [friends, notifications2, pendingRequests, sentRequests, leaderboard] = yield Promise.allSettled([
          this.socialService.getFriends(this.currentUser.id),
          this.socialService.getUserPokes(this.currentUser.id),
          this.socialService.getPendingRequests(this.currentUser.id),
          this.socialService.getSentRequests(this.currentUser.id),
          this.socialService.getFriendsLeaderboard(this.currentUser.id)
        ]);
        this.friends = friends.status === "fulfilled" ? friends.value : [];
        this.notifications = notifications2.status === "fulfilled" ? notifications2.value : [];
        this.pendingRequests = pendingRequests.status === "fulfilled" ? pendingRequests.value : [];
        this.sentRequests = sentRequests.status === "fulfilled" ? sentRequests.value : [];
        this.friendsLeaderboard = leaderboard.status === "fulfilled" ? leaderboard.value : [];
        console.log("Social data loaded:", {
          friends: this.friends.length,
          notifications: this.notifications.length,
          pendingRequests: this.pendingRequests.length,
          sentRequests: this.sentRequests.length,
          leaderboard: this.friendsLeaderboard.length
        });
        if (this.notifications.length > 0) {
          console.log("\u{1F50D} First notification structure:", this.notifications[0]);
          console.log("\u{1F50D} All notification IDs:", this.notifications.map((n) => ({ id: n.id, hasId: !!n.id })));
        }
        try {
          const { data: allProfiles, error: profilesError } = yield this.authService.supabase.rpc("debug_user_profiles");
          console.log("\u{1F50D} All user profiles in database:", allProfiles);
          if (profilesError) {
            console.error("\u274C Error fetching all profiles:", profilesError);
          }
        } catch (debugError) {
          console.log("Debug function not available yet:", debugError);
        }
        if (leaderboard.status === "rejected" || this.friendsLeaderboard.length === 0) {
          console.log("Creating fallback leaderboard with current user");
          this.friendsLeaderboard = [{
            id: this.currentUser.id,
            name: "You",
            net_worth: this.userProfile?.net_worth || 0,
            rank: 1
          }];
        }
      } catch (error) {
        console.error("Error loading social data:", error);
        this.friends = [];
        this.notifications = [];
        this.pendingRequests = [];
        this.sentRequests = [];
        this.friendsLeaderboard = [{
          id: this.currentUser.id,
          name: "You",
          net_worth: this.userProfile?.net_worth || 0,
          rank: 1
        }];
      }
    });
  }
  onSegmentChange(event) {
    this.selectedSegment = event.detail.value;
    localStorage.setItem("social-selected-tab", this.selectedSegment);
  }
  onLeaderboardViewChange(view) {
    return __async(this, null, function* () {
      this.leaderboardView = view;
      if (view === "cashearned" && this.cashLeaderboard.length === 0) {
        yield this.loadCashLeaderboard();
      }
    });
  }
  onCashMetricChange(event) {
    return __async(this, null, function* () {
      this.cashMetricFilter = event.detail.value;
      if (this.cashMetricFilter === "completed") {
        yield this.loadCompletedLeaderboard();
      } else {
        yield this.loadCashLeaderboard();
      }
    });
  }
  loadCashLeaderboard() {
    return __async(this, null, function* () {
      if (!this.currentUser)
        return;
      this.isLoadingCash = true;
      try {
        this.cashLeaderboard = yield this.socialService.getFriendsCashLeaderboard(this.currentUser.id, this.getCurrentWeekStart());
      } catch (error) {
        console.error("Error loading cash leaderboard:", error);
        this.cashLeaderboard = [{ id: this.currentUser.id, name: "You", cash_earned: 0, rank: 1 }];
      } finally {
        this.isLoadingCash = false;
      }
    });
  }
  loadCompletedLeaderboard() {
    return __async(this, null, function* () {
      if (!this.currentUser)
        return;
      this.isLoadingCompleted = true;
      try {
        this.completedLeaderboard = yield this.socialService.getFriendsHabitsCompletedLeaderboard(this.currentUser.id, this.getCurrentWeekStart());
      } catch (error) {
        console.error("Error loading habits completed leaderboard:", error);
        this.completedLeaderboard = [{ id: this.currentUser.id, name: "You", habits_completed: 0, rank: 1 }];
      } finally {
        this.isLoadingCompleted = false;
      }
    });
  }
  // Start of the current local week (Monday 00:00) — the weekly leaderboards' reset point
  getCurrentWeekStart() {
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    return start;
  }
  // Formats the time remaining until the weekly leaderboards reset, e.g. "2d 5h 12m"
  // `_tick` is unused but forces Angular to re-evaluate this binding on each timeRefreshInterval tick
  getWeeklyResetCountdown(_tick = this.timeRefreshTick) {
    const nextReset = new Date(this.getCurrentWeekStart());
    nextReset.setDate(nextReset.getDate() + 7);
    const msRemaining = nextReset.getTime() - Date.now();
    const totalMinutes = Math.max(0, Math.ceil(msRemaining / 6e4));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor(totalMinutes % (24 * 60) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0)
      return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0)
      return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
  goBack() {
    this.router.navigate(["/home"]);
  }
  addFriend() {
    return __async(this, null, function* () {
      const alert = yield this.alertController.create({
        header: "Add Friend",
        message: "Enter your friend's username or email:",
        inputs: [
          {
            name: "identifier",
            type: "text",
            placeholder: "Username or email",
            attributes: {
              enterkeyhint: "send"
            }
          }
        ],
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Send Request",
            handler: (data) => __async(this, null, function* () {
              if (!data.identifier.trim())
                return;
              try {
                yield this.socialService.sendFriendRequest(this.currentUser.id, data.identifier.trim());
                const toast = yield this.toastController.create({
                  message: "\u{1F465} Friend request sent!",
                  duration: 2e3,
                  color: "success"
                });
                yield toast.present();
                yield this.loadSocialData();
              } catch (error) {
                console.error("Error sending friend request:", error);
                const toast = yield this.toastController.create({
                  message: error instanceof Error ? error.message : "Failed to send friend request",
                  duration: 3e3,
                  color: "danger"
                });
                yield toast.present();
              }
            })
          }
        ]
      });
      yield alert.present();
      setTimeout(() => {
        const input = document.querySelector('ion-alert input[name="identifier"]');
        if (input) {
          input.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
              const sendButton = document.querySelector("ion-alert .alert-button:not(.alert-button-role-cancel)");
              if (sendButton) {
                sendButton.click();
              }
            }
          });
        }
      }, 100);
    });
  }
  acceptRequest(requestId) {
    return __async(this, null, function* () {
      try {
        yield this.socialService.acceptFriendRequest(requestId);
        const toast = yield this.toastController.create({
          message: "\u2705 Friend request accepted!",
          duration: 2e3,
          color: "success"
        });
        yield toast.present();
        yield this.loadSocialData();
      } catch (error) {
        console.error("Error accepting friend request:", error);
        const toast = yield this.toastController.create({
          message: "Failed to accept friend request",
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  declineRequest(requestId) {
    return __async(this, null, function* () {
      try {
        yield this.socialService.declineFriendRequest(requestId);
        const toast = yield this.toastController.create({
          message: "\u274C Friend request declined",
          duration: 2e3,
          color: "medium"
        });
        yield toast.present();
        yield this.loadSocialData();
      } catch (error) {
        console.error("Error declining friend request:", error);
        const toast = yield this.toastController.create({
          message: "Failed to decline friend request",
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  removeFriend(friend) {
    return __async(this, null, function* () {
      const alert = yield this.alertController.create({
        header: "Remove Friend",
        message: `Remove ${friend.friend_profile?.name || "this friend"} from your friends list?`,
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Remove",
            role: "destructive",
            handler: () => __async(this, null, function* () {
              try {
                yield this.socialService.removeFriend(this.currentUser.id, friend.friend_profile.id);
                this.friends = this.friends.filter((f) => f.id !== friend.id);
                const toast = yield this.toastController.create({
                  message: "\u{1F44B} Friend removed",
                  duration: 2e3,
                  color: "medium"
                });
                yield toast.present();
              } catch (error) {
                console.error("Error removing friend:", error);
                const toast = yield this.toastController.create({
                  message: "Failed to remove friend",
                  duration: 3e3,
                  color: "danger"
                });
                yield toast.present();
              }
            })
          }
        ]
      });
      yield alert.present();
    });
  }
  formatTimeAgo(date, _tick = this.timeRefreshTick) {
    const now = /* @__PURE__ */ new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1e3 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1e3 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  }
  markNotificationAsRead(notificationId) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} Marking notification as read:", notificationId);
        yield this.socialService.markPokeAsRead(notificationId);
        console.log("\u2705 Database update completed");
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification) {
          console.log("\u{1F50D} Before update - is_read:", notification.is_read);
          notification.is_read = true;
          console.log("\u2705 After update - is_read:", notification.is_read);
          const toast = yield this.toastController.create({
            message: "\u2705 Notification marked as read",
            duration: 1500,
            color: "success"
          });
          yield toast.present();
        } else {
          console.log("\u274C Notification not found in local array");
        }
        console.log(`\u2705 Marked notification ${notificationId} as read`);
      } catch (error) {
        console.error("\u274C Error marking notification as read:", error);
        const toast = yield this.toastController.create({
          message: `Failed to mark notification as read: ${error?.message || "Unknown error"}`,
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  markAllNotificationsAsRead() {
    return __async(this, null, function* () {
      try {
        const unreadNotifications = this.notifications.filter((n) => !n.is_read);
        if (unreadNotifications.length === 0) {
          const toast = yield this.toastController.create({
            message: "\u2705 All notifications are already read",
            duration: 2e3,
            color: "medium"
          });
          yield toast.present();
          return;
        }
        console.log(`\u{1F50D} Marking ${unreadNotifications.length} notifications as read...`);
        console.log("\u{1F50D} Unread notifications structure:", unreadNotifications.map((n) => ({
          id: n.id,
          message: n.message?.substring(0, 50) + "...",
          is_read: n.is_read,
          hasId: !!n.id,
          idType: typeof n.id
        })));
        const results = yield Promise.allSettled(unreadNotifications.map((notification) => {
          console.log(`\u{1F50D} Marking notification ${notification.id} as read`);
          return this.socialService.markPokeAsRead(notification.id);
        }));
        let successCount = 0;
        let failureCount = 0;
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            successCount++;
            const notification = unreadNotifications[index];
            const localNotification = this.notifications.find((n) => n.id === notification.id);
            if (localNotification) {
              localNotification.is_read = true;
            }
          } else {
            failureCount++;
            console.error(`\u274C Failed to mark notification ${unreadNotifications[index].id} as read:`, result.reason);
          }
        });
        if (failureCount === 0) {
          const toast = yield this.toastController.create({
            message: `\u2705 Marked ${successCount} notifications as read`,
            duration: 2e3,
            color: "success"
          });
          yield toast.present();
        } else if (successCount > 0) {
          const toast = yield this.toastController.create({
            message: `\u26A0\uFE0F Marked ${successCount} as read, ${failureCount} failed`,
            duration: 3e3,
            color: "warning"
          });
          yield toast.present();
        } else {
          throw new Error(`All ${failureCount} notifications failed to update`);
        }
        console.log(`\u2705 Mark all complete: ${successCount} success, ${failureCount} failures`);
      } catch (error) {
        console.error("\u274C Error marking all notifications as read:", error);
        const toast = yield this.toastController.create({
          message: `Failed to mark notifications as read: ${error?.message || "Unknown error"}`,
          duration: 4e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  deleteNotification(notificationId) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F5D1}\uFE0F SocialPage: Deleting notification:", notificationId);
        console.log("\u{1F50D} Notification ID type:", typeof notificationId);
        console.log("\u{1F50D} Current notifications array:", this.notifications.map((n) => ({ id: n.id, message: n.message?.substring(0, 30) + "..." })));
        const notificationToDelete = this.notifications.find((n) => n.id === notificationId);
        if (!notificationToDelete) {
          console.error("\u274C Notification not found in local array");
          throw new Error("Notification not found in local array");
        }
        console.log("\u{1F50D} Found notification to delete:", {
          id: notificationToDelete.id,
          message: notificationToDelete.message?.substring(0, 50) + "...",
          created_at: notificationToDelete.created_at
        });
        yield this.socialService.deleteNotification(notificationId);
        const originalLength = this.notifications.length;
        this.notifications = this.notifications.filter((n) => n.id !== notificationId);
        const newLength = this.notifications.length;
        console.log(`\u{1F50D} Local array update: ${originalLength} \u2192 ${newLength} notifications`);
        const toast = yield this.toastController.create({
          message: "\u2705 Notification deleted",
          duration: 2e3,
          color: "success"
        });
        yield toast.present();
        console.log("\u2705 SocialPage: Notification deleted successfully");
      } catch (error) {
        console.error("\u274C SocialPage: Error deleting notification:", error);
        const toast = yield this.toastController.create({
          message: `Failed to delete notification: ${error?.message || "Unknown error"}`,
          duration: 3e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  createCurrentUserProfile() {
    return __async(this, null, function* () {
      try {
        if (!this.currentUser) {
          throw new Error("No current user found");
        }
        console.log("Creating profile for current user...");
        const { data: existingProfile } = yield this.authService.supabase.from("user_profiles").select("id").eq("id", this.currentUser.id).single();
        if (existingProfile) {
          const toast2 = yield this.toastController.create({
            message: "\u2705 Profile already exists!",
            duration: 2e3,
            color: "success"
          });
          yield toast2.present();
          return;
        }
        const { error } = yield this.authService.supabase.from("user_profiles").insert({
          id: this.currentUser.id,
          email: this.currentUser.email,
          name: this.currentUser.user_metadata?.["name"] || this.currentUser.email?.split("@")[0] || "User",
          cash: 100,
          // Starting cash
          net_worth: 100
        });
        if (error) {
          throw error;
        }
        console.log(`\u2705 Created profile for ${this.currentUser.email}`);
        const toast = yield this.toastController.create({
          message: "\u2705 Profile created successfully!",
          duration: 3e3,
          color: "success"
        });
        yield toast.present();
        yield this.loadCurrentUser();
      } catch (error) {
        console.error("Error creating current user profile:", error);
        const toast = yield this.toastController.create({
          message: "Failed to create profile: " + error?.message,
          duration: 4e3,
          color: "danger"
        });
        yield toast.present();
      }
    });
  }
  debugFriendRequests() {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} Debug: Checking friend requests...");
        const { data: allFriendships, error } = yield this.authService.supabase.from("friendships").select(`
          *,
          sender_profile:user_profiles!friendships_user_id_fkey(id, name, email),
          recipient_profile:user_profiles!friendships_friend_id_fkey(id, name, email)
        `).or(`user_id.eq.${this.currentUser.id},friend_id.eq.${this.currentUser.id}`);
        console.log("All friendships for user:", allFriendships);
        let debugMessage = `\u{1F50D} FRIEND REQUESTS DEBUG
`;
        debugMessage += `Current user: ${this.currentUser.email}
`;
        debugMessage += `User ID: ${this.currentUser.id.substring(0, 8)}...

`;
        if (error) {
          debugMessage += `\u274C Error: ${error.message}
`;
          debugMessage += `Code: ${error.code}
`;
          debugMessage += `Details: ${error.details}`;
        } else if (allFriendships && allFriendships.length > 0) {
          debugMessage += `\u{1F4CA} Found ${allFriendships.length} friendship(s):

`;
          allFriendships.forEach((friendship, index) => {
            const isIncoming = friendship.friend_id === this.currentUser.id;
            const isOutgoing = friendship.user_id === this.currentUser.id;
            debugMessage += `${index + 1}. ${friendship.status.toUpperCase()}
`;
            debugMessage += `   ID: ${friendship.id}
`;
            if (isIncoming) {
              debugMessage += `   Type: INCOMING REQUEST
`;
              debugMessage += `   From: ${friendship.sender_profile?.name || "Unknown"}
`;
              debugMessage += `   Email: ${friendship.sender_profile?.email}
`;
            } else if (isOutgoing) {
              debugMessage += `   Type: OUTGOING REQUEST
`;
              debugMessage += `   To: ${friendship.recipient_profile?.name || "Unknown"}
`;
              debugMessage += `   Email: ${friendship.recipient_profile?.email}
`;
            }
            debugMessage += `   Created: ${friendship.created_at}

`;
          });
          debugMessage += `
\u{1F4DD} Current Data Arrays:
`;
          debugMessage += `Pending Requests: ${this.pendingRequests.length}
`;
          debugMessage += `Sent Requests: ${this.sentRequests.length}
`;
          debugMessage += `Friends: ${this.friends.length}
`;
        } else {
          debugMessage += `\u274C No friendships found in database
`;
          debugMessage += `This means no friend requests have been sent or received.`;
        }
        const debugAlert = yield this.alertController.create({
          header: "Friend Requests Debug",
          message: debugMessage,
          buttons: [
            "OK",
            {
              text: "Refresh & Reload",
              handler: () => __async(this, null, function* () {
                yield this.loadSocialData();
                const toast = yield this.toastController.create({
                  message: "\u{1F504} Social data reloaded!",
                  duration: 1500,
                  color: "primary"
                });
                yield toast.present();
              })
            }
          ]
        });
        yield debugAlert.present();
      } catch (error) {
        console.error("Error debugging friend requests:", error);
        const errorAlert = yield this.alertController.create({
          header: "Debug Error",
          message: `Failed to debug friend requests: ${error?.message}`,
          buttons: ["OK"]
        });
        yield errorAlert.present();
      }
    });
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
  ionViewWillLeave() {
    if (this.timeRefreshInterval) {
      clearInterval(this.timeRefreshInterval);
      this.timeRefreshInterval = null;
    }
  }
  ngOnDestroy() {
    if (this.timeRefreshInterval) {
      clearInterval(this.timeRefreshInterval);
      this.timeRefreshInterval = null;
    }
  }
  // Getter methods for template use
  get unreadNotificationsCount() {
    return this.notifications.filter((n) => !n.is_read).length;
  }
  get totalNotificationsBadgeCount() {
    return this.unreadNotificationsCount + this.pendingRequests.length;
  }
  get hasUnreadNotifications() {
    return this.unreadNotificationsCount > 0;
  }
};
_SocialPage.\u0275fac = function SocialPage_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _SocialPage)(\u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(SocialService), \u0275\u0275directiveInject(HabitBusinessService), \u0275\u0275directiveInject(ToastController), \u0275\u0275directiveInject(AlertController));
};
_SocialPage.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SocialPage, selectors: [["app-social"]], decls: 13, vars: 7, consts: [["noFriends", ""], ["noNotifications", ""], ["noLeaderboard", ""], ["noCashLeaderboard", ""], ["noCompletedLeaderboard", ""], [3, "translucent"], ["slot", "end", "fill", "clear", "routerLink", "/settings", 4, "ngIf"], ["slot", "end", "fill", "clear", 3, "click", 4, "ngIf"], [3, "fullscreen", "scrollY"], [1, "scrollable-content"], [1, "page-container"], ["class", "loading-container", 4, "ngIf"], [4, "ngIf"], ["mainButton", "home"], ["slot", "end", "fill", "clear", "routerLink", "/settings"], ["name", "settings"], ["slot", "end", "fill", "clear", 3, "click"], ["name", "log-out", "slot", "start"], [1, "loading-container"], ["name", "crescent"], [1, "social-tabs", 3, "ionChange", "value"], ["value", "leaderboard"], ["name", "medal-outline"], ["value", "notifications"], ["name", "notifications-outline"], ["color", "danger", 4, "ngIf"], ["value", "friends"], ["name", "people"], ["class", "tab-content friends-tab", 4, "ngIf"], ["class", "tab-content notifications-tab", 4, "ngIf"], ["class", "tab-content leaderboard-tab", 4, "ngIf"], ["color", "danger"], [1, "tab-content", "friends-tab"], [1, "friends-header"], ["fill", "solid", "color", "primary", 3, "click"], ["name", "person-add", "slot", "start"], ["class", "friends-list", 4, "ngIf", "ngIfElse"], [1, "friends-list"], ["class", "friend-card", 4, "ngFor", "ngForOf"], [1, "friend-card"], [1, "friend-info"], [1, "friend-details"], ["fill", "clear", "size", "small", "color", "danger", 1, "delete-button", 3, "click"], ["name", "trash-outline"], [1, "empty-state"], [1, "tab-content", "notifications-tab"], [1, "notifications-header"], ["fill", "outline", "color", "medium", "size", "small", 3, "click", 4, "ngIf"], ["class", "requests-section", 4, "ngIf"], ["class", "notifications-list", 4, "ngIf", "ngIfElse"], ["fill", "outline", "color", "medium", "size", "small", 3, "click"], [1, "requests-section"], [1, "requests-section-title"], [1, "requests-list"], ["class", "request-card", 4, "ngFor", "ngForOf"], [1, "request-card"], [1, "request-info"], [1, "request-details"], [1, "request-email"], [1, "request-time"], [1, "request-actions"], ["fill", "solid", "color", "success", 3, "click"], ["name", "checkmark", "slot", "start"], ["fill", "outline", "color", "danger", 3, "click"], ["name", "close", "slot", "start"], [1, "request-status"], [1, "notifications-list"], ["class", "notification-card", 3, "unread", 4, "ngFor", "ngForOf"], [1, "notification-card"], [1, "notification-content"], [1, "notification-icon"], [1, "notification-details", 3, "click"], [1, "notification-message-row"], [1, "notification-message"], ["color", "primary", "class", "new-badge", 4, "ngIf"], [1, "notification-time"], [1, "notification-actions"], ["color", "primary", 1, "new-badge"], ["class", "empty-state", 4, "ngIf"], [1, "tab-content", "leaderboard-tab"], [1, "leaderboard-header"], [1, "leaderboard-view-toggle"], [1, "view-toggle-btn", 3, "click"], ["class", "leaderboard-list-card", 4, "ngIf", "ngIfElse"], [1, "leaderboard-list-card"], ["class", "leaderboard-row", 3, "current-user", 4, "ngFor", "ngForOf"], [1, "leaderboard-row"], [1, "rank-badge"], [1, "user-info"], [1, "net-worth"], ["class", "leaderboard-divider", 4, "ngIf"], [1, "leaderboard-divider"], [1, "weekly-reset-countdown"], [1, "cash-period-segment", 3, "ionChange", "value"], ["value", "cash"], ["value", "completed"], ["class", "cash-loading", 4, "ngIf"], [1, "cash-loading"]], template: function SocialPage_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-header", 5)(1, "ion-toolbar")(2, "ion-title");
    \u0275\u0275text(3, "\u{1F465} Social");
    \u0275\u0275elementEnd();
    \u0275\u0275template(4, SocialPage_ion_button_4_Template, 2, 0, "ion-button", 6)(5, SocialPage_ion_button_5_Template, 3, 0, "ion-button", 7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "ion-content", 8)(7, "div", 9)(8, "div", 10);
    \u0275\u0275template(9, SocialPage_div_9_Template, 4, 0, "div", 11)(10, SocialPage_div_10_Template, 18, 5, "div", 12);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(11, "app-bottom-nav");
    \u0275\u0275elementEnd();
    \u0275\u0275element(12, "app-bottom-nav", 13);
  }
  if (rf & 2) {
    \u0275\u0275property("translucent", true);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx.currentUser);
    \u0275\u0275advance();
    \u0275\u0275property("fullscreen", true)("scrollY", false);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx.isLoading);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx.isLoading);
  }
}, dependencies: [
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonSegment,
  IonSegmentButton,
  IonCardContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonBadge,
  IonSpinner,
  BottomNavComponent,
  CommonModule,
  NgForOf,
  NgIf,
  RouterLink,
  DecimalPipe
], styles: ["\n\nion-content[_ngcontent-%COMP%] {\n}\n@supports (-webkit-touch-callout: none) {\n  ion-content[_ngcontent-%COMP%] {\n    height: 100% !important;\n    min-height: 100% !important;\n  }\n}\n.scrollable-content[_ngcontent-%COMP%] {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n@supports (-webkit-touch-callout: none) {\n  .scrollable-content[_ngcontent-%COMP%] {\n    height: calc(100vh - 60px);\n    height: calc(100dvh - 60px);\n    overflow-y: scroll !important;\n    -webkit-overflow-scrolling: touch !important;\n  }\n}\n.scrollable-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container[_ngcontent-%COMP%] {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding: 16px 16px 90px 16px;\n}\n@supports (-webkit-touch-callout: none) {\n  .page-container[_ngcontent-%COMP%] {\n    min-height: calc(100vh - 60px);\n    min-height: calc(100dvh - 60px);\n    padding-bottom: calc(90px + env(safe-area-inset-bottom));\n  }\n}\n.social-tabs[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n  background: var(--business-item-background);\n  border-radius: 12px;\n  padding: 6px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.social-tabs[_ngcontent-%COMP%]   ion-segment-button[_ngcontent-%COMP%] {\n  --indicator-color: transparent;\n  --indicator-color-checked: rgba(255, 215, 0, 0.2);\n  --color: rgba(255, 255, 255, 0.7);\n  --color-checked: var(--ion-color-primary);\n  --border-radius: 8px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  position: relative;\n}\n.social-tabs[_ngcontent-%COMP%]   ion-segment-button.segment-button-checked[_ngcontent-%COMP%] {\n  background: rgba(255, 215, 0, 0.15);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  width: 100%;\n}\n.social-tabs[_ngcontent-%COMP%]   ion-segment-button.segment-button-checked[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%], \n.social-tabs[_ngcontent-%COMP%]   ion-segment-button.segment-button-checked[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary) !important;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);\n}\n.social-tabs[_ngcontent-%COMP%]   ion-segment-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  margin-bottom: 6px;\n}\n.social-tabs[_ngcontent-%COMP%]   ion-segment-button[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.social-tabs[_ngcontent-%COMP%]   ion-segment-button[_ngcontent-%COMP%]   ion-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 6px;\n  right: calc(50% - 22px);\n  min-width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  font-size: 0.65rem;\n  font-weight: 700;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);\n  margin-left: 0;\n}\n.tab-content[_ngcontent-%COMP%] {\n  min-height: 400px;\n}\n.tab-content[_ngcontent-%COMP%]   .friends-list[_ngcontent-%COMP%], \n.tab-content[_ngcontent-%COMP%]   .requests-list[_ngcontent-%COMP%], \n.tab-content[_ngcontent-%COMP%]   .leaderboard-list[_ngcontent-%COMP%] {\n  margin-top: 8px;\n}\n.friends-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n  padding: 0 20px;\n}\n.friends-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.friends-header[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n.friends-header[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  margin-right: 8px;\n  display: flex;\n  align-items: center;\n}\n.requests-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n  padding: 0 20px;\n}\n.requests-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.requests-header[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 6px;\n  --padding-bottom: 6px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  height: 32px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n.requests-header[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  margin-right: 6px;\n  display: flex;\n  align-items: center;\n}\n.leaderboard-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  margin-bottom: 16px;\n  padding: 0 20px;\n}\n.leaderboard-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  text-align: center;\n}\n.leaderboard-view-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  gap: 8px;\n  margin-bottom: 20px;\n  border-radius: 12px;\n  border: none;\n  width: 100%;\n}\n.leaderboard-view-toggle[_ngcontent-%COMP%]   .view-toggle-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 10px 16px;\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid rgba(255, 215, 0, 0.25);\n  border-radius: 24px;\n  background: rgba(255, 255, 255, 0.05);\n  color: rgba(255, 255, 255, 0.55);\n  transition: background 0.2s, color 0.2s;\n  white-space: nowrap;\n}\n.leaderboard-view-toggle[_ngcontent-%COMP%]   .view-toggle-btn.active[_ngcontent-%COMP%] {\n  background: rgba(255, 215, 0, 0.18);\n  color: var(--ion-color-primary);\n}\n.weekly-reset-countdown[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: rgba(255, 255, 255, 0.6);\n  text-align: center;\n}\n.cash-period-segment[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n  --background: rgba(255, 255, 255, 0.05);\n}\n.cash-period-segment[_ngcontent-%COMP%]   ion-segment-button[_ngcontent-%COMP%] {\n  --color: rgba(255, 255, 255, 0.6);\n  --color-checked: var(--ion-color-primary);\n  --indicator-color: rgba(255, 215, 0, 0.2);\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.cash-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 40px 0;\n}\n.cash-loading[_ngcontent-%COMP%]   ion-spinner[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  width: 36px;\n  height: 36px;\n}\n.friend-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin-bottom: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.friend-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%]   .delete-button[_ngcontent-%COMP%] {\n  --padding-start: 8px;\n  --padding-end: 8px;\n  --color: var(--ion-color-danger);\n  margin: 0;\n  flex-shrink: 0;\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%]   .delete-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%]   .delete-button[_ngcontent-%COMP%]:hover {\n  --background: rgba(var(--ion-color-danger-rgb), 0.1);\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%]   .friend-details[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%]   .friend-details[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.2rem;\n  font-weight: 600;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%]   .friend-details[_ngcontent-%COMP%]   .friend-email[_ngcontent-%COMP%] {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n.friend-card[_ngcontent-%COMP%]   .friend-info[_ngcontent-%COMP%]   .friend-details[_ngcontent-%COMP%]   .friend-stats[_ngcontent-%COMP%] {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 0.85rem;\n}\n.leaderboard-list-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 16px;\n  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.12);\n  margin: 0 0 16px 0;\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 8px 20px;\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  gap: 8px;\n  padding: 16px 0;\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row.current-user[_ngcontent-%COMP%] {\n  background: rgba(255, 215, 0, 0.07);\n  border-radius: 10px;\n  padding: 16px 8px;\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row.current-user[_ngcontent-%COMP%]   .user-info[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row.current-user[_ngcontent-%COMP%]   .net-worth[_ngcontent-%COMP%] {\n  color: #00ff88 !important;\n  font-weight: 600;\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row[_ngcontent-%COMP%]   .rank-badge[_ngcontent-%COMP%] {\n  width: 50px;\n  height: 50px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.1);\n  font-weight: bold;\n  font-size: 1.1rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row[_ngcontent-%COMP%]   .rank-badge.top-three[_ngcontent-%COMP%] {\n  font-size: 1.8rem;\n  background: rgba(255, 215, 0, 0.15);\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row[_ngcontent-%COMP%]   .user-info[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row[_ngcontent-%COMP%]   .user-info[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 4px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.2rem;\n  font-weight: 600;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-row[_ngcontent-%COMP%]   .user-info[_ngcontent-%COMP%]   .net-worth[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--earnings-color);\n  font-size: 1rem;\n  font-weight: 600;\n  letter-spacing: 0.5px;\n  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);\n}\n.leaderboard-list-card[_ngcontent-%COMP%]   .leaderboard-divider[_ngcontent-%COMP%] {\n  height: 1px;\n  background: rgba(255, 255, 255, 0.08);\n  margin: 0;\n}\n.empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 60px 24px;\n}\n.empty-state[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 4.5rem;\n  color: var(--ion-color-medium);\n  margin-bottom: 24px;\n  opacity: 0.6;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.2));\n}\n.empty-state[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.9);\n  margin: 0 0 16px 0;\n  font-size: 1.4rem;\n  font-weight: 600;\n}\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.7);\n  margin: 0 0 32px 0;\n  line-height: 1.6;\n  font-size: 1rem;\n  max-width: 400px;\n  margin-left: auto;\n  margin-right: auto;\n}\n.empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 8px;\n  --padding-start: 16px;\n  --padding-end: 16px;\n  --padding-top: 10px;\n  --padding-bottom: 10px;\n  font-size: 0.9rem;\n  font-weight: 600;\n  height: 40px;\n  width: auto;\n}\n.empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   .button-native[_ngcontent-%COMP%] {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n}\n.empty-state[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  display: inline-flex !important;\n  align-items: center !important;\n  vertical-align: middle !important;\n  line-height: 1 !important;\n  margin: 0 8px 0 0 !important;\n}\n.empty-state[_ngcontent-%COMP%]   ion-button[color=primary][_ngcontent-%COMP%] {\n  --box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.3);\n}\nh2[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  font-size: 1.5rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  margin: 0 0 20px 0;\n}\n@media (min-width: 768px) {\n  .page-container[_ngcontent-%COMP%] {\n    max-width: none;\n    margin: 0;\n    padding: 0;\n  }\n  .tab-content[_ngcontent-%COMP%] {\n    padding: 0;\n  }\n  .friend-card[_ngcontent-%COMP%], \n   .request-card[_ngcontent-%COMP%], \n   .leaderboard-list-card[_ngcontent-%COMP%] {\n    margin-bottom: 24px;\n  }\n  .friends-header[_ngcontent-%COMP%], \n   .requests-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n    margin-bottom: 28px;\n  }\n  .friends-grid[_ngcontent-%COMP%] {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));\n    gap: 20px;\n  }\n  .friends-grid[_ngcontent-%COMP%]   .friend-card[_ngcontent-%COMP%] {\n    margin-bottom: 0;\n  }\n  .leaderboard-view-toggle[_ngcontent-%COMP%] {\n    flex-direction: row;\n    gap: 0;\n    border-radius: 24px;\n    overflow: hidden;\n    border: 1px solid rgba(255, 215, 0, 0.25);\n    width: fit-content;\n    align-self: center;\n    margin-left: auto;\n    margin-right: auto;\n  }\n  .leaderboard-view-toggle[_ngcontent-%COMP%]   .view-toggle-btn[_ngcontent-%COMP%] {\n    border: none;\n    border-radius: 0;\n  }\n}\n.requests-section[_ngcontent-%COMP%] {\n  margin-bottom: 32px;\n}\n.requests-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%], \n.requests-section[_ngcontent-%COMP%]   .requests-section-title[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  font-size: 1.1rem;\n  font-weight: 600;\n  margin: 0 0 16px 0;\n  padding: 0 0 8px 16px;\n  opacity: 0.9;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n  border-bottom: 1px solid rgba(255, 215, 0, 0.15);\n}\n.request-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin-bottom: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.request-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 20px;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-details[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-details[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.2rem;\n  font-weight: 600;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-details[_ngcontent-%COMP%]   .request-email[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  line-height: 1.4;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-details[_ngcontent-%COMP%]   .request-time[_ngcontent-%COMP%], \n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-details[_ngcontent-%COMP%]   .request-status[_ngcontent-%COMP%] {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 0.8rem;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  flex-shrink: 0;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-actions[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --border-radius: 10px;\n  height: 36px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  --padding-start: 16px;\n  --padding-end: 16px;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-actions[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-actions[_ngcontent-%COMP%]   ion-button[color=success][_ngcontent-%COMP%] {\n  --box-shadow: 0 2px 8px rgba(var(--ion-color-success-rgb), 0.3);\n}\n.request-card[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .request-actions[_ngcontent-%COMP%]   ion-button[color=danger][_ngcontent-%COMP%] {\n  --box-shadow: 0 2px 8px rgba(var(--ion-color-danger-rgb), 0.3);\n}\nion-badge[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  min-width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  margin-left: 6px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 400px;\n}\n.loading-container[_ngcontent-%COMP%]   ion-spinner[_ngcontent-%COMP%] {\n  color: var(--ion-color-primary);\n  --color: var(--ion-color-primary);\n  transform: scale(1.5);\n  margin-bottom: 20px;\n}\n.loading-container[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 1rem;\n  margin: 0;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notifications-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notifications-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  color: var(--text-color-primary);\n  font-size: 1.4rem;\n  font-weight: 700;\n  margin: 0;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notifications-header[_ngcontent-%COMP%]   ion-button[_ngcontent-%COMP%] {\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notifications-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%] {\n  background: var(--business-item-background);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  margin: 0;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card.unread[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      var(--business-item-background) 0%,\n      rgba(255, 215, 0, 0.05) 100%);\n  border-left: 4px solid var(--ion-color-primary);\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card.unread[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-message[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.15);\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%] {\n  padding: 16px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  flex-shrink: 0;\n  margin-top: 2px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-details[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-details[_ngcontent-%COMP%]   .notification-message-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 12px;\n  margin-bottom: 6px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-details[_ngcontent-%COMP%]   .notification-message[_ngcontent-%COMP%] {\n  flex: 1;\n  color: var(--text-color-primary);\n  font-size: 0.95rem;\n  line-height: 1.4;\n  margin: 0;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-details[_ngcontent-%COMP%]   .new-badge[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  font-size: 0.65rem;\n  padding: 2px 6px;\n  border-radius: 8px;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-details[_ngcontent-%COMP%]   .notification-time[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 0.8rem;\n  margin: 0;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-actions[_ngcontent-%COMP%]   .delete-button[_ngcontent-%COMP%] {\n  --padding-start: 8px;\n  --padding-end: 8px;\n  --color: var(--ion-color-danger);\n  margin: 0;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-actions[_ngcontent-%COMP%]   .delete-button[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n}\n.notifications-tab[_ngcontent-%COMP%]   .notification-card[_ngcontent-%COMP%]   .notification-content[_ngcontent-%COMP%]   .notification-actions[_ngcontent-%COMP%]   .delete-button[_ngcontent-%COMP%]:hover {\n  --background: rgba(var(--ion-color-danger-rgb), 0.1);\n}\n/*# sourceMappingURL=social.page.css.map */"] });
var SocialPage = _SocialPage;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SocialPage, [{
    type: Component,
    args: [{ selector: "app-social", standalone: true, imports: [
      IonContent,
      IonHeader,
      IonTitle,
      IonToolbar,
      IonCard,
      IonSegment,
      IonSegmentButton,
      IonCardContent,
      IonButton,
      IonIcon,
      IonLabel,
      IonBadge,
      IonSpinner,
      BottomNavComponent,
      CommonModule,
      RouterLink
    ], template: `<ion-header [translucent]="true">
  <ion-toolbar>
    <!-- Back button removed, navigation handled by bottom nav -->
    <ion-title>\u{1F465} Social</ion-title>
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

<ion-content [fullscreen]="true" [scrollY]="false">
  <div class="scrollable-content">
    <div class="page-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading social data...</p>
      </div>

      <!-- Main Content -->
      <div *ngIf="!isLoading">
        <!-- Segment Navigation -->
        <ion-segment
          [value]="selectedSegment"
          (ionChange)="onSegmentChange($event)"
          class="social-tabs"
        >
          <ion-segment-button value="leaderboard">
            <ion-icon name="medal-outline"></ion-icon>
            <ion-label>Leaderboard</ion-label>
          </ion-segment-button>
          <ion-segment-button value="notifications">
            <ion-icon name="notifications-outline"></ion-icon>
            <ion-label>Notifications</ion-label>
            <ion-badge *ngIf="totalNotificationsBadgeCount > 0" color="danger"
              >{{ totalNotificationsBadgeCount }}</ion-badge
            >
          </ion-segment-button>
          <ion-segment-button value="friends">
            <ion-icon name="people"></ion-icon>
            <ion-label>Friends</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Friends Tab -->
        <div
          *ngIf="selectedSegment === 'friends'"
          class="tab-content friends-tab"
        >
          <div class="friends-header">
            <h2>{{ friends.length }} Friends</h2>
            <ion-button fill="solid" color="primary" (click)="addFriend()">
              <ion-icon name="person-add" slot="start"></ion-icon>
              Add Friend
            </ion-button>
          </div>

          <div *ngIf="friends.length > 0; else noFriends" class="friends-list">
            <ion-card *ngFor="let friend of friends" class="friend-card">
              <ion-card-content>
                <div class="friend-info">
                  <div class="friend-details">
                    <h3>{{ friend.friend_profile?.name }}</h3>
                  </div>
                  <ion-button
                    fill="clear"
                    size="small"
                    color="danger"
                    (click)="removeFriend(friend)"
                    class="delete-button"
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <ng-template #noFriends>
            <div class="empty-state">
              <ion-icon name="people"></ion-icon>
              <h3>No friends yet</h3>
              <p>
                Add friends to see their habit progress and compete together!
              </p>
              <ion-button fill="solid" color="primary" (click)="addFriend()">
                <ion-icon name="person-add" slot="start"></ion-icon>
                Add Your First Friend
              </ion-button>
            </div>
          </ng-template>
        </div>

        <!-- Notifications Tab -->
        <div
          *ngIf="selectedSegment === 'notifications'"
          class="tab-content notifications-tab"
        >
          <div class="notifications-header">
            <h2>\u{1F514} Notifications</h2>
            <ion-button
              fill="outline"
              color="medium"
              size="small"
              (click)="markAllNotificationsAsRead()"
              *ngIf="hasUnreadNotifications"
            >
              Mark All Read
            </ion-button>
          </div>

          <!-- Incoming Friend Requests (shown at top of notifications) -->
          <div *ngIf="pendingRequests.length > 0" class="requests-section">
            <h3 class="requests-section-title">
              \u{1F4EC} Friend Requests ({{ pendingRequests.length }})
            </h3>
            <div class="requests-list">
              <ion-card
                *ngFor="let request of pendingRequests"
                class="request-card"
              >
                <ion-card-content>
                  <div class="request-info">
                    <div class="request-details">
                      <h4>
                        {{ request.sender_profile?.name || 'Unknown User' }}
                      </h4>
                      <p class="request-email">
                        {{ request.sender_profile?.email }}
                      </p>
                      <p class="request-time">
                        {{ formatTimeAgo(request.created_at) }}
                      </p>
                    </div>
                    <div class="request-actions">
                      <ion-button
                        fill="solid"
                        color="success"
                        (click)="acceptRequest(request.id)"
                      >
                        <ion-icon name="checkmark" slot="start"></ion-icon>
                        Accept
                      </ion-button>
                      <ion-button
                        fill="outline"
                        color="danger"
                        (click)="declineRequest(request.id)"
                      >
                        <ion-icon name="close" slot="start"></ion-icon>
                        Decline
                      </ion-button>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>

          <!-- Sent Requests -->
          <div *ngIf="sentRequests.length > 0" class="requests-section">
            <h3 class="requests-section-title">
              \u{1F4E4} Sent Requests ({{ sentRequests.length }})
            </h3>
            <div class="requests-list">
              <ion-card
                *ngFor="let request of sentRequests"
                class="request-card"
              >
                <ion-card-content>
                  <div class="request-info">
                    <div class="request-details">
                      <h4>
                        {{ request.recipient_profile?.name || 'Unknown User' }}
                      </h4>
                      <p class="request-email">
                        {{ request.recipient_profile?.email }}
                      </p>
                      <p class="request-status">
                        Pending since {{ formatTimeAgo(request.created_at) }}
                      </p>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>

          <div
            *ngIf="notifications.length > 0; else noNotifications"
            class="notifications-list"
          >
            <ion-card
              *ngFor="let notification of notifications"
              class="notification-card"
              [class.unread]="!notification.is_read"
            >
              <ion-card-content>
                <div class="notification-content">
                  <div class="notification-icon">
                    <span *ngIf="notification.type === 'habit_reminder'"
                      >\u{1F44B}</span
                    >
                    <span *ngIf="notification.type === 'stockholder_reminder'"
                      >\u{1F4C8}</span
                    >
                    <ng-container
                      *ngIf="notification.type === 'friend_milestone'"
                    >
                      <span
                        *ngIf="notification.metadata?.milestone_key === 'streak_7'"
                        >\u{1F525}</span
                      >
                      <span
                        *ngIf="notification.metadata?.milestone_key === 'streak_30'"
                        >\u{1F3C6}</span
                      >
                      <span
                        *ngIf="notification.metadata?.milestone_key === 'streak_100'"
                        >\u{1F48E}</span
                      >
                      <span
                        *ngIf="notification.metadata?.milestone_key === 'completions_10'"
                        >\u2B50</span
                      >
                      <span
                        *ngIf="notification.metadata?.milestone_key === 'completions_50'"
                        >\u{1F31F}</span
                      >
                      <span
                        *ngIf="notification.metadata?.milestone_key === 'completions_100'"
                        >\u{1F3AF}</span
                      >
                    </ng-container>
                    <span
                      *ngIf="!notification.type || (notification.type !== 'habit_reminder' && notification.type !== 'stockholder_reminder' && notification.type !== 'friend_milestone')"
                      >\u{1F514}</span
                    >
                  </div>
                  <div
                    class="notification-details"
                    (click)="markNotificationAsRead(notification.id)"
                  >
                    <div class="notification-message-row">
                      <p class="notification-message">
                        {{ notification.message }}
                      </p>
                      <ion-badge
                        *ngIf="!notification.is_read"
                        color="primary"
                        class="new-badge"
                      >
                        New
                      </ion-badge>
                    </div>
                    <p class="notification-time">
                      {{ formatTimeAgo(notification.created_at) }}
                    </p>
                  </div>
                  <div class="notification-actions">
                    <ion-button
                      fill="clear"
                      size="small"
                      color="danger"
                      (click)="deleteNotification(notification.id)"
                      class="delete-button"
                    >
                      <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <ng-template #noNotifications>
            <div
              *ngIf="pendingRequests.length === 0 && sentRequests.length === 0"
              class="empty-state"
            >
              <ion-icon name="notifications-outline"></ion-icon>
              <h3>No notifications</h3>
              <p>
                You'll see notifications here when friends send reminders, hit
                habit milestones, or send you friend requests!
              </p>
            </div>
          </ng-template>
        </div>

        <!-- Leaderboard Tab -->
        <div
          *ngIf="selectedSegment === 'leaderboard'"
          class="tab-content leaderboard-tab"
        >
          <div class="leaderboard-header">
            <h2>\u{1F3C6} Friends Leaderboard</h2>
          </div>

          <!-- View Toggle -->
          <div class="leaderboard-view-toggle">
            <button
              class="view-toggle-btn"
              [class.active]="leaderboardView === 'networth'"
              (click)="onLeaderboardViewChange('networth')"
            >
              \u{1F3C6} Networth Leaderboard
            </button>
            <button
              class="view-toggle-btn"
              [class.active]="leaderboardView === 'cashearned'"
              (click)="onLeaderboardViewChange('cashearned')"
            >
              \u{1F4B5} Weekly Leaderboard
            </button>
          </div>

          <!-- Net Worth View -->
          <ng-container *ngIf="leaderboardView === 'networth'">
            <ion-card
              *ngIf="friendsLeaderboard.length > 0; else noLeaderboard"
              class="leaderboard-list-card"
            >
              <ion-card-content>
                <div
                  *ngFor="let user of friendsLeaderboard; let last = last"
                  class="leaderboard-row"
                  [class.current-user]="user.name === 'You'"
                >
                  <div class="rank-badge" [class.top-three]="user.rank <= 3">
                    <span *ngIf="user.rank === 1">\u{1F947}</span>
                    <span *ngIf="user.rank === 2">\u{1F948}</span>
                    <span *ngIf="user.rank === 3">\u{1F949}</span>
                    <span *ngIf="user.rank > 3">#{{ user.rank }}</span>
                  </div>

                  <div class="user-info">
                    <h3>{{ user.name }}</h3>
                    <p class="net-worth">
                      Net Worth: \${{ (user.net_worth || 0) | number:'1.2-2' }}
                    </p>
                  </div>

                  <div *ngIf="!last" class="leaderboard-divider"></div>
                </div>
              </ion-card-content>
            </ion-card>
          </ng-container>

          <!-- Habit Cash Earned View -->
          <ng-container *ngIf="leaderboardView === 'cashearned'">
            <p class="weekly-reset-countdown">
              \u23F1\uFE0F Resets in {{ getWeeklyResetCountdown() }}
            </p>

            <!-- Metric Filter -->
            <ion-segment
              class="cash-period-segment"
              [value]="cashMetricFilter"
              (ionChange)="onCashMetricChange($event)"
            >
              <ion-segment-button value="cash">
                <ion-label>Weekly Cash</ion-label>
              </ion-segment-button>
              <ion-segment-button value="completed">
                <ion-label>Weekly Habits</ion-label>
              </ion-segment-button>
            </ion-segment>

            <!-- Weekly Cash Earned -->
            <ng-container *ngIf="cashMetricFilter === 'cash'">
              <!-- Loading spinner -->
              <div *ngIf="isLoadingCash" class="cash-loading">
                <ion-spinner name="crescent"></ion-spinner>
              </div>

              <ion-card
                *ngIf="!isLoadingCash && cashLeaderboard.length > 0; else noCashLeaderboard"
                class="leaderboard-list-card"
              >
                <ion-card-content>
                  <div
                    *ngFor="let user of cashLeaderboard; let last = last"
                    class="leaderboard-row"
                    [class.current-user]="user.name === 'You'"
                  >
                    <div class="rank-badge" [class.top-three]="user.rank <= 3">
                      <span *ngIf="user.rank === 1">\u{1F947}</span>
                      <span *ngIf="user.rank === 2">\u{1F948}</span>
                      <span *ngIf="user.rank === 3">\u{1F949}</span>
                      <span *ngIf="user.rank > 3">#{{ user.rank }}</span>
                    </div>

                    <div class="user-info">
                      <h3>{{ user.name }}</h3>
                      <p class="net-worth">
                        Earned: \${{ user.cash_earned | number:'1.2-2' }}
                      </p>
                    </div>

                    <div *ngIf="!last" class="leaderboard-divider"></div>
                  </div>
                </ion-card-content>
              </ion-card>

              <ng-template #noCashLeaderboard>
                <div class="empty-state" *ngIf="!isLoadingCash">
                  <ion-icon name="medal-outline"></ion-icon>
                  <h3>Add friends to see leaderboard</h3>
                  <p>Connect with friends to compare habit cash earned!</p>
                  <ion-button
                    fill="solid"
                    color="primary"
                    (click)="selectedSegment = 'friends'"
                  >
                    <ion-icon name="person-add" slot="start"></ion-icon>
                    Add Friends
                  </ion-button>
                </div>
              </ng-template>
            </ng-container>

            <!-- Weekly Habits Completed -->
            <ng-container *ngIf="cashMetricFilter === 'completed'">
              <!-- Loading spinner -->
              <div *ngIf="isLoadingCompleted" class="cash-loading">
                <ion-spinner name="crescent"></ion-spinner>
              </div>

              <ion-card
                *ngIf="!isLoadingCompleted && completedLeaderboard.length > 0; else noCompletedLeaderboard"
                class="leaderboard-list-card"
              >
                <ion-card-content>
                  <div
                    *ngFor="let user of completedLeaderboard; let last = last"
                    class="leaderboard-row"
                    [class.current-user]="user.name === 'You'"
                  >
                    <div class="rank-badge" [class.top-three]="user.rank <= 3">
                      <span *ngIf="user.rank === 1">\u{1F947}</span>
                      <span *ngIf="user.rank === 2">\u{1F948}</span>
                      <span *ngIf="user.rank === 3">\u{1F949}</span>
                      <span *ngIf="user.rank > 3">#{{ user.rank }}</span>
                    </div>

                    <div class="user-info">
                      <h3>{{ user.name }}</h3>
                      <p class="net-worth">
                        Completed: {{ user.habits_completed }}
                      </p>
                    </div>

                    <div *ngIf="!last" class="leaderboard-divider"></div>
                  </div>
                </ion-card-content>
              </ion-card>

              <ng-template #noCompletedLeaderboard>
                <div class="empty-state" *ngIf="!isLoadingCompleted">
                  <ion-icon name="medal-outline"></ion-icon>
                  <h3>Add friends to see leaderboard</h3>
                  <p>Connect with friends to compare habits completed!</p>
                  <ion-button
                    fill="solid"
                    color="primary"
                    (click)="selectedSegment = 'friends'"
                  >
                    <ion-icon name="person-add" slot="start"></ion-icon>
                    Add Friends
                  </ion-button>
                </div>
              </ng-template>
            </ng-container>
          </ng-container>

          <ng-template #noLeaderboard>
            <div class="empty-state">
              <ion-icon name="medal-outline"></ion-icon>
              <h3>Add friends to see leaderboard</h3>
              <p>Connect with friends to compare your net worth and compete!</p>
              <ion-button
                fill="solid"
                color="primary"
                (click)="selectedSegment = 'friends'"
              >
                <ion-icon name="person-add" slot="start"></ion-icon>
                Add Friends
              </ion-button>
            </div>
          </ng-template>
        </div>
      </div>
      <!-- End main content -->
    </div>
  </div>

  <!-- Bottom Navigation -->
  <app-bottom-nav></app-bottom-nav>
</ion-content>
<app-bottom-nav mainButton="home"></app-bottom-nav>
`, styles: ["/* src/app/social/social.page.scss */\nion-content {\n}\n@supports (-webkit-touch-callout: none) {\n  ion-content {\n    height: 100% !important;\n    min-height: 100% !important;\n  }\n}\n.scrollable-content {\n  height: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n@supports (-webkit-touch-callout: none) {\n  .scrollable-content {\n    height: calc(100vh - 60px);\n    height: calc(100dvh - 60px);\n    overflow-y: scroll !important;\n    -webkit-overflow-scrolling: touch !important;\n  }\n}\n.scrollable-content::-webkit-scrollbar {\n  display: none !important;\n  width: 0 !important;\n}\n.page-container {\n  background: var(--ion-background-color);\n  min-height: 100vh;\n  padding: 16px 16px 90px 16px;\n}\n@supports (-webkit-touch-callout: none) {\n  .page-container {\n    min-height: calc(100vh - 60px);\n    min-height: calc(100dvh - 60px);\n    padding-bottom: calc(90px + env(safe-area-inset-bottom));\n  }\n}\n.social-tabs {\n  margin-bottom: 24px;\n  background: var(--business-item-background);\n  border-radius: 12px;\n  padding: 6px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.social-tabs ion-segment-button {\n  --indicator-color: transparent;\n  --indicator-color-checked: rgba(255, 215, 0, 0.2);\n  --color: rgba(255, 255, 255, 0.7);\n  --color-checked: var(--ion-color-primary);\n  --border-radius: 8px;\n  --padding-top: 12px;\n  --padding-bottom: 12px;\n  position: relative;\n}\n.social-tabs ion-segment-button.segment-button-checked {\n  background: rgba(255, 215, 0, 0.15);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n  width: 100%;\n}\n.social-tabs ion-segment-button.segment-button-checked ion-icon,\n.social-tabs ion-segment-button.segment-button-checked ion-label {\n  color: var(--ion-color-primary) !important;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);\n}\n.social-tabs ion-segment-button ion-icon {\n  font-size: 1.3rem;\n  margin-bottom: 6px;\n}\n.social-tabs ion-segment-button ion-label {\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.social-tabs ion-segment-button ion-badge {\n  position: absolute;\n  top: 6px;\n  right: calc(50% - 22px);\n  min-width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  font-size: 0.65rem;\n  font-weight: 700;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);\n  margin-left: 0;\n}\n.tab-content {\n  min-height: 400px;\n}\n.tab-content .friends-list,\n.tab-content .requests-list,\n.tab-content .leaderboard-list {\n  margin-top: 8px;\n}\n.friends-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n  padding: 0 20px;\n}\n.friends-header h2 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.friends-header ion-button {\n  --border-radius: 8px;\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n.friends-header ion-button ion-icon {\n  font-size: 1rem;\n  margin-right: 8px;\n  display: flex;\n  align-items: center;\n}\n.requests-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n  padding: 0 20px;\n}\n.requests-header h2 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.requests-header ion-button {\n  --border-radius: 8px;\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 6px;\n  --padding-bottom: 6px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  height: 32px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n.requests-header ion-button ion-icon {\n  font-size: 0.9rem;\n  margin-right: 6px;\n  display: flex;\n  align-items: center;\n}\n.leaderboard-header {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  margin-bottom: 16px;\n  padding: 0 20px;\n}\n.leaderboard-header h2 {\n  margin: 0;\n  color: var(--ion-color-primary);\n  font-size: 1.4rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  text-align: center;\n}\n.leaderboard-view-toggle {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  gap: 8px;\n  margin-bottom: 20px;\n  border-radius: 12px;\n  border: none;\n  width: 100%;\n}\n.leaderboard-view-toggle .view-toggle-btn {\n  flex: 1;\n  padding: 10px 16px;\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid rgba(255, 215, 0, 0.25);\n  border-radius: 24px;\n  background: rgba(255, 255, 255, 0.05);\n  color: rgba(255, 255, 255, 0.55);\n  transition: background 0.2s, color 0.2s;\n  white-space: nowrap;\n}\n.leaderboard-view-toggle .view-toggle-btn.active {\n  background: rgba(255, 215, 0, 0.18);\n  color: var(--ion-color-primary);\n}\n.weekly-reset-countdown {\n  margin: 0 0 12px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: rgba(255, 255, 255, 0.6);\n  text-align: center;\n}\n.cash-period-segment {\n  margin-bottom: 16px;\n  --background: rgba(255, 255, 255, 0.05);\n}\n.cash-period-segment ion-segment-button {\n  --color: rgba(255, 255, 255, 0.6);\n  --color-checked: var(--ion-color-primary);\n  --indicator-color: rgba(255, 215, 0, 0.2);\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.cash-loading {\n  display: flex;\n  justify-content: center;\n  padding: 40px 0;\n}\n.cash-loading ion-spinner {\n  color: var(--ion-color-primary);\n  width: 36px;\n  height: 36px;\n}\n.friend-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin-bottom: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.friend-card ion-card-content {\n  padding: 20px;\n}\n.friend-card .friend-info {\n  display: flex;\n  align-items: center;\n}\n.friend-card .friend-info .delete-button {\n  --padding-start: 8px;\n  --padding-end: 8px;\n  --color: var(--ion-color-danger);\n  margin: 0;\n  flex-shrink: 0;\n}\n.friend-card .friend-info .delete-button ion-icon {\n  font-size: 1.2rem;\n}\n.friend-card .friend-info .delete-button:hover {\n  --background: rgba(var(--ion-color-danger-rgb), 0.1);\n}\n.friend-card .friend-info .friend-details {\n  flex: 1;\n}\n.friend-card .friend-info .friend-details h3 {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.2rem;\n  font-weight: 600;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.friend-card .friend-info .friend-details .friend-email {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n.friend-card .friend-info .friend-details .friend-stats {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 0.85rem;\n}\n.leaderboard-list-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 16px;\n  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.12);\n  margin: 0 0 16px 0;\n}\n.leaderboard-list-card ion-card-content {\n  padding: 8px 20px;\n}\n.leaderboard-list-card .leaderboard-row {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  gap: 8px;\n  padding: 16px 0;\n}\n.leaderboard-list-card .leaderboard-row.current-user {\n  background: rgba(255, 215, 0, 0.07);\n  border-radius: 10px;\n  padding: 16px 8px;\n}\n.leaderboard-list-card .leaderboard-row.current-user .user-info h3 {\n  color: var(--ion-color-primary);\n  font-weight: 700;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n}\n.leaderboard-list-card .leaderboard-row.current-user .net-worth {\n  color: #00ff88 !important;\n  font-weight: 600;\n}\n.leaderboard-list-card .leaderboard-row .rank-badge {\n  width: 50px;\n  height: 50px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.1);\n  font-weight: bold;\n  font-size: 1.1rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n}\n.leaderboard-list-card .leaderboard-row .rank-badge.top-three {\n  font-size: 1.8rem;\n  background: rgba(255, 215, 0, 0.15);\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);\n}\n.leaderboard-list-card .leaderboard-row .user-info {\n  text-align: center;\n}\n.leaderboard-list-card .leaderboard-row .user-info h3 {\n  margin: 0 0 4px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.2rem;\n  font-weight: 600;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.leaderboard-list-card .leaderboard-row .user-info .net-worth {\n  margin: 0;\n  color: var(--earnings-color);\n  font-size: 1rem;\n  font-weight: 600;\n  letter-spacing: 0.5px;\n  text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);\n}\n.leaderboard-list-card .leaderboard-divider {\n  height: 1px;\n  background: rgba(255, 255, 255, 0.08);\n  margin: 0;\n}\n.empty-state {\n  text-align: center;\n  padding: 60px 24px;\n}\n.empty-state ion-icon {\n  font-size: 4.5rem;\n  color: var(--ion-color-medium);\n  margin-bottom: 24px;\n  opacity: 0.6;\n  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.2));\n}\n.empty-state h3 {\n  color: rgba(255, 255, 255, 0.9);\n  margin: 0 0 16px 0;\n  font-size: 1.4rem;\n  font-weight: 600;\n}\n.empty-state p {\n  color: rgba(255, 255, 255, 0.7);\n  margin: 0 0 32px 0;\n  line-height: 1.6;\n  font-size: 1rem;\n  max-width: 400px;\n  margin-left: auto;\n  margin-right: auto;\n}\n.empty-state ion-button {\n  --border-radius: 8px;\n  --padding-start: 16px;\n  --padding-end: 16px;\n  --padding-top: 10px;\n  --padding-bottom: 10px;\n  font-size: 0.9rem;\n  font-weight: 600;\n  height: 40px;\n  width: auto;\n}\n.empty-state ion-button .button-native {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n}\n.empty-state ion-button ion-icon {\n  font-size: 1rem;\n  display: inline-flex !important;\n  align-items: center !important;\n  vertical-align: middle !important;\n  line-height: 1 !important;\n  margin: 0 8px 0 0 !important;\n}\n.empty-state ion-button[color=primary] {\n  --box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.3);\n}\nh2 {\n  color: var(--ion-color-primary);\n  font-size: 1.5rem;\n  font-weight: bold;\n  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);\n  margin: 0 0 20px 0;\n}\n@media (min-width: 768px) {\n  .page-container {\n    max-width: none;\n    margin: 0;\n    padding: 0;\n  }\n  .tab-content {\n    padding: 0;\n  }\n  .friend-card,\n  .request-card,\n  .leaderboard-list-card {\n    margin-bottom: 24px;\n  }\n  .friends-header,\n  .requests-section h3 {\n    margin-bottom: 28px;\n  }\n  .friends-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));\n    gap: 20px;\n  }\n  .friends-grid .friend-card {\n    margin-bottom: 0;\n  }\n  .leaderboard-view-toggle {\n    flex-direction: row;\n    gap: 0;\n    border-radius: 24px;\n    overflow: hidden;\n    border: 1px solid rgba(255, 215, 0, 0.25);\n    width: fit-content;\n    align-self: center;\n    margin-left: auto;\n    margin-right: auto;\n  }\n  .leaderboard-view-toggle .view-toggle-btn {\n    border: none;\n    border-radius: 0;\n  }\n}\n.requests-section {\n  margin-bottom: 32px;\n}\n.requests-section h3,\n.requests-section .requests-section-title {\n  color: var(--ion-color-primary);\n  font-size: 1.1rem;\n  font-weight: 600;\n  margin: 0 0 16px 0;\n  padding: 0 0 8px 16px;\n  opacity: 0.9;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n  border-bottom: 1px solid rgba(255, 215, 0, 0.15);\n}\n.request-card {\n  background: var(--business-item-background);\n  border: var(--business-item-border);\n  border-radius: 12px;\n  margin-bottom: 16px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n}\n.request-card ion-card-content {\n  padding: 20px;\n}\n.request-card .request-info {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 20px;\n}\n.request-card .request-info .request-details {\n  flex: 1;\n  min-width: 0;\n}\n.request-card .request-info .request-details h4 {\n  margin: 0 0 8px 0;\n  color: var(--ion-color-primary);\n  font-size: 1.2rem;\n  font-weight: 600;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);\n}\n.request-card .request-info .request-details .request-email {\n  margin: 0 0 8px 0;\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 0.9rem;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  line-height: 1.4;\n}\n.request-card .request-info .request-details .request-time,\n.request-card .request-info .request-details .request-status {\n  margin: 0;\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 0.8rem;\n}\n.request-card .request-info .request-actions {\n  display: flex;\n  gap: 12px;\n  flex-shrink: 0;\n}\n.request-card .request-info .request-actions ion-button {\n  --border-radius: 10px;\n  height: 36px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  --padding-start: 16px;\n  --padding-end: 16px;\n}\n.request-card .request-info .request-actions ion-button ion-icon {\n  font-size: 1.1rem;\n}\n.request-card .request-info .request-actions ion-button[color=success] {\n  --box-shadow: 0 2px 8px rgba(var(--ion-color-success-rgb), 0.3);\n}\n.request-card .request-info .request-actions ion-button[color=danger] {\n  --box-shadow: 0 2px 8px rgba(var(--ion-color-danger-rgb), 0.3);\n}\nion-badge {\n  font-size: 0.7rem;\n  min-width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  margin-left: 6px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n.loading-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 400px;\n}\n.loading-container ion-spinner {\n  color: var(--ion-color-primary);\n  --color: var(--ion-color-primary);\n  transform: scale(1.5);\n  margin-bottom: 20px;\n}\n.loading-container p {\n  color: rgba(255, 255, 255, 0.7);\n  font-size: 1rem;\n  margin: 0;\n}\n.notifications-tab .notifications-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n}\n.notifications-tab .notifications-header h2 {\n  color: var(--text-color-primary);\n  font-size: 1.4rem;\n  font-weight: 700;\n  margin: 0;\n}\n.notifications-tab .notifications-header ion-button {\n  --padding-start: 12px;\n  --padding-end: 12px;\n  --padding-top: 8px;\n  --padding-bottom: 8px;\n}\n.notifications-tab .notifications-list {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.notifications-tab .notification-card {\n  background: var(--business-item-background);\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);\n  margin: 0;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n.notifications-tab .notification-card.unread {\n  background:\n    linear-gradient(\n      135deg,\n      var(--business-item-background) 0%,\n      rgba(255, 215, 0, 0.05) 100%);\n  border-left: 4px solid var(--ion-color-primary);\n}\n.notifications-tab .notification-card.unread .notification-content .notification-message {\n  font-weight: 600;\n}\n.notifications-tab .notification-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.15);\n}\n.notifications-tab .notification-card ion-card-content {\n  padding: 16px;\n}\n.notifications-tab .notification-card .notification-content {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n}\n.notifications-tab .notification-card .notification-content .notification-icon {\n  font-size: 1.5rem;\n  flex-shrink: 0;\n  margin-top: 2px;\n}\n.notifications-tab .notification-card .notification-content .notification-details {\n  flex: 1;\n}\n.notifications-tab .notification-card .notification-content .notification-details .notification-message-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 12px;\n  margin-bottom: 6px;\n}\n.notifications-tab .notification-card .notification-content .notification-details .notification-message {\n  flex: 1;\n  color: var(--text-color-primary);\n  font-size: 0.95rem;\n  line-height: 1.4;\n  margin: 0;\n}\n.notifications-tab .notification-card .notification-content .notification-details .new-badge {\n  flex-shrink: 0;\n  font-size: 0.65rem;\n  padding: 2px 6px;\n  border-radius: 8px;\n}\n.notifications-tab .notification-card .notification-content .notification-details .notification-time {\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 0.8rem;\n  margin: 0;\n}\n.notifications-tab .notification-card .notification-content .notification-actions {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n}\n.notifications-tab .notification-card .notification-content .notification-actions .delete-button {\n  --padding-start: 8px;\n  --padding-end: 8px;\n  --color: var(--ion-color-danger);\n  margin: 0;\n}\n.notifications-tab .notification-card .notification-content .notification-actions .delete-button ion-icon {\n  font-size: 1.2rem;\n}\n.notifications-tab .notification-card .notification-content .notification-actions .delete-button:hover {\n  --background: rgba(var(--ion-color-danger-rgb), 0.1);\n}\n/*# sourceMappingURL=social.page.css.map */\n"] }]
  }], () => [{ type: Router }, { type: AuthService }, { type: SocialService }, { type: HabitBusinessService }, { type: ToastController }, { type: AlertController }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SocialPage, { className: "SocialPage", filePath: "src/app/social/social.page.ts", lineNumber: 32 });
})();
export {
  SocialPage
};
//# sourceMappingURL=social.page-LLBJNZNO.js.map
