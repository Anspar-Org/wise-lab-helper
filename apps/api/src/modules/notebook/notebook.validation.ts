import { z } from 'zod';
import { NotebookEntryType } from '@stemlab/shared-types';

/**
 * Validation schemas for notebook endpoints
 * Uses Zod for runtime type validation and sanitization
 */

// Entry type enum
const entryTypeSchema = z.nativeEnum(NotebookEntryType);

// Title validation (1-500 characters)
const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(500, 'Title must be at most 500 characters')
  .trim();

// Content validation (1-50000 characters)
const contentSchema = z
  .string()
  .min(1, 'Content is required')
  .max(50000, 'Content must be at most 50000 characters')
  .trim();

// Tags validation (array, each tag 1-50 characters)
const tagsSchema = z
  .array(
    z
      .string()
      .min(1, 'Tag cannot be empty')
      .max(50, 'Tag must be at most 50 characters')
      .trim()
  )
  .optional()
  .default([]);

// Entry date validation (not in future)
const entryDateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) {
    const date = new Date(arg);
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    if (date > now) {
      throw new Error('Entry date cannot be in the future');
    }

    return date;
  }
  return arg;
}, z.date().optional());

// Team ID validation (UUID or null)
const teamIdSchema = z.string().uuid().optional().nullable();

// Media URLs validation
const mediaUrlsSchema = z
  .array(z.string().url('Invalid media URL'))
  .optional()
  .default([]);

/**
 * Create notebook entry validation
 */
export const createNotebookEntrySchema = z.object({
  title: titleSchema,
  content: contentSchema,
  entry_type: entryTypeSchema,
  tags: tagsSchema,
  entry_date: entryDateSchema,
  team_id: teamIdSchema,
});

/**
 * Update notebook entry validation
 */
export const updateNotebookEntrySchema = z.object({
  title: titleSchema.optional(),
  content: contentSchema.optional(),
  entry_type: entryTypeSchema.optional(),
  tags: tagsSchema,
  entry_date: entryDateSchema,
  team_id: teamIdSchema,
});

/**
 * Query filters validation
 */
export const notebookQuerySchema = z.object({
  type: entryTypeSchema.optional(),
  tags: z
    .string()
    .transform((val) => val.split(',').map((t) => t.trim()))
    .optional(),
  team_id: z.string().uuid().optional(),
  date_from: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  date_to: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
});

/**
 * Search query validation
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(200, 'Search query must be at most 200 characters'),
  type: entryTypeSchema.optional(),
  author_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
});

/**
 * Entry ID param validation
 */
export const entryIdParamSchema = z.object({
  id: z.string().uuid('Invalid entry ID'),
});

/**
 * Media filename param validation
 */
export const mediaFilenameParamSchema = z.object({
  id: z.string().uuid('Invalid entry ID'),
  filename: z
    .string()
    .min(1, 'Filename is required')
    .regex(
      /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|mp4|mov|pdf)$/i,
      'Invalid filename format'
    ),
});

/**
 * Type inference exports
 */
export type CreateNotebookEntryInput = z.infer<
  typeof createNotebookEntrySchema
>;
export type UpdateNotebookEntryInput = z.infer<
  typeof updateNotebookEntrySchema
>;
export type NotebookQueryInput = z.infer<typeof notebookQuerySchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type EntryIdParamInput = z.infer<typeof entryIdParamSchema>;
export type MediaFilenameParamInput = z.infer<typeof mediaFilenameParamSchema>;
