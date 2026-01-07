import { useState, useMemo } from 'react'
import { SummaryCards } from '@/components/cash-flow/SummaryCards'
import { TransactionTable } from '@/components/cash-flow/TransactionTable'
import { AddTransactionDialog } from '@/components/cash-flow/AddTransactionDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Search } from 'lucide-react'
import useDataStore from '@/stores/useDataStore'
import { Transaction } from '@/types'
import { GoalWidget } from '@/components/dashboard/GoalWidget'
import { ProfitabilityCharts } from '@/components/dashboard/ProfitabilityCharts'

export default function Index() {
  const { transactions, addTransaction, products, services } = useDataStore()
  const [notes, setNotes] = useState(
    'Conferir estoque de Jumbo para o fim de semana.',
  )
  const [startDate, setStartDate] = useState('2026-01-01') // Updated default date
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const { toast } = useToast()

  // Recalculate balances whenever transactions change
  const processedTransactions = useMemo(() => {
    let runningBalance = 0
    return transactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((t) => {
        if (t.type === 'entry') {
          // Subtract card fee from entry amount to get net cash impact
          const fee = t.cardFee || 0
          const netAmount = t.amount - fee
          runningBalance += netAmount
        } else {
          runningBalance -= t.amount
        }
        return { ...t, balanceAfter: runningBalance }
      })
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return processedTransactions.filter((t) => {
      const date = t.date
      return date >= startDate && date <= endDate
    })
  }, [processedTransactions, startDate, endDate])

  const initialBalance = useMemo(() => {
    // Find the balance before the first transaction in the filtered list
    if (filteredTransactions.length === 0) return 0

    const first = filteredTransactions[0]
    // Reverse calculation to find previous balance
    if (first.type === 'entry') {
      const fee = first.cardFee || 0
      const netAmount = first.amount - fee
      return first.balanceAfter - netAmount
    }
    return first.balanceAfter + first.amount
  }, [filteredTransactions])

  const finalBalance = useMemo(() => {
    if (filteredTransactions.length === 0) return initialBalance
    return filteredTransactions[filteredTransactions.length - 1].balanceAfter
  }, [filteredTransactions, initialBalance])

  const currentRevenue = useMemo(() => {
    // Keeping revenue as Gross Revenue for goal tracking
    return filteredTransactions
      .filter((t) => t.type === 'entry')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [filteredTransactions])

  const totalFees = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.cardFee || 0), 0)
  }, [filteredTransactions])

  const handleAddTransaction = (data: Transaction) => {
    addTransaction(data)
    toast({
      title: 'Movimentação adicionada',
      description: 'O registro de caixa foi atualizado com sucesso.',
    })
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de saúde financeira e performance.
          </p>
        </div>
        <AddTransactionDialog onAdd={handleAddTransaction} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Section */}
          <SummaryCards
            initialBalance={initialBalance}
            finalBalance={finalBalance}
            totalFees={totalFees}
          />
        </div>
        <div className="lg:col-span-1">
          <GoalWidget currentRevenue={currentRevenue} />
        </div>
      </div>

      <ProfitabilityCharts
        transactions={filteredTransactions}
        products={products}
        services={services}
      />

      {/* Header Filter Section */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 bg-white p-6 rounded-xl shadow-subtle">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Data Inicial
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-border/60"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Data Final
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-border/60"
            />
          </div>
        </div>
        <Button
          className="rounded-full px-8 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm"
          onClick={() => {}}
        >
          <Search className="w-4 h-4 mr-2" />
          Filtrar Período
        </Button>
      </div>

      {/* Table Section */}
      <TransactionTable transactions={filteredTransactions} />

      {/* Notes Section */}
      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Observações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Digite aqui observações importantes sobre o caixa do dia..."
            className="min-h-[120px] resize-none bg-muted/20 border-border/50 focus:border-primary/50"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
