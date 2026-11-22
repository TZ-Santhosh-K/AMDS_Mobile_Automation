
import { remote } from 'webdriverio';
import { getDeviceId } from './config';

const APPIUM_HOST = process.env.APPIUM_HOST ?? '127.0.0.1';
const APPIUM_PORT = Number(process.env.APPIUM_PORT ?? 4723);
const APP_PACKAGE = process.env.AMDS_APP_PACKAGE ?? 'com.amds.app';
const APP_ACTIVITY = process.env.AMDS_APP_ACTIVITY ?? '.MainActivity';


export async function createAppiumDriver() {
    const deviceId = getDeviceId();
    const driver = await remote({
        logLevel: 'error',
        hostname: APPIUM_HOST,
        port: APPIUM_PORT,
        path: '/',
        capabilities: {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            // SMS polling uses ADB, so Appium receives no commands during the wait.
            'appium:newCommandTimeout': 300,
            'appium:deviceName': deviceId,
            'appium:udid': deviceId,
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
