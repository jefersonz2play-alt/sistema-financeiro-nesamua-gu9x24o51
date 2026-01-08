import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CalendarClock } from 'lucide-react'

export function PaymentAlert() {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Last day of the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  let alertInfo = { show: false, title: '', description: '', type: '' }

  // 1. Alert on the 14th (One day before the 15th)
  if (currentDay === 14) {
    alertInfo = {
      show: true,
      title: 'Lembrete de Pagamento',
      description:
        'Os pagamentos quinzenais (ciclo 1 a 15) devem ser realizados amanhã (dia 15).',
      type: 'mid-month-warning',
    }
  }
  // 2. Alert on the 15th (Payment Day)
  else if (currentDay === 15) {
    alertInfo = {
      show: true,
      title: 'Dia de Pagamento',
      description: 'Hoje é dia de realizar os pagamentos quinzenais.',
      type: 'mid-month-today',
    }
  }
  // 3. Alert on the Last Day (End of Month Payment)
  else if (currentDay === lastDayOfMonth) {
    alertInfo = {
      show: true,
      title: 'Fechamento de Mês',
      description: 'Hoje é dia de realizar o fechamento mensal e pagamentos.',
      type: 'end-month-today',
    }
  }
  // 4. Alert one day before Last Day
  else if (currentDay === lastDayOfMonth - 1) {
    alertInfo = {
      show: true,
      title: 'Lembrete de Fechamento',
      description:
        'Os pagamentos do segundo ciclo devem ser realizados amanhã (fim do mês).',
      type: 'end-month-warning',
    }
  }

  if (!alertInfo.show) return null

  return (
    <Alert className="mb-6 border-l-4 border-l-amber-500 bg-amber-500/10">
      {alertInfo.title.includes('Lembrete') ? (
        <CalendarClock className="h-4 w-4 text-amber-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-amber-600" />
      )}
      <AlertTitle className="text-amber-800 font-semibold">
        {alertInfo.title}
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        {alertInfo.description}
      </AlertDescription>
    </Alert>
  )
}
