
-- Create posts table for internal feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  author_user_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.posts AS RESTRICTIVE FOR ALL
  USING (company_id = get_user_company_id(auth.uid()));

-- Add tarefas route support: ensure tasks table exists (it does, no changes needed)

-- Add summary column to audit_log for friendly feed text
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS summary TEXT;
