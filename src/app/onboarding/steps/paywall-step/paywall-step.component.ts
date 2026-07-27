import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosed, checkmarkCircle, refresh } from 'ionicons/icons';
import { PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { AuthService } from '../../../services/auth.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-paywall-step',
  templateUrl: './paywall-step.component.html',
  styleUrls: ['../onboarding-step.scss', './paywall-step.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonSpinner],
})
export class PaywallStepComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();

  loading = true;
  purchasing = false;
  restoring = false;
  errorMessage: string | null = null;
  offering: PurchasesOffering | null = null;

  readonly termsUrl = environment.termsUrl;
  readonly privacyUrl = environment.privacyUrl;

  get primaryPackage(): PurchasesPackage | null {
    return this.offering?.availablePackages?.[0] || null;
  }

  get hasFreeTrial(): boolean {
    return !!this.primaryPackage?.product?.introPrice;
  }

  get trialUnitLabel(): string {
    const intro = this.primaryPackage?.product?.introPrice;
    if (!intro) return '';
    const unit = intro.periodUnit.toLowerCase();
    const count = intro.periodNumberOfUnits;
    return `${count}-${unit}${count > 1 ? 's' : ''}`;
  }

  constructor(private authService: AuthService, private subscriptionService: SubscriptionService) {
    addIcons({ lockClosed, checkmarkCircle, refresh });
  }

  async ngOnInit() {
    try {
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        await this.subscriptionService.configure(user.id);
      }
      this.offering = await this.subscriptionService.getCurrentOffering();
      if (!this.primaryPackage) {
        this.errorMessage = "Trial setup isn't finished yet — check back soon.";
      }
    } catch (error) {
      console.error('❌ PaywallStep: failed to load offering:', error);
      this.errorMessage = 'Could not load subscription options. Check your connection and try again.';
    } finally {
      this.loading = false;
    }
  }

  async startTrial() {
    if (!this.primaryPackage || this.purchasing) return;
    this.purchasing = true;
    this.errorMessage = null;
    try {
      const outcome = await this.subscriptionService.purchasePackage(this.primaryPackage);
      if (outcome.success) {
        this.completed.emit();
      } else if (!outcome.cancelled) {
        this.errorMessage = outcome.error || 'Purchase failed — please try again.';
      }
    } finally {
      this.purchasing = false;
    }
  }

  async restore() {
    if (this.restoring) return;
    this.restoring = true;
    this.errorMessage = null;
    try {
      const outcome = await this.subscriptionService.restorePurchases();
      if (outcome.success && outcome.customerInfo && this.subscriptionService.hasActiveEntitlement(outcome.customerInfo)) {
        this.completed.emit();
      } else if (outcome.success) {
        this.errorMessage = 'No active subscription found to restore.';
      } else {
        this.errorMessage = outcome.error || 'Restore failed — please try again.';
      }
    } finally {
      this.restoring = false;
    }
  }
}
