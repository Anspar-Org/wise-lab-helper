# GitHub Repository Settings Configuration

This document provides step-by-step instructions for configuring repository settings in the GitHub UI. These settings complement the automated configuration files (dependabot.yml, CODEOWNERS, etc.) already in the repository.

## 📋 Repository Settings (Settings → General)

### Features
Navigate to: `Settings → General → Features`

```
✅ Issues
✅ Preserve this repository
✅ Discussions (recommended for community Q&A)
✅ Sponsorships (optional - if accepting donations)
❌ Wikis (use docs/ folder instead for version control)
❌ Projects (optional - might be overkill for 1-2 person team)
```

**Why?**
- Issues: Essential for bug tracking and feature requests
- Discussions: Great for community questions from educators/users
- Wikis disabled: Docs in the repo are easier to version control
- Projects optional: Issues + labels work well for small teams

### Pull Requests
Navigate to: `Settings → General → Pull Requests`

```
Allow merge commits: ❌
Allow squash merging: ✅
  Default commit message: Pull request title and description

Allow rebase merging: ❌

Automatically delete head branches: ✅
Allow auto-merge: ✅
Always suggest updating pull request branches: ✅
Allow update branch: ✅
```

**Why?**
- Squash merging creates clean, linear git history
- Auto-delete branches keeps repository tidy
- Suggest updating ensures branches stay current with main

### Default Branch
Navigate to: `Settings → General → Default branch`

```
Default branch: main
```

---

## 🔒 Branch Protection Rules (Settings → Branches)

### Protect `main` Branch
Navigate to: `Settings → Branches → Add branch protection rule`

**Branch name pattern:** `main`

#### Protect matching branches

```
✅ Require a pull request before merging
   ❌ Require approvals: (leave at 0 for single-developer team)
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ❌ Require review from Code Owners (optional - only if team > 1)
   ❌ Restrict who can dismiss pull request reviews (not needed)
   ❌ Allow specified actors to bypass pull request requirements (not needed)
   ✅ Require approval of the most recent reviewable push

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging

   Required status checks (select after first workflow run):
   - ✅ Run Playwright Tests (chromium-desktop)
   - ✅ Run Playwright Tests (firefox-desktop)
   - ✅ Run Playwright Tests (webkit-desktop)
   - ✅ Run Mobile Tests
   - ✅ Accessibility Tests

✅ Require conversation resolution before merging

❌ Require signed commits (optional - adds security but extra setup)

❌ Require linear history (optional - enforced by squash-only merging)

❌ Require deployments to succeed before merging (not needed yet)

❌ Lock branch (too restrictive for active development)

✅ Do not allow bypassing the above settings
   ✅ Apply to administrators (prevents accidental direct pushes)

❌ Restrict who can push to matching branches (not needed for public repo)

✅ Allow force pushes
   ✅ Everyone (needed for rebasing feature branches)

❌ Allow deletions (protect main from accidental deletion)
```

**Important Notes:**
- **Reviewer requirement disabled**: Since you're currently a 1-person team, requiring approval would block your own PRs. Enable this when you add a second team member.
- **Status checks**: After your first CI run, GitHub will show available checks. Select all Playwright test jobs.
- **Force pushes allowed for everyone**: This is for feature branches. The other settings prevent force pushing to main in practice.

---

## 🔐 Security Settings (Settings → Security)

### Code Security and Analysis
Navigate to: `Settings → Security & analysis`

#### Dependency Graph
```
✅ Enabled (default for public repos)
```

#### Dependabot
```
✅ Dependabot alerts
   - Get notified of vulnerabilities in dependencies

✅ Dependabot security updates
   - Automatically create PRs to fix vulnerabilities

✅ Dependabot version updates
   - Automatically create PRs for dependency updates
   - (Configured via .github/dependabot.yml - already added)
```

#### Secret Scanning
```
✅ Secret scanning (free for public repos)
   - Alerts you if secrets are committed

✅ Push protection
   - Prevents committing secrets in the first place
   - Highly recommended for student data protection
```

#### Code Scanning (Optional)
```
⚠️  CodeQL analysis (optional - recommended)
   - Click "Set up" → "Default"
   - Scans code for security vulnerabilities
   - Free for public repositories
   - Runs on push and pull requests
```

To set up CodeQL:
1. Go to `Security → Code scanning`
2. Click "Set up code scanning"
3. Select "Set up this workflow" under CodeQL Analysis
4. Commit the workflow file (GitHub creates it for you)

---

## ⚙️ Actions Settings (Settings → Actions)

### General
Navigate to: `Settings → Actions → General`

#### Actions permissions
```
✅ Allow all actions and reusable workflows
```

#### Workflow permissions
```
⚠️  Read and write permissions (default)
   OR
✅ Read repository contents and packages permissions (more secure)

✅ Allow GitHub Actions to create and approve pull requests
   (Required for Dependabot auto-merge to work)
```

**Recommendation:** Use "Read repository contents" for better security. Your current workflows don't need write access.

#### Fork pull request workflows from outside collaborators
```
✅ Require approval for first-time contributors
❌ Require approval for all outside collaborators (too restrictive)
```

---

## 👥 Collaborators (Settings → Collaborators)

If/when you add team members:

Navigate to: `Settings → Collaborators and teams → Add people`

### Recommended Roles

**For Small Team (1-2 people):**
- All members: **Admin** role
  - Can push to branches
  - Can manage issues/PRs
  - Can change settings
  - Full control for small team flexibility

**If Team Grows (3+ people):**
- Project owner: **Admin**
- Core developers: **Maintain**
  - Can push to branches
  - Can manage issues/PRs
  - Cannot change settings
- Contributors: **Write**
  - Can push to branches
  - Can't change settings
- Community volunteers: **Triage**
  - Can manage issues/PRs
  - Read-only code access

### Two-Factor Authentication

**Important:** All team members should enable 2FA:
1. Go to personal GitHub settings
2. Security → Two-factor authentication
3. Enable via authenticator app (recommended) or SMS

You can require 2FA for organization members if using a GitHub Organization.

---

## 🏷️ Labels (Settings → Issues → Labels)

### Recommended Labels to Add

Navigate to: `Settings → Issues → Labels → New label`

#### Type Labels
```
bug           #d73a4a  (red)
enhancement   #a2eeef  (green)
documentation #0075ca  (blue)
question      #d876e3  (purple)
duplicate     #cfd3d7  (gray)
```

#### Priority Labels
```
P0: critical  #b60205  (dark red)
P1: high      #ff9800  (orange)
P2: medium    #fdd835  (yellow)
P3: low       #e0e0e0  (light gray)
```

#### Status Labels
```
blocked        #d73a4a  (red)
in progress    #fbca04  (yellow)
ready          #0e8a16  (green)
needs discussion #7057ff (purple)
```

#### Area Labels
```
frontend       #0366d6  (light blue)
backend        #0052cc  (dark blue)
database       #006b75  (teal)
testing        #84b6eb  (sky blue)
security       #ee0701  (red)
accessibility  #f9d0c4  (pink)
```

#### Special Labels
```
good first issue  #7057ff  (purple)
help wanted       #008672  (teal)
wontfix           #ffffff  (white/gray border)
invalid           #e4e669  (yellow)
```

GitHub also includes default labels - you can keep or delete them as needed.

---

## 📊 Insights & Analytics

### Enabling Useful Insights
Navigate to: `Insights`

**Useful tabs for project management:**
- **Pulse**: Recent activity summary
- **Contributors**: Who's contributing and how much
- **Traffic**: Views and clones (public repos only)
- **Dependency graph**: Visual dependency tree

These are automatically enabled and don't need configuration.

---

## 🔔 Notifications (Personal Settings)

### Recommended Notification Settings

Navigate to: **Your profile → Settings → Notifications**

For this repository:
```
✅ Participating
   - You're mentioned
   - You're assigned
   - You commented

✅ Watching (for main developer)
   - All activity in repository

✅ Custom
   - Issues: ✅
   - Pull requests: ✅
   - Releases: ✅
   - Discussions: ✅
```

**Email Preferences:**
```
✅ Pull Request reviews
✅ Pull Request pushes
✅ Comments on Issues and Pull Requests
✅ Includes your own updates (helpful to see formatted notifications)
```

---

## 🚀 Quick Setup Checklist

Use this checklist to configure your repository:

### Initial Setup
- [ ] Enable Issues and Discussions
- [ ] Disable Wikis (use docs/ instead)
- [ ] Configure PR settings (squash-only, auto-delete branches)
- [ ] Set `main` as default branch

### Security
- [ ] Enable Dependabot alerts
- [ ] Enable Dependabot security updates
- [ ] Verify Dependabot version updates enabled (reads .github/dependabot.yml)
- [ ] Enable secret scanning
- [ ] Enable push protection for secrets
- [ ] (Optional) Set up CodeQL code scanning

### Branch Protection
- [ ] Create branch protection rule for `main`
- [ ] Require pull request (no reviewer requirement for 1-person team)
- [ ] Require status checks (add after first workflow run)
- [ ] Require conversation resolution
- [ ] Apply to administrators
- [ ] Allow force pushes for everyone (for feature branch rebasing)
- [ ] Prevent branch deletion

### Actions
- [ ] Set actions permissions (allow all)
- [ ] Set workflow permissions (read-only recommended)
- [ ] Allow Actions to create/approve PRs (for Dependabot)
- [ ] Require approval for first-time contributor PRs

### Labels
- [ ] Add type labels (bug, enhancement, docs, question)
- [ ] Add priority labels (P0-P3)
- [ ] Add status labels (blocked, in progress, ready)
- [ ] Add area labels (frontend, backend, testing, etc.)
- [ ] Add special labels (good first issue, help wanted)

### Team & Notifications
- [ ] Enable 2FA on your GitHub account
- [ ] Configure notification preferences
- [ ] (When adding team members) Add collaborators with appropriate roles
- [ ] (When adding team members) Update CODEOWNERS
- [ ] (When adding team members) Enable reviewer requirement in branch protection

---

## 📝 Notes

### When to Update Settings

**Add Reviewer Requirement When:**
- Second team member joins
- Update branch protection rule to require 1 approval
- Update CODEOWNERS with team member's username

**Add Status Check Requirement When:**
- First CI workflow completes successfully
- Go to branch protection → Required status checks
- Select all Playwright test jobs

**Enable Projects When:**
- Team grows beyond 2 people
- Need complex project management
- Multiple parallel feature tracks

### Troubleshooting

**Can't push to main after setting up branch protection:**
✅ Expected behavior! Create a feature branch instead:
```bash
git checkout -b feature/your-feature
git push -u origin feature/your-feature
# Then create PR on GitHub
```

**Status checks not appearing:**
Wait for first successful CI run, then they'll appear in the dropdown.

**Dependabot not creating PRs:**
- Check that `.github/dependabot.yml` exists
- Verify Dependabot is enabled in Settings → Security
- Check `Insights → Dependency graph → Dependabot`

---

## 🎓 Learning Resources

- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Dependabot](https://docs.github.com/en/code-security/dependabot)
- [GitHub Docs: Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [GitHub Docs: Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Questions?** Open a discussion or issue if you need help with any of these settings!
