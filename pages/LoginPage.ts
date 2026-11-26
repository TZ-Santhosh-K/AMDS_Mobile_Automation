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

    private get requiredMobileMessage() {
        return this.driver.$(
            '//*[contains(@text, "Please enter your mobile number") or contains(@content-desc, "Please enter your mobile number")]'
        );
    }

    private get invalidMobileMessage() {
        return this.driver.$(
            '//*[contains(@text, "Enter a valid mobile number") or contains(@content-desc, "Enter a valid mobile number")]'
        );
    }

    async isMobileNumberFieldDisplayed(): Promise<boolean> {
        await this.mobileNumberField.waitForDisplayed({ timeout: 10_000 });
        return this.mobileNumberField.isDisplayed();
    }

    async isGetOtpButtonDisplayed(): Promise<boolean> {
        await this.getOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.getOtpButton.isDisplayed();
    }

    async isRequiredMobileMessageDisplayed(): Promise<boolean> {
        await this.requiredMobileMessage.waitForDisplayed({ timeout: 10_000 });
        return this.requiredMobileMessage.isDisplayed();
    }

    async isInvalidMobileMessageDisplayed(): Promise<boolean> {
        await this.invalidMobileMessage.waitForDisplayed({ timeout: 10_000 });
        return this.invalidMobileMessage.isDisplayed();
    }

    async enterMobileNumber(mobileNumber: string): Promise<void> {
        const field = await this.mobileNumberField;

        await field.waitForDisplayed({
            timeout: 10_000,
            timeoutMsg: 'Mobile login form is not visible. The app may already be signed in; log out first or enable AMDS_RESET_APP_DATA for a fresh login run.',
        });
        await field.click();
        await field.clearValue();
        await field.setValue(mobileNumber);
    }

    async tapGetOtp(): Promise<void> {
        if (await this.driver.isKeyboardShown()) await this.driver.hideKeyboard();
        await this.getOtpButton.waitForDisplayed({ timeout: 10_000 });
        await this.getOtpButton.click();
    }
}
