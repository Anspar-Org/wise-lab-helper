# GitHub Copilot Instructions

This directory contains custom instructions for GitHub Copilot coding agent to help it understand and work effectively with this repository.

## Overview

These instruction files guide GitHub Copilot with:
- Project architecture and patterns
- Coding standards and conventions
- Testing practices (TDD)
- Technology stack specifics
- Data privacy requirements
- Age-appropriate design considerations

## Instruction Files

### 1. `general.instructions.md`
**Applies to:** All files in the repository

Contains:
- Project overview and key context
- Architecture overview
- Development commands
- Coding standards and naming conventions
- Data privacy requirements
- Testing best practices overview
- Common pitfalls to avoid

### 2. `backend-api.instructions.md`
**Applies to:** `apps/api/**/*.{ts,js}`

Contains:
- API architecture pattern (routes, controllers, services)
- Database connection patterns
- Input validation with Zod
- Authentication system details
- Error handling patterns
- File upload handling
- Performance considerations

### 3. `database.instructions.md`
**Applies to:** `packages/database/**/*`

Contains:
- Database schema organization
- Migration system
- Schema design principles (UUIDs, constraints, indexes)
- User authentication tables
- Learning content tables
- Skills tracking tables
- Data privacy and retention policies

### 4. `frontend.instructions.md`
**Applies to:** `apps/web/**/*.{ts,tsx,js,jsx}`

Contains:
- React component architecture
- UI/UX guidelines from style guide
- State management with Zustand
- API integration with React Query
- Authentication flows
- Accessibility (WCAG 2.1 AA)
- Age-appropriate design (ages 9-11)

### 5. `testing.instructions.md`
**Applies to:** `**/*.{test,spec}.{ts,tsx,js,jsx}`
**Excludes:** Code review agent

Contains:
- Test-Driven Development (TDD) workflow
- Backend testing patterns (service, controller, integration)
- Frontend testing patterns (component, hook, store)
- Test data management
- Mocking strategies
- Coverage requirements (>80%)

## How It Works

GitHub Copilot coding agent automatically reads these instruction files when:
- You open an issue and assign it to Copilot
- You mention `@copilot` in a pull request or issue

The agent uses the `applyTo` property in YAML frontmatter to determine which instructions apply to which files. For example:

```yaml
---
applyTo: "apps/api/**/*.{ts,js}"
---
```

This ensures backend-specific guidance is only applied when working on backend code.

## Benefits

These instructions help Copilot:
- Follow project-specific patterns consistently
- Maintain code quality standards
- Understand data privacy requirements (FERPA/COPPA)
- Apply age-appropriate design principles
- Use the correct testing frameworks and patterns
- Work with the monorepo structure effectively

## Updating Instructions

When you update these instructions:
1. Keep them focused and actionable
2. Use clear examples and code snippets
3. Update the relevant `applyTo` pattern if file locations change
4. Maintain consistency with main documentation (`CLAUDE.md`, `README.md`)

## Related Documentation

- **CLAUDE.md** - Instructions for Claude AI assistant
- **AI_AGENT_PROMPT.md** - Detailed project specifications for AI agents
- **README.md** - Project overview and setup guide
- **style guide.md** - UI/UX design guidelines
- **coaching best practices.md** - Pedagogical guidelines

## Resources

- [GitHub Copilot Instructions Documentation](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)
- [Best Practices for Copilot Coding Agent](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Agent-Specific Instructions](https://github.blog/changelog/2025-11-12-copilot-code-review-and-coding-agent-now-support-agent-specific-instructions/)
