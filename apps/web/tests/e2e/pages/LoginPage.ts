import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Login Page
 * Handles both student and coach login flows
 */
export class LoginPage {
  readonly page: Page;

  // Student login elements
  readonly studentUsernameInput: Locator;
  readonly studentUsernameSubmit: Locator;
  readonly pinInputContainer: Locator;
  readonly pinSubmit: Locator;
  readonly animalGridContainer: Locator;
  readonly animalGridSubmit: Locator;

  // Coach login elements
  readonly coachEmailInput: Locator;
  readonly coachPasswordInput: Locator;
  readonly coachLoginSubmit: Locator;

  // Common elements
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Student login locators
    this.studentUsernameInput = page.getByTestId('student-username-input');
    this.studentUsernameSubmit = page.getByTestId('student-username-submit');
    this.pinInputContainer = page.getByTestId('pin-input-container');
    this.pinSubmit = page.getByTestId('pin-submit');
    this.animalGridContainer = page.getByTestId('animal-grid-container');
    this.animalGridSubmit = page.getByTestId('animal-grid-submit');

    // Coach login locators
    this.coachEmailInput = page.getByTestId('coach-email-input');
    this.coachPasswordInput = page.getByTestId('coach-password-input');
    this.coachLoginSubmit = page.getByTestId('coach-login-submit');

    // Common locators
    this.errorMessage = page.getByTestId('error-message');
    this.registerLink = page.getByTestId('register-link');
    this.forgotPasswordLink = page.getByTestId('forgot-password-link');
  }

  // Navigation methods
  async gotoStudentLogin() {
    await this.page.goto('/login/student');
    await expect(this.studentUsernameInput).toBeVisible();
  }

  async gotoCoachLogin() {
    await this.page.goto('/login/coach');
    await expect(this.coachEmailInput).toBeVisible();
  }

  // Student login actions
  async fillStudentUsername(username: string) {
    await this.studentUsernameInput.fill(username);
  }

  async submitStudentUsername() {
    await this.studentUsernameSubmit.click();
  }

  async fillPin(pin: string) {
    const pinDigits = pin.split('');
    for (let i = 0; i < pinDigits.length; i++) {
      await this.page.getByTestId(`pin-digit-${i}`).fill(pinDigits[i]);
    }
  }

  async submitPin() {
    await this.pinSubmit.click();
  }

  async selectAnimals(animals: string[]) {
    for (const animal of animals) {
      await this.page.getByTestId(`animal-option-${animal.toLowerCase()}`).click();
    }
  }

  async submitAnimalGrid() {
    await this.animalGridSubmit.click();
  }

  async loginAsStudentWithPin(username: string, pin: string) {
    await this.fillStudentUsername(username);
    await this.submitStudentUsername();
    await expect(this.pinInputContainer).toBeVisible();
    await this.fillPin(pin);
    await this.submitPin();
  }

  async loginAsStudentWithAnimalGrid(username: string, animals: string[]) {
    await this.fillStudentUsername(username);
    await this.submitStudentUsername();
    await expect(this.animalGridContainer).toBeVisible();
    await this.selectAnimals(animals);
    await this.submitAnimalGrid();
  }

  // Coach login actions
  async fillCoachEmail(email: string) {
    await this.coachEmailInput.fill(email);
  }

  async fillCoachPassword(password: string) {
    await this.coachPasswordInput.fill(password);
  }

  async submitCoachLogin() {
    await this.coachLoginSubmit.click();
  }

  async loginAsCoach(email: string, password: string) {
    await this.fillCoachEmail(email);
    await this.fillCoachPassword(password);
    await this.submitCoachLogin();
  }

  // Assertion methods
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectPinInputVisible() {
    await expect(this.pinInputContainer).toBeVisible();
  }

  async expectAnimalGridVisible() {
    await expect(this.animalGridContainer).toBeVisible();
  }

  async expectOnStudentLoginPage() {
    await expect(this.page).toHaveURL(/\/login\/student/);
    await expect(this.studentUsernameInput).toBeVisible();
  }

  async expectOnCoachLoginPage() {
    await expect(this.page).toHaveURL(/\/login\/coach/);
    await expect(this.coachEmailInput).toBeVisible();
  }
}
