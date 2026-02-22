import { useMemo } from 'react';
import type { DealRow, DealTaskStatus } from '@/hooks/useDeals';
import { KanbanColumn } from './KanbanColumn';

interface Stage {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  position: number;
}

interface KanbanBoardProps {
  stages: Stage[];
  deals: DealRow[];
  taskStatusMap: Record<string, DealTaskStatus>;
  onDealClick: (deal: DealRow) => void;
  onDealMove: (dealId: string, fromStageId: string, newStageId: string) => void;
  onDealDuplicate: (dealId: string) => void;
  onDealDelete: (dealId: string) => void;
}

export function KanbanBoard({ stages, deals, taskStatusMap, onDealClick, onDealMove, onDealDuplicate, onDealDelete }: KanbanBoardProps) {
  const dealsByStage = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    stages.forEach((s) => (map[s.id] = []));
    deals.forEach((d) => {
      if (d.stage_id && map[d.stage_id]) map[d.stage_id].push(d);
    });
    return map;
  }, [stages, deals]);

  return (
    <div className="flex gap-3 p-4 h-full overflow-x-auto scrollbar-thin">
      {[...stages]
        .sort((a, b) => a.position - b.position)
        .map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            taskStatusMap={taskStatusMap}
            onDealClick={onDealClick}
            onDealMove={onDealMove}
            onDealDuplicate={onDealDuplicate}
            onDealDelete={onDealDelete}
          />
        ))}
    </div>
  );
}
