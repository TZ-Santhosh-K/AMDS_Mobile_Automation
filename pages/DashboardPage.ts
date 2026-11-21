import type { Browser } from 'webdriverio';

export class DashboardPage {
    constructor(private readonly driver: Browser) {}

    private get successLabel() {
        return this.driver.$('//*[contains(@text, "Successfully logged") or contains(@content-desc, "Successfully logged")]');
    }

    async isDisplayed(): Promise<boolean> {
        await this.successLabel.waitForDisplayed({ timeout: 20_000 });
        return this.successLabel.isDisplayed();
    }
}
