import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { Target, TrendingUp, Wallet } from 'lucide-react'
import { Transaction, Product } from '@/types'
import useDataStore from '@/stores/useDataStore'

interface FinancialOverviewProps {
  transactions: Transaction[]
  products: Product[]
  startDate: string
  endDate: string
}

export function FinancialOverview({
  transactions,
  products,
  startDate,
  endDate,
}: FinancialOverviewProps) {
  const { monthlyGoal } = useDataStore()

  const financialData = useMemo(() => {
    let totalRevenue = 0
    let costOfGoods = 0
    let totalExpenses = 0
    let totalFees = 0

    transactions.forEach((t) => {
      const tDate = t.date
      if (tDate >= startDate && tDate <= endDate) {
        if (t.type === 'entry') {
          totalRevenue += t.amount
          totalFees += t.cardFee || 0

          if (t.itemType === 'product' && t.itemId && t.quantity) {
            const product = products.find((p) => p.id === t.itemId)
            if (product && product.purchasePrice) {
              costOfGoods += product.purchasePrice * t.quantity
            }
          }
        } else if (t.type === 'exit') {
          totalExpenses += t.amount
        }
      }
    })

    const grossProfit = totalRevenue - costOfGoods
    // Net Profit = Gross Profit - (Operating Expenses + Fees)
    const netProfit = grossProfit - (totalExpenses + totalFees)

    return {
      totalRevenue,
      grossProfit,
      netProfit,
    }
  }, [transactions, products, startDate, endDate])

  const goalPercentage = Math.min(
    (financialData.totalRevenue / monthlyGoal) * 100,
    100,
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-subtle border-none bg-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target className="w-24 h-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Meta Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-2">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(financialData.totalRevenue)}
            </div>
            <span className="text-xs font-bold text-primary">
              {goalPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={goalPercentage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            Meta: {formatCurrency(monthlyGoal)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-none bg-emerald-500/5 border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Lucro Bruto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(financialData.grossProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Receita - Custo Produtos
          </p>
        </CardContent>
      </Card>

      <Card
        className={`shadow-subtle border-none border-l-4 ${financialData.netProfit >= 0 ? 'bg-blue-500/5 border-l-blue-500' : 'bg-red-500/5 border-l-red-500'}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Wallet
              className={`w-4 h-4 ${financialData.netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`}
            />
            Lucro Líquido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(financialData.netProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lucro Bruto - Despesas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
