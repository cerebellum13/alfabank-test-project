import {expect, test} from "@playwright/test";

test('case 1: go to empty cart', async ({ page }) => {
    // Given user is authorized
    // Given cart is empty

    // When click to cart icon
    // Then cart window pops up

    // When click "Go to cart" button
    // Then empty cart window open up
});

test('case 2: go to cart with 1 non-promotional item', async ({ page }) => {
    // user is authorized
    // cart is empty

    // When add one item to cart without discount
    // Then number '1' is displayed next to the basket

    // When click to cart icon
    // Then cart window is opened, indicating the price, product name, and total amount

    // When click "Go to cart" button
    // Then return to cart page
});

test('case 3: go to cart with 1 promotional item', async ({ page }) => {
    // Given user is authorized
    // Given cart is empty

    // When add one discounted item to cart
    // Then number '1' is displayed next to the basket

    // When click to cart icon
    // Then cart window is opened, indicating the price, product name, and total amount

    // When click "Go to cart" button
    // Then return to cart page
});

test('case 4: go to cart with 9 different items', async ({ page }) => {
    // Given user is authorized
    // Given 1 promotional item in the cart

    // When add 8 more different products to cart
    // Then number '9' is displayed next to the cart icon

    // When click to cart icon
    // Then cart window is opened, indicating the price, product name, and total amount

    // When click "Go to cart" button
    // Then return to cart page
});

test('case 5: go to cart with 9 promotional items of the same name', async ({ page }) => {
    // Given user is authorized
    // Given cart is empty

    // When add to cart 9 products of the same name at a discount
    // Then number '9' is displayed next to the cart icon

    // When click to cart icon
    // Then cart window is opened, indicating the price, product name, and total amount

    // When click "Go to cart" button
    // Then return to cart page
});
