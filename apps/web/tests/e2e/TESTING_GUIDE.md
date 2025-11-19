# Quick Testing Guide for Developers

## For Frontend Developers

When building new features, ensure your components use `data-testid` attributes:

```tsx
// Good - Easy to test
<button data-testid="submit-button" onClick={handleSubmit}>
  Submit
</button>

// Bad - Hard to test
<button className="btn-primary" onClick={handleSubmit}>
  Submit
</button>
```

### Naming Convention for data-testid

- Use kebab-case: `data-testid="student-username-input"`
- Be descriptive: `data-testid="create-notebook-entry-button"`
- Include context: `data-testid="nav-lessons"` (nav = navigation)

### Common Test IDs by Feature

**Authentication:**
- `student-username-input`
- `student-username-submit`
- `pin-digit-0`, `pin-digit-1`, `pin-digit-2`, `pin-digit-3`
- `animal-option-{animal-name}` (e.g., `animal-option-cat`)
- `coach-email-input`
- `coach-password-input`
- `logout-button`

**Navigation:**
- `nav-dashboard`
- `nav-lessons`
- `nav-notebook`
- `nav-skills`
- `nav-badges`
- `user-menu-button`
- `mobile-menu-button`

**Dashboard:**
- `welcome-message`
- `current-lesson-card`
- `start-new-lesson-button`
- `create-notebook-entry-button`

**Lessons:**
- `lessons-grid`
- `lesson-card`
- `lesson-card-{lesson-slug}`
- `filter-all`, `filter-in-progress`, `filter-completed`

**Notebook:**
- `entry-title-input`
- `entry-content-editor`
- `image-upload-button`
- `save-entry-button`

## Writing New E2E Tests

### 1. Create a Page Object (if needed)

```typescript
// tests/e2e/pages/MyNewPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class MyNewPage {
  readonly page: Page;
  readonly myElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myElement = page.getByTestId('my-element');
  }

  async goto() {
    await this.page.goto('/my-page');
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/my-page/);
  }
}
```

### 2. Add Page Object to Fixtures

```typescript
// tests/e2e/fixtures/index.ts
import { MyNewPage } from '../pages/MyNewPage';

// Add to fixtures
myNewPage: async ({ page }, use) => {
  await use(new MyNewPage(page));
},
```

### 3. Write Tests

```typescript
// tests/e2e/specs/my-feature.spec.ts
import { test, expect } from '../fixtures';

test.describe('My Feature', () => {
  test('should do something', async ({ myNewPage }) => {
    await myNewPage.goto();
    await myNewPage.expectOnPage();
  });
});
```

## Running Tests During Development

```bash
# Run tests in UI mode (best for development)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/specs/my-test.spec.ts

# Run only tests matching a pattern
npx playwright test -g "should login"
```

## Common Assertions

```typescript
// URL assertions
await expect(page).toHaveURL(/\/expected-path/);
await expect(page).toHaveURL('http://localhost:5173/exact-path');

// Element visibility
await expect(element).toBeVisible();
await expect(element).not.toBeVisible();
await expect(element).toBeHidden();

// Text content
await expect(element).toContainText('expected text');
await expect(element).toHaveText('exact text');

// Form elements
await expect(input).toHaveValue('expected value');
await expect(input).toBeEnabled();
await expect(input).toBeDisabled();
await expect(checkbox).toBeChecked();

// Count
await expect(elements).toHaveCount(5);

// Focus
await expect(element).toBeFocused();

// Attributes
await expect(element).toHaveAttribute('aria-label', 'expected label');
await expect(element).toHaveClass(/active/);
```

## Common Actions

```typescript
// Click
await element.click();
await element.dblclick();

// Type
await input.fill('text');
await input.type('text with delay');
await input.clear();

// Keyboard
await page.keyboard.press('Enter');
await page.keyboard.press('Tab');
await page.keyboard.type('text');

// Select
await select.selectOption('value');
await select.selectOption({ label: 'Label' });

// Hover
await element.hover();

// Drag and drop
await element.dragTo(target);

// File upload
await input.setInputFiles('/path/to/file');
```

## Accessibility Testing

Include accessibility checks in your tests:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/my-page');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

## Mobile Testing

Test touch interactions:

```typescript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/my-page');

  // Use tap instead of click
  await element.tap();

  // Check touch target sizes
  const box = await element.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});
```

## Mocking API Calls

```typescript
import { setupMockApi } from '../mocks/api';

test.beforeEach(async ({ page }) => {
  await setupMockApi(page);
});

// Or mock specific endpoints
test('custom mock', async ({ page }) => {
  await page.route('/api/v1/custom', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: 'mock data' }),
    });
  });
});
```

## Debugging Tips

1. **Use test.only() to run one test:**
   ```typescript
   test.only('debug this test', async ({ page }) => {
     // ...
   });
   ```

2. **Add page.pause() to stop execution:**
   ```typescript
   await page.pause();
   ```

3. **Take screenshots:**
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

4. **Log page content:**
   ```typescript
   console.log(await page.content());
   ```

5. **Use Playwright Inspector:**
   ```bash
   npm run test:e2e:debug
   ```

## CI/CD

Tests run automatically on:
- Push to feature branches
- Pull requests to main/develop

Check GitHub Actions tab for results and download test reports from artifacts.

## Need Help?

- Read the full README: `/tests/e2e/README.md`
- Check Playwright docs: https://playwright.dev/
- Ask the team: #testing channel
