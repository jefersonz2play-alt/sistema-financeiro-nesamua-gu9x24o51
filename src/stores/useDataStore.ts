import {
  useState,
  useContext,
  createContext,
  ReactNode,
  createElement,
} from 'react'
import {
  Transaction,
  Employee,
  Product,
  Customer,
  Service,
  Appointment,
} from '@/types'

interface DataContextType {
  transactions: Transaction[]
  employees: Employee[]
  products: Product[]
  customers: Customer[]
  services: Service[]
  appointments: Appointment[]
  monthlyGoal: number
  setMonthlyGoal: (goal: number) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, data: Partial<Transaction>) => void
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, data: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  payEmployee: (id: string, amount: number, transactionIds?: string[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addService: (service: Service) => void
  updateService: (id: string, data: Partial<Service>) => void
  deleteService: (id: string) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Ana Silva',
    pix: '123.456.789-00',
    email: 'ana@nesamua.com',
    password: '123',
    role: 'manager',
    quantities: { s1: 5, s2: 3 },
    paidAmount: 100,
    status: 'partial',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    pix: 'ana.silva@email.com',
    email: 'carlos@nesamua.com',
    password: '123',
    role: 'employee',
    quantities: { s3: 2 },
    paidAmount: 0,
    status: 'open',
    lastUpdated: new Date().toISOString(),
  },
]

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Roberto Santos',
    email: 'roberto@email.com',
    phone: '(11) 99999-1111',
    birthday: new Date('1990-05-15'),
    instagram: '@beto.santos',
  },
  {
    id: 'c2',
    name: 'Julia Lima',
    email: 'julia@email.com',
    phone: '(11) 98888-2222',
    birthday: new Date('1995-10-20'),
    instagram: '@ju_lima',
  },
]

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2026-01-05',
    description: 'Tranças Box Braids',
    type: 'entry',
    amount: 350.0,
    balanceAfter: 350.0,
    customerId: 'c2',
    employeeId: '1',
    employeePayment: 150.0,
    splits: [{ employeeId: '1', amount: 150.0, isPaid: false }],
    itemId: 's1',
    itemType: 'service',
    paymentMethod: 'pix',
  },
  {
    id: '2',
    date: '2026-01-06',
    description: 'Pagamento de Fornecedor (Cabelo)',
    type: 'exit',
    amount: 120.0,
    balanceAfter: 230.0,
    paymentMethod: 'money',
  },
]

const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Box Braids',
    description: 'Tranças soltas com jumbo',
    payout: 100,
  },
  {
    id: 's2',
    name: 'Nagô Desenhada',
    description: 'Trança rasteira com desenho',
    payout: 60,
  },
  {
    id: 's3',
    name: 'Twist',
    description: 'Torcidinho com ou sem extensão',
    payout: 90,
  },
  {
    id: 's4',
    name: 'Manutenção',
    description: 'Manutenção de frente e nuca',
    payout: 50,
  },
]

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Jumbo Premium',
    brand: 'Ser Mulher',
    type: 'Fibra',
    stock: 50,
    price: 35.0,
    purchasePrice: 18.0,
  },
  {
    id: 'p2',
    name: 'Gel Cola',
    brand: 'Arvensis',
    type: 'Finalizador',
    stock: 20,
    price: 45.0,
    purchasePrice: 25.0,
  },
  {
    id: 'p3',
    name: 'Anéis de Trança',
    brand: 'Acessórios',
    type: 'Decoração',
    stock: 100,
    price: 15.0,
    purchasePrice: 2.5,
  },
]

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    customerId: 'c1',
    employeeId: '1',
    serviceId: 's1',
    date: new Date().toISOString(),
    status: 'scheduled',
    notes: 'Cliente prefere atendimento à tarde.',
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
  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [monthlyGoal, setMonthlyGoal] = useState<number>(10000)

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction])

    // Decrement stock if product sale
    if (
      transaction.type === 'entry' &&
      transaction.itemType === 'product' &&
      transaction.itemId &&
      transaction.quantity
    ) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === transaction.itemId
            ? { ...p, stock: p.stock - (transaction.quantity || 0) }
            : p,
        ),
      )
    }
  }

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t)),
    )
  }

  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee])
  }

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp)),
    )
  }

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
  }

  const payEmployee = (
    id: string,
    amount: number,
    transactionIds?: string[],
  ) => {
    const employee = employees.find((e) => e.id === id)
    if (!employee) return

    // Update Employee Status
    updateEmployee(id, {
      paidAmount: employee.paidAmount + amount,
      status: 'paid', // Assuming full payment
      lastUpdated: new Date().toISOString(),
    })

    // Create Expense Transaction
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      description: `Pagamento de Funcionário: ${employee.name}`,
      type: 'exit',
      amount: amount,
      balanceAfter: 0, // Calculated later
      employeeId: id,
      paymentMethod: 'pix',
    }

    addTransaction(transaction)

    // Mark transactions as paid
    if (transactionIds && transactionIds.length > 0) {
      setTransactions((prev) =>
        prev.map((t) => {
          if (!transactionIds.includes(t.id)) return t

          // Handle splits
          if (t.splits && t.splits.length > 0) {
            const newSplits = t.splits.map((s) =>
              s.employeeId === id ? { ...s, isPaid: true } : s,
            )
            return { ...t, splits: newSplits }
          }

          // Handle legacy
          if (t.employeeId === id) {
            return { ...t, isPaid: true }
          }

          return t
        }),
      )
    }
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

  const addAppointment = (appointment: Appointment) => {
    setAppointments((prev) => [...prev, appointment])
  }

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
    )
  }

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
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
        appointments,
        monthlyGoal,
        setMonthlyGoal,
        addTransaction,
        updateTransaction,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        payEmployee,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addService,
        updateService,
        deleteService,
        addAppointment,
        updateAppointment,
        deleteAppointment,
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
