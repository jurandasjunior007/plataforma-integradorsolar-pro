import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import type { Deal, Stage } from '@/types/crm';
import { DealViewHeader } from '@/components/deals/view/DealViewHeader';
import { DealStageStepper } from '@/components/deals/view/DealStageStepper';
import { DealChecklistPanel } from '@/components/deals/view/DealChecklistPanel';
import { DealTimelinePanel } from '@/components/deals/view/DealTimelinePanel';
import { StageValidationModal } from '@/components/deals/view/StageValidationModal';

// Mock data - same stages as DealsPage
const mockStages: Stage[] = [
  { id: 's1', pipeline_id: 'p1', company_id: 'c1', name: 'Abordagem', icon: '💎', color: '#6366f1', position: 0 },
  { id: 's2', pipeline_id: 'p1', company_id: 'c1', name: 'Proposta', icon: '📋', color: '#f59e0b', position: 1 },
  { id: 's3', pipeline_id: 'p1', company_id: 'c1', name: 'Negociação', icon: '📄', color: '#10b981', position: 2 },
  { id: 's4', pipeline_id: 'p1', company_id: 'c1', name: 'Assinatura', icon: '⚙️', color: '#8b5cf6', position: 3 },
  { id: 's5', pipeline_id: 'p1', company_id: 'c1', name: 'Pagamento', icon: '✅', color: '#ef4444', position: 4 },
];

const mockDeal: Deal = {
  id: 'd1',
  company_id: 'c1',
  pipeline_id: 'p1',
  stage_id: 's2',
  title: 'Maria Silva (#1001)',
  value: 45000,
  tags: ['residencial'],
  custom_fields: {},
  position: 0,
  created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  contact: { id: 'ct1', company_id: 'c1', name: 'Maria Silva', email: 'maria@email.com', created_at: '' },
  owner: { id: 'u1', company_id: 'c1', full_name: 'João Vendedor', email: 'joao@demo.com', is_active: true },
};

// Mock pending items for validation demo
const mockPendingItems = [
  { title: 'Visita técnica realizada', is_required: true, block_stage_advance: true },
  { title: 'Fotos do local enviadas', is_required: true, block_stage_advance: true },
  { title: 'Projeto dimensionado', is_required: true, block_stage_advance: false },
];

export default function DealViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal>(mockDeal);
  const [validationModal, setValidationModal] = useState<{
    open: boolean;
    targetStageId: string;
    targetStageName: string;
    pendingItems: typeof mockPendingItems;
  }>({ open: false, targetStageId: '', targetStageName: '', pendingItems: [] });

  const currentStage = useMemo(
    () => mockStages.find((s) => s.id === deal.stage_id) ?? mockStages[0],
    [deal.stage_id]
  );

  const handleStageChange = useCallback((stageId: string) => {
    const targetStage = mockStages.find(s => s.id === stageId);
    if (!targetStage) return;

    // Check if moving forward
    const currentIdx = mockStages.findIndex(s => s.id === deal.stage_id);
    const targetIdx = mockStages.findIndex(s => s.id === stageId);

    if (targetIdx > currentIdx) {
      // TODO: Replace with real checklist validation from DB
      const pending = mockPendingItems.filter(i => i.is_required);
      if (pending.length > 0) {
        setValidationModal({
          open: true,
          targetStageId: stageId,
          targetStageName: targetStage.name,
          pendingItems: pending,
        });
        return;
      }
    }

    setDeal((prev) => ({ ...prev, stage_id: stageId }));
  }, [deal.stage_id]);

  const handleForceAdvance = () => {
    setDeal((prev) => ({ ...prev, stage_id: validationModal.targetStageId }));
    setValidationModal(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <DealViewHeader
        deal={deal}
        stage={currentStage}
        pipelineName="Vendas - Energia Solar"
        onBack={() => navigate('/negocios')}
      />

      {/* Stepper */}
      <DealStageStepper
        stages={mockStages}
        currentStageId={deal.stage_id}
        onStageClick={handleStageChange}
      />

      {/* Main grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
          {/* Left column - Checklists */}
          <div className="col-span-12 lg:col-span-4">
            <DealChecklistPanel stage={currentStage} />
          </div>

          {/* Right column - Timeline & Tabs */}
          <div className="col-span-12 lg:col-span-8">
            <DealTimelinePanel deal={deal} />
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      <StageValidationModal
        open={validationModal.open}
        onClose={() => setValidationModal(prev => ({ ...prev, open: false }))}
        onConfirm={handleForceAdvance}
        pendingItems={validationModal.pendingItems}
        targetStageName={validationModal.targetStageName}
      />
    </div>
  );
}
