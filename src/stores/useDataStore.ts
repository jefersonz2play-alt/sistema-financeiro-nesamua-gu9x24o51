import {
  useState,
  useContext,
  createContext,
  ReactNode,
  createElement,
} from 'react'
import { Transaction, Employee, Product, Customer, Service } from '@/types'

interface DataContextType {
  transactions: Transaction[]
  employees: Employee[]
  products: Product[]
  customers: Customer[]
  services: Service[]
  addTransaction: (transaction: Transaction) => void
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, data: Partial<Employee>) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addService: (service: Service) => void
  updateService: (id: string, data: Partial<Service>) => void
  deleteService: (id: string) => void
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
]

const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Corte Masculino',
    description: 'Corte tradicional com tesoura ou máquina',
    payout: 30,
  },
  {
    id: 's2',
    name: 'Barba',
    description: 'Modelagem de barba com toalha quente',
    payout: 25,
  },
  {
    id: 's3',
    name: 'Corte + Barba',
    description: 'Combo completo',
    payout: 50,
  },
  {
    id: 's4',
    name: 'Acabamento',
    description: 'Pézinho e contornos',
    payout: 15,
  },
]

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Ana Silva',
    pix: '123.456.789-00',
    email: 'ana@airbnb.com',
    password: '123',
    quantities: { s1: 5, s2: 3 },
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
    quantities: { s3: 2 },
    paidAmount: 0,
    status: 'open',
    lastUpdated: new Date().toISOString(),
  },
]

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Shampoo Mentolado',
    brand: 'FreshMen',
    type: 'Cabelo',
  },
  {
    id: 'p2',
    name: 'Óleo para Barba',
    brand: 'Barbudo',
    type: 'Barba',
  },
  {
    id: 'p3',
    name: 'Pomada Modeladora',
    brand: 'StyleFix',
    type: 'Finalização',
  },
]

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Roberto Santos',
    email: 'roberto@email.com',
    phone: '(11) 99999-1111',
    birthday: new Date('1990-05-15'),
  },
  {
    id: 'c2',
    name: 'Julia Lima',
    email: 'julia@email.com',
    phone: '(11) 98888-2222',
    birthday: new Date('1995-10-20'),
  },
]

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS)
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES)

  const addTransaction = (transaction: Transaction) => {
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

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product])
  }

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const addCustomer = (customer: Customer) => {
    setCustomers((prev) => [...prev, customer])
  }

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    )
  }

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  const addService = (service: Service) => {
    setServices((prev) => [...prev, service])
  }

  const updateService = (id: string, data: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    )
  }

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  return createElement(
    DataContext.Provider,
    {
      value: {
        transactions,
        employees,
        products,
        customers,
        services,
        addTransaction,
        addEmployee,
        updateEmployee,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addService,
        updateService,
        deleteService,
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
