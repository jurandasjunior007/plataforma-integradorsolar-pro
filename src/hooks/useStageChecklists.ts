import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  company_id: string;
  title: string;
  description: string | null;
  is_required: boolean;
  block_stage_advance: boolean;
  linked_field: string | null;
  position: number;
}

export interface StageChecklist {
  id: string;
  stage_id: string;
  company_id: string;
  title: string;
  description: string | null;
  item_type: string;
  is_required: boolean;
  is_active: boolean;
  block_stage_advance: boolean;
  version: number;
  position: number;
  items?: ChecklistItem[];
  rules_count?: number;
}

export function useStageChecklists(stageId?: string) {
  const { profile } = useAuthContext();
  const qc = useQueryClient();
  const companyId = profile?.company_id;

  const checklistsQuery = useQuery({
    queryKey: ['stage-checklists', stageId],
    enabled: !!stageId && !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stage_checklists')
        .select('*')
        .eq('stage_id', stageId!)
        .eq('company_id', companyId!)
        .order('position');
      if (error) throw error;
      return data as unknown as StageChecklist[];
    },
  });

  const checklistItemsQuery = useQuery({
    queryKey: ['checklist-items', stageId],
    enabled: !!stageId && !!companyId,
    queryFn: async () => {
      // Get all checklist IDs for this stage first
      const { data: checklists } = await supabase
        .from('stage_checklists')
        .select('id')
        .eq('stage_id', stageId!)
        .eq('company_id', companyId!);
      
      if (!checklists?.length) return [];
      
      const ids = checklists.map(c => c.id);
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .in('checklist_id', ids)
        .order('position');
      if (error) throw error;
      return data as unknown as ChecklistItem[];
    },
  });

  const checklistRulesQuery = useQuery({
    queryKey: ['checklist-rules', stageId],
    enabled: !!stageId && !!companyId,
    queryFn: async () => {
      const { data: checklists } = await supabase
        .from('stage_checklists')
        .select('id')
        .eq('stage_id', stageId!)
        .eq('company_id', companyId!);
      
      if (!checklists?.length) return [];
      
      const ids = checklists.map(c => c.id);
      const { data, error } = await supabase
        .from('checklist_rules')
        .select('*')
        .in('checklist_id', ids);
      if (error) throw error;
      return data ?? [];
    },
  });

  const createChecklist = useMutation({
    mutationFn: async (input: { title: string; description?: string; stage_id: string }) => {
      const { data, error } = await supabase
        .from('stage_checklists')
        .insert({
          title: input.title,
          description: input.description ?? null,
          stage_id: input.stage_id,
          company_id: companyId!,
          item_type: 'checkbox',
          position: (checklistsQuery.data?.length ?? 0),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stage-checklists'] }),
  });

  const updateChecklist = useMutation({
    mutationFn: async (input: { id: string; title?: string; description?: string; is_active?: boolean; block_stage_advance?: boolean }) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from('stage_checklists')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stage-checklists'] }),
  });

  const deleteChecklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stage_checklists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stage-checklists'] }),
  });

  const duplicateChecklist = useMutation({
    mutationFn: async (input: { checklistId: string; targetStageId: string }) => {
      // 1. Get source checklist
      const { data: src, error: e1 } = await supabase
        .from('stage_checklists')
        .select('*')
        .eq('id', input.checklistId)
        .single();
      if (e1 || !src) throw e1 || new Error('Not found');

      // 2. Create new checklist
      const { data: newCl, error: e2 } = await supabase
        .from('stage_checklists')
        .insert({
          title: `${src.title} (cópia)`,
          description: src.description,
          stage_id: input.targetStageId,
          company_id: companyId!,
          item_type: src.item_type,
          is_required: src.is_required,
          block_stage_advance: (src as any).block_stage_advance ?? false,
          position: 0,
        })
        .select()
        .single();
      if (e2 || !newCl) throw e2;

      // 3. Copy items
      const { data: items } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', input.checklistId)
        .order('position');
      
      if (items?.length) {
        const newItems = items.map(it => ({
          checklist_id: newCl.id,
          company_id: companyId!,
          title: (it as any).title,
          description: (it as any).description,
          is_required: (it as any).is_required,
          block_stage_advance: (it as any).block_stage_advance,
          linked_field: (it as any).linked_field,
          position: (it as any).position,
        }));
        await supabase.from('checklist_items').insert(newItems);
      }

      // 4. Copy rules
      const { data: rules } = await supabase
        .from('checklist_rules')
        .select('*')
        .eq('checklist_id', input.checklistId);
      
      if (rules?.length) {
        const newRules = rules.map(r => ({
          checklist_id: newCl.id,
          condition_field: r.condition_field,
          condition_operator: r.condition_operator,
          condition_value: r.condition_value,
        }));
        await supabase.from('checklist_rules').insert(newRules);
      }

      return newCl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stage-checklists'] });
      qc.invalidateQueries({ queryKey: ['checklist-items'] });
    },
  });

  // Checklist Items CRUD
  const createItem = useMutation({
    mutationFn: async (input: { checklist_id: string; title: string; is_required?: boolean; block_stage_advance?: boolean; description?: string }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          checklist_id: input.checklist_id,
          company_id: companyId!,
          title: input.title,
          description: input.description ?? null,
          is_required: input.is_required ?? false,
          block_stage_advance: input.block_stage_advance ?? false,
          position: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-items'] }),
  });

  const updateItem = useMutation({
    mutationFn: async (input: { id: string; title?: string; is_required?: boolean; block_stage_advance?: boolean; description?: string; position?: number }) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from('checklist_items')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-items'] }),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checklist_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-items'] }),
  });

  // Rules CRUD
  const createRule = useMutation({
    mutationFn: async (input: { checklist_id: string; condition_field: string; condition_operator: string; condition_value: string }) => {
      const { data, error } = await supabase
        .from('checklist_rules')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-rules'] }),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checklist_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist-rules'] }),
  });

  return {
    checklists: checklistsQuery.data ?? [],
    items: checklistItemsQuery.data ?? [],
    rules: checklistRulesQuery.data ?? [],
    isLoading: checklistsQuery.isLoading,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    duplicateChecklist,
    createItem,
    updateItem,
    deleteItem,
    createRule,
    deleteRule,
  };
}
