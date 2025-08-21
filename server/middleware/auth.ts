import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { type UserRole } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: UserRole;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Add user info to request if session exists
  if (req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user && user.isActive) {
        req.user = user;
      } else {
        // Clear invalid session
        req.session.destroy(() => {});
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Auth middleware error:', error);
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userRole || !allowedRoles.includes(req.session.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
