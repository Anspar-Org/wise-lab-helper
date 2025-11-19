import { Page, expect } from '@playwright/test';

/**
 * Authentication helpers for E2E tests
 * These helpers provide reusable authentication flows for different user types
 */

export interface StudentCredentials {
  username: string;
  pin: string;
}

export interface StudentAnimalGridCredentials {
  username: string;
  animals: string[]; // Array of 4 animal names in order
}

export interface CoachCredentials {
  email: string;
  password: string;
}

/**
 * Login as a student using PIN authentication (Grades 3-5)
 * @param page - Playwright page object
 * @param username - Student username
 * @param pin - 4-digit PIN code
 */
export async function loginAsStudent(
  page: Page,
  username: string,
  pin: string
): Promise<void> {
  await page.goto('/login/student');

  // Fill in username
  await page.getByTestId('student-username-input').fill(username);
  await page.getByTestId('student-username-submit').click();

  // Wait for PIN entry screen
  await expect(page.getByTestId('pin-input-container')).toBeVisible();

  // Enter PIN (one digit at a time)
  const pinDigits = pin.split('');
  for (let i = 0; i < pinDigits.length; i++) {
    await page.getByTestId(`pin-digit-${i}`).fill(pinDigits[i]);
  }

  // Submit PIN
  await page.getByTestId('pin-submit').click();

  // Wait for successful login (redirect to dashboard)
  await expect(page).toHaveURL(/\/student\/dashboard/);

  // Verify auth token is stored
  const token = await getAuthToken(page);
  expect(token).toBeTruthy();
}

/**
 * Login as a student using animal grid authentication (Grades K-2)
 * @param page - Playwright page object
 * @param username - Student username
 * @param animals - Array of 4 animal names to select in order
 */
export async function loginAsStudentAnimalGrid(
  page: Page,
  username: string,
  animals: string[]
): Promise<void> {
  if (animals.length !== 4) {
    throw new Error('Animal grid requires exactly 4 animals');
  }

  await page.goto('/login/student');

  // Fill in username
  await page.getByTestId('student-username-input').fill(username);
  await page.getByTestId('student-username-submit').click();

  // Wait for animal grid
  await expect(page.getByTestId('animal-grid-container')).toBeVisible();

  // Select animals in order
  for (let i = 0; i < animals.length; i++) {
    await page.getByTestId(`animal-option-${animals[i].toLowerCase()}`).click();
  }

  // Submit selection
  await page.getByTestId('animal-grid-submit').click();

  // Wait for successful login
  await expect(page).toHaveURL(/\/student\/dashboard/);

  // Verify auth token is stored
  const token = await getAuthToken(page);
  expect(token).toBeTruthy();
}

/**
 * Login as a coach using email/password authentication
 * @param page - Playwright page object
 * @param email - Coach email address
 * @param password - Coach password
 */
export async function loginAsCoach(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login/coach');

  // Fill in email
  await page.getByTestId('coach-email-input').fill(email);

  // Fill in password
  await page.getByTestId('coach-password-input').fill(password);

  // Submit form
  await page.getByTestId('coach-login-submit').click();

  // Wait for successful login (redirect to dashboard)
  await expect(page).toHaveURL(/\/coach\/dashboard/);

  // Verify auth token is stored
  const token = await getAuthToken(page);
  expect(token).toBeTruthy();
}

/**
 * Logout from any account type
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  // Look for logout button (could be in nav or user menu)
  const logoutButton = page.getByTestId('logout-button');

  // If logout button is in a menu, open the menu first
  const userMenuButton = page.getByTestId('user-menu-button');
  if (await userMenuButton.isVisible()) {
    await userMenuButton.click();
  }

  // Click logout
  await logoutButton.click();

  // Wait for redirect to login page
  await expect(page).toHaveURL(/\/login/);

  // Verify token is removed
  const token = await getAuthToken(page);
  expect(token).toBeNull();
}

/**
 * Extract JWT auth token from localStorage
 * @param page - Playwright page object
 * @returns The auth token or null if not found
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });
  } catch (error) {
    // If localStorage is not accessible (e.g., page not loaded), return null
    return null;
  }
}

/**
 * Set auth token directly in localStorage (for testing authenticated states)
 * @param page - Playwright page object
 * @param token - JWT token to set
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  // Navigate to base URL first if not already there to avoid localStorage access errors
  const currentUrl = page.url();
  if (currentUrl === 'about:blank' || currentUrl.startsWith('file://') || currentUrl === '') {
    await page.goto('/');
  }

  await page.evaluate((tokenValue) => {
    localStorage.setItem('authToken', tokenValue);
  }, token);
}

/**
 * Clear all auth-related data from storage
 * @param page - Playwright page object
 */
export async function clearAuth(page: Page): Promise<void> {
  // Use Playwright's context methods to clear storage without needing to navigate
  await page.context().clearCookies();

  // Clear storage state completely - this is more reliable than page.evaluate
  await page.context().clearPermissions();

  // Only try to clear localStorage/sessionStorage if we're on a valid page
  const currentUrl = page.url();
  if (currentUrl && !currentUrl.startsWith('about:') && !currentUrl.startsWith('file://')) {
    try {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      // Ignore errors if page is not loaded yet - storage will be clear on next navigation
    }
  }
}

/**
 * Check if user is authenticated by verifying token presence
 * @param page - Playwright page object
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await getAuthToken(page);
  return token !== null && token.length > 0;
}

/**
 * Register a new student account
 * @param page - Playwright page object
 * @param username - Desired username
 * @param avatar - Avatar selection (e.g., 'robot', 'astronaut')
 * @param pin - 4-digit PIN or animal array for grid
 * @param grade - Student grade level (K-5)
 */
export async function registerStudent(
  page: Page,
  username: string,
  avatar: string,
  pin: string | string[],
  grade: string
): Promise<void> {
  await page.goto('/register/student');

  // Fill in username
  await page.getByTestId('register-username-input').fill(username);

  // Select avatar
  await page.getByTestId(`avatar-option-${avatar}`).click();

  // Select grade level
  await page.getByTestId('grade-select').selectOption(grade);

  // Handle PIN or animal grid based on grade
  if (typeof pin === 'string') {
    // PIN for grades 3-5
    const pinDigits = pin.split('');
    for (let i = 0; i < pinDigits.length; i++) {
      await page.getByTestId(`register-pin-digit-${i}`).fill(pinDigits[i]);
    }
    // Confirm PIN
    for (let i = 0; i < pinDigits.length; i++) {
      await page.getByTestId(`register-pin-confirm-digit-${i}`).fill(pinDigits[i]);
    }
  } else {
    // Animal grid for grades K-2
    if (pin.length !== 4) {
      throw new Error('Animal grid requires exactly 4 animals');
    }
    for (let i = 0; i < pin.length; i++) {
      await page.getByTestId(`register-animal-${i}`).click();
      await page.getByTestId(`animal-option-${pin[i].toLowerCase()}`).click();
    }
  }

  // Submit registration
  await page.getByTestId('register-submit').click();

  // Wait for successful registration (redirect to dashboard)
  await expect(page).toHaveURL(/\/student\/dashboard/);

  // Verify auth token is stored
  const token = await getAuthToken(page);
  expect(token).toBeTruthy();
}
