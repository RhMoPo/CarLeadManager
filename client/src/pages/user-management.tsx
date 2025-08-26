import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CreateVaModal } from "@/components/modals/create-va-modal";
import { toast } from "@/hooks/use-toast";
import {
  UserPlus,
  Edit,
  Power,
  User,
  BarChart3,
  Trash2,
  Percent,
  MoreHorizontal,
  KeyRound,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateVaModal, setShowCreateVaModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<{vaId: string, currentPercentage: string} | null>(null);
  const [commissionValue, setCommissionValue] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{vaId: string, vaName: string} | null>(null);
  const [resetPasswordConfirmation, setResetPasswordConfirmation] = useState<{userId: string, vaName: string} | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: user?.role === 'SUPERADMIN',
  });

  const { data: vas = [], isLoading: vasLoading } = useQuery<any[]>({
    queryKey: ['/api/vas'],
    enabled: user?.role !== 'VA',
  });


  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/users/${userId}`, { isActive: !isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User status updated",
        description: "The user's active status has been changed",
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

  const deleteVaMutation = useMutation({
    mutationFn: async (vaId: string) => {
      const res = await apiRequest('DELETE', `/api/vas/${vaId}`);
      try {
        return await res.json();
      } catch (e) {
        // If JSON parsing fails, return success if status is ok
        if (res.ok) {
          return { message: 'VA account deleted successfully' };
        }
        throw new Error('Failed to delete VA account');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "VA account deleted",
        description: "The VA account has been permanently deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete VA",
        description: error.message || "An error occurred while deleting the VA account",
        variant: "destructive",
      });
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: async ({ vaId, commissionPercentage }: { vaId: string; commissionPercentage: string }) => {
      const res = await apiRequest('PATCH', `/api/vas/${vaId}/commission`, { commissionPercentage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vas'] });
      setEditingCommission(null);
      setCommissionValue("");
      toast({
        title: "Commission updated",
        description: "VA commission percentage has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update commission",
        description: error.message || "An error occurred while updating the commission",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest('POST', `/api/users/${userId}/reset-password`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "A magic link has been sent to the VA's email address",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reset password",
        description: error.message || "An error occurred while resetting the password",
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== 'SUPERADMIN') {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive });
  };

  const handleDeleteVa = (va: any) => {
    if (!va || !va.id || !va.name) return;
    setDeleteConfirmation({ vaId: va.id, vaName: va.name });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteVaMutation.mutate(deleteConfirmation.vaId);
      setDeleteConfirmation(null);
    }
  };

  const handleEditCommission = (va: any) => {
    if (!va || !va.id) return;
    const currentPercentage = ((parseFloat(va.commissionPercentage || '0.1') * 100).toFixed(1));
    setEditingCommission({ vaId: va.id, currentPercentage });
    setCommissionValue(currentPercentage);
  };

  const handleSaveCommission = () => {
    if (!editingCommission) return;
    
    const commissionNum = parseFloat(commissionValue);
    if (isNaN(commissionNum) || commissionNum < 0 || commissionNum > 100) {
      toast({
        title: "Invalid commission percentage",
        description: "Commission percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    updateCommissionMutation.mutate({
      vaId: editingCommission.vaId,
      commissionPercentage: commissionValue
    });
  };

  const handleResetPassword = (userId: string, vaName: string) => {
    setResetPasswordConfirmation({ userId, vaName });
  };

  const confirmResetPassword = () => {
    if (resetPasswordConfirmation) {
      resetPasswordMutation.mutate(resetPasswordConfirmation.userId);
      setResetPasswordConfirmation(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'VA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };


  return (
    <div className="flex-1 p-6" data-testid="user-management-page">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">User Management</h2>
            <p className="text-slate-600 mt-1">Manage users, VAs, and system access</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={showCreateVaModal} onOpenChange={setShowCreateVaModal}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-va">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create VA Account
                </Button>
              </DialogTrigger>
              <CreateVaModal onSuccess={() => setShowCreateVaModal(false)} />
            </Dialog>
          </div>
        </div>
      </div>

      {/* Admin Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Accounts</CardTitle>
          <p className="text-sm text-slate-600">Manage administrator accounts and permissions</p>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.filter(user => user.role === 'SUPERADMIN').map((userData: any) => (
                  <TableRow key={userData.id} className="hover:bg-slate-50" data-testid={`admin-row-${userData.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-red-100">
                          <span className="text-sm font-medium text-red-600">
                            {userData.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900" data-testid={`admin-name-${userData.id}`}>
                            Admin
                          </div>
                          <div className="text-sm text-slate-500" data-testid={`admin-email-${userData.id}`}>
                            {userData.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800" data-testid={`admin-role-${userData.id}`}>
                        ADMIN
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={userData.isActive ? 'default' : 'secondary'}
                        className={userData.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                        data-testid={`admin-status-${userData.id}`}
                      >
                        {userData.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-400 px-2 py-1 bg-slate-50 rounded">Admin Account</span>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.filter(user => user.role === 'SUPERADMIN').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No admin accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Virtual Assistants Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Virtual Assistants</CardTitle>
          <p className="text-sm text-slate-600">Manage all VA accounts and user access</p>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading || vasLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Leads Count</TableHead>
                  <TableHead>Total Profit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.filter(user => user.role === 'VA').map((userData: any) => {
                  // Find corresponding VA data if this is a VA user
                  const vaData = vas?.find((va: any) => va.userId === userData.id);
                  
                  return (
                    <TableRow key={userData.id} className="hover:bg-slate-50" data-testid={`user-row-${userData.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-purple-100">
                            <span className="text-sm font-medium text-purple-600">
                              {vaData?.name?.charAt(0) || 'V'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900" data-testid={`user-name-${userData.id}`}>
                              {vaData?.name || 'VA User'}
                            </div>
                            <div className="text-sm text-slate-500" data-testid={`user-email-${userData.id}`}>
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800" data-testid={`user-role-${userData.id}`}>
                          VA
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={userData.isActive ? 'default' : 'secondary'}
                          className={userData.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                          data-testid={`user-status-${userData.id}`}
                        >
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-900" data-testid={`user-commission-${userData.id}`}>
                        {`${((parseFloat(vaData?.commissionPercentage || '0.1') * 100).toFixed(1))}%`}
                      </TableCell>
                      <TableCell className="text-slate-900" data-testid={`user-leads-count-${userData.id}`}>
                        {vaData?.leadsCount || 0}
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600" data-testid={`user-total-profit-${userData.id}`}>
                        ${vaData?.totalProfit || '0'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-testid={`button-actions-${userData.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEditCommission(vaData)}
                              data-testid={`action-edit-commission-${userData.id}`}
                            >
                              <Percent className="w-4 h-4 mr-2" />
                              Edit Commission
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(userData.id, vaData?.name || 'VA')}
                              disabled={resetPasswordMutation.isPending}
                              data-testid={`action-reset-password-${userData.id}`}
                            >
                              <KeyRound className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleUserStatus(userData.id, userData.isActive)}
                              disabled={toggleUserStatusMutation.isPending}
                              data-testid={`action-toggle-status-${userData.id}`}
                            >
                              <Power className="w-4 h-4 mr-2" />
                              {userData.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (vaData) {
                                  handleDeleteVa(vaData);
                                } else {
                                  toast({
                                    title: "Error",
                                    description: "VA data not found. Please refresh the page and try again.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={deleteVaMutation.isPending || !vaData}
                              className="text-red-600 focus:text-red-600"
                              data-testid={`action-delete-user-${userData.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete VA
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {users?.filter(user => user.role === 'VA').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No VA accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Commission Modal */}
      <Dialog open={!!editingCommission} onOpenChange={() => setEditingCommission(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Commission Percentage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commission">Commission Percentage (%)</Label>
              <Input
                id="commission"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                placeholder="10.0"
                data-testid="input-edit-commission"
              />
              <p className="text-sm text-slate-500 mt-1">
                Current: {editingCommission?.currentPercentage}%
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleSaveCommission}
                disabled={updateCommissionMutation.isPending}
                className="flex-1"
                data-testid="button-save-commission"
              >
                {updateCommissionMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingCommission(null)}
                className="flex-1"
                data-testid="button-cancel-commission"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete VA Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete VA "{deleteConfirmation?.vaName}"? 
              This will permanently delete their account and cannot be undone.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={confirmDelete}
                disabled={deleteVaMutation.isPending}
                variant="destructive"
                className="flex-1"
                data-testid="button-confirm-delete"
              >
                {deleteVaMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1"
                data-testid="button-cancel-delete"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation Modal */}
      <Dialog open={!!resetPasswordConfirmation} onOpenChange={() => setResetPasswordConfirmation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to reset the password for <strong>{resetPasswordConfirmation?.vaName}</strong>? 
              A magic link will be sent to their email.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={confirmResetPassword}
                disabled={resetPasswordMutation.isPending}
                className="flex-1"
                data-testid="button-confirm-reset-password"
              >
                {resetPasswordMutation.isPending ? "Sending..." : "Reset Password"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setResetPasswordConfirmation(null)}
                className="flex-1"
                data-testid="button-cancel-reset-password"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
