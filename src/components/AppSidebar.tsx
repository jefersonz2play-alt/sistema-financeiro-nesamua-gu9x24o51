import {
  ArrowLeftRight,
  CreditCard,
  Users,
  LayoutDashboard,
  Package,
  Scissors,
  UserCheck,
  CalendarClock,
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
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-white/10">
        <div className="flex items-center gap-3 w-full px-2 overflow-hidden">
          {/* Logo Placeholder - NesaMua Style */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              src="https://img.usecurling.com/i?q=braids&color=rose"
              alt="NesaMua Logo"
              className="w-8 h-8 object-cover"
            />
          </div>
          <div
            className={cn(
              'flex flex-col transition-all duration-200',
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
          >
            <span className="font-bold text-lg text-white leading-tight whitespace-nowrap">
              Studio NesaMua
            </span>
            <span className="text-xs text-white/70 whitespace-nowrap">
              Sistema Financeiro
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50">
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
                    className="text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-all"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'w-5 h-5',
                          // location.pathname === item.url && 'text-white',
                        )}
                      />
                      <span>{item.title}</span>
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
