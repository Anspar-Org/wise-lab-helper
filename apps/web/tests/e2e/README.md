# E2E Testing Guide - Full Stack Real API Testing

## Overview

This directory contains **true end-to-end tests** that run against the full application stack:
- **Frontend**: Vite dev server (React app on port 5173)
- **Backend**: Express API server (port 3001)
- **Database**: PostgreSQL 16 (port 5433 for tests)

These tests use **real API calls** and **real database operations** - no mocking!

## Architecture

```
┌─────────────────┐
│  Playwright     │
│  (Browser)      │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Vite Server    │────▶│  Express API    │
│  (Port 5173)    │     │  (Port 3001)    │
└─────────────────┘     └────────┬────────┘
                                 │ SQL
                                 ▼
                        ┌─────────────────┐
                        │  PostgreSQL     │
                        │  (Port 5433)    │
                        └─────────────────┘
```

## Running E2E Tests

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and npm installed
- All project dependencies installed (`npm install` from project root)

### Option 1: Using Docker Compose (Recommended)

This is the approach used in CI and ensures a clean, isolated environment.

```bash
# 1. Start the full stack with Docker Compose
docker compose -f docker-compose.test.yml up -d

# 2. Wait for services to be healthy
docker compose -f docker-compose.test.yml ps

# 3. Seed the test database
npm run seed:e2e --workspace=packages/database

# 4. Install Playwright browsers (first time only)
cd apps/web && npx playwright install --with-deps

# 5. Run the tests
cd apps/web && PLAYWRIGHT_SKIP_SERVER=true npm run test:e2e

# 6. Cleanup when done
docker compose -f docker-compose.test.yml down -v
```

### Option 2: Manual Setup (Local Development)

Useful for debugging or when you want more control.

```bash
# 1. Start PostgreSQL test database
docker compose -f docker-compose.test.yml up -d db-test

# 2. Set environment variables
export DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test

# 3. Run migrations
cd packages/database && npm run migrate:up

# 4. Seed test data
npm run seed:e2e --workspace=packages/database

# 5. Start API server in one terminal
cd apps/api && npm run dev

# 6. Start web server in another terminal
cd apps/web && npm run dev

# 7. Run tests in a third terminal
cd apps/web && PLAYWRIGHT_SKIP_SERVER=true npm run test:e2e
```

### Specific Test Runs

```bash
# Run specific browser
npm run test:e2e:chromium  # Chromium only
npm run test:e2e:firefox   # Firefox only
npm run test:e2e:webkit    # WebKit only

# Run mobile tests
npm run test:e2e:mobile

# Run specific test file
npx playwright test tests/e2e/specs/auth.spec.ts

# Run in headed mode (see the browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run with UI mode
npx playwright test --ui
```

## Test Data

Test data is seeded before each test run via `packages/database/seed-e2e.js`.

**Students:**
- `testStudent1` (PIN: `1234`, Grade 3)
- `youngLearner` (Animal Grid: cat, dog, bird, fish, Grade K)

**Coaches:**
- `coach1@test.com` (Password: `TestPassword123!`)

**Lessons, Skills, Badges:**
- See `packages/database/seed-e2e.js` for complete test data

## Test Organization

```
tests/e2e/
├── specs/               # Test files (*.spec.ts)
│   ├── auth.spec.ts    # Authentication flows
│   ├── navigation.spec.ts
│   ├── responsive.spec.ts
│   └── accessibility.spec.ts
├── pages/               # Page Object Models
├── helpers/             # Test helper functions
├── fixtures/            # Playwright fixtures and test data
└── README.md           # This file
```

## Writing New Tests

### Use Real API Calls

```typescript
test('should create a new lesson', async ({ page }) => {
  await page.goto('/coach/lessons/new');

  // Fill form - this will make REAL API calls
  await page.fill('[name="title"]', 'My New Lesson');
  await page.fill('[name="description"]', 'Test lesson');
  await page.click('button[type="submit"]');

  // Verify - checks REAL database state
  await expect(page).toHaveURL(/\/coach\/lessons\/\d+/);
  await expect(page.locator('h1')).toContainText('My New Lesson');
});
```

### No Mocking Required

Tests automatically use the real backend - no mock setup needed!

```typescript
// ✅ NEW WAY (real E2E):
test('should login', async ({ page }) => {
  // Just test - real API is already running
  await page.goto('/login');
  await page.fill('[data-testid="username"]', 'testStudent1');
  await page.fill('[data-testid="pin"]', '1234');
  await page.click('button[type="submit"]');

  // This hits the REAL API and REAL database!
  await expect(page).toHaveURL(/\/student\/dashboard/);
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

## Debugging

### View Docker Logs

```bash
# View all service logs
docker compose -f docker-compose.test.yml logs

# Follow logs in real-time
docker compose -f docker-compose.test.yml logs -f

# View specific service logs
docker compose -f docker-compose.test.yml logs api-test
docker compose -f docker-compose.test.yml logs db-test
```

### Inspect Database

```bash
# Connect to test database
docker compose -f docker-compose.test.yml exec db-test psql -U postgres -d stemlab_test

# Run SQL queries
SELECT * FROM users;
SELECT * FROM lessons;
```

### Playwright Inspector

```bash
# Run with inspector
npx playwright test --debug

# Generate screenshots on failure (already configured)
# Check apps/web/test-results/ after test run
```

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

## CI/CD Integration

GitHub Actions workflow (`.github/workflows/playwright.yml`) automatically:

1. Starts Docker Compose stack
2. Waits for services to be healthy
3. Seeds test database
4. Runs Playwright tests across all browsers
5. Uploads test reports and screenshots
6. Cleans up Docker containers

No manual intervention needed!

## Common Issues

### Port Conflicts

If ports 3001, 5173, or 5433 are in use:

```bash
# Check what's using the ports
lsof -i :3001
lsof -i :5173
lsof -i :5433

# Stop conflicting services or modify docker-compose.test.yml ports
```

### Database Connection Errors

```bash
# Ensure database is healthy
docker compose -f docker-compose.test.yml ps

# Restart database
docker compose -f docker-compose.test.yml restart db-test

# Check logs
docker compose -f docker-compose.test.yml logs db-test
```

### Tests Timing Out

Tests may timeout if services aren't fully ready. Increase timeouts in `playwright.config.ts`:

```typescript
timeout: 30 * 1000,  // Increase to 60 * 1000 if needed
```

## Best Practices

1. **Always clean up**: Run `docker-compose down -v` after testing to avoid stale data
2. **Use Page Objects**: Keep tests maintainable with the Page Object pattern
3. **Test real user flows**: Focus on complete user journeys, not isolated UI components
4. **Verify data persistence**: Check that data survives page reloads and sessions
5. **Test error handling**: Verify real backend errors are handled correctly
6. **Keep tests independent**: Each test should be able to run in isolation

## Performance

- **Full stack startup**: ~30-60 seconds (Docker Compose + health checks)
- **Test database seeding**: ~2-5 seconds
- **Average test run**: ~2-10 seconds per test
- **Total E2E suite**: ~5-10 minutes (all browsers in parallel)

## Migration from Mock Tests

The mock infrastructure has been removed. All tests now run against the real API.

**What changed:**
- ❌ Removed: `tests/e2e/mocks/` directory
- ❌ Removed: `setupMockApi()` calls
- ✅ Added: Docker Compose test environment
- ✅ Added: Database seeding script
- ✅ Added: Real full-stack orchestration

**Benefits:**
- Test real integration between frontend, backend, and database
- Catch authentication bugs (JWT, sessions, CORS)
- Verify data persistence and migrations
- Test FERPA/COPPA compliance features
- Confidence in production deployment

## Questions?

See:
- `docker-compose.test.yml` - Service configuration
- `packages/database/seed-e2e.js` - Test data setup
- `.github/workflows/playwright.yml` - CI configuration
- `playwright.config.ts` - Playwright settings
