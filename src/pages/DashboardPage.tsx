import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthContext } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  TrendingUp, FileText, DollarSign, Clock, Eye, Send, Loader2,
  AlertTriangle, Trophy, BarChart3, Percent,
} from 'lucide-react';
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
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuthContext();
  const [newPost, setNewPost] = useState('');

  const { posts, isLoading: loadingPosts, createPost } = usePosts();
  const { tasks, isLoading: loadingTasks, completeTask } = useTasks('today');
  const { pipelines } = usePipelines();
  const firstPipelineId = pipelines[0]?.id;
  const { stages } = useStages(firstPipelineId);
  const { deals } = useDeals(firstPipelineId);

  const companyId = profile?.company_id;

  // Audit log
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

  // KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeDeals = deals.filter(d => d.status !== 'won' && d.status !== 'lost');
    const wonDeals = deals.filter(d => d.status === 'won');
    const wonThisMonth = wonDeals.filter(d => d.won_at && new Date(d.won_at) >= monthStart);
    const totalValue = activeDeals.reduce((s, d) => s + (d.value ?? 0), 0);
    const wonMonthValue = wonThisMonth.reduce((s, d) => s + (d.value ?? 0), 0);
    const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;

    // Deals without activity for 7+ days
    const staleDeals = activeDeals.filter(d => {
      const lastUpdate = new Date(d.updated_at);
      return lastUpdate < sevenDaysAgo;
    });

    return {
      activeCount: activeDeals.length,
      totalValue,
      wonMonthCount: wonThisMonth.length,
      wonMonthValue,
      conversionRate,
      staleDeals,
    };
  }, [deals]);

  // Funnel chart data
  const funnelData = useMemo(() => {
    return stages.map(s => {
      const stageDeals = deals.filter(d => d.stage_id === s.id);
      return {
        name: s.name,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
        color: s.color ?? 'hsl(var(--primary))',
      };
    });
  }, [stages, deals]);

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

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Resumo</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Negócios ativos</span>
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{kpis.activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Em negociação</span>
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{fmt(kpis.totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Fechados no mês</span>
                <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{kpis.wonMonthCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{fmt(kpis.wonMonthValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Taxa conversão</span>
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{kpis.conversionRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className={kpis.staleDeals.length > 0 ? 'border-destructive/50' : ''}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Sem atividade 7d+</span>
                <AlertTriangle className={`h-3.5 w-3.5 ${kpis.staleDeals.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              </div>
              <p className={`text-2xl font-bold ${kpis.staleDeals.length > 0 ? 'text-destructive' : ''}`}>
                {kpis.staleDeals.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel chart */}
        {funnelData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Funil de Conversão por Etapa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={120} fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [
                      name === 'count' ? `${value} negócio(s)` : fmt(value),
                      name === 'count' ? 'Quantidade' : 'Valor',
                    ]}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {funnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

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

        {/* Follow-up alerts */}
        {kpis.staleDeals.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Atenção necessária — Negócios sem atividade há 7+ dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.staleDeals.slice(0, 10).map(deal => {
                  const daysStale = Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors"
                      onClick={() => navigate(`/negocios/${deal.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {deal.contact?.name ?? deal.organization?.name ?? '—'}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs shrink-0">
                        {daysStale}d sem atividade
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pipeline summary table */}
        {funnelData.length > 0 && (
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
                    {funnelData.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{row.name}</td>
                        <td className="py-2 text-right">{row.count} negócio{row.count !== 1 ? 's' : ''}</td>
                        <td className="py-2 text-right font-medium">{fmt(row.value)}</td>
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
