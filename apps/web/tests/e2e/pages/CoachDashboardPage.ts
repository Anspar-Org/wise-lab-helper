import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Coach Dashboard
 * Main landing page for coaches after login
 */
export class CoachDashboardPage {
  readonly page: Page;

  // Header elements
  readonly userName: Locator;
  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;

  // Navigation elements
  readonly navDashboard: Locator;
  readonly navStudents: Locator;
  readonly navAssessments: Locator;
  readonly navReports: Locator;
  readonly navSettings: Locator;

  // Dashboard content
  readonly welcomeMessage: Locator;
  readonly studentCount: Locator;
  readonly activeStudentsCard: Locator;
  readonly recentAssessments: Locator;
  readonly pendingTasks: Locator;

  // Student list elements
  readonly studentGrid: Locator;
  readonly studentCards: Locator;
  readonly searchStudentInput: Locator;
  readonly filterByGrade: Locator;

  // Assessment elements
  readonly assessmentForm: Locator;
  readonly skillSelect: Locator;
  readonly proficiencySelect: Locator;
  readonly evidenceNotesInput: Locator;
  readonly submitAssessmentButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header locators
    this.userName = page.getByTestId('coach-user-name');
    this.userMenuButton = page.getByTestId('user-menu-button');
    this.logoutButton = page.getByTestId('logout-button');

    // Navigation locators
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navStudents = page.getByTestId('nav-students');
    this.navAssessments = page.getByTestId('nav-assessments');
    this.navReports = page.getByTestId('nav-reports');
    this.navSettings = page.getByTestId('nav-settings');

    // Dashboard content locators
    this.welcomeMessage = page.getByTestId('coach-welcome-message');
    this.studentCount = page.getByTestId('student-count');
    this.activeStudentsCard = page.getByTestId('active-students-card');
    this.recentAssessments = page.getByTestId('recent-assessments');
    this.pendingTasks = page.getByTestId('pending-tasks');

    // Student list locators
    this.studentGrid = page.getByTestId('student-grid');
    this.studentCards = page.getByTestId('student-card');
    this.searchStudentInput = page.getByTestId('search-student-input');
    this.filterByGrade = page.getByTestId('filter-by-grade');

    // Assessment locators
    this.assessmentForm = page.getByTestId('assessment-form');
    this.skillSelect = page.getByTestId('skill-select');
    this.proficiencySelect = page.getByTestId('proficiency-select');
    this.evidenceNotesInput = page.getByTestId('evidence-notes-input');
    this.submitAssessmentButton = page.getByTestId('submit-assessment-button');
  }

  // Navigation methods
  async goto() {
    await this.page.goto('/coach/dashboard');
    await expect(this.welcomeMessage).toBeVisible();
  }

  async navigateToStudents() {
    await this.navStudents.click();
    await expect(this.page).toHaveURL(/\/coach\/students/);
  }

  async navigateToAssessments() {
    await this.navAssessments.click();
    await expect(this.page).toHaveURL(/\/coach\/assessments/);
  }

  async navigateToReports() {
    await this.navReports.click();
    await expect(this.page).toHaveURL(/\/coach\/reports/);
  }

  async navigateToSettings() {
    await this.navSettings.click();
    await expect(this.page).toHaveURL(/\/coach\/settings/);
  }

  // Action methods - User
  async openUserMenu() {
    await this.userMenuButton.click();
    await expect(this.logoutButton).toBeVisible();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/\/login/);
  }

  // Action methods - Students
  async searchStudent(name: string) {
    await this.searchStudentInput.fill(name);
  }

  async filterStudentsByGrade(grade: string) {
    await this.filterByGrade.selectOption(grade);
  }

  async viewStudentProfile(studentName: string) {
    const studentCard = this.page.getByTestId(`student-card-${studentName.toLowerCase().replace(/\s+/g, '-')}`);
    await studentCard.click();
  }

  async assessStudent(studentName: string) {
    const studentCard = this.page.getByTestId(`student-card-${studentName.toLowerCase().replace(/\s+/g, '-')}`);
    const assessButton = studentCard.getByTestId('assess-button');
    await assessButton.click();
  }

  // Action methods - Assessments
  async selectSkill(skillName: string) {
    await this.skillSelect.selectOption(skillName);
  }

  async selectProficiency(level: 'beginning' | 'developing' | 'proficient' | 'advanced') {
    await this.proficiencySelect.selectOption(level);
  }

  async fillEvidenceNotes(notes: string) {
    await this.evidenceNotesInput.fill(notes);
  }

  async submitAssessment() {
    await this.submitAssessmentButton.click();
  }

  async createAssessment(
    studentName: string,
    skillName: string,
    proficiency: 'beginning' | 'developing' | 'proficient' | 'advanced',
    evidence: string
  ) {
    await this.assessStudent(studentName);
    await expect(this.assessmentForm).toBeVisible();
    await this.selectSkill(skillName);
    await this.selectProficiency(proficiency);
    await this.fillEvidenceNotes(evidence);
    await this.submitAssessment();
  }

  // Assertion methods
  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/coach\/dashboard/);
    await expect(this.userName).toBeVisible();
  }

  async expectWelcomeMessage(coachName: string) {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.welcomeMessage).toContainText(coachName);
  }

  async expectStudentCount(count: number) {
    await expect(this.studentCount).toHaveText(count.toString());
  }

  async expectStudentCardVisible(studentName: string) {
    const studentCard = this.page.getByTestId(`student-card-${studentName.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(studentCard).toBeVisible();
  }

  async expectActiveStudentsVisible() {
    await expect(this.activeStudentsCard).toBeVisible();
  }

  async expectRecentAssessmentsVisible() {
    await expect(this.recentAssessments).toBeVisible();
  }

  async expectNavItemActive(navItem: 'dashboard' | 'students' | 'assessments' | 'reports' | 'settings') {
    const activeNav = this.page.getByTestId(`nav-${navItem}`);
    await expect(activeNav).toHaveClass(/active/);
  }

  async expectAssessmentFormVisible() {
    await expect(this.assessmentForm).toBeVisible();
  }

  async expectAssessmentSubmitted() {
    // Check for success toast or confirmation message
    const successToast = this.page.getByTestId('success-toast');
    await expect(successToast).toBeVisible();
  }
}
