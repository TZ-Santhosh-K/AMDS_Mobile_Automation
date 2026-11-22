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

After requesting the code, the test polls the connected Android device's SMS inbox using `adb`, enters the new six digit OTP into the app, submits it, and checks for the `Successfully logged` dashboard label. The device must be authorized for ADB and able to receive the test SMS.

## Fixed test OTP and delayed SMS

For an account whose backend accepts the test code `123456`, explicitly configure the matching mobile number:

```powershell
$env:AMDS_FIXED_OTP_MOBILE = "<designated test mobile>"
$env:AMDS_TEST_MOBILE = "<same designated test mobile>"
```

Only an exact match uses `123456` and skips inbox access. Other numbers still request and read a fresh SMS. Remove `AMDS_FIXED_OTP_MOBILE` to disable this option. Setting this variable does not change backend authentication.

The shared `fixedOtpFor('email', account)` helper also supports `AMDS_FIXED_OTP_EMAIL` (case-insensitive match). Email login and email retrieval are not implemented; those scenarios remain commented out.

SMS polling allows 150 seconds, within a 240-second scenario timeout. Extraction has no brand/template dependency: a fresh SMS with exactly one distinct standalone six-digit number is eligible. Messages with multiple different six-digit numbers are skipped. With no sender filter, an unrelated new six-digit SMS can also match; use a dedicated test device. OTP entry verifies the field values before submitting; masked or custom widgets may need an app-specific locator/readback strategy.

## Separate test data

Edit `test-data/local.json` for local device/mobile/email values. This file is ignored by Git. Copy `test-data/example.json` to that location on a new checkout. Environment variables override file values (including an empty value to disable fixed OTP). `AMDS_TEST_DATA_FILE` can select another JSON file.

Leave fixed-OTP account fields empty for real SMS. Set `AMDS_FIXED_OTP_MOBILE` to the same designated mobile only if the backend accepts `123456`. Email settings are reserved for future email login implementation.

Run parser regression checks with `node --test tests/sms-parser.test.cjs`.

Keep account values in terminal or CI environment variables. Pipeline integration is deferred. The suite uses one worker because a physical device cannot run independent UI scenarios concurrently.
