import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, CheckCircle2, Wallet, CalendarRange } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FinancialSummary } from '@/components/employees/FinancialSummary'
import { EmployeeHistoryTable } from '@/components/employees/EmployeeHistoryTable'
import { PaymentAlert } from '@/components/dashboard/PaymentAlert'
import useDataStore from '@/stores/useDataStore'
import { formatCurrency } from '@/lib/utils'

export default function EmployeePayments() {
  const { employees, transactions, customers, updateEmployee, payEmployee } =
    useDataStore()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const { toast } = useToast()

  // Ensure an employee is selected
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [employees, selectedEmployeeId])

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId],
  )

  // Filter transactions for the selected employee
  const employeeTransactions = useMemo(() => {
    if (!selectedEmployeeId) return []
    return transactions.filter((t) => {
      // Relevant types: entry (service) or exit (bonus)
      if (t.type === 'exit' && t.itemType !== 'bonus') return false

      if (t.splits && t.splits.length > 0) {
        return t.splits.some((s) => s.employeeId === selectedEmployeeId)
      }
      return t.employeeId === selectedEmployeeId
    })
  }, [transactions, selectedEmployeeId])

  // Current Cycle Logic
  const { currentPeriodLabel, periodTotal, pendingTotal, pendingTransactions } =
    useMemo(() => {
      const today = new Date()
      const day = today.getDate()
      const isFirstCycle = day <= 15

      const periodLabel = isFirstCycle
        ? `1 a 15 de ${today.toLocaleString('default', { month: 'long' })}`
        : `16 a ${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()} de ${today.toLocaleString('default', { month: 'long' })}`

      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        isFirstCycle ? 1 : 16,
      )
        .toISOString()
        .split('T')[0]
      const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        isFirstCycle ? 15 : 31,
      )
        .toISOString()
        .split('T')[0]

      let periodSum = 0
      let pendingSum = 0
      const pendingTx: string[] = []

      employeeTransactions.forEach((t) => {
        let amount = 0
        let isPaid = false

        if (t.splits && t.splits.length > 0) {
          const split = t.splits.find(
            (s) => s.employeeId === selectedEmployeeId,
          )
          if (split) {
            amount = split.amount
            isPaid = !!split.isPaid
          }
        } else {
          amount = t.employeePayment || 0
          isPaid = !!t.isPaid
        }

        // Period Total (Consolidated Period Totals)
        if (t.date >= startDate && t.date <= endDate) {
          periodSum += amount
        }

        // Pending Total (All time pending)
        if (!isPaid) {
          pendingSum += amount
          pendingTx.push(t.id)
        }
      })

      return {
        currentPeriodLabel: periodLabel,
        periodTotal: periodSum,
        pendingTotal: pendingSum,
        pendingTransactions: pendingTx,
      }
    }, [employeeTransactions, selectedEmployeeId])

  const handleConfirmPayment = () => {
    if (!selectedEmployeeId) return
    if (pendingTotal <= 0) {
      toast({
        title: 'Nada a pagar',
        description: 'Não há saldo pendente para este funcionário.',
        variant: 'destructive',
      })
      return
    }

    payEmployee(selectedEmployeeId, pendingTotal, pendingTransactions)

    toast({
      title: 'Pagamento Realizado',
      description: `O pagamento de ${formatCurrency(pendingTotal)} foi registrado e as transações marcadas como pagas.`,
    })
  }

  const copyPix = () => {
    if (selectedEmployee) {
      navigator.clipboard.writeText(selectedEmployee.pix)
      toast({
        title: 'Copiado!',
        description: 'Chave PIX copiada para a área de transferência.',
      })
    }
  }

  const getCustomerName = (id?: string) => {
    if (!id) return '-'
    return customers.find((c) => c.id === id)?.name || 'Cliente Removido'
  }

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum funcionário cadastrado.
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <PaymentAlert />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl shadow-subtle border border-border/50">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Selecione o Funcionário
          </label>
          <Select
            value={selectedEmployeeId}
            onValueChange={setSelectedEmployeeId}
          >
            <SelectTrigger className="w-full h-11 bg-secondary/30">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleConfirmPayment}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-md"
            disabled={pendingTotal <= 0}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Pagar Pendentes ({formatCurrency(pendingTotal)})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          {selectedEmployee && (
            <Card className="shadow-subtle border-none bg-card">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-secondary shadow-md">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/medium?gender=female&seed=${selectedEmployee.id}`}
                  />
                  <AvatarFallback>
                    {selectedEmployee.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {selectedEmployee.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Profissional</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Chave PIX
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-foreground truncate mr-2">
                      {selectedEmployee.pix}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={copyPix}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-subtle border-none bg-primary/5 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-primary" />
                Total do Ciclo Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(periodTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentPeriodLabel}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-subtle border-none bg-amber-500/5 border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                Saldo Pendente Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(pendingTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado (todos os ciclos)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* Legacy Financial Summary - kept for read-only view of aggregate data if needed, but primary focus is history */}
          <FinancialSummary
            totalReceivable={pendingTotal + selectedEmployee!.paidAmount} // Approx logic
            paidAmount={selectedEmployee!.paidAmount}
            onPaidAmountChange={() => {}}
            status={selectedEmployee?.status || 'open'}
            onStatusChange={() => {}}
            lastUpdated={
              selectedEmployee?.lastUpdated
                ? new Date(selectedEmployee.lastUpdated)
                : new Date()
            }
            readOnly={true}
          />

          <EmployeeHistoryTable
            transactions={employeeTransactions}
            employeeId={selectedEmployeeId}
            getCustomerName={getCustomerName}
          />
        </div>
      </div>
    </div>
  )
}
