import { useEffect, useState } from 'react'
import { adminAPI } from '../api/api'
import { StatCard, PageLoader } from '../components/ui'
import { fmt } from '../utils/helpers'
import { Users, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Clock, XCircle, Wallet } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#F5A623', '#00C37A', '#3B9EFF', '#FF4D6D', '#6B7592']

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const pieData = [
    { name: 'Pending',  value: stats?.pendingLoans        ?? 0 },
    { name: 'Active',   value: stats?.activeLoans         ?? 0 },
    { name: 'Approved', value: stats?.totalApprovedLoans  ?? 0 },
    { name: 'Rejected', value: stats?.totalRejectedLoans  ?? 0 },
    { name: 'Closed',   value: stats?.closedLoans         ?? 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Admin Dashboard</h1>
        <p className="text-sm text-ink-400 mt-0.5">System-wide overview</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"    value={fmt.number(stats?.totalUsers)}         icon={Users}        accent="sky" />
        <StatCard label="Total Loans"    value={fmt.number(stats?.totalLoans)}          icon={CreditCard}   accent="jade" />
        <StatCard label="Disbursed"      value={fmt.currency(stats?.totalDisbursedAmount)} icon={Wallet}    accent="amber" />
        <StatCard label="Overdue EMIs"   value={fmt.number(stats?.overdueEMIs)}         icon={AlertTriangle} accent="rose" />
      </div>

      {/* Loan status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 card p-5">
          <p className="section-title mb-4">Loan distribution</p>
          {pieData.length === 0 ? (
            <p className="text-ink-500 text-sm text-center py-10">No loan data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'loans']}
                  contentStyle={{ background: '#222840', border: '1px solid #333B55', borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: '#9AA2B8', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status cards */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4 content-start">
          {[
            { label: 'Pending review',  value: stats?.pendingLoans,       icon: Clock,         accent: 'amber' },
            { label: 'Active loans',    value: stats?.activeLoans,         icon: TrendingUp,    accent: 'jade'  },
            { label: 'Total approved',  value: stats?.totalApprovedLoans,  icon: CheckCircle2,  accent: 'sky'   },
            { label: 'Rejected',        value: stats?.totalRejectedLoans,  icon: XCircle,       accent: 'rose'  },
          ].map(s => (
            <StatCard key={s.label} {...s} value={fmt.number(s.value)} />
          ))}
        </div>
      </div>
    </div>
  )
}
