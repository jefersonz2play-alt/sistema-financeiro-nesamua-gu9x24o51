import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, ShoppingCart, Scissors, Save } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Budget, BudgetItem } from '@/types'
import useDataStore from '@/stores/useDataStore'
import { cn, formatCurrency } from '@/lib/utils'

const budgetSchema = z.object({
  customerId: z.string().min(1, 'Selecione o cliente'),
  paymentMethod: z.enum(['money', 'pix', 'link', 'debit_card', 'credit_card'], {
    required_error: 'Selecione a forma de pagamento',
  }),
  scheduledDate: z.string().optional(),
  items: z
    .array(
      z.object({
        type: z.enum(['service', 'product']),
        id: z.string().min(1, 'Selecione o item'),
        quantity: z.coerce.number().min(1, 'Qtd mínima 1'),
        price: z.coerce.number().min(0),
      }),
    )
    .min(1, 'Adicione pelo menos um item'),
})

interface CreateBudgetDialogProps {
  onSave: (budget: Budget) => void
}

export function CreateBudgetDialog({ onSave }: CreateBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const { customers, products, services } = useDataStore()

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      customerId: '',
      paymentMethod: 'pix',
      scheduledDate: '',
      items: [{ type: 'service', id: '', quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Watch for price updates when item selection changes
  const watchItems = form.watch('items')

  // Calculate total
  const totalAmount = watchItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  )

  const handleItemChange = (index: number, itemId: string) => {
    const currentType = form.getValues(`items.${index}.type`)
    let price = 0

    if (currentType === 'service') {
      const s = services.find((srv) => srv.id === itemId)
      // Assuming service price isn't explicitly in service type but we can default or leave 0
      // Actually service type has 'payout' but usually we want 'price' for customer.
      // The Service type provided in context only has 'payout'.
      // I'll assume we might need to add price to Service or just allow manual entry.
      // For now, I'll default to 0 and let user edit, or maybe payout * 2 as a heuristic if needed.
      // Let's just set it to 0 as per current types structure limitations.
      price = 0
    } else {
      const p = products.find((prd) => prd.id === itemId)
      price = p?.price || 0
    }

    form.setValue(`items.${index}.price`, price)
  }

  const onSubmit = (values: z.infer<typeof budgetSchema>) => {
    const enrichedItems: BudgetItem[] = values.items.map((item) => {
      let name = ''
      if (item.type === 'service') {
        name = services.find((s) => s.id === item.id)?.name || 'Serviço'
      } else {
        name = products.find((p) => p.id === item.id)?.name || 'Produto'
      }

      return {
        type: item.type,
        id: item.id,
        name,
        quantity: item.quantity,
        price: item.price,
      }
    })

    const newBudget: Budget = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: values.customerId,
      items: enrichedItems,
      totalAmount,
      paymentMethod: values.paymentMethod,
      scheduledDate: values.scheduledDate || '',
      createdAt: new Date().toISOString(),
      status: 'draft',
    }

    onSave(newBudget)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Orçamento</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para gerar um novo orçamento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Agendamento</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Itens do Orçamento</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      type: 'service',
                      id: '',
                      quantity: 1,
                      price: 0,
                    })
                  }
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-3 items-end bg-secondary/20 p-3 rounded-lg border border-border/50"
                >
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tipo</FormLabel>
                          <Select
                            onValueChange={(val: 'service' | 'product') => {
                              field.onChange(val)
                              form.setValue(`items.${index}.id`, '')
                              form.setValue(`items.${index}.price`, 0)
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="service">Serviço</SelectItem>
                              <SelectItem value="product">Produto</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Item</FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val)
                              handleItemChange(index, val)
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.getValues(`items.${index}.type`) ===
                              'service'
                                ? services.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))
                                : products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Qtd</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className="h-9"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Preço</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              className="h-9"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 flex justify-center pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end text-lg font-bold">
                Total: {formatCurrency(totalAmount)}
              </div>
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="money">Dinheiro</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="debit_card">Cartão Débito</SelectItem>
                      <SelectItem value="credit_card">
                        Cartão Crédito
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Salvar Orçamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
