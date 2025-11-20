---
applyTo: "apps/api/**/*.{ts,js}"
---

# Backend API Development Instructions

## API Architecture Pattern

The API follows a **modular, layered architecture**:

```
apps/api/src/
├── index.ts                    # Main entry point, middleware setup
├── config/
│   └── database.ts             # DatabaseService (connection pooling)
└── modules/
    ├── auth/                   # Authentication module
    │   ├── auth.routes.ts      # Route definitions (Express router)
    │   ├── auth.controller.ts  # Request handlers
    │   ├── auth.service.ts     # Business logic & database queries
    │   └── *.test.ts           # Vitest unit tests
    ├── badges/                 # Badge system
    ├── lessons/                # Learning content
    ├── notebook/               # Engineering notebook
    └── skills/                 # Skills tracking
```

## Layer Responsibilities

### Routes (`*.routes.ts`)
- Define API endpoints
- Mount middleware
- Export Express router
- NO business logic here

```typescript
import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validation';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/register', validateRequest(registerSchema), authController.register);

export default router;
```

### Controllers (`*.controller.ts`)
- Handle HTTP requests/responses
- Validate input data
- Call service layer
- Format responses
- Handle errors appropriately

```typescript
import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, pin } = req.body;
      const result = await authService.authenticateWithPin(username, pin);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};
```

### Services (`*.service.ts`)
- Business logic
- Database queries
- External API calls
- Data transformation
- Reusable functions

```typescript
import { getDatabase } from '../../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authService = {
  async authenticateWithPin(username: string, pin: string) {
    const db = getDatabase();
    
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(pin, user.pin_hash);
    
    if (!isValid) {
      throw new Error('Invalid PIN');
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    return { token, user: { id: user.id, username: user.username } };
  }
};
```

## Database Connection Pattern

**ALWAYS** use the centralized `DatabaseService`:

```typescript
import { getDatabase } from '../../config/database';

const db = getDatabase();
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**Important:** The DatabaseService supports "local-only mode" for data privacy compliance.

## API Response Format

### Success Response
```typescript
{
  "success": true,
  "data": {
    // ... response data
  }
}
```

### Error Response
```typescript
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional info
  }
}
```

## Input Validation

Use Zod schemas for validation:

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  pin: z.string().length(4).regex(/^\d{4}$/)
});

export const registerStudentSchema = z.object({
  username: z.string().min(3).max(50),
  displayName: z.string().min(1).max(100),
  grade: z.number().int().min(0).max(5), // K=0, 1-5
  pin: z.string().length(4).regex(/^\d{4}$/),
  avatarConfig: z.object({
    style: z.string(),
    seed: z.string()
  })
});
```

## Authentication System

Three authentication methods based on age:

1. **PIN (Grades 3-5)**: 4-digit PIN + username + avatar
2. **Animal Grid (Grades K-2)**: Choose 4 animals from 5×5 grid (order-independent)
3. **Email/Password (Staff)**: Standard authentication for coaches/admins

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  role: 'student' | 'coach' | 'admin';
  iat: number;
  exp: number;
}
```

### Protected Routes

Use authentication middleware:

```typescript
import { authenticate, authorize } from '../../middleware/auth';

// Requires valid JWT token
router.get('/profile', authenticate, userController.getProfile);

// Requires specific role
router.post('/lessons', authenticate, authorize(['coach', 'admin']), lessonController.create);
```

## Module Development Pattern

When adding a new API module:

1. Create module directory in `apps/api/src/modules/<module-name>/`
2. Create files: `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.test.ts`
3. Write tests first (TDD)
4. Implement controller → service → database queries
5. Export router from `*.routes.ts`
6. Import and mount router in `apps/api/src/index.ts`
7. Run tests to verify

## Testing Requirements

Every module must have comprehensive tests:

```typescript
// Service tests
describe('LessonService', () => {
  describe('createLesson', () => {
    it('creates a lesson with valid data', async () => {
      // Test implementation
    });

    it('throws error for invalid grade level', async () => {
      // Test implementation
    });
  });
});

// API endpoint tests
describe('POST /api/v1/lessons', () => {
  it('creates lesson when authenticated as coach', async () => {
    // Test implementation
  });

  it('returns 401 when not authenticated', async () => {
    // Test implementation
  });

  it('returns 403 when authenticated as student', async () => {
    // Test implementation
  });
});
```

## Error Handling

Create custom error classes:

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}
```

Use in services:

```typescript
if (!user) {
  throw new UnauthorizedError('Invalid credentials');
}

if (grade < 0 || grade > 5) {
  throw new ValidationError('Grade must be between K (0) and 5');
}
```

## Database Queries

### Use Parameterized Queries

**Always** use parameterized queries to prevent SQL injection:

```typescript
// ✅ CORRECT
const result = await db.query(
  'SELECT * FROM users WHERE id = $1 AND grade = $2',
  [userId, grade]
);

// ❌ WRONG - SQL injection vulnerability
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

### Transaction Handling

For operations that need atomicity:

```typescript
const client = await db.getClient();
try {
  await client.query('BEGIN');
  
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO student_badges ...');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Middleware

### Common Middleware Patterns

```typescript
// Request logging
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
};

// Error handling
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code
      }
    });
  }

  logger.error('Unhandled error', { error });
  return res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
};
```

## Environment Variables

Always use environment variables for configuration:

```typescript
// .env.example should list all required variables
DATABASE_URL=postgresql://user:password@localhost:5432/stemlab
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3001
LOCAL_ONLY=true
```

Access in code:

```typescript
const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET!,
  isLocalOnly: process.env.LOCAL_ONLY === 'true'
};
```

## File Uploads

Use Multer for file uploads:

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notebook/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/notebook/:id/media', upload.single('file'), notebookController.uploadMedia);
```

## Performance Considerations

1. **Connection Pooling**: Already handled by DatabaseService
2. **Query Optimization**: Use indexes, avoid N+1 queries
3. **Caching**: Consider Redis for frequently accessed data (future)
4. **Pagination**: Always paginate list endpoints

```typescript
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

// In controller
const { page, limit } = req.query;
const offset = (page - 1) * limit;

const result = await db.query(
  'SELECT * FROM lessons LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

## Logging

Use structured logging:

```typescript
import { logger } from '../../utils/logger';

// Info level
logger.info('User logged in', { userId, username });

// Error level
logger.error('Database query failed', { error, query });

// Never log PII (personally identifiable information)
// ❌ WRONG
logger.info('Login attempt', { email: user.email, password });

// ✅ CORRECT
logger.info('Login attempt', { userId: user.id });
```

## API Versioning

All routes are under `/api/v1/`:

```typescript
// In index.ts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/skills', skillRoutes);
```

This allows future API versions without breaking existing clients.

## Health Check Endpoint

Maintain the health check endpoint:

```typescript
app.get('/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  
  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: dbStatus,
    localOnly: process.env.LOCAL_ONLY === 'true'
  });
});
```

## Data Privacy Compliance

**NEVER** send student data to external services:

```typescript
// ❌ WRONG - Sends student data externally
await axios.post('https://analytics.example.com/track', {
  studentName: user.displayName,
  activity: 'lesson_complete'
});

// ✅ CORRECT - Anonymized, no PII
logger.info('Lesson completed', {
  userId: user.id, // ID only, not name
  lessonId: lesson.id
});
```

## Common Issues

1. **Database connection errors**: Check `docker-compose ps` and `DATABASE_URL`
2. **JWT token issues**: Verify `JWT_SECRET` is set
3. **CORS errors**: Configure CORS middleware properly
4. **File upload failures**: Check upload directory permissions
5. **Port conflicts**: Default is 3001, change if needed

## Resources

- Express documentation: https://expressjs.com/
- PostgreSQL documentation: https://www.postgresql.org/docs/
- JWT best practices: https://jwt.io/introduction
- Zod documentation: https://zod.dev/
