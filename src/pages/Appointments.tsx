import { useState } from 'react'
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import useDataStore from '@/stores/useDataStore'
import { Appointment } from '@/types'

const appointmentSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  serviceId: z.string().min(1, 'Selecione um serviço'),
  employeeId: z.string().min(1, 'Selecione um profissional'),
  date: z.date({ required_error: 'Selecione a data' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  notes: z.string().optional(),
})

export default function Appointments() {
  const {
    appointments,
    addAppointment,
    deleteAppointment,
    customers,
    services,
    employees,
  } = useDataStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerId: '',
      serviceId: '',
      employeeId: '',
      date: new Date(),
      time: '09:00',
      notes: '',
    },
  })

  const onSubmit = (values: z.infer<typeof appointmentSchema>) => {
    // Combine date and time
    const dateTime = new Date(values.date)
    const [hours, minutes] = values.time.split(':').map(Number)
    dateTime.setHours(hours, minutes, 0, 0)

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: values.customerId,
      serviceId: values.serviceId,
      employeeId: values.employeeId,
      date: dateTime.toISOString(),
      status: 'scheduled',
      notes: values.notes,
    }

    addAppointment(newAppointment)
    toast({
      title: 'Agendamento Criado',
      description: 'O horário foi reservado com sucesso.',
    })
    setIsDialogOpen(false)
    form.reset()
  }

  const handleDelete = (id: string) => {
    deleteAppointment(id)
    toast({
      title: 'Agendamento Cancelado',
      description: 'O agendamento foi removido da agenda.',
    })
  }

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const getCustomer = (id: string) => customers.find((c) => c.id === id)
  const getService = (id: string) => services.find((s) => s.id === id)
  const getEmployee = (id: string) => employees.find((e) => e.id === id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Agendamentos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a agenda de serviços e atendimentos.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Preencha os dados para agendar um novo serviço.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                            <SelectValue placeholder="Selecione o cliente" />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviço</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profissional</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
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
                                  format(field.value, 'dd/MM/yyyy')
                                ) : (
                                  <span>Selecione</span>
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
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalhes adicionais..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">
                    Agendar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAppointments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          sortedAppointments.map((apt) => {
            const customer = getCustomer(apt.customerId)
            const service = getService(apt.serviceId)
            const employee = getEmployee(apt.employeeId)
            const dateObj = new Date(apt.date)

            return (
              <Card
                key={apt.id}
                className="shadow-subtle border-none hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold">
                      {service?.name || 'Serviço Removido'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(apt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(dateObj, "dd 'de' MMMM", { locale: ptBR })} às{' '}
                    {format(dateObj, 'HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${apt.customerId}`}
                      />
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium leading-none">
                        {customer?.name || 'Cliente Removido'}
                      </p>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${apt.employeeId}`}
                      />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium leading-none">
                        {employee?.name || 'Profissional Removido'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Profissional
                      </p>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="bg-secondary/30 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground italic">
                        "{apt.notes}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
