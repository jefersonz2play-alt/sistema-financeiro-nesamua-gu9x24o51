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

export type TransactionType = 'entry' | 'exit'

export interface Transaction {
  id: string
  date: string
  description: string
  type: TransactionType
  amount: number
  balanceAfter: number
}

interface TransactionTableProps {
  transactions: Transaction[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <Card className="shadow-subtle border-none overflow-hidden">
      <CardHeader className="bg-white border-b border-border/50">
        <CardTitle className="text-lg font-semibold">
          Movimentações Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[120px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[120px]">Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Saldo Após</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
                    <TableCell className="font-medium text-muted-foreground">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          transaction.type === 'entry'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 border-none'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 border-none'
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
                          ? 'text-green-600 text-right font-medium'
                          : 'text-red-600 text-right font-medium'
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
