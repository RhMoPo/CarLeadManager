import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface InviteUserModalProps {
  onSuccess?: () => void;
}

export function InviteUserModal({ onSuccess }: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    role: "",
  });

  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await apiRequest("POST", "/api/invites", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vas"] });
      toast({
        title: "Invitation sent",
        description: "The user has been invited successfully",
      });
      setFormData({ email: "", role: "" });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.role) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    inviteMutation.mutate(formData);
  };

  return (
    <DialogContent className="max-w-md" data-testid="invite-user-modal">
      <DialogHeader>
        <DialogTitle>Invite User</DialogTitle>
        <DialogDescription>
          Send an invitation to join the system
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="user@company.com"
            required
            data-testid="input-invite-email"
          />
        </div>
        
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            required
          >
            <SelectTrigger data-testid="select-invite-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VA">Virtual Assistant</SelectItem>
              <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
          <p className="font-medium mb-1">Role Permissions:</p>
          <ul className="text-xs space-y-1">
            <li><strong>VA:</strong> Submit and view leads</li>
            <li><strong>Super Admin:</strong> Full system access and management</li>
          </ul>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="submit"
            disabled={inviteMutation.isPending}
            data-testid="button-send-invite"
          >
            {inviteMutation.isPending ? "Sending..." : "Send Invite"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
