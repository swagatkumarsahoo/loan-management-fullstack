import { useEffect, useState } from 'react'
import { adminAPI } from '../api/api'
import { PageHeader, PageLoader, EmptyState, Pagination } from '../components/ui'
import { fmt, loanStatusBadge, loanTypeLabel, getErrorMessage } from '../utils/helpers'
import { CreditCard, CheckCircle2, XCircle, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'

function ReviewModal({ loan, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const review = async (approved) => {
    if (!approved && !reason.trim()) {
      toast.error('Rejection reason is required')
      return
    }
    setLoading(true)
    try {
      await adminAPI.reviewLoan({ loanId: loan.id, approved, rejectionReason: reason })
      toast.success(approved ? 'Loan approved!' : 'Loan rejected')
      onDone()
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-ink-50">Review Loan #{loan.id}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-200"><X size={18} /></button>
        </div>

        {/* Loan summary */}
        <div className="bg-ink-700/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-ink-400">Applicant</span><span className="font-medium">{loan.userFullName}</span></div>
          <div className="flex justify-between"><span className="text-ink-400">Type</span><span>{loanTypeLabel(loan.loanType)}</span></div>
          <div className="flex justify-between"><span className="text-ink-400">Amount</span><span className="text-jade font-mono">{fmt.currency(loan.principalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-ink-400">Tenure</span><span>{loan.tenureMonths} months</span></div>
          <div className="flex justify-between"><span className="text-ink-400">EMI</span><span className="font-mono">{loan.emiAmount ? fmt.currency(loan.emiAmount) : 'TBD'}</span></div>
          <div className="flex justify-between"><span className="text-ink-400">Purpose</span><span className="text-right max-w-[200px] text-xs">{loan.purpose}</span></div>
        </div>

        <div>
          <label className="label">Rejection reason (required if rejecting)</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Insufficient income, low credit score, etc."
            rows={3} className="input-base resize-none" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => review(false)} disabled={loading}
            className="btn-danger flex items-center gap-2 flex-1 justify-center">
            <XCircle size={15} /> Reject
          </button>
          <button onClick={() => review(true)} disabled={loading}
            className="btn-primary flex items-center gap-2 flex-1 justify-center">
            {loading
              ? <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
              : <><CheckCircle2 size={15} /> Approve</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoansPage() {
  const [loans,    setLoans]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(0)
  const [total,    setTotal]    = useState(0)
  const [filter,   setFilter]   = useState('')
  const [reviewing, setReviewing] = useState(null)
  const [refresh,  setRefresh]  = useState(0)

  useEffect(() => {
    setLoading(true)
    adminAPI.getAllLoans({ page, size: 10, ...(filter ? { status: filter } : {}) })
      .then(res => {
        setLoans(res.data.data.content ?? [])
        setTotal(res.data.data.totalPages ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page, filter, refresh])

  const statuses = ['', 'PENDING', 'ACTIVE', 'APPROVED', 'REJECTED', 'CLOSED']

  return (
    <div className="space-y-6 page-enter">
      <PageHeader title="Loan Management" subtitle="Review and manage all loan applications" />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(0) }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all
              ${filter === s ? 'bg-jade/10 border-jade text-jade' : 'bg-ink-700 border-ink-600 text-ink-300 hover:border-ink-500'}`}>
            {s || 'All loans'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <PageLoader /> : loans.length === 0 ? (
          <EmptyState icon={CreditCard} title="No loans found" />
        ) : (
          <>
            <table className="w-full">
              <thead className="border-b border-ink-700">
                <tr>
                  {['#','Applicant','Type','Amount','Tenure','EMI','Status','Applied','Action'].map(h => (
                    <th key={h} className="table-head text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id} className="table-row">
                    <td className="table-cell font-mono text-ink-400 text-xs">{loan.id}</td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm font-medium text-ink-100">{loan.userFullName}</p>
                        <p className="text-xs text-ink-500">{loan.userEmail}</p>
                      </div>
                    </td>
                    <td className="table-cell text-sm">{loanTypeLabel(loan.loanType).replace(/^.+? /, '')}</td>
                    <td className="table-cell font-mono text-jade">{fmt.currency(loan.principalAmount)}</td>
                    <td className="table-cell text-ink-400">{loan.tenureMonths}m</td>
                    <td className="table-cell font-mono text-sm">{loan.emiAmount ? fmt.currency(loan.emiAmount) : '—'}</td>
                    <td className="table-cell"><span className={loanStatusBadge(loan.status)}>{loan.status}</span></td>
                    <td className="table-cell text-ink-400 text-xs">{fmt.date(loan.appliedAt)}</td>
                    <td className="table-cell">
                      {loan.status === 'PENDING' ? (
                        <button onClick={() => setReviewing(loan)}
                          className="flex items-center gap-1 text-xs text-amber border border-amber/30 bg-amber/10 px-3 py-1.5 rounded-lg hover:bg-amber/20 transition-colors">
                          <Eye size={12} /> Review
                        </button>
                      ) : (
                        <span className="text-xs text-ink-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4">
              <Pagination page={page} totalPages={total} onPage={setPage} />
            </div>
          </>
        )}
      </div>

      {reviewing && (
        <ReviewModal
          loan={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => setRefresh(r => r + 1)}
        />
      )}
    </div>
  )
}
