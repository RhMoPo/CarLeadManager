import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, requireAuth, requireRole } from "./middleware/auth";
import { rateLimiter, authRateLimiter } from "./middleware/rateLimit";
import { authService } from "./services/authService";
import { leadService } from "./services/leadService";
import { commissionService } from "./services/commissionService";
import { insertUserSchema, insertVaSchema, insertLeadSchema, insertInviteSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import { randomBytes } from "crypto";
import { logger } from "./utils/logger";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSession = ConnectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_PASSWORD || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  }));

  // Apply rate limiting
  app.use('/api', rateLimiter);
  app.use('/api/login*', authRateLimiter);

  // Auth middleware
  app.use(authMiddleware);

  // Auth routes
  app.post('/api/login-password', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      await storage.createAuditLog({
        userId: user.id,
        action: 'LOGIN',
        details: 'Password login',
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/login-magic-request', async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      await authService.sendMagicLink(email);
      res.json({ message: 'Magic link sent to your email' });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/login-magic-consume', async (req, res, next) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }

      const user = await authService.consumeMagicLink(token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      await storage.createAuditLog({
        userId: user.id,
        action: 'LOGIN',
        details: 'Magic link login',
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/logout', requireAuth, async (req, res, next) => {
    try {
      if (req.session.userId) {
        await storage.createAuditLog({
          userId: req.session.userId,
          action: 'LOGOUT',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }

      req.session.destroy((err) => {
        if (err) {
          logger.error('Session destruction error', err);
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/user', requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ id: user.id, email: user.email, role: user.role });
    } catch (error) {
      next(error);
    }
  });

  // Invite routes
  app.post('/api/invites', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const data = insertInviteSchema.parse(req.body);
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invite = await storage.createInvite({
        ...data,
        token,
        expiresAt,
        createdBy: req.session.userId!,
      });

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: 'CREATE_INVITE',
        resourceType: 'invite',
        resourceId: invite.id,
        details: `Invited ${data.email} as ${data.role}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      // TODO: Send email with invite link
      logger.info('Invite created', { inviteId: invite.id, email: data.email, role: data.role });

      res.json({ id: invite.id, email: invite.email, role: invite.role });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/invites/:token', async (req, res, next) => {
    try {
      const { token } = req.params;
      const invite = await storage.getInviteByToken(token);
      
      if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
        return res.status(404).json({ message: 'Invalid or expired invite' });
      }

      res.json({ email: invite.email, role: invite.role });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/invites/accept', async (req, res, next) => {
    try {
      const { token, email, password } = req.body;
      
      const invite = await storage.getInviteByToken(token);
      if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired invite' });
      }

      if (invite.email !== email) {
        return res.status(400).json({ message: 'Email mismatch' });
      }

      // Create user account
      const userData = {
        email,
        role: invite.role,
        passwordHash: invite.role === 'VA' ? null : await authService.hashPassword(password),
      };

      const user = await storage.createUser(userData);
      await storage.markInviteUsed(token);

      await storage.createAuditLog({
        userId: user.id,
        action: 'ACCEPT_INVITE',
        resourceType: 'user',
        resourceId: user.id,
        details: `Account created via invite as ${user.role}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      next(error);
    }
  });

  // Lead routes
  app.get('/api/leads', requireAuth, async (req, res, next) => {
    try {
      const filters = req.query;
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/leads/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      res.json(lead);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/leads', requireAuth, async (req, res, next) => {
    try {
      const data = insertLeadSchema.parse(req.body);
      
      // Check for duplicates
      const duplicate = await storage.checkDuplicateLead(data);
      if (duplicate) {
        return res.status(409).json({ 
          message: 'Duplicate lead detected',
          conflictingLeadId: duplicate.id 
        });
      }

      const lead = await leadService.createLead(data, req.session.userId!);

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: 'CREATE_LEAD',
        resourceType: 'lead',
        resourceId: lead.id,
        details: `Created lead for ${lead.year} ${lead.make} ${lead.model}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.status(201).json(lead);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/leads/:id', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const lead = await storage.updateLead(id, updates);

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: 'UPDATE_LEAD',
        resourceType: 'lead',
        resourceId: id,
        details: `Updated lead fields: ${Object.keys(updates).join(', ')}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json(lead);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/leads/:id/status', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const currentLead = await storage.getLead(id);
      if (!currentLead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      // Validate status transition
      const canTransition = leadService.canTransitionStatus(
        currentLead.status,
        status,
        req.session.userRole!
      );
      
      if (!canTransition) {
        return res.status(403).json({ 
          message: 'Status transition not allowed' 
        });
      }

      const lead = await storage.updateLead(id, { status });

      // Create event
      await storage.createLeadEvent({
        leadId: id,
        userId: req.session.userId!,
        fromStatus: currentLead.status,
        toStatus: status,
      });

      // Handle commission logic
      if (status === 'SOLD') {
        await commissionService.createCommissionForLead(lead);
      }

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: 'UPDATE_LEAD_STATUS',
        resourceType: 'lead',
        resourceId: id,
        details: `Status changed from ${currentLead.status} to ${status}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json(lead);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/leads/:id/events', requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const events = await storage.getLeadEvents(id);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  // Commission routes
  app.get('/api/commissions', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const { leadId } = req.query;
      
      if (leadId) {
        const commission = await storage.getCommissionByLead(leadId as string);
        return res.json(commission ? [commission] : []);
      }

      const commissions = await storage.getDueCommissions();
      res.json(commissions);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/commissions/mark-paid/:id', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const commission = await storage.updateCommission(id, {
        isPaid: true,
        paidAt: new Date(),
        paidBy: req.session.userId!,
      });

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: 'MARK_COMMISSION_PAID',
        resourceType: 'commission',
        resourceId: id,
        details: `Marked commission as paid: $${commission.amount}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json(commission);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/commissions/recalculate/:leadId', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const { leadId } = req.params;
      await commissionService.recalculateCommission(leadId);
      res.json({ message: 'Commission recalculated' });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/commissions/export.csv', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const csv = await commissionService.exportCommissionsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=commissions.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  });

  // KPI/Reports routes
  app.get('/api/kpis', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const kpis = await storage.getKPIs();
      const vaLeaderboard = await storage.getVALeaderboard();
      const profitByWeek = await storage.getProfitByWeek();

      res.json({
        kpis,
        vaLeaderboard,
        profitByWeek,
      });
    } catch (error) {
      next(error);
    }
  });

  // User management routes
  app.get('/api/users', requireAuth, requireRole(['SUPERADMIN']), async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/vas', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const vas = await storage.getAllVas();
      res.json(vas);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/vas', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const data = insertVaSchema.parse(req.body);
      const va = await storage.createVa(data);

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: 'CREATE_VA',
        resourceType: 'va',
        resourceId: va.id,
        details: `Created VA: ${va.name}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.status(201).json(va);
    } catch (error) {
      next(error);
    }
  });

  // Settings routes
  app.get('/api/settings', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(settingsMap);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/settings/:key', requireAuth, requireRole(['MANAGER', 'SUPERADMIN']), async (req, res, next) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      const setting = await storage.setSetting(key, value);

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: 'UPDATE_SETTING',
        resourceType: 'setting',
        resourceId: setting.id,
        details: `Updated setting ${key} to ${value}`,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json(setting);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
