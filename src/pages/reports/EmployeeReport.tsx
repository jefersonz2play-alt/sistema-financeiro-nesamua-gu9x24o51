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

export default function EmployeeReport() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { transactions, employees, services } = useDataStore()

  const days = parseInt(searchParams.get('days') || '30')
  const cutoffDate = subDays(new Date(), days)

  // Group transactions by Employee
  const reportData = useMemo(() => {
    return employees
      .map((emp) => {
        const empTransactions = transactions
          .filter(
            (t) =>
              t.employeeId === emp.id &&
              t.type === 'entry' &&
              t.itemType === 'service' &&
              new Date(t.date) >= cutoffDate,
          )
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )

        const totalRevenue = empTransactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        )
        const totalCommission = empTransactions.reduce(
          (sum, t) => sum + (t.employeePayment || 0),
          0,
        )

        return {
          employee: emp,
          transactions: empTransactions,
          totalRevenue,
          totalCommission,
        }
      })
      .filter((data) => data.transactions.length > 0)
  }, [employees, transactions, cutoffDate])

  const getServiceName = (id?: string) =>
    services.find((s) => s.id === id)?.name || 'Serviço'

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
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
          <div>
            <CardTitle className="text-2xl font-bold">
              Relatório de Desempenho da Equipe
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Período: Últimos {days} dias ({format(cutoffDate, 'dd/MM/yyyy')}{' '}
              até {format(new Date(), 'dd/MM/yyyy')})
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6 space-y-8">
          {reportData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro de atendimento encontrado para os funcionários
              neste período.
            </div>
          ) : (
            reportData.map(
              ({ employee, transactions, totalRevenue, totalCommission }) => (
                <div key={employee.id} className="space-y-4 page-break">
                  <div className="bg-muted/30 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h3 className="text-lg font-bold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.email}
                      </p>
                    </div>
                    <div className="flex gap-6 mt-2 md:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase">
                          Atendimentos
                        </p>
                        <p className="font-bold">{transactions.length}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase">
                          Gerado (Bruto)
                        </p>
                        <p className="font-bold">
                          {formatCurrency(totalRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase">
                          Comissões
                        </p>
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(totalCommission)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            {format(new Date(t.date), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getServiceName(t.itemId)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                            {t.description}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(t.amount)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            {formatCurrency(t.employeePayment || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ),
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
