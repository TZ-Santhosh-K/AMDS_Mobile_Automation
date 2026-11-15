import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

import {
    createAppiumDriver,
    closeAppiumDriver
} from '../utils/driver';

import { LoginPage } from '../pages/LoginPage';
import { OtpPage } from '../pages/OtpPage';

const { Given, When, Then, After } = createBdd();

let driver: Awaited<ReturnType<typeof createAppiumDriver>> | undefined;

function getDriver() {
    if (!driver) {
        throw new Error('Appium driver was not initialized.');
    }

    return driver;
}

Given('the AMDS application is launched', async () => {
    driver = await createAppiumDriver();
});

When('I enter my registered mobile number and request OTP', async () => {
    const mobileNumber = process.env.AMDS_TEST_MOBILE;

    if (!mobileNumber) {
        throw new Error('AMDS_TEST_MOBILE environment variable is missing.');
    }

    const loginPage = new LoginPage(getDriver());

    await loginPage.enterMobileNumber(mobileNumber);
    await loginPage.tapGetOtp();
});

Then('the OTP verification screen should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isOtpScreenDisplayed()).toBe(true);
});

Then('six OTP input fields should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.getOtpInputCount()).toBe(6);
});

Then('the Resend OTP option should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isResendOtpDisplayed()).toBe(true);
});

Then('the Verify OTP button should be displayed', async () => {
    const otpPage = new OtpPage(getDriver());
    expect(await otpPage.isVerifyOtpDisplayed()).toBe(true);
});

Then('the mobile number field should be displayed', async () => {
    const loginPage = new LoginPage(getDriver());
    expect(await loginPage.isMobileNumberFieldDisplayed()).toBe(true);
});

Then('the Get OTP button should be displayed', async () => {
    const loginPage = new LoginPage(getDriver());
    expect(await loginPage.isGetOtpButtonDisplayed()).toBe(true);
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
