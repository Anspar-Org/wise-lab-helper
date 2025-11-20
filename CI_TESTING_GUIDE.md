# CI Testing Guide - Local Replication

This guide explains how to replicate the exact GitHub Actions CI environment on your local machine to debug failing tests.

## Quick Start

```bash
# Run with default browser (chromium-desktop)
./test-ci-locally.sh

# Run with specific browser project
PROJECT=firefox-desktop ./test-ci-locally.sh
PROJECT=webkit-desktop ./test-ci-locally.sh

# Run mobile tests
PROJECT=mobile-touch ./test-ci-locally.sh
```

## What the Script Does

The `test-ci-locally.sh` script mirrors the exact steps from `.github/workflows/playwright.yml`:

1. ✓ **Pre-flight checks** - Verifies Docker, Node.js, and port availability
2. ✓ **Clean dependency install** - Runs `npm ci` (clean install, not `npm install`)
3. ✓ **Start PostgreSQL** - Launches test database on port 5433
4. ✓ **Wait for DB health** - Polls `pg_isready` with 60s timeout
5. ✓ **Run migrations** - Executes schema migrations against test DB
6. ✓ **Seed test data** - Populates database with E2E fixtures
7. ✓ **Start services** - Launches API (port 3001) and Vite (port 5173) in containers
8. ✓ **Wait for services** - Polls health endpoints with 120s timeout
9. ✓ **Install Playwright** - Downloads browser binaries
10. ✓ **Run E2E tests** - Executes Playwright tests with CI environment vars
11. ✓ **Show results** - Displays test summary and logs on failure
12. ✓ **Cleanup** - Tears down containers and volumes (runs automatically)

## Environment Variables

The script sets these environment variables to match CI:

```bash
# Database connection
DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test

# Docker Compose settings
COMPOSE_HTTP_TIMEOUT=200

# Playwright settings
CI=true
PLAYWRIGHT_SKIP_SERVER=true
BASE_URL=http://localhost:5173
```

## Available Test Projects

The workflow runs tests across multiple browser configurations:

**Desktop Browsers:**
- `chromium-desktop` (1920x1000) - Default
- `firefox-desktop` (1920x1000)
- `webkit-desktop` (1920x1000)
- `chromium-scaled` (1600x900)

**Mobile Viewports:**
- `mobile-touch` (iPad Pro, 768x1024, touch enabled)
- `mobile-portrait` (iPad Mini, 768x1024, touch enabled)

**Specific Test Suites:**
- Accessibility tests: Run directly with `npm run test:e2e -- tests/e2e/specs/accessibility.spec.ts`

## Debugging Failed Tests

### 1. Check Service Health

```bash
# API health
curl http://localhost:3001/health | jq

# Expected response:
{
  "status": "healthy",
  "timestamp": "...",
  "database": "connected",
  "localOnly": false
}

# Web server
curl http://localhost:5173
# Should return HTML
```

### 2. View Container Logs

```bash
# All containers
docker compose -f docker-compose.test.yml logs

# Specific service
docker compose -f docker-compose.test.yml logs db-test
docker compose -f docker-compose.test.yml logs api-test
docker compose -f docker-compose.test.yml logs web-test

# Follow logs in real-time
docker compose -f docker-compose.test.yml logs -f api-test
```

### 3. Check Database State

```bash
# Connect to test database
docker compose -f docker-compose.test.yml exec db-test psql -U postgres -d stemlab_test

# Check migrations
\dt

# Check seeded data
SELECT * FROM users;
SELECT * FROM lessons;
SELECT * FROM skills;
SELECT * FROM badges;
```

### 4. Inspect Test Results

```bash
# View HTML report
cd apps/web
npm run test:e2e:report

# Test results directory
ls -la apps/web/test-results/
ls -la apps/web/playwright-report/
```

### 5. Run Tests Interactively

```bash
# After script completes (keep containers running)
cd apps/web

# UI mode (interactive)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug

# Specific test file
npx playwright test tests/e2e/specs/auth.spec.ts --headed
```

### 6. Common Issues

#### Port Conflicts

```bash
# Check what's using a port
lsof -i :5433
lsof -i :3001
lsof -i :5173

# Kill process on port
kill -9 $(lsof -t -i:5433)
```

#### Database Connection Errors

```bash
# Verify database is running
docker compose -f docker-compose.test.yml ps

# Check database logs
docker compose -f docker-compose.test.yml logs db-test

# Manually test connection
psql postgresql://postgres:testpassword@localhost:5433/stemlab_test
```

#### Container Build Failures

```bash
# Rebuild containers without cache
docker compose -f docker-compose.test.yml build --no-cache

# Remove all related images
docker compose -f docker-compose.test.yml down --rmi all

# Check Dockerfile
cat docker/Dockerfile.api
cat docker/Dockerfile.web
```

#### Migration Failures

```bash
# Check migration status
cd packages/database
npm run migrate:up -- --dry-run

# Rollback migrations
npm run migrate:down

# Re-run migrations
export DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test
npm run migrate:up
```

#### Seeding Failures

```bash
# Check seed script
cat packages/database/seed-e2e.js

# Run manually with debug output
export DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test
node packages/database/seed-e2e.js
```

### 7. Manual Step-by-Step Execution

If the automated script fails, run steps manually:

```bash
# 1. Clean install
npm ci

# 2. Start database only
docker compose -f docker-compose.test.yml up -d db-test

# 3. Wait and verify
sleep 10
docker compose -f docker-compose.test.yml exec db-test pg_isready -U postgres

# 4. Run migrations
export DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test
npm run migrate:up --workspace=packages/database

# 5. Seed database
npm run seed:e2e --workspace=packages/database

# 6. Start API and web
docker compose -f docker-compose.test.yml up -d api-test web-test

# 7. Verify services
sleep 15
curl http://localhost:3001/health
curl http://localhost:5173

# 8. Install Playwright browsers
cd apps/web
npx playwright install --with-deps chromium

# 9. Run tests
export CI=true
export PLAYWRIGHT_SKIP_SERVER=true
export BASE_URL=http://localhost:5173
npm run test:e2e -- --project=chromium-desktop

# 10. Cleanup
cd ../..
docker compose -f docker-compose.test.yml down -v
```

## Differences Between CI and Local

| Aspect | CI (GitHub Actions) | Local (This Script) |
|--------|---------------------|---------------------|
| Environment | Ubuntu 22.04 (fresh) | Your OS/machine |
| Docker | Preinstalled | Your Docker installation |
| Node.js | Exactly 20.x from setup-node | Your installed version (must be 20+) |
| Network | Isolated GitHub runner | Your network |
| Caching | GitHub Actions cache | Local Docker cache |
| Parallelism | Matrix runs 3 browsers in parallel | Runs one project at a time |
| Artifacts | Uploaded to GitHub | Saved to apps/web/playwright-report/ |
| Cleanup | Always runs | Automatic via trap |

## Performance Optimization

### Speed Up Runs

```bash
# Skip dependency install if already done
# Comment out the npm ci step in the script

# Reuse existing containers (manual mode)
docker compose -f docker-compose.test.yml up -d db-test
# ... keep containers running between test runs

# Run only specific tests
cd apps/web
npx playwright test tests/e2e/specs/specific-test.spec.ts
```

### Reduce Test Time

```bash
# Run in single browser only
PROJECT=chromium-desktop ./test-ci-locally.sh

# Run specific test file
cd apps/web
npx playwright test tests/e2e/specs/auth.spec.ts --project=chromium-desktop
```

## CI Matrix Simulation

To fully replicate the CI matrix locally (run all browser projects):

```bash
#!/bin/bash
# Run all desktop browser tests
for project in chromium-desktop firefox-desktop webkit-desktop; do
    echo "Testing $project..."
    PROJECT=$project ./test-ci-locally.sh || echo "$project FAILED"
done

# Run mobile tests
for project in mobile-touch mobile-portrait; do
    echo "Testing $project..."
    PROJECT=$project ./test-ci-locally.sh || echo "$project FAILED"
done
```

## Troubleshooting Checklist

Before running tests, verify:

- [ ] Docker Desktop is running
- [ ] No containers from previous runs: `docker compose -f docker-compose.test.yml ps`
- [ ] Ports 5433, 3001, 5173 are free
- [ ] Node.js version >= 20: `node -v`
- [ ] Docker Compose v2 is available: `docker compose version`
- [ ] You're in the project root directory
- [ ] No local `.env` files interfering with test environment

After tests fail, check:

- [ ] Container status: `docker compose -f docker-compose.test.yml ps`
- [ ] Service logs: `docker compose -f docker-compose.test.yml logs`
- [ ] Database connectivity: `psql postgresql://postgres:testpassword@localhost:5433/stemlab_test`
- [ ] API health: `curl http://localhost:3001/health`
- [ ] Web server: `curl http://localhost:5173`
- [ ] Test reports in `apps/web/playwright-report/`

## Getting Help

If tests fail locally but you can't identify the issue:

1. Capture full output: `./test-ci-locally.sh 2>&1 | tee test-output.log`
2. Save container logs: `docker compose -f docker-compose.test.yml logs > docker-logs.txt`
3. Export test reports from `apps/web/playwright-report/`
4. Check GitHub Actions logs for comparison

## Advanced Debugging

### Attach to Running Containers

```bash
# Shell into API container
docker compose -f docker-compose.test.yml exec api-test sh

# Shell into web container
docker compose -f docker-compose.test.yml exec web-test sh

# Shell into database
docker compose -f docker-compose.test.yml exec db-test psql -U postgres -d stemlab_test
```

### Network Inspection

```bash
# Inspect test network
docker network inspect stemlab_test-network

# Check container networking
docker compose -f docker-compose.test.yml exec api-test ping db-test
docker compose -f docker-compose.test.yml exec web-test curl http://api-test:3001/health
```

### Volume Inspection

```bash
# List volumes
docker volume ls | grep stemlab-test

# Inspect database volume
docker volume inspect stemlab_test_db-data

# Remove volumes manually
docker volume rm stemlab_test_db-data
```

## Next Steps

After fixing issues locally:

1. Run the full test suite: `./test-ci-locally.sh`
2. Test all browser projects (see "CI Matrix Simulation" above)
3. Verify changes don't break existing tests
4. Commit and push to trigger CI
5. Monitor GitHub Actions for consistency with local results

If local tests pass but CI fails, check for:
- Environment-specific issues (OS differences)
- Network/firewall issues in GitHub Actions
- Docker image architecture differences (arm64 vs amd64)
- Timing issues (CI might be slower/faster)
- Dependency version mismatches
