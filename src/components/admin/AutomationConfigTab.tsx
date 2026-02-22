import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Pencil, Zap } from 'lucide-react';
import { useStageAutomations } from '@/hooks/useStageAutomations';
import { AutomationEditorDialog } from '@/components/admin/AutomationEditorDialog';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface AutomationConfigTabProps {
  stageId: string;
  pipelineId: string;
}

const triggerLabels: Record<string, string> = {
  enter_stage: 'Entrou na etapa',
  leave_stage: 'Saiu da etapa',
  field_changed: 'Campo alterado',
};

export function AutomationConfigTab({ stageId, pipelineId }: AutomationConfigTabProps) {
  const {
    automations, isLoading,
    createAutomation, updateAutomation, deleteAutomation,
  } = useStageAutomations(stageId);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      const result = await createAutomation.mutateAsync({
        name: 'Nova Automação',
        trigger_event: 'enter_stage',
        stage_id: stageId,
        pipeline_id: pipelineId,
      });
      setEditingId((result as any).id);
    } catch {
      toast({ title: 'Erro ao criar automação', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomation.mutateAsync(id);
      toast({ title: 'Automação excluída' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await updateAutomation.mutateAsync({ id, is_active: !current });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Automações da etapa</h3>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleCreate}>
          <Plus className="h-3.5 w-3.5" />
          Nova Automação
        </Button>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhuma automação configurada para esta etapa</p>
            <Button size="sm" variant="link" className="mt-2 text-xs" onClick={handleCreate}>
              Criar primeira automação →
            </Button>
          </CardContent>
        </Card>
      ) : (
        automations.map((auto) => (
          <Card key={auto.id} className={!auto.is_active ? 'opacity-60' : ''}>
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <h4 className="text-sm font-medium truncate">{auto.name}</h4>
                    {!auto.is_active && <Badge variant="secondary" className="text-[10px]">Inativa</Badge>}
                  </div>
                  {auto.description && (
                    <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{auto.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {triggerLabels[auto.trigger_event] ?? auto.trigger_event}
                    </Badge>
                    <span>→ {auto.action_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={auto.is_active}
                    onCheckedChange={() => handleToggleActive(auto.id, auto.is_active)}
                    className="mr-1"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(auto.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(auto.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {editingId && (
        <AutomationEditorDialog
          automationId={editingId}
          stageId={stageId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
