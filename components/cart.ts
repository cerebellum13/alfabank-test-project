import {Page} from "@playwright/test";

export const elements = {
    container: () => "#basketContainer",
    dropdown: () => `${elements.container()} #dropdownBasket`,
    itemsCount: () => `${elements.container()} .basket-count-items`,
    cleanAll: () => "//*[text()='Очистить корзину']",
} as const;

export async function getCurrentItemsCount(page: Page) {
    return page.locator(elements.itemsCount()).innerText();
}

export async function cleanAll(page: Page) {
    await page.locator(elements.dropdown()).click();
    await page.locator(elements.cleanAll()).click();

    // todo: temporary solution
    await page.waitForTimeout(2000);
}
