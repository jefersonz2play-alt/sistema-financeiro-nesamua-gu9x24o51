import { TransactionType } from '@/components/cash-flow/TransactionTable'

export type { TransactionType }

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
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  birthday: Date
}

export interface Service {
  id: string
  name: string
  description: string
  payout: number
}
