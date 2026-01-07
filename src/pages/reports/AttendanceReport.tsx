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
  const { transactions, customers, employees, services } = useDataStore()

  const days = parseInt(searchParams.get('days') || '30')
  const cutoffDate = subDays(new Date(), days)

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date)
        // Filter for Service Entries in the date range
        return (
          t.type === 'entry' && t.itemType === 'service' && tDate >= cutoffDate
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, cutoffDate])

  const getCustomerName = (id?: string) =>
    customers.find((c) => c.id === id)?.name || 'N/A'
  const getEmployeeName = (id?: string) =>
    employees.find((e) => e.id === id)?.name || 'N/A'
  const getServiceName = (id?: string) =>
    services.find((s) => s.id === id)?.name || id || 'Serviço'

  const totalRevenue = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
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
                Relatório de Atendimentos
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Período: Últimos {days} dias ({format(cutoffDate, 'dd/MM/yyyy')}{' '}
                até {format(new Date(), 'dd/MM/yyyy')})
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total de Atendimentos
              </p>
              <p className="text-2xl font-bold">
                {filteredTransactions.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
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
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum atendimento encontrado no período.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getCustomerName(t.customerId)}
                    </TableCell>
                    <TableCell>{getServiceName(t.itemId)}</TableCell>
                    <TableCell>{getEmployeeName(t.employeeId)}</TableCell>
                    <TableCell className="text-right">
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
