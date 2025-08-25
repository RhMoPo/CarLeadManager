import { storage } from '../storage';
import { type InsertLead, type LeadStatus, type UserRole } from '@shared/schema';

class LeadService {
  async createLead(leadData: InsertLead, userId: string) {
    // Get the user to check their role
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If the user is a VA, get their VA ID and assign it to the lead
    let finalLeadData = { ...leadData };
    if (user.role === 'VA') {
      const va = await storage.getVaByUserId(userId);
      if (va) {
        finalLeadData.vaId = va.id;
      }
    }

    const lead = await storage.createLead(finalLeadData);

    // Create initial event
    await storage.createLeadEvent({
      leadId: lead.id,
      userId,
      toStatus: lead.status,
    });

    return lead;
  }


  canTransitionStatus(fromStatus: LeadStatus, toStatus: LeadStatus, userRole: UserRole): boolean {
    // VAs cannot change status
    if (userRole === 'VA') {
      return false;
    }

    // Allow most transitions for managers and superadmins
    // Only restrict certain high-level status changes by role
    
    // Only SUPERADMIN can set PAID status
    if (toStatus === 'PAID' && userRole !== 'SUPERADMIN') {
      return false;
    }
    
    // Otherwise allow all transitions for managers and superadmins
    return true;
  }
}

export const leadService = new LeadService();
