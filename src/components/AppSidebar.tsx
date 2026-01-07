import {
  ArrowLeftRight,
  CreditCard,
  Users,
  LayoutDashboard,
  Package,
  Scissors,
  UserCheck,
  CalendarClock,
  PieChart,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLocation, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import useAuthStore from '@/stores/useAuthStore'

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const { user } = useAuthStore()
  const isCollapsed = state === 'collapsed'

  const managerItems = [
    {
      title: 'Dashboard',
      url: '/admin-dashboard',
      icon: PieChart,
    },
    {
      title: 'Fluxo de Caixa',
      url: '/',
      icon: ArrowLeftRight,
    },
    {
      title: 'Agendamentos',
      url: '/appointments',
      icon: CalendarClock,
    },
    {
      title: 'Pagamentos',
      url: '/payments',
      icon: CreditCard,
    },
    {
      title: 'Serviços',
      url: '/services',
      icon: Scissors,
    },
    {
      title: 'Clientes',
      url: '/customers',
      icon: Users,
    },
    {
      title: 'Produtos',
      url: '/products',
      icon: Package,
    },
    {
      title: 'Funcionários',
      url: '/employees/new',
      icon: UserCheck,
    },
  ]

  const employeeItems = [
    {
      title: 'Meu Painel',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
  ]

  const items = user?.role === 'manager' ? managerItems : employeeItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-24 flex items-center justify-center border-b border-sidebar-border bg-sidebar-background/50">
        <div className="flex items-center gap-3 w-full px-2 overflow-hidden">
          {/* Studio Nesamua Logo */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden bg-white/5">
            <img
              src="https://img.usecurling.com/i?q=braids&color=rose"
              alt="NesaMua Logo"
              className="w-8 h-8 object-cover opacity-90"
            />
          </div>
          <div
            className={cn(
              'flex flex-col transition-all duration-300',
              isCollapsed
                ? 'w-0 opacity-0 translate-x-4'
                : 'w-auto opacity-100 translate-x-0',
            )}
          >
            <span className="font-display font-bold text-xl text-primary leading-none tracking-tight">
              Nesamua
            </span>
            <span className="text-xs text-sidebar-foreground/60 tracking-wider uppercase mt-1">
              Tranças Afro
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 mt-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    size="lg"
                    className="text-sidebar-foreground/80 hover:text-primary hover:bg-sidebar-accent data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-all duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'w-5 h-5',
                          location.pathname === item.url &&
                            'text-primary-foreground',
                        )}
                      />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
