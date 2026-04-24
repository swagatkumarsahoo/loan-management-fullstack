import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, CreditCard, Calendar, Receipt,
  Users, ShieldCheck, LogOut, Zap, ChevronRight
} from 'lucide-react'

const userNav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/loans',       icon: CreditCard,       label: 'My Loans' },
  { to: '/emi',         icon: Calendar,         label: 'EMI Tracker' },
  { to: '/payments',    icon: Receipt,          label: 'Payments' },
]

const adminNav = [
  { to: '/admin',        icon: ShieldCheck,     label: 'Admin Panel' },
  { to: '/admin/loans',  icon: CreditCard,      label: 'All Loans' },
  { to: '/admin/users',  icon: Users,           label: 'Users' },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-ink-800 border-r border-ink-700">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-ink-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-jade flex items-center justify-center">
            <Zap size={16} className="text-ink-900" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-lg text-ink-50">LoanSpark</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-widest px-3 mb-2">Menu</p>
        {userNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-widest px-3 mb-2 mt-5">Admin</p>
            {adminNav.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end
                className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-ink-700 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-ink-700/50">
          <div className="w-7 h-7 rounded-full bg-jade/20 flex items-center justify-center flex-shrink-0">
            <span className="text-jade font-semibold text-xs">
              {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-100 truncate">{user?.fullName}</p>
            <p className="text-[10px] text-ink-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="sidebar-link w-full text-rose/70 hover:text-rose hover:bg-rose/10">
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
