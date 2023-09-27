import { type Page } from "@playwright/test"
import { NavElementState, waitForNavElementState } from "../utils/state";

export const selectors = {
	icon: () => "#dropdownUser",
	username: () => `${selectors.icon()} .text-uppercase`
} as const;

export async function open(page: Page) {
	await page.locator(selectors.icon()).click();
	
	await waitForNavElementState(page, selectors.icon(), NavElementState.Opened);
}

export async function getUserName(page: Page): Promise<string> {
	return await page.locator(selectors.username()).innerText();
}
