import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI, loanAPI } from '../api/api'
import { StatCard, PageLoader, EmptyState } from '../components/ui'
import { fmt, loanStatusBadge, loanTypeLabel } from '../utils/helpers'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { CreditCard, TrendingUp, Wallet, CheckCircle, PlusCircle, Calendar } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-700 border border-ink-600 rounded-xl p-3 text-xs shadow-lg">
      <p className="text-ink-300 mb-1">{label}</p>
      <p className="text-jade font-semibold">{fmt.currency(payload[0].value)}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats,  setStats]  = useState(null)
  const [loans,  setLoans]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.getMyDashboard(),
      loanAPI.getMyLoans({ page: 0, size: 5 }),
    ]).then(([s, l]) => {
      setStats(s.data.data)
      setLoans(l.data.data.content ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const chartData = [
    { name: 'Borrowed',    value: stats?.totalAmountBorrowed ?? 0 },
    { name: 'Paid',        value: stats?.totalAmountPaid     ?? 0 },
    { name: 'Outstanding', value: stats?.totalOutstanding    ?? 0 },
  ]
  const COLORS = ['#3B9EFF', '#00C37A', '#F5A623']

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-50">
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'},{' '}
            <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-ink-400 mt-0.5">Here's your credit overview</p>
        </div>
        <Link to="/loans/apply" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> Apply for Loan
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Loans"   value={stats?.activeLoans  ?? 0} icon={CreditCard}   accent="jade" />
        <StatCard label="Pending"        value={stats?.pendingLoans ?? 0} icon={Calendar}     accent="amber" />
        <StatCard label="Total Borrowed" value={fmt.currency(stats?.totalAmountBorrowed)} icon={TrendingUp} accent="sky" />
        <StatCard label="Total Paid"     value={fmt.currency(stats?.totalAmountPaid)}     icon={CheckCircle} accent="jade" />
      </div>

      {/* Chart + Recent loans */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar chart */}
        <div className="card p-5 lg:col-span-2">
          <p className="section-title mb-4">Financial summary</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="35%">
              <XAxis dataKey="name" tick={{ fill: '#6B7592', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent loans */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Recent loans</p>
            <Link to="/loans" className="text-xs text-jade hover:text-jade-300 transition-colors">View all →</Link>
          </div>

          {loans.length === 0 ? (
            <EmptyState icon={CreditCard} title="No loans yet"
              description="Apply for your first loan to get started"
              action={<Link to="/loans/apply" className="btn-primary text-sm py-2 px-4">Apply now</Link>} />
          ) : (
            <div className="space-y-2">
              {loans.map(loan => (
                <Link key={loan.id} to={`/loans/${loan.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-ink-700/50 hover:bg-ink-700 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-ink-600 flex items-center justify-center text-base">
                      {loan.loanType === 'HOME_LOAN' ? '🏠' : loan.loanType === 'CAR_LOAN' ? '🚗' : loan.loanType === 'EDUCATION_LOAN' ? '🎓' : '💳'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-100">{loanTypeLabel(loan.loanType).replace(/^.+? /, '')}</p>
                      <p className="text-xs text-ink-400">{fmt.currency(loan.principalAmount)} · {loan.tenureMonths}m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={loanStatusBadge(loan.status)}>{loan.status}</span>
                    <span className="text-ink-600 group-hover:text-ink-400 transition-colors text-xs">›</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { to: '/loans/apply', icon: PlusCircle, label: 'New loan application',  sub: 'Check eligibility instantly', color: 'jade' },
          { to: '/emi',         icon: Calendar,   label: 'Track EMI schedule',     sub: 'View upcoming instalments',  color: 'sky' },
          { to: '/payments',    icon: Wallet,      label: 'Payment history',        sub: 'All transactions',           color: 'amber' },
        ].map(({ to, icon: Icon, label, sub, color }) => (
          <Link key={to} to={to} className="card-hover p-5 flex items-center gap-4 group">
            <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={`text-${color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-100 group-hover:text-ink-50 transition-colors">{label}</p>
              <p className="text-xs text-ink-400">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
