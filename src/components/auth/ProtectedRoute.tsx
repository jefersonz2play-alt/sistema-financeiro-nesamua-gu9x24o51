import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('manager' | 'employee')[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect based on role if they try to access unauthorized page
      if (user.role === 'employee') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    }
  }, [isAuthenticated, user, navigate, allowedRoles])

  if (!isAuthenticated) return null

  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
