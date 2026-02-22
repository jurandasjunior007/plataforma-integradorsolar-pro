import { useMemo } from 'react';
import type { Deal, Stage } from '@/types/crm';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  stages: Stage[];
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDealMove: (dealId: string, newStageId: string) => void;
}

export function KanbanBoard({ stages, deals, onDealClick, onDealMove }: KanbanBoardProps) {
  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    stages.forEach((s) => (map[s.id] = []));
    deals.forEach((d) => {
      if (map[d.stage_id]) map[d.stage_id].push(d);
    });
    return map;
  }, [stages, deals]);

  return (
    <div className="flex gap-3 p-4 h-full overflow-x-auto scrollbar-thin">
      {stages
        .sort((a, b) => a.position - b.position)
        .map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            onDealClick={onDealClick}
            onDealMove={onDealMove}
          />
        ))}
    </div>
  );
}
