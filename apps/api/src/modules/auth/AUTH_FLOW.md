# Authentication Flow Documentation

## Overview

The STEM Lab Assistant authentication system supports three different authentication methods tailored to different user types:

1. **PIN Authentication** (Grades 3-5): Simple 4-digit PIN
2. **Animal Grid Authentication** (Grades K-2): Visual pattern matching with 4 animals
3. **Password Authentication** (Staff): Traditional username/email + password

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                      API Endpoints                          │
│  POST /api/v1/auth/register/student                         │
│  POST /api/v1/auth/register/staff                           │
│  POST /api/v1/auth/login                                    │
│  POST /api/v1/auth/logout                                   │
│  POST /api/v1/auth/refresh                                  │
│  GET  /api/v1/auth/me                                       │
│  POST /api/v1/auth/avatar/generate                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─> Validation Layer (Zod)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Auth Controller                           │
│  • Handles HTTP requests/responses                          │
│  • Delegates business logic to AuthService                  │
│  • Returns appropriate status codes                         │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Auth Service                             │
│  • Student registration (PIN/Animal Grid)                   │
│  • Staff registration (Password)                            │
│  • Login with multiple auth types                           │
│  • JWT token generation & management                        │
│  • Token refresh & revocation                               │
│  • Data retention date calculation                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─> bcrypt (hashing)
                 ├─> jsonwebtoken (JWT)
                 ├─> AvatarService (DiceBear)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Database Layer                            │
│  • users table                                              │
│  • auth_tokens table                                        │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flows

### 1. Student Registration (PIN Authentication)

**Endpoint:** `POST /api/v1/auth/register/student`

**Request:**
```json
{
  "username": "john_doe",
  "display_name": "John Doe",
  "grade_level": "4",
  "auth_type": "pin",
  "pin": "1234",
  "avatar_config": {
    "seed": "john_doe",
    "style": "adventurer"
  }
}
```

**Process:**
1. Validate request data (Zod schema)
2. Check PIN is exactly 4 digits
3. Hash PIN with bcrypt (10 rounds)
4. Generate avatar config if not provided
5. Calculate data retention date based on grade level
6. Insert user into database
7. Return user object (without sensitive fields)

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "display_name": "John Doe",
  "role": "student",
  "grade_level": "4",
  "auth_type": "pin",
  "avatar_config": { "seed": "john_doe", "style": "adventurer" },
  "created_at": "2025-11-16T...",
  "updated_at": "2025-11-16T...",
  "data_retention_date": "2031-06-30"
}
```

### 2. Student Registration (Animal Grid Authentication)

**Endpoint:** `POST /api/v1/auth/register/student`

**Request:**
```json
{
  "username": "jane_doe",
  "display_name": "Jane Doe",
  "grade_level": "K",
  "auth_type": "animal_grid",
  "animal_pattern": ["dog", "cat", "bird", "fish"],
  "avatar_config": {
    "seed": "jane_doe",
    "style": "adventurer"
  }
}
```

**Process:**
1. Validate request data
2. Check animal_pattern has exactly 4 animals
3. Sort animals alphabetically (for order-independent matching)
4. Hash sorted pattern with bcrypt
5. Generate avatar config if not provided
6. Calculate data retention date
7. Insert user into database
8. Return user object

**Special Note:** Animal patterns are order-independent. During login, the provided pattern is sorted before comparison, so ["dog", "cat", "bird", "fish"] matches ["fish", "bird", "cat", "dog"].

### 3. Staff Registration

**Endpoint:** `POST /api/v1/auth/register/staff`

**Request:**
```json
{
  "username": "coach_jane",
  "display_name": "Coach Jane",
  "email": "coach.jane@school.edu",
  "password": "SecurePassword123!",
  "role": "coach"
}
```

**Process:**
1. Validate request data
2. Require email for staff
3. Validate password (minimum 8 characters)
4. Hash password with bcrypt
5. Insert user into database
6. Return user object (without password hash)

### 4. Login Flow

**Endpoint:** `POST /api/v1/auth/login`

**Request (PIN):**
```json
{
  "username": "john_doe",
  "auth_type": "pin",
  "pin": "1234"
}
```

**Request (Animal Grid):**
```json
{
  "username": "jane_doe",
  "auth_type": "animal_grid",
  "animal_pattern": ["dog", "cat", "bird", "fish"]
}
```

**Request (Password):**
```json
{
  "username": "coach_jane",
  "auth_type": "password",
  "password": "SecurePassword123!"
}
```

**Process:**
1. Find user by username
2. Verify auth_type matches user's auth_type
3. Verify credentials using bcrypt.compare()
   - PIN: Compare provided PIN with pin_hash
   - Animal Grid: Sort pattern and compare with animal_pattern_hash
   - Password: Compare provided password with password_hash
4. Update last_login timestamp
5. Generate JWT token with payload:
   ```json
   {
     "userId": "uuid",
     "username": "john_doe",
     "role": "student"
   }
   ```
6. Hash token and store in auth_tokens table
7. Return token and user data

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "display_name": "John Doe",
    "role": "student",
    "grade_level": "4",
    "avatar_config": { "seed": "john_doe" }
  },
  "expires_at": "2025-11-17T..."
}
```

### 5. Protected Routes (Authentication Middleware)

**Request Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Process:**
1. Extract token from Authorization header
2. Verify JWT signature and expiration
3. Extract user info from token payload
4. Attach user info to request object
5. Continue to route handler

**Middleware Usage:**
```typescript
// Require authentication
router.get('/protected', authenticateToken, handler);

// Require specific role
router.get('/admin', authenticateToken, authorizeRoles(UserRole.ADMIN), handler);

// Optional authentication
router.get('/public', optionalAuth, handler);
```

### 6. Logout Flow

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Process:**
1. Authenticate user from JWT
2. Extract token ID from database
3. Set revoked_at timestamp in auth_tokens table
4. Return success message

### 7. Token Refresh Flow

**Endpoint:** `POST /api/v1/auth/refresh`

**Headers:**
```
Authorization: Bearer <old-token>
```

**Process:**
1. Authenticate user from old token
2. Check if token is expired or revoked
3. If valid, revoke old token
4. Generate new JWT token
5. Store new token in database
6. Return new token and user data

## Data Retention

Students' data is retained based on their grade level:

- **Calculation:** Graduation year + 4 years
- **K student:** Current year + 6 years (to graduate) + 4 years = Current year + 10 years
- **1st grade:** Current year + 5 years + 4 years = Current year + 9 years
- **2nd grade:** Current year + 4 years + 4 years = Current year + 8 years
- **3rd grade:** Current year + 3 years + 4 years = Current year + 7 years
- **4th grade:** Current year + 2 years + 4 years = Current year + 6 years
- **5th grade:** Current year + 1 year + 4 years = Current year + 5 years

**Retention Date Format:** June 30th of retention year (end of school year)

## Avatar System

### DiceBear Integration

The avatar system uses [DiceBear](https://www.dicebear.com/) to generate unique, consistent avatars:

**Generate Avatar:**
```
POST /api/v1/auth/avatar/generate
{
  "seed": "username",
  "style": "adventurer",
  "backgroundColor": "#ffffff"
}
```

**Available Styles:**
- All styles: 25+ options (see `AvatarService.getAvailableStyles()`)
- Student-friendly styles: 18 curated options for elementary students

**Avatar Properties:**
- Deterministic: Same seed always generates same avatar
- SVG format: Scalable and lightweight
- Customizable: Background color, style, and more

## Security Considerations

### Implemented

✅ **Password Hashing:** All credentials hashed with bcrypt (10 rounds)
✅ **JWT Tokens:** Signed and time-limited (24 hours)
✅ **Token Storage:** Token hashes stored in database for revocation
✅ **Order-Independent Animal Grid:** Sorted before hashing
✅ **Input Validation:** Zod schemas validate all inputs
✅ **No Sensitive Data in Responses:** Password/PIN hashes never returned

### Recommended for Production

⚠️ **Rate Limiting:**
- Login endpoint: 5 failed attempts per username per 15 minutes
- Registration: 10 registrations per IP per hour
- Token refresh: 10 requests per token per hour

⚠️ **HTTPS Only:** Enforce HTTPS in production

⚠️ **Secure JWT Secret:** Use strong, random JWT_SECRET in production

⚠️ **Token Rotation:** Implement automatic token rotation

⚠️ **Account Lockout:** Lock account after N failed login attempts

⚠️ **CSRF Protection:** Implement CSRF tokens for state-changing operations

⚠️ **Staff Registration:** Restrict staff registration to admin-only in production

## Database Schema

### users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    role user_role NOT NULL,
    grade_level grade_level,
    avatar_config JSONB,
    auth_type auth_type NOT NULL,
    password_hash VARCHAR(255),
    pin_hash VARCHAR(255),
    animal_pattern_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    data_retention_date DATE
);
```

### auth_tokens Table

```sql
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE
);
```

## Testing

### Test Coverage

- **auth.service.test.ts:** 32 tests - Service layer unit tests
- **auth.controller.test.ts:** 18 tests - Controller unit tests
- **Overall Coverage:** >90% for service and controller layers

### Running Tests

```bash
# Run auth module tests
npm test -- src/modules/auth

# Run with coverage
npm test -- src/modules/auth --coverage

# Run specific test file
npm test -- src/modules/auth/auth.service.test.ts
```

### Test Categories

1. **Registration Tests**
   - PIN registration validation
   - Animal grid registration
   - Staff registration
   - Duplicate username handling
   - Input validation

2. **Login Tests**
   - Correct credentials
   - Invalid credentials
   - Order-independent animal grid
   - Token generation
   - Last login update

3. **Token Management Tests**
   - Token verification
   - Token refresh
   - Token revocation (logout)
   - Expired token handling

4. **Data Validation Tests**
   - PIN format (4 digits)
   - Animal pattern (exactly 4 animals)
   - Password strength
   - Username uniqueness

5. **Avatar Tests**
   - Avatar generation
   - Style validation
   - Deterministic output

## API Reference

### Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register/student` | No | Register a student |
| POST | `/api/v1/auth/register/staff` | No* | Register a staff member |
| POST | `/api/v1/auth/login` | No | Login with credentials |
| POST | `/api/v1/auth/logout` | Yes | Logout and revoke token |
| POST | `/api/v1/auth/refresh` | Yes | Refresh authentication token |
| GET | `/api/v1/auth/me` | Yes | Get current user profile |
| POST | `/api/v1/auth/avatar/generate` | No | Generate avatar preview |
| GET | `/api/v1/auth/avatar/styles` | No | List available avatar styles |

*Should be restricted to admin-only in production

### Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created (registration successful) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials or token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate username/email) |
| 500 | Internal Server Error |

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/stemlab_dev
JWT_SECRET=your-secret-key-change-in-production

# Optional
NODE_ENV=development
PORT=3001
DATABASE_LOCAL_ONLY=true
```

## Future Enhancements

1. **Two-Factor Authentication (2FA):** For staff accounts
2. **Password Reset:** Email-based password reset flow
3. **Session Management:** View and revoke active sessions
4. **Login History:** Track login attempts and locations
5. **OAuth Integration:** Google/Microsoft single sign-on for staff
6. **Biometric Auth:** Fingerprint/Face ID for mobile apps
7. **Passwordless Magic Links:** Email-based login links
8. **Remember Me:** Extended session duration option

## Support

For questions or issues:
- **Documentation:** See this file
- **Tests:** Run `npm test -- src/modules/auth`
- **Code:** See source files in `/apps/api/src/modules/auth/`
