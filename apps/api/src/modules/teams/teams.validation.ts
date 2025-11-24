import { z } from 'zod';

/**
 * Teams Validation Schemas
 *
 * Zod schemas for validating team and team member requests
 */

// Team number pattern: e.g., "6502A", "12345B", "123C"
const teamNumberPattern = /^[0-9]{3,5}[A-Z]$/;

// Season year pattern: e.g., "2024-2025"
const seasonYearPattern = /^20[0-9]{2}-20[0-9]{2}$/;

// Team member role enum
export const TeamMemberRoleSchema = z.enum(
  ['Driver', 'Builder', 'Programmer', 'Scout', 'Coach'],
  {
    errorMap: () => ({
      message: 'Role must be one of: Driver, Builder, Programmer, Scout, Coach',
    }),
  }
);

// Create Team Schema
export const CreateTeamSchema = z.object({
  team_number: z
    .string()
    .regex(teamNumberPattern, {
      message:
        'team_number must be 3-5 digits followed by a letter (e.g., "6502A", "12345B")',
    })
    .min(4, { message: 'team_number must be at least 4 characters' })
    .max(6, { message: 'team_number must be at most 6 characters' }),
  season_year: z
    .string()
    .regex(seasonYearPattern, {
      message: 'season_year must be in format YYYY-YYYY (e.g., "2024-2025")',
    })
    .refine(
      (value) => {
        const [startYear, endYear] = value.split('-').map(Number);
        return endYear === startYear + 1;
      },
      { message: 'season_year must be consecutive years (e.g., "2024-2025")' }
    ),
});

// Update Team Schema
export const UpdateTeamSchema = z
  .object({
    team_number: z
      .string()
      .regex(teamNumberPattern, {
        message:
          'team_number must be 3-5 digits followed by a letter (e.g., "6502A", "12345B")',
      })
      .min(4, { message: 'team_number must be at least 4 characters' })
      .max(6, { message: 'team_number must be at most 6 characters' })
      .optional(),
    season_year: z
      .string()
      .regex(seasonYearPattern, {
        message: 'season_year must be in format YYYY-YYYY (e.g., "2024-2025")',
      })
      .refine(
        (value) => {
          const [startYear, endYear] = value.split('-').map(Number);
          return endYear === startYear + 1;
        },
        { message: 'season_year must be consecutive years (e.g., "2024-2025")' }
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// Add Team Member Schema
export const AddTeamMemberSchema = z.object({
  user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }),
  role: TeamMemberRoleSchema,
});

// Update Team Member Role Schema
export const UpdateTeamMemberRoleSchema = z.object({
  role: TeamMemberRoleSchema,
});

// Query filters for listing teams
export const GetTeamsFiltersSchema = z.object({
  season_year: z
    .string()
    .regex(seasonYearPattern, {
      message: 'season_year must be in format YYYY-YYYY (e.g., "2024-2025")',
    })
    .optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Types inferred from schemas
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof AddTeamMemberSchema>;
export type UpdateTeamMemberRoleInput = z.infer<typeof UpdateTeamMemberRoleSchema>;
export type GetTeamsFilters = z.infer<typeof GetTeamsFiltersSchema>;
