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
import { TrendingDown, TrendingUp, Minus, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface EmployeePerformanceProps {
  employees: Employee[]
  transactions: Transaction[]
  timeRange?: string
}

export function EmployeePerformance({
  employees,
  transactions,
  timeRange = '30',
}: EmployeePerformanceProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const previousMonth = lastMonthDate.getMonth()
    const previousMonthYear = lastMonthDate.getFullYear()

    const employeeStats = employees.map((emp) => {
      // Calculate Current Month Count
      const currentMonthCount = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return (
          t.employeeId === emp.id &&
          t.type === 'entry' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        )
      }).length

      // Calculate Previous Month Count
      const prevMonthCount = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return (
          t.employeeId === emp.id &&
          t.type === 'entry' &&
          tDate.getMonth() === previousMonth &&
          tDate.getFullYear() === previousMonthYear
        )
      }).length

      // Calculate Growth
      let growth = 0
      if (prevMonthCount > 0) {
        growth = ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100
      } else if (currentMonthCount > 0) {
        growth = 100 // Assume 100% growth if started from 0
      }

      return {
        ...emp,
        currentMonthCount,
        prevMonthCount,
        growth,
      }
    })

    // Sort by current month performance
    return employeeStats.sort(
      (a, b) => b.currentMonthCount - a.currentMonthCount,
    )
  }, [employees, transactions])

  const maxCount = Math.max(...stats.map((s) => s.currentMonthCount), 1)

  return (
    <Card className="shadow-subtle border-none h-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">Desempenho da Equipe</CardTitle>
          <CardDescription>
            Atendimentos realizados no mês atual vs anterior.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link to={`/reports/employees?days=${timeRange}`}>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {emp.currentMonthCount} atendimentos
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-xs font-medium">
                  {emp.growth > 0 ? (
                    <span className="text-emerald-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />+
                      {emp.growth.toFixed(0)}%
                    </span>
                  ) : emp.growth < 0 ? (
                    <span className="text-rose-600 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {emp.growth.toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center">
                      <Minus className="w-3 h-3 mr-1" />
                      0%
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">vs mês ant.</p>
              </div>
            </div>
            <Progress
              value={(emp.currentMonthCount / maxCount) * 100}
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
