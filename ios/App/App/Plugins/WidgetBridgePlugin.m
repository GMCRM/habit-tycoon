#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WidgetBridgePlugin, "WidgetBridge",
  CAP_PLUGIN_METHOD(syncHabits, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(syncAuthSession, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(clearAuthSession, CAPPluginReturnPromise);
)
