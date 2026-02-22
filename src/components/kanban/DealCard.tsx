import type { Deal } from '@/types/crm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, MessageCircle, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const ownerInitials = deal.owner?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-deal-card hover:bg-deal-card-hover border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm group"
    >
      <div className="flex items-start justify-between mb-1.5">
        <h4 className="font-medium text-sm leading-tight truncate flex-1 mr-2">{deal.title}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      {deal.contact && (
        <p className="text-xs text-muted-foreground truncate mb-2">{deal.contact.name}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          {(deal.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2 border-t">
        <div className="flex items-center gap-1">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">
              {ownerInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()}>
              <Phone className="h-3 w-3 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="h-3 w-3 text-success" />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()}>
              <Mail className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <Badge
          variant={daysSinceCreation > 30 ? 'destructive' : 'secondary'}
          className="text-[10px] px-1.5 h-5"
        >
          {daysSinceCreation}d
        </Badge>
      </div>
    </div>
  );
}
