# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

STEM Lab Assistant is a learning-first platform for elementary engineering education (K-5), with initial focus on VEX IQ robotics teams. This is an **API-first development** project - we're building the complete backend before creating any user interface.

**Key Context:**
- Target users: Elementary students (K-5) and coaches
- Deployment: Self-hosted on Synology NAS (local network only)
- Authentication: Age-appropriate methods (PIN for grades 3-5, animal grid for K-2, password for staff)
- Data privacy: FERPA/COPPA compliant, all data stays local
- Budget: $500/year maximum

## Development Commands

### Setup & Installation

```bash
# Install all dependencies
npm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your configuration

# Start database
docker-compose up -d db

# Run database migrations
cd packages/database
node migrate.js
```

### Running the Application

```bash
# Start all services (db + api)
npm run dev

# Or use Docker Compose
docker-compose up

# Start only the API (if db is already running)
npm run dev --workspace=apps/api

# Start only the database
docker-compose up -d db
```

### Testing

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=apps/api

# Run tests with coverage
npm run test:coverage --workspace=apps/api

# Run single test file
npx vitest apps/api/src/modules/badges/badges.service.test.ts
```

### Building

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build --workspace=apps/api
```

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Format code with Prettier
npm run format --workspace=apps/api
```

### Database Management

```bash
# Run migrations
cd packages/database
npm run migrate:up

# Rollback migration
npm run migrate:down

# Create new migration
npm run migrate:create <migration-name>

# View database logs
docker-compose logs -f db
```

### Docker Commands

```bash
# Start all services
npm run docker:up
# or: docker-compose up -d

# Stop all services
npm run docker:down
# or: docker-compose down

# View logs
npm run docker:logs
# or: docker-compose logs -f

# Restart a service
docker-compose restart api
```

## Architecture

### Monorepo Structure

This is a **Turborepo/npm workspaces** monorepo:

```
stem-lab-assistant/
├── apps/
│   ├── api/              # Express + TypeScript backend (current focus)
│   └── web/              # React frontend (future)
├── packages/
│   ├── database/         # PostgreSQL schemas & migrations
│   └── shared-types/     # Shared TypeScript types
├── docker/               # Dockerfiles
├── docker-compose.yml    # Local development environment
└── docs/                 # Documentation
```

### API Architecture Pattern

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
    │   ├── avatar.service.ts   # DiceBear avatar generation
    │   └── *.test.ts           # Vitest unit tests
    ├── badges/                 # Badge system
    ├── lessons/                # Learning content
    ├── notebook/               # Engineering notebook
    └── skills/                 # Skills tracking
```

**Layer responsibilities:**
- **Routes** (`*.routes.ts`): Define API endpoints, mount to Express app
- **Controllers** (`*.controller.ts`): Handle HTTP requests/responses, validation
- **Services** (`*.service.ts`): Business logic, database queries, external APIs
- **Tests** (`*.test.ts`): Unit tests using Vitest + Supertest

### Database Connection Pattern

All modules use the centralized `DatabaseService` from `config/database.ts`:

```typescript
import { getDatabase } from '../../config/database';

const db = getDatabase();
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**Important:** The DatabaseService supports "local-only mode" for data privacy compliance - it prevents external database connections in certain environments.

### Authentication System

Three authentication methods based on age:

1. **PIN (Grades 3-5)**: 4-digit PIN + username + avatar
2. **Animal Grid (Grades K-2)**: Choose 4 animals from 5×5 grid (order-independent)
3. **Email/Password (Staff)**: Standard authentication for coaches/admins

**Avatar System:** Uses DiceBear API (via `@dicebear/core` and `@dicebear/collection`) to generate avatars during registration.

### Database Schema Organization

Database is structured by **feature priority**:

**High Priority:**
- `users` - Authentication and user profiles
- `lessons`, `lesson_steps`, `student_lesson_progress` - Learning content
- `skills`, `student_skills` - Competency tracking
- `badges`, `student_badges` - Gamification
- `notebook_entries`, `notebook_media` - Engineering documentation

**Lower Priority:**
- `teams`, `team_members` - VEX IQ team management
- `practice_sessions`, `session_rotations` - Session tracking
- `competition_results` - Competition tracking

See `packages/database/migrations/001-initial-schema.sql` for complete schema.

## Test-Driven Development (TDD)

This project follows **strict TDD practices**:

1. Write failing test first
2. Implement minimum code to pass
3. Refactor while keeping tests green
4. Add edge case tests
5. Document with JSDoc/TSDoc

**Target:** >80% code coverage

**Testing Stack:**
- **Vitest** - Test runner (faster than Jest)
- **Supertest** - HTTP endpoint testing
- **@vitest/coverage-v8** - Code coverage

## Important Development Practices

### API-First Development Philosophy

- Build complete backend API before any frontend
- All endpoints must be fully tested before moving to UI
- Document APIs with OpenAPI/Swagger (planned)
- Enables multiple future frontends (web, mobile, kiosk)

### Data Privacy Requirements

- All student data MUST remain on local network (FERPA/COPPA compliance)
- No external API calls that send student data
- Database runs in "local-only mode" during development
- DiceBear avatars are generated server-side (no external calls with student info)

### Git Workflow

- Main branch: `main`
- Create feature branches for all changes
- **NEVER edit files directly on main branch** (per user's CLAUDE.md instructions)
- Always create a new branch before editing/creating/deleting files

### Module Development Pattern

When adding a new API module:

1. Create module directory in `apps/api/src/modules/<module-name>/`
2. Create files: `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.test.ts`
3. Write tests first (TDD)
4. Implement controller → service → database queries
5. Export router from `*.routes.ts`
6. Import and mount router in `apps/api/src/index.ts`
7. Run tests to verify

### Shared Types

TypeScript types shared between frontend/backend go in `packages/shared-types/src/index.ts`. Import using:

```typescript
import type { User, Badge, Lesson } from '@stemlab/shared-types';
```

## Technology Stack

**Backend (Current):**
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

**DevOps:**
- Docker & Docker Compose (local dev)
- Synology NAS (production deployment)

## Verification & Health Checks

```bash
# Verify API is running
curl http://localhost:3001/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "uptime": ...,
#   "environment": "development",
#   "database": "connected",
#   "localOnly": true
# }

# Check API version info
curl http://localhost:3001/api/v1
```

## Common Issues & Troubleshooting

See `SETUP_TROUBLESHOOTING.md` for detailed troubleshooting guidance, particularly for database configuration issues.

**Database connection issues:**
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check logs: `docker-compose logs db`
- Verify `.env` file has correct `DATABASE_URL`

**Test failures:**
- Ensure database is running before tests
- Run migrations: `cd packages/database && node migrate.js`
- Check test database connection in test setup

**Port conflicts:**
- API default: 3001
- Database default: 5432
- Web (future): 5173
- Change ports in `docker-compose.yml` if needed
