import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, ShoppingCart } from 'lucide-react'
import { Product, Transaction } from '@/types'
import { Link } from 'react-router-dom'

interface InventoryInsightsProps {
  products: Product[]
  transactions: Transaction[]
  timeRange?: string
}

export function InventoryInsights({
  products,
  transactions,
  timeRange = '30',
}: InventoryInsightsProps) {
  const totalSold = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'entry' && t.itemType === 'product')
      .reduce((sum, t) => sum + (t.quantity || 0), 0)
  }, [transactions])

  const totalInStock = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock, 0)
  }, [products])

  const agingStock = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentProductIds = new Set(
      transactions
        .filter(
          (t) =>
            t.type === 'entry' &&
            t.itemType === 'product' &&
            t.itemId &&
            new Date(t.date) >= thirtyDaysAgo,
        )
        .map((t) => t.itemId),
    )
    return products.filter(
      (p) => p.stock > 0 && !recentProductIds.has(p.id) && p.id,
    )
  }, [products, transactions])

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <Link
        to={`/reports/sales?days=${timeRange}`}
        className="block transition-transform hover:scale-105"
      >
        <Card className="shadow-subtle border-none h-full cursor-pointer hover:shadow-lg transition-shadow bg-blue-500/10 hover:bg-blue-500/20 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Vendido
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalSold} un.
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total histórico de vendas
            </p>
            <p className="text-[10px] text-blue-400 font-medium mt-2">
              Ver Detalhes &rarr;
            </p>
          </CardContent>
        </Card>
      </Link>

      <Card className="shadow-subtle border-none bg-emerald-500/10 border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Em Estoque
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Package className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {totalInStock} un.
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade física disponível
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-none bg-amber-500/10 border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Estoque Parado
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {agingStock.length} itens
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sem vendas nos últimos 30 dias
          </p>
          {agingStock.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground/80 truncate">
              Ex: {agingStock[0].name}
              {agingStock.length > 1 && `, ${agingStock[1].name}...`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
