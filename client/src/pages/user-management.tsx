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
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateVaModal, setShowCreateVaModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<{vaId: string, currentPercentage: string} | null>(null);
  const [commissionValue, setCommissionValue] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{vaId: string, vaName: string} | null>(null);

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

      {/* Combined Users & VAs Table */}
      <Card>
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
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((userData: any) => {
                  // Find corresponding VA data if this is a VA user
                  const vaData = vas?.find((va: any) => va.userId === userData.id);
                  const isVA = userData.role === 'VA';
                  
                  return (
                    <TableRow key={userData.id} className="hover:bg-slate-50" data-testid={`user-row-${userData.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            userData.role === 'SUPERADMIN' ? 'bg-red-100' : 'bg-purple-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              userData.role === 'SUPERADMIN' ? 'text-red-600' : 'text-purple-600'
                            }`}>
                              {isVA ? (vaData?.name?.charAt(0) || 'V') : userData.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900" data-testid={`user-name-${userData.id}`}>
                              {isVA ? vaData?.name || 'VA User' : 'Admin'}
                            </div>
                            <div className="text-sm text-slate-500" data-testid={`user-email-${userData.id}`}>
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(userData.role)} data-testid={`user-role-${userData.id}`}>
                          {userData.role === 'SUPERADMIN' ? 'ADMIN' : userData.role}
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
                        {isVA ? `${((parseFloat(vaData?.commissionPercentage || '0.1') * 100).toFixed(1))}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-900" data-testid={`user-leads-count-${userData.id}`}>
                        {isVA ? (vaData?.leadsCount || 0) : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600" data-testid={`user-total-profit-${userData.id}`}>
                        {isVA ? `$${vaData?.totalProfit || '0'}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {userData.lastLogin ? formatDate(userData.lastLogin) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {userData.role === 'SUPERADMIN' ? (
                            <span className="text-xs text-slate-400 px-2 py-1 bg-slate-50 rounded">Admin Account</span>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCommission(vaData)}
                                data-testid={`button-edit-commission-${userData.id}`}
                                title="Edit Commission"
                              >
                                <Percent className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleUserStatus(userData.id, userData.isActive)}
                                disabled={toggleUserStatusMutation.isPending}
                                data-testid={`button-toggle-status-${userData.id}`}
                              >
                                <Power className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
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
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-delete-user-${userData.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!users || users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No users found
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

    </div>
  );
}
