import { TransactionType } from '@/components/cash-flow/TransactionTable'

export type { TransactionType }

export type PaymentMethod =
  | 'money'
  | 'pix'
  | 'link'
  | 'debit_card'
  | 'credit_card'

export interface Transaction {
  id: string
  date: string
  description: string
  type: TransactionType
  amount: number
  balanceAfter: number
  customerId?: string // Linked customer
  employeeId?: string // Linked employee
  employeePayment?: number // Payment allocated to employee
  itemId?: string // Linked product or service ID
  itemType?: 'product' | 'service' // Type of item
  quantity?: number // Quantity sold (for products)
  paymentMethod?: PaymentMethod
  cardFee?: number
}

export interface Appointment {
  id: string
  customerId: string
  serviceId: string
  employeeId: string
  date: string // ISO string for date and time
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export interface Employee {
  id: string
  name: string
  pix: string
  email: string
  password?: string
  quantities: Record<string, number> // key is Service ID
  paidAmount: number
  status: 'paid' | 'partial' | 'open'
  lastUpdated?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'manager' | 'employee'
}

export interface Product {
  id: string
  name: string
  brand: string
  type: string
  stock: number
  price?: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  birthday: Date
  instagram?: string
}

export interface Service {
  id: string
  name: string
  description: string
  payout: number
}
