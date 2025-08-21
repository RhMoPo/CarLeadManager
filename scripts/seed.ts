import { db } from "../server/db";
import { users } from "@shared/schema";
import { authService } from "../server/services/authService";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log('Starting seed process...');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
      process.exit(1);
    }

    // Check if superadmin already exists
    const existingSuperAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, 'SUPERADMIN'))
      .limit(1);

    if (existingSuperAdmin.length > 0) {
      console.log('Superadmin already exists, skipping creation');
      return;
    }

    // Create superadmin user
    const hashedPassword = await authService.hashPassword(adminPassword);
    
    const [newUser] = await db.insert(users).values({
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'SUPERADMIN',
      isActive: true,
    }).returning();

    console.log(`Superadmin created successfully: ${newUser.email}`);

    // Create default commission setting
    const { settings } = await import("@shared/schema");
    
    await db.insert(settings).values([
      { key: 'commissionPercent', value: '0.10' },
      { key: 'companyName', value: 'Car Lead Management Corp' },
      { key: 'defaultTimezone', value: 'UTC' },
      { key: 'sessionTimeout', value: '24' },
      { key: 'magicLinkExpiry', value: '15' },
      { key: 'notifyNewLead', value: 'true' },
      { key: 'notifyStatusChange', value: 'true' },
      { key: 'notifyCommissionDue', value: 'false' },
      { key: 'requireMFA', value: 'false' },
      { key: 'logUserActivity', value: 'true' },
    ]).onConflictDoNothing();

    console.log('Default settings created');
    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
