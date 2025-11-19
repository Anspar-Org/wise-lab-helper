# Contributing to STEM Lab Assistant

Thank you for your interest in contributing to STEM Lab Assistant! This is a learning platform for elementary school students (K-5) focused on VEX IQ robotics education. We welcome contributions that improve the educational experience while maintaining our focus on student privacy and age-appropriate design.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Security & Privacy](#security--privacy)
- [Questions?](#questions)

## Code of Conduct

### Our Values

- **Student-First:** Every decision prioritizes the learning experience of K-5 students
- **Privacy-First:** Student data protection is non-negotiable (FERPA/COPPA compliance)
- **Age-Appropriate:** Design and language suitable for elementary students
- **Inclusive:** Accessible to all students regardless of ability or background
- **Educational:** Focus on STEM learning and engineering process

### Expected Behavior

- Be respectful and constructive in all interactions
- Remember this is an educational project for young children
- Maintain focus on student safety and privacy
- Follow the coding standards and project guidelines
- Help others learn and grow

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for local development)
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# 1. Fork the repository (if external contributor)
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/wise-lab-helper.git
cd wise-lab-helper

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your local configuration

# 5. Start the database
docker-compose up -d db

# 6. Run database migrations
cd packages/database
npm run migrate:up

# 7. Start the development servers
npm run dev
```

### Verify Setup

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e --workspace=apps/web

# Check for linting errors
npm run lint

# Verify API health
curl http://localhost:3001/health
```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

```
feature/student-dashboard-widgets
feature/coach-progress-tracking
bugfix/lesson-navigation-error
bugfix/pin-authentication-validation
hotfix/critical-data-leak
docs/setup-instructions
docs/api-documentation
refactor/auth-service-cleanup
test/notebook-upload-e2e
chore/update-dependencies
```

### Workflow Steps

```bash
# 1. Create a feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 2. Make your changes
# - Write code
# - Write tests
# - Update documentation

# 3. Test your changes
npm test                              # Unit tests
npm run test:e2e --workspace=apps/web # E2E tests
npm run lint                          # Code quality
npm audit                             # Security check

# 4. Commit your changes (see commit guidelines below)
git add .
git commit -m "feat(auth): add animal grid for K-2 students"

# 5. Push to your fork
git push -u origin feature/your-feature-name

# 6. Create Pull Request on GitHub
# - Fill out the PR template completely
# - Wait for CI checks to pass
# - Address any review feedback
```

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Type everything, use interfaces for objects
interface StudentCredentials {
  username: string;
  pin: string;
  gradeLevel: GradeLevel;
}

async function loginStudent(credentials: StudentCredentials): Promise<User> {
  // Implementation
}

// ❌ Bad: Using 'any' or missing types
async function loginStudent(credentials: any) {
  // Don't do this
}
```

### Code Style

- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes for strings (except JSON)
- **Semicolons:** Required
- **Line length:** 100 characters max
- **Prettier:** Runs automatically on save (configure your editor)
- **ESLint:** Must pass with no errors

### File Organization

```
src/
├── modules/              # Feature modules
│   ├── auth/
│   │   ├── auth.routes.ts      # Express routes
│   │   ├── auth.controller.ts  # HTTP handlers
│   │   ├── auth.service.ts     # Business logic
│   │   ├── auth.validation.ts  # Zod schemas
│   │   └── auth.test.ts        # Tests
│   └── lessons/
├── config/              # Configuration
├── middleware/          # Express middleware
└── utils/              # Shared utilities
```

### Naming Conventions

- **Files:** kebab-case (`student-dashboard.tsx`)
- **Components:** PascalCase (`StudentDashboard`)
- **Functions:** camelCase (`loginStudent`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_PIN_ATTEMPTS`)
- **Interfaces:** PascalCase with 'I' prefix optional (`User` or `IUser`)

## Commit Message Guidelines

We follow **Conventional Commits** for clear, semantic commit history.

### Format

```
type(scope): short description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring (no feature change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Scopes (optional but recommended)

- `auth` - Authentication system
- `lessons` - Lesson content
- `notebook` - Engineering notebook
- `badges` - Badge system
- `skills` - Skills tracking
- `db` - Database changes
- `ui` - UI components
- `api` - API endpoints
- `tests` - Test infrastructure

### Examples

```bash
# Good commits
feat(auth): add animal grid authentication for K-2 students
fix(lessons): resolve step navigation bug in lesson viewer
docs(readme): update installation instructions for Docker
test(notebook): add E2E tests for media upload
refactor(auth): simplify PIN validation logic
chore(deps): update vitest to 4.0.10

# Bad commits
update stuff
fixed bug
WIP
changes
```

### Breaking Changes

```bash
feat(api)!: change lesson response format

BREAKING CHANGE: Lesson API now returns { data: Lesson } instead of Lesson directly.
Clients must update their response parsing.
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] E2E tests pass (if UI changes)
- [ ] No linting errors (`npm run lint`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Documentation updated (if needed)
- [ ] Self-reviewed your code
- [ ] Added tests for new functionality

### PR Checklist

Use the PR template and fill out all sections:
- [ ] Clear description of changes
- [ ] Type of change selected
- [ ] Testing steps documented
- [ ] Security checklist completed
- [ ] Student safety considerations addressed (if applicable)
- [ ] Screenshots included (for UI changes)

### Review Process

1. **Automated Checks:** CI must pass (tests, linting, security)
2. **Code Review:** Maintainer reviews code (currently 1-person team, so self-review OK)
3. **Testing:** Reviewer tests changes locally if needed
4. **Approval:** PR approved or changes requested
5. **Merge:** Squash and merge to main (linear history)
6. **Cleanup:** Branch auto-deleted after merge

### Tips for Faster Review

- Keep PRs small and focused (< 400 lines if possible)
- Write clear descriptions and comments
- Respond quickly to review feedback
- Test thoroughly before submitting
- Include screenshots for UI changes

## Testing Requirements

### Test Coverage

We maintain **>80% code coverage** for quality assurance.

```bash
# Check coverage
npm run test:coverage --workspace=apps/api

# Coverage thresholds (enforced in CI)
Lines: 80%
Functions: 80%
Branches: 80%
Statements: 80%
```

### Writing Tests

#### Unit Tests (Vitest)

```typescript
// auth.service.test.ts
describe('AuthService', () => {
  describe('loginStudent', () => {
    it('should authenticate student with valid PIN', async () => {
      // Arrange
      const credentials = { username: 'test', pin: '1234' };

      // Act
      const result = await authService.loginStudent(credentials);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result.user.username).toBe('test');
    });

    it('should reject invalid PIN', async () => {
      // Arrange
      const credentials = { username: 'test', pin: 'wrong' };

      // Act & Assert
      await expect(authService.loginStudent(credentials))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
```

#### E2E Tests (Playwright)

```typescript
// auth.spec.ts
test('student should login with PIN', async ({ page }) => {
  await page.goto('/login/student');

  // Enter username
  await page.getByTestId('student-username-input').fill('test-student');
  await page.getByTestId('student-username-submit').click();

  // Enter PIN
  await page.getByTestId('pin-digit-0').fill('1');
  await page.getByTestId('pin-digit-1').fill('2');
  await page.getByTestId('pin-digit-2').fill('3');
  await page.getByTestId('pin-digit-3').fill('4');
  await page.getByTestId('pin-submit').click();

  // Verify redirect to dashboard
  await expect(page).toHaveURL(/\/student\/dashboard/);
});
```

### Test Data

- Use `testData` from `apps/web/tests/e2e/fixtures/index.ts`
- Never use real student data in tests
- Keep test data age-appropriate and educational

## Security & Privacy

### Critical Requirements

#### FERPA/COPPA Compliance
- ✅ All student data stays local (no external API calls)
- ✅ No tracking or analytics with student data
- ✅ Minimal data collection
- ✅ No email addresses for students

#### Secure Coding
- ✅ Validate ALL user input (use Zod schemas)
- ✅ Use parameterized queries (no string concatenation in SQL)
- ✅ Never log sensitive data (passwords, PINs, student info)
- ✅ Use bcrypt for password hashing
- ✅ Implement rate limiting on auth endpoints

### Security Checklist

Before submitting PR:
- [ ] No secrets committed (check with `git log -p`)
- [ ] All inputs validated
- [ ] SQL queries parameterized
- [ ] No console.log with sensitive data
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] FERPA/COPPA compliance maintained

### Prohibited

```typescript
// ❌ NEVER DO THIS
const query = `SELECT * FROM users WHERE username = '${username}'`; // SQL injection!

// ❌ NEVER DO THIS
console.log('Student PIN:', pin); // Logging sensitive data!

// ❌ NEVER DO THIS
await fetch('https://analytics.example.com/track', {
  body: JSON.stringify(studentData) // Sending student data externally!
});

// ✅ DO THIS INSTEAD
const query = 'SELECT * FROM users WHERE username = $1';
const result = await db.query(query, [username]);
```

## Documentation

### When to Update Docs

- New features → Update README.md or CLAUDE.md
- API changes → Update API documentation
- Setup changes → Update SETUP_TROUBLESHOOTING.md
- Architecture changes → Update docs/architecture.md

### Documentation Style

- Use clear, simple language (elementary educators may read this)
- Include code examples
- Add screenshots for UI features
- Keep README.md current

## Questions?

### Getting Help

- **Questions:** Open a [Discussion](https://github.com/Anspar-Org/wise-lab-helper/discussions)
- **Bugs:** Create a [Bug Report](https://github.com/Anspar-Org/wise-lab-helper/issues/new?template=bug_report.md)
- **Features:** Create a [Feature Request](https://github.com/Anspar-Org/wise-lab-helper/issues/new?template=feature_request.md)
- **Security:** See [SECURITY.md](.github/SECURITY.md)

### Project Resources

- [README.md](README.md) - Project overview
- [CLAUDE.md](CLAUDE.md) - Development guide for Claude Code
- [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md) - Common issues
- [Architecture docs](docs/) - System design

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

## Thank You!

Your contributions help provide quality STEM education to elementary students. Every improvement makes a difference in a child's learning journey. 🚀

---

**Remember:** This is an educational platform for young children. Every line of code you write impacts a student's learning experience. Code with care, test thoroughly, and prioritize student safety and privacy. ❤️
