import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Car } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { type Lead } from "@/lib/types";

interface LeadTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onSelectLead?: (leadId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  selectedLeads?: string[];
}

export function LeadTable({ 
  leads, 
  isLoading, 
  onSelectLead, 
  onSelectAll, 
  selectedLeads = [] 
}: LeadTableProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-slate-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  const allSelected = selectedLeads.length === leads.length && leads.length > 0;
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              {onSelectAll && (
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onCheckedChange={onSelectAll}
                  data-testid="checkbox-select-all"
                />
              )}
            </TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>VA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Asking Price</TableHead>
            <TableHead>Est. Profit</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id} 
              className="hover:bg-slate-50" 
              data-testid={`lead-row-${lead.id}`}
            >
              <TableCell>
                {onSelectLead && (
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => onSelectLead(lead.id, !!checked)}
                    data-testid={`checkbox-${lead.id}`}
                  />
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                    {lead.previewImageUrl ? (
                      <img 
                        src={lead.previewImageUrl} 
                        alt="Lead preview"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Car className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {lead.year} {lead.make} {lead.model}
                    </div>
                    <div className="text-sm text-slate-500">
                      {lead.location} • {lead.mileage.toLocaleString()} mi
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-900">
                {lead.vaName || 'Unknown'}
              </TableCell>
              <TableCell>
                <Badge 
                  className={getStatusColor(lead.status)}
                  data-testid={`status-${lead.status.toLowerCase()}`}
                >
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(lead.askingPrice)}</TableCell>
              <TableCell className="text-emerald-600 font-medium">
                {formatCurrency(lead.estimatedProfit)}
              </TableCell>
              <TableCell>
                <a 
                  href={lead.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-32 block"
                >
                  {new URL(lead.sourceUrl).hostname}
                </a>
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {formatDate(lead.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Link href={`/lead/${lead.id}`}>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      data-testid={`button-view-${lead.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    data-testid={`button-edit-${lead.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                No leads found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
