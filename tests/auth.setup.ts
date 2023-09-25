import { test as setup, expect } from '@playwright/test';
import { loginPage, userInfo, cart } from "../components";

const mainPageTitle = "OK-Notes - Магазин блокнотов";

const authFile = 'playwright/.auth/user.json';

// todo: maybe move user info to separate file
const username = "test";
const password = "test";

setup('authorization', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector(loginPage.elements.form());

    await loginPage.signIn(page, username, password);

    await page.context().storageState({ path: authFile });

    await page.waitForSelector(userInfo.elements.container());

    await expect(await page.title()).toEqual(mainPageTitle);
    await expect(await userInfo.getUserName(page)).toEqual(username.toUpperCase());

    if (await cart.getCurrentItemsCount(page) !== "0") {
        await cart.cleanAll(page);
    }

    await expect(await cart.getCurrentItemsCount(page)).toEqual("0");
});
