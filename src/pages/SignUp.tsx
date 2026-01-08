import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, ArrowLeft, User, Mail, Lock, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import useDataStore from '@/stores/useDataStore'
import { Employee } from '@/types'

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
    email: z.string().email({ message: 'Insira um email válido.' }),
    pix: z.string().min(5, { message: 'Chave PIX inválida.' }),
    password: z
      .string()
      .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const { addEmployee, employees } = useDataStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      pix: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true)

    // Simulate Network Delay
    setTimeout(() => {
      // Check if email already exists
      const existingUser = employees.find((e) => e.email === values.email)

      if (existingUser) {
        toast({
          variant: 'destructive',
          title: 'Erro no cadastro',
          description: 'Este email já está sendo utilizado.',
        })
        setIsLoading(false)
        return
      }

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
        title: 'Conta criada!',
        description:
          'Seu cadastro foi realizado com sucesso. Faça login para continuar.',
      })

      setIsLoading(false)
      navigate('/login')
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card animate-fade-in my-auto">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary">
              <img
                src="https://img.usecurling.com/i?q=braids&color=rose"
                alt="Logo Studio Nesamua"
                className="w-10 h-10 opacity-90"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold tracking-tight text-foreground">
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Junte-se ao Studio Nesamua e gerencie suas finanças.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Ex: Ana Silva"
                          className="pl-10 h-11 bg-secondary/50 border-input focus:border-primary"
                          {...field}
                        />
                      </div>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="ana@exemplo.com"
                          className="pl-10 h-11 bg-secondary/50 border-input focus:border-primary"
                          {...field}
                        />
                      </div>
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
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="CPF, Email ou Telefone"
                          className="pl-10 h-11 bg-secondary/50 border-input focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••"
                            className="pl-10 h-11 bg-secondary/50 border-input focus:border-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••"
                            className="pl-10 h-11 bg-secondary/50 border-input focus:border-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6 flex-col gap-2">
          <p className="text-sm text-muted-foreground">Já tem uma conta?</p>
          <Button
            variant="link"
            asChild
            className="text-primary hover:text-primary/80 font-semibold p-0 h-auto"
          >
            <Link to="/login">Faça login aqui</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
