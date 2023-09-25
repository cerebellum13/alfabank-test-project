import {expect, Page} from "@playwright/test";

export const elements = {
    container: () => "#dropdownUser",
    name: () => `${elements.container()} .text-uppercase`,
} as const;

export async function getUserName(page: Page) {
    return await page.locator(elements.name()).innerText()
}
