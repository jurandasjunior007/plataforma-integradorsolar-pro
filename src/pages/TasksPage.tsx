import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Search, ListTodo, Calendar, AlertCircle, Clock,
  CheckCircle2, Loader2, Trash2, MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTasks, type TaskFilter } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const filters: { key: TaskFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'mine', label: 'Minhas tarefas', icon: <ListTodo className="h-3.5 w-3.5" /> },
  { key: 'today', label: 'Hoje', icon: <Calendar className="h-3.5 w-3.5" /> },
  { key: 'overdue', label: 'Vencidas', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  { key: 'week', label: 'Próximos 7 dias', icon: <Clock className="h-3.5 w-3.5" /> },
  { key: 'done', label: 'Concluídas', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { key: 'all', label: 'Todas', icon: <ListTodo className="h-3.5 w-3.5" /> },
];

const priorityLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Baixa', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'outline' },
  high: { label: 'Alta', variant: 'destructive' },
};

export default function TasksPage() {
  const { user } = useAuthContext();
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('mine');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const { tasks, isLoading, createTask, completeTask, deleteTask, updateTask } = useTasks(activeFilter);
  const { data: profiles = [] } = useProfiles();

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState('normal');

  const filteredTasks = searchTerm
    ? tasks.filter(t =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.deal?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : tasks;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate || !newAssignee) return;
    try {
      await createTask.mutateAsync({
        title: newTitle.trim(),
        description: newDesc || undefined,
        due_date: newDueDate,
        assigned_to: newAssignee,
        priority: newPriority,
      });
      toast({ title: 'Tarefa criada' });
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      setNewPriority('normal');
      setNewTaskOpen(false);
    } catch {
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' });
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask.mutateAsync(taskId);
      toast({ title: 'Tarefa concluída' });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast({ title: 'Tarefa excluída' });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Tarefas</h1>
          <Button size="sm" className="gap-1.5" onClick={() => { setNewAssignee(user?.id ?? ''); setNewTaskOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Nova tarefa
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.key}
              variant={activeFilter === f.key ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => setActiveFilter(f.key)}
            >
              {f.icon}
              {f.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por assunto, negócio ou cliente..."
            className="pl-8 text-sm h-9"
          />
        </div>

        {/* Task list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ListTodo className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {filteredTasks.map(task => {
              const overdue = isOverdue(task.due_date) && task.status !== 'completed';
              const prio = priorityLabels[task.priority] ?? priorityLabels.normal;
              const assignee = task.assigned_user;

              return (
                <Card key={task.id} className={task.status === 'completed' ? 'opacity-60' : ''}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => {
                          if (task.status !== 'completed') handleComplete(task.id);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </span>
                          <Badge variant={prio.variant} className="text-[10px] h-4 shrink-0">
                            {prio.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          {task.due_date && (
                            <span className={overdue ? 'text-destructive font-medium' : ''}>
                              {new Date(task.due_date).toLocaleDateString('pt-BR')}
                              {overdue && ' (vencida)'}
                            </span>
                          )}
                          {task.deal && <span>📋 {task.deal.title}</span>}
                          {task.contact && <span>👤 {task.contact.name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">
                              {assignee.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleComplete(task.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-2" />Concluir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                              <Trash2 className="h-3 w-3 mr-2" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={(o) => !o && setNewTaskOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Assunto *</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="O que precisa ser feito?" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descrição</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Detalhes opcionais" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Data/hora *</Label>
                <Input type="datetime-local" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prioridade</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
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
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewTaskOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? 'Criando...' : 'Criar tarefa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
