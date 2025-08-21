import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLeads } from "@/hooks/use-leads";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Eye, Edit, Car } from "lucide-react";
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
    status: 'ALL',
    vaId: 'ALL',
    make: '',
  });
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: leads, isLoading } = useLeads(filters);

  if (!user || user.role === 'VA') {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mt-2">You don't have permission to view this page.</p>
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

  return (
    <div className="flex-1 p-6" data-testid="leads-page">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">All Leads</h2>
            <p className="text-slate-600 mt-1">Manage and track all lead submissions</p>
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="BOUGHT">Bought</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
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
                  {/* TODO: Load actual VAs from API */}
                  <SelectItem value="1">Sarah Johnson</SelectItem>
                  <SelectItem value="2">Mike Chen</SelectItem>
                  <SelectItem value="3">Lisa Rodriguez</SelectItem>
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
                    <TableHead>Est. Profit</TableHead>
                    <TableHead>Source</TableHead>
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
                            <div className="font-medium text-slate-900">
                              {lead.year} {lead.make} {lead.model}
                            </div>
                            <div className="text-sm text-slate-500">
                              {lead.location} • {lead.mileage.toLocaleString()} mi
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {lead.vaName || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[lead.status]}
                          data-testid={`status-${lead.status.toLowerCase()}`}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(lead.askingPrice)}</TableCell>
                      <TableCell className="text-emerald-600 font-medium">
                        {formatCurrency(lead.estimatedProfit)}
                      </TableCell>
                      <TableCell>
                        <a 
                          href={lead.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-32 block"
                        >
                          {new URL(lead.sourceUrl).hostname}
                        </a>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/lead/${lead.id}`}>
                            <Button size="sm" variant="ghost" data-testid={`button-view-${lead.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" data-testid={`button-edit-${lead.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!leads || leads.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
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
    </div>
  );
}
