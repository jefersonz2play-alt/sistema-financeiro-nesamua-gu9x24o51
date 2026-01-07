import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export const SERVICE_PRICES = [15, 20, 30, 40, 45, 50, 55, 60]

interface ProductionTableProps {
  quantities: Record<number, number>
  onQuantityChange: (price: number, quantity: number) => void
}

export function ProductionTable({
  quantities,
  onQuantityChange,
}: ProductionTableProps) {
  return (
    <Card className="shadow-subtle border-none overflow-hidden">
      <CardHeader className="bg-white border-b border-border/50">
        <CardTitle className="text-lg font-semibold">
          Tabela de Serviços
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Valor do Serviço</TableHead>
                <TableHead className="w-[150px]">Quantidade</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERVICE_PRICES.map((price) => (
                <TableRow
                  key={price}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="font-medium">
                    {formatCurrency(price)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      className="w-full text-center"
                      value={quantities[price] || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        onQuantityChange(price, val)
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right font-bold text-muted-foreground">
                    {formatCurrency(price * (quantities[price] || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
