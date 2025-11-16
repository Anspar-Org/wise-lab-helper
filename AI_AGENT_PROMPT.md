# AI Agent Prompt: STEM Lab Assistant Web Application

## Project Overview

You are tasked with building a **STEM Lab Assistant Web Application** for an elementary school (K-5) STEM lab. This application will help students participate in various educational modules and activities, with initial focus on VEX IQ robotics competition teams.

## Lab Context

### Equipment & Resources
- **VEX Robotics**: Go and IQ kits
- **3D Printing**: Eight Sovol Zero printers
- **Crafting**: Cricut Maker 3
- **Computing**: Touch-screen laptops with Bluetooth mice and keyboards
- **Storage**: Synology NAS for file storage/proxy caching
- **Infrastructure**: Charging stations, sit-stand desks, classroom smartboard
- **Maker Cart**: TeacherGeek Ultimate STEAM Maker Activity Cart
- **Software**: Tinkercad classroom account (non-Google Classroom version)
- **Printing**: Standard letter-size inkjet printer
- **Organization**: Various cabinets and drawers

### User Demographics
- **In-School Users**: Grades K-5, daily activities, 30-minute sessions
- **After-School Programs**:
  - VEX IQ Robotics Teams (1.5 hours, multiple times/week)
  - Coding track (Scratch, future Python)
  - 3D modeling and printing
  - Computer art and animation
- **Staff**: 1 dedicated STEM staff + rotating parent volunteers
- **Teams**: Currently 2 VEX IQ teams (6502A and 6502B) with 6 students each

### Initial Scope: VEX IQ Competition Teams
- Support 1+ teams per year (currently 2)
- 1-6 students per team (currently 6 each)
- Track progress through competition season
- Facilitate student-centered learning (per REC Foundation guidelines)

## Design Requirements

### UI/UX Guidelines (Per style guide.md)

**Core Philosophy:**
- Single-screen, non-scrolling interface (1920x1000px baseline)
- Console game-style UI with all elements discoverable
- No "below the fold" hidden functionality
- Scrolling ONLY for variable-length content (rosters, galleries)

**Typography:**
- Font stack: Gill Sans, Sassoon Primary, or similar child-friendly sans-serif
- Primary text: 14pt (ages 9-10), 12pt (ages 10-11)
- Headers: 18-24pt
- Button text: Minimum 16pt
- Line-height: 1.5-1.618x
- Sentence case (avoid all caps)

**Color Palette (Use Palette A: Modern Scientific):**
```css
--primary-blue: #4A90E2;
--primary-green: #7ED321;
--primary-purple: #9B59B6;
--secondary-orange: #F5A623;
--secondary-teal: #50C7C7;
--secondary-gray: #95A5A6;
--background: #F8F9FA;
--surface: #FFFFFF;
--text-primary: #2C3E50;
--text-secondary: #7F8C8D;
```

**Interactive Elements:**
- Buttons: Min 48px height, 120px width
- Touch targets: Min 44x44px
- Form controls: Min 40px height
- Animations: 200-300ms duration
- Immediate feedback for all actions

**Layout Structure:**
```
Header (80px): Navigation, user info, global actions
Sidebar (200px): Tool selection, primary navigation
Main Area: Primary content/workspace
Right Panel (300px): Properties, details, help
Footer (100px): Status, progress, quick actions
```

### Pedagogical Requirements (Per coaching best practices.md)

**Student-Centered Design:**
- Students make genuine decisions
- Minimal adult direction required
- Teach concepts, not solutions
- Support engineering design process: Ask → Research → Plan → Create → Test → Improve

**Elementary Engagement (Ages 9-11):**
- Attention span: ~10-12 minutes per segment
- Frequent transitions and brain breaks
- Visual progress tracking
- Multiple contribution paths (building, programming, driving, documenting)
- Celebration of iterations, not just success

**Session Structure Support:**
- 90-minute practice session templates
- Station rotation model (4 stations, 20-min rotations)
- Role assignments: Builder, Programmer, Driver, Documenter
- Leadership rotation tracking

**Team Management:**
- Support for multiple teams with separate schedules
- Cross-team learning and sharing
- Engineering notebook integration
- Progress documentation
- Judge interview preparation tracking

## Technical Architecture

### Phase 1: Architectural Design

**Recommended Stack:**
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS (configured per style guide)
- **State Management**: Zustand or Redux Toolkit
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (for structured data) + file storage for media
- **Authentication**: JWT-based auth with role support (student/coach/admin)
- **Real-time**: Socket.io (for collaborative features)
- **Testing**: Vitest + React Testing Library + Playwright
- **DevOps**: Docker + Docker Compose for local development

**Architecture Principles:**
1. **Modular Design**: Each activity module is independently implementable
2. **Progressive Enhancement**: Start with core features, expand capabilities
3. **Accessibility First**: WCAG 2.1 AA compliance minimum
4. **Mobile Responsive**: Scale down from 1920x1000 baseline
5. **Offline-First Capability**: PWA with service workers (future phase)

### Phase 2: Infrastructure Design

**Project Structure:**
```
stem-lab-assistant/
├── apps/
│   ├── web/                 # React frontend
│   ├── api/                 # Express backend
│   └── docs/                # Documentation site
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── database/            # Database schemas & migrations
│   ├── shared-types/        # TypeScript types
│   └── utils/               # Shared utilities
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   └── Dockerfile.api
└── docs/
    ├── architecture/
    ├── api-specs/
    └── user-guides/
```

**Database Schema (Initial):**

```sql
-- Users & Authentication
users (id, email, name, role, created_at)
auth_tokens (id, user_id, token, expires_at)

-- Teams & Members
teams (id, team_number, season_year, created_at)
team_members (id, team_id, user_id, role, joined_at)

-- Sessions & Activities
practice_sessions (id, team_id, date, duration, notes)
session_rotations (id, session_id, student_id, station, start_time)

-- Progress Tracking
engineering_notebook_entries (id, team_id, author_id, content, date)
skill_assessments (id, student_id, skill_type, level, assessed_at)
competition_results (id, team_id, event_name, date, score, ranking)

-- Modules & Activities
activity_modules (id, name, description, grade_level, duration)
student_activities (id, student_id, module_id, status, started_at)
```

**API Design:**
- RESTful API for CRUD operations
- GraphQL for complex queries (optional future enhancement)
- WebSocket endpoints for real-time features
- API versioning (/api/v1/)
- OpenAPI/Swagger documentation

## Implementation Strategy

### Test-Driven Development (TDD) Approach

**Testing Hierarchy:**
1. **Unit Tests**: Individual functions and components (>80% coverage)
2. **Integration Tests**: API endpoints and database operations
3. **Component Tests**: React components with user interactions
4. **E2E Tests**: Critical user journeys with Playwright
5. **Visual Regression Tests**: UI consistency (Chromatic or Percy)

**TDD Workflow for Each Feature:**
```
1. Write failing test describing expected behavior
2. Implement minimum code to pass test
3. Refactor while keeping tests green
4. Add edge case tests
5. Document behavior in JSDoc/TSDoc
```

### Orchestration & Sub-Agent Strategy

**Agent Roles:**

1. **Orchestrator Agent** (You)
   - Coordinates all sub-agents
   - Manages git branches
   - Reviews and merges code
   - Ensures architectural consistency

2. **Frontend Architecture Agent**
   - Design component library
   - Implement routing structure
   - Set up state management
   - Create layout templates per style guide

3. **Backend Architecture Agent**
   - Design database schema
   - Implement API structure
   - Set up authentication
   - Create middleware and error handling

4. **VEX IQ Module Agent**
   - Implement team management
   - Build practice session tracker
   - Create engineering notebook interface
   - Develop competition tracking

5. **UI/UX Implementation Agent**
   - Build shared component library
   - Implement style guide
   - Create responsive layouts
   - Ensure accessibility compliance

6. **Testing Agent**
   - Write test suites for all code
   - Implement E2E test scenarios
   - Set up CI/CD testing pipeline
   - Monitor coverage metrics

7. **DevOps Agent**
   - Configure Docker environment
   - Set up development workflows
   - Create deployment scripts
   - Implement monitoring and logging

### Parallel Task Execution

**Phase 1: Foundation (Parallel)**
- Frontend Agent: Set up React + Vite + Tailwind
- Backend Agent: Set up Express + PostgreSQL + TypeScript
- DevOps Agent: Create Docker Compose environment
- Testing Agent: Configure test frameworks

**Phase 2: Core Infrastructure (Parallel)**
- Frontend Agent: Component library + routing
- Backend Agent: Auth system + base API
- UI/UX Agent: Style guide implementation
- Testing Agent: Write base test suites

**Phase 3: VEX IQ Module (Sequential with parallel sub-tasks)**
- Backend Agent: Database schema → API endpoints
- Frontend Agent: UI components → Views (parallel after schema complete)
- VEX IQ Agent: Business logic → Integrations (parallel with frontend)
- Testing Agent: Test all components (parallel throughout)

### Branch Management Strategy

**Critical: Merge Early, Merge Often**

**Branch Naming Convention:**
```
feature/<agent-name>/<feature-description>
bugfix/<issue-number>-<description>
hotfix/<critical-issue>
refactor/<component-name>
test/<test-suite-name>
```

**Merge Strategy:**
1. **Feature Branches**: Merge to `develop` when tests pass
2. **Develop Branch**: Integration branch for all features
3. **Main Branch**: Production-ready code only
4. **Daily Integration**: Each agent merges at least once per day
5. **Conflict Resolution**: Orchestrator resolves conflicts immediately

**Merge Checklist:**
- [ ] All tests passing
- [ ] Code reviewed by orchestrator
- [ ] No conflicts with develop
- [ ] Documentation updated
- [ ] TypeScript compilation successful
- [ ] Linting passed

**Avoid Stepping on Each Other:**
- Agents work in different directories when possible
- Shared code (types, utils) coordinated by orchestrator
- Lock files committed immediately after dependency changes
- Database migrations numbered and sequenced
- API changes communicated to all agents before implementation

## Development Phases

### Phase 1: Foundation Setup (Week 1)
**Goal**: Working development environment with basic infrastructure

**Deliverables:**
- [ ] Monorepo structure created
- [ ] Docker Compose environment running
- [ ] Frontend: React app with routing
- [ ] Backend: Express API with health check endpoint
- [ ] Database: PostgreSQL with initial migrations
- [ ] Testing: Frameworks configured, sample tests passing
- [ ] CI/CD: GitHub Actions for testing on push
- [ ] Documentation: Architecture Decision Records (ADRs) started

**Agents**: All agents working in parallel

**Branch Strategy**:
```
feature/frontend-arch/initial-setup → develop
feature/backend-arch/initial-setup → develop
feature/devops/docker-environment → develop
feature/testing/framework-setup → develop
```

### Phase 2: Authentication & User Management (Week 2)
**Goal**: Users can sign up, log in, and have role-based access

**Deliverables:**
- [ ] Database: User tables and auth schema
- [ ] Backend: JWT-based auth endpoints
- [ ] Frontend: Login/signup forms
- [ ] Frontend: Protected routes
- [ ] Testing: Auth flow E2E tests
- [ ] UI: Following style guide for all forms

**Agents**: Backend, Frontend, Testing, UI/UX

**TDD Example:**
```typescript
// Test first
describe('POST /api/v1/auth/login', () => {
  it('returns JWT token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });
});

// Then implement
```

### Phase 3: VEX IQ Teams Module - MVP (Weeks 3-4)
**Goal**: Coaches can create teams, add students, and track basic info

**Deliverables:**
- [ ] Database: Team and member tables
- [ ] Backend: Team CRUD API
- [ ] Frontend: Team management dashboard
- [ ] Frontend: Team roster view
- [ ] Frontend: Student profile cards
- [ ] Testing: Team management E2E flows
- [ ] UI: Console-style dashboard (no scrolling for main views)

**User Stories:**
1. As a coach, I can create a new VEX IQ team with a team number
2. As a coach, I can add students to a team with their roles
3. As a coach, I can view all my teams in a dashboard
4. As a student, I can see my team information and teammates

**Agents**: VEX IQ Module, Backend, Frontend, Testing, UI/UX

### Phase 4: Practice Session Tracker (Weeks 5-6)
**Goal**: Track practice sessions with station rotations

**Deliverables:**
- [ ] Database: Session and rotation tables
- [ ] Backend: Session tracking API
- [ ] Frontend: Session planning interface
- [ ] Frontend: Live session timer with rotations
- [ ] Frontend: Session history view
- [ ] Testing: Session flow tests
- [ ] UI: Timer visual following style guide

**Key Features:**
- Pre-plan 90-minute sessions with 4 stations
- 20-minute rotation timer with alerts
- Assign students to starting stations
- Track which students visited which stations
- Notes and observations per session

**Agents**: VEX IQ Module, Backend, Frontend, Testing

### Phase 5: Engineering Notebook (Weeks 7-8)
**Goal**: Digital engineering notebook with entries and media

**Deliverables:**
- [ ] Database: Notebook entry schema
- [ ] Backend: File upload handling (images, videos)
- [ ] Backend: Entry CRUD API
- [ ] Frontend: Rich text editor for entries
- [ ] Frontend: Media upload interface
- [ ] Frontend: Notebook timeline view
- [ ] Testing: Entry creation and editing tests
- [ ] Storage: NAS integration for media files

**Features:**
- Create dated entries with text, images, videos
- Tag entries by category (build, program, test, compete)
- Search and filter entries
- Export notebook to PDF (future enhancement)

**Agents**: VEX IQ Module, Backend, Frontend, DevOps (file storage), Testing

### Phase 6: Competition Tracking (Weeks 9-10)
**Goal**: Track competitions, scores, and judging preparation

**Deliverables:**
- [ ] Database: Competition and results schema
- [ ] Backend: Competition API
- [ ] Frontend: Competition list and details
- [ ] Frontend: Score entry and tracking
- [ ] Frontend: Judge interview prep checklist
- [ ] Frontend: Team awards display
- [ ] Testing: Competition tracking tests

**Agents**: VEX IQ Module, Backend, Frontend, Testing

### Phase 7: Student Dashboard & Gamification (Weeks 11-12)
**Goal**: Student-facing views with progress tracking

**Deliverables:**
- [ ] Frontend: Student dashboard
- [ ] Frontend: Skill progress badges
- [ ] Frontend: Personal achievement timeline
- [ ] Backend: Skill assessment API
- [ ] Database: Skills and achievements schema
- [ ] Testing: Student view tests
- [ ] UI: Engaging, age-appropriate visualizations

**Gamification Elements:**
- Skill badges (building, programming, driving, teamwork)
- Progress bars for different competencies
- Achievement milestones
- Team vs individual progress

**Agents**: Frontend, Backend, UI/UX, Testing

### Phase 8: Refinement & Expansion (Weeks 13+)
**Goal**: Polish, optimize, and prepare for additional modules

**Deliverables:**
- [ ] Performance optimization
- [ ] Accessibility audit and fixes
- [ ] User testing with students
- [ ] Deployment to production environment
- [ ] User documentation and guides
- [ ] Coach training materials

**Future Modules (Architectural prep):**
- 3D Printing queue and project tracking
- Scratch/Python coding lesson tracker
- Equipment checkout system
- Maker Cart inventory management
- General activity/project library for K-5

## Orchestration Instructions

### For the Orchestrator Agent

**Your Responsibilities:**
1. Create and assign tasks to sub-agents
2. Review all code before merging
3. Resolve merge conflicts
4. Ensure architectural consistency
5. Maintain this prompt document with updates
6. Track progress against timeline
7. Make decisions on technical tradeoffs

**Daily Workflow:**
```
Morning:
1. Review overnight progress from all agents
2. Merge completed features to develop
3. Assign new tasks based on priority
4. Check CI/CD status

Afternoon:
5. Review pull requests
6. Answer sub-agent questions
7. Integration testing
8. Update project documentation

Evening:
9. Sync develop to main if stable
10. Plan next day's tasks
11. Update stakeholders on progress
```

**Decision-Making Framework:**
- **Architecture**: Make centralized decisions, document in ADRs
- **Implementation**: Trust sub-agents, review for consistency
- **Conflicts**: Merge immediately, don't let branches diverge
- **Blockers**: Escalate and resolve within 4 hours
- **Technical Debt**: Track in issues, schedule refactoring sprints

### For Sub-Agents

**Your Responsibilities:**
1. Work in your assigned feature branch
2. Write tests before implementation (TDD)
3. Follow style guide and coding standards
4. Commit frequently with clear messages
5. Request review when feature is complete
6. Merge develop into your branch daily
7. Document your code and APIs

**Communication Protocol:**
- Prefix commits with agent name: `[Frontend] Add team dashboard component`
- Tag orchestrator in PR descriptions
- Report blockers immediately
- Share learnings in daily summary
- Ask questions before making architectural changes

**Code Standards:**
```typescript
// TypeScript strict mode enabled
// ESLint + Prettier configured
// All functions documented with JSDoc
// All components tested
// All APIs have OpenAPI specs
```

## Success Criteria

### Technical Metrics
- [ ] Test coverage >80%
- [ ] TypeScript strict mode, zero `any` types
- [ ] Lighthouse score >90 for performance
- [ ] WCAG 2.1 AA compliance
- [ ] All API endpoints documented
- [ ] Zero console errors in production

### User Experience Metrics
- [ ] 9-11 year olds can navigate without help
- [ ] Coaches can create team in <2 minutes
- [ ] Session planning takes <5 minutes
- [ ] All features work on Chromebooks
- [ ] Touch and mouse input supported
- [ ] Load time <2 seconds on school network

### Educational Alignment
- [ ] Supports student-centered learning
- [ ] Enables engineering design process
- [ ] Facilitates station rotation model
- [ ] Tracks individual and team progress
- [ ] Meets REC Foundation guidelines
- [ ] Allows for minimal adult direction

## Final Notes

**Remember:**
- Start simple, iterate quickly
- Test with real users early
- Merge branches frequently
- Document decisions
- Prioritize student learning over features
- Have fun building educational technology!

**Questions to Answer Before Starting:**
1. What is the deployment environment? (Cloud, on-premise, NAS-hosted?)
2. Do we need offline capabilities immediately or future phase?
3. What authentication provider? (Local, Google, Microsoft for schools?)
4. Budget for third-party services? (Hosting, monitoring, etc.)
5. Timeline flexibility if we discover complexities?

**Resources:**
- VEX Robotics API (if available) for competition data
- REC Foundation Student-Centered Policy documentation
- School's existing authentication system (SSO?)
- Synology NAS API documentation for file storage

---

**Begin with Phase 1: Foundation Setup**

Create the initial repository structure, set up the development environment, and ensure all agents can work in parallel without conflicts. Use TDD from the very first function. Follow the style guide meticulously. Make this app amazing for the kids! 🚀

(Note: Emoji added only in this final motivational line, not in the UI per style guide requirements)
