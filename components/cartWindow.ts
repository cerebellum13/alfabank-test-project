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
	productAmount: () => "basket-item-count",
	totalCartPriceAmount: () => "//div[contains(text(),'Итого к оплате')]/span",
	goToCartPageButton: () => "//a[text()='Перейти в корзину']",
	cleanAllButton: () => "//a[text()='Очистить корзину']",
} as const;

export const elements = {
	container: (page: Page) => page.locator(selectors.container()),
	icon: (page: Page) => page.locator(selectors.icon()),
	productList: (page: Page) => page.locator(selectors.productList()),
	productCount: (page: Page) => page.locator(selectors.productCount()),
	totalCartPriceAmount: (page: Page) => page.locator(selectors.totalCartPriceAmount()),
	goToCartButton: (page: Page) => page.locator(selectors.goToCartPageButton()),
	cleanAllButton: (page: Page) => page.locator(selectors.cleanAllButton()),
} as const;

async function open(page: Page) {
	await elements.icon(page).click();
	
	await waitForNavElementState(page, elements.icon(page), NavElementState.Opened);
}

export async function goToCartPage(page: Page) {
	if(await getNavElementCurrentState(elements.icon(page)) === NavElementState.Closed) {
		await open(page);
	}
	
	await elements.goToCartButton(page).click();
	
	await pageTitleIsValid(page, Pages.Basket);
}

export async function cleanAllProducts(page: Page) {
	if(await getNavElementCurrentState(elements.icon(page)) === NavElementState.Closed) {
		await open(page);
	}
	
	await elements.cleanAllButton(page).click();
	
	await waitForNavElementState(page, elements.icon(page), NavElementState.Closed);
	await verifyCurrentProductsCount(page, 0);
}

export async function getCurrentProductsCount(page: Page) {
	return Number(await (await elements.productCount(page)).innerText());
}

export async function verifyCurrentProductsCount(page: Page, expectedCount: number) {
	await expect(await elements.productCount(page)).toContainText(expectedCount.toString(), {
		timeout: WaitTime.TwoSeconds,
	});
}

export async function getTotalCartAmount(page: Page): Promise<number> {
	if(await getNavElementCurrentState(elements.icon(page)) === NavElementState.Closed) {
		await open(page);
	}
	
	return Number(await elements.totalCartPriceAmount(page).innerText());
}

export async function getCartProductsList(page: Page) {
	if(await getNavElementCurrentState(elements.icon(page)) === NavElementState.Closed) {
		await open(page);
	}
	
	return elements.productList(page);
}

export async function getProductInCartList(page: Page, name: string) {
	const list = await getCartProductsList(page);
	
	return list.locator(selectors.cartProduct(name));
}

export async function getProductInfoInCartList(page: Page, name: string): Promise<products.ProductInfo> {
	const item = await getProductInCartList(page, name);
	// second element of inner text is price
	const price = Number((await item.locator(selectors.productPrice()).innerText()).split(" ")[2]);
	const amount = Number(item.locator(selectors.productAmount()).innerText());
	
	return {
		name: name,
		price: price,
		amount: amount,
	} as products.ProductInfo;
}

export async function verifyContent(page: Page) {
	const productsInfo = await products.getBoughtProductsInfo(page);
	
	for (const productsInfoElement of productsInfo) {
		const actualInfo = await getProductInfoInCartList(page, productsInfoElement.name);
		
		await expect(actualInfo).toEqual(actualInfo);
	}
}
