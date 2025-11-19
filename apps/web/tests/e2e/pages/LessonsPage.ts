import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Lessons Page
 * Displays available lessons and allows students to start/continue lessons
 */
export class LessonsPage {
  readonly page: Page;

  // Page elements
  readonly pageTitle: Locator;
  readonly lessonsGrid: Locator;
  readonly filterButtons: Locator;
  readonly searchInput: Locator;

  // Filter options
  readonly filterAll: Locator;
  readonly filterInProgress: Locator;
  readonly filterCompleted: Locator;
  readonly filterAvailable: Locator;

  // Lesson card elements
  readonly lessonCards: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page locators
    this.pageTitle = page.getByTestId('lessons-page-title');
    this.lessonsGrid = page.getByTestId('lessons-grid');
    this.filterButtons = page.getByTestId('lesson-filters');
    this.searchInput = page.getByTestId('lesson-search-input');

    // Filter locators
    this.filterAll = page.getByTestId('filter-all');
    this.filterInProgress = page.getByTestId('filter-in-progress');
    this.filterCompleted = page.getByTestId('filter-completed');
    this.filterAvailable = page.getByTestId('filter-available');

    // Lesson card locators
    this.lessonCards = page.getByTestId('lesson-card');
  }

  // Navigation methods
  async goto() {
    await this.page.goto('/student/lessons');
    await expect(this.pageTitle).toBeVisible();
  }

  // Action methods
  async filterByStatus(status: 'all' | 'in-progress' | 'completed' | 'available') {
    const filterMap = {
      'all': this.filterAll,
      'in-progress': this.filterInProgress,
      'completed': this.filterCompleted,
      'available': this.filterAvailable,
    };
    await filterMap[status].click();
  }

  async searchLessons(query: string) {
    await this.searchInput.fill(query);
  }

  async selectLesson(lessonTitle: string) {
    const lessonCard = this.page.getByTestId(`lesson-card-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`);
    await lessonCard.click();
  }

  async startLesson(lessonTitle: string) {
    const lessonCard = this.page.getByTestId(`lesson-card-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`);
    const startButton = lessonCard.getByTestId('start-lesson-button');
    await startButton.click();
  }

  async continueLesson(lessonTitle: string) {
    const lessonCard = this.page.getByTestId(`lesson-card-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`);
    const continueButton = lessonCard.getByTestId('continue-lesson-button');
    await continueButton.click();
  }

  async getLessonProgress(lessonTitle: string): Promise<number> {
    const lessonCard = this.page.getByTestId(`lesson-card-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`);
    const progressBar = lessonCard.getByTestId('lesson-progress-bar');
    const progressText = await progressBar.getAttribute('aria-valuenow');
    return parseInt(progressText || '0', 10);
  }

  // Assertion methods
  async expectOnLessonsPage() {
    await expect(this.page).toHaveURL(/\/student\/lessons/);
    await expect(this.pageTitle).toBeVisible();
  }

  async expectLessonCardVisible(lessonTitle: string) {
    const lessonCard = this.page.getByTestId(`lesson-card-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(lessonCard).toBeVisible();
  }

  async expectLessonCount(count: number) {
    await expect(this.lessonCards).toHaveCount(count);
  }

  async expectFilterActive(status: 'all' | 'in-progress' | 'completed' | 'available') {
    const filterMap = {
      'all': this.filterAll,
      'in-progress': this.filterInProgress,
      'completed': this.filterCompleted,
      'available': this.filterAvailable,
    };
    await expect(filterMap[status]).toHaveClass(/active/);
  }

  async expectLessonStatus(lessonTitle: string, status: 'available' | 'in-progress' | 'completed') {
    const lessonCard = this.page.getByTestId(`lesson-card-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`);
    const statusBadge = lessonCard.getByTestId('lesson-status-badge');
    await expect(statusBadge).toHaveText(new RegExp(status, 'i'));
  }

  async expectLessonLocked(lessonTitle: string) {
    const lessonCard = this.page.getByTestId(`lesson-card-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(lessonCard).toHaveClass(/locked/);
  }
}
