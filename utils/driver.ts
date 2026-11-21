
import { remote } from 'webdriverio';

const APPIUM_HOST = process.env.APPIUM_HOST ?? '127.0.0.1';
const APPIUM_PORT = Number(process.env.APPIUM_PORT ?? 4723);
const APP_PACKAGE = 'com.amds.app';
const APP_ACTIVITY = '.MainActivity';
const DEVICE_ID = process.env.AMDS_DEVICE_ID ?? 'b0c73518';

export async function createAppiumDriver() {
    const driver = await remote({
        hostname: APPIUM_HOST,
        port: APPIUM_PORT,
        path: '/',
        capabilities: {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': DEVICE_ID,
            'appium:udid': DEVICE_ID,
            'appium:appPackage': APP_PACKAGE,
            'appium:appActivity': APP_ACTIVITY,
            'appium:noReset': true
        }
    });

    try {
        // Keep app data, but launch a fresh app process for each scenario.
        await driver.terminateApp(APP_PACKAGE);
        await driver.activateApp(APP_PACKAGE);
        return driver;
    } catch (error) {
        await driver.deleteSession();
        throw error;
    }
}

export async function closeAppiumDriver(
    driver: Awaited<ReturnType<typeof createAppiumDriver>>
) {
    try {
        await driver.terminateApp(APP_PACKAGE);
    } finally {
        await driver.deleteSession();
    }
}
