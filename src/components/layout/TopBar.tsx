import { Search, Bell, MessageSquare, Mail, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onNewDeal?: () => void;
  pipelineSelector?: React.ReactNode;
}

export function TopBar({ onNewDeal, pipelineSelector }: TopBarProps) {
  const { profile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <header className="h-14 border-b bg-card flex items-center gap-3 px-4 shrink-0">
      <SidebarTrigger className="mr-1" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Busque em qualquer lugar"
          className="pl-9 h-9 bg-secondary border-none"
        />
      </div>

      {/* Pipeline selector */}
      {pipelineSelector}

      <div className="ml-auto flex items-center gap-1">
        {/* Action icons */}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
          <Mail className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground">
            3
          </Badge>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
        </Button>

        {/* New deal button */}
        {onNewDeal && (
          <Button onClick={onNewDeal} size="sm" className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground gap-1">
            <Plus className="h-4 w-4" />
            Novo negócio
          </Button>
        )}

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-2 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden lg:inline">{profile?.full_name}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut()}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
