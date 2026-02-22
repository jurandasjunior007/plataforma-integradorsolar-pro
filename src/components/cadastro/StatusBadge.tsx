import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'ativo';
  return (
    <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-muted text-muted-foreground'}>
      {isActive ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}
