import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FinancialSummaryProps {
  totalReceivable: number
  paidAmount: number
  onPaidAmountChange: (amount: number) => void
  status: 'paid' | 'partial' | 'open'
  onStatusChange: (status: 'paid' | 'partial' | 'open') => void
  lastUpdated: Date
}

export function FinancialSummary({
  totalReceivable,
  paidAmount,
  onPaidAmountChange,
  status,
  onStatusChange,
  lastUpdated,
}: FinancialSummaryProps) {
  const openAmount = totalReceivable - paidAmount

  return (
    <Card className="shadow-subtle border-none bg-white">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Total a Receber
          </Label>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(totalReceivable)}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Valor já Pago
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              className="pl-9 font-semibold text-lg"
              value={paidAmount}
              onChange={(e) => onPaidAmountChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Valor em Aberto
          </Label>
          <div
            className={`text-2xl font-bold ${openAmount > 0 ? 'text-red-500' : 'text-green-500'}`}
          >
            {formatCurrency(openAmount)}
          </div>
        </div>

        <div className="space-y-2 flex flex-col justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Status do Pagamento
          </Label>
          <Select value={status} onValueChange={(v: any) => onStatusChange(v)}>
            <SelectTrigger
              className={
                status === 'paid'
                  ? 'bg-green-100 border-green-200 text-green-800'
                  : status === 'partial'
                    ? 'bg-yellow-100 border-yellow-200 text-yellow-800'
                    : 'bg-red-100 border-red-200 text-red-800'
              }
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Em Aberto</SelectItem>
              <SelectItem value="partial">Parcialmente Pago</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            Atualizado em: {lastUpdated.toLocaleDateString()} às{' '}
            {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
