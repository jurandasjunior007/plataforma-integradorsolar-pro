import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface ChannelRow {
  id: string;
  company_id: string;
  entity_type: string;
  entity_id: string;
  channel_type: string;
  value: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useContactChannels(entityType?: string, entityId?: string) {
  const { profile } = useAuthContext();
  const qc = useQueryClient();
  const key = ['contact_channels', entityType, entityId];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_channels')
        .select('*')
        .eq('entity_type', entityType!)
        .eq('entity_id', entityId!)
        .is('deleted_at', null)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ChannelRow[];
    },
    enabled: !!profile && !!entityType && !!entityId,
  });

  const upsertChannel = useMutation({
    mutationFn: async (input: Partial<ChannelRow> & { id?: string }) => {
      const payload: any = { ...input, company_id: profile!.company_id, updated_at: new Date().toISOString() };
      if (input.id) {
        const { data, error } = await supabase.from('contact_channels').update(payload).eq('id', input.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('contact_channels').insert(payload).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteChannel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_channels').update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { ...query, channels: query.data ?? [], upsertChannel, deleteChannel };
}
