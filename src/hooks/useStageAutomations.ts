import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface AutomationCondition {
  id: string;
  automation_id: string;
  condition_field: string;
  condition_operator: string;
  condition_value: string;
  logic_group: string;
  position: number;
}

export interface AutomationAction {
  id: string;
  automation_id: string;
  company_id: string;
  action_type: string;
  action_config: Record<string, any>;
  position: number;
}

export interface StageAutomation {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  action_type: string;
  trigger_config: Record<string, any>;
  action_config: Record<string, any>;
  is_active: boolean;
  stage_id: string | null;
  pipeline_id: string | null;
}

export function useStageAutomations(stageId?: string) {
  const { profile } = useAuthContext();
  const qc = useQueryClient();
  const companyId = profile?.company_id;

  const automationsQuery = useQuery({
    queryKey: ['stage-automations', stageId],
    enabled: !!stageId && !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('stage_id', stageId!)
        .eq('company_id', companyId!);
      if (error) throw error;
      return data as unknown as StageAutomation[];
    },
  });

  const createAutomation = useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      trigger_event: string;
      stage_id: string;
      pipeline_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('automations')
        .insert({
          name: input.name,
          description: input.description ?? null,
          trigger_event: input.trigger_event,
          action_type: 'create_task',
          stage_id: input.stage_id,
          pipeline_id: input.pipeline_id ?? null,
          company_id: companyId!,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stage-automations'] }),
  });

  const updateAutomation = useMutation({
    mutationFn: async (input: { id: string; name?: string; description?: string; trigger_event?: string; is_active?: boolean }) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from('automations')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stage-automations'] }),
  });

  const deleteAutomation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('automations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stage-automations'] }),
  });

  // Actions
  const actionsQuery = useQuery({
    queryKey: ['automation-actions', stageId],
    enabled: !!stageId && !!companyId,
    queryFn: async () => {
      const autoIds = automationsQuery.data?.map(a => a.id) ?? [];
      if (!autoIds.length) return [];
      const { data, error } = await supabase
        .from('automation_actions')
        .select('*')
        .in('automation_id', autoIds)
        .order('position');
      if (error) throw error;
      return data as unknown as AutomationAction[];
    },
  });

  const createAction = useMutation({
    mutationFn: async (input: { automation_id: string; action_type: string; action_config?: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('automation_actions')
        .insert({
          automation_id: input.automation_id,
          company_id: companyId!,
          action_type: input.action_type,
          action_config: input.action_config ?? {},
          position: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation-actions'] }),
  });

  const deleteAction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('automation_actions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation-actions'] }),
  });

  // Conditions
  const conditionsQuery = useQuery({
    queryKey: ['automation-conditions', stageId],
    enabled: !!stageId && !!companyId,
    queryFn: async () => {
      const autoIds = automationsQuery.data?.map(a => a.id) ?? [];
      if (!autoIds.length) return [];
      const { data, error } = await supabase
        .from('automation_conditions')
        .select('*')
        .in('automation_id', autoIds)
        .order('position');
      if (error) throw error;
      return data as unknown as AutomationCondition[];
    },
  });

  const createCondition = useMutation({
    mutationFn: async (input: { automation_id: string; condition_field: string; condition_operator: string; condition_value: string; logic_group?: string }) => {
      const { data, error } = await supabase
        .from('automation_conditions')
        .insert({
          automation_id: input.automation_id,
          condition_field: input.condition_field,
          condition_operator: input.condition_operator,
          condition_value: input.condition_value,
          logic_group: input.logic_group ?? 'AND',
          position: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation-conditions'] }),
  });

  const deleteCondition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('automation_conditions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation-conditions'] }),
  });

  return {
    automations: automationsQuery.data ?? [],
    actions: actionsQuery.data ?? [],
    conditions: conditionsQuery.data ?? [],
    isLoading: automationsQuery.isLoading,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    createAction,
    deleteAction,
    createCondition,
    deleteCondition,
  };
}
