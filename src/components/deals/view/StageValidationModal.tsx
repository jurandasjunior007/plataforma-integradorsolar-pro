import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PendingItem {
  title: string;
  is_required: boolean;
  block_stage_advance: boolean;
}

interface StageValidationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingItems: PendingItem[];
  targetStageName: string;
}

export function StageValidationModal({ open, onClose, onConfirm, pendingItems, targetStageName }: StageValidationModalProps) {
  const blockingItems = pendingItems.filter(i => i.block_stage_advance);
  const warningItems = pendingItems.filter(i => i.is_required && !i.block_stage_advance);
  const hasBlockers = blockingItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            {hasBlockers ? 'Avanço bloqueado' : 'Itens pendentes'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {hasBlockers
              ? 'Existem itens obrigatórios que bloqueiam o avanço para a etapa seguinte. Complete-os antes de continuar.'
              : `Existem itens pendentes. Deseja avançar para "${targetStageName}" mesmo assim?`
            }
          </p>

          {blockingItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                Bloqueiam avanço
              </p>
              {blockingItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-destructive/5 rounded-md px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          )}

          {warningItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                Pendentes (não bloqueiam)
              </p>
              {warningItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-amber-500/5 rounded-md px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          {!hasBlockers && (
            <Button onClick={onConfirm}>Avançar mesmo assim</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
