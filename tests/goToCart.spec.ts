import { test } from "@playwright/test";
import { cartWindow, loginForm, products } from "../components";
import { openPage, Pages, pageTitleIsValid } from "../utils/routes";
import { credentials } from "../utils/user";
import * as fs from "fs";

export const testStorageFile = '.test/storage.json';

test.beforeEach(async ({page}) => {
	await openPage(page, Pages.Login);
	
	await loginForm.signIn(page, credentials);
	
	await page.waitForSelector(products.selectors.list());
	
	if (await cartWindow.getCurrentProductsCount(page) !== 0) {
		await cartWindow.cleanAllProducts(page);
	}
	
	await cartWindow.verifyCurrentProductsCount(page, 0);
});

test("case 1: go to empty cart", async ({page}) => {
	await cartWindow.goToCartPage(page);

	await pageTitleIsValid(page, Pages.Basket);
});

test("case 2: go to cart with 1 non-promotional item", async ({page}) => {
	await products.buyProduct(page, 1, false);
	await cartWindow.verifyContent(page);

	await cartWindow.goToCartPage(page);

	await pageTitleIsValid(page, Pages.Basket);
});

test("case 3: go to cart with 1 promotional item", async ({page}) => {
	// need to set withDiscount as optional param
	await products.buyProduct(page, 1, true);
	await cartWindow.verifyContent(page);

	await cartWindow.goToCartPage(page);

	await pageTitleIsValid(page, Pages.Basket);
});

test("case 4: go to cart with 9 different items", async ({page}) => {
	await products.buyProduct(page, 1, true);

	await products.buyProduct(page, 1);
	await products.buyProduct(page, 1);
	await products.buyProduct(page, 1, false);
	await products.buyProduct(page, 1, false);
	await products.buyProduct(page, 1, true);
	await products.buyProduct(page, 1, true);
	await products.buyProduct(page, 1, true);
	await products.buyProduct(page, 1);

	await cartWindow.verifyContent(page);

	await cartWindow.goToCartPage(page);

	await pageTitleIsValid(page, Pages.Basket);
});

test("case 5: go to cart with 9 promotional items with the same name", async ({page}) => {
	await products.buyProduct(page, 9, true);
	
	await cartWindow.verifyContent(page);
	
	await cartWindow.goToCartPage(page);
	
	await pageTitleIsValid(page, Pages.Basket);
});

test.afterAll(async () => {
	fs.unlinkSync(testStorageFile);
});
