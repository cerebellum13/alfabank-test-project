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
	await products.buyProduct(page);
	await cartWindow.verifyContent(page);
	
	await cartWindow.goToCartPage(page);
	
	await pageTitleIsValid(page, Pages.Basket);
});

// test("case 3: go to cart with 1 promotional item", async ({page}) => {
// 	await products.addProductToCard(page, true);
// 	await expect(await cart.getCurrentItemsCount(page)).toEqual(1);
//
// 	await cart.popUpWindow(page);
// 	await cart.verifyContent(page);
//
// 	await cart.goToCart(page);
//
// 	await cart.cartPageIsOpened(page);
// });
//
// test("case 4: go to cart with 9 different items", async ({page}) => {
// 	await products.addProductToCard(page, true);
// 	// Given 1 promotional item in the cart
//
// 	// todo: needed exactly different items
// 	await products.addProductToCard(page, false, 8, false);
// 	await expect(await cart.getCurrentItemsCount(page)).toEqual(9);
//
// 	await cart.popUpWindow(page);
// 	await cart.verifyContent(page);
//
// 	await cart.goToCart(page);
//
// 	await cart.cartPageIsOpened(page);
// });
//
// test("case 5: go to cart with 9 promotional items of the same name", async ({page}) => {
// 	await products.addProductToCard(page, true, 9, true);
// 	await expect(await cart.getCurrentItemsCount(page)).toEqual(9);
//
// 	await cart.popUpWindow(page);
// 	// todo: add added notes json
// 	await cart.verifyContent(page);
//
// 	await cart.goToCart(page);
//
// 	await cart.cartPageIsOpened(page);
// });

test.afterAll(async () => {
	fs.unlinkSync(testStorageFile);
});
