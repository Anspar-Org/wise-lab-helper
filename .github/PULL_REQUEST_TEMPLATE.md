## Description
<!-- Provide a clear description of what this PR does -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to change)
- [ ] 📝 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test coverage improvement
- [ ] 🔧 Configuration/infrastructure change

## Testing Done
<!-- Describe the tests you ran and how to reproduce them -->
- [ ] All existing tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e --workspace=apps/web`)
- [ ] New tests added for new functionality
- [ ] Tested manually (describe what you tested below)

**Manual Testing:**
<!-- Describe manual testing steps -->

## Security Checklist
- [ ] No sensitive data (API keys, passwords, student information) added to code
- [ ] No new security vulnerabilities introduced (`npm audit` shows 0 vulnerabilities)
- [ ] Input validation added where needed
- [ ] FERPA/COPPA compliance maintained (student data stays local)
- [ ] SQL queries use parameterized statements (no SQL injection risk)
- [ ] No console.log or debug code left in production code

## Student Safety & Privacy (K-5 Focus)
<!-- For changes affecting students or data -->
- [ ] Age-appropriate content and language used
- [ ] Accessibility considered (WCAG 2.1 Level AA)
- [ ] No external tracking or analytics that collect student data
- [ ] All student data operations remain local-only

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Related Issues
<!-- Link related issues using keywords: Closes #123, Fixes #456, Relates to #789 -->

## Deployment Notes
<!-- Any special deployment considerations? Database migrations? Environment variables? -->

## Checklist
- [ ] Code follows project style guidelines (TypeScript, ESLint, Prettier)
- [ ] Self-review completed (read through your own code changes)
- [ ] Comments added for complex logic
- [ ] Documentation updated (CLAUDE.md, README.md, or docs/)
- [ ] No linter warnings or errors
- [ ] Commit messages follow conventional commits format
- [ ] Branch is up to date with main
