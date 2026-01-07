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

export default function AttendanceReport() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { transactions, services } = useDataStore()

  const startParam = searchParams.get('startDate')
  const endParam = searchParams.get('endDate')

  const { start, end } = useMemo(() => {
    if (startParam && endParam) {
      return { start: new Date(startParam), end: new Date(endParam) }
    }
    const days = parseInt(searchParams.get('days') || '30')
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    return { start: startDate, end: endDate }
  }, [startParam, endParam, searchParams])

  const filteredTransactions = useMemo(() => {
    const startDateStr = start.toISOString().split('T')[0]
    const endDateStr = end.toISOString().split('T')[0]

    return transactions
      .filter((t) => {
        return (
          t.type === 'entry' &&
          t.itemType === 'service' &&
          t.date >= startDateStr &&
          t.date <= endDateStr
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, start, end])

  const getServiceName = (id?: string) =>
    services.find((s) => s.id === id)?.name || 'Serviço Removido'

  // Calculations
  const totalRevenue = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  )
  const totalAttended = filteredTransactions.length
  const dailyAverage =
    totalAttended /
    Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
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
                Relatório de Atendimentos
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Período: {format(start, 'dd/MM/yyyy')} até{' '}
                {format(end, 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Realizado</p>
                <p className="text-2xl font-bold">{totalAttended}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Média Diária</p>
                <p className="text-2xl font-bold">{dailyAverage.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum atendimento encontrado no período.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {format(new Date(t.date), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getServiceName(t.itemId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[250px] truncate">
                      {t.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
