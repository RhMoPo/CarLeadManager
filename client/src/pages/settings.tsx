import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface SettingsData {
  commissionPercent?: string;
  companyName?: string;
  defaultTimezone?: string;
  discordWebhook?: string;
  notifyNewLead?: boolean;
  notifyStatusChange?: boolean;
  notifyCommissionDue?: boolean;
  sessionTimeout?: string;
  magicLinkExpiry?: string;
  requireMFA?: boolean;
  logUserActivity?: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SettingsData>({});

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (settingsData) {
      const data = settingsData as Record<string, string>;
      setSettings({
        commissionPercent: data.commissionPercent || '10',
        companyName: data.companyName || 'Car Lead Management Corp',
        defaultTimezone: data.defaultTimezone || 'UTC',
        discordWebhook: data.discordWebhook || '',
        notifyNewLead: data.notifyNewLead === 'true',
        notifyStatusChange: data.notifyStatusChange === 'true',
        notifyCommissionDue: data.notifyCommissionDue === 'false',
        sessionTimeout: data.sessionTimeout || '24',
        magicLinkExpiry: data.magicLinkExpiry || '15',
        requireMFA: data.requireMFA === 'true',
        logUserActivity: data.logUserActivity === 'true',
      });
    }
  }, [settingsData]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiRequest('PUT', `/api/settings/${key}`, { value });
      return res.json();
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: `${key} has been updated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user || (user.role !== 'MANAGER' && user.role !== 'SUPERADMIN')) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (section: string, data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      updateSettingMutation.mutate({
        key,
        value: typeof value === 'boolean' ? value.toString() : value.toString(),
      });
    });
  };

  const handleCommissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit('commission', { commissionPercent: settings.commissionPercent });
  };

  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit('system', {
      companyName: settings.companyName,
      defaultTimezone: settings.defaultTimezone,
    });
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit('notification', {
      discordWebhook: settings.discordWebhook,
      notifyNewLead: settings.notifyNewLead,
      notifyStatusChange: settings.notifyStatusChange,
      notifyCommissionDue: settings.notifyCommissionDue,
    });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit('security', {
      sessionTimeout: settings.sessionTimeout,
      magicLinkExpiry: settings.magicLinkExpiry,
      requireMFA: settings.requireMFA,
      logUserActivity: settings.logUserActivity,
    });
  };

  return (
    <div className="flex-1 p-6" data-testid="settings-page">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-slate-600 mt-1">Configure system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : (
              <form onSubmit={handleCommissionSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="commission-percent">Commission Percentage</Label>
                  <div className="relative">
                    <Input
                      id="commission-percent"
                      type="number"
                      value={settings.commissionPercent || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, commissionPercent: e.target.value }))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="pr-8"
                      data-testid="input-commission-percent"
                    />
                    <span className="absolute right-3 top-2 text-sm text-slate-500">%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Percentage of profit paid as commission to VAs
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                  data-testid="button-save-commission"
                >
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : (
              <form onSubmit={handleSystemSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={settings.companyName || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    data-testid="input-company-name"
                  />
                </div>
                <div>
                  <Label htmlFor="default-timezone">Default Timezone</Label>
                  <Select
                    value={settings.defaultTimezone || 'UTC'}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, defaultTimezone: value }))}
                  >
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="PST">Pacific Standard Time</SelectItem>
                      <SelectItem value="EST">Eastern Standard Time</SelectItem>
                      <SelectItem value="CST">Central Standard Time</SelectItem>
                      <SelectItem value="MST">Mountain Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                  data-testid="button-save-system"
                >
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : (
              <form onSubmit={handleNotificationSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                  <Input
                    id="discord-webhook"
                    type="url"
                    value={settings.discordWebhook || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, discordWebhook: e.target.value }))}
                    placeholder="https://discord.com/api/webhooks/..."
                    data-testid="input-discord-webhook"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Optional: Send notifications to Discord channel
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify-new-lead"
                      checked={settings.notifyNewLead || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, notifyNewLead: !!checked }))
                      }
                      data-testid="checkbox-notify-new-lead"
                    />
                    <Label htmlFor="notify-new-lead" className="text-sm">
                      Notify on new lead submissions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify-status-change"
                      checked={settings.notifyStatusChange || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, notifyStatusChange: !!checked }))
                      }
                      data-testid="checkbox-notify-status-change"
                    />
                    <Label htmlFor="notify-status-change" className="text-sm">
                      Notify on status changes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify-commission-due"
                      checked={settings.notifyCommissionDue || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, notifyCommissionDue: !!checked }))
                      }
                      data-testid="checkbox-notify-commission-due"
                    />
                    <Label htmlFor="notify-commission-due" className="text-sm">
                      Notify when commissions are due
                    </Label>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                  data-testid="button-save-notifications"
                >
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : (
              <form onSubmit={handleSecuritySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.sessionTimeout || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    min="1"
                    max="168"
                    data-testid="input-session-timeout"
                  />
                </div>
                <div>
                  <Label htmlFor="magic-link-expiry">Magic Link Expiry (minutes)</Label>
                  <Input
                    id="magic-link-expiry"
                    type="number"
                    value={settings.magicLinkExpiry || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, magicLinkExpiry: e.target.value }))}
                    min="5"
                    max="60"
                    data-testid="input-magic-link-expiry"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="require-mfa"
                      checked={settings.requireMFA || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, requireMFA: !!checked }))
                      }
                      data-testid="checkbox-require-mfa"
                    />
                    <Label htmlFor="require-mfa" className="text-sm">
                      Require MFA for admin accounts
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="log-user-activity"
                      checked={settings.logUserActivity || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, logUserActivity: !!checked }))
                      }
                      data-testid="checkbox-log-activity"
                    />
                    <Label htmlFor="log-user-activity" className="text-sm">
                      Log user activity
                    </Label>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                  data-testid="button-save-security"
                >
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
