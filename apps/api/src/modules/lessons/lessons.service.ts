import { DatabaseService } from '../../config/database';
import {
  Lesson,
  LessonStep,
  StudentLessonProgress,
  LessonCategory,
  GradeLevel,
  UserRole,
  LessonProgressStatus,
  PaginatedResponse,
} from '@stemlab/shared-types';

/**
 * LessonsService - Business logic for lessons and learning content
 */
export class LessonsService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new lesson (Coach/Admin only)
   */
  async createLesson(data: {
    title: string;
    category: LessonCategory;
    grade_level: GradeLevel;
    duration_minutes: number;
    content: any;
    media_urls?: string[];
    learning_objectives: string[];
    published?: boolean;
    display_order?: number;
    created_by: string;
  }): Promise<Lesson> {
    const {
      title,
      category,
      grade_level,
      duration_minutes,
      content,
      media_urls,
      learning_objectives,
      published = false,
      display_order = 0,
      created_by,
    } = data;

    const query = `
      INSERT INTO lessons (
        title, category, grade_level, duration_minutes,
        content, media_urls, learning_objectives,
        published, display_order, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      title,
      category,
      grade_level,
      duration_minutes,
      JSON.stringify(content),
      media_urls || [],
      learning_objectives,
      published,
      display_order,
      created_by,
    ];

    const result = await this.db.query<Lesson>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to create lesson');
    }

    return result.rows[0];
  }

  /**
   * Get lessons with filters and pagination
   */
  async getLessons(options: {
    userRole: UserRole;
    category?: LessonCategory;
    grade_level?: GradeLevel;
    published?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Lesson>> {
    const {
      userRole,
      category,
      grade_level,
      published,
      page = 1,
      limit = 20,
    } = options;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Students can only see published lessons
    if (userRole === UserRole.STUDENT) {
      conditions.push(`published = true`);
    }

    // Apply filters
    if (category !== undefined) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    if (grade_level !== undefined) {
      conditions.push(`grade_level = $${paramIndex++}`);
      values.push(grade_level);
    }

    if (published !== undefined && userRole !== UserRole.STUDENT) {
      conditions.push(`published = $${paramIndex++}`);
      values.push(published);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get lessons
    const query = `
      SELECT *
      FROM lessons
      ${whereClause}
      ORDER BY display_order ASC, created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    const result = await this.db.query<Lesson>(query, values);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM lessons
      ${whereClause}
    `;

    const countResult = await this.db.query<{ total: string }>(
      countQuery,
      values.slice(0, -2) // Remove limit and offset from values
    );

    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(lessonId: string): Promise<Lesson> {
    const query = 'SELECT * FROM lessons WHERE id = $1';
    const result = await this.db.query<Lesson>(query, [lessonId]);

    if (result.rows.length === 0) {
      throw new Error('Lesson not found');
    }

    return result.rows[0];
  }

  /**
   * Update lesson (Coach/Admin only)
   */
  async updateLesson(
    lessonId: string,
    data: Partial<{
      title: string;
      category: LessonCategory;
      grade_level: GradeLevel;
      duration_minutes: number;
      content: any;
      media_urls: string[];
      learning_objectives: string[];
      published: boolean;
      display_order: number;
    }>
  ): Promise<Lesson> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }

    if (data.grade_level !== undefined) {
      fields.push(`grade_level = $${paramIndex++}`);
      values.push(data.grade_level);
    }

    if (data.duration_minutes !== undefined) {
      fields.push(`duration_minutes = $${paramIndex++}`);
      values.push(data.duration_minutes);
    }

    if (data.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(JSON.stringify(data.content));
    }

    if (data.media_urls !== undefined) {
      fields.push(`media_urls = $${paramIndex++}`);
      values.push(data.media_urls);
    }

    if (data.learning_objectives !== undefined) {
      fields.push(`learning_objectives = $${paramIndex++}`);
      values.push(data.learning_objectives);
    }

    if (data.published !== undefined) {
      fields.push(`published = $${paramIndex++}`);
      values.push(data.published);
    }

    if (data.display_order !== undefined) {
      fields.push(`display_order = $${paramIndex++}`);
      values.push(data.display_order);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(lessonId);

    const query = `
      UPDATE lessons
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query<Lesson>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Lesson not found');
    }

    return result.rows[0];
  }

  /**
   * Delete lesson (Coach/Admin only)
   */
  async deleteLesson(lessonId: string): Promise<void> {
    const query = 'DELETE FROM lessons WHERE id = $1 RETURNING id';
    const result = await this.db.query(query, [lessonId]);

    if (result.rows.length === 0) {
      throw new Error('Lesson not found');
    }
  }

  /**
   * Publish or unpublish lesson
   */
  async publishLesson(lessonId: string, published: boolean): Promise<Lesson> {
    const query = `
      UPDATE lessons
      SET published = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.db.query<Lesson>(query, [published, lessonId]);

    if (result.rows.length === 0) {
      throw new Error('Lesson not found');
    }

    return result.rows[0];
  }

  // =====================================================
  // LESSON STEPS
  // =====================================================

  /**
   * Create a lesson step
   */
  async createLessonStep(data: {
    lesson_id: string;
    step_number: number;
    title: string;
    content: any;
    interactive_elements?: any;
    assessment_questions?: any;
  }): Promise<LessonStep> {
    const {
      lesson_id,
      step_number,
      title,
      content,
      interactive_elements,
      assessment_questions,
    } = data;

    const query = `
      INSERT INTO lesson_steps (
        lesson_id, step_number, title, content,
        interactive_elements, assessment_questions
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      lesson_id,
      step_number,
      title,
      JSON.stringify(content),
      interactive_elements ? JSON.stringify(interactive_elements) : null,
      assessment_questions ? JSON.stringify(assessment_questions) : null,
    ];

    const result = await this.db.query<LessonStep>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to create lesson step');
    }

    return result.rows[0];
  }

  /**
   * Get all steps for a lesson
   */
  async getLessonSteps(lessonId: string): Promise<LessonStep[]> {
    const query = `
      SELECT *
      FROM lesson_steps
      WHERE lesson_id = $1
      ORDER BY step_number ASC
    `;

    const result = await this.db.query<LessonStep>(query, [lessonId]);
    return result.rows;
  }

  /**
   * Update a lesson step
   */
  async updateLessonStep(
    lessonId: string,
    stepId: string,
    data: Partial<{
      title: string;
      content: any;
      interactive_elements: any;
      assessment_questions: any;
    }>
  ): Promise<LessonStep> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(JSON.stringify(data.content));
    }

    if (data.interactive_elements !== undefined) {
      fields.push(`interactive_elements = $${paramIndex++}`);
      values.push(JSON.stringify(data.interactive_elements));
    }

    if (data.assessment_questions !== undefined) {
      fields.push(`assessment_questions = $${paramIndex++}`);
      values.push(JSON.stringify(data.assessment_questions));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(stepId, lessonId);

    const query = `
      UPDATE lesson_steps
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex++} AND lesson_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query<LessonStep>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Step not found');
    }

    return result.rows[0];
  }

  /**
   * Delete a lesson step
   */
  async deleteLessonStep(lessonId: string, stepId: string): Promise<void> {
    const query = `
      DELETE FROM lesson_steps
      WHERE id = $1 AND lesson_id = $2
      RETURNING id
    `;

    const result = await this.db.query(query, [stepId, lessonId]);

    if (result.rows.length === 0) {
      throw new Error('Step not found');
    }
  }

  // =====================================================
  // STUDENT PROGRESS
  // =====================================================

  /**
   * Start a lesson (create progress record)
   */
  async startLesson(
    studentId: string,
    lessonId: string
  ): Promise<StudentLessonProgress> {
    // Check if progress already exists
    const existingQuery = `
      SELECT * FROM student_lesson_progress
      WHERE student_id = $1 AND lesson_id = $2
    `;
    const existing = await this.db.query(existingQuery, [studentId, lessonId]);

    if (existing.rows.length > 0) {
      throw new Error('Progress already exists for this lesson');
    }

    const query = `
      INSERT INTO student_lesson_progress (
        student_id, lesson_id, status, progress_percent,
        current_step, started_at, time_spent_minutes
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING *
    `;

    const values = [
      studentId,
      lessonId,
      LessonProgressStatus.IN_PROGRESS,
      0,
      1,
      0,
    ];

    const result = await this.db.query<StudentLessonProgress>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to create progress record');
    }

    return result.rows[0];
  }

  /**
   * Get student progress for a specific lesson
   */
  async getStudentProgress(
    studentId: string,
    lessonId: string
  ): Promise<StudentLessonProgress> {
    const query = `
      SELECT *
      FROM student_lesson_progress
      WHERE student_id = $1 AND lesson_id = $2
    `;

    const result = await this.db.query<StudentLessonProgress>(query, [
      studentId,
      lessonId,
    ]);

    if (result.rows.length === 0) {
      throw new Error('Progress not found');
    }

    return result.rows[0];
  }

  /**
   * Update student progress
   */
  async updateProgress(
    studentId: string,
    lessonId: string,
    data: {
      progress_percent?: number;
      current_step?: number;
      time_spent_minutes?: number;
      notes?: string;
    }
  ): Promise<StudentLessonProgress> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.progress_percent !== undefined) {
      fields.push(`progress_percent = $${paramIndex++}`);
      values.push(data.progress_percent);
    }

    if (data.current_step !== undefined) {
      fields.push(`current_step = $${paramIndex++}`);
      values.push(data.current_step);
    }

    if (data.time_spent_minutes !== undefined) {
      fields.push(`time_spent_minutes = $${paramIndex++}`);
      values.push(data.time_spent_minutes);
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(studentId, lessonId);

    const query = `
      UPDATE student_lesson_progress
      SET ${fields.join(', ')}
      WHERE student_id = $${paramIndex++} AND lesson_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query<StudentLessonProgress>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Progress not found');
    }

    return result.rows[0];
  }

  /**
   * Complete a lesson
   */
  async completeLesson(
    studentId: string,
    lessonId: string
  ): Promise<StudentLessonProgress> {
    const query = `
      UPDATE student_lesson_progress
      SET status = $1, progress_percent = $2, completed_at = NOW()
      WHERE student_id = $3 AND lesson_id = $4
      RETURNING *
    `;

    const values = [
      LessonProgressStatus.COMPLETED,
      100,
      studentId,
      lessonId,
    ];

    const result = await this.db.query<StudentLessonProgress>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Progress not found');
    }

    return result.rows[0];
  }

  /**
   * Get all progress for a student
   */
  async getAllStudentProgress(
    studentId: string
  ): Promise<StudentLessonProgress[]> {
    const query = `
      SELECT *
      FROM student_lesson_progress
      WHERE student_id = $1
      ORDER BY updated_at DESC
    `;

    const result = await this.db.query<StudentLessonProgress>(query, [studentId]);
    return result.rows;
  }
}
