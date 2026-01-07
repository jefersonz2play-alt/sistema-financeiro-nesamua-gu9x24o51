import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, ShoppingCart } from 'lucide-react'
import { Product, Transaction } from '@/types'

interface InventoryInsightsProps {
  products: Product[]
  transactions: Transaction[]
}

export function InventoryInsights({
  products,
  transactions,
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

    // Find products sold in the last 30 days
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

    // Products with stock > 0 but no sales in last 30 days
    return products.filter(
      (p) => p.stock > 0 && !recentProductIds.has(p.id) && p.id,
    )
  }, [products, transactions])

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <Card className="shadow-subtle border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Total Vendido
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSold} un.</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total histórico de vendas
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Em Estoque
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInStock} un.</div>
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade física disponível
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Estoque Parado
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{agingStock.length} itens</div>
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
