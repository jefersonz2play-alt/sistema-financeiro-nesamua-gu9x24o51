import { useState, useMemo } from 'react'
import { SummaryCards } from '@/components/cash-flow/SummaryCards'
import {
  TransactionTable,
  TransactionType,
} from '@/components/cash-flow/TransactionTable'
import { AddTransactionDialog } from '@/components/cash-flow/AddTransactionDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Search } from 'lucide-react'
import useDataStore from '@/stores/useDataStore'
import { Transaction } from '@/types'

export default function Index() {
  const { transactions, addTransaction } = useDataStore()
  const [notes, setNotes] = useState(
    'Conferir estoque de Jumbo para o fim de semana.',
  )
  const [startDate, setStartDate] = useState('2023-10-01')
  const [endDate, setEndDate] = useState('2023-10-31')
  const { toast } = useToast()

  // Recalculate balances whenever transactions change
  const processedTransactions = useMemo(() => {
    let runningBalance = 0
    return transactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((t) => {
        if (t.type === 'entry') {
          runningBalance += t.amount
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
    if (first.type === 'entry') return first.balanceAfter - first.amount
    return first.balanceAfter + first.amount
  }, [filteredTransactions])

  const finalBalance = useMemo(() => {
    if (filteredTransactions.length === 0) return initialBalance
    return filteredTransactions[filteredTransactions.length - 1].balanceAfter
  }, [filteredTransactions, initialBalance])

  const handleAddTransaction = (data: {
    description: string
    amount: number
    type: TransactionType
    date: Date
    customerId?: string
    employeeId?: string
    employeePayment?: number
  }) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: data.date.toISOString().split('T')[0],
      description: data.description,
      type: data.type,
      amount: data.amount,
      balanceAfter: 0, // Will be recalculated
      customerId: data.customerId,
      employeeId: data.employeeId,
      employeePayment: data.employeePayment,
    }

    addTransaction(newTransaction)
    toast({
      title: 'Movimentação adicionada',
      description: 'O registro de caixa foi atualizado com sucesso.',
    })
  }

  return (
    <div className="space-y-8 pb-10">
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
          className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
          onClick={() => {}}
        >
          <Search className="w-4 h-4 mr-2" />
          Filtrar Período
        </Button>
      </div>

      {/* Summary Section */}
      <SummaryCards
        initialBalance={initialBalance}
        finalBalance={finalBalance}
      />

      {/* Actions */}
      <div className="flex justify-end">
        <AddTransactionDialog onAdd={handleAddTransaction} />
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
