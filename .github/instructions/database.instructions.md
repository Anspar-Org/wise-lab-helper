---
applyTo: "packages/database/**/*"
---

# Database Development Instructions

## Database Schema Overview

The database uses PostgreSQL 16 and is organized by **feature priority**:

### High Priority Tables
- `users` - Authentication and user profiles
- `lessons`, `lesson_steps`, `student_lesson_progress` - Learning content
- `skills`, `student_skills` - Competency tracking
- `badges`, `student_badges` - Gamification
- `notebook_entries`, `notebook_media` - Engineering documentation

### Lower Priority Tables
- `teams`, `team_members` - VEX IQ team management
- `practice_sessions`, `session_rotations` - Session tracking
- `competition_results` - Competition tracking

## Migration System

### Creating Migrations

Migrations are numbered sequentially and written in plain SQL:

```bash
# Create new migration
cd packages/database
npm run migrate:create <migration-name>

# This creates: migrations/XXX-<migration-name>.sql
```

### Migration File Structure

```sql
-- Migration: 002-add-notebook-tables.sql
-- Description: Add engineering notebook tables
-- Author: Your Name
-- Date: 2024-01-15

-- Up Migration
CREATE TABLE notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN (
    'brainstorm', 'research', 'design', 'build', 'test', 'reflection'
  )),
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notebook_entries_author ON notebook_entries(author_id);
CREATE INDEX idx_notebook_entries_team ON notebook_entries(team_id);
CREATE INDEX idx_notebook_entries_date ON notebook_entries(entry_date DESC);

-- Down Migration (for rollback)
DROP TABLE IF EXISTS notebook_entries CASCADE;
```

### Running Migrations

```bash
# Run all pending migrations
cd packages/database
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Check migration status
node migrate.js status
```

## Schema Design Principles

### Primary Keys

Use UUIDs for all primary keys:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- other columns
);
```

**Why UUIDs?**
- Globally unique
- No sequential enumeration vulnerability
- Safe for distributed systems (future)

### Foreign Keys

Always define foreign key relationships with appropriate actions:

```sql
-- CASCADE: Delete child records when parent is deleted
team_id UUID REFERENCES teams(id) ON DELETE CASCADE

-- SET NULL: Set to NULL when parent is deleted
coach_id UUID REFERENCES users(id) ON DELETE SET NULL

-- RESTRICT: Prevent deletion if children exist (default)
lesson_id UUID REFERENCES lessons(id) ON DELETE RESTRICT
```

### Timestamps

Include audit timestamps on all tables:

```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

Use triggers to auto-update `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Constraints

Use constraints to enforce data integrity:

```sql
-- Check constraints
grade_level INTEGER CHECK (grade_level >= 0 AND grade_level <= 5),

-- NOT NULL where appropriate
username VARCHAR(50) NOT NULL,

-- UNIQUE constraints
email VARCHAR(255) UNIQUE,

-- Enum-like constraints
role VARCHAR(20) CHECK (role IN ('student', 'coach', 'admin')),
auth_type VARCHAR(20) CHECK (auth_type IN ('pin', 'animal_grid', 'email_password'))
```

### Indexes

Create indexes for frequently queried columns:

```sql
-- Foreign keys (for joins)
CREATE INDEX idx_student_skills_student ON student_skills(student_id);
CREATE INDEX idx_student_skills_skill ON student_skills(skill_id);

-- Search columns
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Sort columns
CREATE INDEX idx_lessons_created_at ON lessons(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_student_lesson_progress_lookup 
  ON student_lesson_progress(student_id, lesson_id);

-- Partial indexes for specific conditions
CREATE INDEX idx_active_users 
  ON users(last_login) 
  WHERE deleted_at IS NULL;
```

## User Authentication Tables

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE, -- NULL for students
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'coach', 'admin')),
  grade_level INTEGER CHECK (grade_level >= 0 AND grade_level <= 5), -- K=0
  
  -- Authentication
  auth_type VARCHAR(20) NOT NULL CHECK (auth_type IN ('pin', 'animal_grid', 'email_password')),
  password_hash VARCHAR(255), -- For email/password auth
  pin_hash VARCHAR(255),      -- For PIN auth
  animal_pattern_hash VARCHAR(255), -- For animal grid auth
  
  -- Avatar
  avatar_config JSONB, -- DiceBear config
  
  -- Privacy compliance
  data_retention_date DATE, -- When user data should be purged
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);
```

### Avatar Configuration

Store as JSONB for flexibility:

```json
{
  "style": "adventurer",
  "seed": "unique-seed-value",
  "backgroundColor": ["#ffdfbf"],
  "accessories": ["sunglasses"],
  "hairColor": ["brown"]
}
```

## Learning Content Tables

### Lessons and Progress

```sql
-- Core lesson content
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'methodology', 'teamwork', 'research_skills', 'technical'
  )),
  grade_level INTEGER[] NOT NULL, -- Array: [3,4,5] or [0,1,2]
  duration_minutes INTEGER,
  learning_objectives TEXT[],
  content JSONB, -- Flexible content structure
  media_urls TEXT[],
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published BOOLEAN DEFAULT false
);

-- Multi-step lessons
CREATE TABLE lesson_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content JSONB NOT NULL,
  interactive_elements JSONB, -- Quiz questions, activities
  required BOOLEAN DEFAULT true,
  UNIQUE(lesson_id, step_number)
);

-- Track student progress
CREATE TABLE student_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'reviewed'
  )) DEFAULT 'not_started',
  progress_percent INTEGER CHECK (progress_percent >= 0 AND progress_percent <= 100),
  current_step INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(student_id, lesson_id)
);
```

## Skills Tracking Tables

```sql
-- Skills taxonomy
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'engineering_process', 'teamwork', 'research', 'technical', 'presentation'
  )),
  grade_level INTEGER[] NOT NULL, -- Applicable grades
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student skill assessments
CREATE TABLE student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  -- 1: Novice, 2: Developing, 3: Proficient, 4: Advanced
  evidence_notes TEXT,
  evidence_entry_id UUID REFERENCES notebook_entries(id), -- Link to evidence
  assessed_by UUID NOT NULL REFERENCES users(id),
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, skill_id)
);
```

## Gamification Tables

```sql
-- Badge definitions
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(100), -- Icon name or SVG path
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'methodology', 'skill', 'engagement', 'team'
  )),
  criteria JSONB NOT NULL, -- Earning criteria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student earned badges
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  evidence_id UUID REFERENCES notebook_entries(id), -- Optional evidence
  awarded_by UUID REFERENCES users(id), -- NULL for auto-awards
  UNIQUE(student_id, badge_id)
);
```

## Engineering Notebook Tables

```sql
-- Notebook entries
CREATE TABLE notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN (
    'brainstorm', 'research', 'design', 'build', 'test', 'reflection'
  )),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media attachments
CREATE TABLE notebook_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES notebook_entries(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'image/jpeg', 'video/mp4', etc.
  file_size INTEGER NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Query Performance

### Explain Plans

Always check query performance with EXPLAIN:

```sql
EXPLAIN ANALYZE
SELECT * FROM student_lesson_progress 
WHERE student_id = 'some-uuid' 
AND status = 'in_progress';
```

### Common Optimization Patterns

```sql
-- Use covering indexes
CREATE INDEX idx_user_login 
  ON users(username, password_hash) 
  WHERE deleted_at IS NULL;

-- Use partial indexes for common filters
CREATE INDEX idx_published_lessons 
  ON lessons(category, created_at DESC) 
  WHERE published = true;

-- Use GIN indexes for array/JSONB columns
CREATE INDEX idx_lessons_grade_level 
  ON lessons USING GIN (grade_level);

CREATE INDEX idx_lesson_content 
  ON lessons USING GIN (content);
```

## Data Privacy & Retention

### Data Retention Policy

Students' data is retained until: End of Grade 5 + 4 years

```sql
-- Calculate retention date on user creation
UPDATE users 
SET data_retention_date = 
  CASE 
    WHEN grade_level = 5 THEN CURRENT_DATE + INTERVAL '4 years'
    WHEN grade_level = 4 THEN CURRENT_DATE + INTERVAL '5 years'
    WHEN grade_level = 3 THEN CURRENT_DATE + INTERVAL '6 years'
    -- etc.
  END
WHERE role = 'student';

-- Automated cleanup (run periodically)
DELETE FROM users 
WHERE role = 'student' 
  AND data_retention_date < CURRENT_DATE;
```

### Soft Delete Pattern

Use soft deletes for auditing:

```sql
-- Add deleted_at column
deleted_at TIMESTAMP WITH TIME ZONE

-- "Delete" operation
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1;

-- Query only active records
SELECT * FROM users WHERE deleted_at IS NULL;
```

## Seed Data

Create seed data for development and testing:

```sql
-- seeds/001-initial-users.sql
INSERT INTO users (username, display_name, role, auth_type, grade_level, pin_hash)
VALUES
  ('alice', 'Alice Smith', 'student', 'pin', 4, '$2b$10$...'),
  ('bob', 'Bob Jones', 'student', 'pin', 5, '$2b$10$...'),
  ('coach_mary', 'Mary Johnson', 'coach', 'email_password', NULL, '$2b$10$...');

-- seeds/002-initial-skills.sql
INSERT INTO skills (name, category, description, grade_level)
VALUES
  ('Brainstorming', 'engineering_process', 'Generate multiple ideas', ARRAY[3,4,5]),
  ('Teamwork', 'teamwork', 'Work effectively with others', ARRAY[0,1,2,3,4,5]),
  ('Problem Identification', 'engineering_process', 'Identify problems to solve', ARRAY[3,4,5]);
```

## Backup and Recovery

### Backup Commands

```bash
# Full database backup
pg_dump -h localhost -U stemlab_user -d stemlab > backup-$(date +%Y%m%d).sql

# Backup specific tables
pg_dump -h localhost -U stemlab_user -d stemlab -t users -t lessons > backup-core.sql

# Restore from backup
psql -h localhost -U stemlab_user -d stemlab < backup.sql
```

### Automated Backups

Configure in `docker-compose.yml` or use Synology backup tools.

## Common Issues

1. **Connection errors**: Check `DATABASE_URL` in `.env`
2. **Migration failures**: Check PostgreSQL logs, fix and re-run
3. **Constraint violations**: Review error message, check data validity
4. **Slow queries**: Add appropriate indexes, use EXPLAIN ANALYZE
5. **Foreign key issues**: Ensure parent records exist before inserting children

## Testing Database Operations

Always test database operations:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase } from '../database';

describe('Database: Users', () => {
  let db: Database;

  beforeEach(async () => {
    db = getDatabase();
    // Clean up test data
    await db.query('DELETE FROM users WHERE username LIKE $1', ['test_%']);
  });

  afterEach(async () => {
    // Cleanup
    await db.query('DELETE FROM users WHERE username LIKE $1', ['test_%']);
  });

  it('creates a user with unique username', async () => {
    const result = await db.query(
      'INSERT INTO users (username, display_name, role, auth_type) VALUES ($1, $2, $3, $4) RETURNING *',
      ['test_alice', 'Test Alice', 'student', 'pin']
    );

    expect(result.rows[0]).toBeDefined();
    expect(result.rows[0].username).toBe('test_alice');
  });
});
```

## Resources

- PostgreSQL documentation: https://www.postgresql.org/docs/16/
- Schema design best practices: https://wiki.postgresql.org/wiki/Don%27t_Do_This
- Index optimization: https://www.postgresql.org/docs/16/indexes.html
- Full schema: `packages/database/migrations/001-initial-schema.sql`
