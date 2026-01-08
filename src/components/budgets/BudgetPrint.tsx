import { Budget, Customer } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

interface BudgetPrintProps {
  budget: Budget
  customer?: Customer
}

export function BudgetPrint({ budget, customer }: BudgetPrintProps) {
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'money':
        return 'Dinheiro'
      case 'pix':
        return 'PIX'
      case 'link':
        return 'Link de Pagamento'
      case 'debit_card':
        return 'Cartão de Débito'
      case 'credit_card':
        return 'Cartão de Crédito'
      default:
        return method
    }
  }

  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-[210mm] mx-auto h-full">
      <div className="flex justify-between items-start border-b-2 border-primary/20 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden">
            <img
              src="https://img.usecurling.com/i?q=braid%20wreath&color=rose"
              alt="NesaMua Logo"
              className="w-16 h-16 object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Studio Nesamua
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Tranças Afro & Estilo
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-light text-primary/80 mb-2">
            Orçamento
          </h2>
          <p className="text-gray-500 font-mono">#{budget.id.toUpperCase()}</p>
          <p className="text-sm text-gray-500 mt-1">
            Data: {format(new Date(budget.createdAt), 'dd/MM/yyyy')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Cliente
          </h3>
          <p className="text-xl font-semibold text-gray-900">
            {customer?.name || 'Cliente não identificado'}
          </p>
          <p className="text-gray-600">{customer?.email}</p>
          <p className="text-gray-600">{customer?.phone}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Detalhes do Agendamento
          </h3>
          {budget.scheduledDate ? (
            <p className="text-lg text-gray-800">
              {format(new Date(budget.scheduledDate), 'dd/MM/yyyy - HH:mm')}
            </p>
          ) : (
            <p className="text-gray-500 italic">Data não agendada</p>
          )}
          <p className="text-gray-600 mt-1">
            Pagamento via {getPaymentMethodLabel(budget.paymentMethod)}
          </p>
        </div>
      </div>

      <div className="mb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-bold text-gray-500 uppercase">
                Item
              </th>
              <th className="text-center py-3 px-2 text-sm font-bold text-gray-500 uppercase">
                Qtd
              </th>
              <th className="text-right py-3 px-2 text-sm font-bold text-gray-500 uppercase">
                Preço Unit.
              </th>
              <th className="text-right py-3 px-2 text-sm font-bold text-gray-500 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {budget.items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-4 px-2">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <span className="text-xs text-gray-500 uppercase px-2 py-0.5 bg-gray-100 rounded-full">
                    {item.type === 'service' ? 'Serviço' : 'Produto'}
                  </span>
                </td>
                <td className="text-center py-4 px-2 text-gray-600">
                  {item.quantity}
                </td>
                <td className="text-right py-4 px-2 text-gray-600">
                  {formatCurrency(item.price)}
                </td>
                <td className="text-right py-4 px-2 font-medium text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-16">
        <div className="w-1/2 bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(budget.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(budget.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 text-center border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 mb-1">
          Logradouro R ISMAR ARAUJO 7 E SALA 7 E, Bairro Pau da Lima CEP.
          41235-010. Município Salvador. UF BA
        </p>
        <p className="text-xs text-gray-500 font-medium">
          Telefone: (71) 99620-6191 | Instagram: @nesamua
        </p>
      </div>
    </div>
  )
}
