import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLead, useLeadEvents, useUpdateLeadStatus } from "@/hooks/use-leads";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadForm } from "@/components/leads/lead-form";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Car,
  MapPin,
  DollarSign,
  Calendar,
  User,
  ExternalLink,
  Edit,
  History,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { type LeadStatus } from "@/lib/types";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'BOUGHT', label: 'Bought' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: lead, isLoading } = useLead(id!);
  const { data: events, isLoading: eventsLoading } = useLeadEvents(id!);
  const updateStatusMutation = useUpdateLeadStatus();

  const { data: commission } = useQuery({
    queryKey: ['/api/commissions', { leadId: id }],
    enabled: !!id && user?.role !== 'VA',
  });

  const { data: vas = [] } = useQuery<any[]>({
    queryKey: ['/api/vas'],
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/leads/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads", id] });
      setShowEditModal(false);
      toast({
        title: "Lead updated",
        description: "Lead has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const handleStatusChange = (newStatus: LeadStatus) => {
    updateStatusMutation.mutate({ id: id!, status: newStatus });
  };

  const canChangeStatus = user.role !== 'VA';

  // Handle edit lead - check permissions
  const handleEditLead = () => {
    if (user?.role === 'VA') {
      // VAs can only edit their own leads
      const userVA = vas.find(va => va.userId === user.id);
      if (!userVA || lead?.vaId !== userVA.id) {
        toast({
          title: "Cannot edit lead",
          description: "You can only edit your own leads",
          variant: "destructive",
        });
        return;
      }
    }
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6" data-testid="lead-detail-loading">
        <div className="mb-6 flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Lead Not Found</h2>
          <p className="text-slate-600 mt-2">The lead you're looking for doesn't exist.</p>
          <Button
            onClick={() => setLocation('/leads')}
            className="mt-4"
            data-testid="button-back-to-leads"
          >
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6" data-testid="lead-detail-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/leads')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900" data-testid="lead-title">
              {lead.year} {lead.make} {lead.model}
            </h1>
            <div className="flex items-center space-x-4 text-slate-600 mt-2">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{lead.location}</span>
              </div>
              <div className="flex items-center">
                <Car className="w-4 h-4 mr-1" />
                <span>{lead.mileage.toLocaleString()} miles</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(lead.status)} data-testid="lead-status">
              {lead.status}
            </Badge>
            {canChangeStatus && (
              <Select value={lead.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40" data-testid="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditLead}
              data-testid="button-edit-lead"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Make</label>
                  <p className="text-slate-900" data-testid="lead-make">{lead.make}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Model</label>
                  <p className="text-slate-900" data-testid="lead-model">{lead.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Year</label>
                  <p className="text-slate-900" data-testid="lead-year">{lead.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Mileage</label>
                  <p className="text-slate-900" data-testid="lead-mileage">
                    {lead.mileage.toLocaleString()} miles
                  </p>
                </div>
              </div>
              
              <Separator />
              
              
              <div>
                <label className="text-sm font-medium text-slate-600">Source URL</label>
                <a
                  href={lead.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                  data-testid="lead-source-url"
                >
                  {lead.sourceUrl}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Seller Contact</label>
                <div className="whitespace-pre-wrap text-slate-900" data-testid="lead-seller-contact">
                  {lead.sellerContact}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <div className="text-sm text-slate-600">Asking Price</div>
                  <div className="text-xl font-semibold text-slate-900" data-testid="lead-asking-price">
                    {formatCurrency(lead.askingPrice)}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-blue-600">Estimated Sale Price</div>
                  <div className="text-xl font-semibold text-slate-900" data-testid="lead-estimated-sale-price">
                    {formatCurrency(lead.estimatedSalePrice)}
                  </div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <div className="text-sm text-emerald-600">Estimated Profit</div>
                  <div className="text-xl font-semibold text-emerald-900" data-testid="lead-estimated-profit">
                    {formatCurrency(lead.estimatedProfit)}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-slate-600">Expenses Estimate</div>
                <div className="text-lg font-medium text-slate-900" data-testid="lead-expenses-estimate">
                  {formatCurrency(lead.expensesEstimate)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link Preview */}
          {lead.previewImageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Link Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={lead.previewImageUrl}
                  alt="Lead preview"
                  className="w-full h-48 object-cover rounded-lg"
                  data-testid="lead-preview-image"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* VA Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                VA Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-medium text-slate-900" data-testid="lead-va-name">
                  {lead.vaName || 'Unknown VA'}
                </p>
                <p className="text-sm text-slate-500">Virtual Assistant</p>
              </div>
            </CardContent>
          </Card>

          {/* Commission Information */}
          {commission && user.role !== 'VA' && (
            <Card>
              <CardHeader>
                <CardTitle>Commission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Amount</span>
                  <span className="font-medium" data-testid="commission-amount">
                    {formatCurrency(commission.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <Badge
                    variant={commission.isPaid ? 'default' : commission.isDue ? 'secondary' : 'outline'}
                    data-testid="commission-status"
                  >
                    {commission.isPaid ? 'Paid' : commission.isDue ? 'Due' : 'Pending'}
                  </Badge>
                </div>
                {commission.isDue && !commission.isPaid && user.role === 'SUPERADMIN' && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // TODO: Implement mark as paid functionality
                      toast({
                        title: "Feature coming soon",
                        description: "Mark as paid functionality will be implemented",
                      });
                    }}
                    data-testid="button-mark-paid"
                  >
                    Mark as Paid
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-4 h-4 mr-2" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event: any) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">
                          Status changed
                          {event.fromStatus && (
                            <span> from <strong>{event.fromStatus}</strong></span>
                          )}
                          <span> to <strong>{event.toStatus}</strong></span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(event.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No activity yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {lead && (
            <LeadForm
              initialData={lead}
              onSubmit={(data) => updateLeadMutation.mutate(data)}
              onCancel={() => setShowEditModal(false)}
              isLoading={updateLeadMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
