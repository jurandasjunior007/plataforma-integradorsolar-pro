import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ListTodo, Loader2 } from 'lucide-react';
import { useStageAutomations } from '@/hooks/useStageAutomations';
import { toast } from '@/hooks/use-toast';

interface AutoTaskConfigTabProps {
  stageId: string;
  pipelineId: string;
}

export function AutoTaskConfigTab({ stageId, pipelineId }: AutoTaskConfigTabProps) {
  const {
    automations,
    isLoading,
    createAutomation,
    updateAutomation,
    deleteAutomation,
  } = useStageAutomations(stageId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [dueDays, setDueDays] = useState(3);
  const [priority, setPriority] = useState('normal');

  const taskAutomations = automations.filter(
    a => a.trigger_event === 'stage_enter' && a.action_type === 'create_task'
  );

  const handleCreate = async () => {
    if (!taskTitle.trim()) return;
    try {
      await createAutomation.mutateAsync({
        name: taskTitle.trim(),
        description: taskDesc || undefined,
        trigger_event: 'stage_enter',
        stage_id: stageId,
        pipeline_id: pipelineId,
      });

      // Update the automation with action_config
      // The automation is created, now we need to update with config
      // For simplicity, we store config in the automation's action_config
      const { data: latest } = await import('@/integrations/supabase/client').then(m =>
        m.supabase
          .from('automations')
          .select('id')
          .eq('stage_id', stageId)
          .eq('name', taskTitle.trim())
          .eq('trigger_event', 'stage_enter')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      );

      if (latest) {
        await import('@/integrations/supabase/client').then(m =>
          m.supabase
            .from('automations')
            .update({
              action_config: {
                task_title: taskTitle.trim(),
                task_description: taskDesc,
                due_days: dueDays,
                priority,
              },
            } as any)
            .eq('id', latest.id)
        );
      }

      toast({ title: 'Tarefa automática criada' });
      setDialogOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setDueDays(3);
      setPriority('normal');
    } catch {
      toast({ title: 'Erro ao criar tarefa automática', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomation.mutateAsync(id);
      toast({ title: 'Tarefa automática removida' });
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await updateAutomation.mutateAsync({ id, is_active: active });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Tarefas Automáticas</h3>
          <p className="text-xs text-muted-foreground">
            Tarefas criadas automaticamente quando um negócio entra nesta etapa
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Nova tarefa automática
        </Button>
      </div>

      {taskAutomations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <ListTodo className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            Nenhuma tarefa automática configurada para esta etapa
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {taskAutomations.map(auto => {
            const config = (auto.action_config as Record<string, any>) ?? {};
            return (
              <Card key={auto.id}>
                <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{auto.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {config.due_days ?? 3}d prazo
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {config.priority ?? 'normal'}
                      </Badge>
                    </div>
                    {auto.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-6">{auto.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={auto.is_active}
                      onCheckedChange={(v) => handleToggle(auto.id, v)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(auto.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tarefa Automática</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Título da tarefa *</Label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ex: Enviar proposta comercial"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descrição</Label>
              <Input
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Detalhes opcionais"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Prazo (dias após entrada)</Label>
                <Input
                  type="number"
                  min={1}
                  value={dueDays}
                  onChange={(e) => setDueDays(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prioridade</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              O responsável será automaticamente o dono do negócio.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!taskTitle.trim() || createAutomation.isPending}>
              {createAutomation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
