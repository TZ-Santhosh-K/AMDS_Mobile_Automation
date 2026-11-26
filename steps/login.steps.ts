import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

import {
    createAppiumDriver,
    closeAppiumDriver
} from '../utils/driver';

import { LoginPage } from '../pages/LoginPage';
import { OtpPage } from '../pages/OtpPage';
import { GetStartedPage } from '../pages/GetStartedPage';
import { DashboardPage } from '../pages/DashboardPage';
import { getLatestSmsTimestamp, waitForSmsOtp } from '../utils/sms-otp';
import { fixedOtpFor, getDeviceId, requiredEnv } from '../utils/config';

const { Given, When, Then, After } = createBdd();

let driver: Awaited<ReturnType<typeof createAppiumDriver>> | undefined;
let smsBaselineTimestamp = 0;
let fixedOtp: string | undefined;

function getDriver() {
    if (!driver) {
        throw new Error('Appium driver was not initialized.');
    }

    return driver;
}


Given('the AMDS application is launched', async () => {
    fixedOtp = undefined;
    smsBaselineTimestamp = 0;
    driver = await createAppiumDriver();
});

When('I enter my registered mobile number and request OTP', async () => {
    const mobileNumber = requiredEnv('AMDS_TEST_MOBILE');
    fixedOtp = fixedOtpFor('mobile', mobileNumber);
    const loginPage = new LoginPage(getDriver());

    await loginPage.enterMobileNumber(mobileNumber);
    if (!fixedOtp) smsBaselineTimestamp = await getLatestSmsTimestamp(getDeviceId());
    await loginPage.tapGetOtp();
});

When('I request OTP without entering a mobile number', async () => {
    await new LoginPage(getDriver()).tapGetOtp();
});

When('I enter a malformed mobile number and request OTP', async () => {
    const loginPage = new LoginPage(getDriver());
    await loginPage.enterMobileNumber('123');
    await loginPage.tapGetOtp();
});

Then('the OTP verification screen should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isOtpScreenDisplayed()).toBe(true);
});

Then('the invalid OTP message should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isInvalidOtpMessageDisplayed()).toBe(true);
});

Then('six OTP input fields should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.getOtpInputCount()).toBe(6);
});

Then('the Resend OTP option should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isResendOtpDisplayed()).toBe(true);
});

Then('resending OTP should be unavailable before one minute', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isResendOtpEnabled()).toBe(false);
});

When('I wait for the one-minute resend cooldown', async () => {
    await new OtpPage(getDriver()).waitForResendOtpEnabled();
});

Then('resending OTP should be available', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isResendOtpEnabled()).toBe(true);
});

When('I request a new OTP', async () => {
    const deviceId = getDeviceId();
    if (!fixedOtp) smsBaselineTimestamp = await getLatestSmsTimestamp(deviceId);

    const otpPage = new OtpPage(getDriver());
    await otpPage.tapResendOtp();
    expect(await otpPage.isOtpScreenDisplayed()).toBe(true);

    if (!fixedOtp) await waitForSmsOtp(deviceId, smsBaselineTimestamp);
});

Then('resending OTP should be unavailable again', async () => {
    await new OtpPage(getDriver()).waitForResendOtpDisabled();
});

Then('the Verify OTP button should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isVerifyOtpDisplayed()).toBe(true);
});

When('I fetch the OTP from SMS and submit it', async () => {
    const deviceId = getDeviceId();
    const otp = fixedOtp ?? await waitForSmsOtp(deviceId, smsBaselineTimestamp);
    const otpPage = new OtpPage(getDriver());
    await otpPage.enterOtpAndSubmit(otp);
});

When('I submit an incomplete OTP', async () => {
    const otpPage = new OtpPage(getDriver());
    await otpPage.enterOtpDigits('12345');
    await otpPage.submitOtpIfEnabled();
});

When('I submit an incorrect OTP', async () => {
    const otpPage = new OtpPage(getDriver());
    await otpPage.enterOtpAndSubmit('000000');
});

Then('the login success message should be displayed', async () => {
    const getStartedPage = new GetStartedPage(getDriver());
    expect(await getStartedPage.isLoginSuccessDisplayed()).toBe(true);
});

Then('the Let\'s get started button should be displayed', async () => {
    const getStartedPage = new GetStartedPage(getDriver());
    expect(await getStartedPage.isDisplayed()).toBe(true);
});

When('I tap Let\'s get started', async () => {
    const getStartedPage = new GetStartedPage(getDriver());
    await getStartedPage.tap();
});

Then('the dashboard should be displayed', async () => {
    const dashboardPage = new DashboardPage(getDriver());
    expect(await dashboardPage.isDisplayed()).toBe(true);
});

Then('the mobile number field should be displayed', async () => {
    const loginPage = new LoginPage(getDriver());
    expect(await loginPage.isMobileNumberFieldDisplayed()).toBe(true);
});

Then('the Get OTP button should be displayed', async () => {
    const loginPage = new LoginPage(getDriver());
    expect(await loginPage.isGetOtpButtonDisplayed()).toBe(true);
});

Then('the required mobile number message should be displayed', async () => {
    const loginPage = new LoginPage(getDriver());
    expect(await loginPage.isRequiredMobileMessageDisplayed()).toBe(true);
});

Then('the invalid mobile number message should be displayed', async () => {
    const loginPage = new LoginPage(getDriver());
    expect(await loginPage.isInvalidMobileMessageDisplayed()).toBe(true);
});

After(async () => {
    if (driver) {
        try {
            const screenshotPath = test.info().outputPath('amds-screen.png');
            await driver.saveScreenshot(screenshotPath);
            await test.info().attach('AMDS screen', {
                path: screenshotPath,
                contentType: 'image/png'
            });
        } catch (error) {
            console.error('Screenshot capture failed:', error);
        } finally {
            try {
                await closeAppiumDriver(driver);
            } catch (error) {
                console.error('Appium cleanup failed:', error);
            } finally {
                driver = undefined;
            }
        }
    }
});
