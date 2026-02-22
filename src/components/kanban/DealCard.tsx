import type { DealRow, DealTaskStatus } from '@/hooks/useDeals';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal, Copy, Trash2, Pencil, Clock, Timer,
  CheckCircle2, AlertTriangle, AlertCircle, Circle,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DealCardProps {
  deal: DealRow;
  taskStatus?: DealTaskStatus;
  onClick: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function DealCard({ deal, taskStatus, onClick, onDuplicate, onDelete }: DealCardProps) {
  const ownerInitials = deal.owner?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  const daysInStage = Math.max(0, Math.floor(
    (Date.now() - new Date(deal.entered_stage_at).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const daysInPipeline = Math.max(0, Math.floor(
    (Date.now() - new Date(deal.entered_pipeline_at).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.setData('application/stage-id', deal.stage_id ?? '');
    e.dataTransfer.effectAllowed = 'move';
  };

  // Task status icon
  const renderTaskIcon = () => {
    if (!taskStatus || !taskStatus.has_any_task_open) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Sem tarefa aberta</TooltipContent>
        </Tooltip>
      );
    }
    if (taskStatus.has_overdue_task) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Tarefa vencida!</TooltipContent>
        </Tooltip>
      );
    }
    if (taskStatus.due_today) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Tarefa vence hoje</TooltipContent>
        </Tooltip>
      );
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">Tarefa futura agendada</TooltipContent>
      </Tooltip>
    );
  };

  const displayName = deal.contact?.name ?? deal.organization?.name ?? '';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-card hover:bg-accent/30 border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm group"
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-sm leading-tight truncate flex-1 mr-2">{deal.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onClick()}>
              <Pencil className="h-3 w-3 mr-2" />Editar
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-3 w-3 mr-2" />Duplicar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-3 w-3 mr-2" />Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {displayName && (
        <p className="text-xs text-muted-foreground truncate mb-2">{displayName}</p>
      )}

      {(deal.value ?? 0) > 0 && (
        <div className="mb-2">
          <span className="text-sm font-semibold">
            {(deal.value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">
              {ownerInitials}
            </AvatarFallback>
          </Avatar>
          {renderTaskIcon()}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 h-5 gap-0.5">
            <Timer className="h-2.5 w-2.5" />
            {daysInStage}d
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 h-5 gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {daysInPipeline}d
          </Badge>
        </div>
      </div>
    </div>
  );
}
