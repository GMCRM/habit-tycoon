import { Injectable } from '@angular/core';
import { Purchases, PurchasesOffering, PurchasesPackage, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { environment } from '../../environments/environment';

export const PREMIUM_ENTITLEMENT_ID = 'premium';

export interface PurchaseOutcome {
  success: boolean;
  cancelled: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

/**
 * Thin wrapper around the RevenueCat Capacitor SDK. Configuration (the
 * RevenueCat project, entitlement, product, and free-trial offer) happens
 * entirely on the RevenueCat/App Store Connect dashboards — see the plan doc
 * for the manual setup steps this depends on.
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private configured = false;

  async configure(appUserId: string): Promise<void> {
    if (this.configured || !environment.revenueCatApiKey) {
      if (!environment.revenueCatApiKey) {
        console.warn('⚠️ SubscriptionService: no RevenueCat API key configured, skipping init.');
      }
      return;
    }

    await Purchases.setLogLevel({ level: environment.production ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG });
    await Purchases.configure({
      apiKey: environment.revenueCatApiKey,
      appUserID: appUserId,
    });
    this.configured = true;
  }

  async getCurrentOffering(): Promise<PurchasesOffering | null> {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
    try {
      const result = await Purchases.purchasePackage({ aPackage: pkg });
      return { success: true, cancelled: false, customerInfo: result.customerInfo };
    } catch (error: any) {
      if (error?.userCancelled) {
        return { success: false, cancelled: true };
      }
      console.error('❌ SubscriptionService: purchase failed:', error);
      return { success: false, cancelled: false, error: error?.message || 'Purchase failed' };
    }
  }

  async restorePurchases(): Promise<PurchaseOutcome> {
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      return { success: true, cancelled: false, customerInfo };
    } catch (error: any) {
      console.error('❌ SubscriptionService: restore failed:', error);
      return { success: false, cancelled: false, error: error?.message || 'Restore failed' };
    }
  }

  async isEntitled(entitlementId: string = PREMIUM_ENTITLEMENT_ID): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return this.hasActiveEntitlement(customerInfo, entitlementId);
    } catch (error) {
      console.error('❌ SubscriptionService: failed to fetch customer info:', error);
      return false;
    }
  }

  hasActiveEntitlement(customerInfo: CustomerInfo, entitlementId: string = PREMIUM_ENTITLEMENT_ID): boolean {
    return !!customerInfo.entitlements.active[entitlementId];
  }
}
