import { useState } from 'react';
import type { Deal } from '@/types/crm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageCircle, Phone, Mail, MapPin, Users, Headphones,
  Plus, ListTodo, FileText, Paperclip, ClipboardList, Send,
  ArrowRightLeft, PenLine, Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DealTimelinePanelProps {
  deal: Deal;
}

// Mock timeline data
const mockTimeline = [
  { id: '1', type: 'stage_change', user: 'João Vendedor', date: '2026-02-20T14:30:00Z', content: 'Moveu de Abordagem para Proposta' },
  { id: '2', type: 'call', user: 'João Vendedor', date: '2026-02-19T10:00:00Z', content: 'Ligação para apresentar proposta. Cliente demonstrou interesse.' },
  { id: '3', type: 'whatsapp', user: 'João Vendedor', date: '2026-02-18T16:30:00Z', content: 'Enviou fotos do telhado via WhatsApp' },
  { id: '4', type: 'note', user: 'João Vendedor', date: '2026-02-17T09:15:00Z', content: 'Cliente interessado em sistema on-grid 10kWp. Preferência por financiamento.' },
  { id: '5', type: 'create', user: 'João Vendedor', date: '2026-02-07T08:00:00Z', content: 'Negócio criado' },
];

const mockTasks = [
  { id: 't1', title: 'Enviar proposta comercial', due: '2026-02-25', status: 'pending' },
  { id: 't2', title: 'Follow-up por telefone', due: '2026-02-27', status: 'pending' },
];

const typeIcons: Record<string, React.ElementType> = {
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  note: PenLine,
  stage_change: ArrowRightLeft,
  create: Plus,
};

export function DealTimelinePanel({ deal }: DealTimelinePanelProps) {
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTimeline = filter === 'all'
    ? mockTimeline
    : filter === 'interactions'
      ? mockTimeline.filter((t) => ['call', 'whatsapp', 'email', 'note'].includes(t.type))
      : mockTimeline.filter((t) => ['stage_change', 'create'].includes(t.type));

  return (
    <Tabs defaultValue="timeline" className="space-y-4">
      <TabsList className="bg-muted/50 p-1">
        <TabsTrigger value="timeline" className="text-xs">Linha do tempo</TabsTrigger>
        <TabsTrigger value="proposals" className="text-xs">Propostas</TabsTrigger>
        <TabsTrigger value="sales" className="text-xs">Vendas</TabsTrigger>
        <TabsTrigger value="documents" className="text-xs">Documentos</TabsTrigger>
        <TabsTrigger value="attachments" className="text-xs">Anexos</TabsTrigger>
        <TabsTrigger value="forms" className="text-xs">Formulários</TabsTrigger>
      </TabsList>

      <TabsContent value="timeline" className="space-y-5 mt-0">
        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <MessageCircle className="h-3.5 w-3.5" /> Interação
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <ListTodo className="h-3.5 w-3.5" /> Tarefa
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Plus className="h-3.5 w-3.5" /> Negócio
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Mail className="h-3.5 w-3.5" /> E-mail
          </Button>

          <div className="h-5 w-px bg-border mx-1" />

          <Button variant="ghost" size="icon" className="h-8 w-8" title="Localização">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Telefone">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Email">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Equipe">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Suporte">
            <Headphones className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="WhatsApp">
            <MessageCircle className="h-3.5 w-3.5 text-success" />
          </Button>
        </div>

        {/* Note input */}
        <Card>
          <CardContent className="p-3 space-y-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Marque um usuário com @"
              rows={3}
              className="resize-none border-0 p-0 focus-visible:ring-0 text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" className="gap-1.5 h-8">
                <Send className="h-3.5 w-3.5" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Open tasks */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Tarefas em aberto
          </h4>
          {mockTasks.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhuma tarefa pendente 🎉</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {mockTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="py-2.5 px-4 flex items-center justify-between">
                    <span className="text-sm">{task.title}</span>
                    <Badge variant="secondary" className="text-xs">{task.due}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Full history */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Histórico completo</h4>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-7 w-[180px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as atividades</SelectItem>
                <SelectItem value="interactions">Interações</SelectItem>
                <SelectItem value="changes">Modificações</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-0 relative">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />

            {filteredTimeline.map((entry) => {
              const Icon = typeIcons[entry.type] ?? PenLine;
              const isImportant = entry.type === 'stage_change';

              return (
                <div key={entry.id} className="flex gap-4 py-3 relative">
                  <div className={`z-10 flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${isImportant ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-4 w-4 ${isImportant ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                          {entry.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{entry.user}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className={`text-sm ${isImportant ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                      {entry.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="proposals">
        <PlaceholderTab icon={FileText} title="Propostas" message="Nenhuma proposta gerada para este negócio." />
      </TabsContent>
      <TabsContent value="sales">
        <PlaceholderTab icon={ClipboardList} title="Vendas" message="Nenhuma venda registrada." />
      </TabsContent>
      <TabsContent value="documents">
        <PlaceholderTab icon={FileText} title="Documentos" message="Nenhum documento vinculado." />
      </TabsContent>
      <TabsContent value="attachments">
        <PlaceholderTab icon={Paperclip} title="Anexos" message="Nenhum anexo adicionado." />
      </TabsContent>
      <TabsContent value="forms">
        <PlaceholderTab icon={ClipboardList} title="Formulários externos" message="Nenhum formulário externo vinculado." />
      </TabsContent>
    </Tabs>
  );
}

function PlaceholderTab({ icon: Icon, title, message }: { icon: React.ElementType; title: string; message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-2">
        <Icon className="h-8 w-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
