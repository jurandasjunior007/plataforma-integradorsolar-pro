
-- Fix RLS: Drop RESTRICTIVE policies and create PERMISSIVE ones

-- 1. checklist_items: drop the duplicate RESTRICTIVE policy, keep "Tenant isolation" but add a PERMISSIVE one
DROP POLICY IF EXISTS "checklist_items_company_access" ON public.checklist_items;
CREATE POLICY "checklist_items_permissive_access" ON public.checklist_items
  FOR ALL USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- 2. role_permissions: drop RESTRICTIVE and create PERMISSIVE
DROP POLICY IF EXISTS "role_permissions_tenant_isolation" ON public.role_permissions;
CREATE POLICY "role_permissions_permissive_access" ON public.role_permissions
  FOR ALL USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- 3. checklist_templates: drop RESTRICTIVE and create PERMISSIVE
DROP POLICY IF EXISTS "checklist_templates_tenant_isolation" ON public.checklist_templates;
CREATE POLICY "checklist_templates_permissive_access" ON public.checklist_templates
  FOR ALL USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));
