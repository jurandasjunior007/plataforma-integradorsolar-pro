import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuthContext();

  const stats = [
    { label: 'Negócios criados', value: '47', period: 'Este mês', icon: TrendingUp },
    { label: 'Propostas geradas', value: '12', period: 'Este mês', icon: FileText },
    { label: 'Vendas realizadas', value: '8', period: 'Este mês', icon: DollarSign },
  ];

  const tasks = [
    { title: 'Acompanhar assinatura Maria Rita', date: '24 Fev 2026', overdue: true },
    { title: 'Enviar proposta para João Silva', date: '25 Fev 2026', overdue: false },
    { title: 'Follow-up com empresa ABC', date: '26 Fev 2026', overdue: false },
  ];

  const activities = [
    { text: 'Negócio "Projeto Solar 10kW" criado', time: 'Há 2h', user: profile?.full_name },
    { text: 'Proposta enviada para cliente Maria', time: 'Há 4h', user: profile?.full_name },
    { text: 'Negócio movido para "Negociação"', time: 'Há 6h', user: profile?.full_name },
  ];

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Resumo</h1>
        </div>

        {/* Stats */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tarefas do dia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.title}</span>
                  </div>
                  <Badge variant={task.overdue ? 'destructive' : 'secondary'} className="text-xs">
                    {task.date}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Atividades recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <TrendingUp className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm">{act.text}</p>
                    <p className="text-xs text-muted-foreground">{act.time}</p>
                  </div>
                </div>
              ))}
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
                  {[
                    { name: 'Abordagem/Qualificação', count: 15, value: 'R$ 450.000,00' },
                    { name: 'Apresentação Proposta', count: 8, value: 'R$ 280.000,00' },
                    { name: 'Negociação/Fechamento', count: 5, value: 'R$ 175.000,00' },
                    { name: 'Trâmites Negociais', count: 3, value: 'R$ 95.000,00' },
                    { name: 'Assinatura de Contrato', count: 2, value: 'R$ 65.000,00' },
                  ].map((row, i) => (
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
