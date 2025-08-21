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

const leadSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0),
  vin: z.string().optional(),
  askingPrice: z.number().min(0, "Asking price must be positive"),
  estimatedSalePrice: z.number().min(0, "Estimated sale price must be positive"),
  expensesEstimate: z.number().min(0, "Expenses estimate must be positive"),
  sourceUrl: z.string().url("Must be a valid URL"),
  sellerContact: z.string().min(1, "Seller contact is required"),
  location: z.string().min(1, "Location is required"),
  vaId: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSuccess?: () => void;
  submitButtonText?: string;
  initialData?: Partial<LeadFormData>;
}

export function LeadForm({ onSuccess, submitButtonText = "Create Lead", initialData }: LeadFormProps) {
  const { user } = useAuth();
  const createLeadMutation = useCreateLead();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      make: initialData?.make || "",
      model: initialData?.model || "",
      year: initialData?.year || new Date().getFullYear(),
      mileage: initialData?.mileage || 0,
      vin: initialData?.vin || "",
      askingPrice: initialData?.askingPrice || 0,
      estimatedSalePrice: initialData?.estimatedSalePrice || 0,
      expensesEstimate: initialData?.expensesEstimate || 0,
      sourceUrl: initialData?.sourceUrl || "",
      sellerContact: initialData?.sellerContact || "",
      location: initialData?.location || "",
      vaId: initialData?.vaId || undefined,
    },
  });

  const onSubmit = (data: LeadFormData) => {
    // Convert numbers to strings for server compatibility
    const submitData = {
      ...data,
      askingPrice: data.askingPrice.toString(),
      estimatedSalePrice: data.estimatedSalePrice.toString(),
      expensesEstimate: data.expensesEstimate.toString(),
    };
    
    createLeadMutation.mutate(submitData, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
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
                  <Input placeholder="Honda, Toyota, etc." {...field} data-testid="input-make" />
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
                  <Input placeholder="Civic, Camry, etc." {...field} data-testid="input-model" />
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
                    placeholder="2020"
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
                    placeholder="45000"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-mileage"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="1HGBH41JXMN109186" {...field} data-testid="input-vin" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="askingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asking Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="15000"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-asking-price"
                  />
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
                  <Input
                    type="number"
                    placeholder="18000"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-estimated-sale-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expensesEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expenses Estimate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="500"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-expenses-estimate"
                  />
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
                  type="url"
                  placeholder="https://cars.com/listing/..."
                  {...field}
                  data-testid="input-source-url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Los Angeles, CA" {...field} data-testid="input-location" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sellerContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller Contact</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Phone: (555) 123-4567&#10;Email: seller@example.com&#10;Name: John Doe"
                  rows={3}
                  {...field}
                  data-testid="textarea-seller-contact"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={createLeadMutation.isPending}
            data-testid="button-submit-lead"
          >
            {createLeadMutation.isPending ? "Submitting..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
