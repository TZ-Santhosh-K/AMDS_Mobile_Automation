# AMDS_Mobile_Automation
AMDS Technician mobile app automation.

## Run the tests

Connect an Android device with USB debugging enabled and confirm it appears in `adb devices`. Install Android SDK Platform-Tools and set `ANDROID_HOME` to its SDK directory. Set `AMDS_DEVICE_ID` to the device's serial (required), and set `AMDS_TEST_MOBILE` to the registered test number.

```powershell
$env:AMDS_TEST_MOBILE = "<registered test number>"
$env:AMDS_DEVICE_ID = "<adb device serial>"
npm.cmd test -- --grep "Verify OTP and navigate to dashboard"
```

The test script regenerates the Playwright BDD specs from `features/` before running, so scenario name changes are picked up. The Playwright global setup starts the repository's local Appium server on `127.0.0.1:4723` and stops it after the run. Set `APPIUM_HOST` or `APPIUM_PORT` to use a different server address. An already running Appium server at that address is reused.

After requesting the code, the test polls the connected Android device's SMS inbox using `adb`, enters the new six digit OTP into the app, submits it, taps **Get started**, and checks for the `Successfully logged` dashboard label. The device must be authorized for ADB and able to receive the test SMS.

## Test data and fixed OTP

Copy `test-data/example.json` to the ignored `test-data/local.json` and fill in your device and test account values. The example sets the shared fixed test code to `123456`. Enable it only for accounts whose backend accepts that code by setting the matching account field:

```json
{
  "AMDS_FIXED_OTP": "123456",
  "AMDS_FIXED_OTP_MOBILE": "<designated test mobile>",
  "AMDS_FIXED_OTP_EMAIL": "<designated test email>"
}
```

Mobile numbers must match exactly; email matching ignores letter case. A matching mobile account uses the shared fixed OTP and skips SMS retrieval. Other mobile accounts continue to use the normal SMS flow. This setting does not change backend authentication. Leave an account field empty to disable the fixed OTP for that channel.

The same account-matching helper returns the shared code for a matching email account when an email login flow is implemented; email login is not currently part of the test suite.

SMS polling allows 150 seconds, within a 240-second scenario timeout. Extraction has no brand/template dependency: a fresh SMS with exactly one distinct standalone six-digit number is eligible. Messages with multiple different six-digit numbers are skipped. With no sender filter, an unrelated new six-digit SMS can also match; use a dedicated test device. OTP entry verifies the field values before submitting; masked or custom widgets may need an app-specific locator/readback strategy.

Environment variables override values from `test-data/local.json`. Use `AMDS_TEST_DATA_FILE` to select another JSON file. Keep only placeholders in `test-data/example.json`; do not commit local account values.

The app keeps its signed-in state by default. If the device opens on the dashboard and you want to run the login/OTP journey from a fresh login screen, set `AMDS_RESET_APP_DATA` to `"true"` in `test-data/local.json`. Appium will clear the app's saved data at session start. Set it to `"false"` to preserve the current app state.

The resend scenario checks that the resend control stays disabled during the cooldown, becomes enabled after one minute, and sends a fresh SMS when real SMS mode is used. With the fixed test OTP enabled, it checks the button cooldown and resend action without polling the inbox.

SMS parsing is template independent. It accepts a fresh message with one distinct standalone six-digit number and skips ambiguous messages. Because it has no sender filter, use a dedicated test device. OTP input is checked before submission.

Pipeline integration is deferred. The suite uses one worker because a physical device cannot run independent UI scenarios concurrently.
