# GitHub Actions CI Environment Analysis Report

**Generated:** 2025-11-20  
**Workflow:** `.github/workflows/playwright.yml`  
**Purpose:** Replicate CI testing environment locally for debugging

---

## Executive Summary

The GitHub Actions CI workflow runs full-stack E2E tests using Docker Compose to orchestrate PostgreSQL, Express API, and Vite web server. The workflow executes 13 critical steps across 3 parallel jobs (desktop browsers, mobile browsers, accessibility tests).

**Key Finding:** The CI workflow runs migrations and seeding from the GitHub Actions runner (host), NOT from within Docker containers. This is a critical architectural detail that must be replicated locally.

---

## CI Workflow Architecture

### Jobs Overview

| Job | Matrix | Browsers | Purpose |
|-----|--------|----------|---------|
| `test` | 3 runs | chromium, firefox, webkit | Desktop browser testing |
| `test-mobile` | 1 run | chromium (iPad viewports) | Mobile/tablet testing |
| `accessibility` | 1 run | chromium | WCAG compliance testing |
| `results` | 1 run | N/A | Combine and report results |

**Total Parallel Runs:** 5 (3 desktop + 1 mobile + 1 a11y)

### Step-by-Step Execution Flow

Each test job follows this 13-step sequence:

#### Phase 1: Setup (Steps 1-3)
1. **Checkout code** - Clone repository
2. **Setup Node.js 20** - Install with npm cache
3. **Install dependencies** - Run `npm ci` (clean install)

#### Phase 2: Database (Steps 4-7)
4. **Start database** - `docker compose up -d db-test`
5. **Wait for health** - Poll `pg_isready` (60s timeout)
6. **Run migrations** - `npm run migrate:up` **from host**
7. **Seed test data** - `npm run seed:e2e` **from host**

#### Phase 3: Services (Steps 8-9)
8. **Start API + Web** - `docker compose up -d api-test web-test`
9a. **Wait for API** - Poll `/health` endpoint (120s timeout)
9b. **Wait for Web** - Poll Vite dev server (120s timeout)

#### Phase 4: Testing (Steps 10-11)
10. **Install Playwright** - Download browser binaries
11. **Run E2E tests** - Execute Playwright with CI flags

#### Phase 5: Reporting (Steps 12-13)
12. **Upload artifacts** - Save reports to GitHub
13. **Cleanup** - `docker compose down -v` (always runs)

---

## Critical Architecture Insights

### 1. Migration & Seeding Strategy

**Important:** Migrations and seeding run from the GitHub Actions runner, NOT from Docker containers.

```yaml
# From workflow:
- name: Run database migrations
  run: npm run migrate:up --workspace=packages/database
  env:
    DATABASE_URL: postgresql://postgres:testpassword@localhost:5433/stemlab_test

- name: Seed test database
  run: npm run seed:e2e --workspace=packages/database
  env:
    DATABASE_URL: postgresql://postgres:testpassword@localhost:5433/stemlab_test
```

**Rationale:** 
- Ensures migrations run before containers start
- Uses same migration tool as development
- Easier debugging (logs visible in CI output)

### 2. Container Startup Order

Containers have explicit dependencies:

```yaml
# docker-compose.test.yml
db-test:
  healthcheck: pg_isready -U postgres

api-test:
  depends_on:
    db-test:
      condition: service_healthy  # Waits for DB health

web-test:
  depends_on:
    api-test:
      condition: service_healthy  # Waits for API health
```

**Startup sequence:**
1. `db-test` starts → health check passes
2. `api-test` starts → health check passes
3. `web-test` starts → health check passes

### 3. Port Mapping Strategy

Test environment uses different ports to avoid conflicts:

| Service | Container Port | Host Port | Reason |
|---------|----------------|-----------|--------|
| Database | 5432 | 5433 | Avoid conflict with dev DB on 5432 |
| API | 3001 | 3001 | Same as dev (no conflict) |
| Web | 5173 | 5173 | Vite default (no conflict) |

### 4. Network Architecture

All services run on isolated bridge network:

```
┌─────────────────────────────────────────┐
│  GitHub Actions Runner (Host)           │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  test-network (Docker Bridge)      │ │
│  │                                    │ │
│  │  ┌──────────┐  ┌──────────┐      │ │
│  │  │ db-test  │  │ api-test │      │ │
│  │  │ :5432    │◄─┤ :3001    │      │ │
│  │  └──────────┘  └──────────┘      │ │
│  │                     ▲             │ │
│  │                     │             │ │
│  │                ┌────┴──────┐     │ │
│  │                │ web-test  │     │ │
│  │                │ :5173     │     │ │
│  │                └───────────┘     │ │
│  └────────────────────────────────┘ │
│                                      │
│  Playwright Tests (Host)             │
│  → http://localhost:5173             │
└──────────────────────────────────────┘
```

**Communication paths:**
- **web-test** → **api-test**: Uses container name `http://api-test:3001`
- **api-test** → **db-test**: Uses container name `postgresql://...@db-test:5432`
- **Playwright** → **web-test**: Uses host port `http://localhost:5173`
- **Migrations** → **db-test**: Uses host port `postgresql://...@localhost:5433`

---

## Environment Variables

### Database Configuration

```bash
# Used by migration and seed scripts (runs on host)
DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test

# Used by API container
DATABASE_URL=postgresql://postgres:testpassword@db-test:5432/stemlab_test
```

**Note:** Different `DATABASE_URL` for host vs containers!

### Playwright Configuration

```bash
CI=true                      # Enables CI-specific behavior
PLAYWRIGHT_SKIP_SERVER=true  # Don't start dev server (already running)
BASE_URL=http://localhost:5173  # Test against this URL
```

### Docker Compose Configuration

```bash
COMPOSE_HTTP_TIMEOUT=200     # Increase timeout for slow networks
NODE_ENV=test                # Test environment mode
```

---

## Key Differences: CI vs Local Development

| Aspect | CI (GitHub Actions) | Local Dev |
|--------|---------------------|-----------|
| OS | Ubuntu 22.04 (fresh VM) | Your machine |
| Docker | Preinstalled v2 | Your Docker version |
| Node.js | Exactly 20.x | Your installed version |
| npm cache | GitHub Actions cache | Local cache |
| Database state | Fresh (no data) | May have existing data |
| Port availability | Always available | May have conflicts |
| Network isolation | Complete | Shared with other services |
| Cleanup | Always runs | Often forgotten |
| Parallelism | Matrix runs parallel | Single run (in script) |
| Artifacts | Uploaded to GitHub | Local files |
| Timeout enforcement | Strict | May hang indefinitely |

---

## Potential Failure Points

### High Priority (Most Likely to Fail)

1. **Database migration timing**
   - **Symptom:** Migrations fail or timeout
   - **Cause:** Database not ready when migrations run
   - **Fix:** Increase health check timeout, verify `pg_isready`

2. **Container build failures**
   - **Symptom:** `docker compose up` fails
   - **Cause:** npm install fails, Dockerfile errors
   - **Fix:** Check Dockerfile.api and Dockerfile.web, rebuild without cache

3. **API health check timeout**
   - **Symptom:** API doesn't respond within 120s
   - **Cause:** Slow startup, database connection issues
   - **Fix:** Check API logs, verify DATABASE_URL

4. **Port conflicts**
   - **Symptom:** "Address already in use"
   - **Cause:** Previous test run didn't cleanup
   - **Fix:** Stop existing containers, check `lsof -i :PORT`

### Medium Priority

5. **Seed data conflicts**
   - **Symptom:** Seed script fails with constraint violations
   - **Cause:** Database not properly cleared
   - **Fix:** Ensure TRUNCATE CASCADE runs before seeding

6. **Playwright browser missing**
   - **Symptom:** "Browser not found"
   - **Cause:** Browser binaries not installed
   - **Fix:** Run `npx playwright install --with-deps`

7. **Network timeouts**
   - **Symptom:** curl timeout errors
   - **Cause:** Services slow to start
   - **Fix:** Increase timeout values, check health checks

### Low Priority

8. **Node version mismatch**
   - **Symptom:** Dependency install errors
   - **Cause:** Local Node.js < 20
   - **Fix:** Upgrade Node.js or use nvm

9. **Docker architecture mismatch**
   - **Symptom:** "exec format error"
   - **Cause:** arm64 vs amd64 images
   - **Fix:** Use platform-specific images

10. **Volume permission issues**
    - **Symptom:** "Permission denied" in containers
    - **Cause:** File ownership conflicts
    - **Fix:** Check volume mounts, use :z flag if SELinux

---

## Delivered Solutions

### 1. Local Testing Script

**File:** `test-ci-locally.sh`

**Features:**
- Mirrors exact CI workflow steps
- Color-coded output for easy debugging
- Pre-flight checks (Docker, Node, ports)
- Automatic cleanup on exit
- Health check polling with timeouts
- Project selection via environment variable
- Detailed error messages

**Usage:**
```bash
# Default (chromium)
./test-ci-locally.sh

# Specific browser
PROJECT=firefox-desktop ./test-ci-locally.sh
```

### 2. Comprehensive Testing Guide

**File:** `CI_TESTING_GUIDE.md`

**Contents:**
- Quick start guide
- Step-by-step explanation
- Environment variables reference
- Debugging techniques
- Common issues and solutions
- Manual execution steps
- Performance optimization
- CI matrix simulation

### 3. Pre-Push Checklist

**File:** `PRE_PUSH_CHECKLIST.md`

**Contents:**
- Quick verification (5 min)
- Detailed checklist (code quality, tests, Docker, docs)
- Final command sequence
- Red flags (stop conditions)
- Troubleshooting for CI failures
- Success criteria

### 4. Quick Reference Card

**File:** `CI_QUICK_REFERENCE.md`

**Contents:**
- One-liner commands
- Port map
- Service health checks
- Failure troubleshooting tree
- Emergency reset procedures
- Pre-push short version

---

## Testing Strategy

### Local Development Workflow

```bash
# 1. Make changes to code
vim apps/api/src/...

# 2. Run unit tests
npm test --workspace=apps/api

# 3. Run E2E tests locally
./test-ci-locally.sh

# 4. If passed, push
git push origin feature-branch
```

### Iterative Debugging

```bash
# 1. Run test script
./test-ci-locally.sh

# 2. If fails, check logs
docker compose -f docker-compose.test.yml logs api-test

# 3. Fix issue
vim apps/api/src/...

# 4. Keep containers running, re-run tests only
cd apps/web
npm run test:e2e -- --project=chromium-desktop

# 5. Repeat until passing

# 6. Full verification
./test-ci-locally.sh
```

### Multi-Browser Testing

```bash
#!/bin/bash
# Test all browsers like CI does
for project in chromium-desktop firefox-desktop webkit-desktop; do
    echo "Testing $project..."
    if ! PROJECT=$project ./test-ci-locally.sh; then
        echo "❌ $project FAILED"
        exit 1
    fi
done
echo "✅ All browsers passed!"
```

---

## Debugging Techniques

### 1. Progressive Isolation

Run steps individually to isolate failure:

```bash
# Start database only
docker compose -f docker-compose.test.yml up -d db-test

# Test database connectivity
psql postgresql://postgres:testpassword@localhost:5433/stemlab_test

# Run migrations manually
export DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test
npm run migrate:up --workspace=packages/database

# Seed database manually
npm run seed:e2e --workspace=packages/database

# Start API only
docker compose -f docker-compose.test.yml up -d api-test

# Test API manually
curl http://localhost:3001/health

# ... and so on
```

### 2. Log Analysis

```bash
# Follow all logs in real-time
docker compose -f docker-compose.test.yml logs -f

# Filter specific service
docker compose -f docker-compose.test.yml logs -f api-test | grep ERROR

# Show last 100 lines
docker compose -f docker-compose.test.yml logs --tail=100 api-test

# Export logs to file
docker compose -f docker-compose.test.yml logs > full-logs.txt
```

### 3. Interactive Debugging

```bash
# Shell into running container
docker compose -f docker-compose.test.yml exec api-test sh

# Inside container:
pwd                                  # /app
ls -la                               # Check files
env | grep DATABASE                  # Check env vars
curl http://db-test:5432             # Test network
npm run dev --workspace=apps/api     # Restart API manually
```

### 4. Database Inspection

```bash
# Connect to test database
docker compose -f docker-compose.test.yml exec db-test psql -U postgres -d stemlab_test

# Inside psql:
\dt                                   # List tables
\d users                              # Describe users table
SELECT * FROM users;                  # Check seed data
SELECT COUNT(*) FROM lessons;        # Verify data
```

### 5. Network Debugging

```bash
# Test container network
docker network inspect stemlab_test-network

# Ping between containers
docker compose -f docker-compose.test.yml exec api-test ping db-test

# Test API from web container
docker compose -f docker-compose.test.yml exec web-test curl http://api-test:3001/health

# Check port binding
docker compose -f docker-compose.test.yml ps
netstat -tulpn | grep -E "(5433|3001|5173)"
```

---

## Performance Considerations

### Speed Optimization

**Problem:** CI tests take 10-15 minutes. Can we speed up local testing?

**Solutions:**

1. **Keep containers running between test runs**
   ```bash
   # Start once
   docker compose -f docker-compose.test.yml up -d
   
   # Run tests multiple times
   cd apps/web
   npm run test:e2e -- --project=chromium-desktop
   
   # Cleanup when done
   docker compose -f docker-compose.test.yml down -v
   ```

2. **Run specific tests only**
   ```bash
   # Single test file
   npx playwright test tests/e2e/specs/auth.spec.ts
   
   # Single test case
   npx playwright test tests/e2e/specs/auth.spec.ts:12
   ```

3. **Use local npm cache**
   ```bash
   # First run: npm ci (clean)
   # Subsequent runs: npm install (faster, uses cache)
   ```

4. **Skip browser downloads**
   ```bash
   # Install browsers once
   npx playwright install --with-deps chromium
   
   # Don't reinstall in subsequent runs
   # (comment out step in script)
   ```

### Resource Usage

**Database:** ~50MB RAM, minimal CPU  
**API:** ~200MB RAM, minimal CPU  
**Web:** ~300MB RAM (Vite), minimal CPU  
**Playwright:** ~500MB RAM per browser, moderate CPU  

**Total:** ~1-1.5GB RAM for full test run

---

## Maintenance & Updates

### When to Update Testing Scripts

- ✅ When `.github/workflows/playwright.yml` changes
- ✅ When `docker-compose.test.yml` changes
- ✅ When adding new environment variables
- ✅ When changing database schema (migrations)
- ✅ When adding new test projects/browsers

### Keeping in Sync

```bash
# Verify script matches workflow
diff <(grep "run:" .github/workflows/playwright.yml) \
     <(grep "print_step" test-ci-locally.sh)

# Count steps
grep "^      - name:" .github/workflows/playwright.yml | wc -l
grep "print_step" test-ci-locally.sh | wc -l
```

---

## Success Metrics

After implementing these solutions, you should see:

- ✅ **100% local replication** of CI environment
- ✅ **Faster debugging** (no push → wait → fail → repeat)
- ✅ **Higher confidence** before pushing
- ✅ **Fewer CI failures** (catch issues locally)
- ✅ **Better understanding** of test infrastructure

---

## Conclusion

The CI environment uses a multi-container architecture orchestrated by Docker Compose, with migrations and seeding running from the host. The key to successful local replication is:

1. Understanding the exact step sequence
2. Using identical environment variables
3. Respecting service startup order
4. Implementing proper health checks
5. Cleaning up between runs

The delivered testing script (`test-ci-locally.sh`) automates this entire process and provides the foundation for reliable local E2E testing.

**Next Steps:**
1. Run `./test-ci-locally.sh` to test current state
2. Fix any failures using `CI_TESTING_GUIDE.md`
3. Use `PRE_PUSH_CHECKLIST.md` before every push
4. Keep `CI_QUICK_REFERENCE.md` bookmarked for quick lookups

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-20  
**Maintainer:** Project team
