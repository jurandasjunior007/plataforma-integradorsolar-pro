import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealViewHeader } from '@/components/deals/view/DealViewHeader';
import { DealStageStepper } from '@/components/deals/view/DealStageStepper';
import { DealChecklistPanel } from '@/components/deals/view/DealChecklistPanel';
import { DealTimelinePanel } from '@/components/deals/view/DealTimelinePanel';
import { StageValidationModal } from '@/components/deals/view/StageValidationModal';
import { NewDealDialog } from '@/components/deals/NewDealDialog';
import { useDealDetail } from '@/hooks/useDealDetail';
import { useStages } from '@/hooks/usePipelines';
import { useDeals } from '@/hooks/useDeals';
import { toast } from '@/hooks/use-toast';

export default function DealViewPage() {
  const { id: dealId } = useParams();
  const navigate = useNavigate();
  const [newDealOpen, setNewDealOpen] = useState(false);

  console.log('[DealViewPage] dealId from params:', dealId);

  const { data: deal, isLoading, error } = useDealDetail(dealId);
  const { stages, isLoading: loadingStages } = useStages(deal?.pipeline_id ?? undefined);
  const { moveDeal, createDeal } = useDeals(deal?.pipeline_id ?? undefined);

  console.log('[DealViewPage] deal loaded:', deal?.id, deal?.title);

  const [validationModal, setValidationModal] = useState<{
    open: boolean;
    targetStageId: string;
    targetStageName: string;
    pendingItems: { title: string; is_required: boolean; block_stage_advance: boolean }[];
  }>({ open: false, targetStageId: '', targetStageName: '', pendingItems: [] });

  const currentStage = useMemo(
    () => stages.find((s) => s.id === deal?.stage_id) ?? stages[0],
    [deal?.stage_id, stages]
  );

  const handleStageChange = useCallback(async (stageId: string) => {
    if (!deal) return;
    const fromStageId = deal.stage_id ?? '';
    if (stageId === fromStageId) return;

    try {
      await moveDeal.mutateAsync({ dealId: deal.id, fromStageId, toStageId: stageId });
      toast({ title: 'Etapa atualizada' });
    } catch {
      toast({ title: 'Erro ao mover etapa', variant: 'destructive' });
    }
  }, [deal, moveDeal]);

  const handleCreateDeal = async (input: Parameters<typeof createDeal.mutateAsync>[0]) => {
    const result = await createDeal.mutateAsync(input);
    navigate(`/negocios/${result.id}`);
    return result;
  };

  if (isLoading || loadingStages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">Negócio não encontrado</p>
          <p className="text-sm text-muted-foreground">O negócio solicitado não existe ou foi removido.</p>
          <Button variant="outline" onClick={() => navigate('/negocios')}>
            ← Voltar para Negócios
          </Button>
        </div>
      </div>
    );
  }

  // Build a Deal-like object for components that expect the old type
  const dealForComponents = {
    ...deal,
    stage_id: deal.stage_id ?? '',
    value: deal.value ?? 0,
    tags: deal.tags ?? [],
    custom_fields: deal.custom_fields ?? {},
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <DealViewHeader
        deal={dealForComponents as any}
        stage={currentStage as any}
        pipelineName={deal.pipeline?.name ?? ''}
        onBack={() => navigate('/negocios')}
      />

      <DealStageStepper
        stages={stages as any[]}
        currentStageId={deal.stage_id ?? ''}
        onStageClick={handleStageChange}
      />

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
          <div className="col-span-12 lg:col-span-4">
            <DealChecklistPanel stage={currentStage as any} />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <DealTimelinePanel
              deal={dealForComponents as any}
              dealId={deal.id}
              contactId={deal.contact_id ?? undefined}
              onNewDeal={() => setNewDealOpen(true)}
            />
          </div>
        </div>
      </div>

      <StageValidationModal
        open={validationModal.open}
        onClose={() => setValidationModal(prev => ({ ...prev, open: false }))}
        onConfirm={() => setValidationModal(prev => ({ ...prev, open: false }))}
        pendingItems={validationModal.pendingItems}
        targetStageName={validationModal.targetStageName}
      />

      <NewDealDialog
        open={newDealOpen}
        onClose={() => setNewDealOpen(false)}
        stages={stages}
        pipelineId={deal.pipeline_id}
        onCreateDeal={handleCreateDeal}
      />
    </div>
  );
}
