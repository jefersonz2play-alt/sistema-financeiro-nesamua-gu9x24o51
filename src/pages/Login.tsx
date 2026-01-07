import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'
import useDataStore from '@/stores/useDataStore'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const { employees } = useDataStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate network delay
    setTimeout(() => {
      // Hardcoded Admin
      if (email === 'admin@airbnb.com' && password === 'admin') {
        login({
          id: 'admin',
          name: 'Administrador',
          email: 'admin@airbnb.com',
          role: 'manager',
        })
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
        })
        navigate('/')
        return
      }

      // Check Employees
      const employee = employees.find(
        (emp) => emp.email === email && emp.password === password,
      )
      if (employee) {
        login({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: 'employee',
        })
        toast({
          title: `Olá, ${employee.name}`,
          description: 'Login realizado com sucesso.',
        })
        navigate('/dashboard')
        return
      }

      // Login Failed
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description: 'Credenciais inválidas. Verifique seu e-mail e senha.',
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary">
              <img
                src="https://img.usecurling.com/i?q=braids&color=rose"
                alt="Logo"
                className="w-10 h-10 opacity-90"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-display font-bold tracking-tight text-foreground">
            Studio Nesamua
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Sistema Financeiro & Gestão
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-secondary/50 border-input focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-secondary/50 border-input focus:border-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Acessar Sistema'
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground/60 space-y-1">
              <p>Credenciais Demo:</p>
              <p className="font-mono text-xs">
                Admin: admin@airbnb.com / admin
              </p>
              <p className="font-mono text-xs">Func: ana@airbnb.com / 123</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
