import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Employee, Transaction } from '@/types'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface EmployeePerformanceProps {
  employees: Employee[]
  transactions: Transaction[]
  startDate: string
  endDate: string
}

export function EmployeePerformance({
  employees,
  transactions,
  startDate,
  endDate,
}: EmployeePerformanceProps) {
  const stats = useMemo(() => {
    const employeeStats = employees.map((emp) => {
      // Filter transactions for this employee in the period
      const empTransactions = transactions.filter((t) => {
        return (
          t.employeeId === emp.id &&
          t.type === 'entry' &&
          t.date >= startDate &&
          t.date <= endDate
        )
      })

      const count = empTransactions.length
      const totalRevenue = empTransactions.reduce((sum, t) => sum + t.amount, 0)
      const avgTicket = count > 0 ? totalRevenue / count : 0

      return {
        ...emp,
        count,
        totalRevenue,
        avgTicket,
      }
    })

    // Sort by Total Revenue
    return employeeStats.sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [employees, transactions, startDate, endDate])

  const maxRevenue = Math.max(...stats.map((s) => s.totalRevenue), 1)

  return (
    <Card className="shadow-subtle border-none h-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">Desempenho da Equipe</CardTitle>
          <CardDescription>Resultados no período selecionado.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link
            to={`/reports/employees?startDate=${startDate}&endDate=${endDate}`}
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((emp) => (
          <div key={emp.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${emp.id}`}
                  />
                  <AvatarFallback>{emp.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{emp.name}</p>
                  <div className="flex gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {emp.count} atendimentos
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      Ticket Médio: {formatCurrency(emp.avgTicket)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm font-bold text-foreground">
                  {formatCurrency(emp.totalRevenue)}
                </div>
              </div>
            </div>
            <Progress
              value={(emp.totalRevenue / maxRevenue) * 100}
              className="h-2"
            />
          </div>
        ))}
        {stats.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">
            Nenhum dado de funcionário disponível.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
