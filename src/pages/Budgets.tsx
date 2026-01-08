import { useState } from 'react'
import {
  FileText,
  Printer,
  ArrowRightCircle,
  Trash2,
  Calendar,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CreateBudgetDialog } from '@/components/budgets/CreateBudgetDialog'
import { BudgetPrint } from '@/components/budgets/BudgetPrint'
import useDataStore from '@/stores/useDataStore'
import { Budget, Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function Budgets() {
  const {
    budgets,
    customers,
    addBudget,
    deleteBudget,
    addTransaction,
    updateBudget,
  } = useDataStore()
  const { toast } = useToast()
  const [printBudget, setPrintBudget] = useState<Budget | null>(null)

  const handleSaveBudget = (newBudget: Budget) => {
    addBudget(newBudget)
    toast({
      title: 'Orçamento Criado',
      description: 'O orçamento foi salvo com sucesso.',
    })
  }

  const handleDelete = (id: string) => {
    deleteBudget(id)
    toast({
      title: 'Orçamento Removido',
      description: 'O orçamento foi excluído.',
    })
  }

  const handleConvertToTransaction = (budget: Budget) => {
    const customer = customers.find((c) => c.id === budget.customerId)
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      description: `Orçamento #${budget.id.substr(0, 5)} - ${customer?.name || 'Cliente'}`,
      type: 'entry',
      amount: budget.totalAmount,
      balanceAfter: 0,
      customerId: budget.customerId,
      paymentMethod: budget.paymentMethod,
      itemId: budget.items[0]?.id, // Linking primary item
      itemType: budget.items[0]?.type === 'service' ? 'service' : 'product',
      splits: [], // No splits by default from simple convert
    }

    addTransaction(transaction)
    updateBudget(budget.id, { status: 'converted' })
    toast({
      title: 'Adicionado ao Caixa',
      description: 'Uma nova entrada foi criada a partir deste orçamento.',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Print View - Only visible when printing */}
      {printBudget && (
        <Dialog
          open={!!printBudget}
          onOpenChange={(open) => !open && setPrintBudget(null)}
        >
          <DialogContent className="max-w-[800px] h-[90vh] overflow-y-auto print:visible print:p-0 print:border-none print:shadow-none print:max-w-none print:h-auto print:overflow-visible">
            <div className="print:hidden mb-4 flex justify-end">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimir Agora
              </Button>
            </div>
            <div className="bg-white text-black p-4 rounded-md">
              <BudgetPrint
                budget={printBudget}
                customer={customers.find(
                  (c) => c.id === printBudget.customerId,
                )}
              />
            </div>
            <DialogFooter className="print:hidden">
              <Button variant="outline" onClick={() => setPrintBudget(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Orçamentos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e imprima orçamentos para seus clientes.
          </p>
        </div>
        <CreateBudgetDialog onSave={handleSaveBudget} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {budgets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum orçamento criado</p>
            <p className="text-sm">Clique em "Novo Orçamento" para começar.</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const customer = customers.find((c) => c.id === budget.customerId)
            return (
              <Card
                key={budget.id}
                className="shadow-subtle border-none hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant={
                        budget.status === 'converted' ? 'secondary' : 'outline'
                      }
                      className={
                        budget.status === 'converted'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-primary/10 text-primary-foreground'
                      }
                    >
                      {budget.status === 'converted'
                        ? 'Convertido'
                        : 'Rascunho'}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      #{budget.id.substr(0, 5)}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2">
                    {customer?.name || 'Cliente Removido'}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(budget.createdAt), 'dd/MM/yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Itens:</span>
                      <span className="font-medium">{budget.items.length}</span>
                    </div>
                    {budget.scheduledDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Agendado:
                        </span>
                        <span>
                          {format(
                            new Date(budget.scheduledDate),
                            'dd/MM - HH:mm',
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-border/50">
                      <span>Total:</span>
                      <span className="text-primary">
                        {formatCurrency(budget.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPrintBudget(budget)}
                    title="Imprimir"
                  >
                    <Printer className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>

                  {budget.status !== 'converted' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Excluir"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir Orçamento?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação é irreversível.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(budget.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {budget.status !== 'converted' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
                          <span className="sr-only sm:not-sr-only">Caixa</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Incluir ao Fluxo de Caixa?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso criará uma nova entrada de{' '}
                            <strong>
                              {formatCurrency(budget.totalAmount)}
                            </strong>{' '}
                            no caixa do dia.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleConvertToTransaction(budget)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
