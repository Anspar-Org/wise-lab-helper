# Security Policy

## Overview

STEM Lab Assistant is a learning platform for elementary school students (K-5) with a strong focus on data privacy, FERPA/COPPA compliance, and age-appropriate security measures. We take security seriously, especially given our target users and their data protection requirements.

## Supported Versions

| Version | Supported          | Notes                                    |
| ------- | ------------------ | ---------------------------------------- |
| 0.x.x   | :white_check_mark: | Active development, security fixes applied |

## Reporting a Vulnerability

**⚠️ DO NOT open a public issue for security vulnerabilities.**

Security vulnerabilities should be reported privately to protect our users, especially given that this is a K-5 educational platform.

### How to Report

1. **Use GitHub Security Advisories** (preferred):
   - Go to https://github.com/Anspar-Org/wise-lab-helper/security/advisories/new
   - Fill out the advisory form with details

2. **Email** (if GitHub advisories unavailable):
   - Contact: [Create a GitHub issue for contact info]
   - Subject: "[SECURITY] Brief description"

### What to Include

Please include the following information:
- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** (especially any risks to student data)
- **Affected versions** (if known)
- **Suggested fix** (if you have one)
- **Your contact information** (for follow-up questions)

### Response Timeline

We are committed to responding quickly:
- **Initial Response:** Within 48 hours of receiving the report
- **Status Update:** Within 5 business days with assessment and timeline
- **Fix Timeline:** Varies by severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next regular release

We will work with you to understand the issue and coordinate disclosure timing.

## Security Measures

### Data Privacy & Compliance

This project implements multiple layers of protection for student data:

#### FERPA/COPPA Compliance
- ✅ **Local-only operation:** All student data stored on-premise (Synology NAS)
- ✅ **No cloud services:** Database runs locally, no external data transfer
- ✅ **Minimal data collection:** Only essential information for educational purposes
- ✅ **Parental consent workflow:** (for future implementation)
- ✅ **Data retention policies:** Documented and enforced

#### Age-Appropriate Authentication
- **Grades K-2:** Animal grid authentication (visual, no reading required)
- **Grades 3-5:** 4-digit PIN authentication (simple, memorable)
- **Staff/Coaches:** Email/password with strong password requirements

### Technical Security Measures

#### Application Security
- ✅ **Input validation:** All user input validated and sanitized (Zod schemas)
- ✅ **SQL injection prevention:** Parameterized queries using pg library
- ✅ **XSS prevention:** React's built-in escaping + helmet.js headers
- ✅ **CSRF protection:** JWT tokens with httpOnly cookies
- ✅ **Rate limiting:** Implemented on authentication endpoints
- ✅ **Security headers:** Helmet.js for CSP, HSTS, X-Frame-Options, etc.

#### Authentication & Authorization
- ✅ **JWT tokens:** Secure token-based authentication
- ✅ **HttpOnly cookies:** Tokens not accessible via JavaScript
- ✅ **Password hashing:** bcrypt with appropriate work factor
- ✅ **Role-based access:** Student, Coach, Admin roles with proper separation
- ✅ **Session management:** Logout invalidates tokens

#### Dependency Management
- ✅ **Automated scanning:** Dependabot enabled for vulnerability alerts
- ✅ **Regular updates:** Weekly automated dependency update PRs
- ✅ **Security audits:** `npm audit` run in CI/CD pipeline
- ✅ **Minimal dependencies:** Only essential packages included

#### Infrastructure Security
- ✅ **Local network only:** No public internet exposure by default
- ✅ **Docker containers:** Isolated execution environments
- ✅ **Environment variables:** Secrets stored in .env files (gitignored)
- ✅ **Database access:** Restricted to application only
- ✅ **File uploads:** Strict validation, size limits, and type checking

### Code Quality & Testing
- ✅ **TypeScript:** Type safety throughout codebase
- ✅ **ESLint:** Automated code quality checks
- ✅ **Unit tests:** >80% code coverage target (Vitest)
- ✅ **E2E tests:** Comprehensive Playwright test suite
- ✅ **Code review:** All changes reviewed before merge (when team > 1)

## Security Best Practices for Contributors

If you're contributing to this project, please follow these guidelines:

### Do's ✅
- ✅ Run `npm audit` before submitting PRs
- ✅ Use parameterized queries for all database operations
- ✅ Validate all user input with Zod schemas
- ✅ Keep dependencies up to date
- ✅ Follow principle of least privilege
- ✅ Write tests for security-sensitive code
- ✅ Review CLAUDE.md for project-specific security requirements

### Don'ts ❌
- ❌ Never commit `.env` files or secrets
- ❌ Don't store student data in logs
- ❌ Don't make external API calls with student data
- ❌ Don't use `eval()` or `new Function()`
- ❌ Don't bypass authentication checks
- ❌ Don't hardcode credentials or API keys
- ❌ Don't disable security features (helmet, CORS, etc.)

### Sensitive Files (Never Commit)
```
.env
.env.local
.env.*.local
config/secrets.json
credentials.json
*.pem
*.key
id_rsa
```

All of these are already in `.gitignore`, but double-check before committing.

## Known Security Considerations

### Intentional Design Decisions

1. **Local-Only Operation**
   - Database accessible only on local network
   - This is by design for FERPA/COPPA compliance
   - Not a vulnerability, but a privacy feature

2. **Simple Authentication for Young Students**
   - Animal grid and PIN authentication are intentionally simple
   - Appropriate for supervised elementary school environment
   - Not designed for unsupervised home use without parent setup

3. **No Email Verification for Students**
   - Students don't have email addresses
   - Coach/Admin setup required for student accounts
   - Appropriate for classroom environment

### Out of Scope

The following are explicitly out of scope for security concerns:
- ❌ Multi-tenant cloud deployment (local-only by design)
- ❌ OAuth/Social login for students (age-inappropriate)
- ❌ Public internet exposure (local network only)
- ❌ Mobile app security (web-only currently)

## Security Updates

Security patches will be released as soon as possible after a vulnerability is confirmed. We will:
1. Release a patch in a new version
2. Update this SECURITY.md with details (after fix is deployed)
3. Notify users via GitHub Security Advisories
4. Document the fix in release notes

## Security Hall of Fame

We appreciate security researchers who help make STEM Lab Assistant safer:

<!-- Security researchers who responsibly disclose vulnerabilities will be listed here -->
- *No vulnerabilities reported yet*

Thank you for helping keep our elementary students' data safe!

## Additional Resources

- [FERPA Compliance Guide](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html)
- [COPPA Requirements](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Questions?

For general security questions (not vulnerabilities), please:
- Open a [Discussion](https://github.com/Anspar-Org/wise-lab-helper/discussions)
- Or email [contact via GitHub issue]

For **actual vulnerabilities**, please use the private reporting methods above.
