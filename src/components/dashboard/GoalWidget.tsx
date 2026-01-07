import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Target } from 'lucide-react'
import useDataStore from '@/stores/useDataStore'

interface GoalWidgetProps {
  currentRevenue: number
}

export function GoalWidget({ currentRevenue }: GoalWidgetProps) {
  const { monthlyGoal, setMonthlyGoal } = useDataStore()

  const percentage = Math.min((currentRevenue / monthlyGoal) * 100, 100)

  return (
    <Card className="shadow-subtle border-none bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Meta Mensal
        </CardTitle>
        <span className="text-xs font-bold text-primary">
          {percentage.toFixed(0)}%
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-2">
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(currentRevenue)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Alvo:</span>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                R$
              </span>
              <Input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                className="h-8 w-24 pl-6 text-xs text-right border-none bg-secondary/30 focus:bg-card transition-colors text-foreground"
              />
            </div>
          </div>
        </div>
        <Progress value={percentage} className="h-2 bg-secondary/50" />
        <p className="text-xs text-muted-foreground mt-2">
          {currentRevenue >= monthlyGoal
            ? 'Parabéns! Meta atingida!'
            : `Faltam ${formatCurrency(monthlyGoal - currentRevenue)} para atingir a meta.`}
        </p>
      </CardContent>
    </Card>
  )
}
