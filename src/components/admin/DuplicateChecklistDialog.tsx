import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { List } from 'lucide-react';

interface DuplicateChecklistDialogProps {
  checklistId: string;
  stages: { id: string; name: string }[];
  currentStageId: string;
  onDuplicate: (checklistId: string, targetStageIds: string[]) => void;
  onClose: () => void;
}

interface PreviewItem {
  title: string;
  is_required: boolean;
  block_stage_advance: boolean;
}

export function DuplicateChecklistDialog({ checklistId, stages, currentStageId, onDuplicate, onClose }: DuplicateChecklistDialogProps) {
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [checklistTitle, setChecklistTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cl }, { data: items }] = await Promise.all([
        supabase.from('stage_checklists').select('title').eq('id', checklistId).single(),
        supabase.from('checklist_items').select('title, is_required, block_stage_advance').eq('checklist_id', checklistId).order('position'),
      ]);
      setChecklistTitle(cl?.title ?? '');
      setPreviewItems((items ?? []) as PreviewItem[]);
      setLoading(false);
    }
    load();
  }, [checklistId]);

  const toggleStage = (stageId: string) => {
    setSelectedStages(prev =>
      prev.includes(stageId) ? prev.filter(s => s !== stageId) : [...prev, stageId]
    );
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Duplicar Checklist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Preview — {checklistTitle}</Label>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : previewItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum item no checklist</p>
            ) : (
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-1">
                {previewItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      item.block_stage_advance ? 'bg-destructive' : item.is_required ? 'bg-amber-500' : 'bg-muted-foreground/30'
                    }`} />
                    <span className="truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stage multi-select */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Etapas de destino</Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {stages.map(s => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedStages.includes(s.id)}
                    onCheckedChange={() => toggleStage(s.id)}
                  />
                  <span className="text-sm">{s.name}</span>
                  {s.id === currentStageId && (
                    <Badge variant="secondary" className="text-[10px]">atual</Badge>
                  )}
                </label>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            O checklist será duplicado com todos os itens e regras para {selectedStages.length || 0} etapa(s).
            Se já existir um checklist com o mesmo nome, receberá o sufixo "(cópia)".
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onDuplicate(checklistId, selectedStages)} disabled={selectedStages.length === 0}>
            Duplicar para {selectedStages.length} etapa(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
