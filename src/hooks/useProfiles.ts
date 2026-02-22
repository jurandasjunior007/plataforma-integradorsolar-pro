import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export function useProfiles() {
  const { profile } = useAuthContext();

  return useQuery({
    queryKey: ['profiles', profile?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_active')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile,
  });
}
