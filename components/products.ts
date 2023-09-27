import { type Page } from "@playwright/test"
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
		const itemDiscount = await products[i].locator(selectors.itemDiscount());
		if (await itemDiscount.innerText()) indexes.push(i);
	}
	
	return indexes;
}

async function getNonDiscountProductIndexes(page: Page) {
	const products = await getAllProductsOnPage(page);
	let indexes = [];
	
	for (let i = 0; i < products.length; i++) {
		const itemDiscount = await products[i].locator(selectors.itemDiscount());
		if (!(await itemDiscount.innerText())) indexes.push(i);
	}
	
	return indexes;
}

async function getProductListCountOnPage(page: Page): Promise<number> {
	return (await getAllProductsOnPage(page)).length;
}

async function getRandomNumber(max: number) {
	return Math.floor(Math.random() * max);
}

async function getRandomIndex(page: Page, withDiscount?: boolean) {
	let maxNumber;
	
	switch (withDiscount) {
		case true: {
			maxNumber = (await getDiscountProductIndexes(page)).length;
			break;
		}
		case false: {
			maxNumber = (await getNonDiscountProductIndexes(page)).length;
			break;
		}
		default: {
			maxNumber = await getProductListCountOnPage(page);
			break;
		}
	}
	
	return await getRandomNumber(maxNumber);
}

async function getProductByParams(page: Page, index: number, withDiscount?: boolean) {
	const productList = (await getAllProductsOnPage(page));
	switch (withDiscount) {
		case true: {
			return productList[(await getDiscountProductIndexes(page))[index]];
		}
		case false: {
			return productList[(await getNonDiscountProductIndexes(page))[index]];
		}
		default: {
			return productList[index];
		}
	}
}

async function getRandomProduct(page: Page, withDiscount?: boolean) {
	if (await getProductListCountOnPage(page) > 0) {
		const randomProductIndex = await getRandomIndex(page, withDiscount);
		
		const product = await getProductByParams(page, randomProductIndex, withDiscount);
		
		if (product === undefined) throw new Error(`Random product with index ${randomProductIndex} was not found.`);
		else return product;
		
	} else throw new Error("On page was not found any products.");
}

export async function buyProduct(page: Page, amount: number, withDiscount?: boolean) {
	const productsCount = await cartWindow.getCurrentProductsCount(page);
	
	const product = await getRandomProduct(page, withDiscount);
	
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
