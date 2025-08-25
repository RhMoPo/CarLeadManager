import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff } from "lucide-react";

interface CreateVaModalProps {
  onSuccess?: () => void;
}

export function CreateVaModal({ onSuccess }: CreateVaModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    commissionPercentage: "10",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const createVaMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; commissionPercentage: string }) => {
      const res = await apiRequest("POST", "/api/vas/create-account", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vas"] });
      setGeneratedCredentials({
        email: data.user.email,
        password: data.password
      });
      toast({
        title: "VA account created",
        description: "The VA account has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create VA account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.commissionPercentage) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const commissionValue = parseFloat(formData.commissionPercentage);
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      toast({
        title: "Invalid commission percentage",
        description: "Commission percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }
    
    createVaMutation.mutate(formData);
  };

  const copyCredentials = async () => {
    if (!generatedCredentials) return;
    
    const credentials = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`;
    try {
      await navigator.clipboard.writeText(credentials);
      toast({
        title: "Credentials copied!",
        description: "VA credentials have been copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy credentials to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setFormData({ email: "", name: "", commissionPercentage: "10" });
    setGeneratedCredentials(null);
    onSuccess?.();
  };

  return (
    <DialogContent className="max-w-md" data-testid="create-va-modal">
      <DialogHeader>
        <DialogTitle>Create VA Account</DialogTitle>
        <DialogDescription>
          Create a new Virtual Assistant account with direct access
        </DialogDescription>
      </DialogHeader>
      
      {!generatedCredentials ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="va@example.com"
              required
              data-testid="input-va-email"
            />
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Smith"
              required
              data-testid="input-va-name"
            />
          </div>

          <div>
            <Label htmlFor="commissionPercentage">Commission Percentage (%)</Label>
            <Input
              id="commissionPercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.commissionPercentage}
              onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
              placeholder="10.00"
              required
              data-testid="input-va-commission"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createVaMutation.isPending}
            data-testid="button-create-va"
          >
            {createVaMutation.isPending ? "Creating..." : "Create VA Account"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-3">
              ✅ VA Account Created Successfully!
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-slate-700">Email</Label>
                <div className="flex items-center mt-1">
                  <code className="flex-1 text-sm bg-slate-100 p-2 rounded">
                    {generatedCredentials.email}
                  </code>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Password</Label>
                <div className="flex items-center mt-1 space-x-2">
                  <code className="flex-1 text-sm bg-slate-100 p-2 rounded">
                    {showPassword ? generatedCredentials.password : "••••••••••"}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={copyCredentials}
              className="w-full mt-4" 
              variant="outline"
              data-testid="button-copy-credentials"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Credentials
            </Button>
          </div>

          <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <strong>📋 Share these credentials with the VA:</strong>
            <br />
            They can login at the main login page using these credentials.
          </div>

          <Button 
            onClick={handleReset}
            className="w-full" 
            data-testid="button-create-another"
          >
            Create Another VA
          </Button>
        </div>
      )}
    </DialogContent>
  );
}