import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProductionTable } from '@/components/employees/ProductionTable'
import { FinancialSummary } from '@/components/employees/FinancialSummary'
import useDataStore from '@/stores/useDataStore'
import { formatCurrency } from '@/lib/utils'

export default function EmployeePayments() {
  const { employees, services, transactions, updateEmployee } = useDataStore()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')

  // Local state for editing before saving
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [paidAmount, setPaidAmount] = useState(0)
  const [status, setStatus] = useState<'paid' | 'partial' | 'open'>('open')
  const [notes, setNotes] = useState('')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const { toast } = useToast()

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId],
  )

  // Select first employee on load
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [employees, selectedEmployeeId])

  // Sync local state with selected employee
  useEffect(() => {
    if (selectedEmployee) {
      setQuantities(selectedEmployee.quantities || {})
      setPaidAmount(selectedEmployee.paidAmount || 0)
      setStatus(selectedEmployee.status || 'open')
      setLastUpdated(
        selectedEmployee.lastUpdated
          ? new Date(selectedEmployee.lastUpdated)
          : new Date(),
      )
    }
  }, [selectedEmployee])

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [serviceId]: quantity }))
  }

  // Calculate commissions from static quantities
  const commissionFromQuantities = useMemo(() => {
    return services.reduce((total, service) => {
      return total + service.payout * (quantities[service.id] || 0)
    }, 0)
  }, [quantities, services])

  // Calculate commissions from linked transactions
  const commissionFromTransactions = useMemo(() => {
    if (!selectedEmployeeId) return 0
    return transactions
      .filter((t) => t.employeeId === selectedEmployeeId && t.employeePayment)
      .reduce((sum, t) => sum + (t.employeePayment || 0), 0)
  }, [transactions, selectedEmployeeId])

  // Total Receivable is sum of both methods (Manual Quantities + Transaction Records)
  const totalReceivable = commissionFromQuantities + commissionFromTransactions

  const handleSave = () => {
    if (!selectedEmployeeId) return

    updateEmployee(selectedEmployeeId, {
      quantities,
      paidAmount,
      status,
      lastUpdated: new Date().toISOString(),
    })

    setLastUpdated(new Date())

    toast({
      title: 'Pagamento Salvo',
      description: `Os dados de pagamento de ${selectedEmployee?.name} foram atualizados.`,
    })
  }

  const copyPix = () => {
    if (selectedEmployee) {
      navigator.clipboard.writeText(selectedEmployee.pix)
      toast({
        title: 'Copiado!',
        description: 'Chave PIX copiada para a área de transferência.',
      })
    }
  }

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum funcionário cadastrado.
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Top Bar - Employee Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-subtle">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Selecione o Funcionário
          </label>
          <Select
            value={selectedEmployeeId}
            onValueChange={setSelectedEmployeeId}
          >
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Employee Info & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {selectedEmployee && (
            <Card className="shadow-subtle border-none bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-white shadow-md">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/medium?gender=female&seed=${selectedEmployee.id}`}
                  />
                  <AvatarFallback>
                    {selectedEmployee.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {selectedEmployee.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Profissional</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Chave PIX
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-foreground truncate mr-2">
                      {selectedEmployee.pix}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={copyPix}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-subtle border-none h-full">
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observações sobre este pagamento..."
                className="min-h-[150px] resize-none bg-muted/20 focus:bg-white transition-colors"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Production & Summary */}
        <div className="space-y-6 lg:col-span-2">
          <FinancialSummary
            totalReceivable={totalReceivable}
            paidAmount={paidAmount}
            onPaidAmountChange={(val) => setPaidAmount(val)}
            status={status}
            onStatusChange={(val) => setStatus(val)}
            lastUpdated={lastUpdated}
          />

          <Card className="shadow-subtle border-none mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Origem dos Ganhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                  <span className="text-sm text-muted-foreground block mb-1">
                    Produção Manual (Quantidade)
                  </span>
                  <span className="text-xl font-bold">
                    {formatCurrency(commissionFromQuantities)}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                  <span className="text-sm text-muted-foreground block mb-1">
                    Via Caixa (Movimentações)
                  </span>
                  <span className="text-xl font-bold">
                    {formatCurrency(commissionFromTransactions)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProductionTable
            services={services}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
          />
        </div>
      </div>
    </div>
  )
}
