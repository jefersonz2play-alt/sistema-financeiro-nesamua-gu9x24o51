import { useMemo, useState } from 'react'
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  TrendingUp,
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useDataStore from '@/stores/useDataStore'
import { InventoryInsights } from '@/components/dashboard/InventoryInsights'
import { EmployeePerformance } from '@/components/dashboard/EmployeePerformance'
import { ProductMargins } from '@/components/dashboard/ProductMargins'
import { cn } from '@/lib/utils'

export default function ManagerDashboard() {
  const { transactions, products, employees } = useDataStore()
  const [timeRange, setTimeRange] = useState('30')

  // Calculate Daily Averages
  const dailyAverage = useMemo(() => {
    const days = parseInt(timeRange)
    const cutoffDate = subDays(new Date(), days)

    const filteredTransactions = transactions.filter(
      (t) => t.type === 'entry' && new Date(t.date) >= cutoffDate,
    )

    const totalCount = filteredTransactions.length
    // Prevent division by zero if range is 0 (unlikely)
    const avg = days > 0 ? totalCount / days : 0

    return avg.toFixed(1)
  }, [transactions, timeRange])

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Visão Geral
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe indicadores chave de performance do negócio.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-border shadow-sm">
          <CalendarIcon className="w-4 h-4 text-muted-foreground ml-2" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] border-none shadow-none h-8 focus:ring-0">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to={`/reports/attendance?days=${timeRange}`}
          className="block transition-transform hover:scale-105"
        >
          <Card className="shadow-subtle border-none md:col-span-1 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground h-full cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-90">
                Média Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{dailyAverage}</span>
                <span className="text-sm opacity-80">atendimentos/dia</span>
              </div>
              <p className="text-xs mt-2 opacity-70">
                Baseado nos últimos {timeRange} dias. Clique para detalhes.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Inventory Summary */}
        <div className="md:col-span-3">
          <InventoryInsights
            products={products}
            transactions={transactions}
            timeRange={timeRange}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Column: Employee Performance */}
        <div className="space-y-6">
          <EmployeePerformance
            employees={employees}
            transactions={transactions}
            timeRange={timeRange}
          />
        </div>

        {/* Right Column: Product Margins */}
        <div className="space-y-6">
          <ProductMargins products={products} />
        </div>
      </div>
    </div>
  )
}
