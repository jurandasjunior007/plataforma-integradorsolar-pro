import { useState } from 'react';
import type { Deal, Stage } from '@/types/crm';
import { DealCard } from './DealCard';
import { MoreHorizontal, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDealMove: (dealId: string, newStageId: string) => void;
}

export function KanbanColumn({ stage, deals, onDealClick, onDealMove }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) onDealMove(dealId, stage.id);
  };

  return (
    <div
      className="flex flex-col min-w-[280px] max-w-[300px] w-[280px] shrink-0"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="bg-kanban-column rounded-t-lg px-3 py-2.5 border border-b-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{stage.icon}</span>
            <h3 className="font-semibold text-sm truncate">{stage.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Settings className="h-3 w-3 mr-2" />Configurar etapa</DropdownMenuItem>
              <DropdownMenuItem>Editar checklists</DropdownMenuItem>
              <DropdownMenuItem>Campos obrigatórios</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span>-</span>
          <span>{deals.length} negócios</span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto bg-kanban-column/50 border border-t-0 rounded-b-lg p-2 space-y-2 scrollbar-thin min-h-[200px]">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
        ))}
      </div>
    </div>
  );
}
