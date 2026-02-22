import { useState, useMemo } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, BarChart3, Users, PieChart as PieChartIcon, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Funnel, FunnelChart,
} from 'recharts';
import { usePipelines, useStages } from '@/hooks/usePipelines';
import { useDeals } from '@/hooks/useDeals';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['hsl(14, 90%, 52%)', 'hsl(24, 90%, 55%)', 'hsl(34, 90%, 58%)', 'hsl(44, 90%, 61%)', 'hsl(54, 90%, 64%)', 'hsl(64, 90%, 50%)'];

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function exportCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { profile } = useAuthContext();
  const { pipelines } = usePipelines();
  const [selectedPipeline, setSelectedPipeline] = useState('');
  if (!selectedPipeline && pipelines.length > 0) setSelectedPipeline(pipelines[0].id);

  const { stages } = useStages(selectedPipeline || undefined);
  const { deals } = useDeals(selectedPipeline || undefined);
  const { data: profiles = [] } = useProfiles();

  const companyId = profile?.company_id;

  // Fetch all deals (all pipelines) for seller ranking
  const allDealsQuery = useQuery({
    queryKey: ['all-deals-report', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, value, status, owner_id, stage_id, pipeline_id, lost_reason, lost_at, won_at, created_at')
        .eq('company_id', companyId!)
        .is('deleted_at', null);
      if (error) throw error;
      return data ?? [];
    },
  });
  const allDeals = allDealsQuery.data ?? [];

  // 9.1 Funnel data
  const funnelData = useMemo(() => {
    return stages.map((s, idx) => {
      const stageDeals = deals.filter(d => d.stage_id === s.id);
      const prevCount = idx > 0 ? deals.filter(d => d.stage_id === stages[idx - 1].id).length : stageDeals.length;
      const convRate = prevCount > 0 ? ((stageDeals.length / prevCount) * 100) : 100;
      return {
        name: s.name,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
        convRate: idx === 0 ? 100 : Math.round(convRate),
        color: s.color ?? COLORS[idx % COLORS.length],
      };
    });
  }, [stages, deals]);

  // 9.2 Seller ranking
  const sellerRanking = useMemo(() => {
    const map: Record<string, { name: string; created: number; won: number; totalValue: number }> = {};
    for (const p of profiles) {
      map[p.id] = { name: p.full_name, created: 0, won: 0, totalValue: 0 };
    }
    for (const d of allDeals) {
      if (!d.owner_id || !map[d.owner_id]) continue;
      map[d.owner_id].created++;
      if (d.status === 'won') {
        map[d.owner_id].won++;
        map[d.owner_id].totalValue += d.value ?? 0;
      }
    }
    return Object.entries(map)
      .map(([id, data]) => ({
        id,
        ...data,
        ticketMedio: data.won > 0 ? data.totalValue / data.won : 0,
        convRate: data.created > 0 ? ((data.won / data.created) * 100) : 0,
      }))
      .filter(s => s.created > 0)
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [allDeals, profiles]);

  // 9.3 Loss analysis
  const lossAnalysis = useMemo(() => {
    const lostDeals = allDeals.filter(d => d.status === 'lost');
    const reasons: Record<string, number> = {};
    for (const d of lostDeals) {
      const reason = d.lost_reason ?? 'Não informado';
      reasons[reason] = (reasons[reason] ?? 0) + 1;
    }
    return Object.entries(reasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }, [allDeals]);

  const lossChartData = lossAnalysis.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Selecionar funil" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="funnel">
          <TabsList>
            <TabsTrigger value="funnel" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Funil
            </TabsTrigger>
            <TabsTrigger value="sellers" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Vendedores
            </TabsTrigger>
            <TabsTrigger value="losses" className="gap-1.5">
              <TrendingDown className="h-3.5 w-3.5" /> Perdas
            </TabsTrigger>
          </TabsList>

          {/* 9.1 Funnel */}
          <TabsContent value="funnel" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Negócios por Etapa</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => exportCSV(
                      ['Etapa', 'Quantidade', 'Valor', 'Conversão'],
                      funnelData.map(r => [r.name, String(r.count), String(r.value), `${r.convRate}%`]),
                      'funil-conversao'
                    )}
                  >
                    <Download className="h-3.5 w-3.5" /> CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={funnelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        formatter={(value: number) => [value, 'Negócios']}
                        contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {funnelData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Valor por Etapa</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={funnelData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {funnelData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => fmt(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Taxa de Conversão entre Etapas</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etapa</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Conversão da Etapa Anterior</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funnelData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{fmt(row.value)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.convRate >= 50 ? 'default' : 'secondary'}>
                            {row.convRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9.2 Seller Ranking */}
          <TabsContent value="sellers" className="space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Ranking de Vendedores</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => exportCSV(
                    ['Vendedor', 'Criados', 'Fechados', 'Valor Total', 'Ticket Médio', 'Conversão'],
                    sellerRanking.map(s => [s.name, String(s.created), String(s.won), String(s.totalValue), String(Math.round(s.ticketMedio)), `${s.convRate.toFixed(1)}%`]),
                    'ranking-vendedores'
                  )}
                >
                  <Download className="h-3.5 w-3.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Criados</TableHead>
                      <TableHead className="text-right">Fechados</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                      <TableHead className="text-right">Conversão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellerRanking.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Sem dados para exibir
                        </TableCell>
                      </TableRow>
                    ) : sellerRanking.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-right">{s.created}</TableCell>
                        <TableCell className="text-right">{s.won}</TableCell>
                        <TableCell className="text-right font-medium">{fmt(s.totalValue)}</TableCell>
                        <TableCell className="text-right">{fmt(s.ticketMedio)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={s.convRate >= 30 ? 'default' : 'secondary'}>
                            {s.convRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9.3 Loss Analysis */}
          <TabsContent value="losses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Motivos de Perda</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => exportCSV(
                      ['Motivo', 'Quantidade'],
                      lossAnalysis.map(r => [r.reason, String(r.count)]),
                      'analise-perdas'
                    )}
                  >
                    <Download className="h-3.5 w-3.5" /> CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {lossAnalysis.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum negócio perdido registrado</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={lossChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ reason, percent }) => `${reason} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          dataKey="count"
                          nameKey="reason"
                        >
                          {lossChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Detalhamento</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Motivo</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lossAnalysis.map((row, i) => {
                        const total = lossAnalysis.reduce((s, r) => s + r.count, 0);
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.reason}</TableCell>
                            <TableCell className="text-right">{row.count}</TableCell>
                            <TableCell className="text-right">{((row.count / total) * 100).toFixed(1)}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
