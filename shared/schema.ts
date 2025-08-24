import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  decimal, 
  timestamp, 
  boolean, 
  pgEnum,
  uuid,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["SUPERADMIN", "VA"]);
export const leadStatusEnum = pgEnum("lead_status", [
  "PENDING", 
  "APPROVED", 
  "CONTACTED", 
  "BOUGHT", 
  "SOLD", 
  "PAID", 
  "REJECTED"
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// VAs table
export const vas = pgTable("vas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  timezone: text("timezone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leads table
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vaId: uuid("va_id").references(() => vas.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  askingPrice: decimal("asking_price", { precision: 10, scale: 2 }).notNull(),
  estimatedSalePrice: decimal("estimated_sale_price", { precision: 10, scale: 2 }).notNull(),
  expensesEstimate: decimal("expenses_estimate", { precision: 10, scale: 2 }).notNull(),
  estimatedProfit: decimal("estimated_profit", { precision: 10, scale: 2 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  normalizedSourceUrl: text("normalized_source_url"),
  sellerContact: text("seller_contact").notNull(),
  location: text("location").notNull(),
  status: leadStatusEnum("status").default("PENDING").notNull(),
  previewImageUrl: text("preview_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  normalizedSourceUrlUnique: unique("normalized_source_url_unique").on(table.normalizedSourceUrl),
}));

// Lead events table
export const leadEvents = pgTable("lead_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: uuid("lead_id").references(() => leads.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  fromStatus: leadStatusEnum("from_status"),
  toStatus: leadStatusEnum("to_status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Commissions table
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: uuid("lead_id").references(() => leads.id).notNull().unique(),
  vaId: uuid("va_id").references(() => vas.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isDue: boolean("is_due").default(false).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),
  paidBy: uuid("paid_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: uuid("lead_id").references(() => leads.id).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table
export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: uuid("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Invites table
export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Magic link tokens table
export const magicTokens = pgTable("magic_tokens", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  va: one(vas),
  leads: many(leadEvents),
  auditLogs: many(auditLogs),
  commissionsPaid: many(commissions, { relationName: "paidBy" }),
  createdInvites: many(invites),
  magicTokens: many(magicTokens),
}));

export const vasRelations = relations(vas, ({ one, many }) => ({
  user: one(users, {
    fields: [vas.userId],
    references: [users.id],
  }),
  leads: many(leads),
  commissions: many(commissions),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  va: one(vas, {
    fields: [leads.vaId],
    references: [vas.id],
  }),
  events: many(leadEvents),
  commission: one(commissions),
  expenses: many(expenses),
}));

export const leadEventsRelations = relations(leadEvents, ({ one }) => ({
  lead: one(leads, {
    fields: [leadEvents.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [leadEvents.userId],
    references: [users.id],
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  lead: one(leads, {
    fields: [commissions.leadId],
    references: [leads.id],
  }),
  va: one(vas, {
    fields: [commissions.vaId],
    references: [vas.id],
  }),
  paidByUser: one(users, {
    fields: [commissions.paidBy],
    references: [users.id],
    relationName: "paidBy",
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  lead: one(leads, {
    fields: [expenses.leadId],
    references: [leads.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const invitesRelations = relations(invites, ({ one }) => ({
  createdBy: one(users, {
    fields: [invites.createdBy],
    references: [users.id],
  }),
}));

export const magicTokensRelations = relations(magicTokens, ({ one }) => ({
  user: one(users, {
    fields: [magicTokens.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVaSchema = createInsertSchema(vas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  estimatedProfit: true,
  normalizedSourceUrl: true,
  previewImageUrl: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadEventSchema = createInsertSchema(leadEvents).omit({
  id: true,
  createdAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertInviteSchema = createInsertSchema(invites).omit({
  id: true,
  token: true,
  expiresAt: true,
  usedAt: true,
  createdBy: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Va = typeof vas.$inferSelect;
export type InsertVa = z.infer<typeof insertVaSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type LeadEvent = typeof leadEvents.$inferSelect;
export type InsertLeadEvent = z.infer<typeof insertLeadEventSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Setting = typeof settings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Invite = typeof invites.$inferSelect;
export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type MagicToken = typeof magicTokens.$inferSelect;

export type UserRole = "SUPERADMIN" | "MANAGER" | "VA";
export type LeadStatus = "PENDING" | "APPROVED" | "CONTACTED" | "BOUGHT" | "SOLD" | "PAID" | "REJECTED";
