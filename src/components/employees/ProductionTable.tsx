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
import { Service } from '@/types'

interface ProductionTableProps {
  services: Service[]
  quantities: Record<string, number>
  onQuantityChange: (serviceId: string, quantity: number) => void
  readOnly?: boolean
}

export function ProductionTable({
  services,
  quantities,
  onQuantityChange,
  readOnly = false,
}: ProductionTableProps) {
  return (
    <Card className="shadow-subtle border-none overflow-hidden bg-card">
      <CardHeader className="bg-card border-b border-border/50">
        <CardTitle className="text-lg font-semibold text-foreground">
          Produção por Serviço
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Comissão (Payout)</TableHead>
                <TableHead className="w-[150px]">Quantidade</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow
                  key={service.id}
                  className="hover:bg-muted/20 transition-colors border-border/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-foreground">{service.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {service.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(service.payout)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      className="w-full text-center bg-secondary/30 border-input"
                      value={quantities[service.id] || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        onQuantityChange(service.id, val)
                      }}
                      disabled={readOnly}
                    />
                  </TableCell>
                  <TableCell className="text-right font-bold text-muted-foreground">
                    {formatCurrency(
                      service.payout * (quantities[service.id] || 0),
                    )}
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
