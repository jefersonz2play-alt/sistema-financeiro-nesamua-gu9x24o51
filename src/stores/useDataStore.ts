import {
  useState,
  useContext,
  createContext,
  ReactNode,
  createElement,
} from 'react'
import { Transaction, Employee } from '@/types'

interface DataContextType {
  transactions: Transaction[]
  employees: Employee[]
  addTransaction: (transaction: Transaction) => void
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, data: Partial<Employee>) => void
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2023-10-25',
    description: 'Venda de Serviços',
    type: 'entry',
    amount: 1500.0,
    balanceAfter: 1500.0,
  },
  {
    id: '2',
    date: '2023-10-26',
    description: 'Pagamento de Fornecedor',
    type: 'exit',
    amount: 350.5,
    balanceAfter: 1149.5,
  },
  {
    id: '3',
    date: '2023-10-26',
    description: 'Venda de Produto A',
    type: 'entry',
    amount: 200.0,
    balanceAfter: 1349.5,
  },
  {
    id: '4',
    date: '2023-10-27',
    description: 'Conta de Luz',
    type: 'exit',
    amount: 450.0,
    balanceAfter: 899.5,
  },
]

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Ana Silva',
    pix: '123.456.789-00',
    email: 'ana@airbnb.com',
    password: '123',
    quantities: { 15: 10, 20: 5 },
    paidAmount: 100,
    status: 'partial',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    pix: 'ana.silva@email.com',
    email: 'carlos@airbnb.com',
    password: '123',
    quantities: {},
    paidAmount: 0,
    status: 'open',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mariana Santos',
    pix: '11999998888',
    email: 'mariana@airbnb.com',
    password: '123',
    quantities: {},
    paidAmount: 0,
    status: 'open',
    lastUpdated: new Date().toISOString(),
  },
]

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)

  const addTransaction = (transaction: Transaction) => {
    // Recalculate balance logic needs to happen in the component or here.
    // For simplicity, we assume the component passes correct data or we just append.
    // In a real app, we would recalculate everything.
    // Here we just append. The Index page logic recalculates derived balances for display.
    setTransactions((prev) => [...prev, transaction])
  }

  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee])
  }

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp)),
    )
  }

  return createElement(
    DataContext.Provider,
    {
      value: {
        transactions,
        employees,
        addTransaction,
        addEmployee,
        updateEmployee,
      },
    },
    children,
  )
}

export default function useDataStore() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataStore must be used within a DataProvider')
  }
  return context
}
