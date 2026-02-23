
-- 1A. Add PERMISSIVE policy to checklist_items (currently only has RESTRICTIVE)
CREATE POLICY "checklist_items_company_access"
ON public.checklist_items
FOR ALL
TO authenticated
USING (company_id = get_user_company_id(auth.uid()))
WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- 1B. Create role_permissions table
CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT role_permissions_unique UNIQUE (company_id, role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_tenant_isolation"
ON public.role_permissions
FOR ALL
TO authenticated
USING (company_id = get_user_company_id(auth.uid()))
WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- 1C. Create checklist_templates table
CREATE TABLE public.checklist_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id),
  name text NOT NULL,
  sector text NOT NULL DEFAULT 'geral',
  template_data jsonb NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_system boolean NOT NULL DEFAULT false
);

ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_templates_tenant_isolation"
ON public.checklist_templates
FOR ALL
TO authenticated
USING (company_id = get_user_company_id(auth.uid()))
WITH CHECK (company_id = get_user_company_id(auth.uid()));
