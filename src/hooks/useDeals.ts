import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface DealRow {
  id: string;
  company_id: string;
  pipeline_id: string;
  stage_id: string | null;
  title: string;
  value: number | null;
  contact_id: string | null;
  organization_id: string | null;
  owner_id: string | null;
  status: string;
  lost_reason: string | null;
  won_at: string | null;
  lost_at: string | null;
  entered_pipeline_at: string;
  entered_stage_at: string;
  tags: string[] | null;
  custom_fields: Record<string, any> | null;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined
  contact?: { id: string; name: string } | null;
  organization?: { id: string; name: string } | null;
  owner?: { id: string; full_name: string; avatar_url: string | null } | null;
}

export interface DealTaskStatus {
  deal_id: string;
  has_any_task_open: boolean;
  has_overdue_task: boolean;
  due_today: boolean;
  next_task_due_at: string | null;
}

export function useDeals(pipelineId?: string) {
  const { profile, user } = useAuthContext();
  const qc = useQueryClient();
  const companyId = profile?.company_id;

  const dealsQuery = useQuery({
    queryKey: ['deals', pipelineId, companyId],
    enabled: !!pipelineId && !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts!deals_contact_id_fkey(id, name),
          organization:organizations!deals_organization_id_fkey(id, name)
        `)
        .eq('pipeline_id', pipelineId!)
        .eq('company_id', companyId!)
        .is('deleted_at', null)
        .order('position');
      if (error) throw error;

      // Fetch owner profiles separately to avoid FK hint issues
      const ownerIds = [...new Set((data ?? []).map(d => d.owner_id).filter(Boolean))];
      let ownerMap: Record<string, { id: string; full_name: string; avatar_url: string | null }> = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', ownerIds as string[]);
        for (const p of profiles ?? []) {
          ownerMap[p.id] = p;
        }
      }

      return (data ?? []).map(d => ({
        ...d,
        owner: d.owner_id ? ownerMap[d.owner_id] ?? null : null,
      })) as unknown as DealRow[];
    },
  });

  // Get task status for all deals in this pipeline
  const taskStatusQuery = useQuery({
    queryKey: ['deal-task-status', pipelineId, companyId],
    enabled: !!pipelineId && !!companyId && (dealsQuery.data?.length ?? 0) > 0,
    queryFn: async () => {
      const dealIds = dealsQuery.data?.map(d => d.id) ?? [];
      if (!dealIds.length) return {};

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, deal_id, due_date, status')
        .in('deal_id', dealIds)
        .is('deleted_at', null)
        .in('status', ['pending', 'in_progress']);
      if (error) throw error;

      const statusMap: Record<string, DealTaskStatus> = {};
      for (const dealId of dealIds) {
        const dealTasks = (tasks ?? []).filter(t => t.deal_id === dealId);
        const openTasks = dealTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
        const overdue = openTasks.filter(t => t.due_date && t.due_date < startOfDay);
        const today = openTasks.filter(t => t.due_date && t.due_date >= startOfDay && t.due_date <= endOfDay);
        const futureTasks = openTasks.filter(t => t.due_date).sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1));

        statusMap[dealId] = {
          deal_id: dealId,
          has_any_task_open: openTasks.length > 0,
          has_overdue_task: overdue.length > 0,
          due_today: today.length > 0,
          next_task_due_at: futureTasks[0]?.due_date ?? null,
        };
      }
      return statusMap;
    },
  });

  const createDeal = useMutation({
    mutationFn: async (input: {
      title: string;
      pipeline_id: string;
      stage_id: string;
      value?: number;
      contact_id?: string;
      organization_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          title: input.title,
          pipeline_id: input.pipeline_id,
          stage_id: input.stage_id,
          value: input.value ?? 0,
          contact_id: input.contact_id ?? null,
          organization_id: input.organization_id ?? null,
          owner_id: user?.id ?? null,
          company_id: companyId!,
          position: 0,
          status: 'open',
          entered_pipeline_at: new Date().toISOString(),
          entered_stage_at: new Date().toISOString(),
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });

  const updateDeal = useMutation({
    mutationFn: async (input: { id: string; title?: string; value?: number; stage_id?: string; contact_id?: string; organization_id?: string; owner_id?: string; status?: string; lost_reason?: string }) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from('deals')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });

  const moveDeal = useMutation({
    mutationFn: async (input: { dealId: string; fromStageId: string; toStageId: string }) => {
      const now = new Date().toISOString();
      // Update deal
      const { error: e1 } = await supabase
        .from('deals')
        .update({
          stage_id: input.toStageId,
          entered_stage_at: now,
          updated_at: now,
        } as any)
        .eq('id', input.dealId);
      if (e1) throw e1;

      // Insert history
      const { error: e2 } = await supabase
        .from('deal_stage_history')
        .insert({
          deal_id: input.dealId,
          from_stage_id: input.fromStageId,
          to_stage_id: input.toStageId,
          moved_by_user_id: user?.id ?? null,
          changed_at: now,
        } as any);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });

  const deleteDeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });

  const duplicateDeal = useMutation({
    mutationFn: async (dealId: string) => {
      const deal = dealsQuery.data?.find(d => d.id === dealId);
      if (!deal) throw new Error('Deal not found');
      const { data, error } = await supabase
        .from('deals')
        .insert({
          title: `${deal.title} (Cópia)`,
          pipeline_id: deal.pipeline_id,
          stage_id: deal.stage_id,
          value: deal.value ?? 0,
          contact_id: deal.contact_id,
          organization_id: deal.organization_id,
          owner_id: user?.id ?? null,
          company_id: companyId!,
          position: 0,
          status: 'open',
          entered_pipeline_at: new Date().toISOString(),
          entered_stage_at: new Date().toISOString(),
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });

  return {
    deals: dealsQuery.data ?? [],
    taskStatusMap: (taskStatusQuery.data ?? {}) as Record<string, DealTaskStatus>,
    isLoading: dealsQuery.isLoading,
    createDeal,
    updateDeal,
    moveDeal,
    deleteDeal,
    duplicateDeal,
    refetch: dealsQuery.refetch,
  };
}
