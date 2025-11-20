# CI Testing Quick Reference Card

## TL;DR - I Just Want to Test Before Pushing

```bash
# Run this ONE command:
./test-ci-locally.sh

# If it passes ✅ → you can push
# If it fails ❌ → read CI_TESTING_GUIDE.md
```

---

## Common Commands

### Run Tests

```bash
# Default (chromium)
./test-ci-locally.sh

# Specific browser
PROJECT=firefox-desktop ./test-ci-locally.sh
PROJECT=webkit-desktop ./test-ci-locally.sh

# Mobile
PROJECT=mobile-touch ./test-ci-locally.sh
```

### Debugging

```bash
# View service logs
docker compose -f docker-compose.test.yml logs api-test
docker compose -f docker-compose.test.yml logs web-test
docker compose -f docker-compose.test.yml logs db-test

# Check service health
curl http://localhost:3001/health
curl http://localhost:5173

# View test report
cd apps/web && npm run test:e2e:report

# Interactive testing (after script runs)
cd apps/web
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug
```

### Cleanup

```bash
# Normal cleanup (automatic after script)
docker compose -f docker-compose.test.yml down -v

# Nuclear option (remove everything)
docker compose -f docker-compose.test.yml down -v --rmi all
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm ci
```

---

## Port Map

| Service | Port | URL |
|---------|------|-----|
| Test Database | 5433 | postgresql://postgres:testpassword@localhost:5433/stemlab_test |
| API Server | 3001 | http://localhost:3001 |
| Web Server (Vite) | 5173 | http://localhost:5173 |

---

## Service Health Checks

```bash
# Database
docker compose -f docker-compose.test.yml exec db-test pg_isready -U postgres

# API
curl http://localhost:3001/health | jq

# Web
curl -I http://localhost:5173
```

---

## Test Projects (for PROJECT= variable)

- `chromium-desktop` ← Default
- `firefox-desktop`
- `webkit-desktop`
- `chromium-scaled`
- `mobile-touch`
- `mobile-portrait`

---

## Failure Troubleshooting Tree

```
Test failed?
├─ Can't connect to database?
│  ├─ Run: docker compose -f docker-compose.test.yml logs db-test
│  └─ Check: Port 5433 available? (lsof -i :5433)
│
├─ API won't start?
│  ├─ Run: docker compose -f docker-compose.test.yml logs api-test
│  ├─ Check: curl http://localhost:3001/health
│  └─ Verify: Migrations ran? Seeds loaded?
│
├─ Web server won't start?
│  ├─ Run: docker compose -f docker-compose.test.yml logs web-test
│  ├─ Check: curl http://localhost:5173
│  └─ Verify: API is healthy first?
│
├─ Playwright tests fail?
│  ├─ Run: cd apps/web && npm run test:e2e:report
│  ├─ Review: Screenshots in test-results/
│  └─ Debug: npm run test:e2e:debug
│
└─ Other errors?
   └─ Read: CI_TESTING_GUIDE.md (detailed troubleshooting)
```

---

## Environment Variables Used

```bash
DATABASE_URL=postgresql://postgres:testpassword@localhost:5433/stemlab_test
COMPOSE_HTTP_TIMEOUT=200
CI=true
PLAYWRIGHT_SKIP_SERVER=true
BASE_URL=http://localhost:5173
```

---

## File Locations

| File | Purpose |
|------|---------|
| `test-ci-locally.sh` | Main test script (run this) |
| `CI_TESTING_GUIDE.md` | Detailed guide & troubleshooting |
| `PRE_PUSH_CHECKLIST.md` | Checklist before pushing |
| `.github/workflows/playwright.yml` | CI workflow definition |
| `docker-compose.test.yml` | Test environment config |
| `apps/web/playwright-report/` | HTML test reports |
| `apps/web/test-results/` | Screenshots, videos, traces |

---

## When CI Fails in GitHub Actions

1. Check workflow logs in GitHub Actions tab
2. Run locally: `./test-ci-locally.sh`
3. Compare outputs
4. Fix locally
5. Re-run script to verify
6. Push again

---

## Emergency Reset

If everything is broken and you want to start fresh:

```bash
# Stop all containers
docker compose -f docker-compose.test.yml down -v

# Remove everything
docker system prune -a --volumes  # CAREFUL: Removes ALL Docker data
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Fresh install
npm ci

# Test again
./test-ci-locally.sh
```

---

## Pre-Push Checklist (Short Version)

```bash
✓ npm run lint          # Code style
✓ npm run build         # TypeScript compiles
✓ npm test              # Unit tests
✓ ./test-ci-locally.sh  # E2E tests
✓ git status            # Clean working tree
✓ git push              # 🚀
```

---

## Help Resources

- **Detailed guide:** `CI_TESTING_GUIDE.md`
- **Pre-push checklist:** `PRE_PUSH_CHECKLIST.md`
- **Playwright docs:** https://playwright.dev/docs/intro
- **Docker Compose docs:** https://docs.docker.com/compose/
- **Project docs:** `CLAUDE.md`

---

## What Happens in CI?

GitHub Actions runs **3 parallel jobs**:

1. **Desktop Tests** (chromium, firefox, webkit) → 3 parallel runs
2. **Mobile Tests** (iPad Pro, iPad Mini)
3. **Accessibility Tests**

Each job:
1. Starts PostgreSQL in Docker
2. Runs migrations
3. Seeds test data
4. Starts API + Web in Docker
5. Runs Playwright tests
6. Uploads test reports
7. Cleans up containers

**Total time:** ~10-15 minutes

---

## Success Indicators

✅ Script output shows:
- All services healthy
- Tests passed
- No error messages

✅ Test report shows:
- All tests green
- No flaky tests
- Screenshots look correct

✅ Ready to push!

---

## Failure Indicators

❌ Script output shows:
- Timeout waiting for services
- Container health check failed
- Test failures
- Red error messages

❌ Check logs and follow troubleshooting tree above

---

**Need more help?** Read `CI_TESTING_GUIDE.md` for comprehensive debugging steps.
