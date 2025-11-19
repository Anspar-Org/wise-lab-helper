/**
 * Authentication and user types
 */

export type UserRole = 'student' | 'coach';
export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type AuthType = 'pin' | 'animal_grid';

export interface AvatarConfig {
  style: string;
  seed: string;
  colors?: Record<string, string>;
}

export interface User {
  id: number;
  email?: string;
  username?: string;
  name: string;
  display_name?: string;
  role: UserRole;
  grade_level?: GradeLevel;
  auth_type?: AuthType;
  avatar_url?: string;
  avatar_config?: AvatarConfig;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentLoginCredentials {
  username: string;
  auth_type: AuthType;
  pin?: string;
  animal_pattern?: string[];
}

export interface RegisterStudentRequest {
  username: string;
  display_name: string;
  grade_level: GradeLevel;
  avatar_config: AvatarConfig;
  auth_type: AuthType;
  pin?: string;
  animal_pattern?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_at?: string;
}
