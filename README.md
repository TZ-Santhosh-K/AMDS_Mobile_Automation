# AMDS_Mobile_Automation
AMDS Technician mobile app automation.

## Run the tests

Connect an Android device with USB debugging enabled and confirm it appears in `adb devices`. Install Android SDK Platform-Tools and set `ANDROID_HOME` or `ADB_PATH` if `adb` is not on `PATH`. Set `AMDS_DEVICE_ID` to the device's serial if it differs from the default in `utils/driver.ts`, and set `AMDS_TEST_MOBILE` to the registered test number.

```powershell
$env:AMDS_TEST_MOBILE = "<registered test number>"
$env:AMDS_DEVICE_ID = "<adb device serial>" # optional when using the default device
npm test -- --grep "Verify OTP and navigate to dashboard"
```

The test script regenerates the Playwright BDD specs from `features/` before running, so scenario name changes are picked up. The Playwright global setup starts the repository's local Appium server on `127.0.0.1:4723` and stops it after the run. Set `APPIUM_HOST` or `APPIUM_PORT` to use a different server address. An already running Appium server at that address is reused.

After requesting the code, the test polls the connected Android device's SMS inbox using `adb`, enters the new six digit OTP into the app, submits it, and checks for the `Successfully logged` dashboard label. The device must be authorized for ADB and able to receive the test SMS.
