import type { Deal } from '@/types/crm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Phone, MessageCircle, Mail, Plus, FileText, Paperclip,
  CheckSquare, ListTodo, Clock, DollarSign, User, Building,
} from 'lucide-react';

interface DealDrawerProps {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
}

export function DealDrawer({ deal, open, onClose }: DealDrawerProps) {
  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">{deal.title}</SheetTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <DollarSign className="h-3 w-3" />
              {(deal.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Badge>
            {deal.contact && (
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {deal.contact.name}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap pb-4">
          <Button variant="outline" size="sm" className="gap-1">
            <MessageCircle className="h-3.5 w-3.5 text-success" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Phone className="h-3.5 w-3.5" />
            Ligar
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Mail className="h-3.5 w-3.5" />
            E-mail
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <ListTodo className="h-3.5 w-3.5" />
            Tarefa
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            Proposta
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            Contrato
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            Anexar
          </Button>
        </div>

        <Separator />

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="interactions">Interações</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cliente</label>
                <p className="text-sm font-medium">{deal.contact?.name || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                <p className="text-sm font-medium">{deal.owner?.full_name || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Valor</label>
                <p className="text-sm font-medium">
                  {(deal.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Criado em</label>
                <p className="text-sm font-medium">{new Date(deal.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Custom fields placeholder */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-semibold">Campos personalizados</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Tipo de sistema</label>
                  <Input defaultValue="On-Grid" className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Potência (kWp)</label>
                  <Input defaultValue="10.5" className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Forma de pagamento</label>
                  <Input defaultValue="Financiado" className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tipo de telhado</label>
                  <Input defaultValue="Fibrocimento" className="h-8 text-sm mt-1" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist da etapa
            </h4>
            {[
              { label: 'Visita técnica realizada', required: true, checked: true },
              { label: 'Fotos do local enviadas', required: true, checked: false },
              { label: 'Conta de energia analisada', required: true, checked: true },
              { label: 'Projeto dimensionado', required: false, checked: false },
              { label: 'Proposta enviada ao cliente', required: false, checked: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <Checkbox defaultChecked={item.checked} />
                <span className="text-sm flex-1">{item.label}</span>
                {item.required && (
                  <Badge variant="destructive" className="text-[10px] h-4">Obrigatório</Badge>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Tarefas
              </h4>
              <Button size="sm" variant="outline" className="gap-1 h-7">
                <Plus className="h-3 w-3" />
                Nova
              </Button>
            </div>
            {[
              { title: 'Enviar proposta', due: '25/02/2026', status: 'pending' },
              { title: 'Follow-up telefone', due: '27/02/2026', status: 'pending' },
              { title: 'Visita técnica', due: '20/02/2026', status: 'completed' },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked={task.status === 'completed'} />
                  <span className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">{task.due}</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="interactions" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Interações</h4>
              <Button size="sm" variant="outline" className="gap-1 h-7">
                <Plus className="h-3 w-3" />
                Nova
              </Button>
            </div>
            <Textarea placeholder="Adicionar nota..." className="text-sm" rows={3} />
            <div className="space-y-3 pt-2">
              {[
                { type: 'call', text: 'Ligação para apresentar proposta', time: '20/02/2026 14:30' },
                { type: 'whatsapp', text: 'Enviou fotos do telhado via WhatsApp', time: '18/02/2026 10:15' },
                { type: 'note', text: 'Cliente interessado, pediu proposta formal', time: '17/02/2026 16:00' },
              ].map((int, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    {int.type === 'call' && <Phone className="h-3 w-3" />}
                    {int.type === 'whatsapp' && <MessageCircle className="h-3 w-3 text-success" />}
                    {int.type === 'note' && <FileText className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-sm">{int.text}</p>
                    <p className="text-xs text-muted-foreground">{int.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Documentos</h4>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="gap-1 h-7">
                  <FileText className="h-3 w-3" />
                  Proposta
                </Button>
                <Button size="sm" variant="outline" className="gap-1 h-7">
                  <FileText className="h-3 w-3" />
                  Contrato
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhum documento gerado ainda.
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
