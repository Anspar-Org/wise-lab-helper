/**
 * Shared TypeScript types for STEM Lab Assistant
 * These types match the PostgreSQL database schema
 */

// =====================================================
// ENUMS
// =====================================================

export enum UserRole {
  STUDENT = 'student',
  COACH = 'coach',
  ADMIN = 'admin',
}

export enum AuthType {
  PIN = 'pin',
  ANIMAL_GRID = 'animal_grid',
  PASSWORD = 'password',
}

export enum GradeLevel {
  K = 'K',
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
}

export enum LessonCategory {
  METHODOLOGY = 'methodology',
  TEAMWORK = 'teamwork',
  RESEARCH_SKILLS = 'research_skills',
  TECHNICAL = 'technical',
}

export enum LessonProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
}

export enum SkillCategory {
  ENGINEERING_PROCESS = 'engineering_process',
  TEAMWORK = 'teamwork',
  RESEARCH = 'research',
  TECHNICAL = 'technical',
  PRESENTATION = 'presentation',
}

export enum SkillLevel {
  NOVICE = 'novice',
  DEVELOPING = 'developing',
  PROFICIENT = 'proficient',
  ADVANCED = 'advanced',
}

export enum BadgeCategory {
  METHODOLOGY = 'methodology',
  SKILL = 'skill',
  ENGAGEMENT = 'engagement',
  TEAM = 'team',
}

export enum NotebookEntryType {
  BRAINSTORM = 'brainstorm',
  RESEARCH = 'research',
  DESIGN = 'design',
  BUILD = 'build',
  TEST = 'test',
  REFLECTION = 'reflection',
  COMPETITION = 'competition',
}

// =====================================================
// DATABASE MODELS
// =====================================================

export interface User {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  role: UserRole;
  grade_level?: GradeLevel;
  avatar_config?: AvatarConfig;
  auth_type: AuthType;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  data_retention_date?: Date;
}

export interface AvatarConfig {
  seed: string;
  style?: string;
  backgroundColor?: string;
  [key: string]: any; // Allow additional customization
}

export interface AuthToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at?: Date;
}

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  grade_level: GradeLevel;
  duration_minutes: number;
  content: LessonContent;
  media_urls?: string[];
  learning_objectives: string[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  published: boolean;
  display_order: number;
}

export interface LessonContent {
  introduction?: string;
  sections?: LessonSection[];
  summary?: string;
  [key: string]: any; // Flexible structure
}

export interface LessonSection {
  title: string;
  content: string;
  media?: string;
  interactive?: InteractiveElement;
}

export interface InteractiveElement {
  type: 'quiz' | 'activity' | 'video' | 'sorting' | 'fill_blank';
  data: any;
}

export interface LessonStep {
  id: string;
  lesson_id: string;
  step_number: number;
  title: string;
  content: any;
  interactive_elements?: any;
  assessment_questions?: any;
  created_at: Date;
  updated_at: Date;
}

export interface StudentLessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  progress_percent: number;
  current_step: number;
  started_at?: Date;
  completed_at?: Date;
  time_spent_minutes: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  grade_level: GradeLevel;
  created_at: Date;
  updated_at: Date;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  level: SkillLevel;
  evidence_notes?: string;
  assessed_by: string;
  assessed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: BadgeCategory;
  criteria: BadgeCriteria;
  created_at: Date;
}

export interface BadgeCriteria {
  type: 'lesson_count' | 'skill_level' | 'notebook_count' | 'specific_lesson' | 'time_spent' | 'streak' | 'custom';
  requirements: {
    // For lesson_count
    count?: number;
    category?: string;

    // For skill_level
    skill_category?: string;
    level?: 'proficient' | 'advanced';

    // For notebook_count
    entry_type?: string;
    minimum?: number;

    // For specific_lesson
    lesson_id?: string;

    // For time_spent
    minutes?: number;

    // For streak
    days?: number;

    // For custom
    custom_check?: string;
  };
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: Date;
  evidence_type?: string;
  evidence_id?: string;
}

export interface BadgeEvent {
  type: 'lesson_completion' | 'skill_assessment' | 'notebook_entry' | 'achievement';
  lesson_id?: string;
  skill_id?: string;
  notebook_entry_id?: string;
  achievement_type?: string;
}

export interface BadgeProgress {
  badge_id: string;
  current: number | null;
  required: number | null;
  percentage: number | null;
}

export interface CreateBadgeRequest {
  name: string;
  description: string;
  icon?: string;
  category: BadgeCategory;
  criteria: BadgeCriteria;
}

export interface UpdateBadgeRequest {
  name?: string;
  description?: string;
  icon?: string;
  category?: BadgeCategory;
  criteria?: BadgeCriteria;
}

export interface AwardBadgeRequest {
  badge_id: string;
  evidence_type?: string;
  evidence_id?: string;
}

export interface NotebookEntry {
  id: string;
  author_id: string;
  team_id?: string;
  entry_date: Date;
  title: string;
  content: string;
  media_urls?: string[];
  tags?: string[];
  entry_type: NotebookEntryType;
  created_at: Date;
  updated_at: Date;
}

export interface Team {
  id: string;
  team_number: string;
  season_year: string;
  created_at: Date;
  updated_at: Date;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role?: string;
  joined_at: Date;
  left_at?: Date;
}

export interface PracticeSession {
  id: string;
  team_id: string;
  session_date: Date;
  duration_minutes: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRotation {
  id: string;
  session_id: string;
  student_id: string;
  station: string;
  start_time: string;
  created_at: Date;
}

export interface CompetitionResult {
  id: string;
  team_id: string;
  event_name: string;
  event_date: Date;
  score?: number;
  ranking?: number;
  awards?: string[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface RegisterStudentRequest {
  username: string;
  display_name: string;
  grade_level: GradeLevel;
  avatar_config: AvatarConfig;
  auth_type: AuthType.PIN | AuthType.ANIMAL_GRID;
  pin?: string; // For PIN auth
  animal_pattern?: string[]; // For animal grid auth
}

export interface RegisterStaffRequest {
  username: string;
  display_name: string;
  email: string;
  password: string;
  role: UserRole.COACH | UserRole.ADMIN;
}

export interface LoginRequest {
  username: string;
  auth_type: AuthType;
  pin?: string;
  animal_pattern?: string[];
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password_hash' | 'pin_hash' | 'animal_pattern_hash'>;
  expires_at: Date;
}

export interface CreateLessonRequest {
  title: string;
  category: LessonCategory;
  grade_level: GradeLevel;
  duration_minutes: number;
  content: LessonContent;
  media_urls?: string[];
  learning_objectives: string[];
  published?: boolean;
}

export interface UpdateLessonProgressRequest {
  progress_percent: number;
  current_step?: number;
  time_spent_minutes?: number;
  notes?: string;
}

export interface AssessSkillRequest {
  student_id: string;
  skill_id: string;
  level: SkillLevel;
  evidence_notes?: string;
}

export interface CreateNotebookEntryRequest {
  title: string;
  content: string;
  entry_type: NotebookEntryType;
  team_id?: string;
  tags?: string[];
  entry_date?: Date;
}

export interface CreatePracticeSessionRequest {
  team_id: string;
  session_date: Date | string;
  duration_minutes: number;
  notes?: string;
}

export interface UpdatePracticeSessionRequest {
  session_date?: Date | string;
  duration_minutes?: number;
  notes?: string;
}

export interface CreateSessionRotationRequest {
  student_id: string;
  station: 'Building' | 'Programming' | 'Driving' | 'Documentation';
  start_time: string;
}

export interface UpdateSessionRotationRequest {
  station?: 'Building' | 'Programming' | 'Driving' | 'Documentation';
  start_time?: string;
}

export interface PracticeSessionWithRotations extends PracticeSession {
  rotations: SessionRotation[];
  rotation_count?: number;
}

export interface GetPracticeSessionsFilters {
  team_id?: string;
  date_from?: string | Date;
  date_to?: string | Date;
  page?: number;
  limit?: number;
}

// Team Management Types
export interface CreateTeamRequest {
  team_number: string;
  season_year: string;
}

export interface UpdateTeamRequest {
  team_number?: string;
  season_year?: string;
}

export interface AddTeamMemberRequest {
  user_id: string;
  role: 'Driver' | 'Builder' | 'Programmer' | 'Scout' | 'Coach';
}

export interface UpdateTeamMemberRoleRequest {
  role: 'Driver' | 'Builder' | 'Programmer' | 'Scout' | 'Coach';
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface TeamStats {
  team_id: string;
  member_count: number;
  practice_session_count: number;
  competition_count: number;
}

export interface GetTeamsFilters {
  season_year?: string;
  page?: number;
  limit?: number;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  database?: 'connected' | 'disconnected';
}
