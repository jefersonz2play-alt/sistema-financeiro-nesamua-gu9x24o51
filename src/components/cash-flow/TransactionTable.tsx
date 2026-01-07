import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react'
import { Transaction, PaymentMethod } from '@/types'
import useDataStore from '@/stores/useDataStore'
import { EditTransactionDialog } from './EditTransactionDialog'

export type TransactionType = 'entry' | 'exit'
export type { Transaction }

interface TransactionTableProps {
  transactions: Transaction[]
}

const getPaymentMethodLabel = (method?: PaymentMethod) => {
  switch (method) {
    case 'money':
      return { label: 'Dinheiro', icon: Banknote }
    case 'pix':
      return { label: 'PIX', icon: Smartphone }
    case 'link':
      return { label: 'Link', icon: LinkIcon }
    case 'debit_card':
      return { label: 'Débito', icon: CreditCard }
    case 'credit_card':
      return { label: 'Crédito', icon: CreditCard }
    default:
      return { label: '-', icon: null }
  }
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const { customers, employees } = useDataStore()

  const getCustomerName = (id?: string) => {
    if (!id) return '-'
    return customers.find((c) => c.id === id)?.name || 'Cliente Removido'
  }

  const getEmployeeName = (id?: string) => {
    if (!id) return '-'
    return employees.find((e) => e.id === id)?.name || 'Func. Removido'
  }

  return (
    <Card className="shadow-subtle border-none overflow-hidden bg-card">
      <CardHeader className="bg-card border-b border-border/50">
        <CardTitle className="text-lg font-semibold text-foreground">
          Movimentações Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Funcionário</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="text-right">Valor Bruto</TableHead>
                <TableHead className="text-right">Taxas</TableHead>
                <TableHead className="text-right">Valor Líquido</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma movimentação encontrada para este período.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => {
                  const payment = getPaymentMethodLabel(
                    transaction.paymentMethod,
                  )
                  const PaymentIcon = payment.icon
                  const fee = transaction.cardFee || 0
                  const isEntry = transaction.type === 'entry'
                  const isBonus = transaction.itemType === 'bonus'
                  const grossAmount = transaction.amount
                  const netAmount = isEntry ? grossAmount - fee : grossAmount

                  return (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-muted/20 transition-colors border-border/50"
                    >
                      <TableCell className="font-medium text-muted-foreground whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {transaction.description}
                          {isBonus && (
                            <Badge
                              variant="outline"
                              className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px] h-5 px-1.5 gap-1"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              Bônus
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getCustomerName(transaction.customerId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getEmployeeName(transaction.employeeId)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-foreground/80">
                          {PaymentIcon && (
                            <PaymentIcon className="w-3 h-3 text-muted-foreground" />
                          )}
                          {payment.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            transaction.type === 'entry'
                              ? 'bg-emerald-500/20 text-emerald-400 border-none'
                              : 'bg-rose-500/20 text-rose-400 border-none'
                          }
                        >
                          {transaction.type === 'entry' ? (
                            <span className="flex items-center gap-1">
                              <ArrowUpCircle className="w-3 h-3" /> Entrada
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowDownCircle className="w-3 h-3" /> Saída
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground font-medium">
                        {formatCurrency(grossAmount)}
                      </TableCell>
                      <TableCell className="text-right text-red-400 font-medium text-xs">
                        {fee > 0 ? `- ${formatCurrency(fee)}` : '-'}
                      </TableCell>
                      <TableCell
                        className={
                          transaction.type === 'entry'
                            ? 'text-emerald-400 text-right font-medium'
                            : 'text-rose-400 text-right font-medium'
                        }
                      >
                        {transaction.type === 'exit' ? '-' : '+'}
                        {formatCurrency(netAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-muted-foreground">
                        {formatCurrency(transaction.balanceAfter)}
                      </TableCell>
                      <TableCell>
                        <EditTransactionDialog transaction={transaction} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
