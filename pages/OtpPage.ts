import type { Browser } from 'webdriverio';

export class OtpPage {
    private static readonly otpLength = 6;

    private readonly driver: Browser;

    constructor(driver: Browser) {
        this.driver = driver;
    }

    private get otpHeading() {
        return this.driver.$('~Sent you an OTP!');
    }

    private get otpInputFields() {
        return this.driver.$$('//android.widget.EditText');
    }

    private get resendOtpButton() {
        return this.driver.$(
            '//*[contains(@text, "Resend code") or contains(@content-desc, "Resend code")]'
        );
    }

    private get verifyOtpButton() {
        return this.driver.$('~Verify OTP');
    }

    private get invalidOtpMessage() {
        return this.driver.$(
            "//*[contains(translate(@text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'invalid otp') or contains(translate(@content-desc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'invalid otp') or contains(translate(@text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'incorrect otp') or contains(translate(@content-desc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'incorrect otp')]",
        );
    }

    async isOtpScreenDisplayed(): Promise<boolean> {
        await this.otpHeading.waitForDisplayed({ timeout: 10_000 });
        return this.otpHeading.isDisplayed();
    }

    async getOtpInputCount(): Promise<number> {
        await this.otpHeading.waitForDisplayed({ timeout: 10_000 });
        const fields = await this.otpInputFields;
        return fields.length;
    }

    async isResendOtpDisplayed(): Promise<boolean> {
        await this.resendOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.resendOtpButton.isDisplayed();
    }

    async isResendOtpEnabled(): Promise<boolean> {
        await this.resendOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.resendOtpButton.isEnabled();
    }

    async waitForResendOtpDisabled(timeoutMs = 10_000): Promise<void> {
        await this.driver.waitUntil(async () => {
            try {
                return !(await this.resendOtpButton.isEnabled());
            } catch {
                return false;
            }
        }, {
            timeout: timeoutMs,
            interval: 500,
            timeoutMsg: 'Resend OTP did not become unavailable after sending a new code.',
        });
    }

    async waitForResendOtpEnabled(timeoutMs = 70_000): Promise<void> {
        await this.driver.waitUntil(async () => {
            try {
                return await this.resendOtpButton.isEnabled();
            } catch {
                return false;
            }
        }, {
            timeout: timeoutMs,
            interval: 1_000,
            timeoutMsg: 'Resend OTP did not become available after the one-minute cooldown.',
        });
    }

    async tapResendOtp(): Promise<void> {
        await this.resendOtpButton.waitForDisplayed({ timeout: 10_000 });
        await this.resendOtpButton.waitForEnabled({ timeout: 5_000 });
        await this.resendOtpButton.click();
    }

    async isVerifyOtpDisplayed(): Promise<boolean> {
        await this.verifyOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.verifyOtpButton.isDisplayed();
    }

    async isInvalidOtpMessageDisplayed(): Promise<boolean> {
        await this.invalidOtpMessage.waitForDisplayed({ timeout: 10_000 });
        return this.invalidOtpMessage.isDisplayed();
    }

    private async readEnteredOtp(): Promise<string> {
        const values: string[] = [];
        for (const field of await this.otpInputFields) {
            values.push(await field.getText());
        }
        return values.join('');
    }

    async enterOtpDigits(otp: string): Promise<void> {
        if (!/^\d{1,6}$/.test(otp)) {
            throw new Error(`OTP input must contain between 1 and ${OtpPage.otpLength} digits.`);
        }

        await this.otpHeading.waitForDisplayed({ timeout: 10_000 });
        await this.driver.waitUntil(async () => {
            const count = (await this.otpInputFields).length;
            return count === 1 || count === OtpPage.otpLength;
        }, { timeout: 10_000, timeoutMsg: 'Expected one or six editable OTP fields.' });
        const fields = await this.otpInputFields;

        for (const field of fields) {
            await field.waitForDisplayed({ timeout: 10_000 });
        }

        if (fields.length === 1) {
            const [field] = fields;
            if (!field) throw new Error('The OTP input field is unavailable.');
            await field.click();
            await field.clearValue();
            await field.setValue(otp);
        } else if (fields.length === OtpPage.otpLength) {
            for (let index = 0; index < OtpPage.otpLength; index += 1) {
                const field = fields[index];
                const digit = otp[index];
                if (!field) throw new Error(`OTP input field ${index + 1} is unavailable.`);
                await field.click();
                await field.clearValue();
                if (digit !== undefined) await field.setValue(digit);
            }
        } else {
            throw new Error(`Expected one or six OTP fields, found ${fields.length}.`);
        }

        if (await this.readEnteredOtp() !== otp) {
            for (let index = 0; index < fields.length; index += 1) {
                const field = (await this.otpInputFields)[index];
                if (!field) throw new Error('OTP field layout changed during entry.');
                await field.click();
                await field.clearValue();
                const digits = fields.length === 1 ? otp : otp.charAt(index);
                for (const digit of digits) {
                    await this.driver.pressKeyCode(7 + Number(digit));
                }
            }
        }

        await this.driver.waitUntil(async () => await this.readEnteredOtp() === otp, {
            timeout: 5_000,
            timeoutMsg: 'OTP input values did not match the digits entered.',
        });
    }

    async isVerifyOtpEnabled(): Promise<boolean> {
        await this.verifyOtpButton.waitForDisplayed({ timeout: 10_000 });
        return this.verifyOtpButton.isEnabled();
    }

    async submitOtpIfEnabled(): Promise<void> {
        if (!(await this.isVerifyOtpEnabled())) return;
        if (await this.driver.isKeyboardShown()) await this.driver.hideKeyboard();
        await this.verifyOtpButton.click();
    }

    async enterOtpAndSubmit(otp: string): Promise<void> {
        if (otp.length !== OtpPage.otpLength || !/^\d{6}$/.test(otp)) {
            throw new Error(`The OTP must contain exactly ${OtpPage.otpLength} digits.`);
        }

        await this.enterOtpDigits(otp);
        if (await this.driver.isKeyboardShown()) await this.driver.hideKeyboard();
        await this.verifyOtpButton.waitForDisplayed({ timeout: 10_000 });
        await this.verifyOtpButton.waitForEnabled({ timeout: 10_000 });
        await this.verifyOtpButton.click();
    }
}
