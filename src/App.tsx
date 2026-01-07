import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import EmployeePayments from './pages/EmployeePayments'
import EmployeeDashboard from './pages/EmployeeDashboard'
import RegisterEmployee from './pages/RegisterEmployee'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { AuthProvider } from '@/stores/useAuthStore'
import { DataProvider } from '@/stores/useDataStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <DataProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Manager Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <EmployeePayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/new"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <RegisterEmployee />
                  </ProtectedRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </DataProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
