import type { Browser } from 'webdriverio';

export class DashboardPage {
    constructor(private readonly driver: Browser) {}

    private get successLabel() {
        return this.driver.$('//*[contains(@text, "Select Service") or contains(@content-desc, "Select Service")]');
    }

    async isDisplayed(): Promise<boolean> {
        await this.successLabel.waitForDisplayed({ timeout: 20_000 });
        return this.successLabel.isDisplayed();
    }
}
