import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText, DollarSign, Clock, CheckCircle, MessageSquare, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardPage() {
  const { profile } = useAuthContext();

  const stats = [
    { label: 'Negócios criados', value: '47', period: 'Este mês', icon: TrendingUp },
    { label: 'Propostas geradas', value: '12', period: 'Este mês', icon: FileText },
    { label: 'Vendas realizadas', value: '8', period: 'Este mês', icon: DollarSign },
  ];

  const tasks = [
    { title: 'Acompanhar assinatura Maria Rita', date: 'Segunda-feira, 24 de Fev de 2026 às 13:00', overdue: true },
    { title: 'Enviar proposta para João Silva', date: 'Terça-feira, 25 de Fev de 2026 às 18:00', overdue: false },
    { title: 'Follow-up com empresa ABC Solar', date: 'Quarta-feira, 26 de Fev de 2026 às 08:00', overdue: false },
  ];

  const activities = [
    { text: 'Negócio Projeto Solar 10kW criado.', time: 'Hoje às 19:17', contact: 'Maria Rita', type: 'deal' },
    { text: 'Pessoa Tamo Carlos criada.', time: 'Hoje às 19:17', contact: 'Tamo Carlos', type: 'contact' },
    { text: 'Negócio Eder Oliveira criado.', time: 'Hoje às 19:11', contact: 'Eder Oliveira', type: 'deal' },
    { text: 'Negócio Paulo Sérgio criado.', time: 'Hoje às 18:35', contact: 'Paulo Sérgio', type: 'deal' },
  ];

  const pipelineStages = [
    { name: '💎 Abordagem/Qualificação', count: 15, value: 'R$ 450.000,00' },
    { name: '📋 Apresentação Proposta', count: 8, value: 'R$ 280.000,00' },
    { name: '📄 Negociação/Fechamento', count: 5, value: 'R$ 175.000,00' },
    { name: '⚙️ Trâmites Negociais', count: 3, value: 'R$ 95.000,00' },
    { name: '✅ Assinatura de Contrato', count: 2, value: 'R$ 65.000,00' },
  ];

  const userInitials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Resumo</h1>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <Badge variant="secondary" className="text-xs">{stat.period}</Badge>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3-block layout: Publicações + Tarefas do dia + Atividades */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Publicações */}
          <Card className="lg:col-span-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publicações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Nova publicação...</span>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Quarta-feira, 18 de Dezembro de 2024 às 21:02
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Ola, equipe Boxsol. Foi criada pasta na nuvem com todas as normas e procedimentos.
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> 0
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarefas do dia */}
          <Card className="lg:col-span-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Tarefas do dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[320px]">
                <div className="space-y-4">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 mt-0.5 shrink-0 ${task.overdue ? 'border-destructive' : 'border-muted-foreground/30'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{task.title}</p>
                        <Badge variant={task.overdue ? 'destructive' : 'secondary'} className="text-[10px] mt-1">
                          📅 {task.date}
                        </Badge>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                            <Eye className="h-3 w-3" /> Visualizar
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> 0
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card className="lg:col-span-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Atividades</CardTitle>
                <span className="text-xs text-muted-foreground">Todas as atividades</span>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[320px]">
                <div className="space-y-4">
                  {activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                        <TrendingUp className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">IntegradorOS</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {act.time}
                        </p>
                        <p className="text-sm mt-0.5">{act.text}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="cursor-pointer hover:text-foreground">Visualizar</span>
                          <span>👤 {act.contact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline summary table */}
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
                  {pipelineStages.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{row.name}</td>
                      <td className="py-2 text-right">{row.count} negócios</td>
                      <td className="py-2 text-right font-medium">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
