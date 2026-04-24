import { useEffect, useState } from 'react'
import { adminAPI } from '../api/api'
import { PageHeader, PageLoader, EmptyState } from '../components/ui'
import { fmt, getErrorMessage } from '../utils/helpers'
import { Users, UserX, ShieldCheck, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    adminAPI.getAllUsers()
      .then(res => setUsers(res.data.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const deactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}? They will lose login access.`)) return
    try {
      await adminAPI.deactivateUser(id)
      setUsers(us => us.map(u => u.id === id ? { ...u, isActive: false } : u))
      toast.success(`${name} deactivated`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 page-enter">
      <PageHeader title="User Management" subtitle={`${users.length} registered users`} />

      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-base max-w-sm" />
      </div>

      <div className="card">
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-ink-700">
              <tr>
                {['#','Name','Email','Role','Income','Credit score','Joined','Status','Action'].map(h => (
                  <th key={h} className="table-head text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={`table-row ${!u.isActive ? 'opacity-50' : ''}`}>
                  <td className="table-cell font-mono text-ink-400 text-xs">{u.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-jade/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-jade text-xs font-semibold">{u.fullName?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-ink-100">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="table-cell text-ink-400 text-xs">{u.email}</td>
                  <td className="table-cell">
                    {u.role === 'ADMIN'
                      ? <span className="badge badge-sky"><ShieldCheck size={10} /> ADMIN</span>
                      : <span className="badge badge-gray"><Shield size={10} /> USER</span>}
                  </td>
                  <td className="table-cell font-mono text-sm">{u.annualIncome ? fmt.currency(u.annualIncome) : '—'}</td>
                  <td className="table-cell">
                    {u.creditScore ? (
                      <span className={`font-mono font-semibold text-sm ${
                        u.creditScore >= 750 ? 'text-jade' : u.creditScore >= 650 ? 'text-amber' : 'text-rose'}`}>
                        {u.creditScore}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="table-cell text-ink-400 text-xs">{fmt.date(u.createdAt)}</td>
                  <td className="table-cell">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-rose'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    {u.isActive && u.role !== 'ADMIN' && (
                      <button onClick={() => deactivate(u.id, u.fullName)}
                        className="flex items-center gap-1 text-xs text-rose/70 hover:text-rose transition-colors">
                        <UserX size={13} /> Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
