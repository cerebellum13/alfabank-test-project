import { type Page } from "@playwright/test"

// todo: maybe I can to remove duplicate page.locator and use only elements.[element-name]
export const elements = {
	form: () => "form#login-form",
	login: () => `${elements.form()} input#loginform-username`,
	password: () => `${elements.form()} input#loginform-password`,
	signIn: () => `${elements.form()} button[name='login-button']`
} as const

export async function signIn(page: Page, username: string, password: string): Promise<void> {
	// used type instead of fill because of fill don't lead to active signin button
	await page.locator(elements.login()).type(username)
	await page.locator(elements.password()).type(password)
	
	await page.locator(elements.signIn()).click()
}
