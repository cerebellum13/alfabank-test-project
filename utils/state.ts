import { Locator, Page } from "@playwright/test";
import { WaitTime } from "../utils/types";

export enum NavElementState {
	Opened = "true",
	Closed = "false"
}

export async function getNavElementCurrentState(element: Locator): Promise<NavElementState> {
	return await element.getAttribute("aria-expanded") as NavElementState;
}

export async function waitForNavElementState(page: Page, element: Locator, expectedState: NavElementState){
	await page.waitForFunction(async () => {
		return await getNavElementCurrentState(element) === expectedState;
	}, {
		timeout: WaitTime.TwoSeconds,
	});
}
