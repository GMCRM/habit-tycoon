#!/usr/bin/env bash
# Build + launch + screenshot Habit Tycoon (Ionic/Angular/Capacitor) on an
# iOS Simulator. See SKILL.md in this directory for the narrative version.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$REPO_ROOT"

WORKSPACE="ios/App/App.xcworkspace"
SCHEME="App"
# Outside ios/App/ on purpose: a derivedDataPath under ios/App/build collides
# with `pod install`'s internal `xcodebuild clean` step (see Gotchas).
DERIVED_DATA="/tmp/habit-tycoon-ios-build"
APP_PATH="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/App.app"

# The bundle ID has changed before (io.ionic.starter -> com.grantcross.habittycoon)
# and drifted out of sync with a hardcoded value here, which silently launched a
# stale leftover app under the old ID instead of the freshly built one — see Gotchas.
# Always read it from the just-built Info.plist instead of hardcoding it.
bundle_id() {
  /usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$APP_PATH/Info.plist"
}

pick_device() {
  local booted
  booted=$(xcrun simctl list devices | grep -m1 "(Booted)" | grep -oE '[0-9A-F-]{8}(-[0-9A-F]{4}){3}-[0-9A-F]{12}' || true)
  if [ -n "$booted" ]; then
    echo "$booted"
    return
  fi
  local udid
  udid=$(xcrun simctl list devices available | grep -m1 "iPhone 16 (" | grep -oE '[0-9A-F-]{8}(-[0-9A-F]{4}){3}-[0-9A-F]{12}')
  xcrun simctl boot "$udid" >/dev/null 2>&1 || true
  open -a Simulator
  sleep 3
  echo "$udid"
}

cmd_build() {
  # MUST use the `ios` Angular config, not the default `production` one —
  # production bakes in <base href="/habit-tycoon/"> for GitHub Pages, which
  # 404s every JS chunk under capacitor://localhost/. See Gotchas.
  npx ng build --configuration ios
  # `cap sync` runs `pod install`, which runs `xcodebuild clean`. If a stray
  # ios/App/build exists (e.g. from an xcodebuild run that used
  # -derivedDataPath build instead of $DERIVED_DATA), that clean step fails
  # with "Could not delete ... because it was not created by the build
  # system." It's gitignored and unrelated to this driver, so it's always
  # safe to clear before syncing. See Gotchas.
  rm -rf ios/App/build
  npx cap sync ios
}

cmd_xcodebuild() {
  local udid="$1"
  xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Debug -sdk iphonesimulator \
    -derivedDataPath "$DERIVED_DATA" \
    -destination "platform=iOS Simulator,id=$udid" build \
    | tail -20
}

cmd_run() {
  local udid="$1"
  local bid
  bid=$(bundle_id)
  xcrun simctl install "$udid" "$APP_PATH"
  xcrun simctl terminate "$udid" "$bid" >/dev/null 2>&1 || true
  xcrun simctl launch "$udid" "$bid"
}

cmd_screenshot() {
  local udid="$1"
  local out="${2:-/tmp/habit-tycoon-sim.png}"
  local wait_s="${3:-4}"
  sleep "$wait_s"
  xcrun simctl io "$udid" screenshot "$out"
  echo "$out"
}

cmd_logs() {
  # JS console output runs in the separate WebContent process, not "App" —
  # do not filter --predicate 'process == "App"' or you'll miss it.
  # It ALSO won't appear at all unless WebKitDebugLogsPageMessagesToSystemConsoleEnabled
  # is set for the app's bundle domain — off by default. Set it every time;
  # it's a no-op if already set, and there's no reliable way to check first.
  local udid="$1"
  local seconds="${2:-8}"
  xcrun simctl spawn "$udid" defaults write "$(bundle_id)" WebKitDebugLogsPageMessagesToSystemConsoleEnabled -bool YES
  xcrun simctl spawn "$udid" log stream --level debug --style compact &
  local pid=$!
  sleep "$seconds"
  kill "$pid" 2>/dev/null || true
}

case "${1:-all}" in
  build) cmd_build ;;
  xcodebuild) UDID=$(pick_device); cmd_xcodebuild "$UDID" ;;
  run) UDID=$(pick_device); cmd_run "$UDID" ;;
  screenshot) UDID=$(pick_device); cmd_screenshot "$UDID" "${2:-}" "${3:-4}" ;;
  logs) UDID=$(pick_device); cmd_logs "$UDID" "${2:-8}" ;;
  all)
    UDID=$(pick_device)
    echo "Using simulator: $UDID"
    cmd_build
    cmd_xcodebuild "$UDID"
    cmd_run "$UDID"
    cmd_screenshot "$UDID" "/tmp/habit-tycoon-sim.png" 4
    ;;
  *)
    echo "usage: driver.sh [build|xcodebuild|run|screenshot [path] [wait_s]|logs [seconds]|all]"
    exit 1
    ;;
esac
