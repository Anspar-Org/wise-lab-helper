import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AvatarService } from './avatar.service';
import { AuthType, GradeLevel, UserRole } from '@stemlab/shared-types';

// Mock dependencies
vi.mock('./auth.service');
vi.mock('../../config/database', () => ({
  getDatabase: vi.fn(() => ({})),
}));

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;
  let statusCode: number;

  beforeEach(() => {
    // Reset response data
    responseData = null;
    statusCode = 200;

    // Create mock response object
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn((data) => {
        responseData = data;
        return mockResponse;
      }),
    };

    // Mock the status method to capture the status code
    (mockResponse.status as any).mockImplementation((code: number) => {
      statusCode = code;
      return mockResponse;
    });

    // Create mock request object
    mockRequest = {
      body: {},
      headers: {},
      user: undefined,
    };

    // Create mock auth service
    mockAuthService = {
      registerStudent: vi.fn(),
      registerStaff: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      getUserById: vi.fn(),
    };

    // Mock AuthService constructor (Vitest 4.0 requires function, not arrow function)
    vi.mocked(AuthService).mockImplementation(function() {
      return mockAuthService;
    });

    authController = new AuthController();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('registerStudent', () => {
    it('should register a student with PIN auth', async () => {
      const studentData = {
        username: 'john_doe',
        display_name: 'John Doe',
        grade_level: GradeLevel.FOUR,
        auth_type: AuthType.PIN,
        pin: '1234',
        avatar_config: { seed: 'john_doe', style: 'adventurer' },
      };

      const mockUser = {
        id: 'user-id',
        ...studentData,
        role: UserRole.STUDENT,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockAuthService.registerStudent.mockResolvedValue(mockUser);
      mockRequest.body = studentData;

      await authController.registerStudent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(201);
      expect(responseData).toEqual(mockUser);
      expect(mockAuthService.registerStudent).toHaveBeenCalledWith(studentData);
    });

    it('should return 409 for duplicate username', async () => {
      mockRequest.body = {
        username: 'duplicate',
        display_name: 'Duplicate',
        grade_level: GradeLevel.THREE,
        auth_type: AuthType.PIN,
        pin: '1234',
      };

      mockAuthService.registerStudent.mockRejectedValue(
        new Error('Username already exists')
      );

      await authController.registerStudent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(409);
      expect(responseData).toHaveProperty('error');
      expect(responseData.message).toContain('already exists');
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.body = {
        username: 'test',
        display_name: 'Test',
        grade_level: GradeLevel.FOUR,
        auth_type: AuthType.PIN,
        pin: '1234',
      };

      mockAuthService.registerStudent.mockRejectedValue(
        new Error('PIN must be exactly 4 digits')
      );

      await authController.registerStudent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(400);
      expect(responseData).toHaveProperty('error');
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
        id: 'user-id',
        username: staffData.username,
        display_name: staffData.display_name,
        email: staffData.email,
        role: staffData.role,
        auth_type: AuthType.PASSWORD,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockAuthService.registerStaff.mockResolvedValue(mockUser);
      mockRequest.body = staffData;

      await authController.registerStaff(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(201);
      expect(responseData).toEqual(mockUser);
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.body = {
        username: 'coach',
        display_name: 'Coach',
        email: 'coach@school.edu',
        password: '123',
        role: UserRole.COACH,
      };

      mockAuthService.registerStaff.mockRejectedValue(
        new Error('Password must be at least 8 characters')
      );

      await authController.registerStaff(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(400);
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const credentials = {
        username: 'test_student',
        auth_type: AuthType.PIN,
        pin: '1234',
      };

      const loginResponse = {
        token: 'jwt.token.here',
        user: {
          id: 'user-id',
          username: 'test_student',
          role: UserRole.STUDENT,
        },
        expires_at: new Date(),
      };

      mockAuthService.login.mockResolvedValue(loginResponse);
      mockRequest.body = credentials;

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(loginResponse);
    });

    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = {
        username: 'test_user',
        auth_type: AuthType.PIN,
        pin: '9999',
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(401);
      expect(responseData).toHaveProperty('error');
      expect(responseData.message).toContain('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout user and revoke token', async () => {
      mockRequest.tokenId = 'token-id';
      mockAuthService.logout.mockResolvedValue(undefined);

      await authController.logout(
        mockRequest as any,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toHaveProperty('message');
      expect(responseData.message).toContain('logged out');
    });

    it('should return 400 without token ID', async () => {
      mockRequest.tokenId = undefined;

      await authController.logout(
        mockRequest as any,
        mockResponse as Response
      );

      expect(statusCode).toBe(400);
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('refreshToken', () => {
    it('should refresh valid token', async () => {
      const refreshResponse = {
        token: 'new.jwt.token',
        user: {
          id: 'user-id',
          username: 'test_user',
          role: UserRole.STUDENT,
        },
        expires_at: new Date(),
      };

      mockRequest.tokenId = 'old-token-id';
      mockAuthService.refreshToken.mockResolvedValue(refreshResponse);

      await authController.refreshToken(
        mockRequest as any,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(refreshResponse);
    });

    it('should return 401 for expired token', async () => {
      mockRequest.tokenId = 'expired-token';
      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Token has expired')
      );

      await authController.refreshToken(
        mockRequest as any,
        mockResponse as Response
      );

      expect(statusCode).toBe(401);
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'test_user',
        display_name: 'Test User',
        role: UserRole.STUDENT,
        grade_level: GradeLevel.FOUR,
        avatar_config: { seed: 'test_user' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.user = {
        userId: 'user-id',
        username: 'test_user',
        role: UserRole.STUDENT,
      };

      mockAuthService.getUserById.mockResolvedValue(mockUser);

      await authController.getCurrentUser(
        mockRequest as any,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockUser);
    });

    it('should return 401 without authentication', async () => {
      mockRequest.user = undefined;

      await authController.getCurrentUser(
        mockRequest as any,
        mockResponse as Response
      );

      expect(statusCode).toBe(401);
      expect(responseData).toHaveProperty('error');
    });

    it('should return 404 if user not found', async () => {
      mockRequest.user = {
        userId: 'nonexistent',
        username: 'test',
        role: UserRole.STUDENT,
      };

      mockAuthService.getUserById.mockResolvedValue(null);

      await authController.getCurrentUser(
        mockRequest as any,
        mockResponse as Response
      );

      expect(statusCode).toBe(404);
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('generateAvatar', () => {
    it('should generate avatar configuration', async () => {
      mockRequest.body = {
        seed: 'test_seed',
        style: 'adventurer',
      };

      await authController.generateAvatar(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toHaveProperty('seed');
      expect(responseData).toHaveProperty('url');
      expect(responseData.seed).toBe('test_seed');
    });

    it('should return 400 for invalid style', async () => {
      mockRequest.body = {
        seed: 'test',
        style: 'invalid_style',
      };

      await authController.generateAvatar(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(400);
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('getAvatarStyles', () => {
    it('should return available avatar styles', async () => {
      await authController.getAvatarStyles(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toHaveProperty('all');
      expect(responseData).toHaveProperty('studentFriendly');
      expect(Array.isArray(responseData.all)).toBe(true);
      expect(Array.isArray(responseData.studentFriendly)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors gracefully', async () => {
      mockRequest.body = {
        username: 'test',
        display_name: 'Test',
        grade_level: GradeLevel.THREE,
        auth_type: AuthType.PIN,
        pin: '1234',
      };

      mockAuthService.registerStudent.mockRejectedValue(
        new Error('Database connection failed')
      );

      await authController.registerStudent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(500);
      expect(responseData).toHaveProperty('error');
      expect(responseData.error).toBe('Internal Server Error');
    });
  });
});
