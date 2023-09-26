import { Cookie, type Page } from "@playwright/test"
import * as fs from "fs";
import { testStorageFile } from "../tests/goToCart.spec";
import { cartWindow } from "../components";

export interface ProductInfo {
	name: string,
	price: number,
	amount: number,
	remainingCount?: number,
}

export const selectors = {
	list: () => "div.note-list",
	listItem: () => `${selectors.list()} .note-item`,
	itemDiscount: () => `.product_discount`,
	itemName: () => `.product_name`,
	itemPrice: () => `.product_price`,
	itemEnterCount: () => `input[name='product-enter-count']`,
	itemRemainingCount: () => `.product_count`,
	itemBuyButton: () => `button.actionBuyProduct`
} as const;

export const elements = {
	list: (page: Page) => page.locator(selectors.list()),
	itemDiscount: (page: Page) => page.locator(selectors.itemDiscount()),
	itemName: (page: Page) => page.locator(selectors.itemName()),
	itemPrice: (page: Page) => page.locator(selectors.itemPrice()),
	itemEnterCount: (page: Page) => page.locator(selectors.itemEnterCount()),
	itemRemainingCount: (page: Page) => page.locator(selectors.itemRemainingCount()),
	itemBuyButton: (page: Page) => page.locator(selectors.itemBuyButton())
} as const;

async function saveBoughtProductsInfo(page: Page, product: ProductInfo) {
	const newProductList = await getBoughtProductsInfo(page);
	newProductList.push(product);
	
	fs.writeFileSync(testStorageFile, JSON.stringify(newProductList), "utf-8");
}

export async function getBoughtProductsInfo(page: Page) {
	if (fs.existsSync(testStorageFile)) {
		return JSON.parse(fs.readFileSync(testStorageFile, "utf8"));
	} else return new Array();
}

async function getAllProductsOnPage(page: Page) {
	return await page.locator(selectors.listItem()).all();
}

async function getDiscountProductIndexes(page: Page) {
	const products = await getAllProductsOnPage(page);
	let indexes = [];
	
	for (let i = 0; i < products.length; i++) {
		if (await products[i].locator(selectors.itemDiscount())) indexes.push(i);
	}
	
	return indexes;
}

async function getNonDiscountProductIndexes(page: Page) {
	const products = await getAllProductsOnPage(page);
	let indexes = [];
	
	for (let i = 0; i < products.length; i++) {
		if (!(await products[i].locator(selectors.itemDiscount()))) indexes.push(i);
	}
	
	return indexes;
}

async function getProductListCountOnPage(page: Page): Promise<number> {
	return (await getAllProductsOnPage(page)).length;
}

async function getRandomNumber(max: number) {
	return Math.floor(Math.random() * max);
}

async function getRandomIndex(page: Page, searchInAllProducts: boolean, withDiscount: boolean) {
	console.log(searchInAllProducts + " " + withDiscount);
	const indexes =
		searchInAllProducts ? await getProductListCountOnPage(page) :
			withDiscount ? (await getDiscountProductIndexes(page)).length :
				(await getNonDiscountProductIndexes(page)).length;
	
	return await getRandomNumber(indexes);
}

async function getProductByParams(page: Page, index: number, searchInAllProducts: boolean, withDiscount: boolean) {
	const productList = (await getAllProductsOnPage(page));
	
	return searchInAllProducts ? productList[index] :
		withDiscount ? productList[(await getDiscountProductIndexes(page))[index]] :
			productList[(await getNonDiscountProductIndexes(page))[index]];
}

async function getRandomProduct(page: Page, searchInAllProducts: boolean = false, withDiscount: boolean = false) {
	if (await getProductListCountOnPage(page) > 0) {
		const randomProductIndex = await getRandomIndex(page, searchInAllProducts, withDiscount);
		console.log(randomProductIndex);
		
		const product = await getProductByParams(page, randomProductIndex, searchInAllProducts, withDiscount);
		
		if (product === undefined) throw new DOMException(`Random product with index ${randomProductIndex} was not found.`);
		else return product;
		
	} else throw new DOMException("On page was not found any products.");
}

async function findProductByName(page: Page, name: string) {
	const foundedProduct = (await getAllProductsOnPage(page)).find(async (el) =>
		await (await el.locator(selectors.itemName()))!.innerText() === name
	);
	
	if (foundedProduct === undefined) throw new DOMException(`Product with name ${name} was not found."`);
	else return foundedProduct;
}

export async function buyProduct(page: Page, searchInAllProject: boolean = true, withDiscount: boolean = false, amount: number = 1, name?: string) {
	const productsCount = await cartWindow.getCurrentProductsCount(page);
	
	const product = name ?
		await findProductByName(page, name) :
		await getRandomProduct(page, searchInAllProject, withDiscount);
	
	const itemName = await product.locator(selectors.itemName());
	const itemPrice = await product.locator(selectors.itemPrice());
	const itemRemainingCount = await (await product.locator(selectors.itemRemainingCount()));
	
	const productInfo = {
		name: await itemName.innerText(),
		price: Number((await itemPrice.innerText()).split(" ")[0]),
		amount: amount,
		remainingCount: Number(await itemRemainingCount.innerText())
	}
	
	await (await product.locator(selectors.itemEnterCount())).fill(amount.toString());
	await (await product.locator(selectors.itemBuyButton())).click();
	
	await saveBoughtProductsInfo(page, productInfo);
	await cartWindow.verifyCurrentProductsCount(page, productsCount + amount);
}
