import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateVaModal } from "@/components/modals/create-va-modal";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  UserPlus,
  Edit,
  Power,
  User,
  BarChart3,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateVaModal, setShowCreateVaModal] = useState(false);

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
    if (window.confirm(`Are you sure you want to delete VA "${va.name}"? This will permanently delete their account and cannot be undone.`)) {
      deleteVaMutation.mutate(va.id);
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

      {/* Users Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((userData: any) => (
                  <TableRow key={userData.id} className="hover:bg-slate-50" data-testid={`user-row-${userData.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {userData.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900" data-testid={`user-email-${userData.id}`}>
                            {userData.email}
                          </div>
                          <div className="text-sm text-slate-500">ID: #{userData.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(userData.role)} data-testid={`user-role-${userData.id}`}>
                        {userData.role}
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
                    <TableCell className="text-slate-500 text-sm">
                      {userData.lastLogin ? formatDate(userData.lastLogin) : 'Never'}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm" data-testid={`user-created-${userData.id}`}>
                      {formatDate(userData.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast({
                              title: "Feature coming soon",
                              description: "User editing functionality will be implemented",
                            });
                          }}
                          data-testid={`button-edit-user-${userData.id}`}
                        >
                          <Edit className="w-4 h-4" />
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!users || users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* VAs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Virtual Assistants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {vasLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VA</TableHead>
                  <TableHead>User Account</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Leads Count</TableHead>
                  <TableHead>Total Profit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vas?.map((va: any) => (
                  <TableRow key={va.id} className="hover:bg-slate-50" data-testid={`va-row-${va.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-purple-600">
                            {va.name?.charAt(0) || 'V'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900" data-testid={`va-name-${va.id}`}>
                            {va.name}
                          </div>
                          <div className="text-sm text-slate-500">{va.notes}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900" data-testid={`va-email-${va.id}`}>
                        {va.userEmail || 'Not linked'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {va.userId ? 'Linked Account' : 'No Account'}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900" data-testid={`va-timezone-${va.id}`}>
                      {va.timezone || 'Not set'}
                    </TableCell>
                    <TableCell className="text-slate-900" data-testid={`va-leads-count-${va.id}`}>
                      {va.leadsCount || 0}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600" data-testid={`va-total-profit-${va.id}`}>
                      ${va.totalProfit || '0'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast({
                              title: "Feature coming soon",
                              description: "VA editing functionality will be implemented",
                            });
                          }}
                          data-testid={`button-edit-va-${va.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast({
                              title: "Feature coming soon",
                              description: "VA performance view will be implemented",
                            });
                          }}
                          data-testid={`button-view-performance-${va.id}`}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteVa(va)}
                          disabled={deleteVaMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-va-${va.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!vas || vas.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No VAs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
