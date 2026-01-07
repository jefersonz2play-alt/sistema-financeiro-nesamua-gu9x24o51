import { Outlet, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export default function Layout() {
  const location = useLocation()

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Registro de Caixa'
      case '/payments':
        return 'Pagamento de Funcionários'
      default:
        return 'Sistema Financeiro'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-6 z-10 transition-all">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">
              {getPageTitle(location.pathname)}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">
                    Administrador
                  </p>
                  <p className="text-xs text-muted-foreground">Gerente</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-background shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src="https://img.usecurling.com/ppl/thumbnail?gender=male"
                    alt="Admin"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background/50">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
