import { z } from 'zod';
import { AuthType, GradeLevel, UserRole } from '@stemlab/shared-types';

/**
 * Validation schemas for authentication endpoints
 * Uses Zod for runtime type validation and sanitization
 */

// Common username validation
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(100, 'Username must be at most 100 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  );

// Display name validation
const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(200, 'Display name must be at most 200 characters')
  .trim();

// Email validation
const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be at most 255 characters')
  .toLowerCase();

// PIN validation (4 digits)
const pinSchema = z
  .string()
  .length(4, 'PIN must be exactly 4 digits')
  .regex(/^\d{4}$/, 'PIN must contain only numbers');

// Animal pattern validation (exactly 4 animals)
const animalPatternSchema = z
  .array(z.string().min(1))
  .length(4, 'Animal pattern must contain exactly 4 animals');

// Password validation (at least 8 characters)
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(255, 'Password must be at most 255 characters');

// Avatar configuration
const avatarConfigSchema = z.object({
  seed: z.string(),
  style: z.string().optional(),
  backgroundColor: z.string().optional(),
  // Allow additional properties for DiceBear customization
}).passthrough();

// Grade level enum
const gradeLevelSchema = z.nativeEnum(GradeLevel);

// Auth type enum
const authTypeSchema = z.nativeEnum(AuthType);

/**
 * Student registration validation
 */
export const registerStudentSchema = z
  .object({
    username: usernameSchema,
    display_name: displayNameSchema,
    grade_level: gradeLevelSchema,
    auth_type: z.union([
      z.literal(AuthType.PIN),
      z.literal(AuthType.ANIMAL_GRID),
    ]),
    pin: pinSchema.optional(),
    animal_pattern: animalPatternSchema.optional(),
    avatar_config: avatarConfigSchema.optional(),
  })
  .refine(
    (data) => {
      // If auth_type is PIN, pin must be provided
      if (data.auth_type === AuthType.PIN) {
        return data.pin !== undefined;
      }
      return true;
    },
    {
      message: 'PIN is required for PIN authentication',
      path: ['pin'],
    }
  )
  .refine(
    (data) => {
      // If auth_type is ANIMAL_GRID, animal_pattern must be provided
      if (data.auth_type === AuthType.ANIMAL_GRID) {
        return data.animal_pattern !== undefined;
      }
      return true;
    },
    {
      message: 'Animal pattern is required for animal grid authentication',
      path: ['animal_pattern'],
    }
  );

/**
 * Staff registration validation
 */
export const registerStaffSchema = z.object({
  username: usernameSchema,
  display_name: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.union([z.literal(UserRole.COACH), z.literal(UserRole.ADMIN)]),
});

/**
 * Login validation
 */
export const loginSchema = z
  .object({
    username: usernameSchema,
    auth_type: authTypeSchema,
    pin: pinSchema.optional(),
    animal_pattern: animalPatternSchema.optional(),
    password: passwordSchema.optional(),
  })
  .refine(
    (data) => {
      // Validate that the correct credential is provided for the auth type
      if (data.auth_type === AuthType.PIN) {
        return data.pin !== undefined;
      }
      if (data.auth_type === AuthType.ANIMAL_GRID) {
        return data.animal_pattern !== undefined;
      }
      if (data.auth_type === AuthType.PASSWORD) {
        return data.password !== undefined;
      }
      return false;
    },
    {
      message: 'Appropriate credentials must be provided for the authentication type',
      path: ['auth_type'],
    }
  );

/**
 * Avatar generation validation
 */
export const generateAvatarSchema = z.object({
  seed: z.string().min(1, 'Seed is required'),
  style: z
    .enum([
      'adventurer',
      'adventurer-neutral',
      'avataaars',
      'avataaars-neutral',
      'big-ears',
      'big-ears-neutral',
      'big-smile',
      'bottts',
      'bottts-neutral',
      'croodles',
      'croodles-neutral',
      'fun-emoji',
      'icons',
      'identicon',
      'initials',
      'lorelei',
      'lorelei-neutral',
      'micah',
      'miniavs',
      'open-peeps',
      'personas',
      'pixel-art',
      'pixel-art-neutral',
      'shapes',
      'thumbs',
    ])
    .optional()
    .default('adventurer'),
  backgroundColor: z.string().optional(),
});

/**
 * Type inference exports
 */
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterStaffInput = z.infer<typeof registerStaffSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateAvatarInput = z.infer<typeof generateAvatarSchema>;
