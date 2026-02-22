import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  ChevronDown,
  Building2,
  MapPin,
  Upload,
  Copy,
  ListTodo,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLocation } from 'react-router-dom';

const cadastroItems = [
  { title: 'Pessoas', url: '/cadastro/pessoas', icon: Users },
  { title: 'Empresas', url: '/cadastro/empresas', icon: Building2 },
  { title: 'Endereços', url: '/cadastro/enderecos', icon: MapPin },
  { title: 'Importação', url: '/cadastro/importacao', icon: Upload },
  { title: 'Duplicidades', url: '/cadastro/duplicidades', icon: Copy },
];

const navItems = [
  { title: 'Resumo', url: '/', icon: LayoutDashboard },
  { title: 'Negócios', url: '/negocios', icon: Kanban },
  { title: 'Tarefas', url: '/tarefas', icon: ListTodo },
  { title: 'Documentos', url: '/documentos', icon: FileText },
  { title: 'Produtos', url: '/produtos', icon: Package },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { title: 'Administração', url: '/admin', icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuthContext();
  const location = useLocation();
  const isCadastroActive = location.pathname.startsWith('/cadastro');
  const [cadastroOpen, setCadastroOpen] = useState(isCadastroActive);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2">
          <Sun className="h-7 w-7 text-sidebar-primary shrink-0" />
          <span className="font-bold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            IntegradorOS
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Resumo */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Resumo">
                  <NavLink to="/" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Resumo</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Cadastro collapsible */}
              <Collapsible open={cadastroOpen} onOpenChange={setCadastroOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Cadastro" className={`hover:bg-sidebar-accent/50 ${isCadastroActive ? 'bg-sidebar-accent text-sidebar-primary font-semibold' : ''}`}>
                      <Users className="h-4 w-4 shrink-0" />
                      <span>Cadastro</span>
                      <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {cadastroItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink to={item.url} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                              <item.icon className="h-3.5 w-3.5 shrink-0" />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Other nav items */}
              {navItems.slice(1).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === '/'} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Sair" className="hover:bg-sidebar-accent/50 text-sidebar-foreground/60">
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
