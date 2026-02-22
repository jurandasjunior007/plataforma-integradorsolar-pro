import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { stripMask } from '@/lib/masks';

export interface AddressRow {
  id: string;
  company_id: string;
  entity_type: string;
  entity_id: string;
  label: string;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  is_primary: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useAddresses(entityType?: string, entityId?: string) {
  const { profile } = useAuthContext();
  const qc = useQueryClient();
  const key = ['addresses', entityType, entityId];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase.from('addresses').select('*').is('deleted_at', null).order('is_primary', { ascending: false });
      if (entityType) q = q.eq('entity_type', entityType);
      if (entityId) q = q.eq('entity_id', entityId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as AddressRow[];
    },
    enabled: !!profile && !!entityType && !!entityId,
  });

  const upsertAddress = useMutation({
    mutationFn: async (input: Partial<AddressRow> & { id?: string }) => {
      const payload: any = {
        ...input,
        company_id: profile!.company_id,
        cep: input.cep ? stripMask(input.cep) : null,
        updated_at: new Date().toISOString(),
      };
      if (input.id) {
        const { data, error } = await supabase.from('addresses').update(payload).eq('id', input.id).select().single();
        if (error) throw error;
        return data;
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error } = await supabase.from('addresses').insert(payload).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { ...query, addresses: query.data ?? [], upsertAddress, deleteAddress };
}
