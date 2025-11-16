import { z } from 'zod';
import { LessonCategory, GradeLevel } from '@stemlab/shared-types';

/**
 * Validation schemas for lessons endpoints
 * Uses Zod for runtime type validation and sanitization
 */

// Lesson category enum
const lessonCategorySchema = z.nativeEnum(LessonCategory);

// Grade level enum
const gradeLevelSchema = z.nativeEnum(GradeLevel);

// Lesson content schema (flexible JSONB structure)
const lessonContentSchema = z.object({
  introduction: z.string().optional(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    media: z.string().url().optional(),
    interactive: z.object({
      type: z.enum(['quiz', 'activity', 'video', 'sorting', 'fill_blank']),
      data: z.any(),
    }).optional(),
  })).optional(),
  summary: z.string().optional(),
}).passthrough(); // Allow additional properties

// Learning objectives validation
const learningObjectivesSchema = z
  .array(z.string().min(1))
  .min(1, 'At least one learning objective is required');

/**
 * Create lesson validation
 */
export const createLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be at most 500 characters')
    .trim(),
  category: lessonCategorySchema,
  grade_level: gradeLevelSchema,
  duration_minutes: z
    .number()
    .int('Duration must be an integer')
    .positive('Duration must be positive'),
  content: lessonContentSchema,
  media_urls: z.array(z.string().url()).optional(),
  learning_objectives: learningObjectivesSchema,
  published: z.boolean().optional().default(false),
  display_order: z.number().int().optional(),
});

/**
 * Update lesson validation (all fields optional except those that make sense to be required)
 */
export const updateLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(500, 'Title must be at most 500 characters')
    .trim()
    .optional(),
  category: lessonCategorySchema.optional(),
  grade_level: gradeLevelSchema.optional(),
  duration_minutes: z
    .number()
    .int('Duration must be an integer')
    .positive('Duration must be positive')
    .optional(),
  content: lessonContentSchema.optional(),
  media_urls: z.array(z.string().url()).optional(),
  learning_objectives: learningObjectivesSchema.optional(),
  published: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

/**
 * Get lessons query parameters
 */
export const getLessonsQuerySchema = z.object({
  category: lessonCategorySchema.optional(),
  grade_level: gradeLevelSchema.optional(),
  published: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default('20'),
});

/**
 * Lesson step validation
 */
export const createLessonStepSchema = z.object({
  step_number: z.number().int().positive(),
  title: z
    .string()
    .min(1, 'Step title is required')
    .max(500, 'Step title must be at most 500 characters')
    .trim(),
  content: z.any(), // Flexible JSONB content
  interactive_elements: z.any().optional(),
  assessment_questions: z.any().optional(),
});

/**
 * Update lesson step validation
 */
export const updateLessonStepSchema = z.object({
  title: z
    .string()
    .min(1, 'Step title cannot be empty')
    .max(500, 'Step title must be at most 500 characters')
    .trim()
    .optional(),
  content: z.any().optional(),
  interactive_elements: z.any().optional(),
  assessment_questions: z.any().optional(),
});

/**
 * Update progress validation
 */
export const updateProgressSchema = z.object({
  progress_percent: z
    .number()
    .int()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100')
    .optional(),
  current_step: z.number().int().positive().optional(),
  time_spent_minutes: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

/**
 * UUID validation for params
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid lesson ID format'),
});

export const stepIdParamSchema = z.object({
  id: z.string().uuid('Invalid lesson ID format'),
  stepId: z.string().uuid('Invalid step ID format'),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
});

/**
 * Type inference exports
 */
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type GetLessonsQuery = z.infer<typeof getLessonsQuerySchema>;
export type CreateLessonStepInput = z.infer<typeof createLessonStepSchema>;
export type UpdateLessonStepInput = z.infer<typeof updateLessonStepSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
