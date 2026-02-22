import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/audit';
import { stripMask } from '@/lib/masks';

export interface OrganizationRow {
  id: string;
  company_id: string;
  name: string;
  legal_name: string | null;
  trade_name: string | null;
  cnpj: string | null;
  state_registration_ie: string | null;
  email_principal: string | null;
  phone_principal: string | null;
  whatsapp_principal: string | null;
  status_cadastro: string;
  owner_user_id: string | null;
  segment: string | null;
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

export function useOrganizations(filters: Filters = {}) {
  const { profile } = useAuthContext();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['organizations', filters],
    queryFn: async () => {
      let q = supabase
        .from('organizations')
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
        q = q.or(`name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%,phone_principal.ilike.%${filters.search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as OrganizationRow[];
    },
    enabled: !!profile,
  });

  const createOrganization = useMutation({
    mutationFn: async (input: Partial<OrganizationRow>) => {
      const payload = {
        company_id: profile!.company_id,
        name: input.legal_name ?? input.name ?? '',
        legal_name: input.legal_name ?? input.name ?? '',
        trade_name: input.trade_name ?? null,
        cnpj: input.cnpj ? stripMask(input.cnpj) : null,
        state_registration_ie: input.state_registration_ie ?? null,
        email_principal: input.email_principal ?? null,
        phone_principal: input.phone_principal ? stripMask(input.phone_principal) : null,
        whatsapp_principal: input.whatsapp_principal ? stripMask(input.whatsapp_principal) : null,
        status_cadastro: input.status_cadastro ?? 'ativo',
        owner_user_id: input.owner_user_id ?? profile!.id,
        segment: input.segment ?? null,
        notes: input.notes ?? null,
      };
      const { data, error } = await supabase.from('organizations').insert(payload as any).select().single();
      if (error) throw error;
      await logAudit({
        companyId: profile!.company_id,
        userId: profile!.id,
        entityType: 'organization',
        entityId: (data as any).id,
        action: 'create',
        after: data as any,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });

  const updateOrganization = useMutation({
    mutationFn: async ({ id, before, ...input }: Partial<OrganizationRow> & { id: string; before?: any }) => {
      const payload: any = { ...input, updated_at: new Date().toISOString() };
      if (payload.cnpj) payload.cnpj = stripMask(payload.cnpj);
      if (payload.phone_principal) payload.phone_principal = stripMask(payload.phone_principal);
      if (payload.whatsapp_principal) payload.whatsapp_principal = stripMask(payload.whatsapp_principal);
      if (payload.legal_name) payload.name = payload.legal_name;
      delete payload.before;

      const { data, error } = await supabase.from('organizations').update(payload).eq('id', id).select().single();
      if (error) throw error;
      await logAudit({
        companyId: profile!.company_id,
        userId: profile!.id,
        entityType: 'organization',
        entityId: id,
        action: 'update',
        before,
        after: data as any,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });

  const softDeleteOrganization = useMutation({
    mutationFn: async ({ id, before }: { id: string; before?: any }) => {
      const { error } = await supabase.from('organizations').update({ deleted_at: new Date().toISOString(), status_cadastro: 'inativo' } as any).eq('id', id);
      if (error) throw error;
      await logAudit({
        companyId: profile!.company_id,
        userId: profile!.id,
        entityType: 'organization',
        entityId: id,
        action: 'soft_delete',
        before,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });

  return { ...query, organizations: query.data ?? [], createOrganization, updateOrganization, softDeleteOrganization };
}
