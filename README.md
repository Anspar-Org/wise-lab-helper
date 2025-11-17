# STEM Lab Assistant

A learning-first platform for elementary engineering education, with initial focus on VEX IQ robotics teams (6502A & 6502B).

## 🎯 Project Philosophy

**API-First Development**: We're building the backend API completely before creating the user interface. This approach:

- ✅ Allows thorough testing of business logic independently
- ✅ Enables comprehensive API documentation
- ✅ Supports multiple future frontends (web, mobile, kiosk)
- ✅ Reduces complexity during development
- ✅ Makes the system more maintainable

## 📚 Core Features (Priority Order)

1. **Engineering Methodology Lessons** - Teaching engineering design process
2. **Teamwork & Learning Skills** - Collaboration and research skills
3. **Skills Tracking & Assessment** - Competency development tracking
4. **Digital Engineering Notebook** - Project documentation with media
5. **Student Progress & Badges** - Gamification and motivation
6. **Team Management** - VEX IQ team rosters and sessions
7. **Competition Tracking** - Results and interview preparation

## 🏗️ Architecture

### Monorepo Structure

```
stem-lab-assistant/
├── apps/
│   ├── api/                 # Express + TypeScript backend
│   └── web/                 # React frontend (future)
├── packages/
│   ├── database/            # PostgreSQL schemas & migrations
│   ├── shared-types/        # TypeScript types (shared)
│   ├── ui/                  # Shared UI components (future)
│   └── utils/               # Shared utilities
├── docker/
│   ├── Dockerfile.api
│   └── Dockerfile.web
├── docker-compose.yml       # Local development environment
└── docs/                    # Documentation
```

### Technology Stack

**Backend (Current Focus):**
- Node.js 18+ with TypeScript
- Express.js for REST API
- PostgreSQL 16 for database
- JWT for authentication
- Vitest for testing
- OpenAPI/Swagger for documentation

**Frontend (Future):**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS (configured per style guide)
- Zustand for state management

### Deployment

- **Development**: Docker Compose locally
- **Production**: Synology DS923+ NAS (future)
- **Network**: Local lab network for students, remote admin access
- **Budget**: $500/year maximum

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anspar-Org/wise-lab-helper.git
   cd wise-lab-helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit apps/api/.env with your configuration
   ```

4. **Start the database**
   ```bash
   docker-compose up -d db
   ```

5. **Run database migrations**
   ```bash
   cd packages/database
   node migrate.js
   ```

6. **Start the API server**
   ```bash
   npm run dev
   ```

7. **Verify it's working**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"healthy",...}
   ```

## 📡 API Development

### Current Implementation Status

- [x] Project structure and monorepo setup
- [x] Docker Compose environment
- [x] PostgreSQL database with comprehensive schema
- [x] Express API with TypeScript
- [x] Health check and version endpoints
- [ ] Authentication API (in progress)
  - [ ] Student PIN authentication (Grades 3-5)
  - [ ] Animal grid authentication (Grades K-2)
  - [ ] Staff email/password authentication
  - [ ] Avatar system integration
- [ ] Lessons & Learning Content API
- [ ] Skills Tracking & Assessment API
- [ ] Engineering Notebook API with file uploads
- [ ] Badge System & Gamification API
- [ ] Team Management API
- [ ] Practice Session Tracking API
- [ ] Competition Tracking API
- [ ] OpenAPI/Swagger documentation
- [ ] Comprehensive test suite

### Testing the API

**Option 1: cURL**
```bash
# Health check
curl http://localhost:3001/health

# API version
curl http://localhost:3001/api/v1
```

**Option 2: HTTPie**
```bash
# Install: brew install httpie
http GET http://localhost:3001/health
```

**Option 3: Postman / Insomnia / Thunder Client**
- Import the OpenAPI spec (once generated)
- Use the GUI to test endpoints

### Running Tests

```bash
# Run all tests
npm test

# Run API tests only
npm test --workspace=apps/api

# Run with coverage
npm run test:coverage --workspace=apps/api
```

## 🗄️ Database Schema

The database schema is organized by priority:

### High Priority Tables
- **users** - Student and staff authentication
- **lessons** - Learning content and methodology
- **lesson_steps** - Multi-step lesson structure
- **student_lesson_progress** - Progress tracking
- **skills** - Competency definitions
- **student_skills** - Skill assessments
- **badges** - Achievement definitions
- **student_badges** - Earned achievements
- **notebook_entries** - Engineering documentation

### Lower Priority Tables
- **teams** - VEX IQ team management
- **team_members** - Team rosters
- **practice_sessions** - Session planning
- **session_rotations** - Station tracking
- **competition_results** - Competition tracking

See `packages/database/migrations/001-initial-schema.sql` for complete schema.

## 🔐 Authentication System

Three authentication methods based on age:

1. **PIN (Grades 3-5)**
   - 4-digit PIN + avatar
   - Quick login (< 30 seconds)

2. **Animal Grid (Grades K-2)**
   - Choose 4 animals from 5×5 grid
   - Order-independent matching
   - Visual and engaging

3. **Email/Password (Staff)**
   - Standard authentication
   - Admin role capabilities

## 📝 API Endpoints (Planned)

### Authentication
```
POST   /api/v1/auth/register/student    # Student self-registration
POST   /api/v1/auth/register/staff      # Staff registration
POST   /api/v1/auth/login                # Universal login
POST   /api/v1/auth/logout               # Logout
POST   /api/v1/auth/refresh              # Refresh JWT token
GET    /api/v1/auth/me                   # Current user info
```

### Lessons
```
GET    /api/v1/lessons                   # List all lessons
GET    /api/v1/lessons/:id               # Get lesson details
POST   /api/v1/lessons                   # Create lesson (coach)
PUT    /api/v1/lessons/:id               # Update lesson (coach)
DELETE /api/v1/lessons/:id               # Delete lesson (coach)
GET    /api/v1/lessons/:id/steps         # Get lesson steps
POST   /api/v1/lessons/:id/start         # Start lesson (student)
PUT    /api/v1/lessons/:id/progress      # Update progress
POST   /api/v1/lessons/:id/complete      # Complete lesson
```

### Skills
```
GET    /api/v1/skills                    # List all skills
GET    /api/v1/skills/:id                # Get skill details
POST   /api/v1/skills                    # Create skill (coach)
GET    /api/v1/students/:id/skills       # Student skill profile
POST   /api/v1/students/:id/skills       # Assess skill (coach)
PUT    /api/v1/students/:id/skills/:sid  # Update assessment
```

### Engineering Notebook
```
GET    /api/v1/notebook                  # List entries
GET    /api/v1/notebook/:id              # Get entry
POST   /api/v1/notebook                  # Create entry
PUT    /api/v1/notebook/:id              # Update entry
DELETE /api/v1/notebook/:id              # Delete entry
POST   /api/v1/notebook/:id/media        # Upload media
```

### Badges
```
GET    /api/v1/badges                    # List all badges
GET    /api/v1/students/:id/badges       # Student badges
POST   /api/v1/students/:id/badges       # Award badge
GET    /api/v1/badges/:id/progress       # Badge progress
```

## 🧪 Test-Driven Development

All features are developed with TDD:

1. Write failing test
2. Implement minimum code to pass
3. Refactor while keeping tests green
4. Add edge case tests
5. Document in JSDoc/TSDoc

Target: **>80% code coverage**

## 📖 Documentation

- **API Documentation**: OpenAPI/Swagger (auto-generated)
- **Architecture Decisions**: `/docs/architecture/`
- **User Guides**: `/docs/user-guides/` (future)

## 🔒 Data Privacy & Compliance

- **Jurisdiction**: USA, California, Los Angeles
- **Compliance**: FERPA, COPPA, CA student privacy laws
- **Data Retention**: Matriculation (end of Grade 5) + 4 years
- **Storage**: All data on local NAS (never external)
- **Backups**: Automated cloud backups

## 🎨 UI/UX (Future Phase)

When we build the frontend, it will follow the style guide:

- **Design**: Console-style, single-screen interface (1920x1000px)
- **Colors**: Palette C (Discovery Lab) as default
- **Typography**: Child-friendly sans-serif (Gill Sans, Sassoon)
- **Touch Targets**: Minimum 44×44px
- **Age-Appropriate**: Designed for 9-11 year olds

## 🤝 Contributing

This is a private project for Wise Elementary STEM Lab. For questions or issues, contact the admin.

## 📄 License

UNLICENSED - Private school project

---

**Current Status**: ✅ Database schema complete | 🚧 Authentication API in progress

**Next Steps**:
1. Implement authentication endpoints
2. Add avatar system integration (DiceBear)
3. Build lessons API
4. Create skills tracking API

For detailed implementation guidance, see `AI_AGENT_PROMPT.md`.
