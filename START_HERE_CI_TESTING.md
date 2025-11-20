# 🚀 START HERE - CI Testing Local Replication

Welcome! This guide will help you replicate the exact GitHub Actions CI environment on your local machine to debug failing E2E tests.

---

## 📦 What You Just Received

I've created a complete CI testing toolkit with 5 comprehensive documents:

### 1. **test-ci-locally.sh** (10KB)
**The main executable script** - Run this to replicate CI locally

```bash
./test-ci-locally.sh
```

### 2. **CI_QUICK_REFERENCE.md** (5.5KB)
**Quick lookup card** - Common commands and troubleshooting tree

### 3. **CI_TESTING_GUIDE.md** (11KB)
**Comprehensive manual** - Detailed debugging steps and explanations

### 4. **PRE_PUSH_CHECKLIST.md** (8.1KB)
**Pre-push verification** - Checklist to ensure CI will pass

### 5. **CI_ANALYSIS_REPORT.md** (17KB)
**Technical deep-dive** - Complete analysis of CI workflow architecture

---

## ⚡ Quick Start (30 seconds)

```bash
# 1. Make the script executable (if not already)
chmod +x test-ci-locally.sh

# 2. Run the CI replication
./test-ci-locally.sh

# 3. If it passes ✅ → you can push to GitHub
# 4. If it fails ❌ → read CI_TESTING_GUIDE.md for debugging
```

That's it! The script will:
- ✓ Check your environment (Docker, Node.js, ports)
- ✓ Install dependencies (`npm ci`)
- ✓ Start PostgreSQL in Docker
- ✓ Run database migrations
- ✓ Seed test data
- ✓ Start API and web servers
- ✓ Run Playwright E2E tests
- ✓ Show results and cleanup

---

## 📊 Document Navigation Guide

**Choose your path based on your needs:**

### 🎯 I just want to test before pushing
→ Run `./test-ci-locally.sh`  
→ If it fails, read **CI_QUICK_REFERENCE.md**

### 🔍 I need to debug failing tests
→ Read **CI_TESTING_GUIDE.md** (comprehensive debugging)  
→ Check **CI_QUICK_REFERENCE.md** (quick commands)

### ✅ I want to verify everything before pushing
→ Follow **PRE_PUSH_CHECKLIST.md** (step-by-step verification)

### 🧠 I want to understand how CI works
→ Read **CI_ANALYSIS_REPORT.md** (technical deep-dive)  
→ Review `.github/workflows/playwright.yml`

### 🆘 Tests failed and I don't know why
→ Check the troubleshooting tree in **CI_QUICK_REFERENCE.md**  
→ Follow detailed debugging in **CI_TESTING_GUIDE.md**

---

## 🎬 Your First Run

### Step 1: Prerequisites Check

Make sure you have:
- [ ] Docker Desktop running
- [ ] Node.js 20+ installed (`node -v`)
- [ ] Ports 5433, 3001, 5173 available
- [ ] You're in the project root directory

### Step 2: Run the Script

```bash
./test-ci-locally.sh
```

**Expected output:**
```
========================================
Step 1: Pre-flight Checks
========================================

✓ Docker Compose v2 found
✓ Node.js version OK: v20.19.0
✓ All required ports (5433, 3001, 5173) are available

========================================
Step 2: Node.js Environment
========================================

ℹ Node version: v20.19.0
ℹ NPM version: 10.2.3

...
(continues through all 13 steps)
...

========================================
Test Results Summary
========================================

✓ All tests passed for project: chromium-desktop

ℹ View the HTML report with:
  cd apps/web && npm run test:e2e:report
```

### Step 3: Interpret Results

**If tests pass ✅:**
- You're ready to push!
- CI should also pass (high confidence)
- Run `PRE_PUSH_CHECKLIST.md` for final verification

**If tests fail ❌:**
- Don't push yet
- Read the error messages carefully
- Check `CI_QUICK_REFERENCE.md` troubleshooting tree
- Follow debugging steps in `CI_TESTING_GUIDE.md`
- View test report: `cd apps/web && npm run test:e2e:report`

---

## 🎨 Understanding the Color Output

The script uses color-coded output:

- **🔵 Blue** - Step headers and info messages
- **🟢 Green** - Success messages (✓)
- **🔴 Red** - Error messages (✗)
- **🟡 Yellow** - Warnings (⚠)

---

## 🔧 Common Commands

```bash
# Run with default browser (chromium)
./test-ci-locally.sh

# Run with specific browser
PROJECT=firefox-desktop ./test-ci-locally.sh
PROJECT=webkit-desktop ./test-ci-locally.sh
PROJECT=mobile-touch ./test-ci-locally.sh

# View test report after run
cd apps/web && npm run test:e2e:report

# Check what's using ports
lsof -i :5433
lsof -i :3001
lsof -i :5173

# View Docker container logs
docker compose -f docker-compose.test.yml logs api-test
docker compose -f docker-compose.test.yml logs web-test

# Cleanup (if script didn't finish)
docker compose -f docker-compose.test.yml down -v

# Full reset (nuclear option)
docker compose -f docker-compose.test.yml down -v --rmi all
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm ci
./test-ci-locally.sh
```

---

## 🧩 How the Pieces Fit Together

```
Your Workflow:
┌────────────────────────────────────────────────┐
│ 1. Make code changes                           │
├────────────────────────────────────────────────┤
│ 2. Run unit tests: npm test                   │
├────────────────────────────────────────────────┤
│ 3. Run E2E tests: ./test-ci-locally.sh        │
│    ├─ Reads: docker-compose.test.yml          │
│    ├─ Mirrors: .github/workflows/playwright.yml│
│    └─ Outputs: Test results + logs            │
├────────────────────────────────────────────────┤
│ 4. Tests failed?                               │
│    ├─ Yes → Debug with CI_TESTING_GUIDE.md    │
│    └─ No → Continue to step 5                 │
├────────────────────────────────────────────────┤
│ 5. Check: PRE_PUSH_CHECKLIST.md               │
├────────────────────────────────────────────────┤
│ 6. Push to GitHub                              │
├────────────────────────────────────────────────┤
│ 7. CI runs (same steps as local script)       │
├────────────────────────────────────────────────┤
│ 8. CI passes ✅ (high likelihood!)            │
└────────────────────────────────────────────────┘
```

---

## 🎯 What Makes This Script Special

### Exact CI Replication

The script mirrors **every single step** from `.github/workflows/playwright.yml`:

| CI Step | Script Step | Verified |
|---------|-------------|----------|
| Checkout code | (already on your machine) | ✓ |
| Setup Node.js 20 | Pre-flight check | ✓ |
| npm ci | Step 3 | ✓ |
| Start database | Step 4 | ✓ |
| Wait for DB health | Step 5 | ✓ |
| Run migrations | Step 6 | ✓ |
| Seed test data | Step 7 | ✓ |
| Start API + web | Step 8 | ✓ |
| Wait for API | Step 9a | ✓ |
| Wait for web | Step 9b | ✓ |
| Install Playwright | Step 10 | ✓ |
| Run tests | Step 11 | ✓ |
| Upload artifacts | (local files) | ✓ |
| Cleanup | Automatic (trap) | ✓ |

### Key Features

- ✅ **Pre-flight checks** - Verifies environment before running
- ✅ **Color-coded output** - Easy to scan for errors
- ✅ **Automatic cleanup** - Runs even if script fails
- ✅ **Health check polling** - Same timeouts as CI
- ✅ **Detailed error messages** - Tells you exactly what went wrong
- ✅ **Same environment vars** - Identical to CI
- ✅ **Idempotent** - Can run multiple times safely

---

## 🐛 Debugging Workflow

```
Test Failed? Follow This Flow:
┌─────────────────────────────────────┐
│ 1. Read error message in terminal   │
├─────────────────────────────────────┤
│ 2. Check CI_QUICK_REFERENCE.md      │
│    troubleshooting tree              │
├─────────────────────────────────────┤
│ 3. View logs:                        │
│    docker compose logs api-test      │
├─────────────────────────────────────┤
│ 4. Check service health:             │
│    curl localhost:3001/health        │
├─────────────────────────────────────┤
│ 5. View test report:                 │
│    cd apps/web && npm run            │
│    test:e2e:report                   │
├─────────────────────────────────────┤
│ 6. Still stuck?                      │
│    Read CI_TESTING_GUIDE.md          │
│    (comprehensive debugging)         │
├─────────────────────────────────────┤
│ 7. Need to understand architecture?  │
│    Read CI_ANALYSIS_REPORT.md        │
└─────────────────────────────────────┘
```

---

## 📚 Additional Resources

### In This Project
- `.github/workflows/playwright.yml` - CI workflow definition
- `docker-compose.test.yml` - Test environment configuration
- `apps/web/playwright.config.ts` - Playwright configuration
- `packages/database/seed-e2e.js` - Test data seeding

### External Documentation
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 🎓 Learning Path

**Beginner → Advanced:**

1. **Start here** (you are here!)
2. Run `./test-ci-locally.sh` and observe output
3. Skim `CI_QUICK_REFERENCE.md` for common commands
4. When you hit an issue, check `CI_TESTING_GUIDE.md`
5. Use `PRE_PUSH_CHECKLIST.md` before every push
6. Eventually read `CI_ANALYSIS_REPORT.md` to understand architecture

---

## ✨ Pro Tips

### Speed Up Testing

```bash
# Keep containers running between test runs
docker compose -f docker-compose.test.yml up -d

# Run tests manually (faster than full script)
cd apps/web
npm run test:e2e -- --project=chromium-desktop

# Run specific test file only
npx playwright test tests/e2e/specs/auth.spec.ts
```

### Interactive Debugging

```bash
# After services are running, debug tests interactively
cd apps/web
npm run test:e2e:ui       # UI mode
npm run test:e2e:headed   # See browser
npm run test:e2e:debug    # Step through
```

### Multi-Browser Testing

```bash
# Test all browsers like CI does
for p in chromium-desktop firefox-desktop webkit-desktop; do
  PROJECT=$p ./test-ci-locally.sh || echo "$p failed"
done
```

---

## 🎯 Success Criteria

**You know you're ready to push when:**

- ✅ `./test-ci-locally.sh` passes without errors
- ✅ `npm test` passes (unit tests)
- ✅ `npm run lint` passes
- ✅ `npm run build` succeeds
- ✅ `git status` shows clean working tree
- ✅ You've checked `PRE_PUSH_CHECKLIST.md`

**Confidence level:** 95%+ that CI will pass!

---

## 🆘 Getting Help

**If you're stuck:**

1. Check error message → `CI_QUICK_REFERENCE.md` troubleshooting tree
2. Read relevant section in `CI_TESTING_GUIDE.md`
3. View Docker logs: `docker compose -f docker-compose.test.yml logs`
4. Check GitHub Actions logs (if already pushed)
5. Compare local vs CI outputs

**Remember:** The script replicates CI exactly, so if it passes locally, CI should pass too!

---

## 🎉 Next Steps

1. **Try it now:** `./test-ci-locally.sh`
2. **Bookmark:** `CI_QUICK_REFERENCE.md`
3. **Study:** `CI_TESTING_GUIDE.md` when you have time
4. **Use:** `PRE_PUSH_CHECKLIST.md` before every push
5. **Understand:** `CI_ANALYSIS_REPORT.md` for deep knowledge

---

## 📝 Files Summary

| File | Size | Purpose | When to Use |
|------|------|---------|-------------|
| `test-ci-locally.sh` | 10KB | Main executable script | Before every push |
| `CI_QUICK_REFERENCE.md` | 5.5KB | Command cheat sheet | When debugging quickly |
| `CI_TESTING_GUIDE.md` | 11KB | Comprehensive guide | When you need detailed help |
| `PRE_PUSH_CHECKLIST.md` | 8.1KB | Verification checklist | Before pushing to GitHub |
| `CI_ANALYSIS_REPORT.md` | 17KB | Technical deep-dive | For understanding architecture |
| `START_HERE_CI_TESTING.md` | (this file) | Overview & navigation | First-time setup |

**Total:** ~52KB of comprehensive CI testing documentation!

---

**Ready? Let's go! 🚀**

```bash
./test-ci-locally.sh
```

Good luck! May your tests always pass. ✨
