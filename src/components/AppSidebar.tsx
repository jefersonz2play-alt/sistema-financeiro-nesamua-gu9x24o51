import {
  ArrowLeftRight,
  CreditCard,
  PieChart,
  Users,
  LayoutDashboard,
  Package,
  Scissors,
  UserCheck,
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
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary w-full px-2">
          <PieChart className="w-8 h-8 flex-shrink-0" />
          <span
            className={cn(
              'transition-all duration-200 overflow-hidden whitespace-nowrap',
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
          >
            Finanças
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    size="lg"
                    className="data-[active=true]:font-bold data-[active=true]:text-primary hover:text-primary transition-colors"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'w-5 h-5',
                          location.pathname === item.url && 'text-primary',
                        )}
                      />
                      <span>{item.title}</span>
                      {location.pathname === item.url && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                      )}
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
