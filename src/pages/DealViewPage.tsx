import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealViewHeader } from '@/components/deals/view/DealViewHeader';
import { DealStageStepper } from '@/components/deals/view/DealStageStepper';
import { DealChecklistPanel } from '@/components/deals/view/DealChecklistPanel';
import { DealTimelinePanel } from '@/components/deals/view/DealTimelinePanel';
import { StageValidationModal } from '@/components/deals/view/StageValidationModal';
import { SolarDimensionCalc } from '@/components/deals/SolarDimensionCalc';
import { NewDealDialog } from '@/components/deals/NewDealDialog';
import { useDealDetail } from '@/hooks/useDealDetail';
import { useStages } from '@/hooks/usePipelines';
import { useDeals } from '@/hooks/useDeals';
import { useStageChecklists } from '@/hooks/useStageChecklists';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function DealViewPage() {
  const { id: dealId } = useParams();
  const navigate = useNavigate();
  const [newDealOpen, setNewDealOpen] = useState(false);

  const { data: deal, isLoading, error } = useDealDetail(dealId);
  const { stages, isLoading: loadingStages } = useStages(deal?.pipeline_id ?? undefined);
  const { moveDeal, createDeal, duplicateDeal, updateDeal } = useDeals(deal?.pipeline_id ?? undefined);
  const { user } = useAuthContext();

  const currentStage = useMemo(
    () => stages.find((s) => s.id === deal?.stage_id) ?? stages[0],
    [deal?.stage_id, stages]
  );

  // Fetch checklists for current stage to validate before advancing
  const { checklists, items: checklistItems } = useStageChecklists(currentStage?.id);

  const [validationModal, setValidationModal] = useState<{
    open: boolean;
    targetStageId: string;
    targetStageName: string;
    pendingItems: { title: string; is_required: boolean; block_stage_advance: boolean }[];
  }>({ open: false, targetStageId: '', targetStageName: '', pendingItems: [] });

  const executeStageMove = useCallback(async (targetStageId: string) => {
    if (!deal) return;
    const fromStageId = deal.stage_id ?? '';
    try {
      await moveDeal.mutateAsync({ dealId: deal.id, fromStageId, toStageId: targetStageId });
      toast({ title: 'Etapa atualizada' });
    } catch (err) {
      console.error('[handleStageChange] Erro ao mover etapa:', err);
      toast({ title: 'Erro ao mover etapa', variant: 'destructive' });
    }
  }, [deal, moveDeal]);

  const handleStageChange = useCallback(async (stageId: string) => {
    if (!deal) return;
    const fromStageId = deal.stage_id ?? '';
    if (stageId === fromStageId) return;

    // Check if moving forward (need checklist validation)
    const fromIdx = stages.findIndex(s => s.id === fromStageId);
    const toIdx = stages.findIndex(s => s.id === stageId);
    const isAdvancing = toIdx > fromIdx;

    if (isAdvancing && checklistItems.length > 0) {
      // Fetch completed checklist items for this deal
      try {
        const { data: completedItems } = await supabase
          .from('deal_checklist_items')
          .select('item_id, completed')
          .eq('deal_id', deal.id)
          .eq('completed', true);

        const completedIds = new Set((completedItems ?? []).map(c => c.item_id));

        // Find pending required/blocking items
        const pendingItems = checklistItems.filter(item => {
          if (completedIds.has(item.id)) return false;
          return item.is_required || item.block_stage_advance;
        }).map(item => ({
          title: item.title,
          is_required: item.is_required,
          block_stage_advance: item.block_stage_advance,
        }));

        if (pendingItems.length > 0) {
          const targetStage = stages.find(s => s.id === stageId);
          setValidationModal({
            open: true,
            targetStageId: stageId,
            targetStageName: targetStage?.name ?? '',
            pendingItems,
          });
          return;
        }
      } catch (err) {
        console.error('[handleStageChange] Erro ao verificar checklist:', err);
      }
    }

    // No blockers — move directly
    await executeStageMove(stageId);
  }, [deal, stages, checklistItems, executeStageMove]);

  const handleValidationConfirm = useCallback(async () => {
    const targetStageId = validationModal.targetStageId;
    setValidationModal(prev => ({ ...prev, open: false }));
    await executeStageMove(targetStageId);
  }, [validationModal.targetStageId, executeStageMove]);

  const handleCreateDeal = async (input: Parameters<typeof createDeal.mutateAsync>[0]) => {
    const result = await createDeal.mutateAsync(input);
    navigate(`/negocios/${result.id}`);
    return result;
  };

  const handleDuplicate = useCallback(async () => {
    if (!deal) return;
    try {
      const { data, error: dupErr } = await supabase
        .from('deals')
        .insert({
          title: `${deal.title} — Cópia`,
          pipeline_id: deal.pipeline_id,
          stage_id: stages[0]?.id ?? deal.stage_id,
          value: deal.value ?? 0,
          contact_id: deal.contact_id,
          organization_id: deal.organization_id,
          owner_id: user?.id ?? null,
          company_id: deal.company_id,
          position: 0,
          status: 'open',
          entered_pipeline_at: new Date().toISOString(),
          entered_stage_at: new Date().toISOString(),
        } as any)
        .select()
        .single();
      if (dupErr) throw dupErr;
      toast({ title: 'Negócio duplicado com sucesso' });
      navigate(`/negocios/${data.id}`);
    } catch {
      toast({ title: 'Erro ao duplicar negócio', variant: 'destructive' });
    }
  }, [deal, stages, user, navigate]);

  const handleSaveSolar = useCallback(async (solarData: Record<string, unknown>) => {
    if (!deal) return;
    try {
      const existingFields = (deal.custom_fields as Record<string, unknown>) ?? {};
      await supabase
        .from('deals')
        .update({ custom_fields: { ...existingFields, ...solarData }, updated_at: new Date().toISOString() } as any)
        .eq('id', deal.id);
    } catch {
      toast({ title: 'Erro ao salvar dimensionamento', variant: 'destructive' });
    }
  }, [deal]);

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
        onDuplicate={handleDuplicate}
      />

      <DealStageStepper
        stages={stages as any[]}
        currentStageId={deal.stage_id ?? ''}
        onStageClick={handleStageChange}
      />

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
          <div className="col-span-12 md:col-span-12 lg:col-span-4 space-y-6">
            <DealChecklistPanel stage={currentStage as any} dealId={deal.id} />
            <SolarDimensionCalc
              dealValue={deal.value ?? undefined}
              initialData={{
                consumo: (deal.custom_fields as any)?.solar_consumo,
                tarifa: (deal.custom_fields as any)?.solar_tarifa,
                estado: (deal.custom_fields as any)?.solar_estado,
                perdas: (deal.custom_fields as any)?.solar_perdas,
              }}
              onSave={handleSaveSolar}
            />
          </div>
          <div className="col-span-12 md:col-span-12 lg:col-span-8">
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
        onConfirm={handleValidationConfirm}
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
