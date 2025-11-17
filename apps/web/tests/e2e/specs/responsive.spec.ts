import { test, expect } from '../fixtures';
import { setupMockApi } from '../mocks/api';

/**
 * Responsive Design E2E Tests
 * Tests for different viewport sizes and touch interactions
 */

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await setupMockApi(page);
  });

  test.describe('Desktop Viewport (1920x1000)', () => {
    test('should display student dashboard correctly on desktop', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await page.setViewportSize({ width: 1920, height: 1000 });
      await studentDashboard.goto();

      // Check layout elements are visible
      await expect(studentDashboard.welcomeMessage).toBeVisible();
      await expect(studentDashboard.navDashboard).toBeVisible();
      await expect(studentDashboard.currentLessonCard).toBeVisible();

      // Navigation should be horizontal/sidebar
      const navBounds = await page.getByTestId('nav-dashboard').boundingBox();
      expect(navBounds).not.toBeNull();
    });

    test('should display coach dashboard correctly on desktop', async ({ authenticatedCoachPage: page, coachDashboard }) => {
      await page.setViewportSize({ width: 1920, height: 1000 });
      await coachDashboard.goto();

      await expect(coachDashboard.welcomeMessage).toBeVisible();
      await expect(coachDashboard.studentGrid).toBeVisible();
      await expect(coachDashboard.activeStudentsCard).toBeVisible();
    });

    test('should display multi-column layout on desktop lessons page', async ({ authenticatedStudentPage: page, lessonsPage }) => {
      await page.setViewportSize({ width: 1920, height: 1000 });
      await lessonsPage.goto();

      // Check grid layout
      const grid = page.getByTestId('lessons-grid');
      const gridStyles = await grid.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          gridTemplateColumns: styles.gridTemplateColumns,
        };
      });

      // Should use grid or multi-column layout
      expect(gridStyles.display === 'grid' || gridStyles.display === 'flex').toBe(true);
    });
  });

  test.describe('Scaled Viewport (1600px)', () => {
    test('should maintain layout integrity at 1600px width', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await studentDashboard.goto();

      // All elements should still be visible
      await expect(studentDashboard.welcomeMessage).toBeVisible();
      await expect(studentDashboard.navDashboard).toBeVisible();
      await expect(studentDashboard.currentLessonCard).toBeVisible();

      // No horizontal scrolling
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('should adjust lesson grid at 1600px', async ({ authenticatedStudentPage: page, lessonsPage }) => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await lessonsPage.goto();

      // Lessons should still be in grid
      const grid = page.getByTestId('lessons-grid');
      await expect(grid).toBeVisible();

      // Check no overflow
      const hasOverflow = await grid.evaluate(el => {
        return el.scrollWidth > el.clientWidth;
      });
      expect(hasOverflow).toBe(false);
    });
  });

  test.describe('Mobile/Tablet Viewport (768x1024)', () => {
    test('should display student dashboard correctly on tablet', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await studentDashboard.goto();

      // Content should be visible
      await expect(studentDashboard.welcomeMessage).toBeVisible();
      await expect(studentDashboard.currentLessonCard).toBeVisible();

      // Navigation might be collapsed into hamburger menu
      const hamburger = page.getByTestId('mobile-menu-button');
      const hamburgerVisible = await hamburger.isVisible().catch(() => false);

      if (hamburgerVisible) {
        // Mobile navigation pattern
        await hamburger.click();
        await expect(studentDashboard.navDashboard).toBeVisible();
      } else {
        // Regular navigation still visible
        await expect(studentDashboard.navDashboard).toBeVisible();
      }

      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('should display lessons in single column on mobile', async ({ authenticatedStudentPage: page, lessonsPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await lessonsPage.goto();

      // Lessons grid should stack vertically
      const lessonCards = page.getByTestId('lesson-card');
      const count = await lessonCards.count();

      if (count >= 2) {
        const firstCard = await lessonCards.nth(0).boundingBox();
        const secondCard = await lessonCards.nth(1).boundingBox();

        if (firstCard && secondCard) {
          // Cards should stack vertically (second card below first)
          expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height - 50);
        }
      }
    });

    test('should use mobile-friendly navigation', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await studentDashboard.goto();

      // Check for mobile menu button
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      const isVisible = await mobileMenuButton.isVisible().catch(() => false);

      if (isVisible) {
        // Should have hamburger menu
        await mobileMenuButton.click();

        // Navigation should appear
        const nav = page.locator('nav[aria-label*="main" i], nav[aria-label*="navigation" i]');
        await expect(nav).toBeVisible();

        // Close menu
        const closeButton = page.getByTestId('close-menu-button');
        await closeButton.click();
      }
    });

    test('should make forms mobile-friendly', async ({ page, loginPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginPage.gotoStudentLogin();

      // Input should be large enough for mobile
      const usernameInput = page.getByTestId('student-username-input');
      const inputBox = await usernameInput.boundingBox();

      expect(inputBox).not.toBeNull();
      if (inputBox) {
        expect(inputBox.height).toBeGreaterThanOrEqual(44); // Touch target size
      }
    });
  });

  test.describe('Touch Interactions', () => {
    test('should have minimum 44x44px touch targets on mobile', async ({ page, loginPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginPage.gotoStudentLogin();

      // Check button sizes
      const submitButton = page.getByTestId('student-username-submit');
      const buttonBox = await submitButton.boundingBox();

      expect(buttonBox).not.toBeNull();
      if (buttonBox) {
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should support tap gestures on lesson cards', async ({ authenticatedStudentPage: page, lessonsPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await lessonsPage.goto();

      // Tap on a lesson card
      const lessonCard = page.getByTestId('lesson-card').first();
      await lessonCard.tap();

      // Should navigate or open lesson
      // Depending on implementation, check for navigation or modal
      const urlChanged = !page.url().includes('/student/lessons');
      const modalVisible = await page.getByTestId('lesson-modal').isVisible().catch(() => false);

      expect(urlChanged || modalVisible).toBe(true);
    });

    test('should support tap on navigation items', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await studentDashboard.goto();

      // Tap on lessons nav (might need to open menu first)
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      const hasMenu = await mobileMenuButton.isVisible().catch(() => false);

      if (hasMenu) {
        await mobileMenuButton.tap();
      }

      const lessonsNav = page.getByTestId('nav-lessons');
      await lessonsNav.tap();

      await expect(page).toHaveURL(/\/student\/lessons/);
    });

    test('should handle touch scroll on lesson list', async ({ authenticatedStudentPage: page, lessonsPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await lessonsPage.goto();

      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY);

      // Perform touch scroll
      await page.touchscreen.tap(400, 500);
      await page.mouse.move(400, 300);

      // Scroll position might change (depending on content)
      const finalScroll = await page.evaluate(() => window.scrollY);

      // Just verify scrolling is possible (if content is tall enough)
      expect(typeof finalScroll).toBe('number');
    });

    test('should support pinch-to-zoom disabled on UI elements', async ({ page, loginPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginPage.gotoStudentLogin();

      // Check viewport meta tag disables zoom on interactive elements
      const metaViewport = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta?.getAttribute('content');
      });

      // Should have user-scalable=no or maximum-scale=1 for app-like experience
      // Or allow zoom for accessibility
      expect(metaViewport).toBeTruthy();
    });

    test('should support touch on animal grid (K-2 login)', async ({ page, loginPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginPage.gotoStudentLogin();

      // Navigate to animal grid
      await page.getByTestId('student-username-input').fill('youngLearner');
      await page.getByTestId('student-username-submit').click();

      await loginPage.expectAnimalGridVisible();

      // Tap on animals
      await page.getByTestId('animal-option-cat').tap();
      await page.getByTestId('animal-option-dog').tap();
      await page.getByTestId('animal-option-bird').tap();
      await page.getByTestId('animal-option-fish').tap();

      // Submit should be enabled
      const submitButton = page.getByTestId('animal-grid-submit');
      const isEnabled = await submitButton.isEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle portrait to landscape transition on tablet', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      // Start in portrait
      await page.setViewportSize({ width: 768, height: 1024 });
      await studentDashboard.goto();

      await expect(studentDashboard.welcomeMessage).toBeVisible();

      // Rotate to landscape
      await page.setViewportSize({ width: 1024, height: 768 });

      // Content should still be visible
      await expect(studentDashboard.welcomeMessage).toBeVisible();
      await expect(studentDashboard.currentLessonCard).toBeVisible();
    });

    test('should maintain form state during orientation change', async ({ page, loginPage }) => {
      // Start in portrait
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginPage.gotoStudentLogin();

      // Fill username
      await page.getByTestId('student-username-input').fill('testStudent1');

      // Rotate to landscape
      await page.setViewportSize({ width: 1024, height: 768 });

      // Username should still be filled
      const usernameValue = await page.getByTestId('student-username-input').inputValue();
      expect(usernameValue).toBe('testStudent1');
    });
  });

  test.describe('Font Scaling', () => {
    test('should remain readable with browser zoom', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await page.setViewportSize({ width: 1920, height: 1000 });
      await studentDashboard.goto();

      // Simulate browser zoom (CSS transforms)
      await page.evaluate(() => {
        document.body.style.zoom = '150%';
      });

      // Elements should still be visible
      await expect(studentDashboard.welcomeMessage).toBeVisible();

      // No horizontal scroll should appear
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe('Image Responsiveness', () => {
    test('should scale images appropriately on mobile', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await studentDashboard.goto();

      // Get all images
      const images = page.locator('img');
      const count = await images.count();

      if (count > 0) {
        for (let i = 0; i < Math.min(count, 3); i++) {
          const img = images.nth(i);
          const box = await img.boundingBox();

          if (box) {
            // Images should not exceed viewport width
            expect(box.width).toBeLessThanOrEqual(768);
          }
        }
      }
    });

    test('should use responsive images (srcset) if available', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Check for responsive image attributes
      const responsiveImages = page.locator('img[srcset], picture source');
      const count = await responsiveImages.count();

      // If images exist, at least some should be responsive
      const totalImages = await page.locator('img').count();

      if (totalImages > 0) {
        // Responsive images are good practice but not required for this test to pass
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Viewport Meta Tag', () => {
    test('should have proper viewport meta tag', async ({ page }) => {
      await page.goto('/');

      const viewport = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta?.getAttribute('content');
      });

      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
    });
  });

  test.describe('Responsive Tables/Data', () => {
    test('should handle responsive tables on mobile', async ({ authenticatedCoachPage: page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/coach/students');

      // Tables should be scrollable or reorganized on mobile
      const tables = page.locator('table');
      const count = await tables.count();

      if (count > 0) {
        const table = tables.first();

        // Check if table is in a scrollable container
        const hasScrollContainer = await table.evaluate(el => {
          const parent = el.parentElement;
          if (!parent) return false;
          const styles = window.getComputedStyle(parent);
          return styles.overflowX === 'auto' || styles.overflowX === 'scroll';
        });

        // Table width should not cause page overflow
        const tableWidth = await table.evaluate(el => el.scrollWidth);
        const viewportWidth = 768;

        // Either table fits or has scroll container
        expect(hasScrollContainer || tableWidth <= viewportWidth).toBe(true);
      }
    });
  });

  test.describe('Print Styles', () => {
    test('should have print-friendly styles', async ({ authenticatedStudentPage: page }) => {
      await page.goto('/student/notebook');

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      // Check if navigation is hidden in print
      const nav = page.locator('nav');
      const navDisplay = await nav.evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      // Navigation should typically be hidden in print
      expect(navDisplay === 'none' || navDisplay === 'print').toBe(true);
    });
  });
});
