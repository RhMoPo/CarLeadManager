import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLeads, useUpdateLeadStatus } from "@/hooks/use-leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Car, Search, Filter, Eye } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { type LeadStatus, type Lead } from "@/lib/types";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'BOUGHT', label: 'Bought' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'PAID', label: 'Paid' },
];

export default function KanbanPage() {
  const { user } = useAuth();
  const { data: leads = [], isLoading } = useLeads();
  const updateLeadStatus = useUpdateLeadStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");

  if (!user) {
    return null;
  }

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateLeadStatus.mutate({ id: leadId, status: newStatus });
  };

  // Filter leads based on search term and status
  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = 
      `${lead.year} ${lead.make} ${lead.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.vaName && lead.vaName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group leads by status for summary
  const statusCounts = leads.reduce((acc: Record<string, number>, lead: Lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 p-6" data-testid="kanban-page">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Lead Management</h2>
        <p className="text-slate-600 mt-1">Track and manage lead status and progress</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statusOptions.map(({ value, label }) => (
          <Card key={value} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {statusCounts[value] || 0}
              </div>
              <div className="text-sm text-slate-600">{label}</div>
              <Badge 
                variant="secondary" 
                className={`mt-2 ${getStatusColor(value)}`}
              >
                {label}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by vehicle, location, or VA name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "ALL")}>
                <SelectTrigger data-testid="select-status-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {statusOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Leads ({filteredLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No leads found</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "No leads have been submitted yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Asking Price</TableHead>
                  <TableHead>Est. Profit</TableHead>
                  <TableHead>Status</TableHead>
                  {user.role !== 'VA' && <TableHead>VA</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead: Lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50" data-testid={`lead-row-${lead.id}`}>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {lead.year} {lead.make} {lead.model}
                      </div>
                      <div className="text-sm text-slate-600">{lead.trim}</div>
                    </TableCell>
                    <TableCell className="text-slate-900">{lead.location}</TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {formatCurrency(lead.askingPrice)}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">
                      {formatCurrency(lead.estimatedProfit)}
                    </TableCell>
                    <TableCell>
                      {user.role === 'VA' ? (
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      ) : (
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                          disabled={updateLeadStatus.isPending}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${lead.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    {user.role !== 'VA' && (
                      <TableCell className="text-slate-900">
                        {lead.vaName || 'Unassigned'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Link href={`/lead/${lead.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-view-${lead.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}