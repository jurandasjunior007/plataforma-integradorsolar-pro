import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Stage {
  id: string;
  name: string;
  position: number;
  color: string | null;
}

interface StageListSidebarProps {
  stages: Stage[];
  selectedStageId: string;
  onSelectStage: (id: string) => void;
  isLoading: boolean;
}

export function StageListSidebar({ stages, selectedStageId, onSelectStage, isLoading }: StageListSidebarProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Etapas</p>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Etapas do Funil
      </p>
      {stages.map((stage, idx) => (
        <button
          key={stage.id}
          onClick={() => onSelectStage(stage.id)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all text-left',
            'hover:bg-muted/60',
            selectedStageId === stage.id
              ? 'bg-primary/8 text-primary border border-primary/20'
              : 'text-muted-foreground border border-transparent'
          )}
        >
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: stage.color ?? 'hsl(var(--muted-foreground))' }}
          />
          <span className="truncate">{stage.name}</span>
          <span className="ml-auto text-[10px] text-muted-foreground/60">{idx + 1}</span>
        </button>
      ))}

      {stages.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Nenhuma etapa encontrada
        </p>
      )}
    </div>
  );
}
