import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ProductionTable,
  SERVICE_PRICES,
} from '@/components/employees/ProductionTable'
import { FinancialSummary } from '@/components/employees/FinancialSummary'
import useAuthStore from '@/stores/useAuthStore'
import useDataStore from '@/stores/useDataStore'

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  const { employees } = useDataStore()

  const employeeData = useMemo(() => {
    return employees.find((emp) => emp.id === user?.id)
  }, [employees, user])

  if (!employeeData) {
    return <div className="p-8 text-center">Carregando dados...</div>
  }

  const totalReceivable = useMemo(() => {
    return SERVICE_PRICES.reduce((total, price) => {
      return total + price * (employeeData.quantities[price] || 0)
    }, 0)
  }, [employeeData.quantities])

  const lastUpdated = employeeData.lastUpdated
    ? new Date(employeeData.lastUpdated)
    : new Date()

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-white shadow-md">
            <AvatarImage
              src={`https://img.usecurling.com/ppl/medium?gender=female&seed=${employeeData.id}`}
            />
            <AvatarFallback>{employeeData.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá, {employeeData.name}!
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel financeiro.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-subtle border-none">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Funcionário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Chave PIX Cadastrada
                </p>
                <p className="font-mono text-sm">{employeeData.pix}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Email de Acesso
                </p>
                <p className="text-sm">{employeeData.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <FinancialSummary
            totalReceivable={totalReceivable}
            paidAmount={employeeData.paidAmount}
            onPaidAmountChange={() => {}}
            status={employeeData.status}
            onStatusChange={() => {}}
            lastUpdated={lastUpdated}
            readOnly={true}
          />

          <ProductionTable
            quantities={employeeData.quantities}
            onQuantityChange={() => {}}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  )
}
