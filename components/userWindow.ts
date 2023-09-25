import { type Page } from "@playwright/test"
import { NavElementState, waitForNavElementState } from "../utils/state";

export const selectors = {
	icon: () => "#dropdownUser",
	username: () => `${selectors.icon()} .text-uppercase`
} as const;

export const elements = {
	icon: (page: Page) => page.locator(selectors.icon()),
	username: (page: Page) => page.locator(selectors.username())
} as const;

export async function open(page: Page) {
	await elements.icon(page).click();
	
	await waitForNavElementState(page, elements.icon(page), NavElementState.Opened);
}

export async function getUserName(page: Page): Promise<string> {
	return await elements.username(page).innerText();
}
