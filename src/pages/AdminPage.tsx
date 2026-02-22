import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Settings, Users, Workflow, Webhook, Layers, CheckSquare, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();
  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Administração</h1>

        <Tabs defaultValue="pipelines">
          <TabsList className="flex-wrap">
            <TabsTrigger value="pipelines" className="gap-1"><Layers className="h-3 w-3" />Funis</TabsTrigger>
            <TabsTrigger value="deal-config" className="gap-1"><CheckSquare className="h-3 w-3" />Config. Negócios</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="h-3 w-3" />Usuários</TabsTrigger>
            <TabsTrigger value="automations" className="gap-1"><Workflow className="h-3 w-3" />Automações</TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-1"><Webhook className="h-3 w-3" />Webhooks</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1"><Settings className="h-3 w-3" />Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="pipelines" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Funis de Vendas</h2>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Novo funil</Button>
            </div>
            {['Vendas - Energia Solar', 'Pós-Venda'].map((p, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{p}</CardTitle>
                    <Badge variant="secondary">5 etapas</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {['Abordagem', 'Proposta', 'Negociação', 'Trâmites', 'Contrato'].map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="deal-config" className="space-y-4">
            <h2 className="text-lg font-semibold">Configuração de Negócios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Gerenciar Funis', desc: 'Criar e editar funis de vendas', icon: Layers },
                { title: 'Gerenciar Etapas', desc: 'Configurar etapas de cada funil', icon: SlidersHorizontal },
                { title: 'Configurar Checklists', desc: 'Definir itens obrigatórios por etapa', icon: CheckSquare },
                { title: 'Regras Condicionais', desc: 'Regras de exibição de campos e checklists', icon: Workflow },
                { title: 'Campos Obrigatórios', desc: 'Definir campos obrigatórios por etapa', icon: Settings },
                { title: 'Automações por Etapa', desc: 'Ações automáticas ao mudar de etapa', icon: Workflow },
              ].map((item, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate('/admin/deal-config')}>
                  <CardContent className="pt-6 flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="pt-6">
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Campos personalizados (em breve)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Usuários</h2>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Convidar usuário</Button>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-3">
                {[
                  { name: 'Admin Demo', role: 'admin', email: 'admin@demo.com' },
                  { name: 'Supervisor Demo', role: 'supervisor', email: 'supervisor@demo.com' },
                  { name: 'Vendedor Demo', role: 'vendedor', email: 'vendedor@demo.com' },
                ].map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Automações</h2>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Nova automação</Button>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Criar tarefa ao entrar em "Negociação"</p>
                    <p className="text-xs text-muted-foreground">Quando negócio mover para etapa Negociação → criar tarefa D+2</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div>
                    <p className="font-medium text-sm">Notificar supervisor ao criar negócio</p>
                    <p className="text-xs text-muted-foreground">Quando novo negócio criado → notificar supervisor</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Webhooks</h2>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Novo webhook</Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Nenhum webhook configurado. Adicione endpoints para receber eventos como deal_created, stage_changed, etc.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-lg font-semibold">Configurações da Empresa</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Nome da empresa</Label>
                  <Input defaultValue="Empresa Demo Solar" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input defaultValue="demo-solar" disabled />
                </div>
                <Button>Salvar</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
