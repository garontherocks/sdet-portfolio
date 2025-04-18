import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Percy Visual Snapshots - SauceDemo', () => {
  test('Home Page Snapshot', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await percySnapshot(page, 'SauceDemo Home');
  });
});
