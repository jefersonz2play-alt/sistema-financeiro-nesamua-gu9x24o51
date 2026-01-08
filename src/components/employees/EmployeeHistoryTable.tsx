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
import { Transaction } from '@/types'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface EmployeeHistoryTableProps {
  transactions: Transaction[]
  employeeId: string
  getCustomerName: (id?: string) => string
}

export function EmployeeHistoryTable({
  transactions,
  employeeId,
  getCustomerName,
}: EmployeeHistoryTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    const timeA = new Date(a.date).getTime()
    const timeB = new Date(b.date).getTime()
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
  })

  return (
    <Card className="shadow-subtle border-none bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Histórico Detalhado
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSort}
          className="text-xs text-muted-foreground"
        >
          <ArrowUpDown className="w-3 h-3 mr-1" />
          {sortOrder === 'asc' ? 'Mais Antigos' : 'Mais Recentes'}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Valor Repasse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma movimentação registrada para este funcionário.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((t) => {
                  // Determine amount and status for this specific employee
                  let amount = 0
                  let isPaid = false

                  if (t.splits && t.splits.length > 0) {
                    const split = t.splits.find(
                      (s) => s.employeeId === employeeId,
                    )
                    if (split) {
                      amount = split.amount
                      isPaid = !!split.isPaid
                    }
                  } else if (t.employeeId === employeeId) {
                    amount = t.employeePayment || 0
                    isPaid = !!t.isPaid
                  }

                  return (
                    <TableRow key={t.id} className="hover:bg-muted/10">
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(t.date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getCustomerName(t.customerId)}
                      </TableCell>
                      <TableCell className="text-sm">{t.description}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={isPaid ? 'secondary' : 'outline'}
                          className={
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                              : 'text-amber-600 border-amber-200 bg-amber-50'
                          }
                        >
                          {isPaid ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(amount)}
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
