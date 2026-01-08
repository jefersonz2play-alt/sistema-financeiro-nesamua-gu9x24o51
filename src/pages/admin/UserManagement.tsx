import { useState } from 'react'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Navigate } from 'react-router-dom'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import useDataStore from '@/stores/useDataStore'
import useAuthStore from '@/stores/useAuthStore'
import { Employee } from '@/types'

const userSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  pix: z.string().min(5, { message: 'Chave PIX inválida' }),
  password: z
    .string()
    .min(4, { message: 'A senha deve ter pelo menos 4 caracteres' }),
  role: z.enum(['manager', 'employee'], {
    required_error: 'Selecione uma função',
  }),
})

export default function UserManagement() {
  const { user } = useAuthStore()
  const { employees, addEmployee, updateEmployee, deleteEmployee } =
    useDataStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Employee | null>(null)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      pix: '',
      password: '',
      role: 'employee',
    },
  })

  // Restricted Access Control
  if (user?.email !== 'admin@airbnb.com') {
    return <Navigate to="/" replace />
  }

  const handleOpenDialog = (userToEdit?: Employee) => {
    if (userToEdit) {
      setEditingUser(userToEdit)
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        pix: userToEdit.pix,
        password: userToEdit.password || '',
        role: userToEdit.role,
      })
    } else {
      setEditingUser(null)
      form.reset({
        name: '',
        email: '',
        pix: '',
        password: '',
        role: 'employee',
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = (values: z.infer<typeof userSchema>) => {
    if (editingUser) {
      updateEmployee(editingUser.id, {
        name: values.name,
        email: values.email,
        pix: values.pix,
        password: values.password,
        role: values.role,
      })
      toast({
        title: 'Usuário atualizado',
        description: 'Permissões e dados foram salvos com sucesso.',
      })
    } else {
      const newUser: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        name: values.name,
        email: values.email,
        pix: values.pix,
        password: values.password,
        role: values.role,
        quantities: {},
        paidAmount: 0,
        status: 'open',
        lastUpdated: new Date().toISOString(),
      }
      addEmployee(newUser)
      toast({
        title: 'Usuário criado',
        description: 'Novo usuário adicionado ao sistema.',
      })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteEmployee(id)
    toast({
      title: 'Usuário removido',
      description: 'O usuário foi excluído permanentemente.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground mt-2">
            Administre contas, permissões e acesso ao sistema.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="rounded-full shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Lista completa de funcionários e administradores registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          emp.role === 'manager' ? 'default' : 'secondary'
                        }
                        className={
                          emp.role === 'manager'
                            ? 'bg-primary/80 hover:bg-primary/90'
                            : ''
                        }
                      >
                        {emp.role === 'manager' ? (
                          <div className="flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Gerente
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Funcionário
                          </div>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {emp.pix}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(emp)}
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
                                Esta ação removerá o acesso de{' '}
                                <strong>{emp.name}</strong> ao sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(emp.id)}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              Defina as credenciais e nível de acesso do usuário.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ana Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Login)</FormLabel>
                    <FormControl>
                      <Input placeholder="ana@nesamua.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função (Acesso)</FormLabel>
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
                          <SelectItem value="employee">Funcionário</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Gerentes têm acesso total.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave PIX</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF, Email ou Celular" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
