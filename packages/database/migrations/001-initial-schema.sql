-- Migration 001: Initial Schema
-- Creates all core tables for STEM Lab Assistant
-- Priority: Authentication, Learning Content, Skills, Engineering Notebook

-- =====================================================
-- USERS & AUTHENTICATION (Highest Priority)
-- =====================================================

CREATE TYPE user_role AS ENUM ('student', 'coach', 'admin');
CREATE TYPE auth_type AS ENUM ('pin', 'animal_grid', 'password');
CREATE TYPE grade_level AS ENUM ('K', '1', '2', '3', '4', '5');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    grade_level grade_level,

    -- Avatar configuration (JSON)
    avatar_config JSONB,

    -- Authentication
    auth_type auth_type NOT NULL,
    password_hash VARCHAR(255), -- For coaches/admins
    pin_hash VARCHAR(255), -- For students (Grades 3-5)
    animal_pattern_hash VARCHAR(255), -- For students (Grades K-2)

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,

    -- Data retention (Grade 5 graduation + 4 years)
    data_retention_date DATE,

    -- Constraints
    CONSTRAINT email_required_for_staff CHECK (
        (role IN ('coach', 'admin') AND email IS NOT NULL) OR role = 'student'
    ),
    CONSTRAINT auth_method_valid CHECK (
        (auth_type = 'password' AND password_hash IS NOT NULL) OR
        (auth_type = 'pin' AND pin_hash IS NOT NULL) OR
        (auth_type = 'animal_grid' AND animal_pattern_hash IS NOT NULL)
    )
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_retention_date ON users(data_retention_date);

-- Auth tokens for JWT management
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_auth_tokens_user ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_expires ON auth_tokens(expires_at);

-- =====================================================
-- LEARNING CONTENT (Highest Priority)
-- =====================================================

CREATE TYPE lesson_category AS ENUM (
    'methodology',      -- Engineering methodology
    'teamwork',         -- Teamwork skills
    'research_skills',  -- Research and learning skills
    'technical'         -- Technical skills
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    category lesson_category NOT NULL,
    grade_level grade_level NOT NULL,
    duration_minutes INTEGER NOT NULL,

    -- Content (stored as structured JSON)
    content JSONB NOT NULL,

    -- Media URLs (images, videos)
    media_urls TEXT[],

    -- Learning objectives
    learning_objectives TEXT[] NOT NULL,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT FALSE,

    -- Ordering
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_lessons_category ON lessons(category);
CREATE INDEX idx_lessons_grade ON lessons(grade_level);
CREATE INDEX idx_lessons_published ON lessons(published);

-- Lesson steps (for multi-step lessons)
CREATE TABLE lesson_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content JSONB NOT NULL,

    -- Interactive elements (quizzes, activities)
    interactive_elements JSONB,

    -- Assessment questions
    assessment_questions JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(lesson_id, step_number)
);

CREATE INDEX idx_lesson_steps_lesson ON lesson_steps(lesson_id);

-- Student lesson progress
CREATE TYPE lesson_progress_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'reviewed'
);

CREATE TABLE student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

    status lesson_progress_status NOT NULL DEFAULT 'not_started',
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),

    -- Current step (for multi-step lessons)
    current_step INTEGER DEFAULT 1,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,

    -- Notes from student
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(student_id, lesson_id)
);

CREATE INDEX idx_student_progress_student ON student_lesson_progress(student_id);
CREATE INDEX idx_student_progress_lesson ON student_lesson_progress(lesson_id);
CREATE INDEX idx_student_progress_status ON student_lesson_progress(status);

-- =====================================================
-- SKILLS & COMPETENCIES (High Priority)
-- =====================================================

CREATE TYPE skill_category AS ENUM (
    'engineering_process',
    'teamwork',
    'research',
    'technical',
    'presentation'
);

CREATE TYPE skill_level AS ENUM (
    'novice',      -- Level 1: With significant support
    'developing',  -- Level 2: With some support
    'proficient',  -- Level 3: Independently
    'advanced'     -- Level 4: Can teach others
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category skill_category NOT NULL,
    description TEXT NOT NULL,
    grade_level grade_level NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_grade ON skills(grade_level);

-- Student skill assessments
CREATE TABLE student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

    level skill_level NOT NULL,

    -- Evidence notes from coach
    evidence_notes TEXT,

    -- Who assessed and when
    assessed_by UUID NOT NULL REFERENCES users(id),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(student_id, skill_id)
);

CREATE INDEX idx_student_skills_student ON student_skills(student_id);
CREATE INDEX idx_student_skills_skill ON student_skills(skill_id);

-- =====================================================
-- BADGES & GAMIFICATION (High Priority)
-- =====================================================

CREATE TYPE badge_category AS ENUM (
    'methodology',
    'skill',
    'engagement',
    'team'
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(500), -- Icon name or SVG path
    category badge_category NOT NULL,

    -- Criteria for earning (stored as JSON rules)
    criteria JSONB NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badges_category ON badges(category);

-- Student badges (earned)
CREATE TABLE student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Link to evidence (notebook entry, lesson completion, etc.)
    evidence_type VARCHAR(50), -- 'lesson', 'notebook_entry', 'skill_assessment'
    evidence_id UUID,

    UNIQUE(student_id, badge_id)
);

CREATE INDEX idx_student_badges_student ON student_badges(student_id);
CREATE INDEX idx_student_badges_badge ON student_badges(badge_id);

-- =====================================================
-- ENGINEERING NOTEBOOK (High Priority)
-- =====================================================

CREATE TYPE notebook_entry_type AS ENUM (
    'brainstorm',
    'research',
    'design',
    'build',
    'test',
    'reflection',
    'competition'
);

CREATE TABLE notebook_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID, -- NULL for individual entries, FK added later when teams table exists

    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,

    -- Media URLs (stored on NAS)
    media_urls TEXT[],

    -- Tags for categorization
    tags TEXT[],

    entry_type notebook_entry_type NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notebook_author ON notebook_entries(author_id);
CREATE INDEX idx_notebook_team ON notebook_entries(team_id);
CREATE INDEX idx_notebook_date ON notebook_entries(entry_date);
CREATE INDEX idx_notebook_type ON notebook_entries(entry_type);
CREATE INDEX idx_notebook_tags ON notebook_entries USING GIN(tags);

-- =====================================================
-- TEAMS & MEMBERS (Lower Priority)
-- =====================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., "6502A", "6502B"
    season_year VARCHAR(20) NOT NULL, -- e.g., "2024-2025"

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(100), -- "Driver", "Builder", "Programmer", etc.

    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(team_id, user_id, left_at)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Now add the foreign key to notebook_entries
ALTER TABLE notebook_entries
    ADD CONSTRAINT fk_notebook_team
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- =====================================================
-- PRACTICE SESSIONS (Lower Priority)
-- =====================================================

CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    session_date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_practice_sessions_team ON practice_sessions(team_id);
CREATE INDEX idx_practice_sessions_date ON practice_sessions(session_date);

-- Session rotations (station tracking)
CREATE TABLE session_rotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    station VARCHAR(100) NOT NULL, -- "Building", "Programming", "Driving", "Documentation"
    start_time TIME NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_rotations_session ON session_rotations(session_id);
CREATE INDEX idx_session_rotations_student ON session_rotations(student_id);

-- =====================================================
-- COMPETITION TRACKING (Lowest Priority)
-- =====================================================

CREATE TABLE competition_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    event_name VARCHAR(500) NOT NULL,
    event_date DATE NOT NULL,
    score INTEGER,
    ranking INTEGER,

    -- Awards
    awards TEXT[],

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_competition_team ON competition_results(team_id);
CREATE INDEX idx_competition_date ON competition_results(event_date);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- Data retention log (for compliance)
CREATE TABLE data_retention_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'scheduled', 'purged', 'extended'
    retention_date DATE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_by UUID REFERENCES users(id),
    notes TEXT
);

CREATE INDEX idx_retention_log_user ON data_retention_log(user_id);
CREATE INDEX idx_retention_log_date ON data_retention_log(retention_date);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_steps_updated_at BEFORE UPDATE ON lesson_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON student_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_skills_updated_at BEFORE UPDATE ON student_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notebook_updated_at BEFORE UPDATE ON notebook_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON practice_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_updated_at BEFORE UPDATE ON competition_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Migration 001: Initial schema created successfully' AS status;
