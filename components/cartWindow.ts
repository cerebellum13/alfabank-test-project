import { expect, type Page } from "@playwright/test"
import { products } from "../components";
import { Pages, pageTitleIsValid } from "../utils/routes";
import { getNavElementCurrentState, NavElementState, waitForNavElementState } from "../utils/state";
import { WaitTime } from "../utils/types";

export const selectors = {
	container: () => "#basketContainer",
	icon: () => `${selectors.container()} #dropdownBasket`,
	productList: () => "ul.list-group",
	productCount: () => `${selectors.container()} .basket-count-items`,
	cartProduct: (name: string) => `//span[contains(text(),'${name}')]/parent::li`,
	productPrice: () => ".basket-item-price",
	productAmount: () => ".basket-item-count",
	totalCartPriceAmount: () => "//div[contains(text(),'Итого к оплате')]/span",
	goToCartPageButton: () => "//a[text()='Перейти в корзину']",
	cleanAllButton: () => "//a[text()='Очистить корзину']",
} as const;

async function open(page: Page) {
	await page.locator(selectors.icon()).click();
	
	await waitForNavElementState(page, selectors.icon(), NavElementState.Opened);
}

export async function goToCartPage(page: Page) {
	if(await getNavElementCurrentState(page, selectors.icon()) === NavElementState.Closed) {
		await open(page);
	}
	
	await page.locator(selectors.goToCartPageButton()).click();
	
	await pageTitleIsValid(page, Pages.Basket);
}

export async function cleanAllProducts(page: Page) {
	if(await getNavElementCurrentState(page, selectors.icon()) === NavElementState.Closed) {
		await open(page);
	}
	
	await page.locator(selectors.cleanAllButton()).click();
	
	await waitForNavElementState(page, selectors.icon(), NavElementState.Closed);
	await verifyCurrentProductsCount(page, 0);
}

export async function getCurrentProductsCount(page: Page) {
	return Number(await page.locator(selectors.productCount()).innerText());
}

export async function verifyCurrentProductsCount(page: Page, expectedCount: number) {
	await expect(await page.locator(selectors.productCount()), {
		message: `Brought products count should be ${expectedCount}, but received ${await page.locator(selectors.productCount())}`
	}).toContainText(expectedCount.toString(), {
		timeout: WaitTime.TwoSeconds,
	});
}

export async function getTotalCartAmount(page: Page): Promise<number> {
	if(await getNavElementCurrentState(page, selectors.icon()) === NavElementState.Closed) {
		await open(page);
	}
	
	return Number(await page.locator(selectors.totalCartPriceAmount()).innerText());
}

export async function getCartProductsList(page: Page) {
	if(await getNavElementCurrentState(page, selectors.icon()) === NavElementState.Closed) {
		await open(page);
	}
	
	return page.locator(selectors.productList());
}

export async function getProductInCartList(page: Page, name: string) {
	const list = await getCartProductsList(page);
	
	return list.locator(selectors.cartProduct(name));
}

export async function getProductInfoInCartList(page: Page, name: string): Promise<products.ProductInfo> {
	const item = await getProductInCartList(page, name);
	// second element of inner text is price
	const price = Number((await (await item.locator(selectors.productPrice())).innerText()).split(" ")[1]);
	const amount = Number(await (await item.locator(selectors.productAmount())).innerText());
	
	return {
		name: name,
		price: price,
		amount: amount,
	} as products.ProductInfo;
}

export async function verifyContent(page: Page) {
	const productsInfo = await products.getBoughtProductsInfo(page);
	
	console.log(productsInfo);
	
	let totalCartPrice = 0;
	for (const productsInfoElement of productsInfo) {
		const actualInfo = await getProductInfoInCartList(page, productsInfoElement.name);
		
		totalCartPrice += actualInfo.price;
		await expect(actualInfo).toEqual(actualInfo);
	}
	
	await expect(await getTotalCartAmount(page), {
		message: `Cart total amount should be ${totalCartPrice}, but actual amount is ${await getTotalCartAmount(page)}`
	}).toEqual(totalCartPrice);
}
