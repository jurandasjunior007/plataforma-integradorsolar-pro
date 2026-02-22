import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Eye, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { NewDealDialog } from '@/components/deals/NewDealDialog';
import { usePipelines, useStages } from '@/hooks/usePipelines';
import { useDeals } from '@/hooks/useDeals';
import type { DealRow } from '@/hooks/useDeals';
import { toast } from '@/hooks/use-toast';

export default function DealsPage() {
  const navigate = useNavigate();
  const { pipelines, isLoading: loadingPipelines } = usePipelines();
  const [selectedPipeline, setSelectedPipeline] = useState('');
  const [newDealOpen, setNewDealOpen] = useState(false);

  // Auto-select first pipeline
  if (!selectedPipeline && pipelines.length > 0) {
    setSelectedPipeline(pipelines[0].id);
  }

  const { stages, isLoading: loadingStages } = useStages(selectedPipeline || undefined);
  const { deals, taskStatusMap, isLoading: loadingDeals, createDeal, moveDeal, deleteDeal, duplicateDeal } = useDeals(selectedPipeline || undefined);

  const handleDealClick = (deal: DealRow) => {
    navigate(`/negocios/${deal.id}`);
  };

  const handleDealMove = async (dealId: string, fromStageId: string, newStageId: string) => {
    try {
      await moveDeal.mutateAsync({ dealId, fromStageId, toStageId: newStageId });
    } catch {
      toast({ title: 'Erro ao mover negócio', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (dealId: string) => {
    try {
      await duplicateDeal.mutateAsync(dealId);
      toast({ title: 'Negócio duplicado' });
    } catch {
      toast({ title: 'Erro ao duplicar', variant: 'destructive' });
    }
  };

  const handleDelete = async (dealId: string) => {
    try {
      await deleteDeal.mutateAsync(dealId);
      toast({ title: 'Negócio excluído' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const handleCreateDeal = async (input: Parameters<typeof createDeal.mutateAsync>[0]) => {
    return createDeal.mutateAsync(input);
  };

  const pipelineSelector = (
    <div className="flex items-center gap-2">
      <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
        <SelectTrigger className="h-9 w-[220px] bg-secondary border-none">
          <SelectValue placeholder="Selecionar funil" />
        </SelectTrigger>
        <SelectContent>
          {pipelines.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" className="gap-1 h-9">
        <Eye className="h-3.5 w-3.5" />
        Exibir
        <ChevronDown className="h-3 w-3" />
      </Button>

      <Button variant="outline" size="sm" className="gap-1 h-9">
        <Filter className="h-3.5 w-3.5" />
        Filtros
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  );

  const isLoading = loadingPipelines || loadingStages || loadingDeals;

  return (
    <>
      <TopBar onNewDeal={() => setNewDealOpen(true)} pipelineSelector={pipelineSelector} />
      <div className="flex-1 overflow-hidden bg-background">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : stages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {pipelines.length === 0 ? 'Nenhum funil configurado.' : 'Nenhuma etapa configurada neste funil.'}
              </p>
              <Button variant="link" size="sm" onClick={() => navigate('/admin')}>
                Ir para Administração →
              </Button>
            </div>
          </div>
        ) : (
          <KanbanBoard
            stages={stages}
            deals={deals}
            taskStatusMap={taskStatusMap}
            onDealClick={handleDealClick}
            onDealMove={handleDealMove}
            onDealDuplicate={handleDuplicate}
            onDealDelete={handleDelete}
          />
        )}
      </div>

      <NewDealDialog
        open={newDealOpen}
        onClose={() => setNewDealOpen(false)}
        stages={stages}
        pipelineId={selectedPipeline}
        onCreateDeal={handleCreateDeal}
      />
    </>
  );
}
