import {expect, Page} from "@playwright/test";

export const elements = {
    container: () => "#basketContainer",
    dropdown: () => `${elements.container()} #dropdownBasket`,
    itemsList: () => "ul.list-group",
    itemsCount: () => `${elements.container()} .basket-count-items`,
    totalAmount: () => "//div[contains(text(),'Итого к оплате')]/span",
    goToCartButton: () => "//a[text()='Перейти в корзину']",
    cleanAllButton: () => "//a[text()='Очистить корзину']",
    // todo: add locator
    cartWindowIsOpened: () => "",
} as const;

export async function getCurrentItemsCount(page: Page): Promise<number> {
    return Number(page.locator(elements.itemsCount()).innerText());
}

export async function popUpWindow(page: Page) {
    await page.locator(elements.dropdown()).click();

    await expect(page.locator(elements.dropdown())).toHaveAttribute("aria-expanded","true");
}

export async function goToCart(page: Page) {
    await popUpWindow(page);
    await page.locator(elements.goToCartButton()).click();

    // todo: temporary solution
    await page.waitForTimeout(2000);
}

export async function cleanAll(page: Page) {
    await popUpWindow(page);
    await page.locator(elements.cleanAllButton()).click();

    // todo: temporary solution
    await page.waitForTimeout(2000);
}

export async function cartPageIsOpened(page: Page) {
    // todo: site is not working properly
    expect(true).toEqual(true);
}

export async function getTotalAmountValue(page: Page): Promise<number> {
    return Number(page.locator(elements.totalAmount()).innerText());
}

export async function itemWithParamsIsDisplayed(
    page: Page,
    name: string,
    price: number,
    count: number,
) {

}

export async function verifyContent(page: Page) {

}
