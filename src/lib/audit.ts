import { supabase } from '@/integrations/supabase/client';

interface AuditParams {
  companyId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'soft_delete' | 'restore';
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
}

export async function logAudit(params: AuditParams) {
  const { error } = await supabase.from('audit_log').insert({
    company_id: params.companyId,
    user_id: params.userId,
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    before_json: params.before ?? null,
    after_json: params.after ?? null,
    details: { action: params.action },
  } as any);
  if (error) console.error('Audit log error:', error);
}
