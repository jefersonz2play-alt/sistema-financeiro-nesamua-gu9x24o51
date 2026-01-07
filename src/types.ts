import { TransactionType } from '@/components/cash-flow/TransactionTable'

export type { TransactionType }

export interface Transaction {
  id: string
  date: string
  description: string
  type: TransactionType
  amount: number
  balanceAfter: number
}

export interface Employee {
  id: string
  name: string
  pix: string
  email: string
  password?: string
  quantities: Record<number, number>
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
