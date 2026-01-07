import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Plus } from 'lucide-react'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import useDataStore from '@/stores/useDataStore'
import { Transaction, PaymentMethod } from '@/types'

const formSchema = z
  .object({
    description: z.string().min(2, {
      message: 'A descrição deve ter pelo menos 2 caracteres.',
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'O valor deve ser um número positivo.',
    }),
    type: z.enum(['entry', 'exit'], {
      required_error: 'Selecione o tipo de movimentação.',
    }),
    category: z.enum(['service', 'product', 'bonus', 'other']),
    date: z.date({
      required_error: 'Selecione uma data.',
    }),
    paymentMethod: z.enum(
      ['money', 'pix', 'link', 'debit_card', 'credit_card'],
      {
        required_error: 'Selecione a forma de pagamento.',
      },
    ),
    cardFee: z.string().optional(),
    customerId: z.string().optional(),
    employeeId: z.string().optional(),
    employeePayment: z.string().optional(),
    itemId: z.string().optional(),
    quantity: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validation for Service and Product requirements
    if (data.type === 'entry') {
      if (data.category === 'service') {
        if (!data.customerId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Cliente é obrigatório para serviços.',
            path: ['customerId'],
          })
        }
        if (!data.employeeId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Funcionário é obrigatório para serviços.',
            path: ['employeeId'],
          })
        }
      } else if (data.category === 'product') {
        if (!data.itemId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Selecione o produto.',
            path: ['itemId'],
          })
        }
      }
    } else if (data.type === 'exit') {
      // Bonus requirements
      if (data.category === 'bonus' && !data.employeeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione o funcionário para o bônus.',
          path: ['employeeId'],
        })
      }
    }

    // Validation for Card Fees
    if (
      ['credit_card', 'debit_card'].includes(data.paymentMethod) &&
      (!data.cardFee || Number(data.cardFee) < 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A taxa do cartão é obrigatória.',
        path: ['cardFee'],
      })
    }
  })

interface AddTransactionDialogProps {
  onAdd: (data: Transaction) => void
}

export function AddTransactionDialog({ onAdd }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const { customers, employees, products, services } = useDataStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '',
      type: 'entry',
      category: 'service',
      date: new Date(),
      paymentMethod: 'money',
      cardFee: '',
      customerId: undefined,
      employeeId: undefined,
      employeePayment: '',
      itemId: undefined,
      quantity: '1',
    },
  })

  const watchType = form.watch('type')
  const watchCategory = form.watch('category')
  const watchItemId = form.watch('itemId')
  const watchQuantity = form.watch('quantity')
  const watchPaymentMethod = form.watch('paymentMethod')

  // Auto-fill product info
  useEffect(() => {
    if (watchCategory === 'product' && watchItemId && watchQuantity) {
      const product = products.find((p) => p.id === watchItemId)
      if (product) {
        form.setValue('description', `Venda: ${product.name}`)
        if (product.price) {
          const total = product.price * (Number(watchQuantity) || 1)
          form.setValue('amount', total.toFixed(2))
        }
      }
    }
  }, [watchItemId, watchCategory, watchQuantity, products, form])

  // Auto-fill service info
  useEffect(() => {
    if (watchCategory === 'service' && watchItemId) {
      const service = services.find((s) => s.id === watchItemId)
      if (service) {
        form.setValue('description', service.name)
      }
    }
  }, [watchItemId, watchCategory, services, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: values.date.toISOString().split('T')[0],
      description: values.description,
      type: values.type,
      amount: Number(values.amount),
      balanceAfter: 0,
      customerId: values.customerId,
      employeeId: values.employeeId,
      employeePayment: values.employeePayment
        ? Number(values.employeePayment)
        : 0,
      itemId: values.itemId,
      itemType:
        values.category === 'other'
          ? undefined
          : (values.category as 'product' | 'service' | 'bonus'),
      quantity: values.quantity ? Number(values.quantity) : undefined,
      paymentMethod: values.paymentMethod as PaymentMethod,
      cardFee: values.cardFee ? Number(values.cardFee) : undefined,
    }

    onAdd(newTransaction)
    form.reset({
      description: '',
      amount: '',
      type: 'entry',
      category: 'service',
      date: new Date(),
      quantity: '1',
      employeePayment: '',
      paymentMethod: 'money',
      cardFee: '',
    })
    setOpen(false)
  }

  const showCardFee =
    watchPaymentMethod === 'credit_card' || watchPaymentMethod === 'debit_card'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 gap-2 h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          Nova Movimentação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Movimentação</DialogTitle>
          <DialogDescription>
            Registre entradas ou saídas e especifique a forma de pagamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        // Reset category based on type
                        if (val === 'entry') {
                          form.setValue('category', 'service')
                        } else {
                          form.setValue('category', 'other')
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry">Entrada</SelectItem>
                        <SelectItem value="exit">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {watchType === 'entry' ? (
                          <>
                            <SelectItem value="service">Serviço</SelectItem>
                            <SelectItem value="product">
                              Venda Produto
                            </SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="bonus">Bônus</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchType === 'entry' && watchCategory === 'product' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Produto..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.stock} un.)
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qtd</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchType === 'entry' && watchCategory === 'service' && (
              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço Realizado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Show Employee/Customer selection for Services OR Bonus */}
            {(watchCategory === 'service' || watchCategory === 'bonus') && (
              <div
                className={
                  watchCategory === 'bonus'
                    ? 'grid grid-cols-1'
                    : 'grid grid-cols-2 gap-4'
                }
              >
                {watchCategory === 'service' && (
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                )}

                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funcionário</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Detalhes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchType === 'entry' && watchCategory === 'service' && (
              <FormField
                control={form.control}
                name="employeePayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repasse Funcionário (R$)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Comissão do profissional.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="money">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="debit_card">
                          Cartão Débito
                        </SelectItem>
                        <SelectItem value="credit_card">
                          Cartão Crédito
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCardFee && (
                <FormField
                  control={form.control}
                  name="cardFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa do Cartão (R$)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Valor descontado pela operadora.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-full">
                Registrar Movimentação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
