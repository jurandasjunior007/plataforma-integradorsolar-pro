
-- 1. Enhance deals table
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS entered_pipeline_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS entered_stage_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. Indexes for deals
CREATE INDEX IF NOT EXISTS idx_deals_company_pipeline_stage ON public.deals(company_id, pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_owner ON public.deals(company_id, owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_contact ON public.deals(company_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_org ON public.deals(company_id, organization_id);

-- 3. Enhance tasks table
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS related_type text,
  ADD COLUMN IF NOT EXISTS related_id uuid,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 4. Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_company_assigned_status ON public.tasks(company_id, assigned_to, status, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_related ON public.tasks(company_id, related_type, related_id);

-- 5. Add moved_by_user_id to deal_stage_history
ALTER TABLE public.deal_stage_history
  ADD COLUMN IF NOT EXISTS moved_by_user_id uuid;
