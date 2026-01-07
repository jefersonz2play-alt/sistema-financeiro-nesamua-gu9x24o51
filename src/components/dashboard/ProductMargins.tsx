import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ProductMarginsProps {
  products: Product[]
}

export function ProductMargins({ products }: ProductMarginsProps) {
  const marginData = useMemo(() => {
    return products
      .map((p) => {
        const cost = p.purchasePrice || 0
        const sale = p.price || 0
        const profit = sale - cost
        const marginPercent = sale > 0 ? (profit / sale) * 100 : 0
        return {
          ...p,
          cost,
          sale,
          profit,
          marginPercent,
        }
      })
      .sort((a, b) => b.marginPercent - a.marginPercent) // Sort by highest margin %
  }, [products])

  return (
    <Card className="shadow-subtle border-none h-full">
      <CardHeader>
        <CardTitle className="text-lg">Lucratividade de Produtos</CardTitle>
        <CardDescription>
          Análise de margens de lucro por item cadastrado.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10">
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marginData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[150px] truncate">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {formatCurrency(item.cost)}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {formatCurrency(item.sale)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600 text-xs">
                    {formatCurrency(item.profit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        item.marginPercent > 50
                          ? 'default'
                          : item.marginPercent > 30
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {item.marginPercent.toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {marginData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhum produto cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
