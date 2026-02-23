import type { Stage } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Circle, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStageChecklists } from '@/hooks/useStageChecklists';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthContext } from '@/contexts/AuthContext';

interface DealChecklistPanelProps {
  stage: Stage;
  dealId: string;
}

export function DealChecklistPanel({ stage, dealId }: DealChecklistPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { checklists, items, isLoading } = useStageChecklists(stage.id);

  // Fetch completed items for this deal
  const { data: dealCheckItems } = useQuery({
    queryKey: ['deal-checklist-items', dealId, stage.id],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_checklist_items')
        .select('*')
        .eq('deal_id', dealId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const completedIds = new Set(
    (dealCheckItems ?? []).filter(d => d.completed).map(d => d.item_id)
  );

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, checklistId, completed }: { itemId: string; checklistId: string; completed: boolean }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('deal_checklist_items')
        .select('id')
        .eq('deal_id', dealId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('deal_checklist_items')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            completed_by: completed ? (user?.id ?? null) : null,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('deal_checklist_items')
          .insert({
            deal_id: dealId,
            item_id: itemId,
            checklist_id: checklistId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            completed_by: completed ? (user?.id ?? null) : null,
          });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deal-checklist-items', dealId] });
    },
  });

  // Group items by checklist
  const blocks = checklists
    .filter(cl => cl.is_active)
    .map(cl => ({
      title: cl.title,
      checklistId: cl.id,
      items: items
        .filter(it => it.checklist_id === cl.id)
        .map(it => ({
          id: it.id,
          label: it.title,
          required: it.is_required,
          blockAdvance: it.block_stage_advance,
          completed: completedIds.has(it.id),
        })),
    }))
    .filter(b => b.items.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Processo da etapa
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1 h-7"
          onClick={() => navigate('/admin')}
        >
          <Settings className="h-3 w-3" />
          Configurar
        </Button>
      </div>

      {blocks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum checklist configurado para esta etapa.</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => navigate('/admin')}
            >
              Configurar checklists →
            </Button>
          </CardContent>
        </Card>
      ) : (
        blocks.map((block) => (
          <div key={block.checklistId} className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
              {block.title}
            </h4>
            <Card>
              <CardContent className="py-3 px-4 space-y-2.5">
                {block.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) =>
                        toggleItem.mutate({
                          itemId: item.id,
                          checklistId: block.checklistId,
                          completed: !!checked,
                        })
                      }
                      className="shrink-0"
                    />
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : item.required || item.blockAdvance ? (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                      {item.label}
                    </span>
                    {(item.required || item.blockAdvance) && !item.completed && (
                      <span className="ml-auto text-[10px] font-medium text-warning">
                        {item.blockAdvance ? 'Bloqueante' : 'Obrigatório'}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
