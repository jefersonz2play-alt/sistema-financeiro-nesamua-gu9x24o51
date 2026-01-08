import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductionTable } from '@/components/employees/ProductionTable'
import { FinancialSummary } from '@/components/employees/FinancialSummary'
import { EmployeeHistoryTable } from '@/components/employees/EmployeeHistoryTable'
import useAuthStore from '@/stores/useAuthStore'
import useDataStore from '@/stores/useDataStore'

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  const { employees, services, transactions, customers } = useDataStore()

  const employeeData = useMemo(() => {
    return employees.find((emp) => emp.id === user?.id)
  }, [employees, user])

  const quantities = useMemo(() => {
    return employeeData?.quantities || {}
  }, [employeeData])

  const totalReceivable = useMemo(() => {
    return services.reduce((total, service) => {
      return total + service.payout * (quantities[service.id] || 0)
    }, 0)
  }, [quantities, services])

  const employeeTransactions = useMemo(() => {
    if (!user?.id) return []
    return transactions.filter((t) => {
      // Relevant types: entry (service) or exit (bonus)
      // Exclude generic exits unless it's a bonus
      if (t.type === 'exit' && t.itemType !== 'bonus') return false

      if (t.splits && t.splits.length > 0) {
        return t.splits.some((s) => s.employeeId === user.id)
      }
      return t.employeeId === user.id
    })
  }, [transactions, user?.id])

  const getCustomerName = (id?: string) => {
    if (!id) return '-'
    return customers.find((c) => c.id === id)?.name || 'Cliente Removido'
  }

  if (!employeeData) {
    return <div className="p-8 text-center">Carregando dados...</div>
  }

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
            services={services}
            quantities={employeeData.quantities}
            onQuantityChange={() => {}}
            readOnly={true}
          />

          <EmployeeHistoryTable
            transactions={employeeTransactions}
            employeeId={employeeData.id}
            getCustomerName={getCustomerName}
          />
        </div>
      </div>
    </div>
  )
}
