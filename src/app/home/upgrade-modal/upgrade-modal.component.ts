import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter 
} from '@ionic/angular/standalone';
import { HabitBusiness } from '../../services/habit-business.service';
import { BusinessIconPipe } from '../../shared/pipes/business-icon.pipe';
import { formatLargeNumber } from '../../shared/currency-format.util';

@Component({
  selector: 'app-upgrade-modal',
  templateUrl: './upgrade-modal.component.html',
  styleUrls: ['./upgrade-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter, BusinessIconPipe]
})
export class UpgradeModalComponent implements OnInit {
  @Input() habitBusiness!: HabitBusiness;
  @Input() upgradeOptions: any[] = [];
  @Input() userCash: number = 0;
  /** Informational only (shown as "Sell Value") — the old business is listed on the Marketplace at this price when the upgrade goes through, but it no longer discounts the upgrade cost itself; upgrades are always full price. */
  @Input() currentBusinessValue: number = 0;
  /** Joint venture: the cost splits evenly N ways — shows/gates on this user's own share instead of the full amount. 1 for a normal single-owner upgrade. */
  @Input() costDivisor: number = 1;
  @Input() isJointVenture: boolean = false;
  @Input() modalController: any;
  @Input() toastController: any;

  constructor() {}

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss();
  }

  selectUpgrade(businessType: any) {
    const upgradeCost = this.getUpgradeCost(businessType);
    const canAfford = this.userCash >= upgradeCost;

    if (!canAfford) {
      this.showErrorToast(`You need $${(upgradeCost - this.userCash).toFixed(2)} more to afford ${this.isJointVenture ? 'your share of' : ''} this upgrade.`);
      return;
    }

    this.modalController.dismiss({
      selectedBusinessType: businessType,
      // Full-cost preview only — the joint-venture RPC recomputes the real
      // per-owner share itself (full new-tier cost, see
      // propose_joint_venture_upgrade) and ignores this value entirely.
      upgradeCost: businessType.base_cost
    });
  }

  getUpgradeCost(businessType: any): number {
    const fullCost = businessType.base_cost;
    return this.costDivisor > 1 ? Math.round((fullCost / this.costDivisor) * 100) / 100 : fullCost;
  }

  canAffordUpgrade(businessType: any): boolean {
    return this.userCash >= this.getUpgradeCost(businessType);
  }

  /** Percentage of the upgrade cost the user's current cash covers, clamped to [0, 100] for progress bars. */
  affordPercent(businessType: any): number {
    const cost = this.getUpgradeCost(businessType);
    if (cost <= 0) return 100;
    return Math.min(100, Math.max(0, (this.userCash / cost) * 100));
  }

  /**
   * Dollar amounts here can run from single digits (tier-1 businesses) up to
   * the tens of billions and beyond (Habit Tycoon tier), where an exact
   * "$10,000,000,000.00" stops being readable — abbreviate once an amount
   * crosses a billion; below that, show the exact figure as before.
   */
  formatMoney(amount: number): string {
    return Math.abs(amount) >= 1e9
      ? formatLargeNumber(amount)
      : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: `❌ ${message}`,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}
