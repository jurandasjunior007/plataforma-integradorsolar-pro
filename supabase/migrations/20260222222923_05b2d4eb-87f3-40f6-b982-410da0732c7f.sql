
-- 1. Enhance stage_checklists to be a "group" level entity
ALTER TABLE public.stage_checklists
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS block_stage_advance boolean NOT NULL DEFAULT false;

-- 2. Create checklist_items (individual items within a checklist group)
CREATE TABLE public.checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id uuid NOT NULL REFERENCES public.stage_checklists(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id),
  title text NOT NULL,
  description text,
  is_required boolean NOT NULL DEFAULT false,
  block_stage_advance boolean NOT NULL DEFAULT false,
  linked_field text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.checklist_items
  AS RESTRICTIVE FOR ALL
  USING (company_id = get_user_company_id(auth.uid()));

-- 3. Add stage_id and pipeline_id to automations
ALTER TABLE public.automations
  ADD COLUMN IF NOT EXISTS stage_id uuid REFERENCES public.stages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pipeline_id uuid REFERENCES public.pipelines(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description text;

-- 4. Create automation_actions table
CREATE TABLE public.automation_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id uuid NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id),
  action_type text NOT NULL,
  action_config jsonb DEFAULT '{}'::jsonb,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.automation_actions
  AS RESTRICTIVE FOR ALL
  USING (company_id = get_user_company_id(auth.uid()));

-- 5. Create automation_conditions table
CREATE TABLE public.automation_conditions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id uuid NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  condition_field text NOT NULL,
  condition_operator text NOT NULL DEFAULT 'equals',
  condition_value text NOT NULL,
  logic_group text NOT NULL DEFAULT 'AND',
  position integer NOT NULL DEFAULT 0
);

ALTER TABLE public.automation_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.automation_conditions
  AS RESTRICTIVE FOR ALL
  USING (automation_id IN (
    SELECT id FROM public.automations
    WHERE company_id = get_user_company_id(auth.uid())
  ));

-- 6. Update deal_checklist_items to also reference checklist_items
ALTER TABLE public.deal_checklist_items
  ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES public.checklist_items(id) ON DELETE SET NULL;
