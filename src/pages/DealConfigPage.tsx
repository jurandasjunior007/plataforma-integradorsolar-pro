import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePipelines, useStages } from '@/hooks/usePipelines';
import { CheckSquare, Workflow, Layers } from 'lucide-react';
import { StageListSidebar } from '@/components/admin/StageListSidebar';
import { ChecklistConfigTab } from '@/components/admin/ChecklistConfigTab';
import { AutomationConfigTab } from '@/components/admin/AutomationConfigTab';

export default function DealConfigPage() {
  const { pipelines, isLoading: loadingPipelines } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const { stages, isLoading: loadingStages } = useStages(selectedPipelineId || undefined);
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  // Auto-select first pipeline
  if (!selectedPipelineId && pipelines.length > 0) {
    setSelectedPipelineId(pipelines[0].id);
  }

  // Auto-select first stage
  if (!selectedStageId && stages.length > 0 && selectedPipelineId) {
    setSelectedStageId(stages[0].id);
  }

  // Reset stage when pipeline changes
  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setSelectedStageId('');
  };

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Configuração de Negócios</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Gerencie checklists e automações por etapa do funil</p>
          </div>
          <Select value={selectedPipelineId} onValueChange={handlePipelineChange}>
            <SelectTrigger className="w-[240px]">
              <Layers className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Selecione um funil" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedPipelineId ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            {loadingPipelines ? 'Carregando funis...' : 'Selecione um funil para configurar'}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-5">
            {/* Left: Stage List */}
            <div className="col-span-12 lg:col-span-3">
              <StageListSidebar
                stages={stages}
                selectedStageId={selectedStageId}
                onSelectStage={setSelectedStageId}
                isLoading={loadingStages}
              />
            </div>

            {/* Right: Config Tabs */}
            <div className="col-span-12 lg:col-span-9">
              {!selectedStageId ? (
                <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                  Selecione uma etapa para configurar
                </div>
              ) : (
                <Tabs defaultValue="checklists">
                  <TabsList>
                    <TabsTrigger value="checklists" className="gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5" />
                      Checklists
                    </TabsTrigger>
                    <TabsTrigger value="automations" className="gap-1.5">
                      <Workflow className="h-3.5 w-3.5" />
                      Automações
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="checklists" className="mt-4">
                    <ChecklistConfigTab
                      stageId={selectedStageId}
                      pipelineId={selectedPipelineId}
                      stages={stages}
                    />
                  </TabsContent>

                  <TabsContent value="automations" className="mt-4">
                    <AutomationConfigTab
                      stageId={selectedStageId}
                      pipelineId={selectedPipelineId}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
