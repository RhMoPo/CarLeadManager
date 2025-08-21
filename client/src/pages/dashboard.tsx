import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLeads } from "@/hooks/use-leads";
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
import {
  Car,
  CheckCircle,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["/api/kpis"],
    enabled: user?.role !== 'VA',
  });
  
  const { data: recentLeads, isLoading: leadsLoading } = useLeads();

  if (!user) return null;

  const isVA = user.role === 'VA';

  return (
    <div className="flex-1 p-6" data-testid="dashboard-page">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-1">
          {isVA ? 'Submit and track your lead submissions' : 'Overview of your lead management system'}
        </p>
      </div>

      {!isVA && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Leads</p>
                    {kpisLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900" data-testid="kpi-total-leads">
                        {kpis?.kpis?.totalLeads || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Approved Leads</p>
                    {kpisLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900" data-testid="kpi-approved-leads">
                        {kpis?.kpis?.approvedLeads || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Commission Due</p>
                    {kpisLoading ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900" data-testid="kpi-commission-due">
                        {formatCurrency(kpis?.kpis?.commissionDue || '0')}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active VAs</p>
                    {kpisLoading ? (
                      <Skeleton className="h-8 w-12 mt-2" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900" data-testid="kpi-active-vas">
                        {kpis?.kpis?.activeVAs || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isVA ? 'Your Recent Leads' : 'Recent Leads'}
            </CardTitle>
            <Link href={isVA ? '/submit' : '/leads'}>
              <Button variant="outline" size="sm" data-testid="button-view-all-leads">
                {isVA ? 'Submit Lead' : 'View All'}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {leadsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  {!isVA && <TableHead>VA</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Asking Price</TableHead>
                  <TableHead>Est. Profit</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads?.slice(0, 5).map((lead: any) => (
                  <TableRow key={lead.id} data-testid={`lead-row-${lead.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {lead.year} {lead.make} {lead.model}
                        </div>
                        <div className="text-sm text-slate-500">
                          {lead.location}
                        </div>
                      </div>
                    </TableCell>
                    {!isVA && (
                      <TableCell className="text-sm text-slate-900">
                        {lead.vaName || 'Unknown'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === 'APPROVED' ? 'default' :
                          lead.status === 'PENDING' ? 'secondary' :
                          lead.status === 'SOLD' ? 'default' :
                          'outline'
                        }
                        data-testid={`status-${lead.status.toLowerCase()}`}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(lead.askingPrice)}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">
                      {formatCurrency(lead.estimatedProfit)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
                {(!recentLeads || recentLeads.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={isVA ? 5 : 6} className="text-center py-8 text-slate-500">
                      No leads found
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
