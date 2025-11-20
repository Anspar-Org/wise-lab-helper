---
applyTo: "**/*.{test,spec}.{ts,tsx,js,jsx}"
excludeAgent: "code-review"
---

# Testing Instructions

## Test-Driven Development (TDD)

This project follows **strict TDD practices**:

1. Write failing test first
2. Implement minimum code to pass
3. Refactor while keeping tests green
4. Add edge case tests
5. Document with JSDoc/TSDoc

**Target:** >80% code coverage

## Testing Stack

- **Vitest** - Test runner (faster than Jest)
- **Supertest** - HTTP endpoint testing (backend)
- **React Testing Library** - Component testing (frontend)
- **@vitest/coverage-v8** - Code coverage
- **Playwright** - E2E testing (future)

## Test File Organization

```
module/
├── feature.service.ts
├── feature.service.test.ts      # Unit tests for service
├── feature.controller.ts
├── feature.controller.test.ts   # Unit tests for controller
├── feature.routes.ts
└── feature.integration.test.ts  # Integration tests for API endpoints
```

## Backend Testing Patterns

### Service Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from './auth.service';
import { getDatabase } from '../../config/database';

describe('AuthService', () => {
  let db: Database;

  beforeEach(async () => {
    db = getDatabase();
    // Setup test data
    await db.query('BEGIN');
  });

  afterEach(async () => {
    // Cleanup
    await db.query('ROLLBACK');
  });

  describe('authenticateWithPin', () => {
    it('returns token for valid credentials', async () => {
      // Arrange
      const username = 'test_alice';
      const pin = '1234';
      await createTestUser(username, pin);

      // Act
      const result = await authService.authenticateWithPin(username, pin);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result.user.username).toBe(username);
    });

    it('throws error for invalid PIN', async () => {
      const username = 'test_alice';
      await createTestUser(username, '1234');

      await expect(
        authService.authenticateWithPin(username, '9999')
      ).rejects.toThrow('Invalid PIN');
    });

    it('throws error for non-existent user', async () => {
      await expect(
        authService.authenticateWithPin('nonexistent', '1234')
      ).rejects.toThrow('User not found');
    });

    it('updates last_login timestamp', async () => {
      const username = 'test_alice';
      await createTestUser(username, '1234');

      await authService.authenticateWithPin(username, '1234');

      const user = await getUser(username);
      expect(user.last_login).toBeDefined();
      expect(new Date(user.last_login).getTime()).toBeCloseTo(
        Date.now(),
        -3 // Within 1 second
      );
    });
  });
});
```

### Controller Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authController } from './auth.controller';
import { authService } from './auth.service';

// Mock the service
vi.mock('./auth.service');

describe('AuthController', () => {
  describe('login', () => {
    it('returns 200 with token on success', async () => {
      // Arrange
      const mockRequest = {
        body: { username: 'alice', pin: '1234' }
      } as Request;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;

      const mockNext = vi.fn() as NextFunction;

      const mockResult = {
        token: 'mock-jwt-token',
        user: { id: '123', username: 'alice' }
      };

      vi.mocked(authService.authenticateWithPin).mockResolvedValue(mockResult);

      // Act
      await authController.login(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('calls next with error on failure', async () => {
      const mockRequest = {
        body: { username: 'alice', pin: 'wrong' }
      } as Request;

      const mockResponse = {} as Response;
      const mockNext = vi.fn() as NextFunction;
      const mockError = new Error('Invalid PIN');

      vi.mocked(authService.authenticateWithPin).mockRejectedValue(mockError);

      await authController.login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
```

### Integration Tests (API Endpoints)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../index';
import { getDatabase } from '../../config/database';

describe('POST /api/v1/auth/login', () => {
  let db: Database;

  beforeAll(async () => {
    db = getDatabase();
    // Create test user
    await db.query(
      'INSERT INTO users (username, display_name, role, auth_type, pin_hash) VALUES ($1, $2, $3, $4, $5)',
      ['test_alice', 'Alice Test', 'student', 'pin', await hashPin('1234')]
    );
  });

  afterAll(async () => {
    // Cleanup
    await db.query('DELETE FROM users WHERE username = $1', ['test_alice']);
  });

  it('returns 200 and JWT token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_alice',
        pin: '1234'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          username: 'test_alice'
        })
      })
    });
  });

  it('returns 401 for invalid PIN', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_alice',
        pin: '9999'
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: expect.objectContaining({
        message: expect.any(String)
      })
    });
  });

  it('returns 400 for missing credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'test_alice' }); // Missing PIN

    expect(response.status).toBe(400);
  });

  it('returns 404 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'nonexistent',
        pin: '1234'
      });

    expect(response.status).toBe(404);
  });
});
```

## Frontend Testing Patterns

### Component Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-indigo');
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLessons } from './useLessons';

describe('useLessons', () => {
  it('fetches lessons successfully', async () => {
    const { result } = renderHook(() => useLessons());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('handles errors gracefully', async () => {
    // Mock API to return error
    const { result } = renderHook(() => useLessons());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

### Store Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false
    });
  });

  it('updates state on login', async () => {
    const store = useAuthStore.getState();

    await store.login({ username: 'alice', pin: '1234' });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toBeDefined();
    expect(useAuthStore.getState().token).toBeDefined();
  });

  it('clears state on logout', () => {
    // Set initial state
    useAuthStore.setState({
      user: { id: '1', username: 'alice' },
      token: 'token',
      isAuthenticated: true
    });

    const store = useAuthStore.getState();
    store.logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
```

## Test Data Management

### Test Fixtures

```typescript
// test/fixtures/users.ts
export const testUsers = {
  student: {
    username: 'test_alice',
    displayName: 'Alice Test',
    role: 'student',
    gradeLevel: 4,
    authType: 'pin',
    pin: '1234'
  },
  coach: {
    username: 'test_coach',
    displayName: 'Coach Test',
    email: 'coach@example.com',
    role: 'coach',
    authType: 'email_password',
    password: 'SecurePass123!'
  }
};

export const createTestUser = async (userData: any) => {
  const db = getDatabase();
  // Implementation
};
```

### Test Utilities

```typescript
// test/utils/helpers.ts
export const generateTestToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: '1h'
  });
};

export const authenticatedRequest = (token: string) => {
  return request(app).set('Authorization', `Bearer ${token}`);
};
```

## Database Testing

### Transaction Rollback Pattern

```typescript
describe('Database operations', () => {
  let db: Database;

  beforeEach(async () => {
    db = getDatabase();
    await db.query('BEGIN');
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  it('creates a record', async () => {
    const result = await db.query(
      'INSERT INTO users (username, display_name, role, auth_type) VALUES ($1, $2, $3, $4) RETURNING *',
      ['test_user', 'Test User', 'student', 'pin']
    );

    expect(result.rows[0]).toBeDefined();
    expect(result.rows[0].username).toBe('test_user');
  });
});
```

## Mocking

### API Mocking

```typescript
import { vi } from 'vitest';
import * as api from '@/services/api';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Component with API', () => {
  it('fetches data on mount', async () => {
    const mockData = [{ id: '1', title: 'Test Lesson' }];
    vi.mocked(api.default.get).mockResolvedValue({ data: { data: mockData } });

    render(<LessonList />);

    await waitFor(() => {
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });
  });
});
```

### Database Mocking

```typescript
import { vi } from 'vitest';
import * as database from '@/config/database';

vi.mock('@/config/database', () => ({
  getDatabase: vi.fn(() => ({
    query: vi.fn(),
    getClient: vi.fn()
  }))
}));

describe('Service with database', () => {
  it('queries database correctly', async () => {
    const mockQuery = vi.fn().mockResolvedValue({
      rows: [{ id: '1', username: 'alice' }]
    });

    vi.mocked(database.getDatabase).mockReturnValue({
      query: mockQuery
    } as any);

    const result = await userService.getById('1');

    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1',
      ['1']
    );
    expect(result.username).toBe('alice');
  });
});
```

## Coverage Requirements

### Minimum Coverage Targets

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Running Coverage

```bash
# Full coverage report
npm run test:coverage --workspace=apps/api

# View HTML report
open coverage/index.html
```

### Excluding from Coverage

```typescript
/* istanbul ignore next */
function debugOnlyFunction() {
  // This won't be counted in coverage
}
```

## Testing Best Practices

### DO

- ✅ Write tests before implementation (TDD)
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Follow Arrange-Act-Assert pattern
- ✅ Test edge cases and error conditions
- ✅ Mock external dependencies
- ✅ Use factories/fixtures for test data
- ✅ Clean up test data after tests

### DON'T

- ❌ Test implementation details
- ❌ Write tests that depend on each other
- ❌ Use real external services in tests
- ❌ Commit test data to database
- ❌ Skip error case tests
- ❌ Use random data without seeds
- ❌ Test third-party libraries

## Test Naming Convention

Use descriptive test names that explain the scenario:

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    // ✅ GOOD
    it('creates a user with valid data', async () => {});
    it('throws ValidationError for invalid email', async () => {});
    it('hashes password before storing', async () => {});

    // ❌ BAD
    it('works', async () => {});
    it('test 1', async () => {});
    it('createUser', async () => {});
  });
});
```

## Debugging Tests

```typescript
// Use console.log to debug
it('debugs test data', () => {
  const data = { foo: 'bar' };
  console.log('Debug:', data);
  expect(data.foo).toBe('bar');
});

// Run single test file
npx vitest apps/api/src/modules/auth/auth.service.test.ts

// Run single test
npx vitest -t "creates a user with valid data"

// Run in watch mode
npx vitest --watch

// Show more verbose output
npx vitest --reporter=verbose
```

## Common Testing Issues

1. **Database connection errors**: Ensure test database is running
2. **Test pollution**: Use beforeEach/afterEach to clean state
3. **Timeout errors**: Increase timeout for slow operations
4. **Async issues**: Always await async operations in tests
5. **Mock not working**: Ensure mocks are defined before imports

## Resources

- Vitest documentation: https://vitest.dev/
- Testing Library: https://testing-library.com/
- Supertest: https://github.com/ladjs/supertest
- Test patterns: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
