import { type Page } from "@playwright/test"
import { Pages, pageTitleIsValid } from "../utils/routes";
import { Credentials } from "../utils/user";

export const selectors = {
	form: () => "form#login-form",
	usernameInput: () => `${selectors.form()} input#loginform-username`,
	passwordInput: () => `${selectors.form()} input#loginform-password`,
	signInButton: () => `${selectors.form()} button[name='login-button']`
} as const;

export const elements = {
	form: (page: Page) => page.locator(selectors.form()),
	usernameInput: (page: Page) => page.locator(selectors.usernameInput()),
	passwordInput: (page: Page) => page.locator(selectors.passwordInput()),
	signInButton: (page: Page) => page.locator(selectors.signInButton())
} as const;

export async function signIn(page: Page, credentials: Credentials): Promise<void> {
	// used type instead of fill because of fill don't lead to active signIn button
	await elements.usernameInput(page).type(credentials.username);
	await elements.passwordInput(page).type(credentials.password);
	
	await elements.signInButton(page).click();
	
	await pageTitleIsValid(page, Pages.Main);
}
