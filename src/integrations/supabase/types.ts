export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          cep: string | null
          city: string | null
          company_id: string
          complement: string | null
          created_at: string
          deleted_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_primary: boolean
          label: string
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          number: string | null
          state: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          city?: string | null
          company_id: string
          complement?: string | null
          created_at?: string
          deleted_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_primary?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          city?: string | null
          company_id?: string
          complement?: string | null
          created_at?: string
          deleted_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_primary?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          after_json: Json | null
          before_json: Json | null
          company_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          after_json?: Json | null
          before_json?: Json | null
          company_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          after_json?: Json | null
          before_json?: Json | null
          company_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_actions: {
        Row: {
          action_config: Json | null
          action_type: string
          automation_id: string
          company_id: string
          created_at: string
          id: string
          position: number
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          automation_id: string
          company_id: string
          created_at?: string
          id?: string
          position?: number
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          automation_id?: string
          company_id?: string
          created_at?: string
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_conditions: {
        Row: {
          automation_id: string
          condition_field: string
          condition_operator: string
          condition_value: string
          id: string
          logic_group: string
          position: number
        }
        Insert: {
          automation_id: string
          condition_field: string
          condition_operator?: string
          condition_value: string
          id?: string
          logic_group?: string
          position?: number
        }
        Update: {
          automation_id?: string
          condition_field?: string
          condition_operator?: string
          condition_value?: string
          id?: string
          logic_group?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "automation_conditions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          action_config: Json | null
          action_type: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          pipeline_id: string | null
          stage_id: string | null
          trigger_config: Json | null
          trigger_event: string
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          pipeline_id?: string | null
          stage_id?: string | null
          trigger_config?: Json | null
          trigger_event: string
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pipeline_id?: string | null
          stage_id?: string | null
          trigger_config?: Json | null
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          block_stage_advance: boolean
          checklist_id: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          linked_field: string | null
          position: number
          title: string
        }
        Insert: {
          block_stage_advance?: boolean
          checklist_id: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          linked_field?: string | null
          position?: number
          title: string
        }
        Update: {
          block_stage_advance?: boolean
          checklist_id?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          linked_field?: string | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "stage_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_rules: {
        Row: {
          checklist_id: string
          condition_field: string
          condition_operator: string
          condition_value: string
          id: string
        }
        Insert: {
          checklist_id: string
          condition_field: string
          condition_operator?: string
          condition_value: string
          id?: string
        }
        Update: {
          checklist_id?: string
          condition_field?: string
          condition_operator?: string
          condition_value?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_rules_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "stage_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_channels: {
        Row: {
          channel_type: string
          company_id: string
          created_at: string
          deleted_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_primary: boolean
          updated_at: string
          value: string
        }
        Insert: {
          channel_type: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          value: string
        }
        Update: {
          channel_type?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_channels_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          company_id: string
          cpf: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email_principal: string | null
          full_name: string | null
          id: string
          name: string
          notes: string | null
          owner_user_id: string | null
          phone_principal: string | null
          rg: string | null
          state: string | null
          status_cadastro: string
          tags: string[]
          type: string
          updated_at: string
          whatsapp_principal: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          company_id: string
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email_principal?: string | null
          full_name?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_user_id?: string | null
          phone_principal?: string | null
          rg?: string | null
          state?: string | null
          status_cadastro?: string
          tags?: string[]
          type?: string
          updated_at?: string
          whatsapp_principal?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          company_id?: string
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email_principal?: string | null
          full_name?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_user_id?: string | null
          phone_principal?: string | null
          rg?: string | null
          state?: string | null
          status_cadastro?: string
          tags?: string[]
          type?: string
          updated_at?: string
          whatsapp_principal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_options: {
        Row: {
          field_id: string
          id: string
          label: string
          position: number
          value: string
        }
        Insert: {
          field_id: string
          id?: string
          label: string
          position?: number
          value: string
        }
        Update: {
          field_id?: string
          id?: string
          label?: string
          position?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_options_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          company_id: string
          created_at: string
          entity_type: string
          field_type: Database["public"]["Enums"]["field_type"]
          id: string
          is_required: boolean
          label: string
          name: string
          pipeline_id: string | null
          position: number
          settings: Json | null
          stage_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          entity_type: string
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_required?: boolean
          label: string
          name: string
          pipeline_id?: string | null
          position?: number
          settings?: Json | null
          stage_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          entity_type?: string
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_required?: boolean
          label?: string
          name?: string
          pipeline_id?: string | null
          position?: number
          settings?: Json | null
          stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_fields_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_fields_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_checklist_items: {
        Row: {
          checklist_id: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          deal_id: string
          id: string
          item_id: string | null
          response: string | null
        }
        Insert: {
          checklist_id: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          deal_id: string
          id?: string
          item_id?: string | null
          response?: string | null
        }
        Update: {
          checklist_id?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          deal_id?: string
          id?: string
          item_id?: string | null
          response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "stage_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_checklist_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_checklist_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stage_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          deal_id: string
          from_stage_id: string | null
          id: string
          to_stage_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          deal_id: string
          from_stage_id?: string | null
          id?: string
          to_stage_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          deal_id?: string
          from_stage_id?: string | null
          id?: string
          to_stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          company_id: string
          contact_id: string | null
          created_at: string
          custom_fields: Json | null
          expected_close_date: string | null
          id: string
          lost_at: string | null
          lost_reason: string | null
          organization_id: string | null
          owner_id: string | null
          pipeline_id: string
          position: number
          stage_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          value: number | null
          won_at: string | null
        }
        Insert: {
          company_id: string
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          organization_id?: string | null
          owner_id?: string | null
          pipeline_id: string
          position?: number
          stage_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          value?: number | null
          won_at?: string | null
        }
        Update: {
          company_id?: string
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          organization_id?: string | null
          owner_id?: string | null
          pipeline_id?: string
          position?: number
          stage_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          value?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          company_id: string
          content: string
          created_at: string
          doc_type: string
          id: string
          is_active: boolean
          name: string
          placeholders: string[] | null
          updated_at: string
        }
        Insert: {
          company_id: string
          content?: string
          created_at?: string
          doc_type?: string
          id?: string
          is_active?: boolean
          name: string
          placeholders?: string[] | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          doc_type?: string
          id?: string
          is_active?: boolean
          name?: string
          placeholders?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          company_id: string
          content: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          doc_type: string
          file_url: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["document_status"]
          template_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          doc_type?: string
          file_url?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["document_status"]
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          doc_type?: string
          file_url?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["document_status"]
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      field_rules: {
        Row: {
          condition_field: string
          condition_operator: string
          condition_value: string
          created_at: string
          field_id: string
          id: string
          rule_type: string
        }
        Insert: {
          condition_field: string
          condition_operator?: string
          condition_value: string
          created_at?: string
          field_id: string
          id?: string
          rule_type: string
        }
        Update: {
          condition_field?: string
          condition_operator?: string
          condition_value?: string
          created_at?: string
          field_id?: string
          id?: string
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_rules_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          company_id: string
          contact_id: string | null
          content: string | null
          created_at: string
          deal_id: string | null
          id: string
          metadata: Json | null
          type: Database["public"]["Enums"]["interaction_type"]
          user_id: string | null
        }
        Insert: {
          company_id: string
          contact_id?: string | null
          content?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          type: Database["public"]["Enums"]["interaction_type"]
          user_id?: string | null
        }
        Update: {
          company_id?: string
          contact_id?: string | null
          content?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          type?: Database["public"]["Enums"]["interaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email_principal: string | null
          id: string
          legal_name: string | null
          name: string
          notes: string | null
          owner_user_id: string | null
          phone_principal: string | null
          segment: string | null
          state: string | null
          state_registration_ie: string | null
          status_cadastro: string
          trade_name: string | null
          updated_at: string
          whatsapp_principal: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email_principal?: string | null
          id?: string
          legal_name?: string | null
          name: string
          notes?: string | null
          owner_user_id?: string | null
          phone_principal?: string | null
          segment?: string | null
          state?: string | null
          state_registration_ie?: string | null
          status_cadastro?: string
          trade_name?: string | null
          updated_at?: string
          whatsapp_principal?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email_principal?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          notes?: string | null
          owner_user_id?: string | null
          phone_principal?: string | null
          segment?: string | null
          state?: string | null
          state_registration_ie?: string | null
          status_cadastro?: string
          trade_name?: string | null
          updated_at?: string
          whatsapp_principal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          company_id: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          unit: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          unit?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_checklists: {
        Row: {
          block_stage_advance: boolean
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          item_type: string
          position: number
          stage_id: string
          title: string
          version: number
        }
        Insert: {
          block_stage_advance?: boolean
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          item_type?: string
          position?: number
          stage_id: string
          title: string
          version?: number
        }
        Update: {
          block_stage_advance?: boolean
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          item_type?: string
          position?: number
          stage_id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "stage_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_checklists_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          icon: string | null
          id: string
          name: string
          pipeline_id: string
          position: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          pipeline_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          company_id: string
          contact_id: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          company_id: string
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          name: string
          secret: string | null
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          secret?: string | null
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          secret?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "vendedor"
      document_status: "draft" | "sent" | "signed" | "cancelled"
      field_type:
        | "text"
        | "number"
        | "select"
        | "date"
        | "boolean"
        | "money"
        | "phone"
        | "email"
        | "textarea"
      interaction_type: "call" | "whatsapp" | "email" | "note" | "meeting"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "supervisor", "vendedor"],
      document_status: ["draft", "sent", "signed", "cancelled"],
      field_type: [
        "text",
        "number",
        "select",
        "date",
        "boolean",
        "money",
        "phone",
        "email",
        "textarea",
      ],
      interaction_type: ["call", "whatsapp", "email", "note", "meeting"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
