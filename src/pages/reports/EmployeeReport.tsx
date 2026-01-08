import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Download } from 'lucide-react'
import useDataStore from '@/stores/useDataStore'
import { formatCurrency } from '@/lib/utils'

export default function EmployeeReport() {
  const { employees, transactions } = useDataStore()
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const reportData = useMemo(() => {
    return employees
      .map((emp) => {
        const empTransactions = transactions.filter((t) => {
          const inRange = t.date >= startDate && t.date <= endDate
          const isRelevantType =
            t.type === 'entry' || (t.type === 'exit' && t.itemType === 'bonus')

          if (!inRange || !isRelevantType) return false

          if (t.splits && t.splits.length > 0) {
            return t.splits.some((s) => s.employeeId === emp.id)
          }
          return t.employeeId === emp.id
        })

        const totalEarnings = empTransactions.reduce((sum, t) => {
          let amount = 0
          if (t.splits && t.splits.length > 0) {
            const split = t.splits.find((s) => s.employeeId === emp.id)
            if (split) amount = split.amount
          } else {
            amount = t.employeePayment || 0
          }
          return sum + amount
        }, 0)

        return {
          id: emp.id,
          name: emp.name,
          count: empTransactions.length,
          totalEarnings,
          avgTicket:
            empTransactions.length > 0
              ? totalEarnings / empTransactions.length
              : 0,
        }
      })
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
  }, [employees, transactions, startDate, endDate])

  const totalPeriodEarnings = reportData.reduce(
    (acc, curr) => acc + curr.totalEarnings,
    0,
  )

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Relatório de Funcionários
          </h1>
          <p className="text-muted-foreground mt-1">
            Detalhamento de ganhos e comissões por período.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 w-auto border-none bg-transparent shadow-none focus-visible:ring-0"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 w-auto border-none bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-subtle border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Total de Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPeriodEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No período selecionado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle>Desempenho Individual</CardTitle>
          <CardDescription>
            Lista de funcionários e seus ganhos baseados nas movimentações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead className="text-center">Atendimentos</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-right">Total Ganho</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum registro encontrado neste período.
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.count}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.avgTicket)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                      {formatCurrency(item.totalEarnings)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
