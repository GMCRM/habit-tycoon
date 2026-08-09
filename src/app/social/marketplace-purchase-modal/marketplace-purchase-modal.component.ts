import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter,
  IonItem, IonLabel, IonTextarea, IonSelect, IonSelectOption, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, storefront, add, arrowBack } from 'ionicons/icons';
import { HabitBusiness } from '../../services/habit-business.service';
import { MarketplacePurchase } from '../../services/marketplace.service';
import { BusinessIconPipe } from '../../shared/pipes/business-icon.pipe';

export type MarketplacePurchaseResolution =
  | { mode: 'merge'; targetHabitBusinessId: string }
  | {
      mode: 'new';
      businessName: string;
      habitDescription: string;
      recurrenceInterval: '24h' | 'specific_days';
      goalValue: number;
      activeDays?: number[];
    };

@Component({
  selector: 'app-marketplace-purchase-modal',
  templateUrl: './marketplace-purchase-modal.component.html',
  styleUrls: ['./marketplace-purchase-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonButtons, IonFooter, IonItem, IonLabel, IonTextarea, IonSelect, IonSelectOption,
    BusinessIconPipe
  ]
})
export class MarketplacePurchaseModalComponent implements OnInit {
  @Input() purchase!: MarketplacePurchase;
  @Input() eligibleBusinesses: HabitBusiness[] = [];
  @Input() modalController!: ModalController;

  view: 'choose' | 'new-habit' = 'choose';

  businessName = '';
  habitDescription = '';
  recurrenceInterval: '24h' | 'specific_days' = '24h';
  goalValue = 1;
  activeDays: number[] = [1, 2, 3, 4, 5]; // Mon–Fri default

  readonly dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly dayDows = [0, 1, 2, 3, 4, 5, 6];

  constructor() {
    addIcons({ close, storefront, add, arrowBack });
  }

  ngOnInit() {
    this.businessName = this.purchase.business_name;
  }

  /** Actual per-completion pay the buyer's business will carry — the raw earnings
   * value plus the same capped streak bonus baked into the purchase price
   * (see resolve_marketplace_purchase()'s v_new_earnings). */
  get boostedEarningsPerCompletion(): number {
    const bonusPercent = Math.min(Math.max(this.purchase.streak_at_purchase, 0), 100);
    return this.purchase.earnings_per_completion * (1 + bonusPercent * 0.01);
  }

  private get purchaseBonusPercent(): number {
    return Math.min(Math.max(this.purchase.streak_at_purchase, 0), 100);
  }

  /** True when choosing this business would merge two of the same business
   * type — the case where bonus percents stack instead of one replacing the
   * other, and the old business is absorbed rather than displaced (so it
   * isn't relisted on the Marketplace). Mirrors resolve_marketplace_purchase(). */
  isSameBusinessType(hb: HabitBusiness): boolean {
    return hb.business_type_id === this.purchase.business_type_id;
  }

  /** Resulting Marketplace bonus % this business will carry after the purchase
   * resolves — stacked (capped at 100) for a same-type merge, or just the
   * purchased business's own bonus for a different-type upgrade swap. */
  resultingBonusPercent(hb: HabitBusiness): number {
    if (this.isSameBusinessType(hb)) {
      return Math.min((hb.marketplace_bonus_percent ?? 0) + this.purchaseBonusPercent, 100);
    }
    return this.purchaseBonusPercent;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  chooseExisting(habitBusiness: HabitBusiness) {
    const resolution: MarketplacePurchaseResolution = { mode: 'merge', targetHabitBusinessId: habitBusiness.id };
    this.modalController.dismiss(resolution);
  }

  showNewHabitForm() {
    this.view = 'new-habit';
  }

  backToChoices() {
    this.view = 'choose';
  }

  toggleDay(dow: number) {
    const idx = this.activeDays.indexOf(dow);
    if (idx >= 0) {
      this.activeDays = this.activeDays.filter(d => d !== dow);
    } else {
      this.activeDays = [...this.activeDays, dow].sort((a, b) => a - b);
    }
  }

  isDayActive(dow: number): boolean {
    return this.activeDays.includes(dow);
  }

  get isNewHabitFormValid(): boolean {
    const daysValid = this.recurrenceInterval !== 'specific_days' || this.activeDays.length > 0;
    return !!this.businessName.trim() && !!this.habitDescription.trim() && this.goalValue > 0 && this.goalValue <= 20 && daysValid;
  }

  confirmNewHabit() {
    if (!this.isNewHabitFormValid) return;

    const resolution: MarketplacePurchaseResolution = {
      mode: 'new',
      businessName: this.businessName.trim(),
      habitDescription: this.habitDescription.trim(),
      recurrenceInterval: this.recurrenceInterval,
      goalValue: this.goalValue,
      activeDays: this.recurrenceInterval === 'specific_days' ? this.activeDays : undefined
    };
    this.modalController.dismiss(resolution);
  }
}
