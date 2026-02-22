import { useState } from 'react';
import type { Deal } from '@/types/crm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MessageCircle, Phone, Mail, MapPin, Users, Headphones,
  Plus, ListTodo, FileText, Paperclip, ClipboardList, Send,
  ArrowRightLeft, PenLine, Clock, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useInteractions } from '@/hooks/useInteractions';
import { useTasks } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DealTimelinePanelProps {
  deal: Deal;
  dealId?: string;
  contactId?: string;
  onNewDeal?: () => void;
}

const typeIcons: Record<string, React.ElementType> = {
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  note: PenLine,
  meeting: Users,
  stage_change: ArrowRightLeft,
  create: Plus,
  task: ListTodo,
};

const typeLabels: Record<string, string> = {
  call: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  note: 'Nota',
  meeting: 'Reunião',
};

export function DealTimelinePanel({ deal, dealId, contactId, onNewDeal }: DealTimelinePanelProps) {
  const effectiveDealId = dealId ?? deal.id;
  const { user } = useAuthContext();
  const { interactions, isLoading: loadingInteractions, createInteraction } = useInteractions(effectiveDealId);
  const { tasks, isLoading: loadingTasks, createTask, completeTask } = useTasks(undefined, effectiveDealId);
  const { data: profiles = [] } = useProfiles();

  const [note, setNote] = useState('');
  const [interactionType, setInteractionType] = useState<'note' | 'call' | 'whatsapp' | 'email' | 'meeting'>('note');
  const [filter, setFilter] = useState('all');

  // Task dialog
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');

  // Interaction dialog
  const [interactionOpen, setInteractionOpen] = useState(false);

  const openTasks = tasks.filter(t => t.status !== 'completed');

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    try {
      await createInteraction.mutateAsync({
        deal_id: effectiveDealId,
        type: interactionType,
        content: note.trim(),
        contact_id: contactId,
      });
      setNote('');
      toast({ title: 'Interação registrada' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDue || !taskAssignee) return;
    try {
      await createTask.mutateAsync({
        title: taskTitle.trim(),
        description: taskDesc || undefined,
        due_date: taskDue,
        assigned_to: taskAssignee,
        deal_id: effectiveDealId,
        contact_id: contactId,
        priority: taskPriority,
      });
      toast({ title: 'Tarefa criada' });
      setTaskTitle('');
      setTaskDesc('');
      setTaskDue('');
      setTaskPriority('normal');
      setTaskOpen(false);
    } catch {
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' });
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

  // Build timeline: interactions + system events
  const timeline = interactions.map(i => ({
    id: i.id,
    type: i.type as string,
    user: i.user?.full_name ?? 'Sistema',
    date: i.created_at,
    content: i.content ?? '',
  }));

  const filteredTimeline = filter === 'all'
    ? timeline
    : filter === 'interactions'
      ? timeline.filter((t) => ['call', 'whatsapp', 'email', 'note', 'meeting'].includes(t.type as string))
      : timeline.filter((t) => ['stage_change', 'create'].includes(t.type as string));

  return (
    <Tabs defaultValue="timeline" className="space-y-4">
      <TabsList className="bg-muted/50 p-1">
        <TabsTrigger value="timeline" className="text-xs">Linha do tempo</TabsTrigger>
        <TabsTrigger value="proposals" className="text-xs">Propostas</TabsTrigger>
        <TabsTrigger value="documents" className="text-xs">Documentos</TabsTrigger>
        <TabsTrigger value="attachments" className="text-xs">Anexos</TabsTrigger>
      </TabsList>

      <TabsContent value="timeline" className="space-y-5 mt-0">
        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => { setInteractionType('note'); setInteractionOpen(true); }}>
            <MessageCircle className="h-3.5 w-3.5" /> Interação
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => { setTaskAssignee(user?.id ?? ''); setTaskOpen(true); }}>
            <ListTodo className="h-3.5 w-3.5" /> Tarefa
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={onNewDeal}>
            <Plus className="h-3.5 w-3.5" /> Negócio
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => { setInteractionType('email'); setInteractionOpen(true); }}>
            <Mail className="h-3.5 w-3.5" /> E-mail
          </Button>
        </div>

        {/* Quick note input */}
        <Card>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Select value={interactionType} onValueChange={(v) => setInteractionType(v as any)}>
                <SelectTrigger className="h-7 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Nota</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Registrar interação..."
              rows={3}
              className="resize-none border-0 p-0 focus-visible:ring-0 text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" className="gap-1.5 h-8" onClick={handleSaveNote} disabled={!note.trim() || createInteraction.isPending}>
                <Send className="h-3.5 w-3.5" />
                {createInteraction.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Open tasks */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Tarefas em aberto ({openTasks.length})
          </h4>
          {loadingTasks ? (
            <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : openTasks.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhuma tarefa pendente 🎉</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {openTasks.map((task) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());
                return (
                  <Card key={task.id}>
                    <CardContent className="py-2.5 px-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleCompleteTask(task.id)}
                        />
                        <span className="text-sm truncate">{task.title}</span>
                      </div>
                      <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-xs shrink-0">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : ''}
                        {isOverdue && ' (vencida)'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
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

          {loadingInteractions ? (
            <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : filteredTimeline.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhuma interação registrada</CardContent></Card>
          ) : (
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
                            {entry.user.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{entry.user}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{typeLabels[entry.type] ?? entry.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="proposals">
        <PlaceholderTab icon={FileText} title="Propostas" message="Nenhuma proposta gerada para este negócio." />
      </TabsContent>
      <TabsContent value="documents">
        <PlaceholderTab icon={FileText} title="Documentos" message="Nenhum documento vinculado." />
      </TabsContent>
      <TabsContent value="attachments">
        <PlaceholderTab icon={Paperclip} title="Anexos" message="Nenhum anexo adicionado." />
      </TabsContent>

      {/* Task Dialog */}
      <Dialog open={taskOpen} onOpenChange={(o) => !o && setTaskOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Assunto *</Label>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="O que precisa ser feito?" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descrição</Label>
              <Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Data/hora *</Label>
                <Input type="datetime-local" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prioridade</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Responsável *</Label>
              <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTaskOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? 'Criando...' : 'Criar tarefa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
