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
  readOnly?: boolean
}

export function FinancialSummary({
  totalReceivable = 0,
  paidAmount = 0,
  onPaidAmountChange,
  status = 'open',
  onStatusChange,
  lastUpdated,
  readOnly = false,
}: FinancialSummaryProps) {
  const openAmount = totalReceivable - paidAmount
  const safeLastUpdated = lastUpdated instanceof Date ? lastUpdated : new Date()

  return (
    <Card className="shadow-subtle border-none bg-card">
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
              className="pl-9 font-semibold text-lg bg-secondary/30 border-input"
              value={paidAmount}
              onChange={(e) => onPaidAmountChange(Number(e.target.value))}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Valor em Aberto
          </Label>
          <div
            className={`text-2xl font-bold ${openAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}
          >
            {formatCurrency(openAmount)}
          </div>
        </div>

        <div className="space-y-2 flex flex-col justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Status do Pagamento
          </Label>
          <Select
            value={status}
            onValueChange={(v: any) => onStatusChange(v)}
            disabled={readOnly}
          >
            <SelectTrigger
              className={
                status === 'paid'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                  : status === 'partial'
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-500'
                    : 'bg-red-500/20 border-red-500/30 text-red-500'
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
            Atualizado: {safeLastUpdated.toLocaleDateString()}{' '}
            {safeLastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
