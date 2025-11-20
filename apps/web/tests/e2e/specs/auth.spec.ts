import { test, expect } from '../fixtures';
import {
  loginAsStudent,
  loginAsStudentAnimalGrid,
  loginAsCoach,
  logout,
  isAuthenticated,
  clearAuth,
} from '../helpers/auth';

/**
 * Authentication E2E Tests
 * Tests for student and coach login/logout flows with real API
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await clearAuth(page);
  });

  test.describe('Student Authentication', () => {
    test('should display student login page correctly', async ({ loginPage }) => {
      await loginPage.gotoStudentLogin();
      await loginPage.expectOnStudentLoginPage();
      await expect(loginPage.studentUsernameInput).toBeVisible();
      await expect(loginPage.studentUsernameSubmit).toBeVisible();
    });

    test('should allow student to login with PIN (Grades 3-5)', async ({ page, loginPage, studentDashboard }) => {
      await loginPage.gotoStudentLogin();

      // Enter username
      await loginPage.fillStudentUsername('testStudent1');
      await loginPage.submitStudentUsername();

      // Verify PIN input is shown
      await loginPage.expectPinInputVisible();

      // Enter PIN
      await loginPage.fillPin('1234');
      await loginPage.submitPin();

      // Verify redirect to dashboard
      await studentDashboard.expectLoggedIn();
      await studentDashboard.expectWelcomeMessage('testStudent1');

      // Verify authenticated
      expect(await isAuthenticated(page)).toBe(true);
    });

    test('should allow student to login with animal grid (Grades K-2)', async ({ page, loginPage, studentDashboard }) => {
      await loginPage.gotoStudentLogin();

      // Enter username
      await loginPage.fillStudentUsername('youngLearner');
      await loginPage.submitStudentUsername();

      // Verify animal grid is shown
      await loginPage.expectAnimalGridVisible();

      // Select animals in sequence
      await loginPage.selectAnimals(['cat', 'dog', 'bird', 'fish']);
      await loginPage.submitAnimalGrid();

      // Verify redirect to dashboard
      await studentDashboard.expectLoggedIn();

      // Verify authenticated
      expect(await isAuthenticated(page)).toBe(true);
    });

    test('should show error on invalid student PIN', async ({ loginPage }) => {
      await loginPage.gotoStudentLogin();

      // Enter username
      await loginPage.fillStudentUsername('testStudent1');
      await loginPage.submitStudentUsername();

      // Enter wrong PIN
      await loginPage.fillPin('9999');
      await loginPage.submitPin();

      // Verify error message
      await loginPage.expectErrorMessage('Invalid');
    });

    test('should allow student self-registration', async ({ page }) => {
      await page.goto('/register/student');

      // Fill registration form
      await page.getByTestId('register-username-input').fill('newStudent');
      await page.getByTestId('avatar-option-robot').click();
      await page.getByTestId('grade-select').selectOption('3');

      // Set PIN
      await page.getByTestId('register-pin-digit-0').fill('5');
      await page.getByTestId('register-pin-digit-1').fill('6');
      await page.getByTestId('register-pin-digit-2').fill('7');
      await page.getByTestId('register-pin-digit-3').fill('8');

      // Confirm PIN
      await page.getByTestId('register-pin-confirm-digit-0').fill('5');
      await page.getByTestId('register-pin-confirm-digit-1').fill('6');
      await page.getByTestId('register-pin-confirm-digit-2').fill('7');
      await page.getByTestId('register-pin-confirm-digit-3').fill('8');

      // Submit registration
      await page.getByTestId('register-submit').click();

      // Verify redirect to dashboard
      await expect(page).toHaveURL(/\/student\/dashboard/);

      // Verify authenticated
      expect(await isAuthenticated(page)).toBe(true);
    });

    test('should redirect unauthenticated student to login', async ({ page }) => {
      // Try to access protected route without auth
      await page.goto('/student/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Coach Authentication', () => {
    test('should display coach login page correctly', async ({ loginPage }) => {
      await loginPage.gotoCoachLogin();
      await loginPage.expectOnCoachLoginPage();
      await expect(loginPage.coachEmailInput).toBeVisible();
      await expect(loginPage.coachPasswordInput).toBeVisible();
      await expect(loginPage.coachLoginSubmit).toBeVisible();
    });

    test('should allow coach to login with email/password', async ({ page, loginPage, coachDashboard }) => {
      await loginPage.gotoCoachLogin();

      // Enter credentials
      await loginPage.fillCoachEmail('coach1@test.com');
      await loginPage.fillCoachPassword('TestPassword123!');
      await loginPage.submitCoachLogin();

      // Verify redirect to dashboard
      await coachDashboard.expectLoggedIn();
      await coachDashboard.expectWelcomeMessage('Coach Smith');

      // Verify authenticated
      expect(await isAuthenticated(page)).toBe(true);
    });

    test('should show error on invalid coach credentials', async ({ loginPage }) => {
      await loginPage.gotoCoachLogin();

      // Enter wrong credentials
      await loginPage.fillCoachEmail('wrong@test.com');
      await loginPage.fillCoachPassword('WrongPassword');
      await loginPage.submitCoachLogin();

      // Verify error message
      await loginPage.expectErrorMessage('Invalid');
    });

    test('should redirect unauthenticated coach to login', async ({ page }) => {
      // Try to access protected route without auth
      await page.goto('/coach/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Logout', () => {
    test('should allow student to logout', async ({ page, studentDashboard }) => {
      // Login first
      await loginAsStudent(page, 'testStudent1', '1234');
      await studentDashboard.expectLoggedIn();

      // Logout
      await studentDashboard.logout();

      // Verify redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Verify not authenticated
      expect(await isAuthenticated(page)).toBe(false);
    });

    test('should allow coach to logout', async ({ page, coachDashboard }) => {
      // Login first
      await loginAsCoach(page, 'coach1@test.com', 'TestPassword123!');
      await coachDashboard.expectLoggedIn();

      // Logout
      await coachDashboard.logout();

      // Verify redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Verify not authenticated
      expect(await isAuthenticated(page)).toBe(false);
    });

    test('should clear auth token on logout', async ({ page }) => {
      // Login
      await loginAsStudent(page, 'testStudent1', '1234');

      // Verify token exists
      expect(await isAuthenticated(page)).toBe(true);

      // Logout
      await logout(page);

      // Verify token is cleared
      expect(await isAuthenticated(page)).toBe(false);
    });
  });

  test.describe('Session Persistence', () => {
    test('should persist student session across page reloads', async ({ page, studentDashboard }) => {
      // Login
      await loginAsStudent(page, 'testStudent1', '1234');
      await studentDashboard.expectLoggedIn();

      // Reload page
      await page.reload();

      // Should still be logged in
      await studentDashboard.expectLoggedIn();
      expect(await isAuthenticated(page)).toBe(true);
    });

    test('should persist coach session across page reloads', async ({ page, coachDashboard }) => {
      // Login
      await loginAsCoach(page, 'coach1@test.com', 'TestPassword123!');
      await coachDashboard.expectLoggedIn();

      // Reload page
      await page.reload();

      // Should still be logged in
      await coachDashboard.expectLoggedIn();
      expect(await isAuthenticated(page)).toBe(true);
    });
  });

  test.describe('Protected Routes', () => {
    test('should protect student routes from unauthenticated access', async ({ page }) => {
      const protectedRoutes = [
        '/student/dashboard',
        '/student/lessons',
        '/student/notebook',
        '/student/skills',
        '/student/badges',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('should protect coach routes from unauthenticated access', async ({ page }) => {
      const protectedRoutes = [
        '/coach/dashboard',
        '/coach/students',
        '/coach/assessments',
        '/coach/reports',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('should prevent students from accessing coach routes', async ({ page }) => {
      // Login as student
      await loginAsStudent(page, 'testStudent1', '1234');

      // Try to access coach route
      await page.goto('/coach/dashboard');

      // Should redirect to student dashboard or show error
      await expect(page).toHaveURL(/\/(student\/dashboard|login|error)/);
    });

    test('should prevent coaches from accessing student routes', async ({ page }) => {
      // Login as coach
      await loginAsCoach(page, 'coach1@test.com', 'TestPassword123!');

      // Try to access student route
      await page.goto('/student/dashboard');

      // Should redirect to coach dashboard or show error
      await expect(page).toHaveURL(/\/(coach\/dashboard|login|error)/);
    });
  });
});
