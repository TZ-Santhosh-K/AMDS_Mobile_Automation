import type { Browser } from 'webdriverio';

export class OtpPage {
    constructor(private readonly driver: Browser) {}

    // Locate the OTP screen heading.
    private get otpHeading() {
        return this.driver.$('~Sent you an OTP!');
    }

    // Locate all six OTP input fields.
    private get otpInputFields() {
        return this.driver.$$('//android.widget.EditText');
    }

    // Locate the Resend OTP option.
    private get resendOtpButton() {
        return this.driver.$('//*[@content-desc="Resend code?"]');
    }

    // Locate the Verify OTP button.
    private get verifyOtpButton() {
        return this.driver.$('~Verify OTP');
    }

    // Check whether the OTP screen is displayed.
    async isOtpScreenDisplayed(): Promise<boolean> {
        await this.otpHeading.waitForDisplayed({ timeout: 10_000 });
        return this.otpHeading.isDisplayed();
    }

    // Get the number of OTP input fields.
    async getOtpInputCount(): Promise<number> {
        await this.otpHeading.waitForDisplayed({ timeout: 10_000 });
        const fields = await this.otpInputFields;
        return fields.length;
    }

    // Check whether Resend OTP is displayed.
    async isResendOtpDisplayed(): Promise<boolean> {
        await this.resendOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.resendOtpButton.isDisplayed();
    }

    // Check whether Verify OTP is displayed.
    async isVerifyOtpDisplayed(): Promise<boolean> {
        await this.verifyOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.verifyOtpButton.isDisplayed();
    }

    async enterOtpAndSubmit(otp: string): Promise<void> {
        if (!/^\d{6}$/.test(otp)) {
            throw new Error('The SMS OTP must contain exactly six digits.');
        }
        const fields = await this.otpInputFields;
        if (fields.length !== otp.length) {
            throw new Error(`Expected six OTP fields, found ${fields.length}.`);
        }
        for (let index = 0; index < otp.length; index += 1) {
            const field = fields[index];
            const digit = otp[index];
            if (field && digit !== undefined) await field.setValue(digit);
        }
        await this.verifyOtpButton.click();
    }
}
