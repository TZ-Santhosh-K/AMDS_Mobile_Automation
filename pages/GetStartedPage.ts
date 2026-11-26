import type { Browser } from 'webdriverio';

export class GetStartedPage {
    constructor(private readonly driver: Browser) {}

    private get loginSuccessMessage() {
        return this.driver.$(
            "//*[contains(translate(@text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'login successful') or contains(translate(@content-desc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'login successful')]",
        );
    }

    private get getStartedButton() {
        return this.driver.$(
            "//*[contains(translate(@text, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'get started') or contains(translate(@content-desc, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'get started')]",
        );
    }

    async isLoginSuccessDisplayed(): Promise<boolean> {
        await this.loginSuccessMessage.waitForDisplayed({ timeout: 20_000 });
        return this.loginSuccessMessage.isDisplayed();
    }

    async isDisplayed(): Promise<boolean> {
        await this.getStartedButton.waitForDisplayed({ timeout: 20_000 });
        return this.getStartedButton.isDisplayed();
    }

    async tap(): Promise<void> {
        await this.getStartedButton.waitForDisplayed({ timeout: 20_000 });
        await this.getStartedButton.waitForEnabled({ timeout: 10_000 });
        await this.getStartedButton.click();
    }
}
