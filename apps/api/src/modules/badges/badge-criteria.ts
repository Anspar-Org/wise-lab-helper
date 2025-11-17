import { DatabaseService } from '../../config/database';
import { BadgeCriteria, SkillLevel } from '@stemlab/shared-types';

/**
 * Badge Criteria Evaluator
 *
 * Evaluates whether a student has met the criteria for a badge.
 * Supports various criteria types:
 * - lesson_count: Complete N lessons (optionally filtered by category)
 * - skill_level: Reach a certain skill level in a category
 * - notebook_count: Create N notebook entries (optionally filtered by type)
 * - specific_lesson: Complete a specific lesson
 * - time_spent: Spend N minutes on lessons
 * - streak: Complete lessons N days in a row
 * - custom: Custom evaluation logic
 */
export class BadgeCriteriaEvaluator {
  constructor(private db: DatabaseService) {}

  /**
   * Evaluate if a student meets badge criteria
   *
   * @param studentId - Student ID
   * @param criteria - Badge criteria to evaluate
   * @returns true if criteria met, false otherwise
   */
  async evaluate(studentId: string, criteria: BadgeCriteria): Promise<boolean> {
    switch (criteria.type) {
      case 'lesson_count':
        return this.evaluateLessonCount(studentId, criteria);
      case 'skill_level':
        return this.evaluateSkillLevel(studentId, criteria);
      case 'notebook_count':
        return this.evaluateNotebookCount(studentId, criteria);
      case 'specific_lesson':
        return this.evaluateSpecificLesson(studentId, criteria);
      case 'time_spent':
        return this.evaluateTimeSpent(studentId, criteria);
      case 'streak':
        return this.evaluateStreak(studentId, criteria);
      case 'custom':
        return this.evaluateCustom(studentId, criteria);
      default:
        throw new Error(`Unknown criteria type: ${(criteria as any).type}`);
    }
  }

  /**
   * Get current progress toward badge criteria
   *
   * @param studentId - Student ID
   * @param criteria - Badge criteria
   * @returns Object with current, required, and percentage
   */
  async getProgress(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<{ current: number | null; required: number | null; percentage: number | null }> {
    switch (criteria.type) {
      case 'lesson_count':
        return this.getLessonCountProgress(studentId, criteria);
      case 'notebook_count':
        return this.getNotebookCountProgress(studentId, criteria);
      case 'time_spent':
        return this.getTimeSpentProgress(studentId, criteria);
      case 'streak':
        return this.getStreakProgress(studentId, criteria);
      case 'skill_level':
      case 'specific_lesson':
      case 'custom':
        // These criteria don't have quantifiable progress
        return { current: null, required: null, percentage: null };
      default:
        return { current: null, required: null, percentage: null };
    }
  }

  /**
   * Evaluate lesson_count criteria
   * Check if student has completed N lessons (optionally filtered by category)
   */
  private async evaluateLessonCount(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<boolean> {
    const { count, category } = criteria.requirements;

    if (!count) {
      throw new Error('lesson_count criteria requires count in requirements');
    }

    let query = `
      SELECT COUNT(*) as count
      FROM student_lesson_progress slp
    `;

    const params: any[] = [studentId];

    if (category) {
      query += `
        JOIN lessons l ON slp.lesson_id = l.id
        WHERE slp.student_id = $1
          AND slp.status = 'completed'
          AND l.category = $2
      `;
      params.push(category);
    } else {
      query += `
        WHERE slp.student_id = $1
          AND slp.status = 'completed'
      `;
    }

    const result = await this.db.query(query, params);
    const completedCount = parseInt(result.rows[0].count, 10);

    return completedCount >= count;
  }

  /**
   * Evaluate skill_level criteria
   * Check if student has reached a certain skill level in a category
   */
  private async evaluateSkillLevel(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<boolean> {
    const { skill_category, level } = criteria.requirements;

    if (!skill_category || !level) {
      throw new Error('skill_level criteria requires skill_category and level');
    }

    const query = `
      SELECT ss.level
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_id = $1
        AND s.category = $2
      ORDER BY
        CASE ss.level
          WHEN 'advanced' THEN 4
          WHEN 'proficient' THEN 3
          WHEN 'developing' THEN 2
          WHEN 'novice' THEN 1
        END DESC
      LIMIT 1
    `;

    const result = await this.db.query(query, [studentId, skill_category]);

    if (result.rows.length === 0) {
      return false;
    }

    const currentLevel = result.rows[0].level;

    // Map levels to numeric values
    const levelMap: Record<string, number> = {
      novice: 1,
      developing: 2,
      proficient: 3,
      advanced: 4,
    };

    const currentLevelValue = levelMap[currentLevel] || 0;
    const requiredLevelValue = levelMap[level] || 0;

    return currentLevelValue >= requiredLevelValue;
  }

  /**
   * Evaluate notebook_count criteria
   * Check if student has created N notebook entries (optionally filtered by type)
   */
  private async evaluateNotebookCount(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<boolean> {
    const { minimum, entry_type } = criteria.requirements;

    if (!minimum) {
      throw new Error('notebook_count criteria requires minimum in requirements');
    }

    let query = `
      SELECT COUNT(*) as count
      FROM notebook_entries
      WHERE author_id = $1
    `;

    const params: any[] = [studentId];

    if (entry_type) {
      query += ` AND entry_type = $2`;
      params.push(entry_type);
    }

    const result = await this.db.query(query, params);
    const entryCount = parseInt(result.rows[0].count, 10);

    return entryCount >= minimum;
  }

  /**
   * Evaluate specific_lesson criteria
   * Check if student has completed a specific lesson
   */
  private async evaluateSpecificLesson(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<boolean> {
    const { lesson_id } = criteria.requirements;

    if (!lesson_id) {
      throw new Error('specific_lesson criteria requires lesson_id');
    }

    const query = `
      SELECT status
      FROM student_lesson_progress
      WHERE student_id = $1
        AND lesson_id = $2
    `;

    const result = await this.db.query(query, [studentId, lesson_id]);

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].status === 'completed';
  }

  /**
   * Evaluate time_spent criteria
   * Check if student has spent N minutes on lessons
   */
  private async evaluateTimeSpent(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<boolean> {
    const { minutes } = criteria.requirements;

    if (!minutes) {
      throw new Error('time_spent criteria requires minutes in requirements');
    }

    const query = `
      SELECT COALESCE(SUM(time_spent_minutes), 0) as total_minutes
      FROM student_lesson_progress
      WHERE student_id = $1
    `;

    const result = await this.db.query(query, [studentId]);
    const totalMinutes = parseInt(result.rows[0].total_minutes, 10);

    return totalMinutes >= minutes;
  }

  /**
   * Evaluate streak criteria
   * Check if student has completed lessons N days in a row
   */
  private async evaluateStreak(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<boolean> {
    const { days } = criteria.requirements;

    if (!days) {
      throw new Error('streak criteria requires days in requirements');
    }

    // Get distinct dates when lessons were completed, ordered by date
    const query = `
      SELECT DISTINCT DATE(completed_at) as completion_date
      FROM student_lesson_progress
      WHERE student_id = $1
        AND status = 'completed'
        AND completed_at IS NOT NULL
      ORDER BY completion_date DESC
    `;

    const result = await this.db.query(query, [studentId]);

    if (result.rows.length < days) {
      return false;
    }

    // Check for consecutive days
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < result.rows.length; i++) {
      const currentDate = new Date(result.rows[i].completion_date);
      const previousDate = new Date(result.rows[i - 1].completion_date);

      const diffTime = previousDate.getTime() - currentDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak >= days;
  }

  /**
   * Evaluate custom criteria
   * Call a custom evaluation function
   */
  private async evaluateCustom(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<boolean> {
    const { custom_check } = criteria.requirements;

    if (!custom_check) {
      throw new Error('custom criteria requires custom_check function name');
    }

    // Custom evaluation logic would be implemented here
    // For now, we'll throw an error to indicate it's not implemented
    throw new Error(`Custom check '${custom_check}' not implemented`);
  }

  /**
   * Get progress for lesson_count criteria
   */
  private async getLessonCountProgress(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<{ current: number; required: number; percentage: number }> {
    const { count, category } = criteria.requirements;

    if (!count) {
      throw new Error('lesson_count criteria requires count');
    }

    let query = `
      SELECT COUNT(*) as count
      FROM student_lesson_progress slp
    `;

    const params: any[] = [studentId];

    if (category) {
      query += `
        JOIN lessons l ON slp.lesson_id = l.id
        WHERE slp.student_id = $1
          AND slp.status = 'completed'
          AND l.category = $2
      `;
      params.push(category);
    } else {
      query += `
        WHERE slp.student_id = $1
          AND slp.status = 'completed'
      `;
    }

    const result = await this.db.query(query, params);
    const current = parseInt(result.rows[0].count, 10);
    const required = count;
    const percentage = Math.min(Math.round((current / required) * 100), 100);

    return { current, required, percentage };
  }

  /**
   * Get progress for notebook_count criteria
   */
  private async getNotebookCountProgress(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<{ current: number; required: number; percentage: number }> {
    const { minimum, entry_type } = criteria.requirements;

    if (!minimum) {
      throw new Error('notebook_count criteria requires minimum');
    }

    let query = `
      SELECT COUNT(*) as count
      FROM notebook_entries
      WHERE author_id = $1
    `;

    const params: any[] = [studentId];

    if (entry_type) {
      query += ` AND entry_type = $2`;
      params.push(entry_type);
    }

    const result = await this.db.query(query, params);
    const current = parseInt(result.rows[0].count, 10);
    const required = minimum;
    const percentage = Math.min(Math.round((current / required) * 100), 100);

    return { current, required, percentage };
  }

  /**
   * Get progress for time_spent criteria
   */
  private async getTimeSpentProgress(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<{ current: number; required: number; percentage: number }> {
    const { minutes } = criteria.requirements;

    if (!minutes) {
      throw new Error('time_spent criteria requires minutes');
    }

    const query = `
      SELECT COALESCE(SUM(time_spent_minutes), 0) as total_minutes
      FROM student_lesson_progress
      WHERE student_id = $1
    `;

    const result = await this.db.query(query, [studentId]);
    const current = parseInt(result.rows[0].total_minutes, 10);
    const required = minutes;
    const percentage = Math.min(Math.round((current / required) * 100), 100);

    return { current, required, percentage };
  }

  /**
   * Get progress for streak criteria
   */
  private async getStreakProgress(
    studentId: string,
    criteria: BadgeCriteria
  ): Promise<{ current: number; required: number; percentage: number }> {
    const { days } = criteria.requirements;

    if (!days) {
      throw new Error('streak criteria requires days');
    }

    // Get distinct dates when lessons were completed
    const query = `
      SELECT DISTINCT DATE(completed_at) as completion_date
      FROM student_lesson_progress
      WHERE student_id = $1
        AND status = 'completed'
        AND completed_at IS NOT NULL
      ORDER BY completion_date DESC
    `;

    const result = await this.db.query(query, [studentId]);

    // Calculate current streak
    let currentStreak = 0;

    if (result.rows.length > 0) {
      currentStreak = 1;

      for (let i = 1; i < result.rows.length; i++) {
        const currentDate = new Date(result.rows[i].completion_date);
        const previousDate = new Date(result.rows[i - 1].completion_date);

        const diffTime = previousDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    const current = currentStreak;
    const required = days;
    const percentage = Math.min(Math.round((current / required) * 100), 100);

    return { current, required, percentage };
  }
}
