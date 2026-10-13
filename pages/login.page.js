import { BasePage } from './base.page.js';

/**
 * LoginPage — WooCommerce My Account (login + register) at /my-account/.
 */
export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.goto('/my-account/');
  }

  get loginForm() {
    return this.page.locator(this.selectors.login.form);
  }

  get username() {
    return this.page.locator(this.selectors.login.username).first();
  }

  get password() {
    return this.page.locator(this.selectors.login.password).first();
  }

  get rememberMe() {
    return this.page.locator(this.selectors.login.rememberMe).first();
  }

  get submit() {
    return this.page.locator(this.selectors.login.submit).first();
  }

  get registerEmail() {
    return this.page.locator(this.selectors.login.registerEmail).first();
  }

  get registerSubmit() {
    return this.page.locator(this.selectors.login.registerSubmit).first();
  }

  get errorNotice() {
    return this.page.locator(this.selectors.login.error).first();
  }

  get successNotice() {
    return this.page.locator(this.selectors.login.success).first();
  }

  /** Submit the login form with the given credentials. */
  async login(username, password) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Submit the register form with a (throwaway) email address. */
  async register(email) {
    await this.registerEmail.fill(email);
    await this.registerSubmit.click();
  }
}


