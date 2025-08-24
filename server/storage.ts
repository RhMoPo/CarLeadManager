import { 
  users, vas, leads, leadEvents, commissions, expenses, settings, 
  auditLogs, invites, magicTokens,
  type User, type InsertUser, type Va, type InsertVa, 
  type Lead, type InsertLead, type LeadEvent, type InsertLeadEvent,
  type Commission, type InsertCommission, type Expense, type InsertExpense,
  type Setting, type AuditLog, type Invite, type InsertInvite,
  type MagicToken, type UserRole, type LeadStatus, type LeadWithVa
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, like, ilike, count, sum, isNull, gt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // VAs
  getVa(id: string): Promise<Va | undefined>;
  getVaByUserId(userId: string): Promise<Va | undefined>;
  createVa(va: InsertVa): Promise<Va>;
  updateVa(id: string, updates: Partial<Va>): Promise<Va>;
  deleteVa(id: string): Promise<void>;
  getAllVas(): Promise<Va[]>;

  // Leads
  getLead(id: string): Promise<LeadWithVa | undefined>;
  getLeads(filters?: any): Promise<LeadWithVa[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  deleteLeads(ids: string[]): Promise<void>;
  getLeadsByStatus(status: LeadStatus): Promise<Lead[]>;
  getLeadsByVa(vaId: string): Promise<LeadWithVa[]>;
  checkDuplicateLead(lead: InsertLead): Promise<Lead | null>;

  // Lead Events
  createLeadEvent(event: InsertLeadEvent): Promise<LeadEvent>;
  getLeadEvents(leadId: string): Promise<LeadEvent[]>;

  // Commissions
  getCommission(id: string): Promise<Commission | undefined>;
  getCommissionByLead(leadId: string): Promise<Commission | undefined>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommission(id: string, updates: Partial<Commission>): Promise<Commission>;
  getCommissionsByVa(vaId: string): Promise<Commission[]>;
  getDueCommissions(): Promise<Commission[]>;

  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByLead(leadId: string): Promise<Expense[]>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;

  // Audit Logs
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  getAuditLogs(filters?: any): Promise<AuditLog[]>;

  // Invites
  createInvite(invite: InsertInvite & { token: string; expiresAt: Date }): Promise<Invite>;
  getInviteByToken(token: string): Promise<Invite | undefined>;
  markInviteUsed(token: string): Promise<void>;

  // Magic Tokens
  createMagicToken(token: { token: string; userId: string; expiresAt: Date }): Promise<MagicToken>;
  getMagicToken(token: string): Promise<MagicToken | undefined>;
  markMagicTokenUsed(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      updatedAt: new Date(),
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // VAs
  async getVa(id: string): Promise<Va | undefined> {
    const [va] = await db.select().from(vas).where(eq(vas.id, id));
    return va || undefined;
  }

  async getVaByUserId(userId: string): Promise<Va | undefined> {
    const [va] = await db.select().from(vas).where(eq(vas.userId, userId));
    return va || undefined;
  }

  async createVa(insertVa: InsertVa): Promise<Va> {
    const [va] = await db.insert(vas).values({
      ...insertVa,
      updatedAt: new Date(),
    }).returning();
    return va;
  }

  async updateVa(id: string, updates: Partial<Va>): Promise<Va> {
    const [va] = await db.update(vas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vas.id, id))
      .returning();
    return va;
  }

  async deleteVa(id: string): Promise<void> {
    await db.delete(vas).where(eq(vas.id, id));
  }

  async getAllVas(): Promise<Va[]> {
    return await db.select().from(vas).orderBy(desc(vas.createdAt));
  }

  // Leads
  async getLead(id: string): Promise<LeadWithVa | undefined> {
    const [result] = await db.select({
      id: leads.id,
      vaId: leads.vaId,
      make: leads.make,
      model: leads.model,
      year: leads.year,
      mileage: leads.mileage,
      askingPrice: leads.askingPrice,
      estimatedSalePrice: leads.estimatedSalePrice,
      expensesEstimate: leads.expensesEstimate,
      estimatedProfit: leads.estimatedProfit,
      sourceUrl: leads.sourceUrl,
      normalizedSourceUrl: leads.normalizedSourceUrl,
      sellerContact: leads.sellerContact,
      status: leads.status,
      previewImageUrl: leads.previewImageUrl,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      vaName: vas.name
    }).from(leads)
      .leftJoin(vas, eq(leads.vaId, vas.id))
      .where(eq(leads.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result,
      vaName: result.vaName || 'Admin'
    };
  }

  async getLeads(filters?: any): Promise<LeadWithVa[]> {
    const conditions = [];
    
    if (filters?.status && filters.status !== 'ALL' && filters.status !== '') {
      conditions.push(eq(leads.status, filters.status));
    }
    if (filters?.vaId && filters.vaId !== 'ALL' && filters.vaId !== '') {
      conditions.push(eq(leads.vaId, filters.vaId));
    }
    if (filters?.make && filters.make !== '') {
      conditions.push(ilike(leads.make, `%${filters.make}%`));
    }
    
    let query = db.select({
      id: leads.id,
      vaId: leads.vaId,
      make: leads.make,
      model: leads.model,
      year: leads.year,
      mileage: leads.mileage,
      askingPrice: leads.askingPrice,
      estimatedSalePrice: leads.estimatedSalePrice,
      expensesEstimate: leads.expensesEstimate,
      estimatedProfit: leads.estimatedProfit,
      sourceUrl: leads.sourceUrl,
      normalizedSourceUrl: leads.normalizedSourceUrl,
      sellerContact: leads.sellerContact,
      status: leads.status,
      previewImageUrl: leads.previewImageUrl,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      vaName: vas.name
    }).from(leads)
      .leftJoin(vas, eq(leads.vaId, vas.id));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.orderBy(desc(leads.createdAt));
    
    // Map results to include proper VA name, defaulting to "Admin" for leads without VA
    return results.map(lead => ({
      ...lead,
      vaName: lead.vaName || 'Admin'
    }));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    // Calculate estimated profit
    const askingPrice = parseFloat(insertLead.askingPrice.toString());
    const salePrice = parseFloat(insertLead.estimatedSalePrice.toString());
    const expenses = parseFloat(insertLead.expensesEstimate.toString());
    const profit = Math.max(0, salePrice - askingPrice - expenses);

    const [lead] = await db.insert(leads).values({
      ...insertLead,
      estimatedProfit: profit.toString(),
      normalizedSourceUrl: this.normalizeUrl(insertLead.sourceUrl),
      updatedAt: new Date(),
    }).returning();
    return lead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    // Recalculate profit if relevant fields changed
    if (updates.askingPrice || updates.estimatedSalePrice || updates.expensesEstimate) {
      const currentLead = await this.getLead(id);
      if (currentLead) {
        const askingPrice = parseFloat((updates.askingPrice || currentLead.askingPrice).toString());
        const salePrice = parseFloat((updates.estimatedSalePrice || currentLead.estimatedSalePrice).toString());
        const expenses = parseFloat((updates.expensesEstimate || currentLead.expensesEstimate).toString());
        updates.estimatedProfit = Math.max(0, salePrice - askingPrice - expenses).toString();
      }
    }

    const [lead] = await db.update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    // Delete related records first
    await db.delete(leadEvents).where(eq(leadEvents.leadId, id));
    await db.delete(commissions).where(eq(commissions.leadId, id));
    await db.delete(expenses).where(eq(expenses.leadId, id));
    
    // Delete the lead
    await db.delete(leads).where(eq(leads.id, id));
  }

  async deleteLeads(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    
    // Delete related records first
    for (const id of ids) {
      await db.delete(leadEvents).where(eq(leadEvents.leadId, id));
      await db.delete(commissions).where(eq(commissions.leadId, id));
      await db.delete(expenses).where(eq(expenses.leadId, id));
    }
    
    // Delete the leads
    for (const id of ids) {
      await db.delete(leads).where(eq(leads.id, id));
    }
  }

  async getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
    return await db.select().from(leads)
      .where(eq(leads.status, status))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByVa(vaId: string): Promise<LeadWithVa[]> {
    const results = await db.select({
      id: leads.id,
      vaId: leads.vaId,
      make: leads.make,
      model: leads.model,
      year: leads.year,
      mileage: leads.mileage,
      askingPrice: leads.askingPrice,
      estimatedSalePrice: leads.estimatedSalePrice,
      expensesEstimate: leads.expensesEstimate,
      estimatedProfit: leads.estimatedProfit,
      sourceUrl: leads.sourceUrl,
      normalizedSourceUrl: leads.normalizedSourceUrl,
      sellerContact: leads.sellerContact,
      status: leads.status,
      previewImageUrl: leads.previewImageUrl,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      vaName: vas.name
    }).from(leads)
      .leftJoin(vas, eq(leads.vaId, vas.id))
      .where(eq(leads.vaId, vaId))
      .orderBy(desc(leads.createdAt));
    
    return results.map(lead => ({
      ...lead,
      vaName: lead.vaName || 'Admin'
    }));
  }

  async checkDuplicateLead(lead: InsertLead): Promise<Lead | null> {
    // Check for exact URL match
    if (lead.sourceUrl) {
      const normalizedUrl = this.normalizeUrl(lead.sourceUrl);
      const [existingLead] = await db.select().from(leads)
        .where(eq(leads.normalizedSourceUrl, normalizedUrl));
      if (existingLead) return existingLead;
    }


    // Fuzzy matching: same make, model and asking price within 5%
    const priceVariance = parseFloat(lead.askingPrice.toString()) * 0.05;
    const minPrice = parseFloat(lead.askingPrice.toString()) - priceVariance;
    const maxPrice = parseFloat(lead.askingPrice.toString()) + priceVariance;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [fuzzyMatch] = await db.select().from(leads)
      .where(and(
        eq(leads.make, lead.make),
        eq(leads.model, lead.model),
        gte(leads.askingPrice, minPrice.toString()),
        gte(leads.createdAt, thirtyDaysAgo)
      ));

    return fuzzyMatch || null;
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  // Lead Events
  async createLeadEvent(event: InsertLeadEvent): Promise<LeadEvent> {
    const [leadEvent] = await db.insert(leadEvents).values(event).returning();
    return leadEvent;
  }

  async getLeadEvents(leadId: string): Promise<LeadEvent[]> {
    return await db.select().from(leadEvents)
      .where(eq(leadEvents.leadId, leadId))
      .orderBy(desc(leadEvents.createdAt));
  }

  // Commissions
  async getCommission(id: string): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, id));
    return commission || undefined;
  }

  async getCommissionByLead(leadId: string): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.leadId, leadId));
    return commission || undefined;
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    const [commission] = await db.insert(commissions).values({
      ...insertCommission,
      updatedAt: new Date(),
    }).returning();
    return commission;
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const [commission] = await db.update(commissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(commissions.id, id))
      .returning();
    return commission;
  }

  async getCommissionsByVa(vaId: string): Promise<Commission[]> {
    return await db.select().from(commissions)
      .where(eq(commissions.vaId, vaId))
      .orderBy(desc(commissions.createdAt));
  }

  async getDueCommissions(): Promise<Commission[]> {
    return await db.select().from(commissions)
      .where(and(eq(commissions.isDue, true), eq(commissions.isPaid, false)))
      .orderBy(desc(commissions.createdAt));
  }

  // Expenses
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getExpensesByLead(leadId: string): Promise<Expense[]> {
    return await db.select().from(expenses)
      .where(eq(expenses.leadId, leadId))
      .orderBy(desc(expenses.createdAt));
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [setting] = await db.update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db.insert(settings).values({
        key,
        value,
        updatedAt: new Date(),
      }).returning();
      return setting;
    }
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  // Audit Logs
  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }

  async getAuditLogs(filters?: any): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(filters?.limit || 100);
  }

  // Invites
  async createInvite(invite: InsertInvite & { token: string; expiresAt: Date }): Promise<Invite> {
    const [newInvite] = await db.insert(invites).values(invite).returning();
    return newInvite;
  }

  async getInviteByToken(token: string): Promise<Invite | undefined> {
    const [invite] = await db.select().from(invites).where(eq(invites.token, token));
    return invite || undefined;
  }

  async markInviteUsed(token: string): Promise<void> {
    await db.update(invites)
      .set({ usedAt: new Date() })
      .where(eq(invites.token, token));
  }

  async getPendingInvites(): Promise<Invite[]> {
    return await db.select()
      .from(invites)
      .where(and(
        isNull(invites.usedAt),
        gt(invites.expiresAt, new Date())
      ))
      .orderBy(desc(invites.createdAt));
  }

  // Magic Tokens
  async createMagicToken(token: { token: string; userId: string; expiresAt: Date }): Promise<MagicToken> {
    const [magicToken] = await db.insert(magicTokens).values(token).returning();
    return magicToken;
  }

  async getMagicToken(token: string): Promise<MagicToken | undefined> {
    const [magicToken] = await db.select().from(magicTokens).where(eq(magicTokens.token, token));
    return magicToken || undefined;
  }

  async markMagicTokenUsed(token: string): Promise<void> {
    await db.update(magicTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicTokens.token, token));
  }

}

export const storage = new DatabaseStorage();
