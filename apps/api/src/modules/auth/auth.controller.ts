import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AvatarService } from './avatar.service';
import { getDatabase } from '../../config/database';
import { AuthenticatedRequest } from './auth.middleware';
import {
  RegisterStudentInput,
  RegisterStaffInput,
  LoginInput,
  GenerateAvatarInput,
} from './auth.validation';

/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication endpoints.
 * All business logic is delegated to AuthService.
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    const db = getDatabase();
    this.authService = new AuthService(db);
  }

  /**
   * Register a new student
   *
   * POST /api/v1/auth/register/student
   *
   * @param req - Express request with validated RegisterStudentInput
   * @param res - Express response
   */
  async registerStudent(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as RegisterStudentInput;

      const user = await this.authService.registerStudent(data);

      res.status(201).json(user);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('must be') || error.message.includes('is required')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      console.error('Student registration error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to register student',
      });
    }
  }

  /**
   * Register a new staff member
   *
   * POST /api/v1/auth/register/staff
   *
   * @param req - Express request with validated RegisterStaffInput
   * @param res - Express response
   */
  async registerStaff(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as RegisterStaffInput;

      const user = await this.authService.registerStaff(data);

      res.status(201).json(user);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('must be') || error.message.includes('is required')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      console.error('Staff registration error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to register staff member',
      });
    }
  }

  /**
   * Login user with credentials
   *
   * POST /api/v1/auth/login
   *
   * @param req - Express request with validated LoginInput
   * @param res - Express response
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials = req.body as LoginInput;

      const loginResponse = await this.authService.login(credentials);

      res.status(200).json(loginResponse);
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid credentials',
        });
        return;
      }

      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed',
      });
    }
  }

  /**
   * Logout user by revoking token
   *
   * POST /api/v1/auth/logout
   *
   * Requires authentication
   *
   * @param req - Express request with user info
   * @param res - Express response
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.tokenId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Token ID not found',
        });
        return;
      }

      await this.authService.logout(req.tokenId);

      res.status(200).json({
        message: 'Successfully logged out',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Logout failed',
      });
    }
  }

  /**
   * Refresh authentication token
   *
   * POST /api/v1/auth/refresh
   *
   * Requires authentication
   *
   * @param req - Express request with user info
   * @param res - Express response
   */
  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.tokenId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Token ID not found',
        });
        return;
      }

      const loginResponse = await this.authService.refreshToken(req.tokenId);

      res.status(200).json(loginResponse);
    } catch (error: any) {
      if (
        error.message.includes('expired') ||
        error.message.includes('revoked') ||
        error.message.includes('Invalid token')
      ) {
        res.status(401).json({
          error: 'Unauthorized',
          message: error.message,
        });
        return;
      }

      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Token refresh failed',
      });
    }
  }

  /**
   * Get current user profile
   *
   * GET /api/v1/auth/me
   *
   * Requires authentication
   *
   * @param req - Express request with user info
   * @param res - Express response
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const user = await this.authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json(user);
    } catch (error: any) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user profile',
      });
    }
  }

  /**
   * Generate avatar configuration
   *
   * POST /api/v1/auth/avatar/generate
   *
   * @param req - Express request with validated GenerateAvatarInput
   * @param res - Express response
   */
  async generateAvatar(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as GenerateAvatarInput;

      // Validate style
      if (!AvatarService.isValidStyle(data.style || 'adventurer')) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid avatar style',
        });
        return;
      }

      const avatarConfig = AvatarService.generateAvatarConfig(
        data.seed,
        data.style,
        { backgroundColor: data.backgroundColor }
      );

      // Generate SVG data URL
      const url = AvatarService.generateAvatarDataUrl(avatarConfig);

      res.status(200).json({
        ...avatarConfig,
        url,
      });
    } catch (error: any) {
      console.error('Avatar generation error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate avatar',
      });
    }
  }

  /**
   * Get available avatar styles
   *
   * GET /api/v1/auth/avatar/styles
   *
   * @param req - Express request
   * @param res - Express response
   */
  async getAvatarStyles(_req: Request, res: Response): Promise<void> {
    try {
      const styles = AvatarService.getAvailableStyles();
      const studentFriendlyStyles = AvatarService.getStudentFriendlyStyles();

      res.status(200).json({
        all: styles,
        studentFriendly: studentFriendlyStyles,
      });
    } catch (error: any) {
      console.error('Get avatar styles error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve avatar styles',
      });
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
