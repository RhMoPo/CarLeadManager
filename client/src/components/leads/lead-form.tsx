import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useCreateLead } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const leadSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0).optional(),
  askingPrice: z.number().min(0, "Asking price must be positive").optional(),
  estimatedSalePrice: z.number().min(0, "Estimated sale price must be positive").optional(),
  sourceUrl: z.string().url("Must be a valid URL"),
  vaId: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSuccess?: () => void;
  submitButtonText?: string;
  initialData?: Partial<LeadFormData>;
  isEdit?: boolean;
  leadId?: string;
  updateMutation?: any;
}

export function LeadForm({ onSuccess, submitButtonText = "Create Lead", initialData, isEdit = false, leadId, updateMutation }: LeadFormProps) {
  const { user } = useAuth();
  const createLeadMutation = useCreateLead();
  const { toast } = useToast();


  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      make: initialData?.make || "",
      model: initialData?.model || "",
      year: initialData?.year || new Date().getFullYear(),
      mileage: initialData?.mileage || undefined,
      askingPrice: initialData?.askingPrice || undefined,
      estimatedSalePrice: initialData?.estimatedSalePrice || undefined,
      sourceUrl: initialData?.sourceUrl || "",
      vaId: initialData?.vaId || undefined,
    },
  });

  const onSubmit = (data: LeadFormData) => {
    // Convert numbers to strings for server compatibility and add default values
    const submitData = {
      ...data,
      mileage: data.mileage || 0,
      askingPrice: (data.askingPrice || 0).toString(),
      estimatedSalePrice: (data.estimatedSalePrice || 0).toString(),
      expensesEstimate: "0", // Default to 0
      sellerContact: "TBD", // Default placeholder
    };
    
    if (isEdit && updateMutation && leadId) {
      // Update existing lead
      updateMutation.mutate({ id: leadId, data: submitData });
    } else {
      // Create new lead
      createLeadMutation.mutate(submitData, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="lead-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value;
                      const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                      field.onChange(capitalized);
                    }}
                    data-testid="input-make" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value;
                      const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                      field.onChange(capitalized);
                    }}
                    data-testid="input-model" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-year"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mileage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : parseInt(value));
                    }}
                    data-testid="input-mileage"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="askingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asking Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                    <Input
                      type="number"
                      className="pl-8"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseFloat(value));
                      }}
                      data-testid="input-asking-price"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estimatedSalePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Sale Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                    <Input
                      type="number"
                      className="pl-8"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseFloat(value));
                      }}
                      data-testid="input-estimated-sale-price"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source URL</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="url" 
                  data-testid="input-source-url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={isEdit ? updateMutation?.isPending : createLeadMutation.isPending}
            data-testid="button-submit-lead"
          >
            {(isEdit ? updateMutation?.isPending : createLeadMutation.isPending) ? "Submitting..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
