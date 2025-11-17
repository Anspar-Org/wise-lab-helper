import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../../config/database';
import {
  AuthType,
  GradeLevel,
  UserRole,
  User,
  LoginResponse,
  AvatarConfig,
} from '@stemlab/shared-types';
import { AvatarService } from './avatar.service';

/**
 * Authentication Service
 *
 * Handles all authentication operations including:
 * - Student registration (PIN and Animal Grid)
 * - Staff registration (Password)
 * - Login with multiple auth methods
 * - JWT token management
 * - Data retention date calculation
 */
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly JWT_SECRET: string;
  private readonly TOKEN_EXPIRY = '24h';

  constructor(private db: DatabaseService) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'stemlab-dev-secret-change-in-production';

    if (this.JWT_SECRET === 'stemlab-dev-secret-change-in-production' && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }
  }

  /**
   * Register a new student with PIN or Animal Grid authentication
   *
   * @param data - Student registration data
   * @returns Created user object (without sensitive fields)
   */
  async registerStudent(data: {
    username: string;
    display_name: string;
    grade_level: GradeLevel;
    auth_type: AuthType.PIN | AuthType.ANIMAL_GRID;
    pin?: string;
    animal_pattern?: string[];
    avatar_config?: AvatarConfig;
  }): Promise<Omit<User, 'password_hash' | 'pin_hash' | 'animal_pattern_hash'>> {
    // Validate input based on auth type
    if (data.auth_type === AuthType.PIN) {
      if (!data.pin) {
        throw new Error('PIN is required for PIN authentication');
      }
      if (!/^\d{4}$/.test(data.pin)) {
        throw new Error('PIN must be exactly 4 digits');
      }
    }

    if (data.auth_type === AuthType.ANIMAL_GRID) {
      if (!data.animal_pattern || data.animal_pattern.length !== 4) {
        throw new Error('Animal pattern must contain exactly 4 animals');
      }
    }

    // Generate or validate avatar config
    const avatarConfig = data.avatar_config || AvatarService.generateAvatarConfig(data.username);

    // Hash the authentication credential
    let pinHash: string | undefined;
    let animalPatternHash: string | undefined;

    if (data.auth_type === AuthType.PIN && data.pin) {
      pinHash = await bcrypt.hash(data.pin, this.SALT_ROUNDS);
    }

    if (data.auth_type === AuthType.ANIMAL_GRID && data.animal_pattern) {
      // Sort animals for order-independent matching
      const sortedPattern = [...data.animal_pattern].sort().join(',');
      animalPatternHash = await bcrypt.hash(sortedPattern, this.SALT_ROUNDS);
    }

    // Calculate data retention date
    const retentionDate = this.calculateDataRetentionDate(data.grade_level);

    try {
      const result = await this.db.query<User>(
        `INSERT INTO users (
          username,
          display_name,
          role,
          grade_level,
          auth_type,
          avatar_config,
          pin_hash,
          animal_pattern_hash,
          data_retention_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, username, display_name, role, grade_level, auth_type, avatar_config, created_at, updated_at, last_login, data_retention_date`,
        [
          data.username,
          data.display_name,
          UserRole.STUDENT,
          data.grade_level,
          data.auth_type,
          JSON.stringify(avatarConfig),
          pinHash || null,
          animalPatternHash || null,
          retentionDate,
        ]
      );

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
      throw error;
    }
  }

  /**
   * Register a new staff member with password authentication
   *
   * @param data - Staff registration data
   * @returns Created user object (without password hash)
   */
  async registerStaff(data: {
    username: string;
    display_name: string;
    email: string;
    password: string;
    role: UserRole.COACH | UserRole.ADMIN;
  }): Promise<Omit<User, 'password_hash' | 'pin_hash' | 'animal_pattern_hash'>> {
    // Validate input
    if (!data.email || data.email.trim() === '') {
      throw new Error('Email is required for staff members');
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    try {
      const result = await this.db.query<User>(
        `INSERT INTO users (
          username,
          display_name,
          email,
          role,
          auth_type,
          password_hash
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, display_name, email, role, auth_type, created_at, updated_at, last_login`,
        [
          data.username,
          data.display_name,
          data.email.toLowerCase(),
          data.role,
          AuthType.PASSWORD,
          passwordHash,
        ]
      );

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
      if (error.code === '23505' && error.constraint === 'users_email_key') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Login user with appropriate credentials
   *
   * @param credentials - Login credentials
   * @returns Login response with JWT token and user data
   */
  async login(credentials: {
    username: string;
    auth_type: AuthType;
    pin?: string;
    animal_pattern?: string[];
    password?: string;
  }): Promise<LoginResponse> {
    // Find user by username
    const userResult = await this.db.query<User & {
      pin_hash?: string;
      animal_pattern_hash?: string;
      password_hash?: string;
    }>(
      `SELECT * FROM users WHERE username = $1`,
      [credentials.username]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = userResult.rows[0];

    // Verify auth type matches
    if (user.auth_type !== credentials.auth_type) {
      throw new Error('Invalid credentials');
    }

    // Verify credentials based on auth type
    let isValid = false;

    if (credentials.auth_type === AuthType.PIN) {
      if (!credentials.pin || !user.pin_hash) {
        throw new Error('Invalid credentials');
      }
      isValid = await bcrypt.compare(credentials.pin, user.pin_hash);
    } else if (credentials.auth_type === AuthType.ANIMAL_GRID) {
      if (!credentials.animal_pattern || !user.animal_pattern_hash) {
        throw new Error('Invalid credentials');
      }
      // Sort animals for order-independent comparison
      const sortedPattern = [...credentials.animal_pattern].sort().join(',');
      isValid = await bcrypt.compare(sortedPattern, user.animal_pattern_hash);
    } else if (credentials.auth_type === AuthType.PASSWORD) {
      if (!credentials.password || !user.password_hash) {
        throw new Error('Invalid credentials');
      }
      isValid = await bcrypt.compare(credentials.password, user.password_hash);
    }

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last_login
    await this.db.query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY,
    });

    // Store token hash in database
    const tokenHash = await bcrypt.hash(token, this.SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const tokenResult = await this.db.query(
      `INSERT INTO auth_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, expires_at`,
      [user.id, tokenHash, expiresAt]
    );

    // Remove sensitive fields from user object
    const { pin_hash, animal_pattern_hash, password_hash, ...safeUser } = user;

    return {
      token,
      user: safeUser,
      expires_at: tokenResult.rows[0].expires_at,
    };
  }

  /**
   * Logout user by revoking their token
   *
   * @param tokenId - Token ID to revoke
   */
  async logout(tokenId: string): Promise<void> {
    await this.db.query(
      `UPDATE auth_tokens
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [tokenId]
    );
  }

  /**
   * Refresh an existing token
   *
   * @param tokenId - Current token ID
   * @returns New login response with refreshed token
   */
  async refreshToken(tokenId: string): Promise<LoginResponse> {
    // Get existing token
    const tokenResult = await this.db.query(
      `SELECT * FROM auth_tokens WHERE id = $1`,
      [tokenId]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid token');
    }

    const existingToken = tokenResult.rows[0];

    // Check if token is expired
    if (new Date(existingToken.expires_at) < new Date()) {
      throw new Error('Token has expired');
    }

    // Check if token is revoked
    if (existingToken.revoked_at) {
      throw new Error('Token has been revoked');
    }

    // Get user
    const user = await this.getUserById(existingToken.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Revoke old token
    await this.logout(tokenId);

    // Generate new token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY,
    });

    // Store new token
    const tokenHash = await bcrypt.hash(token, this.SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newTokenResult = await this.db.query(
      `INSERT INTO auth_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, expires_at`,
      [user.id, tokenHash, expiresAt]
    );

    return {
      token,
      user,
      expires_at: newTokenResult.rows[0].expires_at,
    };
  }

  /**
   * Verify a token and return associated user
   *
   * @param tokenId - Token ID to verify
   * @returns User object if token is valid
   */
  async verifyToken(tokenId: string): Promise<Omit<User, 'password_hash' | 'pin_hash' | 'animal_pattern_hash'>> {
    // Get token from database
    const tokenResult = await this.db.query(
      `SELECT * FROM auth_tokens WHERE id = $1`,
      [tokenId]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid token');
    }

    const token = tokenResult.rows[0];

    // Check if token is expired
    if (new Date(token.expires_at) < new Date()) {
      throw new Error('Token has expired');
    }

    // Check if token is revoked
    if (token.revoked_at) {
      throw new Error('Token has been revoked');
    }

    // Get and return user
    const user = await this.getUserById(token.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get user by ID (without sensitive fields)
   *
   * @param userId - User ID
   * @returns User object or null if not found
   */
  async getUserById(
    userId: string
  ): Promise<Omit<User, 'password_hash' | 'pin_hash' | 'animal_pattern_hash'> | null> {
    const result = await this.db.query<User>(
      `SELECT id, username, display_name, email, role, grade_level,
              avatar_config, auth_type, created_at, updated_at,
              last_login, data_retention_date
       FROM users
       WHERE id = $1`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Calculate data retention date based on grade level
   *
   * Students' data is retained until 4 years after Grade 5 graduation.
   * - K student: current year + 6 years to graduate + 4 years retention = current year + 10 years
   * - 5th grade: current year + 4 years retention
   *
   * @param gradeLevel - Student's current grade level
   * @returns Data retention date
   */
  private calculateDataRetentionDate(gradeLevel: GradeLevel): Date {
    const currentYear = new Date().getFullYear();
    let yearsUntilGraduation = 0;

    switch (gradeLevel) {
      case GradeLevel.K:
        yearsUntilGraduation = 6;
        break;
      case GradeLevel.ONE:
        yearsUntilGraduation = 5;
        break;
      case GradeLevel.TWO:
        yearsUntilGraduation = 4;
        break;
      case GradeLevel.THREE:
        yearsUntilGraduation = 3;
        break;
      case GradeLevel.FOUR:
        yearsUntilGraduation = 2;
        break;
      case GradeLevel.FIVE:
        yearsUntilGraduation = 1;
        break;
    }

    // Add 4 years retention after graduation
    const retentionYear = currentYear + yearsUntilGraduation + 4;

    // Set to June 30th of the retention year (end of school year)
    return new Date(retentionYear, 5, 30); // Month is 0-indexed, so 5 = June
  }

  /**
   * Verify JWT token and extract payload
   *
   * @param token - JWT token string
   * @returns Decoded token payload
   */
  verifyJWT(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
