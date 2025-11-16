# Badge System & Gamification API

This module implements a comprehensive badge system for the STEM Lab Assistant, providing gamification features to motivate and recognize student achievements.

## Overview

The badge system supports:
- **Auto-awarding**: Badges automatically awarded when criteria are met
- **Manual awards**: Coaches can manually award badges with evidence
- **Progress tracking**: Students can see progress toward locked badges
- **Multiple criteria types**: Lesson completion, skill levels, notebook entries, and more
- **Four categories**: Methodology, Skill, Engagement, and Team badges

## Architecture

### Files

```
badges/
├── badges.service.test.ts      # Service tests (TDD)
├── badges.service.ts           # Core badge logic
├── badges.controller.test.ts   # Controller tests (TDD)
├── badges.controller.ts        # HTTP request handlers
├── badges.routes.ts            # Express routes
├── badges.validation.ts        # Zod validation schemas
├── badge-criteria.ts           # Criteria evaluation logic
├── badges.seed.ts              # Initial badge definitions
└── README.md                   # This file
```

### Database Schema

#### badges table
```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(500),
    category badge_category NOT NULL,
    criteria JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### student_badges table
```sql
CREATE TABLE student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    evidence_type VARCHAR(50),
    evidence_id UUID,
    UNIQUE(student_id, badge_id)
);
```

## Badge Criteria Types

### 1. lesson_count
Award badge after completing N lessons (optionally filtered by category).

```typescript
{
  type: 'lesson_count',
  requirements: {
    count: 10,              // Required: number of lessons
    category?: 'methodology' // Optional: filter by lesson category
  }
}
```

**Example**: "Complete 10 lessons" or "Complete 5 methodology lessons"

### 2. skill_level
Award badge when student reaches a certain skill level.

```typescript
{
  type: 'skill_level',
  requirements: {
    skill_category: 'teamwork',  // Required: skill category
    level: 'proficient'          // Required: 'proficient' | 'advanced'
  }
}
```

**Example**: "Reach proficient level in teamwork skills"

### 3. notebook_count
Award badge after creating N notebook entries (optionally filtered by type).

```typescript
{
  type: 'notebook_count',
  requirements: {
    minimum: 10,                // Required: number of entries
    entry_type?: 'test'         // Optional: filter by entry type
  }
}
```

**Example**: "Create 10 notebook entries" or "Document 10 tests"

### 4. specific_lesson
Award badge when a specific lesson is completed.

```typescript
{
  type: 'specific_lesson',
  requirements: {
    lesson_id: 'uuid-of-lesson' // Required: lesson ID
  }
}
```

**Example**: "Complete the 'Introduction to VEX Robotics' lesson"

### 5. time_spent
Award badge after spending N minutes on lessons.

```typescript
{
  type: 'time_spent',
  requirements: {
    minutes: 100  // Required: total minutes
  }
}
```

**Example**: "Spend 100 minutes learning"

### 6. streak
Award badge for completing lessons N days in a row.

```typescript
{
  type: 'streak',
  requirements: {
    days: 5  // Required: consecutive days
  }
}
```

**Example**: "Complete lessons for 5 consecutive days"

### 7. custom
Award badge using custom evaluation logic (manual awards only).

```typescript
{
  type: 'custom',
  requirements: {
    custom_check: 'checkTeamCaptain' // Function name (not implemented)
  }
}
```

**Example**: "Take on a leadership role" (awarded manually by coach)

## API Endpoints

### Badge Library Management

#### GET /api/v1/badges
Get all badges, optionally filtered by category.

**Query Parameters:**
- `category` (optional): `methodology`, `skill`, `engagement`, or `team`

**Response:**
```json
[
  {
    "id": "badge-uuid",
    "name": "First Day",
    "description": "Complete your first lesson",
    "icon": "star",
    "category": "engagement",
    "criteria": {
      "type": "lesson_count",
      "requirements": { "count": 1 }
    },
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### GET /api/v1/badges/:id
Get a specific badge by ID.

**Response:** Badge object

#### POST /api/v1/badges
Create a new badge (Admin only).

**Request Body:**
```json
{
  "name": "Problem Solver",
  "description": "Identify and document 5 problems",
  "icon": "lightbulb",
  "category": "methodology",
  "criteria": {
    "type": "notebook_count",
    "requirements": { "minimum": 5, "entry_type": "brainstorm" }
  }
}
```

#### PUT /api/v1/badges/:id
Update a badge (Admin only).

**Request Body:** Partial badge object

#### DELETE /api/v1/badges/:id
Delete a badge (Admin only).

### Student Badges

#### GET /api/v1/students/:studentId/badges
Get badges earned by a student.

**Authorization:**
- Students can view their own badges
- Coaches/Admins can view any student's badges

**Response:**
```json
[
  {
    "id": "badge-uuid",
    "name": "First Day",
    "description": "Complete your first lesson",
    "icon": "star",
    "category": "engagement",
    "earned_at": "2024-01-15T14:30:00Z",
    "evidence_type": "lesson",
    "evidence_id": "lesson-uuid"
  }
]
```

#### POST /api/v1/students/:studentId/badges
Manually award a badge to a student (Coach/Admin only).

**Request Body:**
```json
{
  "badge_id": "badge-uuid",
  "evidence_type": "notebook_entry",
  "evidence_id": "entry-uuid"
}
```

#### GET /api/v1/students/:studentId/badges/:badgeId/progress
Get student's progress toward a specific badge.

**Response:**
```json
{
  "badge_id": "badge-uuid",
  "current": 7,
  "required": 10,
  "percentage": 70
}
```

### My Badges (Current User)

#### GET /api/v1/me/badges
Get current user's earned badges.

**Response:** Array of earned badges

#### GET /api/v1/me/badges/progress
Get current user's progress toward all available badges.

**Response:**
```json
[
  {
    "badge": {
      "id": "badge-uuid",
      "name": "Dedicated Learner",
      "description": "Complete 10 lessons"
    },
    "progress": {
      "badge_id": "badge-uuid",
      "current": 7,
      "required": 10,
      "percentage": 70
    }
  }
]
```

### Auto-Award (Internal API)

#### POST /api/v1/badges/check-awards
Check and automatically award badges based on an event.

**Request Body:**
```json
{
  "student_id": "student-uuid",
  "event": {
    "type": "lesson_completion",
    "lesson_id": "lesson-uuid"
  }
}
```

**Response:**
```json
{
  "awarded_badges": [
    {
      "id": "badge-uuid",
      "name": "First Day",
      "description": "Complete your first lesson"
    }
  ],
  "count": 1
}
```

## Integration Points

### Call Badge Checking After Events

The auto-award system should be triggered after these events:

#### 1. Lesson Completion
```typescript
// In lesson completion handler
await fetch('/api/v1/badges/check-awards', {
  method: 'POST',
  body: JSON.stringify({
    student_id: studentId,
    event: {
      type: 'lesson_completion',
      lesson_id: lessonId
    }
  })
});
```

#### 2. Skill Assessment
```typescript
// In skill assessment handler
await fetch('/api/v1/badges/check-awards', {
  method: 'POST',
  body: JSON.stringify({
    student_id: studentId,
    event: {
      type: 'skill_assessment',
      skill_id: skillId
    }
  })
});
```

#### 3. Notebook Entry Creation
```typescript
// In notebook entry creation handler
await fetch('/api/v1/badges/check-awards', {
  method: 'POST',
  body: JSON.stringify({
    student_id: studentId,
    event: {
      type: 'notebook_entry',
      notebook_entry_id: entryId
    }
  })
});
```

## Initial Badge Definitions

The system comes with 19 pre-defined badges:

### Methodology (5 badges)
- **Problem Solver**: Identify 5 problems
- **Idea Generator**: Complete 3 methodology lessons
- **Design Thinker**: Create 3 design entries
- **Test Master**: Document 10 tests
- **Iteration Champion**: Document 5 iterations

### Skill (6 badges)
- **Team Player**: Reach proficient in teamwork
- **Master Researcher**: Reach proficient in research
- **Builder**: Reach proficient in technical skills
- **Coding Champion**: Reach proficient in programming
- **Presenter Pro**: Reach proficient in presentation
- **Master Engineer**: Reach advanced in any skill

### Engagement (6 badges)
- **First Day**: Complete 1 lesson
- **Getting Started**: Complete 3 lessons
- **Dedicated Learner**: Complete 10 lessons
- **Notebook Keeper**: Create 10 notebook entries
- **Prolific Writer**: Create 25 notebook entries
- **Week Warrior**: 5-day streak
- **Marathon Runner**: 100+ minutes learning

### Team (2 badges)
- **Team Captain**: Leadership role (manual award)
- **Helpful Helper**: Help a teammate (manual award)

## Seeding Badges

To seed the initial badges:

```typescript
import { seedBadges } from './modules/badges/badges.seed';
import { getDatabase } from './config/database';

const db = getDatabase();
await seedBadges(db);
```

## Testing

The module includes comprehensive tests:

### Service Tests (`badges.service.test.ts`)
- Badge CRUD operations
- Criteria evaluation (all types)
- Auto-awarding logic
- Progress calculation
- Manual awards
- Duplicate prevention

### Controller Tests (`badges.controller.test.ts`)
- HTTP request handling
- Authorization checks
- Error handling
- Response formatting

Run tests:
```bash
npm test badges.service.test.ts
npm test badges.controller.test.ts
```

## Validation

All inputs are validated using Zod schemas:

- **Name**: 1-200 characters
- **Description**: 1-1000 characters
- **Icon**: 1-100 characters (optional)
- **Category**: Must be valid enum value
- **Criteria**: Must match structure for criteria type

## Authorization

- **Students**: View own badges and progress
- **Coaches**: View all badges, award manually, view all student badges
- **Admins**: Full access including badge CRUD

## Performance Considerations

1. **Efficient Queries**: Badge criteria evaluation uses optimized SQL queries
2. **Caching**: Consider caching badge definitions (they rarely change)
3. **Batch Checking**: Auto-award checks all badges at once to minimize queries
4. **Duplicate Prevention**: Database constraint prevents duplicate awards

## Future Enhancements

Potential improvements:

1. **Badge Tiers**: Bronze, Silver, Gold variants of badges
2. **Seasonal Badges**: Limited-time badges for special events
3. **Team Badges**: Badges awarded to entire teams
4. **Badge Showcase**: Let students feature favorite badges on profile
5. **Leaderboards**: Show top badge earners
6. **Notifications**: Alert students when they earn new badges
7. **Custom Criteria**: Implement custom evaluation functions
8. **Badge Collections**: Group related badges into collections

## Troubleshooting

### Badge not auto-awarding
1. Check that criteria evaluation is working: Test criteria with `evaluateCriteria()`
2. Verify event is being triggered after relevant actions
3. Check database for duplicate award constraint

### Progress shows null
Some criteria types (skill_level, specific_lesson, custom) don't have quantifiable progress.

### Permission denied
Verify user role and authorization middleware is working correctly.
