# Pre-Push Checklist for CI Success

Use this checklist before pushing code to ensure GitHub Actions CI will pass.

## Quick Verification (5 minutes)

```bash
# Run the CI replication script
./test-ci-locally.sh
```

If the script passes, you're ready to push! If not, follow the detailed checklist below.

---

## Detailed Pre-Push Checklist

### 1. Code Quality Checks

- [ ] **Linting passes**
  ```bash
  npm run lint
  ```

- [ ] **TypeScript compiles without errors**
  ```bash
  npm run build
  ```

- [ ] **No console.log or debug statements** (unless intentional)
  ```bash
  git diff HEAD | grep -i "console.log"
  ```

### 2. Unit Tests

- [ ] **All unit tests pass**
  ```bash
  npm test
  ```

- [ ] **Coverage meets threshold** (>80%)
  ```bash
  npm run test:coverage --workspace=apps/api
  ```

- [ ] **New code has tests**
  ```bash
  # Verify test files exist for new features
  git diff HEAD --name-only | grep -E "\.test\.ts$"
  ```

### 3. Database Changes

- [ ] **Migrations are idempotent** (can run multiple times safely)
  ```bash
  # Test migration up/down
  cd packages/database
  export DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test
  npm run migrate:down
  npm run migrate:up
  npm run migrate:down
  npm run migrate:up
  ```

- [ ] **Seed script works with new schema**
  ```bash
  npm run seed:e2e --workspace=packages/database
  ```

- [ ] **No breaking changes to existing tables** (without migration plan)

### 4. API Changes

- [ ] **All API endpoints return expected responses**
  ```bash
  # Start local API
  docker compose up -d db
  npm run dev --workspace=apps/api
  
  # Test endpoints
  curl http://localhost:3001/health
  curl http://localhost:3001/api/v1/...
  ```

- [ ] **CORS configuration allows frontend** (`http://localhost:5173`)

- [ ] **Environment variables documented** (in `.env.example` if new)

- [ ] **No hardcoded secrets or passwords**
  ```bash
  git diff HEAD | grep -iE "(password|secret|key|token)" | grep -v "env.example"
  ```

### 5. Frontend Changes

- [ ] **Vite dev server starts without errors**
  ```bash
  npm run dev --workspace=apps/web
  # Check http://localhost:5173
  ```

- [ ] **No TypeScript errors in web app**
  ```bash
  npm run build --workspace=apps/web
  ```

- [ ] **API calls use correct environment variable** (`VITE_API_URL`)

### 6. Docker & Infrastructure

- [ ] **Docker Compose test config is valid**
  ```bash
  docker compose -f docker-compose.test.yml config
  ```

- [ ] **Dockerfiles build successfully**
  ```bash
  docker compose -f docker-compose.test.yml build --no-cache
  ```

- [ ] **Health checks are defined** for all services

- [ ] **Containers start and become healthy**
  ```bash
  docker compose -f docker-compose.test.yml up -d
  docker compose -f docker-compose.test.yml ps
  # All services should show "healthy"
  ```

### 7. E2E Tests (Critical!)

- [ ] **Run full CI replication script**
  ```bash
  ./test-ci-locally.sh
  ```

- [ ] **Test all browser projects** (if UI changes)
  ```bash
  PROJECT=chromium-desktop ./test-ci-locally.sh
  PROJECT=firefox-desktop ./test-ci-locally.sh
  PROJECT=webkit-desktop ./test-ci-locally.sh
  ```

- [ ] **Mobile tests pass** (if touch/responsive changes)
  ```bash
  PROJECT=mobile-touch ./test-ci-locally.sh
  ```

- [ ] **Accessibility tests pass** (if UI changes)
  ```bash
  cd apps/web
  npm run test:e2e -- tests/e2e/specs/accessibility.spec.ts
  ```

- [ ] **No flaky tests** (run tests 2-3 times to confirm stability)

- [ ] **Screenshots/videos show expected behavior**
  ```bash
  # Review test artifacts
  open apps/web/playwright-report/index.html
  ```

### 8. Dependencies

- [ ] **No high-severity npm vulnerabilities**
  ```bash
  npm audit --audit-level=high
  ```

- [ ] **New dependencies are justified** and documented

- [ ] **Package.json and package-lock.json are in sync**
  ```bash
  npm ci
  # Should complete without modifications
  ```

- [ ] **Workspace dependencies are correct**
  ```bash
  npm run build
  # All workspaces should build
  ```

### 9. Documentation

- [ ] **CLAUDE.md is updated** (if development workflow changes)

- [ ] **README.md is updated** (if setup process changes)

- [ ] **API documentation matches code** (if endpoints changed)

- [ ] **Comments explain complex logic**

### 10. Git & Version Control

- [ ] **Commits are on a feature branch** (not main)
  ```bash
  git branch
  # Should NOT be on 'main'
  ```

- [ ] **Commit messages are descriptive**
  ```bash
  git log --oneline -5
  ```

- [ ] **No merge conflicts**
  ```bash
  git status
  # Should show clean working tree
  ```

- [ ] **All changes are committed**
  ```bash
  git status
  # No untracked or modified files (unless intentional)
  ```

- [ ] **Sensitive files are in .gitignore**
  ```bash
  git status --ignored
  # Check for .env, secrets, credentials
  ```

---

## Final Pre-Push Command Sequence

Run these commands in order. If any fail, fix before pushing:

```bash
# 1. Clean dependency state
npm ci

# 2. Lint & type check
npm run lint
npm run build

# 3. Unit tests
npm test

# 4. Full CI replication (E2E tests)
./test-ci-locally.sh

# 5. Verify git state
git status
git log --oneline -3

# 6. Push (if all passed)
git push origin YOUR_BRANCH_NAME
```

---

## Red Flags (DO NOT PUSH if you see these)

🚨 **Stop and fix these issues immediately:**

- [ ] Tests are failing locally
- [ ] Docker containers won't start
- [ ] Database migrations fail
- [ ] TypeScript compilation errors
- [ ] Linting errors
- [ ] Unresolved merge conflicts
- [ ] Secrets/credentials in code
- [ ] Breaking changes without plan
- [ ] Missing test coverage for new features
- [ ] Flaky tests (pass/fail randomly)

---

## What CI Will Check

GitHub Actions will run these jobs in parallel:

1. **Desktop E2E Tests** (chromium, firefox, webkit)
   - ~3-5 minutes per browser
   - Full database + API + web stack
   - All E2E test specs

2. **Mobile E2E Tests** (iPad Pro, iPad Mini)
   - ~3-5 minutes
   - Touch interaction testing
   - Responsive design validation

3. **Accessibility Tests**
   - ~2-3 minutes
   - WCAG compliance checks
   - Keyboard navigation

**Total CI time:** ~10-15 minutes for all jobs

---

## Troubleshooting CI Failures

If CI fails after pushing:

1. **Check GitHub Actions logs**
   - Go to repository → Actions tab
   - Click on failed workflow run
   - Expand failed steps to see error messages

2. **Compare with local run**
   ```bash
   # Pull latest code
   git pull origin YOUR_BRANCH_NAME
   
   # Run CI script with same browser that failed
   PROJECT=chromium-desktop ./test-ci-locally.sh
   ```

3. **Look for environment differences**
   - Node.js version mismatch (CI uses 20.x)
   - Docker image architecture (amd64 vs arm64)
   - Network timeouts (CI may be slower)
   - Timing issues in tests

4. **Check recent changes**
   ```bash
   # See what changed
   git diff main...HEAD
   
   # Check if specific file is causing issue
   git log --oneline --follow path/to/failing/file
   ```

5. **Review CI workflow file**
   ```bash
   cat .github/workflows/playwright.yml
   # Compare steps with test-ci-locally.sh
   ```

---

## Quick Reference Commands

```bash
# Run CI locally (default chromium)
./test-ci-locally.sh

# Run specific browser
PROJECT=firefox-desktop ./test-ci-locally.sh

# Run all browsers (full matrix)
for p in chromium-desktop firefox-desktop webkit-desktop; do
  PROJECT=$p ./test-ci-locally.sh || echo "$p failed"
done

# Manual cleanup if script fails
docker compose -f docker-compose.test.yml down -v

# View test reports
cd apps/web && npm run test:e2e:report

# Check what's using ports
lsof -i :5433
lsof -i :3001
lsof -i :5173

# Full reset (nuclear option)
docker compose -f docker-compose.test.yml down -v --rmi all
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm ci
./test-ci-locally.sh
```

---

## Success Criteria

✅ You're ready to push when:

1. `./test-ci-locally.sh` completes successfully
2. All unit tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Build succeeds (`npm run build`)
5. No unintended files in git status
6. Commit messages are clear
7. Documentation is updated
8. Feature branch is up to date with main

**Happy pushing! 🚀**
