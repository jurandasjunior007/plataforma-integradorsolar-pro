import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/audit';
import { stripMask } from '@/lib/masks';

export interface ContactRow {
  id: string;
  company_id: string;
  name: string;
  full_name: string | null;
  cpf: string | null;
  rg: string | null;
  birth_date: string | null;
  email_principal: string | null;
  phone_principal: string | null;
  whatsapp_principal: string | null;
  status_cadastro: string;
  owner_user_id: string | null;
  tags: string[];
  notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Filters {
  search?: string;
  status?: string;
  ownerId?: string;
}

export function useContacts(filters: Filters = {}) {
  const { profile } = useAuthContext();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      let q = supabase
        .from('contacts')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        q = q.eq('status_cadastro', filters.status);
      }
      if (filters.ownerId) {
        q = q.eq('owner_user_id', filters.ownerId);
      }
      if (filters.search) {
        q = q.or(`name.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%,phone_principal.ilike.%${filters.search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ContactRow[];
    },
    enabled: !!profile,
  });

  const createContact = useMutation({
    mutationFn: async (input: Partial<ContactRow>) => {
      const payload = {
        company_id: profile!.company_id,
        name: input.full_name ?? input.name ?? '',
        full_name: input.full_name ?? input.name ?? '',
        cpf: input.cpf ? stripMask(input.cpf) : null,
        rg: input.rg ?? null,
        birth_date: input.birth_date ?? null,
        email_principal: input.email_principal ?? null,
        phone_principal: input.phone_principal ? stripMask(input.phone_principal) : null,
        whatsapp_principal: input.whatsapp_principal ? stripMask(input.whatsapp_principal) : null,
        status_cadastro: input.status_cadastro ?? 'ativo',
        owner_user_id: input.owner_user_id ?? profile!.id,
        tags: input.tags ?? [],
        notes: input.notes ?? null,
      };
      const { data, error } = await supabase.from('contacts').insert(payload as any).select().single();
      if (error) throw error;
      await logAudit({
        companyId: profile!.company_id,
        userId: profile!.id,
        entityType: 'contact',
        entityId: (data as any).id,
        action: 'create',
        after: data as any,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, before, ...input }: Partial<ContactRow> & { id: string; before?: any }) => {
      const payload: any = { ...input, updated_at: new Date().toISOString() };
      if (payload.cpf) payload.cpf = stripMask(payload.cpf);
      if (payload.phone_principal) payload.phone_principal = stripMask(payload.phone_principal);
      if (payload.whatsapp_principal) payload.whatsapp_principal = stripMask(payload.whatsapp_principal);
      if (payload.full_name) payload.name = payload.full_name;
      delete payload.before;

      const { data, error } = await supabase.from('contacts').update(payload).eq('id', id).select().single();
      if (error) throw error;
      await logAudit({
        companyId: profile!.company_id,
        userId: profile!.id,
        entityType: 'contact',
        entityId: id,
        action: 'update',
        before,
        after: data as any,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const softDeleteContact = useMutation({
    mutationFn: async ({ id, before }: { id: string; before?: any }) => {
      const { error } = await supabase.from('contacts').update({ deleted_at: new Date().toISOString(), status_cadastro: 'inativo' } as any).eq('id', id);
      if (error) throw error;
      await logAudit({
        companyId: profile!.company_id,
        userId: profile!.id,
        entityType: 'contact',
        entityId: id,
        action: 'soft_delete',
        before,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });

  return { ...query, contacts: query.data ?? [], createContact, updateContact, softDeleteContact };
}
