import { type Page } from "@playwright/test"
import { Pages, pageTitleIsValid } from "../utils/routes";
import { Credentials } from "../utils/user";

export const selectors = {
	form: () => "form#login-form",
	usernameInput: () => `${selectors.form()} input#loginform-username`,
	passwordInput: () => `${selectors.form()} input#loginform-password`,
	signInButton: () => `${selectors.form()} button[name='login-button']`
} as const;

export async function signIn(page: Page, credentials: Credentials): Promise<void> {
	// used type instead of fill because of fill don't lead to active signIn button
	await page.locator(selectors.usernameInput()).type(credentials.username);
	await page.locator(selectors.passwordInput()).type(credentials.password);
	
	await page.locator(selectors.signInButton()).click();
	
	await pageTitleIsValid(page, Pages.Main);
}
