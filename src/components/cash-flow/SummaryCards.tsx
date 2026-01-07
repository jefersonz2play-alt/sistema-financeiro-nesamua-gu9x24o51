import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface SummaryCardsProps {
  initialBalance: number
  finalBalance: number
}

export function SummaryCards({
  initialBalance,
  finalBalance,
}: SummaryCardsProps) {
  const difference = finalBalance - initialBalance
  const isPositive = difference >= 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-subtle hover:shadow-lg transition-shadow duration-300 border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Saldo Inicial
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(initialBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Início do período selecionado
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle hover:shadow-lg transition-shadow duration-300 border-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Saldo Final
          </CardTitle>
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(finalBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span
              className={
                isPositive
                  ? 'text-green-600 font-medium'
                  : 'text-red-600 font-medium'
              }
            >
              {isPositive ? '+' : ''}
              {formatCurrency(difference)}
            </span>{' '}
            neste período
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
