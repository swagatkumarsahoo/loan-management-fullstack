import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout      from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import DashboardPage      from './pages/DashboardPage'
import MyLoansPage        from './pages/MyLoansPage'
import LoanDetailPage     from './pages/LoanDetailPage'
import LoanApplicationPage from './pages/LoanApplicationPage'
import EMITrackerPage     from './pages/EMITrackerPage'
import PaymentsPage       from './pages/PaymentsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoansPage     from './pages/AdminLoansPage'
import AdminUsersPage     from './pages/AdminUsersPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — all users */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/loans"      element={<MyLoansPage />} />
            <Route path="/loans/apply" element={<LoanApplicationPage />} />
            <Route path="/loans/:id"  element={<LoanDetailPage />} />
            <Route path="/emi"        element={<EMITrackerPage />} />
            <Route path="/payments"   element={<PaymentsPage />} />

            {/* Protected — admin only */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin"        element={<AdminDashboardPage />} />
              <Route path="/admin/loans"  element={<AdminLoansPage />} />
              <Route path="/admin/users"  element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
