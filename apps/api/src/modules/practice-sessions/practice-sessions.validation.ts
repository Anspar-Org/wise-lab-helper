import { z } from 'zod';

/**
 * Practice Sessions Validation Schemas
 *
 * Zod schemas for validating practice session and rotation requests
 */

// Station enum for rotations
export const StationSchema = z.enum(['Building', 'Programming', 'Driving', 'Documentation'], {
  errorMap: () => ({ message: 'Station must be one of: Building, Programming, Driving, Documentation' }),
});

// Create Practice Session Schema
export const CreatePracticeSessionSchema = z.object({
  team_id: z.string().uuid({ message: 'team_id must be a valid UUID' }),
  session_date: z.string().datetime({ message: 'session_date must be a valid ISO 8601 date' })
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
  duration_minutes: z.number().int().positive({ message: 'duration_minutes must be a positive integer' }),
  notes: z.string().max(5000, { message: 'notes must be 5000 characters or less' }).optional(),
});

// Update Practice Session Schema
export const UpdatePracticeSessionSchema = z.object({
  session_date: z.string().datetime({ message: 'session_date must be a valid ISO 8601 date' })
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .optional(),
  duration_minutes: z.number().int().positive({ message: 'duration_minutes must be a positive integer' }).optional(),
  notes: z.string().max(5000, { message: 'notes must be 5000 characters or less' }).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Create Session Rotation Schema
export const CreateSessionRotationSchema = z.object({
  student_id: z.string().uuid({ message: 'student_id must be a valid UUID' }),
  station: StationSchema,
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'start_time must be in HH:MM or HH:MM:SS format',
  }),
});

// Update Session Rotation Schema
export const UpdateSessionRotationSchema = z.object({
  station: StationSchema.optional(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'start_time must be in HH:MM or HH:MM:SS format',
  }).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Query filters for listing practice sessions
export const GetPracticeSessionsFiltersSchema = z.object({
  team_id: z.string().uuid({ message: 'team_id must be a valid UUID' }).optional(),
  date_from: z.string().datetime({ message: 'date_from must be a valid ISO 8601 date' }).optional(),
  date_to: z.string().datetime({ message: 'date_to must be a valid ISO 8601 date' }).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Types inferred from schemas
export type CreatePracticeSessionInput = z.infer<typeof CreatePracticeSessionSchema>;
export type UpdatePracticeSessionInput = z.infer<typeof UpdatePracticeSessionSchema>;
export type CreateSessionRotationInput = z.infer<typeof CreateSessionRotationSchema>;
export type UpdateSessionRotationInput = z.infer<typeof UpdateSessionRotationSchema>;
export type GetPracticeSessionsFilters = z.infer<typeof GetPracticeSessionsFiltersSchema>;
