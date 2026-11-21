
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
    features: 'features/**/*.feature',
    steps: 'steps/**/*.ts',
});

export default defineConfig({
    testDir,
    timeout: 120_000,
    workers: 1,
    reporter: 'list',
    globalSetup: './utils/appium.global-setup.ts',
});
