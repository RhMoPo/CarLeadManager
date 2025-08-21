import { storage } from '../storage';
import { type Lead } from '@shared/schema';

class CommissionService {
  async createCommissionForLead(lead: Lead) {
    // Check if commission already exists
    const existingCommission = await storage.getCommissionByLead(lead.id);
    if (existingCommission) {
      return existingCommission;
    }

    // Skip commission creation if no VA is assigned
    if (!lead.vaId) {
      console.log('No VA assigned to lead, skipping commission creation');
      return null;
    }

    // Get commission percentage from settings
    const commissionSetting = await storage.getSetting('commissionPercent');
    const commissionRate = parseFloat(commissionSetting?.value || '0.10');

    const profit = parseFloat(lead.estimatedProfit);
    const commissionAmount = Math.max(0, profit * commissionRate);

    const commission = await storage.createCommission({
      leadId: lead.id,
      vaId: lead.vaId,
      amount: commissionAmount.toString(),
      isDue: true,
      isPaid: false,
    });

    return commission;
  }

  async recalculateCommission(leadId: string) {
    const lead = await storage.getLead(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const commission = await storage.getCommissionByLead(leadId);
    if (!commission || commission.isPaid) {
      return; // Don't recalculate paid commissions
    }

    const commissionSetting = await storage.getSetting('commissionPercent');
    const commissionRate = parseFloat(commissionSetting?.value || '0.10');

    const profit = parseFloat(lead.estimatedProfit);
    const newAmount = Math.max(0, profit * commissionRate);

    await storage.updateCommission(commission.id, {
      amount: newAmount.toString(),
    });
  }

  async exportCommissionsCSV(): Promise<string> {
    const commissions = await storage.getDueCommissions();
    
    const headers = ['Lead ID', 'VA Name', 'Commission Amount', 'Status', 'Created Date'];
    const rows = [headers.join(',')];

    for (const commission of commissions) {
      const lead = await storage.getLead(commission.leadId);
      const va = await storage.getVa(commission.vaId);
      
      const row = [
        commission.leadId,
        va?.name || 'Unknown',
        `$${commission.amount}`,
        commission.isPaid ? 'Paid' : 'Due',
        commission.createdAt.toISOString().split('T')[0],
      ];
      
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }
}

export const commissionService = new CommissionService();
