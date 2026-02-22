import type { Stage } from '@/types/crm';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealStageStepperProps {
  stages: Stage[];
  currentStageId: string;
  onStageClick: (stageId: string) => void;
}

export function DealStageStepper({ stages, currentStageId, onStageClick }: DealStageStepperProps) {
  const sorted = [...stages].sort((a, b) => a.position - b.position);
  const currentIdx = sorted.findIndex((s) => s.id === currentStageId);

  return (
    <div className="border-b bg-card px-6 py-3 shrink-0 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {sorted.map((stage, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={stage.id}
              onClick={() => onStageClick(stage.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all relative',
                'hover:bg-muted/60',
                isCurrent && 'bg-primary/8 text-primary border-b-2 border-primary rounded-b-none',
                isPast && 'text-muted-foreground',
                !isPast && !isCurrent && 'text-muted-foreground/60'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold shrink-0 transition-colors',
                  isPast && 'bg-primary/15 text-primary',
                  isCurrent && 'bg-primary text-primary-foreground',
                  !isPast && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isPast ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span className="whitespace-nowrap">{stage.name}</span>

              {idx < sorted.length - 1 && (
                <div className={cn(
                  'ml-2 w-8 h-px',
                  isPast ? 'bg-primary/30' : 'bg-border'
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
