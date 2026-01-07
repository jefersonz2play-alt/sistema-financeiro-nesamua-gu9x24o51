import { useState } from 'react'
import { Plus, Pencil, Trash2, Scissors } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast'
import useDataStore from '@/stores/useDataStore'
import { Service } from '@/types'
import { formatCurrency } from '@/lib/utils'

const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  payout: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'O valor deve ser um número positivo.',
  }),
})

export default function Services() {
  const { services, addService, updateService, deleteService } = useDataStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      payout: '',
    },
  })

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      form.reset({
        name: service.name,
        description: service.description,
        payout: service.payout.toString(),
      })
    } else {
      setEditingService(null)
      form.reset({
        name: '',
        description: '',
        payout: '',
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = (values: z.infer<typeof serviceSchema>) => {
    const serviceData = {
      name: values.name,
      description: values.description,
      payout: Number(values.payout),
    }

    if (editingService) {
      updateService(editingService.id, serviceData)
      toast({
        title: 'Serviço atualizado',
        description: 'As configurações do serviço foram salvas.',
      })
    } else {
      addService({
        id: Math.random().toString(36).substr(2, 9),
        ...serviceData,
      })
      toast({
        title: 'Serviço criado',
        description: 'Novo serviço disponível para os funcionários.',
      })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteService(id)
    toast({
      title: 'Serviço removido',
      description: 'O serviço foi removido do catálogo.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            Serviços
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure os serviços oferecidos e o valor de repasse aos
            funcionários.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="rounded-full shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle>Catálogo de Serviços</CardTitle>
          <CardDescription>
            Defina aqui o valor que será pago ao funcionário por cada serviço
            realizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Comissão (Payout)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum serviço cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.description}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(service.payout)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O serviço{' '}
                                <strong>{service.name}</strong> será removido.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(service.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              Detalhes do serviço e configuração de pagamento.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Corte Degrade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Máquina e tesoura" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor de Repasse (R$)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Valor que será pago ao funcionário por este serviço.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">
                  {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
