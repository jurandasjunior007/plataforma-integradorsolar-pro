import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface InteractionRow {
  id: string;
  company_id: string;
  deal_id: string | null;
  contact_id: string | null;
  user_id: string | null;
  type: 'call' | 'whatsapp' | 'email' | 'note' | 'meeting';
  content: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  // Joined
  user?: { id: string; full_name: string } | null;
}

export function useInteractions(dealId?: string) {
  const { profile, user } = useAuthContext();
  const qc = useQueryClient();
  const companyId = profile?.company_id;

  const query = useQuery({
    queryKey: ['interactions', dealId, companyId],
    enabled: !!dealId && !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('deal_id', dealId!)
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set((data ?? []).map(d => d.user_id).filter(Boolean))];
      let userMap: Record<string, { id: string; full_name: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds as string[]);
        for (const p of profiles ?? []) {
          userMap[p.id] = p;
        }
      }

      return (data ?? []).map(d => ({
        ...d,
        user: d.user_id ? userMap[d.user_id] ?? null : null,
      })) as InteractionRow[];
    },
  });

  const createInteraction = useMutation({
    mutationFn: async (input: {
      deal_id: string;
      type: 'call' | 'whatsapp' | 'email' | 'note' | 'meeting';
      content: string;
      contact_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          deal_id: input.deal_id,
          type: input.type,
          content: input.content,
          contact_id: input.contact_id ?? null,
          user_id: user?.id ?? null,
          company_id: companyId!,
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Log audit
      await supabase.from('audit_log').insert({
        company_id: companyId!,
        user_id: user?.id ?? null,
        entity_type: 'interaction',
        entity_id: data.id,
        action: 'create',
        summary: `Registrou ${input.type === 'note' ? 'nota' : input.type === 'call' ? 'ligação' : input.type === 'meeting' ? 'reunião' : input.type} no negócio`,
      } as any);

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interactions'] });
      qc.invalidateQueries({ queryKey: ['audit_log'] });
    },
  });

  return {
    interactions: query.data ?? [],
    isLoading: query.isLoading,
    createInteraction,
  };
}
