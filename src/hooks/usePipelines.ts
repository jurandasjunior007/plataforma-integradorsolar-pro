import { useQuery } from '@tanstack/react-query';
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

  return {
    stages: stagesQuery.data ?? [],
    isLoading: stagesQuery.isLoading,
  };
}
