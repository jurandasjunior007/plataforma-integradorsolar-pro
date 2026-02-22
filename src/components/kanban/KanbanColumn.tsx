import type { DealRow, DealTaskStatus } from '@/hooks/useDeals';
import { DealCard } from './DealCard';
import { MoreHorizontal, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Stage {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  position: number;
}

interface KanbanColumnProps {
  stage: Stage;
  deals: DealRow[];
  taskStatusMap: Record<string, DealTaskStatus>;
  onDealClick: (deal: DealRow) => void;
  onDealMove: (dealId: string, fromStageId: string, newStageId: string) => void;
  onDealDuplicate: (dealId: string) => void;
  onDealDelete: (dealId: string) => void;
}

export function KanbanColumn({ stage, deals, taskStatusMap, onDealClick, onDealMove, onDealDuplicate, onDealDelete }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    const fromStageId = e.dataTransfer.getData('application/stage-id');
    if (dealId && fromStageId !== stage.id) {
      onDealMove(dealId, fromStageId, stage.id);
    }
  };

  return (
    <div
      className="flex flex-col min-w-[280px] max-w-[300px] w-[280px] shrink-0"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="bg-muted/50 rounded-t-lg px-3 py-2.5 border border-b-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            {stage.icon && <span className="text-sm">{stage.icon}</span>}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span>·</span>
          <span>{deals.length} negócio{deals.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto bg-muted/20 border border-t-0 rounded-b-lg p-2 space-y-2 scrollbar-thin min-h-[200px]">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            taskStatus={taskStatusMap[deal.id]}
            onClick={() => onDealClick(deal)}
            onDuplicate={() => onDealDuplicate(deal.id)}
            onDelete={() => onDealDelete(deal.id)}
          />
        ))}
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/60">
            Arraste negócios para cá
          </div>
        )}
      </div>
    </div>
  );
}
