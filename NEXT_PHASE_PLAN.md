# STEM Lab Assistant - Development Plan

**Date Created:** November 22, 2025
**Last Updated:** November 23, 2025
**Current Status:** Phase 1-3 Educational Content Complete - Backend API Development In Progress

> **Note:** For completed work history, see `COMPLETED_WORK.md`

---

## 🎯 Project Vision

Building a learning-first platform for elementary engineering education (K-5) with initial focus on VEX IQ robotics teams (6502A & 6502B). Following strict **API-first development** - complete backend before any UI work.

**Key Constraints:**
- Target: Elementary students (K-5) and coaches
- Deployment: Self-hosted Synology NAS (local network only)
- Privacy: FERPA/COPPA compliant - all data stays local
- Budget: $500/year maximum
- Authentication: Age-appropriate (PIN for 3-5, animal grid for K-2, password for staff)

---

## 📋 Current Work In Progress

No active work in progress. See completed work in `COMPLETED_WORK.md`.

---

## 📋 Immediate Next Steps (Priority 1)

### 1. Complete Backend API Development

**Missing Core Features:**

#### A. Practice Session Management API
**Database Tables:** `practice_sessions`, `session_rotations`

**Endpoints Needed:**
- `POST /api/v1/practice-sessions` - Create practice session
- `GET /api/v1/practice-sessions` - List sessions
- `GET /api/v1/practice-sessions/:id` - Get session details
- `PUT /api/v1/practice-sessions/:id` - Update session
- `DELETE /api/v1/practice-sessions/:id` - Cancel session
- `POST /api/v1/practice-sessions/:id/rotations` - Add rotation
- `GET /api/v1/practice-sessions/:id/rotations` - List rotations
- `PUT /api/v1/practice-sessions/:id/rotations/:rotationId` - Update rotation

**Business Logic:**
- Session scheduling with duration
- Station/rotation tracking (building, programming, driving, challenge)
- Student assignment to stations
- Rotation timer management
- Progress monitoring per station

**Tests Required:**
- Create/read/update/delete sessions
- Rotation management
- Student assignments
- Validation (overlapping sessions, capacity limits)

#### B. Team Management API
**Database Tables:** `teams`, `team_members`

**Endpoints Needed:**
- `POST /api/v1/teams` - Create team
- `GET /api/v1/teams` - List teams
- `GET /api/v1/teams/:id` - Get team details
- `PUT /api/v1/teams/:id` - Update team
- `DELETE /api/v1/teams/:id` - Archive team
- `POST /api/v1/teams/:id/members` - Add member
- `DELETE /api/v1/teams/:id/members/:userId` - Remove member
- `GET /api/v1/teams/:id/stats` - Team statistics

**Business Logic:**
- Team creation with organization/league info
- Member management with roles (driver, builder, programmer, scout, coach)
- Team statistics aggregation
- Multi-team support (students can be on multiple teams)

**Tests Required:**
- CRUD operations for teams
- Member management
- Role assignments
- Statistics calculation

#### C. Competition Tracking API
**Database Tables:** `competition_results`

**Endpoints Needed:**
- `POST /api/v1/competitions` - Create competition entry
- `GET /api/v1/competitions` - List competitions
- `GET /api/v1/competitions/:id` - Get competition details
- `POST /api/v1/competitions/:id/matches` - Record match result
- `GET /api/v1/competitions/:id/matches` - List match results
- `GET /api/v1/competitions/:id/rankings` - Get rankings
- `GET /api/v1/teams/:teamId/competitions` - Team's competition history

**Business Logic:**
- Competition event creation
- Match result recording (autonomous/driver/skills scores)
- Ranking calculation
- Skills challenge tracking
- Alliance partner tracking

**Tests Required:**
- Competition CRUD
- Match result recording
- Ranking calculations
- Skills challenge tracking

### 3. Enhanced Authentication System

**Improvements Needed:**
- [ ] Session management improvements (refresh tokens, device tracking)
- [ ] Rate limiting on auth endpoints (prevent brute force)
- [ ] Account recovery flows (age-appropriate for PIN/Animal Grid)
- [ ] Multi-device session handling
- [ ] Session timeout configuration

**Acceptance Criteria:**
- Rate limiting active on all auth endpoints
- Refresh token flow implemented
- Account recovery tested for all auth methods
- Multi-device sessions work correctly

---

## 🔨 Medium-Term Goals (1-2 months)

### 1. Data Export & Reporting

**Coach Tools:**
- [ ] Student progress reports (CSV/PDF export)
- [ ] Team performance analytics
- [ ] Lesson completion tracking
- [ ] Skills assessment summaries
- [ ] FERPA-compliant data exports

**Student Tools:**
- [ ] Engineering notebook exports (PDF)
- [ ] Badge/achievement history
- [ ] Personal progress dashboards (via API)

**Implementation:**
- Create report generation endpoints
- Use libraries like PDFKit for PDF generation
- Implement CSV export for spreadsheet compatibility
- Add filtering and date range selection

### 2. Advanced Badge System

**Enhancements:**
- [ ] Automated badge criteria evaluation
- [ ] Badge dependencies/prerequisites
- [ ] Progress tracking toward badges
- [ ] Notification system for badge awards

**Implementation:**
- Badge criteria evaluation engine
- Prerequisite checking logic
- Progress calculation endpoints
- Event system for badge awards

### 3. API Testing Expansion

**Current:** 297 tests passing

**Goals:**
- [ ] Maintain >80% code coverage
- [ ] Add integration tests for new endpoints
- [ ] Add E2E API tests (workflow scenarios)
- [ ] Performance testing for critical paths
- [ ] Load testing for concurrent users

**E2E API Workflow Examples:**
- Student login → view lessons → start lesson → complete steps → record progress
- Coach login → create practice session → assign students → track progress
- Team registration → competition entry → match results → view rankings

---

## 🚀 Long-Term Vision (3-6 months)

### 1. Frontend Development - When API Complete

**Technology Stack (Already Defined):**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)

**UI Priorities:**
1. **Student Dashboard** (K-2 and 3-5 variants)
   - Age-appropriate design
   - Touch-friendly for tablets
   - Badge displays
   - Lesson navigation

2. **Coach Dashboard**
   - Team management
   - Progress monitoring
   - Session planning
   - Report generation

3. **Engineering Notebook Interface**
   - Photo/media upload
   - Entry templates
   - Print/export functionality

4. **Restore E2E Tests** (When UI Exists)
   - Re-implement Playwright tests
   - Test actual user workflows
   - Accessibility testing (WCAG 2.1 AA)
   - Responsive design testing

### 2. Deployment & Operations

**Synology NAS Setup:**
- [ ] Docker Compose deployment
- [ ] Automated backups
- [ ] Health monitoring
- [ ] Log aggregation
- [ ] Local network DNS

**Documentation:**
- [ ] Admin setup guide
- [ ] Coach user manual
- [ ] Student quick-start guides (visual, K-5 appropriate)
- [ ] Troubleshooting playbook

### 3. Educational Content Expansion

**Beyond VEX IQ:**
- [ ] LEGO robotics integration
- [ ] Arduino/microcontroller projects
- [ ] 3D printing curriculum
- [ ] General STEM challenges

---

## 🔧 Technical Debt & Cleanup

### High Priority
1. **Remove Placeholder Playwright Workflow**
   - File: `.github/workflows/playwright.yml`
   - Action: Remove after updating branch protection rules
   - Remove required checks for Playwright tests

2. **Update Branch Protection Settings**
   - Remove Playwright test requirements
   - Keep CodeQL and security checks
   - Configure for actual CI/CD when added

3. **Remaining Type Safety**
   - Review any `any` types
   - Add stricter TSConfig options
   - Implement runtime validation with Zod where missing

### Medium Priority
1. **Database Schema Optimizations**
   - Review indexes for query performance
   - Add missing foreign key constraints
   - Consider partitioning for large tables (future)

2. **Code Organization**
   - Consider shared types consolidation
   - Extract common utilities
   - Standardize error handling patterns

3. **Testing Infrastructure**
   - Set up test database isolation
   - Add database seeding for tests
   - Mock external services (DiceBear)

---

## 📊 Success Metrics

### Technical Metrics
- [x] API test coverage >80% (297 tests passing, ~90% coverage)
- [x] Zero TypeScript errors
- [x] Zero HIGH/CRITICAL security vulnerabilities
- [x] All endpoints documented (OpenAPI/Swagger at /api/docs)
- [x] Build time <30 seconds
- [ ] API response time <200ms (95th percentile)

### Educational Content Metrics
- [x] All 3 phases complete (35 total lessons)
- [x] 45+ skills defined
- [x] 20+ badges available
- [ ] Content tested with actual students
- [ ] Coach feedback incorporated

### User Experience (Future)
- [ ] PIN login <5 seconds
- [ ] Animal Grid login <10 seconds
- [ ] Lesson load time <2 seconds
- [ ] Photo upload <5 seconds
- [ ] WCAG 2.1 AA compliant
- [ ] Touch targets ≥44px (mobile)

---

## 🗓️ Suggested Timeline

### Current Sprint (1-2 weeks)
- **Status:** ✅ Complete - Security vulnerabilities fixed, OpenAPI documentation complete
- **Next:** Begin core API completion (practice sessions, teams, competitions)

### Month 1: Core API Completion
- **Week 1:** Practice session management API
- **Week 2:** Team management API
- **Week 3:** Competition tracking API
- **Week 4:** API testing expansion + bug fixes

### Month 2: Quality & Enhancement
- **Week 1:** Enhanced authentication (rate limiting, refresh tokens)
- **Week 2:** Data export & reporting features
- **Week 3:** Advanced badge system
- **Week 4:** Performance optimization + load testing

### Month 3: Polish & Documentation
- **Week 1:** Final API hardening
- **Week 2:** Comprehensive API documentation
- **Week 3:** Admin deployment guides
- **Week 4:** User testing preparation

### Month 4-6: Frontend Development
- **Month 4:** Student interfaces (dashboard, lessons)
- **Month 5:** Coach interfaces (management, reports)
- **Month 6:** Engineering notebook, testing, polish

---

## 🚨 Blockers & Risks

### Technical Risks
1. **Synology NAS Performance**
   - Risk: Insufficient resources for concurrent users
   - Mitigation: Load testing, optimize queries, consider caching

2. **Photo Storage Limits**
   - Risk: Engineering notebook photos consume disk space
   - Mitigation: Image compression, storage quotas, cleanup tools

3. **Network Isolation**
   - Risk: Local-only deployment limits remote coaching
   - Mitigation: VPN access for coaches, scheduled sync features

### Educational Risks
1. **Age Appropriateness**
   - Risk: Content too advanced or too simple
   - Mitigation: Regular testing with students, coach feedback

2. **Engagement**
   - Risk: Digital fatigue, preference for hands-on only
   - Mitigation: Balance digital/physical, gamification, social features

### Operational Risks
1. **Single Point of Failure**
   - Risk: NAS failure loses all data
   - Mitigation: Automated backups, disaster recovery plan

2. **No Internet Dependency**
   - Risk: Can't use cloud services for enhancement
   - Mitigation: Local-first architecture, offline-capable design

---

## 📚 Reference Documentation

### Key Files
- **Architecture:** `CLAUDE.md` (project overview, commands)
- **Completed Work:** `COMPLETED_WORK.md` (historical accomplishments)
- **Database Schema:** `packages/database/migrations/001-initial-schema.sql`
- **Seed System:** `packages/database/README.md`
- **Troubleshooting:** `SETUP_TROUBLESHOOTING.md`

### External Resources
- VEX IQ Competition: https://www.vexrobotics.com/iq
- FERPA Guidelines: https://www2.ed.gov/policy/gen/guid/fpco/ferpa/
- COPPA Compliance: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions

### Development Commands
```bash
# Start development environment
npm run dev

# Run all tests
npm test

# Seed database (all phases)
npm run seed

# Seed specific phase
npm run seed:phase1
npm run seed:phase2
npm run seed:phase3

# Clear and reseed
npm run seed:clear

# Build for production
npm run build

# Docker operations
docker-compose up -d
docker-compose down
docker-compose logs -f
```

---

## 💡 Ideas for Future Consideration

1. **AI-Assisted Coach Tools**
   - Lesson plan generation
   - Adaptive difficulty recommendations
   - Student grouping optimization

2. **Gamification Enhancements**
   - Team competitions
   - Leaderboards (age-appropriate)
   - Collaborative challenges

3. **Parent Portal** (Future)
   - Progress visibility
   - Photo sharing (privacy-compliant)
   - Event calendar

4. **Integration with School Systems**
   - Grade export (if needed)
   - Attendance tracking
   - Report card integration

5. **Mobile App** (Far Future)
   - Tablet-optimized student interface
   - Coach mobile tools
   - Photo capture improvements

---

## 📝 Quick Start for New Sessions

When starting a new development session, review:

1. **Current State:** Phase 1-3 complete, API tests passing, 4 commits ahead on feature branch
2. **Priority:** Security vulnerabilities + API documentation
3. **Branch Strategy:** Always create feature branches, never edit main
4. **Testing:** TDD approach, >80% coverage target

**Quick Health Check:**
```bash
# Verify everything works
git status                          # Should be on feature branch
npm test --workspace=apps/api       # All tests pass
docker-compose up -d db             # Database starts
npm run seed                        # Seeding works
```

**Context to Provide:**
- This file (NEXT_PHASE_PLAN.md)
- COMPLETED_WORK.md (what's been done)
- CLAUDE.md (project overview)
- Recent git log (last 5-10 commits)

---

**End of Plan Document**
