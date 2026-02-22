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
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Resumo', url: '/', icon: LayoutDashboard },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Negócios', url: '/negocios', icon: Kanban },
  { title: 'Documentos', url: '/documentos', icon: FileText },
  { title: 'Produtos', url: '/produtos', icon: Package },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { title: 'Administração', url: '/admin', icon: Settings },
];

export function AppSidebar() {
  const { signOut, profile } = useAuthContext();

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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
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
            <SidebarMenuButton
              onClick={() => signOut()}
              tooltip="Sair"
              className="hover:bg-sidebar-accent/50 text-sidebar-foreground/60"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
