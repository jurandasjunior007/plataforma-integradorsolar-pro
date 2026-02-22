import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DuplicateChecklistDialogProps {
  checklistId: string;
  stages: { id: string; name: string }[];
  currentStageId: string;
  onDuplicate: (checklistId: string, targetStageId: string) => void;
  onClose: () => void;
}

export function DuplicateChecklistDialog({ checklistId, stages, currentStageId, onDuplicate, onClose }: DuplicateChecklistDialogProps) {
  const [targetStageId, setTargetStageId] = useState('');

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Duplicar Checklist</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Etapa de destino</Label>
            <Select value={targetStageId} onValueChange={setTargetStageId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} {s.id === currentStageId ? '(atual)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-muted-foreground">
            O checklist será duplicado com todos os itens e regras condicionais para a etapa selecionada.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onDuplicate(checklistId, targetStageId)} disabled={!targetStageId}>
            Duplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
