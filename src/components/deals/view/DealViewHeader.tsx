import type { Deal, Stage } from '@/types/crm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreHorizontal, XCircle } from 'lucide-react';

interface DealViewHeaderProps {
  deal: Deal;
  stage: Stage;
  pipelineName: string;
  onBack: () => void;
  onDuplicate?: () => void;
  checklistProgress?: { completed: number; total: number; hasBlockers: boolean };
}

export function DealViewHeader({ deal, stage, pipelineName, onBack, onDuplicate, checklistProgress }: DealViewHeaderProps) {
  const ownerInitials = deal.owner?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <div className="border-b bg-card px-6 py-4 shrink-0">
      <div className="flex items-center gap-3 mb-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-semibold leading-tight truncate">
              {deal.contact?.name ?? deal.title}
            </h1>
            <Badge variant="secondary" className="text-xs font-normal">
              {pipelineName}
            </Badge>
            <Badge
              className="text-xs font-medium"
              style={{
                backgroundColor: `${stage.color}18`,
                color: stage.color,
                borderColor: `${stage.color}40`,
              }}
            >
              {stage.name}
            </Badge>
          </div>

          {/* Checklist progress bar */}
          {checklistProgress && checklistProgress.total > 0 && (
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[200px]">
                <div
                  className={`h-full rounded-full transition-all ${
                    checklistProgress.hasBlockers
                      ? 'bg-destructive'
                      : checklistProgress.completed === checklistProgress.total
                      ? 'bg-green-500'
                      : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.round((checklistProgress.completed / checklistProgress.total) * 100)}%`
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {checklistProgress.completed}/{checklistProgress.total} checklist
              </span>
              {checklistProgress.hasBlockers && (
                <span className="text-[11px] text-destructive font-medium">● Bloqueado</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 pl-11">
        <span className="text-lg font-medium text-foreground">
          {(deal.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>

        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
              {ownerInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{deal.owner?.full_name}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="destructive" size="sm" className="gap-1.5 h-8">
            <XCircle className="h-3.5 w-3.5" />
            Perder
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <MoreHorizontal className="h-4 w-4" />
                Opções
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar negócio</DropdownMenuItem>
              <DropdownMenuItem>Transferir responsável</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>Duplicar negócio</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Excluir negócio</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
