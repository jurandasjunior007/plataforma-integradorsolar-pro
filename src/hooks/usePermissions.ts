import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/crm';

const ALL_PERMISSIONS = [
  'deals.create', 'deals.edit', 'deals.delete', 'deals.view_all',
  'stages.create', 'stages.edit', 'stages.delete',
  'checklists.create', 'checklists.edit', 'checklists.delete',
  'templates.create', 'templates.edit', 'templates.delete',
  'contacts.create', 'contacts.edit', 'contacts.delete',
  'reports.view', 'admin.access',
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

const ROLE_DEFAULTS: Record<AppRole, Permission[]> = {
  admin: [...ALL_PERMISSIONS],
  supervisor: ALL_PERMISSIONS.filter(p => p !== 'admin.access') as Permission[],
  vendedor: [
    'deals.create', 'deals.edit',
    'contacts.create', 'contacts.edit',
  ],
};

export { ALL_PERMISSIONS };

export function usePermissions() {
  const { profile, roles } = useAuthContext();
  const companyId = profile?.company_id;
  const userRole = roles[0] as AppRole | undefined;

  const { data: overrides } = useQuery({
    queryKey: ['role-permissions', companyId, userRole],
    enabled: !!companyId && !!userRole,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission, granted')
        .eq('company_id', companyId!)
        .eq('role', userRole!);
      if (error) throw error;
      return data as { permission: string; granted: boolean }[];
    },
  });

  const can = (permission: Permission): boolean => {
    if (!userRole) return false;
    // Check overrides first
    const override = overrides?.find(o => o.permission === permission);
    if (override !== undefined) return override.granted;
    // Fall back to defaults
    return ROLE_DEFAULTS[userRole]?.includes(permission) ?? false;
  };

  return { can, userRole, ALL_PERMISSIONS };
}
