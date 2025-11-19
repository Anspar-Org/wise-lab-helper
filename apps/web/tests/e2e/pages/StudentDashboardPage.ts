import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Student Dashboard
 * Main landing page for students after login
 */
export class StudentDashboardPage {
  readonly page: Page;

  // Header elements
  readonly userAvatar: Locator;
  readonly userName: Locator;
  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;

  // Navigation elements
  readonly navDashboard: Locator;
  readonly navLessons: Locator;
  readonly navNotebook: Locator;
  readonly navSkills: Locator;
  readonly navBadges: Locator;

  // Dashboard content
  readonly welcomeMessage: Locator;
  readonly currentLessonCard: Locator;
  readonly continueButton: Locator;
  readonly recentBadges: Locator;
  readonly skillProgress: Locator;
  readonly notebookPreview: Locator;

  // Quick actions
  readonly startNewLessonButton: Locator;
  readonly createNotebookEntryButton: Locator;
  readonly viewAllBadgesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header locators
    this.userAvatar = page.getByTestId('user-avatar');
    this.userName = page.getByTestId('user-name');
    this.userMenuButton = page.getByTestId('user-menu-button');
    this.logoutButton = page.getByTestId('logout-button');

    // Navigation locators
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navLessons = page.getByTestId('nav-lessons');
    this.navNotebook = page.getByTestId('nav-notebook');
    this.navSkills = page.getByTestId('nav-skills');
    this.navBadges = page.getByTestId('nav-badges');

    // Dashboard content locators
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.currentLessonCard = page.getByTestId('current-lesson-card');
    this.continueButton = page.getByTestId('continue-lesson-button');
    this.recentBadges = page.getByTestId('recent-badges');
    this.skillProgress = page.getByTestId('skill-progress');
    this.notebookPreview = page.getByTestId('notebook-preview');

    // Quick action locators
    this.startNewLessonButton = page.getByTestId('start-new-lesson-button');
    this.createNotebookEntryButton = page.getByTestId('create-notebook-entry-button');
    this.viewAllBadgesButton = page.getByTestId('view-all-badges-button');
  }

  // Navigation methods
  async goto() {
    await this.page.goto('/student/dashboard');
    await expect(this.welcomeMessage).toBeVisible();
  }

  async navigateToLessons() {
    await this.navLessons.click();
    await expect(this.page).toHaveURL(/\/student\/lessons/);
  }

  async navigateToNotebook() {
    await this.navNotebook.click();
    await expect(this.page).toHaveURL(/\/student\/notebook/);
  }

  async navigateToSkills() {
    await this.navSkills.click();
    await expect(this.page).toHaveURL(/\/student\/skills/);
  }

  async navigateToBadges() {
    await this.navBadges.click();
    await expect(this.page).toHaveURL(/\/student\/badges/);
  }

  // Action methods
  async openUserMenu() {
    await this.userMenuButton.click();
    await expect(this.logoutButton).toBeVisible();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/\/login/);
  }

  async continueCurrentLesson() {
    await this.continueButton.click();
  }

  async startNewLesson() {
    await this.startNewLessonButton.click();
    await expect(this.page).toHaveURL(/\/student\/lessons/);
  }

  async createNotebookEntry() {
    await this.createNotebookEntryButton.click();
    await expect(this.page).toHaveURL(/\/student\/notebook\/new/);
  }

  async viewAllBadges() {
    await this.viewAllBadgesButton.click();
    await expect(this.page).toHaveURL(/\/student\/badges/);
  }

  // Assertion methods
  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/student\/dashboard/);
    await expect(this.userAvatar).toBeVisible();
    await expect(this.userName).toBeVisible();
  }

  async expectWelcomeMessage(username: string) {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.welcomeMessage).toContainText(username);
  }

  async expectCurrentLessonVisible() {
    await expect(this.currentLessonCard).toBeVisible();
  }

  async expectRecentBadgesVisible() {
    await expect(this.recentBadges).toBeVisible();
  }

  async expectSkillProgressVisible() {
    await expect(this.skillProgress).toBeVisible();
  }

  async expectNavItemActive(navItem: 'dashboard' | 'lessons' | 'notebook' | 'skills' | 'badges') {
    const activeNav = this.page.getByTestId(`nav-${navItem}`);
    await expect(activeNav).toHaveClass(/active/);
  }
}
