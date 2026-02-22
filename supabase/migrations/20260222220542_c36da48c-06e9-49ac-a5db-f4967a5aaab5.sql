
-- =============================================
-- FASE 1: Migração do Banco de Dados - Cadastro
-- =============================================

-- 1.1 Alterar tabela contacts (Pessoas PF)
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'person',
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS rg TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS status_cadastro TEXT NOT NULL DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Copiar name para full_name onde ainda estiver NULL
UPDATE public.contacts SET full_name = name WHERE full_name IS NULL;

-- Renomear colunas contacts
ALTER TABLE public.contacts RENAME COLUMN email TO email_principal;
ALTER TABLE public.contacts RENAME COLUMN phone TO phone_principal;
ALTER TABLE public.contacts RENAME COLUMN whatsapp TO whatsapp_principal;

-- 1.2 Alterar tabela organizations (Empresas PJ)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS trade_name TEXT,
  ADD COLUMN IF NOT EXISTS state_registration_ie TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_principal TEXT,
  ADD COLUMN IF NOT EXISTS status_cadastro TEXT NOT NULL DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS segment TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Copiar name para legal_name onde ainda estiver NULL
UPDATE public.organizations SET legal_name = name WHERE legal_name IS NULL;

-- Renomear colunas organizations
ALTER TABLE public.organizations RENAME COLUMN email TO email_principal;
ALTER TABLE public.organizations RENAME COLUMN phone TO phone_principal;

-- 1.3 Criar tabela addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'Principal',
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 1.4 Criar tabela contact_channels
CREATE TABLE IF NOT EXISTS public.contact_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  channel_type TEXT NOT NULL,
  value TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.contact_channels ENABLE ROW LEVEL SECURITY;

-- 1.5 Ajustar tabela audit_log
ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS before_json JSONB,
  ADD COLUMN IF NOT EXISTS after_json JSONB;

-- =============================================
-- 1.6 Índices
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_cpf_unique
  ON public.contacts (company_id, cpf)
  WHERE deleted_at IS NULL AND cpf IS NOT NULL AND cpf != '';

CREATE INDEX IF NOT EXISTS idx_contacts_phone
  ON public.contacts (company_id, phone_principal);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_cnpj_unique
  ON public.organizations (company_id, cnpj)
  WHERE deleted_at IS NULL AND cnpj IS NOT NULL AND cnpj != '';

CREATE INDEX IF NOT EXISTS idx_addresses_entity
  ON public.addresses (company_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_deals_contact
  ON public.deals (company_id, contact_id);

CREATE INDEX IF NOT EXISTS idx_deals_organization
  ON public.deals (company_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_contact_channels_entity
  ON public.contact_channels (company_id, entity_type, entity_id);

-- =============================================
-- 1.7 Função auxiliar get_user_role
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- =============================================
-- RLS Policies para addresses
-- =============================================
CREATE POLICY "Tenant isolation" ON public.addresses
  AS RESTRICTIVE FOR ALL
  USING (company_id = get_user_company_id(auth.uid()));

-- =============================================
-- RLS Policies para contact_channels
-- =============================================
CREATE POLICY "Tenant isolation" ON public.contact_channels
  AS RESTRICTIVE FOR ALL
  USING (company_id = get_user_company_id(auth.uid()));
