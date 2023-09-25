import { expect, test, Page } from "@playwright/test";
import { cart, notes } from "../components";

test("case 1: go to empty cart", async ({page}) => {
	await cart.popUpWindow(page);
	
	await cart.goToCart(page);
	
	// todo: move all 'expects' to test layer
	await cart.cartPageIsOpened(page);
});

test("case 2: go to cart with 1 non-promotional item", async ({page}) => {
	await notes.addNoteToCard(page, false);
	await expect(await cart.getCurrentItemsCount(page)).toEqual(1);
	
	await cart.popUpWindow(page);
	await cart.verifyContent(page);
	
	await cart.goToCart(page);
	
	await cart.cartPageIsOpened(page);
});

test("case 3: go to cart with 1 promotional item", async ({page}) => {
	await notes.addNoteToCard(page, true);
	await expect(await cart.getCurrentItemsCount(page)).toEqual(1);
	
	await cart.popUpWindow(page);
	await cart.verifyContent(page);
	
	await cart.goToCart(page);
	
	await cart.cartPageIsOpened(page);
});

test("case 4: go to cart with 9 different items", async ({page}) => {
	await notes.addNoteToCard(page, true);
	// Given 1 promotional item in the cart
	
	// todo: needed exactly different items
	await notes.addNoteToCard(page, false, 8, false);
	await expect(await cart.getCurrentItemsCount(page)).toEqual(9);
	
	await cart.popUpWindow(page);
	await cart.verifyContent(page);
	
	await cart.goToCart(page);
	
	await cart.cartPageIsOpened(page);
});

test("case 5: go to cart with 9 promotional items of the same name", async ({page}) => {
	await notes.addNoteToCard(page, true, 9, true);
	await expect(await cart.getCurrentItemsCount(page)).toEqual(9);
	
	await cart.popUpWindow(page);
	// todo: add added notes json
	await cart.verifyContent(page);
	
	await cart.goToCart(page);
	
	await cart.cartPageIsOpened(page);
});
