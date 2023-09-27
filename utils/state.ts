import { expect, Locator, Page } from "@playwright/test";
import { WaitTime } from "../utils/types";

export enum NavElementState {
	Opened = "true",
	Closed = "false"
}

export async function getNavElementCurrentState(page: Page, selector: string): Promise<NavElementState> {
	return await page.locator(selector).getAttribute("aria-expanded") as NavElementState;
}

export async function waitForNavElementState(page: Page, selector: string, expectedState: NavElementState){
	await expect(await page.locator(selector), {
		message: `Element ${await page.locator(selector).innerText()} didn't match ${expectedState ? "Opened" : "Closed"} state`
	}).toHaveAttribute("aria-expanded", expectedState, {
		timeout: WaitTime.ThreeSeconds
	});
}
