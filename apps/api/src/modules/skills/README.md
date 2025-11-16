# Skills Tracking & Assessment API

Comprehensive skill tracking system for STEM Lab Assistant, enabling coaches to assess student competency development across 5 key skill categories with 4 proficiency levels.

## Overview

The Skills API provides:
- **Skills Library Management**: Create and manage skills taxonomy
- **Student Assessments**: Track student skill development with evidence-based assessments
- **Progress Tracking**: Monitor skill progression over time
- **Student Self-View**: Allow students to view their own skill assessments

## Skill Categories

### 1. Engineering Process
Problem-solving methodology and engineering design process skills:
- Problem Identification
- Brainstorming
- Design Planning
- Prototyping
- Testing Methodology
- Iterative Improvement
- Documentation

### 2. Teamwork
Collaboration and interpersonal skills:
- Communication
- Collaboration
- Active Listening
- Conflict Resolution
- Leadership
- Sharing Resources

### 3. Research
Information gathering and analysis skills:
- Question Formulation
- Source Evaluation
- Note-Taking
- Information Synthesis
- Observation Skills

### 4. Technical
Hands-on building and programming skills:
- Building and Assembly
- Programming Basics
- Tool Usage
- Measurement and Precision
- Robot Control
- Simple Machines

### 5. Presentation
Communication and demonstration skills:
- Public Speaking
- Visual Communication
- Explaining Concepts
- Interview Skills
- Demonstrating Projects
- Show and Tell

## Skill Levels

1. **Novice** - With significant support
2. **Developing** - With some support
3. **Proficient** - Independently
4. **Advanced** - Can teach others

## API Endpoints

### Skills Library (Coach/Admin Management)

#### List All Skills
```http
GET /api/v1/skills
Authorization: Bearer <token>
Query Parameters:
  - category?: SkillCategory (optional)
  - grade_level?: GradeLevel (optional)
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Problem Identification",
    "category": "engineering_process",
    "description": "Ability to identify and define engineering problems clearly",
    "grade_level": "4",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

#### Get Skill Details
```http
GET /api/v1/skills/:id
Authorization: Bearer <token>
```

#### Create Skill
```http
POST /api/v1/skills
Authorization: Bearer <token>
Required Role: Coach or Admin
Content-Type: application/json

{
  "name": "Problem Identification",
  "category": "engineering_process",
  "description": "Ability to identify and define engineering problems clearly",
  "grade_level": "4"
}
```

**Validation:**
- `name`: 1-200 characters, required
- `category`: Must be valid SkillCategory enum
- `description`: 1-2000 characters, required
- `grade_level`: Must be valid GradeLevel enum (K, 1, 2, 3, 4, 5)

#### Update Skill
```http
PUT /api/v1/skills/:id
Authorization: Bearer <token>
Required Role: Coach or Admin
Content-Type: application/json

{
  "name": "Updated Problem Identification",
  "description": "Updated description"
}
```

**Note:** All fields are optional in updates.

#### Delete Skill
```http
DELETE /api/v1/skills/:id
Authorization: Bearer <token>
Required Role: Admin only
```

**Response:** 204 No Content

#### Get Students Assessed for a Skill
```http
GET /api/v1/skills/:skillId/students
Authorization: Bearer <token>
Required Role: Coach or Admin
```

**Response:**
```json
[
  {
    "id": "assessment-uuid",
    "student_id": "student-uuid",
    "student_name": "John Doe",
    "student_grade_level": "4",
    "skill_id": "skill-uuid",
    "level": "developing",
    "evidence_notes": "Showed improvement during robot building project",
    "assessed_by": "coach-uuid",
    "assessed_at": "2024-01-20T14:30:00Z"
  }
]
```

### Student Assessments (Coach Functions)

#### Get Student Skill Profile
```http
GET /api/v1/students/:studentId/skills
Authorization: Bearer <token>
Access: Student (own profile), Coach, or Admin
```

**Response:**
```json
[
  {
    "id": "assessment-uuid",
    "student_id": "student-uuid",
    "skill_id": "skill-uuid",
    "skill_name": "Problem Identification",
    "skill_category": "engineering_process",
    "skill_description": "Ability to identify engineering problems",
    "skill_grade_level": "4",
    "level": "developing",
    "evidence_notes": "Student identified design flaws in robot arm",
    "assessed_by": "coach-uuid",
    "assessed_at": "2024-01-20T14:30:00Z",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-20T14:30:00Z"
  }
]
```

#### Assess Student Skill
```http
POST /api/v1/students/:studentId/skills
Authorization: Bearer <token>
Required Role: Coach or Admin
Content-Type: application/json

{
  "skill_id": "skill-uuid",
  "level": "developing",
  "evidence_notes": "Student identified design flaws in robot arm during testing"
}
```

**Validation:**
- `skill_id`: Valid UUID, required
- `level`: Must be valid SkillLevel enum (novice, developing, proficient, advanced)
- `evidence_notes`: Max 2000 characters, optional

**Behavior:**
- If no assessment exists: Creates new assessment
- If assessment exists: Updates existing assessment

**Response:** 201 Created
```json
{
  "id": "assessment-uuid",
  "student_id": "student-uuid",
  "skill_id": "skill-uuid",
  "level": "developing",
  "evidence_notes": "Student identified design flaws in robot arm during testing",
  "assessed_by": "coach-uuid",
  "assessed_at": "2024-01-20T14:30:00Z",
  "created_at": "2024-01-20T14:30:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
```

#### Update Student Skill Assessment
```http
PUT /api/v1/students/:studentId/skills/:skillId
Authorization: Bearer <token>
Required Role: Coach or Admin
Content-Type: application/json

{
  "level": "proficient",
  "evidence_notes": "Now works independently on problem identification"
}
```

**Response:** 200 OK (same format as assess endpoint)

#### Get Skill Progress History
```http
GET /api/v1/students/:studentId/skills/:skillId/history
Authorization: Bearer <token>
Access: Student (own history), Coach, or Admin
```

**Note:** Current schema has UNIQUE constraint on (student_id, skill_id), so only returns latest assessment. For full history tracking, a separate assessment_history table would be needed.

**Response:**
```json
[
  {
    "id": "assessment-uuid",
    "student_id": "student-uuid",
    "skill_id": "skill-uuid",
    "level": "proficient",
    "evidence_notes": "Latest assessment",
    "assessed_by": "coach-uuid",
    "assessed_at": "2024-01-20T14:30:00Z",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### Student Self-View

#### Get My Skills
```http
GET /api/v1/me/skills
Authorization: Bearer <token>
Access: Any authenticated user (returns their own profile)
```

**Response:** Same format as student skill profile

## Authorization

### Role-Based Access

| Endpoint | Student | Coach | Admin |
|----------|---------|-------|-------|
| List Skills | ✓ | ✓ | ✓ |
| Get Skill Details | ✓ | ✓ | ✓ |
| Create Skill | ✗ | ✓ | ✓ |
| Update Skill | ✗ | ✓ | ✓ |
| Delete Skill | ✗ | ✗ | ✓ |
| Assess Student | ✗ | ✓ | ✓ |
| View Student Profile | Own only | ✓ | ✓ |
| Get My Skills | ✓ | ✓ | ✓ |

## Data Validation

### Skill Creation/Update
- **Name**: 1-200 characters, required
- **Category**: One of: `engineering_process`, `teamwork`, `research`, `technical`, `presentation`
- **Description**: 1-2000 characters, required
- **Grade Level**: One of: `K`, `1`, `2`, `3`, `4`, `5`

### Student Assessment
- **Skill ID**: Valid UUID
- **Level**: One of: `novice`, `developing`, `proficient`, `advanced`
- **Evidence Notes**: Max 2000 characters, optional
- **Assessed By**: Automatically set to current user (coach)
- **Assessed At**: Automatically set to current timestamp

## Seeding Initial Skills

The API includes a comprehensive seed file with 30 pre-defined skills across all categories and grade levels.

### Run Seed Script

```typescript
import { getDatabase, initializeDatabase } from './config/database';
import { seedSkills, getSkillStats } from './modules/skills/skills.seed';

async function seed() {
  const db = await initializeDatabase();

  // Seed skills
  const created = await seedSkills(db);
  console.log(`Created ${created} skills`);

  // View statistics
  await getSkillStats(db);

  await db.close();
}

seed();
```

### Seed Data Summary

- **Engineering Process**: 7 skills (Grades K-5)
- **Teamwork**: 6 skills (Grades K-5)
- **Research**: 5 skills (Grades 1-5)
- **Technical**: 6 skills (Grades 2-5)
- **Presentation**: 6 skills (Grades K-5)

**Total**: 30 skills

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Name must be between 1 and 200 characters"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Skill not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create skill"
}
```

## Testing

### Run Tests
```bash
npm test -- skills
```

### Test Coverage
The module includes comprehensive test coverage:
- **Service Tests**: 40+ test cases covering all business logic
- **Controller Tests**: 30+ test cases covering all HTTP endpoints
- **Expected Coverage**: >90%

### Test Categories
1. Skills CRUD operations
2. Validation (enum values, string lengths, required fields)
3. Student assessments (create, update)
4. Student profiles (individual, grouped by category)
5. Progress tracking
6. Authorization checks
7. Error handling

## Database Schema

### skills Table
```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category skill_category NOT NULL,
    description TEXT NOT NULL,
    grade_level grade_level NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### student_skills Table
```sql
CREATE TABLE student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    level skill_level NOT NULL,
    evidence_notes TEXT,
    assessed_by UUID NOT NULL REFERENCES users(id),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_id)
);
```

## Usage Examples

### Coach Workflow

```typescript
// 1. View available skills for grade 4
const response = await fetch('/api/v1/skills?grade_level=4', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const skills = await response.json();

// 2. Assess a student's problem identification skill
await fetch('/api/v1/students/student-uuid/skills', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skill_id: 'problem-identification-uuid',
    level: 'developing',
    evidence_notes: 'Student identified 3 design flaws during robot testing'
  })
});

// 3. View student's complete skill profile
const profile = await fetch('/api/v1/students/student-uuid/skills', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Student Workflow

```typescript
// View my own skill assessments
const mySkills = await fetch('/api/v1/me/skills', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const assessments = await mySkills.json();

// See my progress in a specific skill
const history = await fetch('/api/v1/students/my-id/skills/skill-uuid/history', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Future Enhancements

1. **Assessment History**: Implement separate table to track full assessment history over time
2. **Skill Dependencies**: Define prerequisite skills
3. **Badge Integration**: Link skill levels to badge earning criteria
4. **Analytics**: Aggregate skill data for class/team insights
5. **Evidence Linking**: Link assessments to specific notebook entries or lessons
6. **Skill Recommendations**: Suggest skills for students to work on based on progress

## Files

- `skills.service.ts` - Business logic and database operations
- `skills.service.test.ts` - Service layer tests (40+ tests)
- `skills.controller.ts` - HTTP request handlers
- `skills.controller.test.ts` - Controller layer tests (30+ tests)
- `skills.validation.ts` - Zod validation schemas
- `skills.routes.ts` - API route definitions
- `skills.seed.ts` - Initial skills taxonomy (30 skills)
- `README.md` - This documentation
