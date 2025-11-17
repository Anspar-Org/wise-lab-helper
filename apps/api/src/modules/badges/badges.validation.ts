import { z } from 'zod';
import { BadgeCategory } from '@stemlab/shared-types';

/**
 * Validation schemas for badge endpoints
 * Uses Zod for runtime type validation and sanitization
 */

// Badge category enum
const badgeCategorySchema = z.nativeEnum(BadgeCategory);

// Badge criteria validation
const badgeCriteriaSchema = z.object({
  type: z.enum([
    'lesson_count',
    'skill_level',
    'notebook_count',
    'specific_lesson',
    'time_spent',
    'streak',
    'custom',
  ]),
  requirements: z.object({
    // For lesson_count
    count: z.number().int().positive().optional(),
    category: z.string().optional(),

    // For skill_level
    skill_category: z.string().optional(),
    level: z.enum(['proficient', 'advanced']).optional(),

    // For notebook_count
    entry_type: z.string().optional(),
    minimum: z.number().int().positive().optional(),

    // For specific_lesson
    lesson_id: z.string().uuid().optional(),

    // For time_spent
    minutes: z.number().int().positive().optional(),

    // For streak
    days: z.number().int().positive().optional(),

    // For custom
    custom_check: z.string().optional(),
  }),
});

/**
 * Create badge validation
 */
export const createBadgeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(200, 'Name must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description must be at least 1 character')
    .max(1000, 'Description must be at most 1000 characters')
    .trim(),
  icon: z
    .string()
    .min(1, 'Icon must be at least 1 character')
    .max(100, 'Icon must be at most 100 characters')
    .optional(),
  category: badgeCategorySchema,
  criteria: badgeCriteriaSchema,
});

/**
 * Update badge validation
 */
export const updateBadgeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(200, 'Name must be at most 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description must be at least 1 character')
    .max(1000, 'Description must be at most 1000 characters')
    .trim()
    .optional(),
  icon: z
    .string()
    .min(1, 'Icon must be at least 1 character')
    .max(100, 'Icon must be at most 100 characters')
    .optional(),
  category: badgeCategorySchema.optional(),
  criteria: badgeCriteriaSchema.optional(),
});

/**
 * Manual badge award validation
 */
export const awardBadgeSchema = z.object({
  badge_id: z.string().uuid('Invalid badge ID'),
  evidence_type: z
    .enum(['lesson', 'skill_assessment', 'notebook_entry', 'manual'])
    .optional(),
  evidence_id: z.string().uuid('Invalid evidence ID').optional(),
});

/**
 * Badge event validation (for auto-awarding)
 */
export const badgeEventSchema = z.object({
  type: z.enum(['lesson_completion', 'skill_assessment', 'notebook_entry', 'achievement']),
  lesson_id: z.string().uuid().optional(),
  skill_id: z.string().uuid().optional(),
  notebook_entry_id: z.string().uuid().optional(),
  achievement_type: z.string().optional(),
});

/**
 * UUID parameter validation
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
});

export const badgeIdParamSchema = z.object({
  badgeId: z.string().uuid('Invalid badge ID'),
});

/**
 * Query parameter validation
 */
export const badgeQuerySchema = z.object({
  category: badgeCategorySchema.optional(),
});

/**
 * Type inference exports
 */
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;
export type AwardBadgeInput = z.infer<typeof awardBadgeSchema>;
export type BadgeEventInput = z.infer<typeof badgeEventSchema>;
export type BadgeQueryInput = z.infer<typeof badgeQuerySchema>;
