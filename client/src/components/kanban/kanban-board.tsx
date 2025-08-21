import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { type Lead, type LeadStatus } from "@/lib/types";

interface KanbanBoardProps {
  leads: Lead[];
  onDragEnd: (result: DropResult) => void;
  canDrag?: boolean;
}

const statusColumns: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'PENDING', title: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'APPROVED', title: 'Approved', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-blue-50 border-blue-200' },
  { id: 'BOUGHT', title: 'Bought', color: 'bg-purple-50 border-purple-200' },
  { id: 'SOLD', title: 'Sold', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'PAID', title: 'Paid', color: 'bg-green-100 border-green-300' },
];

function LeadCard({ lead, index, canDrag = true }: { lead: Lead; index: number; canDrag?: boolean }) {
  const statusColor = {
    PENDING: 'bg-yellow-400',
    APPROVED: 'bg-emerald-400',
    CONTACTED: 'bg-blue-400',
    BOUGHT: 'bg-purple-400',
    SOLD: 'bg-emerald-500',
    PAID: 'bg-green-500',
    REJECTED: 'bg-red-400',
  }[lead.status] || 'bg-gray-400';

  return (
    <Draggable draggableId={lead.id} index={index} isDragDisabled={!canDrag}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white rounded-lg p-4 border border-slate-200 
            transition-shadow
            ${canDrag ? 'hover:shadow-md cursor-move' : 'cursor-default'}
            ${snapshot.isDragging ? 'shadow-lg' : ''}
          `}
          data-testid={`lead-card-${lead.id}`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-slate-900 text-sm">
              {lead.year} {lead.make} {lead.model}
            </h4>
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          </div>
          <p className="text-xs text-slate-600 mb-2">{lead.location}</p>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">
              Asking: <span className="font-medium text-slate-900">{formatCurrency(lead.askingPrice)}</span>
            </span>
            <span className="text-slate-500">
              Profit: <span className="font-medium text-emerald-600">{formatCurrency(lead.estimatedProfit)}</span>
            </span>
          </div>
          {lead.vaName && (
            <div className="mt-2 text-xs text-slate-500">{lead.vaName}</div>
          )}
          {lead.status === 'SOLD' && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-amber-600 font-medium">Commission Due</span>
              <span className="text-xs text-slate-900 font-medium">
                {formatCurrency((parseFloat(lead.estimatedProfit) * 0.1).toString())}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function StatusColumn({ 
  status, 
  title, 
  color, 
  leads, 
  count, 
  canDrag = true 
}: { 
  status: LeadStatus; 
  title: string; 
  color: string;
  leads: Lead[];
  count: number;
  canDrag?: boolean;
}) {
  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {count}
            </Badge>
          </div>
        </CardHeader>
        <Droppable droppableId={status} isDropDisabled={!canDrag}>
          {(provided, snapshot) => (
            <CardContent
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                p-4 space-y-3 min-h-[500px]
                ${snapshot.isDraggingOver && canDrag ? 'bg-slate-50' : ''}
              `}
            >
              {leads.map((lead, index) => (
                <LeadCard key={lead.id} lead={lead} index={index} canDrag={canDrag} />
              ))}
              {provided.placeholder}
              {leads.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Car className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No leads</p>
                </div>
              )}
            </CardContent>
          )}
        </Droppable>
      </Card>
    </div>
  );
}

export function KanbanBoard({ leads, onDragEnd, canDrag = true }: KanbanBoardProps) {
  // Group leads by status
  const leadsByStatus = leads?.reduce((acc: Record<LeadStatus, Lead[]>, lead: Lead) => {
    if (!acc[lead.status]) acc[lead.status] = [];
    acc[lead.status].push(lead);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>) || {};

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-6 overflow-x-auto pb-6" data-testid="kanban-board">
        {statusColumns.map((column) => (
          <StatusColumn
            key={column.id}
            status={column.id}
            title={column.title}
            color={column.color}
            leads={leadsByStatus[column.id] || []}
            count={leadsByStatus[column.id]?.length || 0}
            canDrag={canDrag}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
