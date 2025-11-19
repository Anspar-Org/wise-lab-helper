# End-to-End Testing Guide

This directory contains end-to-end (E2E) tests for the STEM Lab Assistant frontend using [Playwright](https://playwright.dev/).

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Page Object Model](#page-object-model)
- [Test Data Management](#test-data-management)
- [Debugging Tests](#debugging-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

Our E2E tests cover critical user journeys including:

- **Authentication**: Student PIN/animal grid login, coach email/password login
- **Navigation**: Page navigation, keyboard navigation, browser history
- **Accessibility**: WCAG compliance, screen reader support, keyboard accessibility
- **Responsive Design**: Desktop, tablet, and mobile viewports
- **Core Features**: Lessons, notebook entries, skill assessments

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies (from apps/web directory)
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Basic Commands

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests (step through)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Browser-Specific Tests

```bash
# Run on Chromium only
npm run test:e2e:chromium

# Run on Firefox only
npm run test:e2e:firefox

# Run on WebKit only
npm run test:e2e:webkit

# Run mobile tests
npm run test:e2e:mobile
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test tests/e2e/specs/auth.spec.ts

# Run specific test by name
npx playwright test -g "should login with PIN"

# Run tests in a specific directory
npx playwright test tests/e2e/specs/
```

### Advanced Options

```bash
# Run tests in parallel
npx playwright test --workers=4

# Run tests with specific timeout
npx playwright test --timeout=60000

# Update snapshots (for visual regression)
npx playwright test --update-snapshots

# Run only failed tests
npx playwright test --last-failed
```

## Test Structure

```
tests/e2e/
├── fixtures/          # Test fixtures and test data
│   └── index.ts       # Authenticated contexts, mock data generators
├── helpers/           # Reusable test utilities
│   └── auth.ts        # Authentication helper functions
├── mocks/             # API mocking utilities
│   └── api.ts         # Mock API responses
├── pages/             # Page Object Models
│   ├── LoginPage.ts
│   ├── StudentDashboardPage.ts
│   ├── LessonsPage.ts
│   ├── NotebookPage.ts
│   └── CoachDashboardPage.ts
└── specs/             # Test specifications
    ├── auth.spec.ts
    ├── navigation.spec.ts
    ├── accessibility.spec.ts
    └── responsive.spec.ts
```

## Writing Tests

### Basic Test Template

```typescript
import { test, expect } from '../fixtures';
import { setupMockApi } from '../mocks/api';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');

    // Act
    await page.getByTestId('some-button').click();

    // Assert
    await expect(page).toHaveURL(/\/expected-url/);
  });
});
```

### Using Page Objects

```typescript
test('should navigate to lessons', async ({ studentDashboard, lessonsPage }) => {
  await studentDashboard.goto();
  await studentDashboard.navigateToLessons();
  await lessonsPage.expectOnLessonsPage();
});
```

### Using Authenticated Contexts

```typescript
test('student can view lessons', async ({ authenticatedStudentPage: page, lessonsPage }) => {
  // Already logged in as student
  await lessonsPage.goto();
  await lessonsPage.expectOnLessonsPage();
});

test('coach can view students', async ({ authenticatedCoachPage: page, coachDashboard }) => {
  // Already logged in as coach
  await coachDashboard.goto();
  await coachDashboard.navigateToStudents();
});
```

## Page Object Model

We use the Page Object Model (POM) pattern to encapsulate page-specific logic.

### Creating a Page Object

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class MyPage {
  readonly page: Page;
  readonly myButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myButton = page.getByTestId('my-button');
  }

  async goto() {
    await this.page.goto('/my-page');
    await expect(this.myButton).toBeVisible();
  }

  async clickButton() {
    await this.myButton.click();
  }

  async expectSomething() {
    await expect(this.myButton).toBeEnabled();
  }
}
```

### POM Conventions

1. **Locators as readonly properties**: Define all locators in the constructor
2. **Navigation methods**: `goto()`, `navigateTo...()`
3. **Action methods**: `fill...()`, `click...()`, `submit...()`
4. **Assertion methods**: `expect...()`
5. **Use data-testid**: Always prefer `data-testid` attributes for stable selectors

## Test Data Management

### Using Test Data

```typescript
import { testData } from '../fixtures';

test('student login', async ({ page }) => {
  const student = testData.students.student1;
  await loginAsStudent(page, student.username, student.pin);
});
```

### Generating Random Data

```typescript
import { generateRandomStudent } from '../fixtures';

test('register new student', async ({ page }) => {
  const student = generateRandomStudent();
  await registerStudent(page, student.username, student.avatar, student.pin, student.grade);
});
```

### Mock API

```typescript
import { setupMockApi } from '../mocks/api';

test.beforeEach(async ({ page }) => {
  // Enable API mocking for all requests
  await setupMockApi(page);
});
```

## Debugging Tests

### UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all tests
- Run individual tests
- Step through tests
- Inspect DOM snapshots
- View network requests

### Debug Mode

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can:
- Step through test execution
- Set breakpoints
- Inspect page state
- Try selectors

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Playwright Tests",
  "program": "${workspaceFolder}/apps/web/node_modules/@playwright/test/cli.js",
  "args": ["test", "--headed", "--debug"],
  "cwd": "${workspaceFolder}/apps/web"
}
```

### Console Logging

```typescript
test('debug test', async ({ page }) => {
  // Log to console
  console.log('Current URL:', page.url());

  // Attach page console to test output
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Take screenshot
  await page.screenshot({ path: 'debug.png' });
});
```

### Trace Viewer

After a test failure:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## Best Practices

### 1. Use data-testid Attributes

**Good:**
```typescript
await page.getByTestId('student-username-input').fill('john');
```

**Bad:**
```typescript
await page.locator('input[name="username"]').fill('john');
```

### 2. Write Deterministic Tests

**Good:**
```typescript
// Wait for specific conditions
await expect(page.getByTestId('loading')).not.toBeVisible();
await expect(page.getByTestId('content')).toBeVisible();
```

**Bad:**
```typescript
// Arbitrary waits
await page.waitForTimeout(3000);
```

### 3. Clean Up Test Data

```typescript
test.afterEach(async ({ page }) => {
  // Clear auth state
  await clearAuth(page);
});
```

### 4. Test One Thing at a Time

**Good:**
```typescript
test('should login with valid credentials', async ({ page }) => {
  await loginAsStudent(page, 'user', '1234');
  await expect(page).toHaveURL(/\/dashboard/);
});

test('should show error with invalid credentials', async ({ page }) => {
  await loginAsStudent(page, 'user', '9999');
  await expect(page.getByTestId('error-message')).toBeVisible();
});
```

**Bad:**
```typescript
test('should handle login', async ({ page }) => {
  // Testing multiple scenarios in one test
  await loginAsStudent(page, 'user', '1234');
  await logout(page);
  await loginAsStudent(page, 'user', '9999');
});
```

### 5. Use Page Object Methods

**Good:**
```typescript
await loginPage.loginAsStudentWithPin('user', '1234');
await studentDashboard.expectLoggedIn();
```

**Bad:**
```typescript
await page.getByTestId('username').fill('user');
await page.getByTestId('submit').click();
await page.getByTestId('pin-0').fill('1');
// etc...
```

### 6. Keep Tests Independent

Each test should be able to run in isolation:

```typescript
test.beforeEach(async ({ page }) => {
  // Set up clean state
  await setupMockApi(page);
  await clearAuth(page);
});
```

### 7. Accessibility Testing

Include accessibility checks:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/login');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## CI/CD Integration

Tests automatically run on:
- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`

### GitHub Actions

See `.github/workflows/playwright.yml` for the complete configuration.

Tests run on:
- **Desktop browsers**: Chromium, Firefox, WebKit
- **Mobile viewports**: iPad, iPad Mini
- **Accessibility suite**: Axe scans

### Viewing CI Results

After a CI run:
1. Go to the Actions tab in GitHub
2. Click on the workflow run
3. Download artifacts (test reports, screenshots, videos)

## E2E vs Component Tests

### When to Use E2E Tests

- User journeys across multiple pages
- Integration between frontend and backend
- Browser-specific functionality
- Accessibility compliance
- Responsive design verification

### When to Use Component Tests (Vitest)

- Individual component logic
- Component props and state
- User interactions within a component
- Component rendering variations
- Fast feedback during development

## Common Issues

### Test Timeouts

If tests timeout, increase the timeout:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Flaky Tests

Avoid flaky tests by:
- Waiting for specific conditions, not arbitrary timeouts
- Using `expect().toBeVisible()` instead of `isVisible()`
- Ensuring test independence
- Checking for loading states

### CI Failures

If tests pass locally but fail in CI:
- Check viewport size differences
- Verify browser versions
- Review CI logs and artifacts
- Run tests with `CI=true` locally

## Getting Help

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Discord](https://discord.com/invite/playwright)
- Team Slack channel: #testing

## Contributing

When adding new tests:
1. Follow the existing structure and conventions
2. Use Page Object Model for new pages
3. Add test data to `fixtures/index.ts`
4. Update this README if adding new patterns
5. Ensure tests pass locally before committing
6. Use descriptive test names

## License

Internal use only - STEM Lab Assistant project
