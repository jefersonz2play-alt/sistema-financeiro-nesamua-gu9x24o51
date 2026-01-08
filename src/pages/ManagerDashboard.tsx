import { useMemo, useState } from 'react'
import { LayoutDashboard, Calendar as CalendarIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useDataStore from '@/stores/useDataStore'
import { InventoryInsights } from '@/components/dashboard/InventoryInsights'
import { EmployeePerformance } from '@/components/dashboard/EmployeePerformance'
import { ProductMargins } from '@/components/dashboard/ProductMargins'
import { FinancialOverview } from '@/components/dashboard/FinancialOverview'
import { PaymentAlert } from '@/components/dashboard/PaymentAlert'

export default function ManagerDashboard() {
  const { transactions, products, employees } = useDataStore()
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const dailyAverage = useMemo(() => {
    // Count days between start and end
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    )

    const filteredTransactions = transactions.filter(
      (t) => t.type === 'entry' && t.date >= startDate && t.date <= endDate,
    )
    const totalCount = filteredTransactions.length
    const avg = totalCount / days
    return avg.toFixed(1)
  }, [transactions, startDate, endDate])

  return (
    <div className="space-y-8 pb-10">
      <PaymentAlert />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Visão Geral
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe indicadores chave de performance do negócio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-2">
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
      </div>

      <FinancialOverview
        transactions={transactions}
        products={products}
        startDate={startDate}
        endDate={endDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to={`/reports/attendance?startDate=${startDate}&endDate=${endDate}`}
          className="block transition-transform hover:scale-105"
        >
          <Card className="shadow-subtle border-none md:col-span-1 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground h-full cursor-pointer hover:shadow-lg transition-shadow">
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
                Neste período selecionado.
              </p>
            </CardContent>
          </Card>
        </Link>

        <div className="md:col-span-3">
          <InventoryInsights
            products={products}
            transactions={transactions}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-6">
          <EmployeePerformance
            employees={employees}
            transactions={transactions}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
        <div className="space-y-6">
          <ProductMargins products={products} />
        </div>
      </div>
    </div>
  )
}
