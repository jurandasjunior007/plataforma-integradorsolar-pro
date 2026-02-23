import type { Stage } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Circle, Settings, Loader2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStageChecklists } from '@/hooks/useStageChecklists';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DealChecklistPanelProps {
  stage: Stage;
  dealId: string;
  deal: {
    id: string;
    custom_fields: Record<string, any> | null;
    value: number | null;
    contact_id: string | null;
    organization_id: string | null;
    owner_id: string | null;
    status: string;
    contact?: { id: string; name: string } | null;
    organization?: { id: string; name: string } | null;
  };
}

function getFieldValue(deal: DealChecklistPanelProps['deal'], linkedField: string | null): any {
  if (!linkedField) return null;
  if (linkedField.startsWith('custom_fields.')) {
    const key = linkedField.replace('custom_fields.', '');
    return deal.custom_fields?.[key];
  }
  const map: Record<string, any> = {
    'contact_id': deal.contact_id,
    'organization_id': deal.organization_id,
    'owner_id': deal.owner_id,
    'value': deal.value,
    'contact.name': deal.contact?.name,
    'organization.name': deal.organization?.name,
  };
  return map[linkedField] ?? null;
}

type ItemStatus = 'completed' | 'blocking' | 'warning' | 'optional';

function evaluateItem(
  item: { linked_field: string | null; is_required: boolean; block_stage_advance: boolean; id: string },
  deal: DealChecklistPanelProps['deal'],
  manuallyCompleted: boolean,
): ItemStatus {
  // If item has a linked_field, evaluate automatically
  if (item.linked_field) {
    const value = getFieldValue(deal, item.linked_field);
    const isFilled = value !== null && value !== undefined && value !== '' && value !== 0;
    if (isFilled) return 'completed';
    if (item.block_stage_advance) return 'blocking';
    if (item.is_required) return 'warning';
    return 'optional';
  }

  // No linked_field — use manual checkbox status
  if (manuallyCompleted) return 'completed';
  if (item.block_stage_advance) return 'blocking';
  if (item.is_required) return 'warning';
  return 'optional';
}

export function DealChecklistPanel({ stage, dealId, deal }: DealChecklistPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { checklists, items, isLoading } = useStageChecklists(stage.id);

  // Fetch manually completed items for this deal
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

  const manualCompletedIds = new Set(
    (dealCheckItems ?? []).filter(d => d.completed).map(d => d.item_id)
  );

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, checklistId, completed }: { itemId: string; checklistId: string; completed: boolean }) => {
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

  // Build evaluated items for all active checklists
  const activeChecklists = checklists.filter(cl => cl.is_active);
  const allEvaluatedItems = items
    .filter(it => activeChecklists.some(cl => cl.id === it.checklist_id))
    .map(it => ({
      ...it,
      status: evaluateItem(it, deal, manualCompletedIds.has(it.id)),
    }));

  const totalCount = allEvaluatedItems.length;
  const completedCount = allEvaluatedItems.filter(it => it.status === 'completed').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Processo da etapa
          </h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
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

      {/* Progress bar */}
      {totalCount > 0 && (
        <Card>
          <CardContent className="py-3 px-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedCount}/{totalCount} itens concluídos</span>
              <span className={progressPercent === 100 ? 'text-primary font-semibold' : 'font-medium'}>
                {progressPercent}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {activeChecklists.length === 0 ? (
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
        activeChecklists.map((checklist) => {
          const clItems = allEvaluatedItems.filter(i => i.checklist_id === checklist.id);
          return (
            <div key={checklist.id} className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
                {checklist.title}
              </h4>
              <Card>
                <CardContent className="py-3 px-4 space-y-2.5">
                  {clItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Nenhum item neste checklist
                    </p>
                  ) : (
                    clItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        {/* Only show checkbox for items without linked_field */}
                        {!item.linked_field ? (
                          <Checkbox
                            checked={item.status === 'completed'}
                            onCheckedChange={(checked) =>
                              toggleItem.mutate({
                                itemId: item.id,
                                checklistId: checklist.id,
                                completed: !!checked,
                              })
                            }
                            className="shrink-0"
                          />
                        ) : null}

                        {item.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        ) : item.status === 'blocking' ? (
                          <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}

                        <span className={item.status === 'completed' ? 'text-muted-foreground line-through' : ''}>
                          {item.title}
                        </span>

                        {item.status === 'blocking' && (
                          <span className="ml-auto text-[10px] font-medium text-destructive">Bloqueia</span>
                        )}
                        {item.status === 'warning' && (
                          <span className="ml-auto text-[10px] font-medium text-warning">Obrigatório</span>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
}
