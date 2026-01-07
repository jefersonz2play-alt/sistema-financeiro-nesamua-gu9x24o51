import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { subDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useDataStore from '@/stores/useDataStore'
import { formatCurrency } from '@/lib/utils'

export default function SalesReport() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { transactions, products } = useDataStore()

  const days = parseInt(searchParams.get('days') || '30')
  const cutoffDate = subDays(new Date(), days)

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date)
        // Filter for Product Sales in the date range
        return (
          t.type === 'entry' && t.itemType === 'product' && tDate >= cutoffDate
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, cutoffDate])

  const getProductName = (id?: string) =>
    products.find((p) => p.id === id)?.name || 'Produto Removido'

  const totalRevenue = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  )
  const totalItems = filteredTransactions.reduce(
    (sum, t) => sum + (t.quantity || 0),
    0,
  )

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Imprimir Relatório
        </Button>
      </div>

      <Card className="border-none shadow-none print:shadow-none">
        <CardHeader className="text-center md:text-left border-b pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Relatório de Vendas
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Período: Últimos {days} dias ({format(cutoffDate, 'dd/MM/yyyy')}{' '}
                até {format(new Date(), 'dd/MM/yyyy')})
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Itens Vendidos</p>
              <p className="text-2xl font-bold">
                {totalItems}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  un.
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Volume Total</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma venda encontrada no período.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => {
                  const unitPrice = t.quantity
                    ? t.amount / t.quantity
                    : t.amount
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        {format(new Date(t.date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getProductName(t.itemId)}
                      </TableCell>
                      <TableCell className="text-center">
                        {t.quantity || 1}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
