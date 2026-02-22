import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthContext } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, FileText, DollarSign, Clock, MessageSquare, Eye, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePosts } from '@/hooks/usePosts';
import { useTasks } from '@/hooks/useTasks';
import { useDeals } from '@/hooks/useDeals';
import { usePipelines, useStages } from '@/hooks/usePipelines';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuthContext();
  const [newPost, setNewPost] = useState('');

  // Real data hooks
  const { posts, isLoading: loadingPosts, createPost } = usePosts();
  const { tasks, isLoading: loadingTasks, completeTask } = useTasks('today');
  const { pipelines } = usePipelines();
  const firstPipelineId = pipelines[0]?.id;
  const { stages } = useStages(firstPipelineId);
  const { deals } = useDeals(firstPipelineId);

  // Audit log
  const companyId = profile?.company_id;
  const auditQuery = useQuery({
    queryKey: ['audit_log', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set((data ?? []).map(d => d.user_id).filter(Boolean))];
      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds as string[]);
        for (const p of profiles ?? []) {
          userMap[p.id] = p.full_name;
        }
      }

      return (data ?? []).map(d => ({
        ...d,
        user_name: d.user_id ? userMap[d.user_id] ?? 'Sistema' : 'Sistema',
      }));
    },
  });

  const activities = auditQuery.data ?? [];

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      await createPost.mutateAsync(newPost.trim());
      setNewPost('');
      toast({ title: 'Publicação criada' });
    } catch {
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask.mutateAsync(taskId);
      toast({ title: 'Tarefa concluída' });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const userInitials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  // Pipeline summary
  const stageStats = stages.map(s => {
    const stageDeals = deals.filter(d => d.stage_id === s.id);
    return {
      name: `${s.icon ?? ''} ${s.name}`,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  });

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Resumo</h1>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Negócios ativos</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{totalDeals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tarefas hoje</span>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{tasks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Valor total no funil</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3-block layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Publicações */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publicações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Nova publicação..."
                  rows={2}
                  className="text-sm resize-none"
                />
                <div className="flex justify-end">
                  <Button size="sm" className="gap-1 h-7 text-xs" onClick={handleCreatePost} disabled={!newPost.trim() || createPost.isPending}>
                    <Send className="h-3 w-3" />
                    {createPost.isPending ? '...' : 'Publicar'}
                  </Button>
                </div>
              </div>

              <ScrollArea className="max-h-[320px]">
                {loadingPosts ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : posts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma publicação ainda</p>
                ) : (
                  <div className="space-y-4">
                    {posts.map(post => (
                      <div key={post.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 mt-0.5">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                            {post.author?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{post.author?.full_name ?? 'Usuário'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-sm mt-1 text-muted-foreground">{post.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tarefas do dia */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tarefas do dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[320px]">
                {loadingTasks ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa para hoje 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => {
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());
                      return (
                        <div key={task.id} className="flex items-start gap-3">
                          <Checkbox
                            checked={task.status === 'completed'}
                            onCheckedChange={() => handleCompleteTask(task.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{task.title}</p>
                            <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-[10px] mt-1">
                              {task.due_date ? format(new Date(task.due_date), "dd/MM 'às' HH:mm", { locale: ptBR }) : ''}
                            </Badge>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {task.deal && (
                                <span
                                  className="flex items-center gap-1 cursor-pointer hover:text-foreground"
                                  onClick={() => navigate(`/negocios/${task.deal!.id}`)}
                                >
                                  <Eye className="h-3 w-3" /> {task.deal.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Atividades</CardTitle>
                <span className="text-xs text-muted-foreground">Todas as atividades</span>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[320px]">
                {auditQuery.isLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                          <TrendingUp className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{act.user_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(act.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-sm mt-0.5">
                            {(act as any).summary || `${act.action} ${act.entity_type}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline summary table */}
        {stageStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Situação dos Negócios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Estágio</th>
                      <th className="text-right py-2 font-medium">Quantidade</th>
                      <th className="text-right py-2 font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageStats.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{row.name}</td>
                        <td className="py-2 text-right">{row.count} negócio{row.count !== 1 ? 's' : ''}</td>
                        <td className="py-2 text-right font-medium">
                          {row.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
