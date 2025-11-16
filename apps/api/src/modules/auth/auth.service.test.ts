import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { DatabaseService } from '../../config/database';
import { AuthType, GradeLevel, UserRole } from '@stemlab/shared-types';
import bcrypt from 'bcrypt';

// Mock the database service
vi.mock('../../config/database');

describe('AuthService', () => {
  let authService: AuthService;
  let mockDb: any;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDb = {
      query: vi.fn(),
      getClient: vi.fn(),
    };

    authService = new AuthService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('registerStudent', () => {
    it('should register student with PIN auth (Grades 3-5)', async () => {
      const studentData = {
        username: 'john_doe',
        display_name: 'John Doe',
        grade_level: GradeLevel.FOUR,
        auth_type: AuthType.PIN,
        pin: '1234',
        avatar_config: { seed: 'john_doe', style: 'adventurer' },
      };

      const mockUser = {
        id: 'mock-uuid',
        username: studentData.username,
        display_name: studentData.display_name,
        role: UserRole.STUDENT,
        grade_level: studentData.grade_level,
        auth_type: AuthType.PIN,
        avatar_config: studentData.avatar_config,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.registerStudent(studentData);

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      // Verify that the query was called with correct parameters
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO users');
      expect(queryCall[1][0]).toBe(studentData.username);
      expect(queryCall[1][1]).toBe(studentData.display_name);
      expect(queryCall[1][2]).toBe(UserRole.STUDENT);
      expect(queryCall[1][3]).toBe(studentData.grade_level);
    });

    it('should register student with animal grid auth (Grades K-2)', async () => {
      const studentData = {
        username: 'jane_doe',
        display_name: 'Jane Doe',
        grade_level: GradeLevel.K,
        auth_type: AuthType.ANIMAL_GRID,
        animal_pattern: ['dog', 'cat', 'bird', 'fish'],
        avatar_config: { seed: 'jane_doe', style: 'adventurer' },
      };

      const mockUser = {
        id: 'mock-uuid',
        username: studentData.username,
        display_name: studentData.display_name,
        role: UserRole.STUDENT,
        grade_level: studentData.grade_level,
        auth_type: AuthType.ANIMAL_GRID,
        avatar_config: studentData.avatar_config,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.registerStudent(studentData);

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should hash PIN before storing', async () => {
      const studentData = {
        username: 'test_user',
        display_name: 'Test User',
        grade_level: GradeLevel.FIVE,
        auth_type: AuthType.PIN,
        pin: '9876',
        avatar_config: { seed: 'test_user' },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'test-id', ...studentData }],
      });

      await authService.registerStudent(studentData);

      const queryCall = mockDb.query.mock.calls[0];
      const pinHashParam = queryCall[1][6]; // pin_hash parameter

      // Verify PIN was hashed
      expect(pinHashParam).toBeDefined();
      expect(pinHashParam).not.toBe('9876');
      expect(typeof pinHashParam).toBe('string');

      // Verify the hash is valid
      const isValidHash = await bcrypt.compare('9876', pinHashParam);
      expect(isValidHash).toBe(true);
    });

    it('should hash animal pattern (order-independent)', async () => {
      const studentData = {
        username: 'animal_user',
        display_name: 'Animal User',
        grade_level: GradeLevel.TWO,
        auth_type: AuthType.ANIMAL_GRID,
        animal_pattern: ['zebra', 'apple', 'moon', 'star'],
        avatar_config: { seed: 'animal_user' },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'test-id', ...studentData }],
      });

      await authService.registerStudent(studentData);

      const queryCall = mockDb.query.mock.calls[0];
      const animalHashParam = queryCall[1][7]; // animal_pattern_hash parameter

      // Verify animal pattern was hashed
      expect(animalHashParam).toBeDefined();
      expect(typeof animalHashParam).toBe('string');

      // Verify it's order-independent by hashing sorted array
      const sortedPattern = ['apple', 'moon', 'star', 'zebra'].join(',');
      const isValidHash = await bcrypt.compare(sortedPattern, animalHashParam);
      expect(isValidHash).toBe(true);
    });

    it('should calculate correct retention date for K student', async () => {
      const currentYear = new Date().getFullYear();
      const expectedRetentionYear = currentYear + 6; // K student graduates in 6 years

      const studentData = {
        username: 'k_student',
        display_name: 'K Student',
        grade_level: GradeLevel.K,
        auth_type: AuthType.ANIMAL_GRID,
        animal_pattern: ['dog', 'cat', 'bird', 'fish'],
        avatar_config: { seed: 'k_student' },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'test-id', ...studentData }],
      });

      await authService.registerStudent(studentData);

      const queryCall = mockDb.query.mock.calls[0];
      const retentionDate = queryCall[1][8]; // data_retention_date parameter

      expect(retentionDate).toBeDefined();
      const retentionYear = new Date(retentionDate).getFullYear();
      expect(retentionYear).toBe(expectedRetentionYear + 4); // Graduation + 4 years
    });

    it('should calculate correct retention date for 5th grade student', async () => {
      const currentYear = new Date().getFullYear();
      const expectedRetentionYear = currentYear + 5; // Graduate in 1 year + 4 years retention

      const studentData = {
        username: 'fifth_grader',
        display_name: 'Fifth Grader',
        grade_level: GradeLevel.FIVE,
        auth_type: AuthType.PIN,
        pin: '5555',
        avatar_config: { seed: 'fifth_grader' },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'test-id', ...studentData }],
      });

      await authService.registerStudent(studentData);

      const queryCall = mockDb.query.mock.calls[0];
      const retentionDate = queryCall[1][8]; // data_retention_date parameter

      expect(retentionDate).toBeDefined();
      const retentionYear = new Date(retentionDate).getFullYear();
      expect(retentionYear).toBe(expectedRetentionYear);
    });

    it('should reject duplicate usernames', async () => {
      const studentData = {
        username: 'duplicate_user',
        display_name: 'Duplicate User',
        grade_level: GradeLevel.THREE,
        auth_type: AuthType.PIN,
        pin: '1111',
        avatar_config: { seed: 'duplicate_user' },
      };

      // Mock a unique constraint violation
      mockDb.query.mockRejectedValueOnce({
        code: '23505', // PostgreSQL unique violation code
        constraint: 'users_username_key',
      });

      await expect(authService.registerStudent(studentData)).rejects.toThrow(
        'Username already exists'
      );
    });

    it('should validate PIN is 4 digits', async () => {
      const studentData = {
        username: 'invalid_pin',
        display_name: 'Invalid PIN',
        grade_level: GradeLevel.FOUR,
        auth_type: AuthType.PIN,
        pin: '12', // Invalid: only 2 digits
        avatar_config: { seed: 'invalid_pin' },
      };

      await expect(authService.registerStudent(studentData)).rejects.toThrow(
        'PIN must be exactly 4 digits'
      );
    });

    it('should validate animal pattern has exactly 4 animals', async () => {
      const studentData = {
        username: 'invalid_animals',
        display_name: 'Invalid Animals',
        grade_level: GradeLevel.K,
        auth_type: AuthType.ANIMAL_GRID,
        animal_pattern: ['dog', 'cat'], // Invalid: only 2 animals
        avatar_config: { seed: 'invalid_animals' },
      };

      await expect(authService.registerStudent(studentData)).rejects.toThrow(
        'Animal pattern must contain exactly 4 animals'
      );
    });

    it('should generate avatar config if not provided', async () => {
      const studentData = {
        username: 'no_avatar',
        display_name: 'No Avatar',
        grade_level: GradeLevel.THREE,
        auth_type: AuthType.PIN,
        pin: '1234',
        // No avatar_config provided
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'test-id', ...studentData }],
      });

      await authService.registerStudent(studentData);

      const queryCall = mockDb.query.mock.calls[0];
      const avatarConfigJson = queryCall[1][5]; // avatar_config parameter (stringified JSON)

      expect(avatarConfigJson).toBeDefined();
      const avatarConfig = JSON.parse(avatarConfigJson);
      expect(avatarConfig.seed).toBe(studentData.username);
    });
  });

  describe('registerStaff', () => {
    it('should register staff with password auth', async () => {
      const staffData = {
        username: 'coach_john',
        display_name: 'Coach John',
        email: 'coach.john@school.edu',
        password: 'SecurePassword123!',
        role: UserRole.COACH,
      };

      const mockUser = {
        id: 'mock-uuid',
        username: staffData.username,
        display_name: staffData.display_name,
        email: staffData.email,
        role: staffData.role,
        auth_type: AuthType.PASSWORD,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.registerStaff(staffData);

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      // Verify password was hashed
      const queryCall = mockDb.query.mock.calls[0];
      const passwordHash = queryCall[1][5]; // password_hash parameter
      expect(passwordHash).toBeDefined();
      expect(passwordHash).not.toBe(staffData.password);

      const isValidHash = await bcrypt.compare(staffData.password, passwordHash);
      expect(isValidHash).toBe(true);
    });

    it('should require email for staff', async () => {
      const staffData = {
        username: 'invalid_staff',
        display_name: 'Invalid Staff',
        email: '', // Invalid: empty email
        password: 'Password123!',
        role: UserRole.COACH,
      };

      await expect(authService.registerStaff(staffData)).rejects.toThrow(
        'Email is required for staff members'
      );
    });

    it('should validate strong password for staff', async () => {
      const staffData = {
        username: 'weak_password',
        display_name: 'Weak Password',
        email: 'weak@school.edu',
        password: '123', // Too weak
        role: UserRole.ADMIN,
      };

      await expect(authService.registerStaff(staffData)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });
  });

  describe('login', () => {
    it('should login with correct PIN', async () => {
      const pin = '1234';
      const pinHash = await bcrypt.hash(pin, 10);

      const mockUser = {
        id: 'user-id',
        username: 'test_student',
        display_name: 'Test Student',
        role: UserRole.STUDENT,
        grade_level: GradeLevel.FOUR,
        auth_type: AuthType.PIN,
        pin_hash: pinHash,
        avatar_config: { seed: 'test_student' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock finding the user
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock updating last_login
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock inserting auth token
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'token-id', expires_at: new Date(Date.now() + 86400000) }],
      });

      const result = await authService.login({
        username: 'test_student',
        auth_type: AuthType.PIN,
        pin: '1234',
      });

      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.username).toBe(mockUser.username);
      expect(result.expires_at).toBeDefined();

      // Verify last_login was updated
      expect(mockDb.query).toHaveBeenCalledTimes(3);
    });

    it('should reject incorrect PIN', async () => {
      const correctPin = '1234';
      const pinHash = await bcrypt.hash(correctPin, 10);

      const mockUser = {
        id: 'user-id',
        username: 'test_student',
        auth_type: AuthType.PIN,
        pin_hash: pinHash,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      await expect(
        authService.login({
          username: 'test_student',
          auth_type: AuthType.PIN,
          pin: '9999', // Wrong PIN
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should support order-independent animal grid login', async () => {
      // User registered with animals in one order
      const originalPattern = ['zebra', 'apple', 'moon', 'star'];
      const sortedPattern = [...originalPattern].sort().join(',');
      const animalHash = await bcrypt.hash(sortedPattern, 10);

      const mockUser = {
        id: 'user-id',
        username: 'animal_student',
        auth_type: AuthType.ANIMAL_GRID,
        animal_pattern_hash: animalHash,
        role: UserRole.STUDENT,
        grade_level: GradeLevel.K,
        avatar_config: { seed: 'animal_student' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Update last_login
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'token-id', expires_at: new Date(Date.now() + 86400000) }],
      });

      // Login with different order
      const result = await authService.login({
        username: 'animal_student',
        auth_type: AuthType.ANIMAL_GRID,
        animal_pattern: ['star', 'zebra', 'apple', 'moon'], // Different order
      });

      expect(result.token).toBeDefined();
      expect(result.user.username).toBe(mockUser.username);
    });

    it('should login staff with password', async () => {
      const password = 'SecurePassword123!';
      const passwordHash = await bcrypt.hash(password, 10);

      const mockUser = {
        id: 'staff-id',
        username: 'coach_jane',
        display_name: 'Coach Jane',
        email: 'coach.jane@school.edu',
        role: UserRole.COACH,
        auth_type: AuthType.PASSWORD,
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // Update last_login
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'token-id', expires_at: new Date(Date.now() + 86400000) }],
      });

      const result = await authService.login({
        username: 'coach_jane',
        auth_type: AuthType.PASSWORD,
        password: 'SecurePassword123!',
      });

      expect(result.token).toBeDefined();
      expect(result.user.username).toBe(mockUser.username);
    });

    it('should return JWT token with correct payload', async () => {
      const pinHash = await bcrypt.hash('1234', 10);

      const mockUser = {
        id: 'user-id',
        username: 'test_user',
        role: UserRole.STUDENT,
        auth_type: AuthType.PIN,
        pin_hash: pinHash,
        avatar_config: { seed: 'test_user' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'token-id', expires_at: new Date(Date.now() + 86400000) }],
      });

      const result = await authService.login({
        username: 'test_user',
        auth_type: AuthType.PIN,
        pin: '1234',
      });

      // Verify token structure
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');

      // Token should be a JWT (3 parts separated by dots)
      const parts = result.token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should update last_login timestamp', async () => {
      const pinHash = await bcrypt.hash('1234', 10);

      const mockUser = {
        id: 'user-id',
        username: 'test_user',
        auth_type: AuthType.PIN,
        pin_hash: pinHash,
        role: UserRole.STUDENT,
        avatar_config: { seed: 'test_user' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'token-id', expires_at: new Date(Date.now() + 86400000) }],
      });

      await authService.login({
        username: 'test_user',
        auth_type: AuthType.PIN,
        pin: '1234',
      });

      // Check that the second query updates last_login
      const updateQuery = mockDb.query.mock.calls[1];
      expect(updateQuery[0]).toContain('UPDATE users');
      expect(updateQuery[0]).toContain('last_login');
    });

    it('should reject login for non-existent user', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No user found

      await expect(
        authService.login({
          username: 'nonexistent',
          auth_type: AuthType.PIN,
          pin: '1234',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should revoke token on logout', async () => {
      const tokenId = 'token-uuid';

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: tokenId, revoked_at: new Date() }],
      });

      await authService.logout(tokenId);

      expect(mockDb.query).toHaveBeenCalledTimes(1);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('UPDATE auth_tokens');
      expect(queryCall[0]).toContain('revoked_at');
      expect(queryCall[1][0]).toBe(tokenId);
    });

    it('should handle logout of already revoked token', async () => {
      const tokenId = 'already-revoked';

      mockDb.query.mockResolvedValueOnce({ rows: [] });

      // Should not throw error
      await expect(authService.logout(tokenId)).resolves.not.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should refresh valid token', async () => {
      const oldTokenId = 'old-token-id';
      const userId = 'user-id';

      const mockToken = {
        id: oldTokenId,
        user_id: userId,
        expires_at: new Date(Date.now() + 3600000), // Expires in 1 hour
        revoked_at: null,
      };

      const mockUser = {
        id: userId,
        username: 'test_user',
        role: UserRole.STUDENT,
        auth_type: AuthType.PIN,
        avatar_config: { seed: 'test_user' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock finding the old token
      mockDb.query.mockResolvedValueOnce({ rows: [mockToken] });
      // Mock finding the user
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock revoking old token
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock creating new token
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'new-token-id', expires_at: new Date(Date.now() + 86400000) }],
      });

      const result = await authService.refreshToken(oldTokenId);

      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(userId);
      expect(mockDb.query).toHaveBeenCalledTimes(4);
    });

    it('should reject expired token refresh', async () => {
      const oldTokenId = 'expired-token-id';

      const mockToken = {
        id: oldTokenId,
        user_id: 'user-id',
        expires_at: new Date(Date.now() - 3600000), // Expired 1 hour ago
        revoked_at: null,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockToken] });

      await expect(authService.refreshToken(oldTokenId)).rejects.toThrow(
        'Token has expired'
      );
    });

    it('should reject revoked token refresh', async () => {
      const oldTokenId = 'revoked-token-id';

      const mockToken = {
        id: oldTokenId,
        user_id: 'user-id',
        expires_at: new Date(Date.now() + 3600000),
        revoked_at: new Date(), // Token was revoked
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockToken] });

      await expect(authService.refreshToken(oldTokenId)).rejects.toThrow(
        'Token has been revoked'
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const tokenId = 'valid-token-id';
      const userId = 'user-id';

      const mockToken = {
        id: tokenId,
        user_id: userId,
        expires_at: new Date(Date.now() + 3600000),
        revoked_at: null,
      };

      const mockUser = {
        id: userId,
        username: 'test_user',
        role: UserRole.STUDENT,
        auth_type: AuthType.PIN,
        avatar_config: { seed: 'test_user' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockToken] });
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.verifyToken(tokenId);

      expect(result).toEqual(mockUser);
    });

    it('should reject expired token', async () => {
      const tokenId = 'expired-token';

      const mockToken = {
        id: tokenId,
        user_id: 'user-id',
        expires_at: new Date(Date.now() - 1000), // Expired
        revoked_at: null,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockToken] });

      await expect(authService.verifyToken(tokenId)).rejects.toThrow(
        'Token has expired'
      );
    });

    it('should reject revoked token', async () => {
      const tokenId = 'revoked-token';

      const mockToken = {
        id: tokenId,
        user_id: 'user-id',
        expires_at: new Date(Date.now() + 3600000),
        revoked_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockToken] });

      await expect(authService.verifyToken(tokenId)).rejects.toThrow(
        'Token has been revoked'
      );
    });

    it('should reject non-existent token', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(authService.verifyToken('nonexistent')).rejects.toThrow(
        'Invalid token'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        username: 'test_user',
        display_name: 'Test User',
        role: UserRole.STUDENT,
        auth_type: AuthType.PIN,
        avatar_config: { seed: 'test_user' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userId]
      );
    });

    it('should return null for non-existent user', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await authService.getUserById('nonexistent');

      expect(result).toBeNull();
    });

    it('should not return sensitive fields', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        username: 'test_user',
        display_name: 'Test User',
        role: UserRole.STUDENT,
        auth_type: AuthType.PIN,
        avatar_config: { seed: 'test_user' },
        created_at: new Date(),
        updated_at: new Date(),
        // These should not be in the SELECT query
        pin_hash: undefined,
        password_hash: undefined,
        animal_pattern_hash: undefined,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.getUserById(userId);

      expect(result).toEqual(mockUser);

      // Verify the query doesn't select sensitive fields
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).not.toContain('pin_hash');
      expect(queryCall[0]).not.toContain('password_hash');
      expect(queryCall[0]).not.toContain('animal_pattern_hash');
    });
  });
});
