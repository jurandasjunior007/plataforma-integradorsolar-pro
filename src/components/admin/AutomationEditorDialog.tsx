import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStageAutomations } from '@/hooks/useStageAutomations';
import { toast } from '@/hooks/use-toast';

interface AutomationEditorDialogProps {
  automationId: string;
  stageId: string;
  onClose: () => void;
}

export function AutomationEditorDialog({ automationId, stageId, onClose }: AutomationEditorDialogProps) {
  const {
    automations, actions, conditions,
    updateAutomation, createAction, deleteAction,
    createCondition, deleteCondition,
  } = useStageAutomations(stageId);

  const automation = automations.find(a => a.id === automationId);
  const autoActions = actions.filter(a => a.automation_id === automationId);
  const autoConditions = conditions.filter(c => c.automation_id === automationId);

  const [name, setName] = useState(automation?.name ?? '');
  const [description, setDescription] = useState(automation?.description ?? '');
  const [triggerEvent, setTriggerEvent] = useState(automation?.trigger_event ?? 'enter_stage');

  // Condition form
  const [condField, setCondField] = useState('');
  const [condOp, setCondOp] = useState('equals');
  const [condValue, setCondValue] = useState('');
  const [condLogic, setCondLogic] = useState('AND');

  // Action form
  const [actionType, setActionType] = useState('');

  const triggers = [
    { value: 'enter_stage', label: 'Entrou na etapa' },
    { value: 'leave_stage', label: 'Saiu da etapa' },
    { value: 'field_changed', label: 'Campo alterado' },
  ];

  const actionTypes = [
    { value: 'create_task', label: 'Criar tarefa' },
    { value: 'update_field', label: 'Atualizar campo' },
    { value: 'add_tag', label: 'Adicionar marcador' },
    { value: 'notify_user', label: 'Notificar usuário' },
    { value: 'move_stage', label: 'Mover etapa' },
    { value: 'generate_document', label: 'Gerar documento' },
  ];

  const operators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'Diferente de' },
    { value: 'contains', label: 'Contém' },
    { value: 'greater_than', label: 'Maior que' },
    { value: 'less_than', label: 'Menor que' },
  ];

  const conditionFields = [
    { value: 'value', label: 'Valor do negócio' },
    { value: 'payment_type', label: 'Tipo de pagamento' },
    { value: 'tags', label: 'Tags' },
    { value: 'contact_type', label: 'Tipo de contato' },
  ];

  const handleSave = async () => {
    try {
      await updateAutomation.mutateAsync({
        id: automationId,
        name,
        description: description || undefined,
        trigger_event: triggerEvent,
      });
      toast({ title: 'Automação salva' });
      onClose();
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleAddCondition = async () => {
    if (!condField || !condValue) return;
    try {
      await createCondition.mutateAsync({
        automation_id: automationId,
        condition_field: condField,
        condition_operator: condOp,
        condition_value: condValue,
        logic_group: condLogic,
      });
      setCondField('');
      setCondValue('');
    } catch {
      toast({ title: 'Erro ao adicionar condição', variant: 'destructive' });
    }
  };

  const handleAddAction = async () => {
    if (!actionType) return;
    try {
      await createAction.mutateAsync({
        automation_id: automationId,
        action_type: actionType,
      });
      setActionType('');
    } catch {
      toast({ title: 'Erro ao adicionar ação', variant: 'destructive' });
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Editor de Automação
          </DialogTitle>
        </DialogHeader>

        {/* Section 1: Definition */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Definição
          </p>
          <div className="space-y-2">
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da automação" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" rows={2} />
          </div>
        </div>

        <Separator />

        {/* Section 2: Trigger */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Gatilho
          </p>
          <Select value={triggerEvent} onValueChange={setTriggerEvent}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {triggers.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Section 3: Conditions */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Condições
          </p>

          {autoConditions.length > 0 && (
            <div className="space-y-1.5">
              {autoConditions.map((cond, idx) => (
                <div key={cond.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-3 py-2">
                  {idx > 0 && (
                    <Badge variant="outline" className="text-[9px] mr-1">{cond.logic_group}</Badge>
                  )}
                  <span className="font-medium">{cond.condition_field}</span>
                  <span className="text-muted-foreground">{cond.condition_operator}</span>
                  <span className="font-medium">{cond.condition_value}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => deleteCondition.mutateAsync(cond.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Select value={condField} onValueChange={setCondField}>
              <SelectTrigger className="text-xs h-8 flex-1 min-w-[120px]">
                <SelectValue placeholder="Campo" />
              </SelectTrigger>
              <SelectContent>
                {conditionFields.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={condOp} onValueChange={setCondOp}>
              <SelectTrigger className="text-xs h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={condValue} onChange={(e) => setCondValue(e.target.value)} placeholder="Valor" className="text-xs h-8 flex-1 min-w-[100px]" />
            <Select value={condLogic} onValueChange={setCondLogic}>
              <SelectTrigger className="text-xs h-8 w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAddCondition}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Section 4: Actions */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ações
          </p>

          {autoActions.length > 0 && (
            <div className="space-y-1.5">
              {autoActions.map((action) => (
                <div key={action.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-3 py-2">
                  <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="font-medium">
                    {actionTypes.find(t => t.value === action.action_type)?.label ?? action.action_type}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => deleteAction.mutateAsync(action.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="text-xs h-8 flex-1">
                <SelectValue placeholder="Tipo de ação" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAddAction}>
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Automação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
