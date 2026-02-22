import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, GitBranch } from 'lucide-react';
import { useStageChecklists } from '@/hooks/useStageChecklists';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface ChecklistEditorDialogProps {
  checklistId: string;
  stageId: string;
  onClose: () => void;
}

export function ChecklistEditorDialog({ checklistId, stageId, onClose }: ChecklistEditorDialogProps) {
  const {
    checklists, items, rules,
    updateChecklist, createItem, updateItem, deleteItem,
    createRule, deleteRule,
  } = useStageChecklists(stageId);

  const checklist = checklists.find(c => c.id === checklistId);
  const checklistItems = items.filter(i => i.checklist_id === checklistId);
  const checklistRules = rules.filter(r => r.checklist_id === checklistId);

  const [title, setTitle] = useState(checklist?.title ?? '');
  const [description, setDescription] = useState(checklist?.description ?? '');
  const [blockAdvance, setBlockAdvance] = useState(checklist?.block_stage_advance ?? false);
  const [newItemTitle, setNewItemTitle] = useState('');

  // Rule form
  const [ruleField, setRuleField] = useState('');
  const [ruleOperator, setRuleOperator] = useState('equals');
  const [ruleValue, setRuleValue] = useState('');

  const handleSave = async () => {
    try {
      await updateChecklist.mutateAsync({
        id: checklistId,
        title,
        description: description || undefined,
        block_stage_advance: blockAdvance,
      });
      toast({ title: 'Checklist salvo' });
      onClose();
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;
    try {
      await createItem.mutateAsync({
        checklist_id: checklistId,
        title: newItemTitle.trim(),
      });
      setNewItemTitle('');
    } catch {
      toast({ title: 'Erro ao adicionar item', variant: 'destructive' });
    }
  };

  const handleToggleRequired = async (itemId: string, current: boolean) => {
    await updateItem.mutateAsync({ id: itemId, is_required: !current });
  };

  const handleToggleBlock = async (itemId: string, current: boolean) => {
    await updateItem.mutateAsync({ id: itemId, block_stage_advance: !current });
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem.mutateAsync(itemId);
  };

  const handleAddRule = async () => {
    if (!ruleField || !ruleValue) return;
    try {
      await createRule.mutateAsync({
        checklist_id: checklistId,
        condition_field: ruleField,
        condition_operator: ruleOperator,
        condition_value: ruleValue,
      });
      setRuleField('');
      setRuleValue('');
    } catch {
      toast({ title: 'Erro ao adicionar regra', variant: 'destructive' });
    }
  };

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

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Editor de Checklist</DialogTitle>
        </DialogHeader>

        {/* Section 1: Definition */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Definição do Checklist
          </p>
          <div className="space-y-2">
            <Label className="text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do checklist" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" rows={2} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Bloquear avanço de etapa</Label>
              <p className="text-[11px] text-muted-foreground">Impede mudança de etapa se houver itens pendentes</p>
            </div>
            <Switch checked={blockAdvance} onCheckedChange={setBlockAdvance} />
          </div>
        </div>

        <Separator />

        {/* Section 2: Conditions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Condições para aplicar este checklist
            </p>
          </div>

          {checklistRules.length > 0 && (
            <div className="space-y-1.5">
              {checklistRules.map((rule, idx) => (
                <div key={rule.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-3 py-2">
                  {idx > 0 && <Badge variant="outline" className="text-[9px] mr-1">AND</Badge>}
                  <span className="font-medium">{rule.condition_field}</span>
                  <span className="text-muted-foreground">{rule.condition_operator}</span>
                  <span className="font-medium">{rule.condition_value}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => deleteRule.mutateAsync(rule.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Select value={ruleField} onValueChange={setRuleField}>
              <SelectTrigger className="text-xs h-8 flex-1">
                <SelectValue placeholder="Campo" />
              </SelectTrigger>
              <SelectContent>
                {conditionFields.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ruleOperator} onValueChange={setRuleOperator}>
              <SelectTrigger className="text-xs h-8 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={ruleValue}
              onChange={(e) => setRuleValue(e.target.value)}
              placeholder="Valor"
              className="text-xs h-8 flex-1"
            />
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAddRule}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Section 3: Items */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Itens do Checklist
          </p>

          {checklistItems.length > 0 && (
            <div className="space-y-1.5">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-muted/30 rounded-md px-3 py-2.5 group">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab shrink-0" />
                  <span className="text-sm flex-1 min-w-0 truncate">{item.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <Label className="text-[10px] text-muted-foreground">Obrigatório</Label>
                      <Switch
                        checked={item.is_required}
                        onCheckedChange={() => handleToggleRequired(item.id, item.is_required)}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Label className="text-[10px] text-muted-foreground">Bloqueia</Label>
                      <Switch
                        checked={item.block_stage_advance}
                        onCheckedChange={() => handleToggleBlock(item.id, item.block_stage_advance)}
                        className="scale-75"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Nome do novo item"
              className="text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Button size="sm" onClick={handleAddItem} className="gap-1 shrink-0">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Checklist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
