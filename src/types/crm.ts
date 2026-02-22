export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  settings: Record<string, any>;
}

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
}

export type AppRole = 'admin' | 'supervisor' | 'vendedor';

export interface Pipeline {
  id: string;
  company_id: string;
  name: string;
  icon: string;
  is_active: boolean;
  position: number;
}

export interface Stage {
  id: string;
  pipeline_id: string;
  company_id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
}

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  company_id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  created_at: string;
}

export interface Deal {
  id: string;
  company_id: string;
  pipeline_id: string;
  stage_id: string;
  contact_id?: string;
  organization_id?: string;
  owner_id?: string;
  title: string;
  value: number;
  expected_close_date?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  position: number;
  created_at: string;
  updated_at: string;
  // Joined
  contact?: Contact;
  owner?: Profile;
  organization?: Organization;
}

export interface Task {
  id: string;
  company_id: string;
  deal_id?: string;
  contact_id?: string;
  assigned_to?: string;
  created_by?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Interaction {
  id: string;
  company_id: string;
  deal_id?: string;
  contact_id?: string;
  user_id?: string;
  type: 'call' | 'whatsapp' | 'email' | 'note' | 'meeting';
  content?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface StageChecklist {
  id: string;
  stage_id: string;
  company_id: string;
  title: string;
  item_type: 'checkbox' | 'response';
  is_required: boolean;
  position: number;
}

export interface DealChecklistItem {
  id: string;
  deal_id: string;
  checklist_id: string;
  completed: boolean;
  response?: string;
  completed_by?: string;
  completed_at?: string;
}

export interface DocumentTemplate {
  id: string;
  company_id: string;
  name: string;
  doc_type: 'proposal' | 'contract';
  content: string;
  placeholders: string[];
  is_active: boolean;
}

export interface Document {
  id: string;
  company_id: string;
  deal_id?: string;
  template_id?: string;
  name: string;
  doc_type: string;
  content?: string;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  file_url?: string;
  created_by?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  title: string;
  message?: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  is_active: boolean;
}
