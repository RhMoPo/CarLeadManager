import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLeads, useUpdateLeadStatus, useDeleteLead, useDeleteLeads } from "@/hooks/use-leads";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadForm } from "@/components/leads/lead-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Eye, Edit, Car, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";
import { type Lead } from "@/lib/types";

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  CONTACTED: 'bg-blue-100 text-blue-800',
  BOUGHT: 'bg-purple-100 text-purple-800',
  SOLD: 'bg-emerald-100 text-emerald-800',
  PAID: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function LeadsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    status: '',
    vaId: '',
    make: '',
  });
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    type: 'single' | 'bulk';
    leadId?: string;
    leadName?: string;
    count?: number;
  }>({ show: false, type: 'single' });

  const { data: leads, isLoading } = useLeads(filters);
  const { data: vas = [] } = useQuery<any[]>({
    queryKey: ['/api/vas'],
    enabled: user?.role === 'SUPERADMIN',
  });
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    enabled: user?.role === 'SUPERADMIN',
  });
  const updateLeadStatusMutation = useUpdateLeadStatus();
  const deleteLeadMutation = useDeleteLead();
  const deleteLeadsMutation = useDeleteLeads();

  // Calculate commission for a lead
  const calculateCommission = (estimatedProfit: string) => {
    const commissionRate = parseFloat(settings?.commissionPercent || '0.10');
    const profit = parseFloat(estimatedProfit || '0');
    return profit * commissionRate;
  };

  // Calculate totals
  const totals = leads?.reduce((acc: { totalProfit: number; totalCommission: number }, lead: Lead) => {
    const profit = parseFloat(lead.estimatedProfit || '0');
    const commission = calculateCommission(lead.estimatedProfit);
    return {
      totalProfit: acc.totalProfit + profit,
      totalCommission: acc.totalCommission + commission,
    };
  }, { totalProfit: 0, totalCommission: 0 }) || { totalProfit: 0, totalCommission: 0 };

  if (!user) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Please log in</h2>
          <p className="text-slate-600 mt-2">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads?.map((lead: Lead) => lead.id) || []);
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    updateLeadStatusMutation.mutate({ id: leadId, status: newStatus });
  };

  const handleDeleteLead = (leadId: string, leadName: string) => {
    setDeleteConfirmation({
      show: true,
      type: 'single',
      leadId,
      leadName
    });
  };

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) return;
    
    setDeleteConfirmation({
      show: true,
      type: 'bulk',
      count: selectedLeads.length
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.type === 'single' && deleteConfirmation.leadId) {
      deleteLeadMutation.mutate(deleteConfirmation.leadId);
      setSelectedLeads(prev => prev.filter(id => id !== deleteConfirmation.leadId));
    } else if (deleteConfirmation.type === 'bulk') {
      deleteLeadsMutation.mutate(selectedLeads);
      setSelectedLeads([]);
    }
    
    setDeleteConfirmation({ show: false, type: 'single' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, type: 'single' });
  };

  return (
    <div className="flex-1 p-6" data-testid="leads-page">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Leads</h2>
            <p className="text-slate-600 mt-1">Submit new leads and manage existing submissions</p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-lead">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <LeadForm onSuccess={() => setShowCreateModal(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && user?.role === 'SUPERADMIN' && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLeads([])}
                  data-testid="button-clear-selection"
                >
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteLeadsMutation.isPending}
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteLeadsMutation.isPending ? 'Deleting...' : 'Delete Selected'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="APPROVED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Approved
                    </div>
                  </SelectItem>
                  <SelectItem value="CONTACTED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Contacted
                    </div>
                  </SelectItem>
                  <SelectItem value="BOUGHT">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Bought
                    </div>
                  </SelectItem>
                  <SelectItem value="SOLD">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Sold
                    </div>
                  </SelectItem>
                  <SelectItem value="PAID">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      Paid
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Rejected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="va-filter">VA</Label>
              <Select value={filters.vaId} onValueChange={(value) => handleFilterChange('vaId', value)}>
                <SelectTrigger data-testid="filter-va">
                  <SelectValue placeholder="All VAs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All VAs</SelectItem>
                  {vas.map((va) => (
                    <SelectItem key={va.id} value={va.id}>
                      {va.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="make-filter">Make</Label>
              <Input
                id="make-filter"
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
                placeholder="Honda, Toyota, etc."
                data-testid="filter-make"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => setFilters({ status: '', vaId: '', make: '' })}
                variant="outline" 
                className="w-full"
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLeads.length === leads?.length && leads?.length > 0}
                        onCheckedChange={handleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>VA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Asking Price</TableHead>
                    <TableHead>Est. Sale Price</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads?.map((lead: Lead) => (
                    <TableRow key={lead.id} className="hover:bg-slate-50" data-testid={`lead-row-${lead.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                          data-testid={`checkbox-${lead.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                            {lead.previewImageUrl ? (
                              <img 
                                src={lead.previewImageUrl} 
                                alt="Lead preview"
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <Car className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <button 
                              onClick={() => window.open(lead.sourceUrl, '_blank')}
                              className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-left" 
                              data-testid={`lead-vehicle-${lead.id}`}
                            >
                              {lead.year} {lead.make} {lead.model}
                            </button>
                            <div className="text-sm text-slate-500">
                              {lead.mileage.toLocaleString()} mi
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {lead.vaName || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={lead.status} 
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                          disabled={updateLeadStatusMutation.isPending}
                        >
                          <SelectTrigger 
                            className={`w-32 h-7 text-xs ${statusColors[lead.status]} border-none`}
                            data-testid={`status-select-${lead.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                Pending
                              </div>
                            </SelectItem>
                            <SelectItem value="APPROVED">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Approved
                              </div>
                            </SelectItem>
                            <SelectItem value="CONTACTED">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Contacted
                              </div>
                            </SelectItem>
                            <SelectItem value="BOUGHT">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                Bought
                              </div>
                            </SelectItem>
                            <SelectItem value="SOLD">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Sold
                              </div>
                            </SelectItem>
                            <SelectItem value="PAID">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                Paid
                              </div>
                            </SelectItem>
                            <SelectItem value="REJECTED">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                Rejected
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatCurrency(lead.askingPrice)}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(lead.estimatedSalePrice)}
                      </TableCell>
                      <TableCell className="text-emerald-600 font-medium">
                        {formatCurrency(lead.estimatedProfit)}
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {formatCurrency(calculateCommission(lead.estimatedProfit).toString())}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Link href={`/lead/${lead.id}`}>
                            <Button size="sm" variant="ghost" data-testid={`button-view-${lead.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" data-testid={`button-edit-${lead.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user?.role === 'SUPERADMIN' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteLead(lead.id, `${lead.year} ${lead.make} ${lead.model}`)}
                              disabled={deleteLeadMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              data-testid={`button-delete-${lead.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!leads || leads.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                        No leads found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Totals Bar */}
      {leads && leads.length > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 shadow-lg p-4 z-10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-8">
              <div className="text-sm text-slate-600">
                {leads.length} lead{leads.length !== 1 ? 's' : ''} displayed
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Total Profit</div>
                  <div className="text-lg font-semibold text-emerald-600" data-testid="total-profit">
                    {formatCurrency(totals.totalProfit.toString())}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Total Commission</div>
                  <div className="text-lg font-semibold text-blue-600" data-testid="total-commission">
                    {formatCurrency(totals.totalCommission.toString())}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Commission Rate</div>
                  <div className="text-sm font-medium text-slate-900">
                    {settings?.commissionPercent || '10'}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmation.show} onOpenChange={cancelDelete}>
        <DialogContent data-testid="delete-confirmation-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmation.type === 'single' 
                ? `Are you sure you want to delete the lead "${deleteConfirmation.leadName}"?`
                : `Are you sure you want to delete ${deleteConfirmation.count} selected lead${deleteConfirmation.count !== 1 ? 's' : ''}?`
              }
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLeadMutation.isPending || deleteLeadsMutation.isPending}
              data-testid="button-confirm-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {(deleteLeadMutation.isPending || deleteLeadsMutation.isPending) ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bottom padding to prevent content from being hidden behind floating bar */}
      {leads && leads.length > 0 && (
        <div className="h-20"></div>
      )}
    </div>
  );
}
