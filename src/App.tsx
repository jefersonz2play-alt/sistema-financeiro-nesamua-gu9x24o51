import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import EmployeePayments from './pages/EmployeePayments'
import EmployeeDashboard from './pages/EmployeeDashboard'
import RegisterEmployee from './pages/RegisterEmployee'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Services from './pages/Services'
import Appointments from './pages/Appointments'
import ManagerDashboard from './pages/ManagerDashboard'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import AttendanceReport from './pages/reports/AttendanceReport'
import SalesReport from './pages/reports/SalesReport'
import EmployeeReport from './pages/reports/EmployeeReport'
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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

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
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
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
                path="/products"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Services />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Appointments />
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

              {/* Reports */}
              <Route
                path="/reports/attendance"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <AttendanceReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/sales"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <SalesReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/employees"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <EmployeeReport />
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
