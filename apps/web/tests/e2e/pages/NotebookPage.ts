import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Notebook Page
 * Allows students to create, view, and manage notebook entries
 */
export class NotebookPage {
  readonly page: Page;

  // Page elements
  readonly pageTitle: Locator;
  readonly createEntryButton: Locator;
  readonly entriesTimeline: Locator;
  readonly entryCards: Locator;

  // Filter and search
  readonly searchInput: Locator;
  readonly filterByDate: Locator;
  readonly filterByLesson: Locator;

  // Entry editor elements
  readonly entryTitleInput: Locator;
  readonly entryContentEditor: Locator;
  readonly imageUploadButton: Locator;
  readonly imagePreview: Locator;
  readonly saveEntryButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteEntryButton: Locator;

  // Entry view elements
  readonly entryTitle: Locator;
  readonly entryContent: Locator;
  readonly entryDate: Locator;
  readonly entryImages: Locator;
  readonly editEntryButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page locators
    this.pageTitle = page.getByTestId('notebook-page-title');
    this.createEntryButton = page.getByTestId('create-entry-button');
    this.entriesTimeline = page.getByTestId('entries-timeline');
    this.entryCards = page.getByTestId('entry-card');

    // Filter locators
    this.searchInput = page.getByTestId('entry-search-input');
    this.filterByDate = page.getByTestId('filter-by-date');
    this.filterByLesson = page.getByTestId('filter-by-lesson');

    // Entry editor locators
    this.entryTitleInput = page.getByTestId('entry-title-input');
    this.entryContentEditor = page.getByTestId('entry-content-editor');
    this.imageUploadButton = page.getByTestId('image-upload-button');
    this.imagePreview = page.getByTestId('image-preview');
    this.saveEntryButton = page.getByTestId('save-entry-button');
    this.cancelButton = page.getByTestId('cancel-button');
    this.deleteEntryButton = page.getByTestId('delete-entry-button');

    // Entry view locators
    this.entryTitle = page.getByTestId('entry-title');
    this.entryContent = page.getByTestId('entry-content');
    this.entryDate = page.getByTestId('entry-date');
    this.entryImages = page.getByTestId('entry-images');
    this.editEntryButton = page.getByTestId('edit-entry-button');
  }

  // Navigation methods
  async goto() {
    await this.page.goto('/student/notebook');
    await expect(this.pageTitle).toBeVisible();
  }

  async gotoCreateEntry() {
    await this.page.goto('/student/notebook/new');
    await expect(this.entryTitleInput).toBeVisible();
  }

  // Action methods - Create/Edit
  async createNewEntry() {
    await this.createEntryButton.click();
    await expect(this.page).toHaveURL(/\/student\/notebook\/new/);
  }

  async fillEntryTitle(title: string) {
    await this.entryTitleInput.fill(title);
  }

  async fillEntryContent(content: string) {
    await this.entryContentEditor.fill(content);
  }

  async uploadImage(filePath: string) {
    // Set up file chooser handler
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.imageUploadButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    // Wait for image preview to appear
    await expect(this.imagePreview).toBeVisible();
  }

  async saveEntry() {
    await this.saveEntryButton.click();
    // Wait for redirect back to notebook
    await expect(this.page).toHaveURL(/\/student\/notebook$/);
  }

  async cancelEntry() {
    await this.cancelButton.click();
  }

  async createCompleteEntry(title: string, content: string, imagePath?: string) {
    await this.fillEntryTitle(title);
    await this.fillEntryContent(content);
    if (imagePath) {
      await this.uploadImage(imagePath);
    }
    await this.saveEntry();
  }

  // Action methods - View/Navigate
  async openEntry(entryTitle: string) {
    const entryCard = this.page.getByTestId(`entry-card-${entryTitle.toLowerCase().replace(/\s+/g, '-')}`);
    await entryCard.click();
  }

  async editEntry(entryTitle: string) {
    await this.openEntry(entryTitle);
    await this.editEntryButton.click();
    await expect(this.entryTitleInput).toBeVisible();
  }

  async deleteEntry(entryTitle: string) {
    await this.openEntry(entryTitle);
    await this.deleteEntryButton.click();

    // Confirm deletion (assuming a confirmation dialog)
    const confirmButton = this.page.getByTestId('confirm-delete-button');
    await confirmButton.click();

    // Wait for redirect back to notebook
    await expect(this.page).toHaveURL(/\/student\/notebook$/);
  }

  async searchEntries(query: string) {
    await this.searchInput.fill(query);
  }

  // Assertion methods
  async expectOnNotebookPage() {
    await expect(this.page).toHaveURL(/\/student\/notebook$/);
    await expect(this.pageTitle).toBeVisible();
  }

  async expectOnCreateEntryPage() {
    await expect(this.page).toHaveURL(/\/student\/notebook\/new/);
    await expect(this.entryTitleInput).toBeVisible();
  }

  async expectEntryCardVisible(entryTitle: string) {
    const entryCard = this.page.getByTestId(`entry-card-${entryTitle.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(entryCard).toBeVisible();
  }

  async expectEntryCount(count: number) {
    await expect(this.entryCards).toHaveCount(count);
  }

  async expectEntryHasImage(entryTitle: string) {
    const entryCard = this.page.getByTestId(`entry-card-${entryTitle.toLowerCase().replace(/\s+/g, '-')}`);
    const image = entryCard.getByTestId('entry-thumbnail');
    await expect(image).toBeVisible();
  }

  async expectEntrySaved() {
    await expect(this.page).toHaveURL(/\/student\/notebook$/);
    // Could also check for a success toast message
    const successToast = this.page.getByTestId('success-toast');
    await expect(successToast).toBeVisible();
  }

  async expectImagePreviewVisible() {
    await expect(this.imagePreview).toBeVisible();
  }
}
