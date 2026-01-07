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
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { Transaction } from '@/types'
import useDataStore from '@/stores/useDataStore'

export type TransactionType = 'entry' | 'exit'

// Re-exporting Transaction from types to maintain compatibility if imported elsewhere,
// or just use the one from types directly in this file.
export type { Transaction }

interface TransactionTableProps {
  transactions: Transaction[]
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
    <Card className="shadow-subtle border-none overflow-hidden">
      <CardHeader className="bg-white border-b border-border/50">
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
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma movimentação encontrada para este período.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium text-muted-foreground whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getCustomerName(transaction.customerId)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getEmployeeName(transaction.employeeId)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          transaction.type === 'entry'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-none'
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
                    <TableCell
                      className={
                        transaction.type === 'entry'
                          ? 'text-emerald-600 text-right font-medium'
                          : 'text-rose-600 text-right font-medium'
                      }
                    >
                      {transaction.type === 'exit' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-muted-foreground">
                      {formatCurrency(transaction.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
