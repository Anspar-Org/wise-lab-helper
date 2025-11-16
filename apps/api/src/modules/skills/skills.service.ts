import { DatabaseService } from '../../config/database';
import {
  Skill,
  StudentSkill,
  SkillCategory,
  SkillLevel,
  GradeLevel,
} from '@stemlab/shared-types';

/**
 * Skills Service
 *
 * Handles all skills and assessment operations including:
 * - Skills library management (CRUD)
 * - Student skill assessments
 * - Student skill profiles
 * - Skill progress tracking
 */
export class SkillsService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new skill in the skills library
   *
   * @param data - Skill data
   * @returns Created skill
   */
  async createSkill(data: {
    name: string;
    category: SkillCategory;
    description: string;
    grade_level: GradeLevel;
  }): Promise<Skill> {
    // Validate inputs
    if (!data.name || data.name.length < 1 || data.name.length > 200) {
      throw new Error('Name must be between 1 and 200 characters');
    }

    if (!data.description || data.description.length < 1 || data.description.length > 2000) {
      throw new Error('Description must be between 1 and 2000 characters');
    }

    if (!Object.values(SkillCategory).includes(data.category)) {
      throw new Error('Invalid skill category');
    }

    if (!Object.values(GradeLevel).includes(data.grade_level)) {
      throw new Error('Invalid grade level');
    }

    const result = await this.db.query<Skill>(
      `INSERT INTO skills (name, category, description, grade_level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.category, data.description, data.grade_level]
    );

    return result.rows[0];
  }

  /**
   * Update an existing skill
   *
   * @param skillId - Skill ID
   * @param data - Partial skill data to update
   * @returns Updated skill or null if not found
   */
  async updateSkill(
    skillId: string,
    data: {
      name?: string;
      category?: SkillCategory;
      description?: string;
      grade_level?: GradeLevel;
    }
  ): Promise<Skill | null> {
    // Validate inputs if provided
    if (data.name !== undefined && (data.name.length < 1 || data.name.length > 200)) {
      throw new Error('Name must be between 1 and 200 characters');
    }

    if (data.description !== undefined && (data.description.length < 1 || data.description.length > 2000)) {
      throw new Error('Description must be between 1 and 2000 characters');
    }

    if (data.category !== undefined && !Object.values(SkillCategory).includes(data.category)) {
      throw new Error('Invalid skill category');
    }

    if (data.grade_level !== undefined && !Object.values(GradeLevel).includes(data.grade_level)) {
      throw new Error('Invalid grade level');
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (data.grade_level !== undefined) {
      updates.push(`grade_level = $${paramIndex++}`);
      values.push(data.grade_level);
    }

    if (updates.length === 0) {
      // No updates provided, just return the existing skill
      return this.getSkillById(skillId);
    }

    values.push(skillId);

    const result = await this.db.query<Skill>(
      `UPDATE skills
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get a skill by ID
   *
   * @param skillId - Skill ID
   * @returns Skill or null if not found
   */
  async getSkillById(skillId: string): Promise<Skill | null> {
    const result = await this.db.query<Skill>(
      `SELECT * FROM skills WHERE id = $1`,
      [skillId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * List skills with optional filters
   *
   * @param filters - Optional filters for category and grade level
   * @returns Array of skills
   */
  async listSkills(filters: {
    category?: SkillCategory;
    grade_level?: GradeLevel;
  }): Promise<Skill[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(filters.category);
    }

    if (filters.grade_level) {
      conditions.push(`grade_level = $${paramIndex++}`);
      values.push(filters.grade_level);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query<Skill>(
      `SELECT * FROM skills ${whereClause} ORDER BY category, name`,
      values
    );

    return result.rows;
  }

  /**
   * Delete a skill
   *
   * @param skillId - Skill ID
   * @throws Error if skill not found
   */
  async deleteSkill(skillId: string): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM skills WHERE id = $1`,
      [skillId]
    );

    if (result.rowCount === 0) {
      throw new Error('Skill not found');
    }
  }

  /**
   * Assess a student's skill level
   * Creates a new assessment or updates existing one
   *
   * @param data - Assessment data
   * @returns Created or updated assessment
   */
  async assessStudentSkill(data: {
    student_id: string;
    skill_id: string;
    level: SkillLevel;
    evidence_notes?: string;
    assessed_by: string;
  }): Promise<StudentSkill> {
    // Validate inputs
    if (!data.assessed_by || data.assessed_by.trim() === '') {
      throw new Error('assessed_by is required');
    }

    if (!Object.values(SkillLevel).includes(data.level)) {
      throw new Error('Invalid skill level');
    }

    if (data.evidence_notes && data.evidence_notes.length > 2000) {
      throw new Error('Evidence notes must not exceed 2000 characters');
    }

    // Check if assessment already exists
    const existingResult = await this.db.query<StudentSkill>(
      `SELECT * FROM student_skills
       WHERE student_id = $1 AND skill_id = $2`,
      [data.student_id, data.skill_id]
    );

    if (existingResult.rows.length > 0) {
      // Update existing assessment
      const result = await this.db.query<StudentSkill>(
        `UPDATE student_skills
         SET level = $1,
             evidence_notes = $2,
             assessed_by = $3,
             assessed_at = CURRENT_TIMESTAMP
         WHERE student_id = $4 AND skill_id = $5
         RETURNING *`,
        [
          data.level,
          data.evidence_notes || null,
          data.assessed_by,
          data.student_id,
          data.skill_id,
        ]
      );

      return result.rows[0];
    } else {
      // Create new assessment
      const result = await this.db.query<StudentSkill>(
        `INSERT INTO student_skills (
          student_id,
          skill_id,
          level,
          evidence_notes,
          assessed_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          data.student_id,
          data.skill_id,
          data.level,
          data.evidence_notes || null,
          data.assessed_by,
        ]
      );

      return result.rows[0];
    }
  }

  /**
   * Get a student's complete skill profile
   *
   * @param studentId - Student ID
   * @returns Array of assessments with skill details
   */
  async getStudentSkillProfile(studentId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT
         ss.id,
         ss.student_id,
         ss.skill_id,
         s.name as skill_name,
         s.category as skill_category,
         s.description as skill_description,
         s.grade_level as skill_grade_level,
         ss.level,
         ss.evidence_notes,
         ss.assessed_by,
         ss.assessed_at,
         ss.created_at,
         ss.updated_at
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = $1
       ORDER BY s.category, s.name`,
      [studentId]
    );

    return result.rows;
  }

  /**
   * Get a student's skill profile grouped by category
   *
   * @param studentId - Student ID
   * @returns Object with assessments grouped by category
   */
  async getStudentSkillProfileByCategory(studentId: string): Promise<Record<SkillCategory, any[]>> {
    const profile = await this.getStudentSkillProfile(studentId);

    const grouped: Record<SkillCategory, any[]> = {
      [SkillCategory.ENGINEERING_PROCESS]: [],
      [SkillCategory.TEAMWORK]: [],
      [SkillCategory.RESEARCH]: [],
      [SkillCategory.TECHNICAL]: [],
      [SkillCategory.PRESENTATION]: [],
    };

    profile.forEach(assessment => {
      grouped[assessment.skill_category].push(assessment);
    });

    return grouped;
  }

  /**
   * Get all students assessed for a particular skill
   *
   * @param skillId - Skill ID
   * @returns Array of assessments with student details
   */
  async getSkillStudents(skillId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT
         ss.id,
         ss.student_id,
         u.display_name as student_name,
         u.grade_level as student_grade_level,
         ss.skill_id,
         ss.level,
         ss.evidence_notes,
         ss.assessed_by,
         ss.assessed_at
       FROM student_skills ss
       JOIN users u ON ss.student_id = u.id
       WHERE ss.skill_id = $1
       ORDER BY u.display_name`,
      [skillId]
    );

    return result.rows;
  }

  /**
   * Get skill progress history for a student
   * Note: Currently the schema has a UNIQUE constraint on (student_id, skill_id),
   * so this will only return the latest assessment. To track history, we would need
   * a separate assessment_history table. For now, this returns the current assessment.
   *
   * @param studentId - Student ID
   * @param skillId - Skill ID
   * @returns Array of historical assessments
   */
  async getSkillProgressHistory(studentId: string, skillId: string): Promise<any[]> {
    // Note: This query assumes there's an assessment history tracking mechanism
    // Since the current schema only keeps the latest assessment per student/skill,
    // we'll return it in an array format for consistency with the expected interface
    const result = await this.db.query(
      `SELECT
         id,
         student_id,
         skill_id,
         level,
         evidence_notes,
         assessed_by,
         assessed_at,
         created_at
       FROM student_skills
       WHERE student_id = $1 AND skill_id = $2
       ORDER BY assessed_at ASC`,
      [studentId, skillId]
    );

    return result.rows;
  }
}
