import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { } from "lucide-react";

interface CreateVaModalProps {
  onSuccess?: () => void;
}

export function CreateVaModal({ onSuccess }: CreateVaModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });
  const [createdVaInfo, setCreatedVaInfo] = useState<{
    email: string;
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const createVaMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      const res = await apiRequest("POST", "/api/vas/create-account", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vas"] });
      setCreatedVaInfo({
        email: data.user.email,
        message: data.message || "VA account created and welcome email sent"
      });
      toast({
        title: "VA account created",
        description: "Welcome email sent successfully",
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
    if (!formData.email || !formData.name) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createVaMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({ email: "", name: "" });
    setCreatedVaInfo(null);
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
      
      {!createdVaInfo ? (
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
                <Label className="text-sm font-medium text-slate-700">Email Sent To</Label>
                <div className="flex items-center mt-1">
                  <code className="flex-1 text-sm bg-slate-100 p-2 rounded">
                    {createdVaInfo.email}
                  </code>
                </div>
              </div>

              <div className="text-sm text-slate-600">
                <p className="font-medium text-green-700">Welcome email sent successfully! 📧</p>
                <p className="mt-1">The VA has been sent login credentials and instructions via email.</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <strong>⚠️ If the VA doesn't receive the email:</strong>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              <li>Check spam/junk folder</li>
              <li>Verify the email address is correct</li>
              <li>Wait a few minutes for delivery</li>
            </ul>
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