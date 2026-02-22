import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface DealDetail {
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
  expected_close_date: string | null;
  contact?: { id: string; name: string } | null;
  organization?: { id: string; name: string } | null;
  owner?: { id: string; full_name: string; avatar_url: string | null } | null;
  pipeline?: { id: string; name: string } | null;
}

export function useDealDetail(dealId?: string) {
  const { profile } = useAuthContext();
  const companyId = profile?.company_id;

  return useQuery({
    queryKey: ['deal-detail', dealId],
    enabled: !!dealId && !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts!deals_contact_id_fkey(id, name),
          organization:organizations!deals_organization_id_fkey(id, name),
          pipeline:pipelines!deals_pipeline_id_fkey(id, name)
        `)
        .eq('id', dealId!)
        .eq('company_id', companyId!)
        .is('deleted_at', null)
        .single();
      if (error) throw error;

      // Fetch owner
      let owner = null;
      if (data.owner_id) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', data.owner_id)
          .single();
        owner = p;
      }

      return { ...data, owner } as unknown as DealDetail;
    },
  });
}
