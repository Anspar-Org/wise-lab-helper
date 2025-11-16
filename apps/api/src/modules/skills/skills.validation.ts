import { z } from 'zod';
import { SkillCategory, SkillLevel, GradeLevel } from '@stemlab/shared-types';

/**
 * Validation schemas for Skills API using Zod
 */

// Enum validators
export const skillCategorySchema = z.enum([
  SkillCategory.ENGINEERING_PROCESS,
  SkillCategory.TEAMWORK,
  SkillCategory.RESEARCH,
  SkillCategory.TECHNICAL,
  SkillCategory.PRESENTATION,
]);

export const skillLevelSchema = z.enum([
  SkillLevel.NOVICE,
  SkillLevel.DEVELOPING,
  SkillLevel.PROFICIENT,
  SkillLevel.ADVANCED,
]);

export const gradeLevelSchema = z.enum([
  GradeLevel.K,
  GradeLevel.ONE,
  GradeLevel.TWO,
  GradeLevel.THREE,
  GradeLevel.FOUR,
  GradeLevel.FIVE,
]);

// Create Skill Schema
export const createSkillSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must not exceed 200 characters')
    .trim(),
  category: skillCategorySchema,
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),
  grade_level: gradeLevelSchema,
});

// Update Skill Schema (all fields optional)
export const updateSkillSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(200, 'Name must not exceed 200 characters')
    .trim()
    .optional(),
  category: skillCategorySchema.optional(),
  description: z
    .string()
    .min(1, 'Description must not be empty')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional(),
  grade_level: gradeLevelSchema.optional(),
});

// Assess Student Skill Schema
export const assessStudentSkillSchema = z.object({
  skill_id: z.string().uuid('Invalid skill ID'),
  level: skillLevelSchema,
  evidence_notes: z
    .string()
    .max(2000, 'Evidence notes must not exceed 2000 characters')
    .trim()
    .optional(),
});

// Update Student Skill Assessment Schema
export const updateStudentSkillAssessmentSchema = z.object({
  level: skillLevelSchema,
  evidence_notes: z
    .string()
    .max(2000, 'Evidence notes must not exceed 2000 characters')
    .trim()
    .optional(),
});

// Query parameters for listing skills
export const listSkillsQuerySchema = z.object({
  category: skillCategorySchema.optional(),
  grade_level: gradeLevelSchema.optional(),
});

// UUID parameter validation
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
});

export const skillIdParamSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID format'),
});

export const studentSkillParamsSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  skillId: z.string().uuid('Invalid skill ID format'),
});

// Type exports
export type CreateSkillRequest = z.infer<typeof createSkillSchema>;
export type UpdateSkillRequest = z.infer<typeof updateSkillSchema>;
export type AssessStudentSkillRequest = z.infer<typeof assessStudentSkillSchema>;
export type UpdateStudentSkillAssessmentRequest = z.infer<typeof updateStudentSkillAssessmentSchema>;
export type ListSkillsQuery = z.infer<typeof listSkillsQuerySchema>;
