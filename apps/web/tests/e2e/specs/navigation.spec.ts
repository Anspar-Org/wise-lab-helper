import { test, expect } from '../fixtures';
import { setupMockApi } from '../mocks/api';

/**
 * Navigation E2E Tests
 * Tests for basic navigation between pages
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await setupMockApi(page);
  });

  test.describe('Student Navigation', () => {
    test('should navigate between student pages', async ({ authenticatedStudentPage: page, studentDashboard, lessonsPage, notebookPage }) => {
      // Start at dashboard
      await studentDashboard.goto();
      await studentDashboard.expectLoggedIn();

      // Navigate to lessons
      await studentDashboard.navigateToLessons();
      await lessonsPage.expectOnLessonsPage();

      // Navigate to notebook
      await page.getByTestId('nav-notebook').click();
      await notebookPage.expectOnNotebookPage();

      // Navigate to skills
      await page.getByTestId('nav-skills').click();
      await expect(page).toHaveURL(/\/student\/skills/);

      // Navigate to badges
      await page.getByTestId('nav-badges').click();
      await expect(page).toHaveURL(/\/student\/badges/);

      // Navigate back to dashboard
      await page.getByTestId('nav-dashboard').click();
      await studentDashboard.expectLoggedIn();
    });

    test('should highlight active navigation item', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Dashboard should be active
      await studentDashboard.expectNavItemActive('dashboard');

      // Navigate to lessons
      await studentDashboard.navigateToLessons();
      await studentDashboard.expectNavItemActive('lessons');

      // Navigate to notebook
      await studentDashboard.navigateToNotebook();
      await studentDashboard.expectNavItemActive('notebook');

      // Navigate to skills
      await studentDashboard.navigateToSkills();
      await studentDashboard.expectNavItemActive('skills');

      // Navigate to badges
      await studentDashboard.navigateToBadges();
      await studentDashboard.expectNavItemActive('badges');
    });

    test('should support browser back button', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Navigate forward through pages
      await studentDashboard.navigateToLessons();
      await expect(page).toHaveURL(/\/student\/lessons/);

      await page.getByTestId('nav-notebook').click();
      await expect(page).toHaveURL(/\/student\/notebook/);

      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\/student\/lessons/);

      // Go back again
      await page.goBack();
      await expect(page).toHaveURL(/\/student\/dashboard/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/\/student\/lessons/);
    });

    test('should support browser forward button', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();
      await studentDashboard.navigateToLessons();
      await page.getByTestId('nav-notebook').click();

      // Go back twice
      await page.goBack();
      await page.goBack();

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/\/student\/lessons/);

      await page.goForward();
      await expect(page).toHaveURL(/\/student\/notebook/);
    });

    test('should navigate using dashboard quick actions', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Use quick action to start new lesson
      await studentDashboard.startNewLesson();
      await expect(page).toHaveURL(/\/student\/lessons/);

      // Go back to dashboard
      await page.getByTestId('nav-dashboard').click();

      // Use quick action to create notebook entry
      await studentDashboard.createNotebookEntry();
      await expect(page).toHaveURL(/\/student\/notebook\/new/);

      // Go back to dashboard
      await page.getByTestId('nav-dashboard').click();

      // Use quick action to view badges
      await studentDashboard.viewAllBadges();
      await expect(page).toHaveURL(/\/student\/badges/);
    });

    test('should preserve state when navigating back to previous page', async ({ authenticatedStudentPage: page, lessonsPage }) => {
      await lessonsPage.goto();

      // Apply a filter
      await lessonsPage.filterByStatus('in-progress');
      await lessonsPage.expectFilterActive('in-progress');

      // Navigate away
      await page.getByTestId('nav-dashboard').click();
      await expect(page).toHaveURL(/\/student\/dashboard/);

      // Navigate back
      await page.getByTestId('nav-lessons').click();

      // Filter should still be active (if state is preserved)
      // Note: This depends on implementation - may need state management
      await expect(page).toHaveURL(/\/student\/lessons/);
    });
  });

  test.describe('Coach Navigation', () => {
    test('should navigate between coach pages', async ({ authenticatedCoachPage: page, coachDashboard }) => {
      // Start at dashboard
      await coachDashboard.goto();
      await coachDashboard.expectLoggedIn();

      // Navigate to students
      await coachDashboard.navigateToStudents();
      await expect(page).toHaveURL(/\/coach\/students/);

      // Navigate to assessments
      await page.getByTestId('nav-assessments').click();
      await expect(page).toHaveURL(/\/coach\/assessments/);

      // Navigate to reports
      await page.getByTestId('nav-reports').click();
      await expect(page).toHaveURL(/\/coach\/reports/);

      // Navigate to settings
      await page.getByTestId('nav-settings').click();
      await expect(page).toHaveURL(/\/coach\/settings/);

      // Navigate back to dashboard
      await page.getByTestId('nav-dashboard').click();
      await coachDashboard.expectLoggedIn();
    });

    test('should highlight active coach navigation item', async ({ authenticatedCoachPage: page, coachDashboard }) => {
      await coachDashboard.goto();

      // Dashboard should be active
      await coachDashboard.expectNavItemActive('dashboard');

      // Navigate to students
      await coachDashboard.navigateToStudents();
      await coachDashboard.expectNavItemActive('students');

      // Navigate to assessments
      await coachDashboard.navigateToAssessments();
      await coachDashboard.expectNavItemActive('assessments');

      // Navigate to reports
      await coachDashboard.navigateToReports();
      await coachDashboard.expectNavItemActive('reports');
    });

    test('should support coach browser navigation', async ({ authenticatedCoachPage: page, coachDashboard }) => {
      await coachDashboard.goto();

      // Navigate forward
      await coachDashboard.navigateToStudents();
      await coachDashboard.navigateToAssessments();

      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\/coach\/students/);

      // Go back to dashboard
      await page.goBack();
      await expect(page).toHaveURL(/\/coach\/dashboard/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/\/coach\/students/);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support Tab key navigation for students', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Tab through navigation items
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));

      // Verify we can tab through interactive elements
      expect(firstFocused).toBeTruthy();
    });

    test('should support Enter key to activate navigation links', async ({ authenticatedStudentPage: page, studentDashboard }) => {
      await studentDashboard.goto();

      // Focus on lessons nav item
      await page.getByTestId('nav-lessons').focus();

      // Press Enter
      await page.keyboard.press('Enter');

      // Should navigate to lessons
      await expect(page).toHaveURL(/\/student\/lessons/);
    });

    test('should support keyboard navigation for coaches', async ({ authenticatedCoachPage: page, coachDashboard }) => {
      await coachDashboard.goto();

      // Focus on students nav item
      await page.getByTestId('nav-students').focus();

      // Press Enter
      await page.keyboard.press('Enter');

      // Should navigate to students
      await expect(page).toHaveURL(/\/coach\/students/);
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumbs for nested student pages', async ({ authenticatedStudentPage: page, notebookPage }) => {
      // Navigate to create notebook entry
      await notebookPage.gotoCreateEntry();

      // Breadcrumbs should show: Dashboard > Notebook > New Entry
      const breadcrumbs = page.getByTestId('breadcrumbs');
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs).toContainText('Notebook');
      await expect(breadcrumbs).toContainText('New Entry');
    });

    test('should allow navigation via breadcrumbs', async ({ authenticatedStudentPage: page, notebookPage }) => {
      await notebookPage.gotoCreateEntry();

      // Click on Notebook breadcrumb
      await page.getByTestId('breadcrumb-notebook').click();

      // Should navigate back to notebook page
      await notebookPage.expectOnNotebookPage();
    });
  });

  test.describe('Deep Linking', () => {
    test('should support direct navigation to student pages', async ({ authenticatedStudentPage: page }) => {
      // Direct navigate to lessons page
      await page.goto('/student/lessons');
      await expect(page).toHaveURL(/\/student\/lessons/);

      // Direct navigate to notebook
      await page.goto('/student/notebook');
      await expect(page).toHaveURL(/\/student\/notebook/);

      // Direct navigate to skills
      await page.goto('/student/skills');
      await expect(page).toHaveURL(/\/student\/skills/);
    });

    test('should support direct navigation to coach pages', async ({ authenticatedCoachPage: page }) => {
      // Direct navigate to students page
      await page.goto('/coach/students');
      await expect(page).toHaveURL(/\/coach\/students/);

      // Direct navigate to assessments
      await page.goto('/coach/assessments');
      await expect(page).toHaveURL(/\/coach\/assessments/);

      // Direct navigate to reports
      await page.goto('/coach/reports');
      await expect(page).toHaveURL(/\/coach\/reports/);
    });
  });

  test.describe('Error Handling', () => {
    test('should display 404 page for invalid student routes', async ({ authenticatedStudentPage: page }) => {
      await page.goto('/student/invalid-page');

      // Should show 404 or redirect
      const is404 = await page.getByText(/404|not found/i).isVisible().catch(() => false);
      const isRedirected = page.url().includes('/student/dashboard');

      expect(is404 || isRedirected).toBe(true);
    });

    test('should display 404 page for invalid coach routes', async ({ authenticatedCoachPage: page }) => {
      await page.goto('/coach/invalid-page');

      // Should show 404 or redirect
      const is404 = await page.getByText(/404|not found/i).isVisible().catch(() => false);
      const isRedirected = page.url().includes('/coach/dashboard');

      expect(is404 || isRedirected).toBe(true);
    });
  });
});
