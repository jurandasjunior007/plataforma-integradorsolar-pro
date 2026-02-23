import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { ALL_PERMISSIONS, type Permission } from '@/hooks/usePermissions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type { AppRole } from '@/types/crm';

const ROLES: AppRole[] = ['admin', 'supervisor', 'vendedor'];

const PERMISSION_LABELS: Record<string, string> = {
  'deals.create': 'Criar negócios',
  'deals.edit': 'Editar negócios',
  'deals.delete': 'Excluir negócios',
  'deals.view_all': 'Ver todos os negócios',
  'stages.create': 'Criar etapas',
  'stages.edit': 'Editar etapas',
  'stages.delete': 'Excluir etapas',
  'checklists.create': 'Criar checklists',
  'checklists.edit': 'Editar checklists',
  'checklists.delete': 'Excluir checklists',
  'templates.create': 'Criar templates',
  'templates.edit': 'Editar templates',
  'templates.delete': 'Excluir templates',
  'contacts.create': 'Criar contatos',
  'contacts.edit': 'Editar contatos',
  'contacts.delete': 'Excluir contatos',
  'reports.view': 'Ver relatórios',
  'admin.access': 'Acesso administração',
};

function PermissionsSubTab() {
  const { profile } = useAuthContext();
  const companyId = profile?.company_id;
  const qc = useQueryClient();

  const { data: permissions } = useQuery({
    queryKey: ['all-role-permissions', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('company_id', companyId!);
      if (error) throw error;
      return data as { id: string; role: AppRole; permission: string; granted: boolean }[];
    },
  });

  const upsertPermission = useMutation({
    mutationFn: async (input: { role: AppRole; permission: string; granted: boolean }) => {
      const existing = permissions?.find(p => p.role === input.role && p.permission === input.permission);
      if (existing) {
        const { error } = await supabase
          .from('role_permissions')
          .update({ granted: input.granted })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            company_id: companyId!,
            role: input.role,
            permission: input.permission,
            granted: input.granted,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-role-permissions'] });
      toast({ title: 'Permissão atualizada' });
    },
    onError: () => toast({ title: 'Erro ao atualizar', variant: 'destructive' }),
  });

  const isGranted = (role: AppRole, permission: string): boolean => {
    const override = permissions?.find(p => p.role === role && p.permission === permission);
    if (override) return override.granted;
    // defaults
    if (role === 'admin') return true;
    if (role === 'supervisor') return permission !== 'admin.access';
    // vendedor
    return ['deals.create', 'deals.edit', 'contacts.create', 'contacts.edit'].includes(permission);
  };

  return (
    <Card>
      <CardContent className="pt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Permissão</TableHead>
              {ROLES.map(r => (
                <TableHead key={r} className="text-center capitalize">{r}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ALL_PERMISSIONS.map(perm => (
              <TableRow key={perm}>
                <TableCell className="text-sm">{PERMISSION_LABELS[perm] ?? perm}</TableCell>
                {ROLES.map(role => (
                  <TableCell key={role} className="text-center">
                    <Checkbox
                      checked={isGranted(role, perm)}
                      onCheckedChange={(checked) =>
                        upsertPermission.mutate({ role, permission: perm, granted: !!checked })
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [usersSubTab, setUsersSubTab] = useState<'list' | 'permissions'>('list');

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

            <div className="flex gap-2 mb-2">
              <Button
                size="sm"
                variant={usersSubTab === 'list' ? 'default' : 'outline'}
                onClick={() => setUsersSubTab('list')}
              >
                Lista
              </Button>
              <Button
                size="sm"
                variant={usersSubTab === 'permissions' ? 'default' : 'outline'}
                onClick={() => setUsersSubTab('permissions')}
              >
                Permissões
              </Button>
            </div>

            {usersSubTab === 'list' ? (
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
            ) : (
              <PermissionsSubTab />
            )}
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
