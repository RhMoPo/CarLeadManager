export interface User {
  id: string;
  email: string;
  role: 'SUPERADMIN' | 'MANAGER' | 'VA';
}

export interface Lead {
  id: string;
  vaId: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin?: string;
  askingPrice: string;
  estimatedSalePrice: string;
  expensesEstimate: string;
  estimatedProfit: string;
  sourceUrl: string;
  sellerContact: string;
  location: string;
  status: LeadStatus;
  previewImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'CONTACTED' 
  | 'BOUGHT' 
  | 'SOLD' 
  | 'PAID' 
  | 'REJECTED';

export interface VA {
  id: string;
  userId?: string;
  name: string;
  timezone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  leadId: string;
  vaId: string;
  amount: string;
  isDue: boolean;
  isPaid: boolean;
  paidAt?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIs {
  totalLeads: number;
  approvedLeads: number;
  commissionDue: string;
  activeVAs: number;
}
