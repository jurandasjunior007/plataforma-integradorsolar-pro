import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Clock, Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  soft_delete: Trash2,
  restore: RotateCcw,
};

const actionLabels: Record<string, string> = {
  create: 'Criação',
  update: 'Edição',
  soft_delete: 'Exclusão',
  restore: 'Restauração',
};

interface AuditTimelineProps {
  entityType: string;
  entityId: string;
}

export function AuditTimeline({ entityType, entityId }: AuditTimelineProps) {
  const { data: logs, isLoading } = useAuditLogs(entityType, entityId);

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Carregando histórico...</div>;
  if (!logs?.length) return <div className="text-sm text-muted-foreground p-4">Nenhum registro de auditoria.</div>;

  return (
    <div className="space-y-4 p-2">
      {logs.map((log) => {
        const Icon = actionIcons[log.action] ?? Clock;
        return (
          <div key={log.id} className="flex gap-3 items-start">
            <div className="mt-1 rounded-full bg-muted p-1.5">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{actionLabels[log.action] ?? log.action}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
