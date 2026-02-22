import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Eye, Settings, ChevronDown } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { DealDrawer } from '@/components/deals/DealDrawer';
import { NewDealDialog } from '@/components/deals/NewDealDialog';
import type { Deal, Stage } from '@/types/crm';

// Mock data
const mockStages: Stage[] = [
  { id: 's1', pipeline_id: 'p1', company_id: 'c1', name: 'Abordagem/Qualificação', icon: '💎', color: '#6366f1', position: 0 },
  { id: 's2', pipeline_id: 'p1', company_id: 'c1', name: 'Apresentação Proposta', icon: '📋', color: '#f59e0b', position: 1 },
  { id: 's3', pipeline_id: 'p1', company_id: 'c1', name: 'Negociação / Fechamento', icon: '📄', color: '#10b981', position: 2 },
  { id: 's4', pipeline_id: 'p1', company_id: 'c1', name: 'Trâmites Negociais', icon: '⚙️', color: '#8b5cf6', position: 3 },
  { id: 's5', pipeline_id: 'p1', company_id: 'c1', name: 'Assinatura de Contrato', icon: '✅', color: '#ef4444', position: 4 },
];

const generateDeals = (): Deal[] => {
  const names = [
    'Maria Silva', 'João Santos', 'Carlos Ferreira', 'Ana Oliveira', 'Pedro Costa',
    'Lucia Almeida', 'Ricardo Lima', 'Fernanda Souza', 'Eduardo Ribeiro', 'Patricia Nunes',
  ];
  return names.map((name, i) => ({
    id: `d${i + 1}`,
    company_id: 'c1',
    pipeline_id: 'p1',
    stage_id: mockStages[i % 5].id,
    title: `${name} (#${1000 + i})`,
    value: Math.floor(Math.random() * 80000) + 10000,
    tags: [],
    custom_fields: {},
    position: i,
    created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    contact: { id: `ct${i}`, company_id: 'c1', name, email: `${name.toLowerCase().replace(' ', '.')}@email.com`, created_at: '' },
    owner: { id: `u1`, company_id: 'c1', full_name: 'Vendedor Demo', email: 'vendedor@demo.com', is_active: true },
  }));
};

export default function DealsPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>(generateDeals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState('p1');

  const handleDealClick = (deal: Deal) => {
    navigate(`/negocios/${deal.id}`);
  };

  const handleDealMove = (dealId: string, newStageId: string) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId } : d))
    );
  };

  const pipelineSelector = (
    <div className="flex items-center gap-2">
      <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
        <SelectTrigger className="h-9 w-[220px] bg-secondary border-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p1">🔆 Vendas - Energia Solar</SelectItem>
          <SelectItem value="p2">🔧 Pós-Venda</SelectItem>
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

      <Button variant="outline" size="sm" className="gap-1 h-9">
        <Settings className="h-3.5 w-3.5" />
        Menu
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  );

  return (
    <>
      <TopBar onNewDeal={() => setNewDealOpen(true)} pipelineSelector={pipelineSelector} />
      <div className="flex-1 overflow-hidden bg-kanban-bg">
        <KanbanBoard
          stages={mockStages}
          deals={deals}
          onDealClick={handleDealClick}
          onDealMove={handleDealMove}
        />
      </div>

      <DealDrawer
        deal={selectedDeal}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <NewDealDialog
        open={newDealOpen}
        onClose={() => setNewDealOpen(false)}
        stages={mockStages}
      />
    </>
  );
}
