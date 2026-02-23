import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface ChecklistTemplate {
  id: string;
  company_id: string;
  name: string;
  sector: string;
  template_data: any;
  created_by: string | null;
  created_at: string;
  is_system: boolean;
}

export function useChecklistTemplates() {
  const { profile } = useAuthContext();
  const qc = useQueryClient();
  const companyId = profile?.company_id;

  const templatesQuery = useQuery({
    queryKey: ['checklist-templates', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ChecklistTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (input: { name: string; sector?: string; template_data: any }) => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .insert({
          name: input.name,
          sector: input.sector ?? 'geral',
          template_data: input.template_data,
          company_id: companyId!,
          created_by: profile?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-templates'] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-templates'] }),
  });

  const saveChecklistAsTemplate = useMutation({
    mutationFn: async (input: { checklistId: string; name: string }) => {
      // Fetch checklist + items
      const { data: checklist } = await supabase
        .from('stage_checklists')
        .select('*')
        .eq('id', input.checklistId)
        .single();
      if (!checklist) throw new Error('Checklist not found');

      const { data: items } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', input.checklistId)
        .order('position');

      const template_data = {
        checklist: {
          title: checklist.title,
          description: checklist.description,
          item_type: checklist.item_type,
          is_required: checklist.is_required,
          block_stage_advance: checklist.block_stage_advance,
        },
        items: (items ?? []).map((it: any) => ({
          title: it.title,
          description: it.description,
          is_required: it.is_required,
          block_stage_advance: it.block_stage_advance,
          linked_field: it.linked_field,
          position: it.position,
        })),
      };

      return createTemplate.mutateAsync({ name: input.name, template_data });
    },
  });

  const applyTemplate = useMutation({
    mutationFn: async (input: { templateId: string; stageId: string }) => {
      const template = templatesQuery.data?.find(t => t.id === input.templateId);
      if (!template) throw new Error('Template not found');

      const td = template.template_data as any;
      const cl = td.checklist ?? td;

      const { data: newCl, error } = await supabase
        .from('stage_checklists')
        .insert({
          title: cl.title ?? template.name,
          description: cl.description ?? null,
          stage_id: input.stageId,
          company_id: companyId!,
          item_type: cl.item_type ?? 'checkbox',
          is_required: cl.is_required ?? false,
          block_stage_advance: cl.block_stage_advance ?? false,
          position: 0,
        })
        .select()
        .single();
      if (error) throw error;

      const items = td.items ?? [];
      if (items.length > 0) {
        await supabase.from('checklist_items').insert(
          items.map((it: any) => ({
            checklist_id: newCl.id,
            company_id: companyId!,
            title: it.title,
            description: it.description ?? null,
            is_required: it.is_required ?? false,
            block_stage_advance: it.block_stage_advance ?? false,
            linked_field: it.linked_field ?? null,
            position: it.position ?? 0,
          }))
        );
      }

      return newCl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stage-checklists'] });
      qc.invalidateQueries({ queryKey: ['checklist-items'] });
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    createTemplate,
    deleteTemplate,
    saveChecklistAsTemplate,
    applyTemplate,
  };
}
