import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UserPlus, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import useDataStore from '@/stores/useDataStore'
import { Employee } from '@/types'

const employeeSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Insira um email válido.' }),
  pix: z.string().min(5, { message: 'Chave PIX inválida.' }),
  password: z
    .string()
    .min(4, { message: 'A senha deve ter pelo menos 4 caracteres.' }),
})

export default function RegisterEmployee() {
  const { addEmployee } = useDataStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      pix: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof employeeSchema>) {
    setIsSubmitting(true)

    // Simulate API Call
    setTimeout(() => {
      const newEmployee: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        name: values.name,
        email: values.email,
        pix: values.pix,
        password: values.password,
        quantities: {},
        paidAmount: 0,
        status: 'open',
        lastUpdated: new Date().toISOString(),
      }

      addEmployee(newEmployee)

      toast({
        title: 'Funcionário cadastrado!',
        description: `${values.name} foi adicionado ao sistema com sucesso.`,
      })

      setIsSubmitting(false)
      navigate('/payments')
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Novo Funcionário
        </h1>
        <p className="text-muted-foreground mt-2">
          Cadastre novos membros da equipe e credenciais de acesso.
        </p>
      </div>

      <Card className="shadow-subtle border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Dados do Colaborador
          </CardTitle>
          <CardDescription>
            Preencha as informações abaixo para criar uma nova conta de
            funcionário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
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
                      <FormLabel>Email (Usuário de Acesso)</FormLabel>
                      <FormControl>
                        <Input placeholder="joao@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave PIX</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CPF, Email ou Telefone"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Utilizada para realizar os pagamentos.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha de Acesso</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Senha inicial para o funcionário acessar o sistema.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full px-8"
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : 'Cadastrar Funcionário'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
