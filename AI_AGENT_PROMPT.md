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

### Current Users
- **VEX IQ Program**: 12 students, 2 coaches
- **Expected Growth**: Additional programs (coding, 3D printing) in coming months
- **Access Pattern**: Students access only within lab, admin has remote access

## DEPLOYMENT SPECIFICATIONS

### Infrastructure (Confirmed)

**Hosting Environment:**
- **Primary**: Synology DS923+ 4-Bay NAS (local hosting)
- **Backup**: Cloud backup for disaster recovery
- **Network**: Independent internet access in STEM lab
- **Access**:
  - Students: Local network only (within lab)
  - Admin: Remote access configured for IT support
- **Domain**: Subdomain of anspar.org (e.g., `stemlab.anspar.org`)
  - Future consideration: Platform/distributable system for other schools

**Technical Capabilities:**
- Admin technical comfort: 10/10 on all aspects
- Docker Container Manager available on NAS
- Full admin access to network and NAS
- Preference for offline-first features where applicable

**Budget:**
- Maximum: $500/year (including any cloud backup, domain, SSL certificates)
- Emphasis on self-hosted, open-source solutions

### Authentication System (Confirmed)

**Student Authentication - Age-Appropriate:**
- **Self-Registration Process**:
  1. Enter name and grade (K-5)
  2. Choose avatar from large library with customization options
  3. Authentication method by age:
     - **Grades 3-5**: Icon + Name + 4-digit PIN
     - **Grades K-2**: Order-independent animal grid (4 animals from 5×5 grid)
- **Avatar System**: Leverage existing open-source avatar generation library
- **Priority**: Ease of use over security (supervised lab environment)

**Staff/Coach Authentication:**
- Email + Password
- Standard secure authentication
- Admin role with elevated privileges

**Implementation Notes:**
- No external authentication provider (Google/Microsoft)
- All authentication data stored locally
- Simple, fast login process suitable for 30-minute sessions

### Data Privacy & Compliance (Confirmed)

**Legal Requirements:**
- **Jurisdiction**: USA, State of California, City of Los Angeles
- **Compliance**: FERPA, COPPA, CA student privacy laws
- **Onboarding**: Provide legal compliance training for lab staff during setup

**Data Handling:**
- All child data remains on local NAS (never transmitted externally)
- Internet access is supervised by lab staff
- No third-party analytics or tracking

**Data Retention:**
- **Duration**: Until student matriculates (end of Grade 5) + 4 years
- **Backup**: Admin responsible for NAS backups
- **Deletion**: Automated data purging after retention period

### Timeline & Flexibility (Confirmed)

**Urgency**: ASAP (VEX IQ competition season underway)

**Complexity Management:**
- **Preference**: Reduce complexity while preserving future maintainability
- **Approach**: Discuss issues as they arise
- **Future Goal**: Self-repair using AI assistants (future enhancement)

### Branding (Confirmed)

**Visual Identity:**
- **Color Palette**: Palette C (Discovery Lab) from style guide as default
- **Student Choice**: Allow students to select alternative palettes
- **Logo**: `robotics-logo.png` from main branch (use for general STEM lab branding)
- **School Integration**: Support for school-specific branding

### External Integrations (Confirmed)

**Tinkercad:**
- Link to Tinkercad classroom (external links, not embedded)
- No API integration required
- Optional: Track which students accessed which Tinkercad lessons (via manual entry or links)

**No Other Integrations:**
- Standalone system (no SIS, LMS, Google Classroom integration)
- May add integrations in future phases if needed

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

**Color Palette (Use Palette C: Discovery Lab as default):**
```css
/* Primary Colors */
--primary-indigo: #5C6BC0;
--primary-green: #66BB6A;
--primary-amber: #FFA726;

/* Secondary Colors */
--secondary-cyan: #26C6DA;
--secondary-pink: #EC407A;
--secondary-lime: #9CCC65;

/* Background & Text */
--background: #FAFAFA;
--surface: #FFFFFF;
--text-primary: #424242;
--text-secondary: #757575;
```

**Allow users to select from all three palettes** (Discovery Lab, Modern Scientific, STEM Explorer) in user preferences.

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

**Recommended Stack (NAS-Optimized):**
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS (configured per style guide)
- **State Management**: Zustand (lighter than Redux, better for offline-first)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (runs in Docker on NAS) OR SQLite (simpler, file-based)
- **Authentication**: JWT-based auth with role support (student/coach/admin)
- **Avatar System**: DiceBear API or similar open-source avatar library
- **Offline Support**: Service Workers + IndexedDB for offline-first PWA
- **Real-time**: Socket.io (for collaborative features, optional Phase 2)
- **Testing**: Vitest + React Testing Library + Playwright
- **DevOps**: Docker + Docker Compose (deployed to Synology Container Manager)
- **Backup**: Automated backup scripts for database dumps to cloud storage

**NAS Deployment Considerations:**
- Docker images optimized for ARM64 (if DS923+ uses AMD, use AMD64)
- Reverse proxy via Synology (nginx) for HTTPS
- Use Synology's built-in backup solutions (Hyper Backup to cloud)
- Resource limits: DS923+ has good specs, but consider container resource allocation

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
users (
  id, username, display_name, email, role, grade_level,
  avatar_config, auth_type, password_hash, pin_hash, animal_pattern_hash,
  created_at, last_login, data_retention_date
)
auth_tokens (id, user_id, token, expires_at)

-- Learning Content - Core Priority
lessons (
  id, title, category, grade_level, duration_minutes,
  content, media_urls, learning_objectives, created_at
)
-- Categories: 'methodology', 'teamwork', 'research_skills', 'technical'

lesson_steps (
  id, lesson_id, step_number, title, content,
  interactive_elements, assessment_questions
)

student_lesson_progress (
  id, student_id, lesson_id, status, progress_percent,
  started_at, completed_at, time_spent_minutes, notes
)
-- Status: 'not_started', 'in_progress', 'completed', 'reviewed'

-- Skills & Competencies
skills (
  id, name, category, description, grade_level
)
-- Categories: 'engineering_process', 'teamwork', 'research', 'technical', 'presentation'

student_skills (
  id, student_id, skill_id, level, evidence_notes,
  assessed_by, assessed_at
)
-- Level: 1-5 or 'novice', 'developing', 'proficient', 'advanced'

badges (
  id, name, description, icon, criteria, category
)

student_badges (
  id, student_id, badge_id, earned_at, evidence_id
)

-- Engineering Notebook
notebook_entries (
  id, author_id, team_id, entry_date, title, content,
  media_urls, tags, entry_type, created_at
)
-- Entry types: 'brainstorm', 'research', 'design', 'build', 'test', 'reflection'

-- Teams & Members (Lower Priority)
teams (id, team_number, season_year, created_at)
team_members (id, team_id, user_id, role, joined_at)

-- Practice Sessions (Lower Priority)
practice_sessions (id, team_id, date, duration, notes)
session_rotations (id, session_id, student_id, station, start_time)

-- Competition Tracking (Lowest Priority)
competition_results (id, team_id, event_name, date, score, ranking)

-- System
data_retention_log (id, user_id, action, retention_date, executed_at)
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

### Phase 2: Authentication & User Management (Weeks 2-3)
**Goal**: Age-appropriate authentication with avatar system

**Priority**: **CRITICAL** - Students need to login to access lessons

**Deliverables:**
- [ ] Database: User tables with avatar config and multi-auth support
- [ ] Backend: JWT-based auth endpoints
- [ ] Backend: Avatar generation integration (DiceBear or similar)
- [ ] Backend: Multi-auth support (email/password, PIN, animal grid)
- [ ] Frontend: Student self-registration flow
  - [ ] Name and grade entry
  - [ ] Avatar customization interface
  - [ ] PIN setup (Grades 3-5)
  - [ ] Animal grid setup (Grades K-2)
- [ ] Frontend: Coach/staff email/password login
- [ ] Frontend: Protected routes with role-based access
- [ ] Backend: Data retention date calculation and storage
- [ ] Testing: All auth flows E2E tests
- [ ] UI: Following style guide, age-appropriate and engaging

**User Stories:**
1. As a student (Grade 3-5), I can register by choosing an avatar and creating a 4-digit PIN
2. As a student (Grade K-2), I can register by choosing an avatar and selecting 4 animals from a grid
3. As a student, I can log in quickly (< 30 seconds) to access the lab assistant
4. As a coach, I can log in with email/password to access admin features
5. As an admin, I can see data retention dates for each student

**Agents**: Backend, Frontend, Testing, UI/UX

**TDD Example:**
```typescript
// Test: Student PIN authentication
describe('POST /api/v1/auth/student/login', () => {
  it('returns JWT token for valid student PIN', async () => {
    const response = await request(app)
      .post('/api/v1/auth/student/login')
      .send({
        username: 'alice_grade4',
        pin: '1234',
        auth_type: 'pin'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.role).toBe('student');
  });
});

// Test: Animal grid authentication (order-independent)
describe('POST /api/v1/auth/student/login', () => {
  it('accepts animals in any order for K-2 students', async () => {
    const pattern1 = ['cat', 'dog', 'bird', 'fish'];
    const pattern2 = ['fish', 'cat', 'bird', 'dog']; // Same animals, different order

    // Both should work
    const response1 = await loginWithAnimalPattern('bobby_grade1', pattern1);
    const response2 = await loginWithAnimalPattern('bobby_grade1', pattern2);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });
});
```

**Legal Compliance Deliverable:**
- [ ] Create staff onboarding document covering:
  - FERPA requirements
  - COPPA compliance
  - California student data privacy laws
  - Los Angeles specific requirements
  - Data handling best practices
  - What data can/cannot be collected
  - Incident response procedures

### Phase 3: Learning Platform Core - Methodology Lessons (Weeks 4-6)
**Goal**: Students can access and complete lessons on engineering methodology

**Priority**: **HIGHEST** - This is the primary value of the application

**Deliverables:**
- [ ] Database: Lessons, lesson_steps, student_lesson_progress tables
- [ ] Backend: Lesson content management API
- [ ] Backend: Student progress tracking API
- [ ] Frontend: Lesson library browser (console-style, filterable by grade/category)
- [ ] Frontend: Lesson viewer with step-by-step navigation
- [ ] Frontend: Interactive lesson elements (quizzes, activities, videos)
- [ ] Frontend: Progress tracking within lessons
- [ ] Content: Initial lesson library (created by coaches or seeded with templates)
  - [ ] Engineering Design Process overview
  - [ ] Brainstorming techniques
  - [ ] Problem vs Solution identification
  - [ ] Iteration and improvement
  - [ ] Testing and evaluation
  - [ ] Documentation best practices
- [ ] Testing: Lesson browsing and completion E2E tests
- [ ] UI: Engaging, age-appropriate lesson interface

**Lesson Categories:**
1. **Engineering Methodology** (highest priority)
   - What is the engineering design process?
   - Ask: Identifying problems and constraints
   - Research/Imagine: Brainstorming and idea generation
   - Plan: Creating designs and selecting solutions
   - Create: Building prototypes
   - Test: Evaluation and data collection
   - Improve: Iteration based on results

2. **Teamwork Skills**
   - Effective communication
   - Active listening
   - Resolving conflicts
   - Sharing responsibilities
   - Giving and receiving feedback

3. **Research & Learning Skills**
   - How to ask good questions
   - Finding reliable sources
   - Taking effective notes
   - Learning from failures
   - Asking for help

**User Stories:**
1. As a student, I can browse lessons appropriate for my grade level
2. As a student, I can start a lesson and progress through steps
3. As a student, I can see which lessons I've completed
4. As a coach, I can create/edit lesson content
5. As a coach, I can see which students completed which lessons
6. As a coach, I can assign specific lessons to students or teams

**Agents**: Learning Platform Module (new), Backend, Frontend, Content, Testing, UI/UX

**TDD Example:**
```typescript
// Test: Student can complete a lesson
describe('Student Lesson Progress', () => {
  it('tracks student progress through lesson steps', async () => {
    const student = await createTestStudent();
    const lesson = await createTestLesson('Engineering Design Process', 5);

    // Start lesson
    const progress = await startLesson(student.id, lesson.id);
    expect(progress.status).toBe('in_progress');
    expect(progress.progress_percent).toBe(0);

    // Complete first step
    await completeStep(progress.id, 1);
    const updated = await getProgress(progress.id);
    expect(updated.progress_percent).toBe(20); // 1/5 steps

    // Complete all steps
    for (let i = 2; i <= 5; i++) {
      await completeStep(progress.id, i);
    }

    const final = await getProgress(progress.id);
    expect(final.status).toBe('completed');
    expect(final.progress_percent).toBe(100);
    expect(final.completed_at).toBeTruthy();
  });
});
```

**Content Management:**
- Coaches can create lessons using a rich text editor
- Lessons support: text, images, videos, embedded content
- Interactive elements: multiple choice questions, sorting activities, fill-in-the-blank
- Assessment questions to check understanding
- Ability to clone/modify existing lessons

### Phase 4: Skills & Competency Tracking (Weeks 7-8)
**Goal**: Track student skills development and assessment

**Priority**: **HIGH** - Directly supports learning objectives

**Deliverables:**
- [ ] Database: Skills, student_skills tables
- [ ] Backend: Skills assessment API
- [ ] Frontend: Skills library management (coach view)
- [ ] Frontend: Student skills profile view
- [ ] Frontend: Skill assessment interface (coach assesses student)
- [ ] Frontend: Evidence linking (link skills to notebook entries, lesson completions)
- [ ] Testing: Skills tracking E2E tests
- [ ] Seed data: Initial skills taxonomy

**Skill Categories:**
1. **Engineering Process Skills**
   - Problem identification
   - Brainstorming
   - Design planning
   - Prototyping
   - Testing methodology
   - Iterative improvement

2. **Teamwork Skills**
   - Communication
   - Collaboration
   - Conflict resolution
   - Leadership
   - Active listening

3. **Research Skills**
   - Question formulation
   - Source evaluation
   - Note-taking
   - Information synthesis

4. **Technical Skills**
   - Building/assembly
   - Programming
   - Tool usage
   - Measurement

5. **Presentation Skills**
   - Public speaking
   - Visual communication
   - Explaining technical concepts
   - Interview skills

**Skill Levels:**
- 1: Novice (with significant support)
- 2: Developing (with some support)
- 3: Proficient (independently)
- 4: Advanced (can teach others)

**User Stories:**
1. As a coach, I can assess a student's skill level with evidence notes
2. As a coach, I can see all students' skill profiles at a glance
3. As a student, I can see which skills I'm developing and my progress
4. As a student, I can see evidence of my skill development (linked entries)
5. As a coach, I can identify which skills need more focus for each student

**Agents**: Learning Platform Module, Backend, Frontend, Testing

**TDD Example:**
```typescript
describe('Skills Assessment', () => {
  it('allows coach to assess student skill with evidence', async () => {
    const coach = await createCoach();
    const student = await createStudent('Alice', 4);
    const skill = await getSkill('brainstorming');

    const assessment = await assessSkill({
      student_id: student.id,
      skill_id: skill.id,
      level: 3, // Proficient
      evidence_notes: 'Generated 5+ ideas during robot design session',
      assessed_by: coach.id
    });

    expect(assessment.level).toBe(3);
    expect(assessment.student_id).toBe(student.id);

    // Student can view their assessment
    const studentSkills = await getStudentSkills(student.id);
    expect(studentSkills).toContainEqual(
      expect.objectContaining({
        skill_name: 'Brainstorming',
        level: 3,
        category: 'engineering_process'
      })
    );
  });
});
```

### Phase 5: Engineering Notebook (Weeks 9-10)
**Goal**: Digital engineering notebook with entries and media

**Priority**: **HIGH** - Core documentation tool for engineering process

**Deliverables:**
- [ ] Database: Notebook entry schema with entry types
- [ ] Backend: File upload handling (images, videos to NAS)
- [ ] Backend: Entry CRUD API with tagging
- [ ] Frontend: Rich text editor for entries
- [ ] Frontend: Media upload interface (drag-and-drop)
- [ ] Frontend: Notebook timeline/gallery view
- [ ] Frontend: Entry templates for different types
- [ ] Frontend: Search and filter by tags, dates, entry type
- [ ] Testing: Entry creation and editing E2E tests
- [ ] Storage: NAS file storage integration
- [ ] UI: Age-appropriate editor, easy media insertion

**Entry Types (aligned with engineering process):**
- **Brainstorm**: Ideas and initial thoughts
- **Research**: Information gathered, sources
- **Design**: Sketches, CAD models, plans
- **Build**: Construction photos, assembly notes
- **Test**: Test results, data, observations
- **Reflection**: What worked, what didn't, next steps
- **Competition**: Match results, alliance notes (VEX specific)

**Features:**
- Create dated entries with text, images, videos
- Tag entries by category and engineering process phase
- Link entries to lessons and skills (evidence for skill assessment)
- Team vs individual entries
- Search and filter entries
- Export notebook to PDF (future enhancement)

**User Stories:**
1. As a student, I can create a notebook entry documenting my work
2. As a student, I can upload photos/videos from lab activities
3. As a student, I can view my notebook in timeline order
4. As a coach, I can see all team members' notebook entries
5. As a coach, I can link notebook entries as evidence for skill assessments
6. As a student, I can choose entry templates (brainstorm, test, reflection, etc.)

**Agents**: Backend, Frontend, DevOps (NAS file storage), Testing

**TDD Example:**
```typescript
describe('Engineering Notebook Entry', () => {
  it('creates entry with media upload to NAS', async () => {
    const student = await createStudent();
    const team = await createTeam();

    const entry = await createNotebookEntry({
      author_id: student.id,
      team_id: team.id,
      entry_type: 'test',
      title: 'Robot Speed Test Results',
      content: 'Tested robot speed on 10ft course...',
      tags: ['autonomous', 'speed', 'iteration-2']
    });

    // Upload media
    const file = await uploadFile('test-run-video.mp4');
    await attachMediaToEntry(entry.id, file.url);

    const retrieved = await getNotebookEntry(entry.id);
    expect(retrieved.media_urls).toContain(file.url);
    expect(retrieved.entry_type).toBe('test');
  });
});
```

### Phase 6: Student Dashboard & Gamification (Weeks 11-12)
**Goal**: Engaging student-facing dashboard with progress visualization and badges

**Priority**: **MEDIUM-HIGH** - Motivates students and visualizes learning

**Deliverables:**
- [ ] Database: Badges and student_badges tables
- [ ] Backend: Badge system API
- [ ] Frontend: Student dashboard (console-style, single-screen)
  - [ ] Lesson progress overview
  - [ ] Skills radar chart or progress bars
  - [ ] Badge collection display
  - [ ] Recent notebook entries
  - [ ] Suggested next lessons
- [ ] Frontend: Badge gallery and details
- [ ] Frontend: Progress visualization (charts, graphs)
- [ ] Backend: Badge criteria engine (auto-award based on achievements)
- [ ] Testing: Dashboard and gamification E2E tests
- [ ] UI: Highly engaging, age-appropriate, colorful

**Badge Categories:**
1. **Methodology Badges**
   - "Problem Solver" - Identified 5 problems
   - "Idea Generator" - Completed brainstorming lessons
   - "Design Thinker" - Created 3 design plans
   - "Test Master" - Documented 10 tests
   - "Iteration Champion" - Improved design 5+ times

2. **Skill Badges**
   - "Team Player" - Proficient in collaboration
   - "Researcher" - Proficient in research skills
   - "Builder" - Proficient in assembly
   - "Coder" - Proficient in programming
   - "Presenter" - Proficient in communication

3. **Engagement Badges**
   - "First Day" - Completed first lesson
   - "Notebook Keeper" - 10 notebook entries
   - "Dedicated Learner" - Completed 10 lessons
   - "Expert" - Reached advanced level in any skill

4. **Team Badges** (unlocked later with team features)
   - "Team Captain" - Led team meetings
   - "Helper" - Helped teammate learn skill

**Badge Design:**
- Use icon library (Lucide, Phosphor) or custom SVG badges
- Color-coded by category
- Show locked vs unlocked states
- Display criteria for locked badges
- Celebratory animation when earned

**Dashboard Features:**
- Personalized greeting with avatar
- Progress bars for lessons in-progress
- Skills "radar chart" showing competencies
- Recent achievements feed
- Recommendations: "Try this lesson next!"
- Time in lab / sessions attended (simple stats)

**User Stories:**
1. As a student, I see my personalized dashboard when I log in
2. As a student, I can see which badges I've earned and which I can earn next
3. As a student, I can see my progress on lessons and skills visually
4. As a student, I receive congratulations when I earn a badge
5. As a coach, I can see which badges students are working toward
6. As a coach, I can manually award special recognition badges

**Agents**: Frontend, Backend, UI/UX, Testing

**TDD Example:**
```typescript
describe('Badge System', () => {
  it('auto-awards badge when criteria met', async () => {
    const student = await createStudent();

    // Complete first lesson
    await completeLesson(student.id, 'engineering-design-process');

    // Check if badge awarded
    const badges = await getStudentBadges(student.id);
    expect(badges).toContainEqual(
      expect.objectContaining({
        name: 'First Day',
        category: 'engagement'
      })
    );

    // Verify badge appears on dashboard
    const dashboard = await getStudentDashboard(student.id);
    expect(dashboard.recent_badges[0].name).toBe('First Day');
  });

  it('shows progress toward locked badges', async () => {
    const student = await createStudent();

    // Complete 5 out of 10 required lessons
    for (let i = 0; i < 5; i++) {
      await completeLesson(student.id, `lesson-${i}`);
    }

    const badgeProgress = await getBadgeProgress(student.id, 'dedicated-learner');
    expect(badgeProgress.current).toBe(5);
    expect(badgeProgress.required).toBe(10);
    expect(badgeProgress.progress_percent).toBe(50);
  });
});
```

### Phase 7: Team Management & Practice Sessions (Weeks 13-14)
**Goal**: Team roster management and practice session tracking

**Priority**: **MEDIUM** - Important for VEX IQ but lower than learning features

**Deliverables:**
- [ ] Database: Teams, team_members, practice_sessions tables
- [ ] Backend: Team CRUD API
- [ ] Backend: Session tracking API
- [ ] Frontend: Team creation and roster management
- [ ] Frontend: Session planning interface
- [ ] Frontend: Live session timer with rotation alerts (optional)
- [ ] Frontend: Session history view
- [ ] Testing: Team and session management E2E tests

**Key Features:**
- Create teams with team numbers (e.g., 6502A, 6502B)
- Assign students to teams with roles (Driver, Builder, Programmer, etc.)
- Plan practice sessions with stations
- Track which students attended sessions
- Notes and observations per session
- Optional: 90-minute timer with 20-minute rotation alerts

**User Stories:**
1. As a coach, I can create a new team with a team number
2. As a coach, I can add students to a team
3. As a coach, I can create a practice session plan
4. As a coach, I can track attendance for sessions
5. As a student, I can see my team and teammates
6. As a student, I can see upcoming practice sessions

**Agents**: Backend, Frontend, Testing

### Phase 8: Competition Tracking & Interview Prep (Weeks 15-16)
**Goal**: Track competitions and prepare for judge interviews

**Priority**: **LOWER** - Useful but not core to learning objectives

**Deliverables:**
- [ ] Database: Competition results schema
- [ ] Backend: Competition API
- [ ] Frontend: Competition list and results entry
- [ ] Frontend: Judge interview prep checklist and practice
- [ ] Frontend: Team awards/recognition display
- [ ] Testing: Competition tracking tests

**Features:**
- Record competition events and dates
- Enter match scores and rankings
- Track awards won
- Judge interview preparation checklist
- Practice questions and answer prompts
- Skills Challenge scores (Driver Skills, Autonomous Skills)

**User Stories:**
1. As a coach, I can enter competition results for a team
2. As a coach, I can prepare students for judge interviews with checklists
3. As a student, I can see my team's competition history
4. As a student, I can practice answering judge interview questions
5. As a coach, I can display team awards and achievements

**Agents**: Backend, Frontend, Testing

### Phase 9: Refinement & Production Deployment (Weeks 17+)
**Goal**: Polish, optimize, deploy to NAS, and user testing

**Priority**: **CRITICAL** - Get it into students' hands ASAP

**Deliverables:**
- [ ] Performance optimization
  - [ ] Frontend bundle size optimization
  - [ ] Database query optimization
  - [ ] Image/video optimization for NAS storage
- [ ] Accessibility audit and fixes (WCAG 2.1 AA)
- [ ] User testing with actual students (12 students + 2 coaches)
- [ ] **NAS Production Deployment**
  - [ ] Docker Compose production configuration
  - [ ] Deploy to Synology Container Manager
  - [ ] Configure reverse proxy (nginx) for HTTPS
  - [ ] Set up SSL certificate (Let's Encrypt or self-signed)
  - [ ] Configure automatic database backups to cloud
  - [ ] Set up monitoring and logging
  - [ ] Resource limits for containers
  - [ ] Data retention automation (matriculation + 4 years)
- [ ] User documentation and guides
  - [ ] Student quick-start guide (with pictures)
  - [ ] Coach admin guide
  - [ ] Lesson creation tutorial
  - [ ] Troubleshooting guide
- [ ] Coach training session
  - [ ] Legal compliance training (FERPA, COPPA, CA laws)
  - [ ] Platform walkthrough
  - [ ] Lesson creation workshop
  - [ ] Skill assessment training

**NAS Deployment Checklist:**
- [ ] Docker images pushed to local registry or Docker Hub
- [ ] Environment variables configured securely
- [ ] Database migrations run successfully
- [ ] File storage permissions set correctly
- [ ] Backup script tested and scheduled
- [ ] Access from lab network verified
- [ ] Remote admin access configured
- [ ] Initial admin account created
- [ ] Seed data loaded (lessons, skills, badges)
- [ ] Performance tested with expected load (12-15 concurrent users)

**User Testing Protocol:**
- [ ] Test student registration and login (both PIN and animal grid)
- [ ] Test lesson browsing and completion
- [ ] Test notebook entry creation with media
- [ ] Test badge earning and dashboard
- [ ] Test coach admin functions
- [ ] Gather feedback on UI/UX
- [ ] Identify bugs and usability issues
- [ ] Iterate based on feedback

**Future Modules (Architectural prep):**
- 3D Printing queue and project tracking
- Scratch/Python coding lesson tracker
- Equipment checkout system
- Maker Cart inventory management
- General activity/project library for K-5
- Multi-school support (if expanding beyond local lab)

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

**Deployment Configuration (CONFIRMED):**

All critical questions have been answered. Here's the confirmed configuration:

1. ✅ **Deployment**: Synology DS923+ NAS with cloud backups
2. ✅ **Network Access**: Local lab network for students, remote access for admin
3. ✅ **Authentication**:
   - Students: Avatar + PIN (Grades 3-5) or Animal Grid (K-2)
   - Staff: Email + Password
4. ✅ **Budget**: $500/year maximum
5. ✅ **Domain**: Subdomain of anspar.org (e.g., stemlab.anspar.org)
6. ✅ **Offline**: Implement offline-first features where possible
7. ✅ **Timeline**: ASAP with complexity management via discussion
8. ✅ **Data Privacy**: Local-only, FERPA/COPPA/CA compliant
9. ✅ **Data Retention**: Matriculation (end Grade 5) + 4 years
10. ✅ **Branding**: Palette C (Discovery Lab), robotics-logo.png, student palette selection
11. ✅ **Feature Priorities**:
    - Methodology lessons (HIGHEST)
    - Teamwork & learning skills
    - Skills tracking
    - Engineering notebook
    - Progress/badges
    - Judge interview prep
    - Practice sessions
    - Team management
    - Competition tracking (LOWEST)

**Resources:**
- VEX Robotics API (if available) for competition data
- REC Foundation Student-Centered Policy documentation
- Synology Container Manager documentation
- DiceBear or similar avatar library
- FERPA, COPPA, and California student privacy law documentation

---

## Getting Started

**Begin with Phase 1: Foundation Setup**

Create the initial repository structure, set up the development environment (Docker on NAS), and ensure all agents can work in parallel without conflicts. Use TDD from the very first function. Follow the style guide meticulously.

**Important First Steps:**
1. Merge `robotics-logo.png` from main branch into your working branch
2. Set up Docker Compose for NAS deployment
3. Create database schema with priority on lessons and authentication tables
4. Implement student authentication FIRST (critical blocker for all other features)
5. Build learning platform core BEFORE team management features

**Remember the Priority Order:**
- Engineering methodology lessons are THE core feature
- Skills tracking and assessment support the learning objectives
- Engineering notebook documents the learning process
- Team management and competition tracking are lower priority

**Make this app amazing for the kids!** Focus on engagement, ease of use, and educational value. The goal is to teach them how to think like engineers, work as a team, and learn how to learn.

(Note: Emoji removed from this section per style guide - save celebration for the badges students earn!)
