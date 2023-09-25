import { type Page } from "@playwright/test"

export const elements = {
	container: () => "#dropdownUser",
	name: () => `${elements.container()} .text-uppercase`
} as const

export async function getUserName(page: Page): Promise<string> {
	return await page.locator(elements.name()).innerText()
}
