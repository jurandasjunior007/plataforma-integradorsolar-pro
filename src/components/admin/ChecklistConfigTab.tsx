import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Copy, Trash2, Pencil, List, GitBranch } from 'lucide-react';
import { useStageChecklists } from '@/hooks/useStageChecklists';
import { ChecklistEditorDialog } from '@/components/admin/ChecklistEditorDialog';
import { DuplicateChecklistDialog } from '@/components/admin/DuplicateChecklistDialog';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ChecklistConfigTabProps {
  stageId: string;
  pipelineId: string;
  stages: { id: string; name: string }[];
}

export function ChecklistConfigTab({ stageId, pipelineId, stages }: ChecklistConfigTabProps) {
  const {
    checklists, items, rules, isLoading,
    createChecklist, updateChecklist, deleteChecklist, duplicateChecklist,
  } = useStageChecklists(stageId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      const result = await createChecklist.mutateAsync({
        title: 'Novo Checklist',
        stage_id: stageId,
      });
      setEditingId(result.id);
    } catch {
      toast({ title: 'Erro ao criar checklist', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChecklist.mutateAsync(id);
      toast({ title: 'Checklist excluído' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await updateChecklist.mutateAsync({ id, is_active: !current });
  };

  const handleDuplicate = async (checklistId: string, targetStageId: string) => {
    try {
      await duplicateChecklist.mutateAsync({ checklistId, targetStageId });
      toast({ title: 'Checklist duplicado com sucesso' });
      setDuplicatingId(null);
    } catch {
      toast({ title: 'Erro ao duplicar', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
      </div>
    );
  }

  const getItemsCount = (clId: string) => items.filter(i => i.checklist_id === clId).length;
  const getRulesCount = (clId: string) => rules.filter(r => r.checklist_id === clId).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Checklists da etapa</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5" />
            Novo Checklist
          </Button>
        </div>
      </div>

      {checklists.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <List className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum checklist configurado para esta etapa</p>
            <Button size="sm" variant="link" className="mt-2 text-xs" onClick={handleCreate}>
              Criar primeiro checklist →
            </Button>
          </CardContent>
        </Card>
      ) : (
        checklists.map((cl) => (
          <Card key={cl.id} className={!cl.is_active ? 'opacity-60' : ''}>
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{cl.title}</h4>
                    {!cl.is_active && <Badge variant="secondary" className="text-[10px]">Inativo</Badge>}
                    {cl.block_stage_advance && (
                      <Badge variant="destructive" className="text-[10px]">Bloqueia avanço</Badge>
                    )}
                  </div>
                  {cl.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{cl.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <List className="h-3 w-3" />
                      {getItemsCount(cl.id)} itens
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {getRulesCount(cl.id)} regras
                    </span>
                    <span>v{cl.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={cl.is_active}
                    onCheckedChange={() => handleToggleActive(cl.id, cl.is_active)}
                    className="mr-1"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(cl.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDuplicatingId(cl.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cl.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {editingId && (
        <ChecklistEditorDialog
          checklistId={editingId}
          stageId={stageId}
          onClose={() => setEditingId(null)}
        />
      )}

      {duplicatingId && (
        <DuplicateChecklistDialog
          checklistId={duplicatingId}
          stages={stages}
          currentStageId={stageId}
          onDuplicate={handleDuplicate}
          onClose={() => setDuplicatingId(null)}
        />
      )}
    </div>
  );
}
