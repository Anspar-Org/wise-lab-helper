import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { getDatabase } from '../../config/database';
import { UserRole } from '@stemlab/shared-types';

/**
 * Extended Express Request with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: UserRole;
  };
  tokenId?: string;
}

/**
 * Authentication Middleware
 *
 * Validates JWT tokens and attaches user information to request object.
 * Protects routes that require authentication.
 */

/**
 * Authenticate user from JWT token in Authorization header
 *
 * Expects header format: "Bearer <token>"
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT
    const db = getDatabase();
    const authService = new AuthService(db);

    try {
      const payload = authService.verifyJWT(token);

      // Attach user info to request
      req.user = {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      };

      next();
    } catch (error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
    return;
  }
}

/**
 * Authorize user based on role
 *
 * Use this middleware after authenticateToken to restrict access by role.
 *
 * @param allowedRoles - Array of roles that are allowed access
 * @returns Express middleware function
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication middleware
 *
 * Attaches user info if token is present, but doesn't require it.
 * Useful for routes that have different behavior for authenticated users
 * but are also accessible to unauthenticated users.
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user info
    next();
    return;
  }

  try {
    const token = authHeader.substring(7);
    const db = getDatabase();
    const authService = new AuthService(db);

    const payload = authService.verifyJWT(token);

    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (error) {
    // Invalid token, but don't fail the request
    next();
  }
}

/**
 * Validate request data against Zod schema
 *
 * Generic middleware for validating request body, query, or params.
 *
 * @param schema - Zod schema to validate against
 * @param source - Source of data to validate ('body', 'query', or 'params')
 * @returns Express middleware function
 */
export function validateRequest(
  schema: any,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validated = schema.parse(data);

      // Replace request data with validated data
      req[source] = validated;

      next();
    } catch (error: any) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.errors || error.message,
      });
    }
  };
}
