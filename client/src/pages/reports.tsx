import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  TrendingUp,
  DollarSign,
  Target,
  Download,
  Trophy,
  Award,
  Medal,
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const dateRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30d');

  const { data: kpisData, isLoading } = useQuery({
    queryKey: ['/api/kpis'],
    enabled: user?.role !== 'VA',
  });

  if (!user || user.role === 'VA') {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/commissions/export.csv', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'commissions-report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Award className="w-4 h-4 text-slate-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-400">{index + 1}</span>;
  };

  return (
    <div className="flex-1 p-6" data-testid="reports-page">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Reports & Analytics</h2>
        <p className="text-slate-600 mt-1">Track performance metrics and commission analytics</p>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48" data-testid="select-date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleExportReport}
              variant="outline"
              data-testid="button-export-report"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-semibold text-slate-900" data-testid="total-revenue">
                    $347,500
                  </p>
                )}
                <p className="text-xs text-emerald-600 mt-1">+18% from last period</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Commission Paid</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-semibold text-slate-900" data-testid="commission-paid">
                    $34,750
                  </p>
                )}
                <p className="text-xs text-blue-600 mt-1">10% of total revenue</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Lead Value</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-semibold text-slate-900" data-testid="avg-lead-value">
                    $4,820
                  </p>
                )}
                <p className="text-xs text-emerald-600 mt-1">+$340 from last period</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Commission Status */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-sm font-medium text-slate-900">Paid</span>
              </div>
              <span className="text-sm font-semibold text-slate-900" data-testid="commissions-paid">
                $28,450
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-sm font-medium text-slate-900">Due</span>
              </div>
              <span className="text-sm font-semibold text-slate-900" data-testid="commissions-due">
                $12,450
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-slate-400 rounded-full" />
                <span className="text-sm font-medium text-slate-900">Processing</span>
              </div>
              <span className="text-sm font-semibold text-slate-900" data-testid="commissions-processing">
                $2,200
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profit Trends Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Profit by Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-slate-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium">Profit Chart</p>
                <p className="text-xs">Weekly profit trends visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VA Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>VA Leaderboard</CardTitle>
          <p className="text-sm text-slate-600">Top performing VAs by profit and lead count</p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>VA Name</TableHead>
                  <TableHead>Approved Leads</TableHead>
                  <TableHead>Total Profit</TableHead>
                  <TableHead>Commission Earned</TableHead>
                  <TableHead>Avg. Lead Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpisData?.vaLeaderboard?.map((va: any, index: number) => (
                  <TableRow key={va.vaId} className="hover:bg-slate-50" data-testid={`va-row-${index}`}>
                    <TableCell>
                      <div className="flex items-center">
                        {getRankIcon(index)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {va.vaName?.charAt(0) || 'V'}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900">
                          {va.vaName || 'Unknown VA'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900" data-testid={`approved-leads-${index}`}>
                      {va.approvedLeads || 0}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600" data-testid={`total-profit-${index}`}>
                      {formatCurrency(va.totalProfit || '0')}
                    </TableCell>
                    <TableCell className="text-slate-900" data-testid={`commission-earned-${index}`}>
                      {formatCurrency((parseFloat(va.totalProfit || '0') * 0.1).toString())}
                    </TableCell>
                    <TableCell className="text-slate-900" data-testid={`avg-lead-value-${index}`}>
                      {va.approvedLeads > 0 
                        ? formatCurrency((parseFloat(va.totalProfit || '0') / va.approvedLeads).toString())
                        : '$0'
                      }
                    </TableCell>
                  </TableRow>
                )) || []}
                {(!kpisData?.vaLeaderboard || kpisData.vaLeaderboard.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No VA performance data available
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
