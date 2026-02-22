import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface TaskRow {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  deal_id: string | null;
  contact_id: string | null;
  related_type: string | null;
  related_id: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined
  assigned_user?: { id: string; full_name: string } | null;
  deal?: { id: string; title: string } | null;
  contact?: { id: string; name: string } | null;
}

export type TaskFilter = 'mine' | 'today' | 'overdue' | 'week' | 'done' | 'all';

export function useTasks(filter?: TaskFilter, dealId?: string) {
  const { profile, user } = useAuthContext();
  const qc = useQueryClient();
  const companyId = profile?.company_id;

  const tasksQuery = useQuery({
    queryKey: ['tasks', filter, dealId, companyId],
    enabled: !!companyId,
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!tasks_assigned_to_fkey(id, full_name),
          deal:deals!tasks_deal_id_fkey(id, title),
          contact:contacts!tasks_contact_id_fkey(id, name)
        `)
        .eq('company_id', companyId!)
        .is('deleted_at', null)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

      if (filter === 'mine') {
        query = query.eq('assigned_to', user?.id ?? '').in('status', ['pending', 'in_progress']);
      } else if (filter === 'today') {
        query = query.gte('due_date', startOfDay).lte('due_date', endOfDay).in('status', ['pending', 'in_progress']);
      } else if (filter === 'overdue') {
        query = query.lt('due_date', startOfDay).in('status', ['pending', 'in_progress']);
      } else if (filter === 'week') {
        query = query.gte('due_date', startOfDay).lte('due_date', weekEnd).in('status', ['pending', 'in_progress']);
      } else if (filter === 'done') {
        query = query.eq('status', 'completed');
      } else if (!dealId) {
        // 'all' or default - show open
        query = query.in('status', ['pending', 'in_progress']);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as TaskRow[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      due_date: string;
      assigned_to: string;
      deal_id?: string;
      contact_id?: string;
      priority?: string;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description ?? null,
          due_date: input.due_date,
          assigned_to: input.assigned_to,
          deal_id: input.deal_id ?? null,
          contact_id: input.contact_id ?? null,
          priority: input.priority ?? 'normal',
          company_id: companyId!,
          created_by: user?.id ?? null,
          status: 'pending',
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['deal-task-status'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: { id: string; title?: string; description?: string; due_date?: string; assigned_to?: string; priority?: string; status?: string }) => {
      const { id, ...updates } = input;
      const updateData: any = { ...updates, updated_at: new Date().toISOString() };
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['deal-task-status'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['deal-task-status'] });
    },
  });

  const completeTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['deal-task-status'] });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
}
