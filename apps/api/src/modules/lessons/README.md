# Lessons & Learning Content API

This module provides the core learning content functionality for the STEM Lab Assistant platform. It enables coaches to create and manage educational lessons, and students to access lessons and track their learning progress.

## Overview

The Lessons API is the **HIGHEST PRIORITY** feature of the platform, providing:

- Lesson creation and management (coaches/admins)
- Multi-step lessons with interactive content
- Student progress tracking
- Flexible JSONB content structure
- Media attachment support
- Learning objectives tracking
- Progress analytics

## Architecture

The module follows a layered architecture:

```
lessons/
├── lessons.validation.ts      # Zod schemas for request validation
├── lessons.service.ts          # Business logic layer
├── lessons.controller.ts       # HTTP request handlers
├── lessons.routes.ts           # Express route definitions
├── lessons.service.test.ts     # Service unit tests
├── lessons.controller.test.ts  # Controller integration tests
└── README.md                   # This file
```

## Database Schema

### Tables

**lessons**
- Core lesson content and metadata
- JSONB content field for flexible structure
- Array fields for media_urls and learning_objectives
- Published flag for draft/published states
- Display order for sequencing

**lesson_steps**
- Multi-step lesson support
- Each step has its own content and interactive elements
- Ordered by step_number
- Optional assessment questions

**student_lesson_progress**
- Tracks each student's progress through lessons
- Status: not_started, in_progress, completed, reviewed
- Progress percentage (0-100)
- Current step tracking
- Time spent tracking
- Student notes

## API Endpoints

### Lesson Management (Coach/Admin)

#### List Lessons
```
GET /api/v1/lessons
Query Parameters:
  - category: LessonCategory (optional)
  - grade_level: GradeLevel (optional)
  - published: boolean (optional, coaches only)
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)

Response:
{
  "data": [Lesson[]],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Notes:**
- Students only see published lessons
- Coaches/admins see all lessons
- Results ordered by display_order, then created_at

#### Get Lesson Details
```
GET /api/v1/lessons/:id

Response:
{
  "data": {
    "id": "uuid",
    "title": "Introduction to Engineering",
    "category": "methodology",
    "grade_level": "4",
    "duration_minutes": 30,
    "content": { ... },
    "media_urls": ["https://..."],
    "learning_objectives": ["..."],
    "published": true,
    "display_order": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Lesson
```
POST /api/v1/lessons
Authorization: Coach, Admin
Content-Type: application/json

Body:
{
  "title": "Introduction to Engineering",
  "category": "methodology",
  "grade_level": "4",
  "duration_minutes": 30,
  "content": {
    "introduction": "Learn about the engineering process...",
    "sections": [
      {
        "title": "What is Engineering?",
        "content": "Engineering is solving problems...",
        "media": "https://example.com/video.mp4",
        "interactive": {
          "type": "quiz",
          "data": {
            "question": "What is the first step?",
            "options": ["Ask", "Build", "Test"],
            "correct": 0
          }
        }
      }
    ],
    "summary": "You learned about..."
  },
  "learning_objectives": [
    "Understand the engineering design process",
    "Identify problems that engineering can solve"
  ],
  "media_urls": ["https://example.com/thumbnail.jpg"],
  "published": false
}

Response: 201 Created
{
  "message": "Lesson created successfully",
  "data": { ... }
}
```

#### Update Lesson
```
PUT /api/v1/lessons/:id
Authorization: Coach, Admin
Content-Type: application/json

Body: (all fields optional)
{
  "title": "Updated Title",
  "published": true,
  "content": { ... }
}

Response: 200 OK
{
  "message": "Lesson updated successfully",
  "data": { ... }
}
```

#### Delete Lesson
```
DELETE /api/v1/lessons/:id
Authorization: Coach, Admin

Response: 200 OK
{
  "message": "Lesson deleted successfully"
}
```

**Note:** Deletes cascade to lesson_steps and student_lesson_progress

#### Publish/Unpublish Lesson
```
PATCH /api/v1/lessons/:id/publish
Authorization: Coach, Admin
Content-Type: application/json

Body:
{
  "published": true
}

Response: 200 OK
{
  "message": "Lesson published successfully",
  "data": { ... }
}
```

### Lesson Steps

#### Get Lesson Steps
```
GET /api/v1/lessons/:id/steps

Response:
{
  "data": [
    {
      "id": "uuid",
      "lesson_id": "uuid",
      "step_number": 1,
      "title": "Step 1: Understanding the Problem",
      "content": { ... },
      "interactive_elements": { ... },
      "assessment_questions": { ... },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Lesson Step
```
POST /api/v1/lessons/:id/steps
Authorization: Coach, Admin
Content-Type: application/json

Body:
{
  "step_number": 1,
  "title": "Understanding the Problem",
  "content": {
    "text": "The first step is to identify the problem...",
    "images": ["https://..."]
  },
  "interactive_elements": {
    "type": "sorting",
    "items": ["Item 1", "Item 2"],
    "correct_order": [1, 0]
  },
  "assessment_questions": {
    "questions": [
      {
        "question": "What is the first step?",
        "type": "multiple_choice",
        "options": ["Ask", "Build", "Test"],
        "correct": 0
      }
    ]
  }
}

Response: 201 Created
{
  "message": "Lesson step created successfully",
  "data": { ... }
}
```

#### Update Lesson Step
```
PUT /api/v1/lessons/:id/steps/:stepId
Authorization: Coach, Admin
Content-Type: application/json

Body: (all fields optional)
{
  "title": "Updated Step Title",
  "content": { ... }
}

Response: 200 OK
{
  "message": "Lesson step updated successfully",
  "data": { ... }
}
```

#### Delete Lesson Step
```
DELETE /api/v1/lessons/:id/steps/:stepId
Authorization: Coach, Admin

Response: 200 OK
{
  "message": "Lesson step deleted successfully"
}
```

### Student Progress

#### Start Lesson
```
POST /api/v1/lessons/:id/start
Authorization: All authenticated users

Response: 201 Created
{
  "message": "Lesson started successfully",
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "lesson_id": "uuid",
    "status": "in_progress",
    "progress_percent": 0,
    "current_step": 1,
    "started_at": "2024-01-01T00:00:00Z",
    "time_spent_minutes": 0
  }
}

Error: 400 Bad Request (if already started)
{
  "error": "Bad Request",
  "message": "You have already started this lesson"
}
```

#### Get Progress
```
GET /api/v1/lessons/:id/progress
Authorization: Students (own), Coaches/Admins (any)

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "lesson_id": "uuid",
    "status": "in_progress",
    "progress_percent": 50,
    "current_step": 2,
    "started_at": "2024-01-01T00:00:00Z",
    "completed_at": null,
    "time_spent_minutes": 15,
    "notes": "Interesting so far!",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:15:00Z"
  }
}

Error: 404 Not Found
{
  "error": "Not Found",
  "message": "Progress not found. Start the lesson first."
}
```

#### Update Progress
```
PUT /api/v1/lessons/:id/progress
Authorization: Students (own progress)
Content-Type: application/json

Body: (all fields optional)
{
  "progress_percent": 75,
  "current_step": 3,
  "time_spent_minutes": 25,
  "notes": "This is really helpful!"
}

Response: 200 OK
{
  "message": "Progress updated successfully",
  "data": { ... }
}
```

#### Complete Lesson
```
POST /api/v1/lessons/:id/complete
Authorization: Students (own progress)

Response: 200 OK
{
  "message": "Lesson completed successfully! Great job!",
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "lesson_id": "uuid",
    "status": "completed",
    "progress_percent": 100,
    "current_step": 5,
    "started_at": "2024-01-01T00:00:00Z",
    "completed_at": "2024-01-01T00:30:00Z",
    "time_spent_minutes": 30,
    "notes": "..."
  }
}
```

#### Get All Student Progress
```
GET /api/v1/students/:studentId/progress
Authorization: Students (own), Coaches/Admins (any)

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "lesson_id": "uuid",
      "status": "completed",
      "progress_percent": 100,
      ...
    },
    {
      "id": "uuid",
      "student_id": "uuid",
      "lesson_id": "uuid",
      "status": "in_progress",
      "progress_percent": 50,
      ...
    }
  ]
}
```

## Lesson Categories

- `methodology`: Engineering methodology and design process
- `teamwork`: Teamwork and collaboration skills
- `research_skills`: Research and learning strategies
- `technical`: Technical skills (programming, CAD, etc.)

## Grade Levels

- `K`: Kindergarten
- `1`: First Grade
- `2`: Second Grade
- `3`: Third Grade
- `4`: Fourth Grade
- `5`: Fifth Grade

## Progress Status

- `not_started`: Lesson has not been started
- `in_progress`: Student is currently working on the lesson
- `completed`: Student has completed the lesson
- `reviewed`: Coach has reviewed the student's work

## Content Structure

Lessons use a flexible JSONB content structure that can be customized per lesson:

```json
{
  "introduction": "String: Lesson introduction",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content text",
      "media": "URL to image/video",
      "interactive": {
        "type": "quiz|activity|video|sorting|fill_blank",
        "data": { ... }
      }
    }
  ],
  "summary": "String: Lesson summary"
}
```

Additional fields can be added as needed. The frontend is responsible for rendering the content appropriately.

## Authorization

### Students
- Can view published lessons
- Can start/update/complete their own lessons
- Can view their own progress
- Cannot create, edit, or delete lessons
- Cannot view other students' progress

### Coaches
- Can create, edit, delete lessons
- Can publish/unpublish lessons
- Can view all lessons (published and unpublished)
- Can view all students' progress
- Can start lessons for testing purposes

### Admins
- All coach permissions
- Full access to all operations

## Testing

Run tests:
```bash
npm test lessons.service.test.ts
npm test lessons.controller.test.ts
```

Run with coverage:
```bash
npm run test:coverage -- lessons
```

## Implementation Notes

1. **TDD Approach**: Tests were written first, then implementation
2. **Validation**: Zod schemas validate all input data
3. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
4. **Security**: Authorization enforced at route level
5. **Performance**: Pagination for list endpoints
6. **Flexibility**: JSONB content allows for evolving lesson structures

## Future Enhancements

- Lesson templates for quick creation
- Lesson duplication
- Version history for lessons
- Student analytics dashboard
- Automated progress calculation based on step completion
- Lesson ratings and feedback
- Prerequisites and learning paths
- Export lessons to PDF
- Offline lesson access

## Related Modules

- **Auth Module**: Provides authentication and authorization
- **Skills Module**: Links lessons to skill development
- **Badges Module**: Awards badges for lesson completion
- **Notebook Module**: Students can reference lessons in notebook entries

## Support

For questions or issues with the Lessons API, contact the development team or refer to the main project documentation.
