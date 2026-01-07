import {
  useState,
  useContext,
  createContext,
  ReactNode,
  createElement,
} from 'react'
import { User } from '@/types'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // We can use a ref or just state for navigation, but context usually doesn't navigate itself.
  // However, for convenience we can expose the state.

  const login = (userData: User) => {
    setUser(userData)
    // Persist to local storage in a real app
  }

  const logout = () => {
    setUser(null)
  }

  return createElement(
    AuthContext.Provider,
    { value: { user, login, logout, isAuthenticated: !!user } },
    children,
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within a AuthProvider')
  }
  return context
}
