import { DatabaseService } from '../../config/database';
import {
  Badge,
  BadgeCategory,
  BadgeCriteria,
  BadgeEvent,
  BadgeProgress,
  CreateBadgeRequest,
  UpdateBadgeRequest,
  StudentBadge,
} from '@stemlab/shared-types';
import { BadgeCriteriaEvaluator } from './badge-criteria';

/**
 * Badges Service
 *
 * Manages badge definitions, awards, and auto-awarding logic.
 * Supports:
 * - Badge CRUD operations
 * - Auto-awarding based on criteria
 * - Manual badge awards by coaches
 * - Progress tracking toward badges
 */
export class BadgesService {
  private criteriaEvaluator: BadgeCriteriaEvaluator;

  constructor(private db: DatabaseService) {
    this.criteriaEvaluator = new BadgeCriteriaEvaluator(db);
  }

  /**
   * Create a new badge
   *
   * @param data - Badge creation data
   * @returns Created badge
   */
  async createBadge(data: CreateBadgeRequest): Promise<Badge> {
    // Validate input
    this.validateBadgeData(data);

    const query = `
      INSERT INTO badges (name, description, icon, category, criteria)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.db.query<Badge>(query, [
      data.name,
      data.description,
      data.icon || null,
      data.category,
      JSON.stringify(data.criteria),
    ]);

    return result.rows[0];
  }

  /**
   * Get all badges, optionally filtered by category
   *
   * @param category - Optional category filter
   * @returns Array of badges
   */
  async getAllBadges(category?: BadgeCategory): Promise<Badge[]> {
    let query = `SELECT * FROM badges`;
    const params: any[] = [];

    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
    }

    query += ` ORDER BY category, name`;

    const result = await this.db.query<Badge>(query, params);
    return result.rows;
  }

  /**
   * Get badge by ID
   *
   * @param badgeId - Badge ID
   * @returns Badge or null if not found
   */
  async getBadgeById(badgeId: string): Promise<Badge | null> {
    const query = `SELECT * FROM badges WHERE id = $1`;
    const result = await this.db.query<Badge>(query, [badgeId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update a badge
   *
   * @param badgeId - Badge ID
   * @param data - Update data
   * @returns Updated badge
   */
  async updateBadge(badgeId: string, data: UpdateBadgeRequest): Promise<Badge> {
    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      if (data.name.length < 1 || data.name.length > 200) {
        throw new Error('Name must be between 1 and 200 characters');
      }
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }

    if (data.description !== undefined) {
      if (data.description.length < 1 || data.description.length > 1000) {
        throw new Error('Description must be between 1 and 1000 characters');
      }
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }

    if (data.icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`);
      params.push(data.icon);
    }

    if (data.category !== undefined) {
      if (!Object.values(BadgeCategory).includes(data.category)) {
        throw new Error('Invalid badge category');
      }
      updates.push(`category = $${paramIndex++}`);
      params.push(data.category);
    }

    if (data.criteria !== undefined) {
      this.validateCriteria(data.criteria);
      updates.push(`criteria = $${paramIndex++}`);
      params.push(JSON.stringify(data.criteria));
    }

    if (updates.length === 0) {
      throw new Error('No update data provided');
    }

    params.push(badgeId);

    const query = `
      UPDATE badges
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query<Badge>(query, params);

    if (result.rows.length === 0) {
      throw new Error('Badge not found');
    }

    return result.rows[0];
  }

  /**
   * Delete a badge
   *
   * @param badgeId - Badge ID
   */
  async deleteBadge(badgeId: string): Promise<void> {
    const query = `DELETE FROM badges WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [badgeId]);

    if (result.rows.length === 0) {
      throw new Error('Badge not found');
    }
  }

  /**
   * Check and award badges to a student based on an event
   *
   * @param studentId - Student ID
   * @param event - Event that triggered the check
   * @returns Array of newly awarded badges
   */
  async checkAndAwardBadges(studentId: string, event: BadgeEvent): Promise<Badge[]> {
    // Get all badges student hasn't earned yet
    const availableBadges = await this.getAvailableBadges(studentId);

    const earnedBadges: Badge[] = [];

    for (const badge of availableBadges) {
      try {
        const earned = await this.evaluateCriteria(studentId, badge.criteria);

        if (earned) {
          // Award the badge
          await this.awardBadge(studentId, badge.id, event);
          earnedBadges.push(badge);
        }
      } catch (error) {
        console.error(`Error evaluating badge ${badge.id}:`, error);
        // Continue checking other badges
      }
    }

    return earnedBadges;
  }

  /**
   * Evaluate if a student meets badge criteria
   *
   * @param studentId - Student ID
   * @param criteria - Badge criteria
   * @returns true if criteria met
   */
  async evaluateCriteria(studentId: string, criteria: BadgeCriteria): Promise<boolean> {
    return this.criteriaEvaluator.evaluate(studentId, criteria);
  }

  /**
   * Award a badge to a student
   *
   * @param studentId - Student ID
   * @param badgeId - Badge ID
   * @param event - Event that triggered the award (optional)
   */
  private async awardBadge(
    studentId: string,
    badgeId: string,
    event?: BadgeEvent
  ): Promise<StudentBadge> {
    let evidenceType: string | null = null;
    let evidenceId: string | null = null;

    if (event) {
      switch (event.type) {
        case 'lesson_completion':
          evidenceType = 'lesson';
          evidenceId = event.lesson_id || null;
          break;
        case 'skill_assessment':
          evidenceType = 'skill_assessment';
          evidenceId = event.skill_id || null;
          break;
        case 'notebook_entry':
          evidenceType = 'notebook_entry';
          evidenceId = event.notebook_entry_id || null;
          break;
      }
    }

    const query = `
      INSERT INTO student_badges (student_id, badge_id, evidence_type, evidence_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    try {
      const result = await this.db.query<StudentBadge>(query, [
        studentId,
        badgeId,
        evidenceType,
        evidenceId,
      ]);

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        // Duplicate badge award - silently ignore
        throw new Error('Badge already awarded to this student');
      }
      throw error;
    }
  }

  /**
   * Get badges earned by a student
   *
   * @param studentId - Student ID
   * @returns Array of earned badges with earned_at timestamp
   */
  async getStudentBadges(studentId: string): Promise<any[]> {
    const query = `
      SELECT
        b.id,
        b.name,
        b.description,
        b.icon,
        b.category,
        b.criteria,
        sb.earned_at,
        sb.evidence_type,
        sb.evidence_id
      FROM student_badges sb
      JOIN badges b ON sb.badge_id = b.id
      WHERE sb.student_id = $1
      ORDER BY sb.earned_at DESC
    `;

    const result = await this.db.query(query, [studentId]);
    return result.rows;
  }

  /**
   * Get progress toward a specific badge
   *
   * @param studentId - Student ID
   * @param badgeId - Badge ID
   * @returns Progress information
   */
  async getBadgeProgress(studentId: string, badgeId: string): Promise<BadgeProgress> {
    const badge = await this.getBadgeById(badgeId);

    if (!badge) {
      throw new Error('Badge not found');
    }

    const progress = await this.criteriaEvaluator.getProgress(studentId, badge.criteria);

    return {
      badge_id: badgeId,
      ...progress,
    };
  }

  /**
   * Manually award a badge to a student (coach action)
   *
   * @param studentId - Student ID
   * @param badgeId - Badge ID
   * @param coachId - Coach ID who is awarding
   * @param evidence - Optional evidence information
   * @returns Awarded student badge
   */
  async manualAward(
    studentId: string,
    badgeId: string,
    coachId: string,
    evidence?: { type: string; id: string }
  ): Promise<StudentBadge> {
    const query = `
      INSERT INTO student_badges (student_id, badge_id, evidence_type, evidence_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    try {
      const result = await this.db.query<StudentBadge>(query, [
        studentId,
        badgeId,
        evidence?.type || null,
        evidence?.id || null,
      ]);

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('Badge already awarded to this student');
      }
      throw error;
    }
  }

  /**
   * Get badges that a student has not yet earned
   *
   * @param studentId - Student ID
   * @returns Array of available badges
   */
  async getAvailableBadges(studentId: string): Promise<Badge[]> {
    const query = `
      SELECT * FROM badges b
      WHERE NOT EXISTS (
        SELECT 1 FROM student_badges sb
        WHERE sb.badge_id = b.id
          AND sb.student_id = $1
      )
      ORDER BY b.category, b.name
    `;

    const result = await this.db.query<Badge>(query, [studentId]);
    return result.rows;
  }

  /**
   * Validate badge data
   *
   * @param data - Badge data to validate
   */
  private validateBadgeData(data: CreateBadgeRequest): void {
    // Validate name
    if (!data.name || data.name.length < 1 || data.name.length > 200) {
      throw new Error('Name must be between 1 and 200 characters');
    }

    // Validate description
    if (!data.description || data.description.length < 1 || data.description.length > 1000) {
      throw new Error('Description must be between 1 and 1000 characters');
    }

    // Validate category
    if (!Object.values(BadgeCategory).includes(data.category)) {
      throw new Error('Invalid badge category');
    }

    // Validate criteria
    this.validateCriteria(data.criteria);
  }

  /**
   * Validate badge criteria
   *
   * @param criteria - Criteria to validate
   */
  private validateCriteria(criteria: BadgeCriteria): void {
    const validTypes = [
      'lesson_count',
      'skill_level',
      'notebook_count',
      'specific_lesson',
      'time_spent',
      'streak',
      'custom',
    ];

    if (!validTypes.includes(criteria.type)) {
      throw new Error('Invalid criteria type');
    }

    // Type-specific validation
    switch (criteria.type) {
      case 'lesson_count':
        if (!criteria.requirements.count || criteria.requirements.count < 1) {
          throw new Error('lesson_count requires positive count');
        }
        break;
      case 'skill_level':
        if (!criteria.requirements.skill_category || !criteria.requirements.level) {
          throw new Error('skill_level requires skill_category and level');
        }
        break;
      case 'notebook_count':
        if (!criteria.requirements.minimum || criteria.requirements.minimum < 1) {
          throw new Error('notebook_count requires positive minimum');
        }
        break;
      case 'specific_lesson':
        if (!criteria.requirements.lesson_id) {
          throw new Error('specific_lesson requires lesson_id');
        }
        break;
      case 'time_spent':
        if (!criteria.requirements.minutes || criteria.requirements.minutes < 1) {
          throw new Error('time_spent requires positive minutes');
        }
        break;
      case 'streak':
        if (!criteria.requirements.days || criteria.requirements.days < 1) {
          throw new Error('streak requires positive days');
        }
        break;
      case 'custom':
        if (!criteria.requirements.custom_check) {
          throw new Error('custom requires custom_check function name');
        }
        break;
    }
  }
}
