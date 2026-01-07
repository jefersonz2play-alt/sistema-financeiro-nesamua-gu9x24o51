import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Transaction, Product, Service } from '@/types'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface ProfitabilityChartsProps {
  transactions: Transaction[]
  products: Product[]
  services: Service[]
}

export function ProfitabilityCharts({
  transactions,
  products,
  services,
}: ProfitabilityChartsProps) {
  const topProducts = useMemo(() => {
    const productSales: Record<string, number> = {}

    transactions.forEach((t) => {
      if (
        t.type === 'entry' &&
        t.itemType === 'product' &&
        t.itemId &&
        t.quantity
      ) {
        productSales[t.itemId] = (productSales[t.itemId] || 0) + t.quantity
      }
    })

    return Object.entries(productSales)
      .map(([id, qty]) => ({
        ...products.find((p) => p.id === id),
        qty,
      }))
      .filter((item) => item.id) // Filter out undefined if product deleted
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [transactions, products])

  const topServices = useMemo(() => {
    const serviceRevenue: Record<string, number> = {}

    transactions.forEach((t) => {
      if (t.type === 'entry' && t.itemType === 'service' && t.itemId) {
        serviceRevenue[t.itemId] = (serviceRevenue[t.itemId] || 0) + t.amount
      }
    })

    return Object.entries(serviceRevenue)
      .map(([id, amount]) => ({
        ...services.find((s) => s.id === id),
        amount,
      }))
      .filter((item) => item.id)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [transactions, services])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Produtos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma venda registrada.
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.brand}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.qty} un.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Serviços Mais Rentáveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum serviço registrado.
            </p>
          ) : (
            <div className="space-y-4">
              {topServices.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
