---
name: run-habit-tycoon
description: Build, launch, screenshot, and view console logs for Habit Tycoon (Ionic/Angular/Capacitor) on an iOS Simulator. Use when asked to run, start, test, or screenshot the app, or verify a change works on iOS.
---

Habit Tycoon is an Ionic 8 / Angular 20 app wrapped in Capacitor 7,
with a native iOS project already checked in at `ios/App`. It has no
Android/web-only run path documented here — this skill is iOS
Simulator only, driven entirely through `xcrun simctl` and
`xcodebuild` (macOS + Xcode required, both present in this
environment).

All paths below are relative to the repo root (`habit-tycoon/`), not
this skill directory. The driver is
`.claude/skills/run-habit-tycoon/driver.sh`.

## Run (agent path) — use the driver

```bash
.claude/skills/run-habit-tycoon/driver.sh all
```

This does the full cycle: Angular build (with the correct config —
see Gotchas), `cap sync ios`, `xcodebuild` for the simulator, install,
launch, and a screenshot at `/tmp/habit-tycoon-sim.png`. Takes ~60-90s
on a warm Pod cache. Picks a currently-booted simulator if one exists,
otherwise boots an iPhone 16.

Individual steps (useful when iterating — e.g. you only changed
TypeScript and don't need a full `pod install`):

```bash
.claude/skills/run-habit-tycoon/driver.sh build        # ng build (ios config) + cap sync
.claude/skills/run-habit-tycoon/driver.sh xcodebuild    # xcodebuild for iphonesimulator
.claude/skills/run-habit-tycoon/driver.sh run           # install + launch on simulator
.claude/skills/run-habit-tycoon/driver.sh screenshot [path] [wait_s]
.claude/skills/run-habit-tycoon/driver.sh logs [seconds]   # streams device console log
```

**Always look at the screenshot after `run`.** A dark-navy rectangle
with no visible UI (status bar and background color only) means the
Angular bundle 404'd and never bootstrapped — see the first Gotcha
below, it's the most likely culprit.

## Prerequisites (already satisfied in this environment)

- Xcode installed (`xcode-select -p` → `/Applications/Xcode.app/...`).
- At least one iOS Simulator runtime with an iPhone device
  (`xcrun simctl list devices available`).
- `node_modules` installed (`npm install`) and CocoaPods available via
  `npx cap sync` (it invokes `pod install` itself — no separate
  `pod install` step needed).

## Gotchas

- **Do not build with the plain `npm run build` / `ng build` (default
  `production` config) for iOS.** `angular.json`'s `production`
  config sets `<base href="/habit-tycoon/">` for GitHub Pages. The
  Capacitor iOS app serves assets from `capacitor://localhost/` (no
  subpath), so every JS chunk 404s under that base href and
  `<app-root>` never mounts — the app *launches* (process stays
  alive, no crash) but the screen is just the body background color
  forever. There's an `ios` config already defined in `angular.json`
  with `baseHref: "/"` — use `ng build --configuration ios` (what the
  driver does). This existed in the repo but no build/npm script was
  wired to it before this skill.
- **JS console output does NOT show up if you filter simulator logs to
  `process == "App"`.** WKWebView content runs in a separate
  `com.apple.WebKit.WebContent` XPC process, not in the app's own
  process. Stream logs without a process predicate (see
  `driver.sh logs`), or you'll see only native/OS noise and conclude
  there were no errors when there might have been.
- **JS console output ALSO doesn't show up at all** (in either process)
  unless `WebKitDebugLogsPageMessagesToSystemConsoleEnabled` is set for
  the app's bundle domain — it's unset by default, and its absence
  looks identical to "no console output happened," not "logging is
  off." `driver.sh logs` sets it via `defaults write` before every
  stream. Once set it's sticky per simulator, but the driver sets it
  unconditionally anyway since there's no cheap way to check first.
- **A stray `ios/App/build` directory breaks `cap sync`.** If you (or
  a previous session) ran `xcodebuild -derivedDataPath build` from
  inside `ios/App`, that directory sticks around, is `.gitignore`'d,
  and causes the *next* `npx cap sync ios` to fail with `Could not
  delete .../ios/App/build because it was not created by the build
  system` — `cap sync` runs `pod install`, which runs
  `xcodebuild ... clean`, which refuses to remove a build folder it
  doesn't recognize. The driver avoids this by using
  `-derivedDataPath /tmp/habit-tycoon-ios-build` (outside `ios/App`)
  and defensively `rm -rf ios/App/build` before every sync. If you
  bypass the driver and use raw `xcodebuild`, do the same.
- **The Xcode project's bundle ID has changed before and will likely
  change again** — it was `io.ionic.starter` originally, then got
  renamed to `com.grantcross.habittycoon` in the Xcode project
  directly (uncommitted change to `ios/App/App.xcodeproj/project.pbxproj`
  and `Info.plist`; `capacitor.config.ts`'s `appId` only takes effect
  if someone runs `cap sync` after changing
  `PRODUCT_BUNDLE_IDENTIFIER`, and nobody has for this repo). The
  driver does **not** hardcode the bundle ID — `cmd_run`/`cmd_logs`
  read it fresh from the just-built `Info.plist` via `bundle_id()` in
  `driver.sh`. If you bypass the driver and call `simctl` directly,
  check with:
  `/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" <path-to-App.app>/Info.plist`
  rather than assuming either ID.
- **A stale app under an old bundle ID can still be installed on the
  simulator and will silently win if you launch the wrong ID.** When
  the bundle ID was renamed, an old build under `io.ionic.starter` was
  never uninstalled from the simulator. It still had a valid logged-in
  session, so launching it (with a hardcoded old bundle ID) looked
  completely convincing — real data, fully rendered UI — while the
  actual freshly-built app (new bundle ID) sat installed but unopened.
  This produced a screenshot that looked live but was actually stale
  by days, silently missing every change since the rename. If a
  screenshot ever looks like it's not reflecting a just-made change,
  check `xcrun simctl listapps <udid>` for duplicate/old bundle IDs
  for this app and `xcrun simctl uninstall <udid> <old-id>` them.
- **`xcodebuild -list -workspace ios/App/App.xcworkspace`** shows the
  scheme is just `App` (capitalized), not `HabitTycoon` or similar —
  easy to guess wrong.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Screen shows only a dark background, no UI, no crash | You built with the default `production` config. Rebuild with `driver.sh build` (uses `--configuration ios`). |
| `cap sync ios` fails with `CLEAN FAILED` / "not created by the build system" | `rm -rf ios/App/build` then retry. The driver does this automatically. |
| `simctl launch <udid> <some-bundle-id>` → "process not found" | Wrong/stale bundle ID — re-check via `PlistBuddy` on the built `.app`'s `Info.plist` (see Gotchas), or just use `driver.sh run`, which reads it dynamically. |
| Screenshot looks fine but doesn't reflect a change you just made | A stale app under an old bundle ID may still be installed and got launched instead (see Gotchas). Check `xcrun simctl listapps <udid>` for old IDs and uninstall them. |
| Need to see why the app is stuck/blank | `driver.sh logs 10` — do NOT add a process filter, JS console lives in the WebContent process, and the driver enables system-console forwarding for you. |
| `driver.sh logs` runs clean but shows zero app output even though the app is clearly doing things | You bypassed the driver and streamed logs some other way — `WebKitDebugLogsPageMessagesToSystemConsoleEnabled` is still off for this bundle. `driver.sh logs` sets it for the current bundle ID automatically; if you're calling `simctl` directly, `defaults write <bundle-id> WebKitDebugLogsPageMessagesToSystemConsoleEnabled -bool YES` once, then retry. |

## Verified

Ran `driver.sh all` from a clean state (removed `/tmp/habit-tycoon-ios-build`
and `ios/App/build` first) on 2026-07-24: build succeeded, `cap sync`
succeeded, `xcodebuild` succeeded, app installed on an iPhone 16
(iOS 18.6) simulator. That same run's `launch` used a hardcoded
`io.ionic.starter` bundle ID that no longer matched the project (see
Gotchas) — it happened to launch a stale leftover app under that old
ID instead of erroring, producing a convincing but days-stale
screenshot. Fixed by making the driver read the bundle ID from the
built `Info.plist` at run time instead of hardcoding it, and by
uninstalling the stale `io.ionic.starter` app from the simulator. A
follow-up run with the corrected driver installed and launched the
real current build (`com.grantcross.habittycoon`) and screenshotted
the actual "Welcome Back!" sign-in page (no session on the freshly
targeted bundle) — confirming the fixed driver targets the right app.
