import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Pencil, Trash2, UserPlus } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

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
    splits: z
      .array(
        z.object({
          employeeId: z.string().min(1, 'Selecione o funcionário'),
          amount: z
            .string()
            .min(1, 'Informe o valor')
            .refine(
              (val) => !isNaN(Number(val)) && Number(val) >= 0,
              'Deve ser número positivo',
            ),
        }),
      )
      .optional(),
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
        if (!data.splits || data.splits.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Adicione pelo menos um funcionário.',
            path: ['splits'],
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
      if (
        data.category === 'bonus' &&
        (!data.splits || data.splits.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione o funcionário para o bônus.',
          path: ['splits'],
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

interface EditTransactionDialogProps {
  transaction: Transaction
}

export function EditTransactionDialog({
  transaction,
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const { customers, employees, products, services, updateTransaction } =
    useDataStore()
  const { toast } = useToast()

  const getInitialCategory = (t: Transaction) => {
    if (t.itemType === 'service') return 'service'
    if (t.itemType === 'product') return 'product'
    if (t.itemType === 'bonus') return 'bonus'
    return 'other'
  }

  // Construct initial splits from transaction or fallback to legacy fields
  const getInitialSplits = (t: Transaction) => {
    if (t.splits && t.splits.length > 0) {
      return t.splits.map((s) => ({
        employeeId: s.employeeId,
        amount: s.amount.toString(),
      }))
    }
    if (t.employeeId) {
      return [
        {
          employeeId: t.employeeId,
          amount: (t.employeePayment || 0).toString(),
        },
      ]
    }
    return [{ employeeId: '', amount: '' }]
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: getInitialCategory(transaction),
      date: new Date(transaction.date + 'T12:00:00'),
      paymentMethod: transaction.paymentMethod || 'money',
      cardFee: transaction.cardFee?.toString() || '',
      customerId: transaction.customerId,
      splits: getInitialSplits(transaction),
      itemId: transaction.itemId,
      quantity: transaction.quantity?.toString() || '1',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'splits',
  })

  // Reset form when transaction updates
  useEffect(() => {
    if (open) {
      form.reset({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: getInitialCategory(transaction),
        date: new Date(transaction.date + 'T12:00:00'),
        paymentMethod: transaction.paymentMethod || 'money',
        cardFee: transaction.cardFee?.toString() || '',
        customerId: transaction.customerId,
        splits: getInitialSplits(transaction),
        itemId: transaction.itemId,
        quantity: transaction.quantity?.toString() || '1',
      })
    }
  }, [transaction, open, form])

  const watchType = form.watch('type')
  const watchCategory = form.watch('category')
  const watchItemId = form.watch('itemId')
  const watchQuantity = form.watch('quantity')
  const watchPaymentMethod = form.watch('paymentMethod')

  // Auto-fill product info on change
  useEffect(() => {
    if (
      watchCategory === 'product' &&
      watchItemId &&
      watchQuantity &&
      open &&
      watchItemId !== transaction.itemId
    ) {
      const product = products.find((p) => p.id === watchItemId)
      if (product) {
        form.setValue('description', `Venda: ${product.name}`)
        if (product.price) {
          const total = product.price * (Number(watchQuantity) || 1)
          form.setValue('amount', total.toFixed(2))
        }
      }
    }
  }, [
    watchItemId,
    watchCategory,
    watchQuantity,
    products,
    form,
    open,
    transaction.itemId,
  ])

  // Auto-fill service info on change
  useEffect(() => {
    if (
      watchCategory === 'service' &&
      watchItemId &&
      open &&
      watchItemId !== transaction.itemId
    ) {
      const service = services.find((s) => s.id === watchItemId)
      if (service) {
        form.setValue('description', service.name)
        // If there's only one split and it's empty/default, pre-fill it
        if (fields.length === 1 && !fields[0].employeeId && service.payout) {
          form.setValue(`splits.0.amount`, service.payout.toString())
        }
      }
    }
  }, [
    watchItemId,
    watchCategory,
    services,
    form,
    open,
    transaction.itemId,
    fields.length,
  ])

  function onSubmit(values: z.infer<typeof formSchema>) {
    const primarySplit = values.splits?.[0]

    const updatedTransaction: Partial<Transaction> = {
      date: values.date.toISOString().split('T')[0],
      description: values.description,
      type: values.type,
      amount: Number(values.amount),
      customerId: values.customerId,
      // Legacy fields
      employeeId: primarySplit?.employeeId,
      employeePayment: primarySplit?.amount ? Number(primarySplit.amount) : 0,
      // New Splits
      splits: values.splits?.map((s) => ({
        employeeId: s.employeeId,
        amount: Number(s.amount),
      })),
      itemId: values.itemId,
      itemType:
        values.category === 'other'
          ? undefined
          : (values.category as 'product' | 'service' | 'bonus'),
      quantity: values.quantity ? Number(values.quantity) : undefined,
      paymentMethod: values.paymentMethod as PaymentMethod,
      cardFee: values.cardFee ? Number(values.cardFee) : undefined,
    }

    updateTransaction(transaction.id, updatedTransaction)
    toast({
      title: 'Movimentação atualizada',
      description: 'As informações foram salvas com sucesso.',
    })
    setOpen(false)
  }

  const showCardFee =
    watchPaymentMethod === 'credit_card' || watchPaymentMethod === 'debit_card'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Movimentação</DialogTitle>
          <DialogDescription>
            Atualize as informações da movimentação financeira.
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
                        if (val === 'entry') {
                          form.setValue('category', 'service')
                        } else {
                          form.setValue('category', 'other')
                        }
                      }}
                      value={field.value}
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Produto..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            {(watchCategory === 'service' || watchCategory === 'bonus') && (
              <div className="space-y-4">
                {watchCategory === 'service' && (
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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

                {/* Dynamic Employees Fields */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Profissionais e Repasses</FormLabel>
                    {fields.length < 4 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-primary"
                        onClick={() => append({ employeeId: '', amount: '' })}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Adicionar ({fields.length}/4)
                      </Button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-6 gap-2 items-end"
                    >
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`splits.${index}.employeeId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Funcionário" />
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
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`splits.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="R$ Valor"
                                  type="number"
                                  className={cn(
                                    watchType === 'entry'
                                      ? 'focus-visible:ring-emerald-400'
                                      : 'focus-visible:ring-rose-400',
                                  )}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end pb-2">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <FormMessage>
                    {form.formState.errors.splits?.message ||
                      form.formState.errors.splits?.root?.message}
                  </FormMessage>
                </div>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
