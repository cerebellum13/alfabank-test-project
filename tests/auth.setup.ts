import { expect, test as setup } from "@playwright/test"
import { cartWindow, loginForm, products, userWindow } from "../components"
import { Pages, openPage } from "../utils/routes";
import { credentials } from "../utils/user";

const authFile = ".auth/user.json";

setup("authorization", async ({page}) => {
	await openPage(page, Pages.Login);
	
	await loginForm.signIn(page, credentials);
	
	await page.context().storageState({path: authFile});
	
	await page.waitForSelector(products.selectors.list());
	
	if (await cartWindow.getCurrentProductsCount(page) !== 0) {
		await cartWindow.cleanAllProducts(page);
	}
	
	await expect(await cartWindow.getCurrentProductsCount(page)).toEqual(0);
})
