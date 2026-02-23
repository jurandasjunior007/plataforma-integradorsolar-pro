import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export function usePipelines() {
  const { profile } = useAuthContext();
  const companyId = profile?.company_id;

  const pipelinesQuery = useQuery({
    queryKey: ['pipelines', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('company_id', companyId!)
        .eq('is_active', true)
        .order('position');
      if (error) throw error;
      return data;
    },
  });

  return {
    pipelines: pipelinesQuery.data ?? [],
    isLoading: pipelinesQuery.isLoading,
  };
}

export function useStages(pipelineId?: string) {
  const { profile } = useAuthContext();
  const companyId = profile?.company_id;
  const qc = useQueryClient();

  const stagesQuery = useQuery({
    queryKey: ['stages', pipelineId],
    enabled: !!pipelineId && !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('pipeline_id', pipelineId!)
        .eq('company_id', companyId!)
        .order('position');
      if (error) throw error;
      return data;
    },
  });

  const createStage = useMutation({
    mutationFn: async (input: { name: string; color?: string; icon?: string }) => {
      const stages = stagesQuery.data ?? [];
      const maxPos = stages.length > 0 ? Math.max(...stages.map(s => s.position)) : -1;
      const { data, error } = await supabase
        .from('stages')
        .insert({
          pipeline_id: pipelineId!,
          company_id: companyId!,
          name: input.name,
          color: input.color ?? '#6366f1',
          icon: input.icon ?? 'circle',
          position: maxPos + 1,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stages', pipelineId] }),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name?: string; color?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('stages')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stages', pipelineId] }),
  });

  const deleteStage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stages', pipelineId] }),
  });

  const reorderStages = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, idx) =>
        supabase.from('stages').update({ position: idx }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stages', pipelineId] }),
  });

  return {
    stages: stagesQuery.data ?? [],
    isLoading: stagesQuery.isLoading,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
  };
}
