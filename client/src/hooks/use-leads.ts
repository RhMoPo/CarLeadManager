import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

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
  normalizedSourceUrl?: string;
  sellerContact: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'CONTACTED' | 'BOUGHT' | 'SOLD' | 'PAID' | 'REJECTED';
  previewImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function useLeads(filters?: any) {
  return useQuery({
    queryKey: ["/api/leads", filters],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, String(value));
        });
      }
      const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url;
      const res = await fetch(fullUrl, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["/api/leads", id],
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: any) => {
      const res = await apiRequest("POST", "/api/leads", leadData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead created",
        description: "Your lead has been submitted successfully",
      });
    },
    onError: (error: any) => {
      if (error.message.includes('409')) {
        toast({
          title: "Duplicate lead detected",
          description: "A similar lead already exists in the system",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to create lead",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/leads/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Status updated",
        description: "Lead status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLeadEvents(leadId: string) {
  return useQuery({
    queryKey: ["/api/leads", leadId, "events"],
    enabled: !!leadId,
  });
}
