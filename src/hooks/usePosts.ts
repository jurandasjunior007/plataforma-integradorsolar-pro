import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface PostRow {
  id: string;
  company_id: string;
  author_user_id: string | null;
  content: string;
  created_at: string;
  deleted_at: string | null;
  author?: { id: string; full_name: string } | null;
}

export function usePosts() {
  const { profile, user } = useAuthContext();
  const qc = useQueryClient();
  const companyId = profile?.company_id;

  const query = useQuery({
    queryKey: ['posts', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts' as any)
        .select('*')
        .eq('company_id', companyId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;

      const userIds = [...new Set((data ?? []).map((d: any) => d.author_user_id).filter(Boolean))];
      let userMap: Record<string, { id: string; full_name: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds as string[]);
        for (const p of profiles ?? []) {
          userMap[p.id] = p;
        }
      }

      return (data ?? []).map((d: any) => ({
        ...d,
        author: d.author_user_id ? userMap[d.author_user_id] ?? null : null,
      })) as PostRow[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('posts' as any)
        .insert({
          content,
          company_id: companyId!,
          author_user_id: user?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('audit_log').insert({
        company_id: companyId!,
        user_id: user?.id ?? null,
        entity_type: 'post',
        entity_id: (data as any).id,
        action: 'create',
        summary: 'Criou uma publicação',
      } as any);

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['audit_log'] });
    },
  });

  return {
    posts: query.data ?? [],
    isLoading: query.isLoading,
    createPost,
  };
}
