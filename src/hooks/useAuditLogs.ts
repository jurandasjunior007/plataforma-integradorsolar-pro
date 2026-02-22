import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface AuditLogRow {
  id: string;
  company_id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  details: any;
  before_json: any;
  after_json: any;
  created_at: string;
}

export function useAuditLogs(entityType?: string, entityId?: string) {
  const { profile } = useAuthContext();

  return useQuery({
    queryKey: ['audit_logs', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('entity_type', entityType!)
        .eq('entity_id', entityId!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as AuditLogRow[];
    },
    enabled: !!profile && !!entityType && !!entityId,
  });
}
