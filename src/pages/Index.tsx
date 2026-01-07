import { useState, useMemo } from 'react'
import { SummaryCards } from '@/components/cash-flow/SummaryCards'
import {
  TransactionTable,
  Transaction,
  TransactionType,
} from '@/components/cash-flow/TransactionTable'
import { AddTransactionDialog } from '@/components/cash-flow/AddTransactionDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Search } from 'lucide-react'

// Initial Mock Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2023-10-25',
    description: 'Venda de Serviços',
    type: 'entry',
    amount: 1500.0,
    balanceAfter: 1500.0,
  },
  {
    id: '2',
    date: '2023-10-26',
    description: 'Pagamento de Fornecedor',
    type: 'exit',
    amount: 350.5,
    balanceAfter: 1149.5,
  },
  {
    id: '3',
    date: '2023-10-26',
    description: 'Venda de Produto A',
    type: 'entry',
    amount: 200.0,
    balanceAfter: 1349.5,
  },
  {
    id: '4',
    date: '2023-10-27',
    description: 'Conta de Luz',
    type: 'exit',
    amount: 450.0,
    balanceAfter: 899.5,
  },
]

export default function Index() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [notes, setNotes] = useState(
    'Verificar o recebimento do cliente X até sexta-feira.',
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
    // Ideally this would come from previous history
    if (filteredTransactions.length === 0) return 0

    // Simple logic: Take the first transaction's balanceAfter and reverse the operation
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
  }) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: data.date.toISOString().split('T')[0],
      description: data.description,
      type: data.type,
      amount: data.amount,
      balanceAfter: 0, // Will be recalculated
    }

    setTransactions((prev) => [...prev, newTransaction])
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
          className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
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
