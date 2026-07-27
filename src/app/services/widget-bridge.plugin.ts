import { registerPlugin, Capacitor } from '@capacitor/core';

/**
 * Native-only bridge (iOS) that writes into the App Group's shared storage
 * the HabitWidget extension reads from — see
 * ios/App/App/Plugins/WidgetBridgePlugin.swift for the native side and
 * ios/App/HabitWidget/WidgetConstants.swift for the widget's matching
 * constants. No web implementation; every method is a no-op off iOS.
 */
export interface WidgetBridgePlugin {
  syncHabits(options: { habits: Record<string, unknown>[] }): Promise<void>;
  syncAuthSession(options: {
    accessToken: string;
    refreshToken: string;
    /** Epoch seconds — matches Supabase's session.expires_at shape directly. */
    expiresAt: number;
    userId: string;
  }): Promise<void>;
  clearAuthSession(): Promise<void>;
}

const WidgetBridgeNative = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

const isIOS = Capacitor.getPlatform() === 'ios';

/** Swallows all errors — widget sync must never break the app it's mirroring. */
export const WidgetBridge: WidgetBridgePlugin = {
  async syncHabits(options) {
    if (!isIOS) return;
    try {
      await WidgetBridgeNative.syncHabits(options);
    } catch (error) {
      console.warn('WidgetBridge.syncHabits failed (non-fatal):', error);
    }
  },
  async syncAuthSession(options) {
    if (!isIOS) return;
    try {
      await WidgetBridgeNative.syncAuthSession(options);
    } catch (error) {
      console.warn('WidgetBridge.syncAuthSession failed (non-fatal):', error);
    }
  },
  async clearAuthSession() {
    if (!isIOS) return;
    try {
      await WidgetBridgeNative.clearAuthSession();
    } catch (error) {
      console.warn('WidgetBridge.clearAuthSession failed (non-fatal):', error);
    }
  },
};
