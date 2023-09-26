import { expect, Page } from "@playwright/test";
import { WaitTime } from "../utils/types";

export enum Pages {
	Main = "main",
	Login = "login",
	Basket = "baset"
}

export const urls = {
	[Pages.Main]: () => "/",
	[Pages.Login]: () => "/login",
	[Pages.Basket]: () => "/basket"
} as const;

export const titles = {
	[Pages.Main]: () => "OK-Notes - Магазин блокнотов",
	[Pages.Login]: () => "Авторизация",
	// maybe, page is not loaded
	[Pages.Basket]: () => "Корзина",
} as const;

export async function pageTitleIsValid(page: Page, url: Pages) {
	await expect(page, {
		message: `Page title is invalid. Expected: ${titles[url]()}, but received ${await page.title()}`
	}).toHaveTitle(titles[url](), {
		timeout: WaitTime.FiveSeconds,
	});
}

export async function openPage(page: Page, url: Pages) {
	await page.goto(urls[url]());
	
	await pageTitleIsValid(page, url);
}
