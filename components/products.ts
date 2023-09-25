import { type Page } from "@playwright/test"

export interface ProductInfo {
	name: string,
	price: number,
	amount: number,
	remainingCount?: number,
}

export const selectors = {
	list: () => "div.note-list",
	listItem: () => `${selectors.list()} .note-item`,
	itemDiscount: () => `${selectors.listItem()} .product_discount`,
	itemName: () => `${selectors.listItem()} .product_name`,
	itemPrice: () => `${selectors.listItem()} .product_price`,
	itemEnterCount: () => `${selectors.listItem()} input[name='product-enter-count']`,
	itemRemainingCount: () => `${selectors.listItem()} .product_count`,
	itemBuyButton: () => `${selectors.listItem()} button.actionBuyProduct`
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

async function saveBoughtProductInfo(page: Page, product: ProductInfo) {
	const cookies = await page.context().cookies();
	const testProducts = cookies.find(el => el.name === "testProducts");
	const savedProductList = testProducts ? JSON.parse(testProducts.value) : {};
	
	const newProductList = {
		...savedProductList,
		product
	};
	
	await page.context().addCookies([{
		name: "testProducts",
		value: newProductList.toString()
	}]);
}

async function getAllProductsOnPage(page: Page) {
	return await page.$$(selectors.listItem());
}

async function getDiscountProductIndexes(page: Page) {
	const products = await getAllProductsOnPage(page);
	let indexes = [];
	
	for (let i = 0; i < products.length; i++) {
		if (await products[i].$(selectors.itemDiscount())) indexes.push(i);
	}
	
	return indexes;
}

async function getProductListCountOnPage(page: Page): Promise<number> {
	return (await getAllProductsOnPage(page)).length;
}

async function getRandomIndex(max: number) {
	return Math.floor(Math.random() * max);
}

async function getRandomProduct(page: Page, withDiscount: boolean = false) {
	if (await getProductListCountOnPage(page) > 0) {
		const randomProductIndex = await getRandomIndex(
			withDiscount ?
				(await getDiscountProductIndexes(page)).length :
				(await getAllProductsOnPage(page)).length
		);
		
		const product = (await getAllProductsOnPage(page))[
			withDiscount ?
				(await getDiscountProductIndexes(page))[randomProductIndex] :
				randomProductIndex
			];
		
		if(product === undefined) throw new DOMException(`Random product with index ${randomProductIndex} was not found.`);
		else return product;
	} else throw new DOMException("On page was not found any products.");
}

async function findProductByName(page: Page, name: string) {
	const foundedProduct = (await getAllProductsOnPage(page)).find(async (el) =>
		await (await el.$(selectors.itemName()))!.innerText() === name
	);
	
	if (foundedProduct === undefined) throw new DOMException(`Product with name ${name} was not found."`);
	else return foundedProduct;
}

async function buyProduct(page: Page, withDiscount: boolean = false, amount: number = 1, name?: string, ) {
	let productInfo: ProductInfo;
	
	if (name) {
		const product = await findProductByName(page, name);
		
		productInfo = {
			name: name,
			price: Number(await (await product.$(selectors.itemPrice()))?.innerText()),
			amount: amount,
			remainingCount: Number(await (await product.$(selectors.itemRemainingCount()))?.innerText())
		};
		
		await (await product.$(selectors.itemEnterCount()))?.type(amount.toString());
		await (await product.$(selectors.itemBuyButton()))?.click();
	}
	
	const product = await getRandomProduct(page, withDiscount);
	
	productInfo = {
		name: await (await product.$(selectors.itemName()))!.innerText(),
		price: Number(await (await product.$(selectors.itemPrice()))?.innerText()),
		amount: amount,
		remainingCount: Number(await (await product.$(selectors.itemRemainingCount()))?.innerText())
	}
	
	await saveBoughtProductInfo(page, productInfo);
}
