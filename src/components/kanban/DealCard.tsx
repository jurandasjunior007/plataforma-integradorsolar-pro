import type { DealRow, DealTaskStatus } from '@/hooks/useDeals';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Copy, Pencil, CheckCircle2, AlertTriangle, AlertCircle, Circle, Timer,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DealCardProps {
  deal: DealRow;
  taskStatus?: DealTaskStatus;
  onClick: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function DealCard({ deal, taskStatus, onClick, onDuplicate }: DealCardProps) {
  const ownerInitials = deal.owner?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  const daysInStage = Math.max(0, Math.floor(
    (Date.now() - new Date(deal.entered_stage_at).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.setData('application/stage-id', deal.stage_id ?? '');
    e.dataTransfer.effectAllowed = 'move';
  };

  const renderTaskIcon = () => {
    if (!taskStatus || !taskStatus.has_any_task_open) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Circle className="h-3 w-3 text-muted-foreground/40" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Sem tarefa aberta</TooltipContent>
        </Tooltip>
      );
    }
    if (taskStatus.has_overdue_task) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-3 w-3 text-destructive" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Tarefa vencida!</TooltipContent>
        </Tooltip>
      );
    }
    if (taskStatus.due_today) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle className="h-3 w-3 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Tarefa vence hoje</TooltipContent>
        </Tooltip>
      );
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCircle2 className="h-3 w-3 text-primary" />
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
      {/* Row 1: Title + action icons */}
      <div className="flex items-start justify-between mb-0.5">
        <h4 className="font-semibold text-sm leading-tight truncate flex-1 mr-2">{deal.title}</h4>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Row 2: Client name + value */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground truncate flex-1 mr-2">{displayName || '\u00A0'}</span>
        {(deal.value ?? 0) > 0 && (
          <span className="text-xs font-semibold whitespace-nowrap">
            {(deal.value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        )}
      </div>

      {/* Row 3: Avatar + task icon + days badge */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">
              {ownerInitials}
            </AvatarFallback>
          </Avatar>
          {renderTaskIcon()}
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] font-medium px-1.5 py-0.5">
          <Timer className="h-2.5 w-2.5" />
          {daysInStage}d
        </span>
      </div>
    </div>
  );
}
