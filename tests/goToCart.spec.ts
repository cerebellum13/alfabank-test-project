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
	await products.buyProduct(page, false, false);
	await cartWindow.verifyContent(page);

	await cartWindow.goToCartPage(page);

	await pageTitleIsValid(page, Pages.Basket);
});

test("case 3: go to cart with 1 promotional item", async ({page}) => {
	// todo: searchInAllProjects is not valid if we find discount or non-discount products
	// need to set withDiscount as optional param
	await products.buyProduct(page, false, true);
	await cartWindow.verifyContent(page);

	await cartWindow.goToCartPage(page);

	await pageTitleIsValid(page, Pages.Basket);
});

test("case 4: go to cart with 9 different items", async ({page}) => {
	await products.buyProduct(page, false, true);

	await products.buyProduct(page, true);
	await products.buyProduct(page, true);
	await products.buyProduct(page, false, false);
	await products.buyProduct(page, false, false);
	await products.buyProduct(page, false, true);
	await products.buyProduct(page, false, true);
	await products.buyProduct(page, false, true);
	await products.buyProduct(page, true);

	await cartWindow.verifyContent(page);
	// todo: verify total sum also

	await cartWindow.goToCartPage(page);

	await pageTitleIsValid(page, Pages.Basket);
});

test("case 5: go to cart with 9 promotional items of the same name", async ({page}) => {
	// todo: name should be replaced with the same name
	await products.buyProduct(page, false, true, 9, "Творческий беспорядок");
	
	await cartWindow.verifyContent(page);
	
	await cartWindow.goToCartPage(page);
	
	await pageTitleIsValid(page, Pages.Basket);
});

test.afterAll(async () => {
	fs.unlinkSync(testStorageFile);
});
