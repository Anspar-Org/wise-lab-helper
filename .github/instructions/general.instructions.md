# General Coding Instructions

## Project Overview

STEM Lab Assistant is a learning-first platform for elementary engineering education (K-5), with initial focus on VEX IQ robotics teams. This is an **API-first development** project - we're building the complete backend before creating any user interface.

## Key Context

- **Target users**: Elementary students (K-5) and coaches
- **Deployment**: Self-hosted on Synology NAS (local network only)
- **Authentication**: Age-appropriate methods (PIN for grades 3-5, animal grid for K-2, password for staff)
- **Data privacy**: FERPA/COPPA compliant, all data stays local
- **Budget**: $500/year maximum

## Architecture

This is a **Turborepo/npm workspaces** monorepo with the following structure:

```
stem-lab-assistant/
├── apps/
│   ├── api/              # Express + TypeScript backend (current focus)
│   └── web/              # React frontend (future)
├── packages/
│   ├── database/         # PostgreSQL schemas & migrations
│   └── shared-types/     # Shared TypeScript types
```

## Technology Stack

**Backend (Current Focus):**
- Node.js 18+ with TypeScript
- Express.js (REST API)
- PostgreSQL 16 (database)
- JWT (authentication)
- Vitest (testing)
- Zod (validation)
- DiceBear (avatar generation)
- Multer (file uploads)

**Frontend (Future):**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)

## Development Commands

### Common Tasks

```bash
# Install dependencies
npm install

# Start development (db + api)
npm run dev

# Run tests
npm test

# Run tests for specific workspace
npm test --workspace=apps/api

# Lint code
npm run lint

# Build all workspaces
npm run build
```

### Database Commands

```bash
# Start database
docker-compose up -d db

# Run migrations
cd packages/database && node migrate.js

# View database logs
docker-compose logs -f db
```

## Coding Standards

### General Principles

1. **Test-Driven Development (TDD)**
   - Write failing test first
   - Implement minimum code to pass
   - Refactor while keeping tests green
   - Target: >80% code coverage

2. **TypeScript**
   - Use strict mode (no `any` types)
   - Define interfaces for all data structures
   - Document complex types with comments
   - Use Zod for runtime validation

3. **Code Quality**
   - Follow ESLint and Prettier configurations
   - Write clear, descriptive variable and function names
   - Add JSDoc/TSDoc comments for public APIs
   - Keep functions small and focused (single responsibility)

4. **Git Workflow**
   - Main branch: `main`
   - Create feature branches for all changes
   - **NEVER edit files directly on main branch**
   - Commit frequently with clear messages

### Naming Conventions

- **Files**: Use kebab-case (e.g., `user-service.ts`, `auth.controller.ts`)
- **Classes**: Use PascalCase (e.g., `DatabaseService`, `UserController`)
- **Functions/Variables**: Use camelCase (e.g., `getUserById`, `isAuthenticated`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`, `API_VERSION`)
- **Interfaces/Types**: Use PascalCase (e.g., `User`, `AuthRequest`)

### Error Handling

```typescript
// Always use try-catch for async operations
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  logger.error('Failed to perform operation', { error });
  throw new AppError('User-friendly message', 500);
}

// Return appropriate HTTP status codes
// 200: Success
// 201: Created
// 400: Bad Request (client error)
// 401: Unauthorized
// 403: Forbidden
// 404: Not Found
// 500: Internal Server Error
```

## Data Privacy Requirements

**CRITICAL**: All student data MUST remain on local network (FERPA/COPPA compliance)

- No external API calls that send student data
- Database runs in "local-only mode" during development
- DiceBear avatars are generated server-side (no external calls with student info)
- Never log personally identifiable information (PII)

## Testing Best Practices

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('UserService', () => {
  it('should create a user with valid data', async () => {
    const userData = { username: 'test', grade: 4 };
    const user = await userService.create(userData);
    
    expect(user).toBeDefined();
    expect(user.username).toBe('test');
    expect(user.grade).toBe(4);
  });

  it('should throw error for invalid grade', async () => {
    const userData = { username: 'test', grade: 99 };
    
    await expect(userService.create(userData))
      .rejects.toThrow('Grade must be between K and 5');
  });
});
```

### API Tests

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('POST /api/v1/auth/login', () => {
  it('returns JWT token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'alice', pin: '1234' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

## Documentation

- Document all public APIs with JSDoc comments
- Update README.md when adding new features
- Create ADRs (Architecture Decision Records) for significant decisions
- Keep CLAUDE.md updated with development insights

## Common Pitfalls to Avoid

1. **Don't** commit secrets or environment variables
2. **Don't** use synchronous file operations in API routes
3. **Don't** skip input validation on user data
4. **Don't** forget to close database connections
5. **Don't** use `any` type in TypeScript
6. **Don't** commit `node_modules` or build artifacts
7. **Don't** forget to update tests when changing code

## Resources

- Main documentation: `README.md`
- AI agent guidance: `CLAUDE.md`
- Detailed project specs: `AI_AGENT_PROMPT.md`
- Troubleshooting: `SETUP_TROUBLESHOOTING.md`
- Style guide: `style guide.md`
- Coaching practices: `coaching best practices.md`
