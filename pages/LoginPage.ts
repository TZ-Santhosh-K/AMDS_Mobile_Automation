import type { Browser } from 'webdriverio';

export class LoginPage {
    constructor(private readonly driver: Browser) {}

    private get mobileNumberField() {
        return this.driver.$(
            '//android.widget.EditText[@hint="Enter your phone number"]'
        );
    }

    private get getOtpButton() {
        return this.driver.$('//*[@content-desc="Get OTP"]');
    }

    async isMobileNumberFieldDisplayed(): Promise<boolean> {
        await this.mobileNumberField.waitForDisplayed({ timeout: 10_000 });
        return this.mobileNumberField.isDisplayed();
    }

    async isGetOtpButtonDisplayed(): Promise<boolean> {
        await this.getOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.getOtpButton.isDisplayed();
    }

    async enterMobileNumber(mobileNumber: string): Promise<void> {
        const field = await this.mobileNumberField;

        await field.waitForDisplayed({ timeout: 10_000 });
        await field.click();
        await field.clearValue();
        await field.setValue(mobileNumber);
    }

    async tapGetOtp(): Promise<void> {
        await this.driver.pressKeyCode(4);
        await this.getOtpButton.waitForDisplayed({ timeout: 10_000 });
        await this.getOtpButton.click();
    }
}
