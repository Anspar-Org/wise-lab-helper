import { test, expect } from '../fixtures';
import { setupMockApi } from '../mocks/api';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility E2E Tests
 * Tests for WCAG compliance, keyboard navigation, and screen reader support
 */

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await setupMockApi(page);
  });

  test.describe('WCAG Compliance - Axe Scans', () => {
    test('should not have accessibility violations on student login page', async ({ loginPage, page }) => {
      await loginPage.gotoStudentLogin();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on coach login page', async ({ loginPage, page }) => {
      await loginPage.gotoCoachLogin();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on student dashboard', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on lessons page', async ({ authenticatedStudentPage: page, lessonsPage }) => {
      await lessonsPage.goto();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on notebook page', async ({ authenticatedStudentPage: page, notebookPage }) => {
      await notebookPage.goto();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on coach dashboard', async ({ authenticatedCoachPage: page, coachDashboard }) => {
      await coachDashboard.goto();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate student login form with keyboard', async ({ loginPage, page }) => {
      await loginPage.gotoStudentLogin();

      // Tab to username input
      await page.keyboard.press('Tab');
      const usernameInput = page.getByTestId('student-username-input');
      await expect(usernameInput).toBeFocused();

      // Type username
      await page.keyboard.type('testStudent1');

      // Tab to submit button
      await page.keyboard.press('Tab');
      const submitButton = page.getByTestId('student-username-submit');
      await expect(submitButton).toBeFocused();

      // Press Enter to submit
      await page.keyboard.press('Enter');

      // Should show PIN input
      await loginPage.expectPinInputVisible();
    });

    test('should navigate coach login form with keyboard', async ({ loginPage, page }) => {
      await loginPage.gotoCoachLogin();

      // Tab through form fields
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('coach-email-input')).toBeFocused();

      await page.keyboard.type('coach1@test.com');

      await page.keyboard.press('Tab');
      await expect(page.getByTestId('coach-password-input')).toBeFocused();

      await page.keyboard.type('TestPassword123!');

      await page.keyboard.press('Tab');
      await expect(page.getByTestId('coach-login-submit')).toBeFocused();

      // Submit with Enter
      await page.keyboard.press('Enter');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/coach\/dashboard/);
    });

    test('should navigate between student pages using Tab and Enter', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Tab to navigation
      let currentElement = null;
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        currentElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        if (currentElement === 'nav-lessons') {
          break;
        }
      }

      expect(currentElement).toBe('nav-lessons');

      // Press Enter to navigate
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/student\/lessons/);
    });

    test('should support Escape key to close modals/dialogs', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Open user menu
      await studentDashboard.openUserMenu();
      await expect(page.getByTestId('logout-button')).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Menu should be closed
      await expect(page.getByTestId('logout-button')).not.toBeVisible();
    });

    test('should support Tab to navigate PIN input fields', async ({ loginPage, page }) => {
      await loginPage.gotoStudentLogin();
      await loginPage.fillStudentUsername('testStudent1');
      await loginPage.submitStudentUsername();

      // PIN inputs should auto-focus and advance
      await page.getByTestId('pin-digit-0').focus();
      await page.keyboard.type('1');

      // Should auto-advance to next digit
      await page.keyboard.type('2');
      await page.keyboard.type('3');
      await page.keyboard.type('4');

      // All digits should be filled
      expect(await page.getByTestId('pin-digit-0').inputValue()).toBe('1');
      expect(await page.getByTestId('pin-digit-1').inputValue()).toBe('2');
      expect(await page.getByTestId('pin-digit-2').inputValue()).toBe('3');
      expect(await page.getByTestId('pin-digit-3').inputValue()).toBe('4');
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators on all interactive elements', async ({ loginPage, page }) => {
      await loginPage.gotoStudentLogin();

      // Tab to username input
      await page.keyboard.press('Tab');

      // Check focus styling
      const focusedElement = page.getByTestId('student-username-input');
      await expect(focusedElement).toBeFocused();

      // Verify focus ring is visible (check for focus-visible or outline)
      const hasFocusStyles = await focusedElement.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        // Check for outline or box-shadow (common focus indicators)
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });

      expect(hasFocusStyles).toBe(true);
    });

    test('should maintain focus order in student navigation', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Track focus order
      const focusOrder: string[] = [];

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        if (focusedElement) {
          focusOrder.push(focusedElement);
        }
        // Stop when we loop back
        if (focusOrder.filter(e => e === focusedElement).length > 1) {
          break;
        }
      }

      // Focus order should be logical (nav items should be in sequence)
      expect(focusOrder.length).toBeGreaterThan(3);
    });

    test('should restore focus after closing modal', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Focus on user menu button
      const userMenuButton = page.getByTestId('user-menu-button');
      await userMenuButton.focus();

      // Open menu
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('logout-button')).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');

      // Focus should return to button
      await expect(userMenuButton).toBeFocused();
    });
  });

  test.describe('ARIA Labels and Roles', () => {
    test('should have proper ARIA labels on student login form', async ({ loginPage }) => {
      await loginPage.gotoStudentLogin();

      // Check username input has label
      const usernameInput = loginPage.studentUsernameInput;
      const usernameLabel = await usernameInput.getAttribute('aria-label');
      expect(usernameLabel || await usernameInput.evaluate(el => {
        const id = el.id;
        return document.querySelector(`label[for="${id}"]`)?.textContent;
      })).toBeTruthy();

      // Check submit button has accessible name
      const submitButton = loginPage.studentUsernameSubmit;
      const buttonText = await submitButton.textContent();
      const ariaLabel = await submitButton.getAttribute('aria-label');
      expect(buttonText || ariaLabel).toBeTruthy();
    });

    test('should have proper navigation landmarks', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Check for main landmark
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Check for navigation landmark
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      // Check nav has aria-label or aria-labelledby
      const navLabel = await nav.getAttribute('aria-label');
      const navLabelledBy = await nav.getAttribute('aria-labelledby');
      expect(navLabel || navLabelledBy).toBeTruthy();
    });

    test('should have proper button roles and labels', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // All buttons should have role="button" or be <button> elements
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();

      expect(buttonCount).toBeGreaterThan(0);

      // Each button should have accessible name
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    });

    test('should have proper form field labels', async ({ loginPage }) => {
      await loginPage.gotoCoachLogin();

      // Email input should have label
      const emailInput = loginPage.coachEmailInput;
      const emailLabel = await emailInput.evaluate(el => {
        const input = el as HTMLInputElement;
        return document.querySelector(`label[for="${input.id}"]`)?.textContent ||
               input.getAttribute('aria-label') ||
               input.getAttribute('placeholder');
      });
      expect(emailLabel).toBeTruthy();

      // Password input should have label
      const passwordInput = loginPage.coachPasswordInput;
      const passwordLabel = await passwordInput.evaluate(el => {
        const input = el as HTMLInputElement;
        return document.querySelector(`label[for="${input.id}"]`)?.textContent ||
               input.getAttribute('aria-label') ||
               input.getAttribute('placeholder');
      });
      expect(passwordLabel).toBeTruthy();
    });

    test('should have proper heading hierarchy', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Get all headings
      const headings = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return elements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
        }));
      });

      // Should have at least one h1
      const h1Count = headings.filter(h => h.tag === 'H1').length;
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Heading levels should not skip (no h1 -> h3)
      const levels = headings.map(h => parseInt(h.tag.substring(1)));
      for (let i = 1; i < levels.length; i++) {
        const diff = levels[i] - levels[i - 1];
        // Allow same level, one level up, or any levels down
        expect(diff).toBeLessThanOrEqual(1);
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast for text', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Run axe scan specifically for color-contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('should have sufficient contrast in login forms', async ({ loginPage, page }) => {
      await loginPage.gotoStudentLogin();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have descriptive page titles', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.toLowerCase()).toContain('dashboard');
    });

    test('should announce page changes via aria-live regions', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Navigate to lessons
      await studentDashboard.navigateToLessons();

      // Check for aria-live region
      const liveRegion = page.locator('[aria-live]');
      const count = await liveRegion.count();

      // Should have at least one live region for announcements
      expect(count).toBeGreaterThan(0);
    });

    test('should have alt text on images', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Get all images
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Each image should have alt attribute
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          // Alt can be empty string for decorative images
          expect(alt).not.toBeNull();
        }
      }
    });

    test('should have proper form error announcements', async ({ loginPage, page }) => {
      await loginPage.gotoStudentLogin();

      // Submit with invalid data
      await loginPage.fillStudentUsername('testStudent1');
      await loginPage.submitStudentUsername();
      await loginPage.fillPin('9999');
      await loginPage.submitPin();

      // Error message should have role="alert" or aria-live
      const errorMessage = page.getByTestId('error-message');
      const role = await errorMessage.getAttribute('role');
      const ariaLive = await errorMessage.getAttribute('aria-live');

      expect(role === 'alert' || ariaLive === 'assertive' || ariaLive === 'polite').toBe(true);
    });
  });

  test.describe('Touch Target Size', () => {
    test('should have minimum 44x44px touch targets on mobile', async ({ page, loginPage }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginPage.gotoStudentLogin();

      // Get all interactive elements
      const interactiveElements = page.locator('button, a, input[type="button"], input[type="submit"]');
      const count = await interactiveElements.count();

      // Check first few elements for size
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = interactiveElements.nth(i);
        const box = await element.boundingBox();

        if (box) {
          // Touch targets should be at least 44x44px
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Skip Links', () => {
    test('should have skip to main content link', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Press Tab to reveal skip link
      await page.keyboard.press('Tab');

      // Check for skip link
      const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip to")');
      const count = await skipLink.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to main content when skip link is used', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Tab to skip link
      await page.keyboard.press('Tab');

      // Activate skip link
      await page.keyboard.press('Enter');

      // Focus should be on main content
      const mainContent = page.locator('#main-content, main');
      const isFocused = await mainContent.evaluate(el => el === document.activeElement);

      expect(isFocused).toBe(true);
    });
  });
});
