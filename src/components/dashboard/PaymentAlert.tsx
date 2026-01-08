import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CalendarClock } from 'lucide-react'
import { useMemo } from 'react'

export function PaymentAlert() {
  const alertInfo = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Last day of the current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Alert logic for 15th (Trigger on 14th)
    if (currentDay === 14) {
      return {
        show: true,
        title: 'Lembrete de Pagamento',
        description:
          'Os pagamentos quinzenais (ciclo 1 a 15) devem ser realizados amanhã (dia 15).',
        type: 'mid-month',
      }
    }

    // Alert logic for End of Month (Trigger 1 day before last day)
    // E.g., if last day is 30, trigger on 29
    if (currentDay === lastDayOfMonth - 1) {
      return {
        show: true,
        title: 'Fechamento de Mês',
        description: `Os pagamentos do segundo ciclo (16 a ${lastDayOfMonth}) devem ser realizados amanhã.`,
        type: 'end-month',
      }
    }

    // Show on the day of payment as well
    if (currentDay === 15) {
      return {
        show: true,
        title: 'Dia de Pagamento',
        description: 'Hoje é dia de realizar os pagamentos quinzenais.',
        type: 'mid-month-today',
      }
    }

    if (currentDay === lastDayOfMonth) {
      return {
        show: true,
        title: 'Dia de Pagamento',
        description:
          'Hoje é dia de realizar o fechamento mensal dos pagamentos.',
        type: 'end-month-today',
      }
    }

    return { show: false, title: '', description: '', type: '' }
  }, [])

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
