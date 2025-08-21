import { storage } from '../storage';
import { ogScraper } from './ogScraper';
import { type InsertLead, type LeadStatus, type UserRole } from '@shared/schema';

class LeadService {
  async createLead(leadData: InsertLead, userId: string) {
    const lead = await storage.createLead(leadData);

    // Fetch preview image in background
    this.fetchPreviewImage(lead.id, leadData.sourceUrl);

    // Create initial event
    await storage.createLeadEvent({
      leadId: lead.id,
      userId,
      toStatus: lead.status,
    });

    return lead;
  }

  private async fetchPreviewImage(leadId: string, sourceUrl: string) {
    try {
      const preview = await ogScraper.scrape(sourceUrl);
      if (preview.image) {
        await storage.updateLead(leadId, {
          previewImageUrl: preview.image,
        });
      }
    } catch (error) {
      // Don't fail lead creation if preview fails
      console.error('Preview image fetch failed:', error);
    }
  }

  canTransitionStatus(fromStatus: LeadStatus, toStatus: LeadStatus, userRole: UserRole): boolean {
    // VAs cannot change status
    if (userRole === 'VA') {
      return false;
    }

    const transitions: Record<LeadStatus, LeadStatus[]> = {
      PENDING: ['APPROVED', 'REJECTED'],
      APPROVED: ['PENDING', 'CONTACTED', 'REJECTED'],
      CONTACTED: ['PENDING', 'APPROVED', 'BOUGHT', 'REJECTED'],
      BOUGHT: ['SOLD'],
      SOLD: ['PAID'],
      PAID: [],
      REJECTED: ['PENDING', 'APPROVED'],
    };

    const allowedTransitions = transitions[fromStatus] || [];
    
    // Additional role-based restrictions
    if ((toStatus === 'BOUGHT' || toStatus === 'SOLD') && userRole !== 'MANAGER' && userRole !== 'SUPERADMIN') {
      return false;
    }
    
    if (toStatus === 'PAID' && userRole !== 'SUPERADMIN') {
      return false;
    }

    return allowedTransitions.includes(toStatus);
  }
}

export const leadService = new LeadService();
