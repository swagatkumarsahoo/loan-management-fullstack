import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loanAPI } from '../api/api'
import { PageHeader, PageLoader, EmptyState, Pagination } from '../components/ui'
import { fmt, loanStatusBadge, loanTypeLabel } from '../utils/helpers'
import { CreditCard, PlusCircle, ChevronRight } from 'lucide-react'

export default function MyLoansPage() {
  const [loans,   setLoans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(0)
  const [total,   setTotal]   = useState(0)

  useEffect(() => {
    setLoading(true)
    loanAPI.getMyLoans({ page, size: 10 })
      .then(res => {
        setLoans(res.data.data.content ?? [])
        setTotal(res.data.data.totalPages ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="My Loans"
        subtitle="All your loan applications and their status"
        action={
          <Link to="/loans/apply" className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} /> Apply for Loan
          </Link>
        }
      />

      <div className="card">
        {loading ? (
          <PageLoader />
        ) : loans.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No loans yet"
            description="Apply for your first loan and we'll review it within 1–2 business days"
            action={<Link to="/loans/apply" className="btn-primary py-2 px-5 text-sm">Apply now</Link>}
          />
        ) : (
          <>
            <table className="w-full">
              <thead className="border-b border-ink-700">
                <tr>
                  {['Loan type','Amount','Tenure','EMI','Status','Applied',''].map(h => (
                    <th key={h} className="table-head text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id} className="table-row">
                    <td className="table-cell font-medium">{loanTypeLabel(loan.loanType)}</td>
                    <td className="table-cell font-mono text-jade">{fmt.currency(loan.principalAmount)}</td>
                    <td className="table-cell text-ink-400">{loan.tenureMonths}m</td>
                    <td className="table-cell font-mono">{loan.emiAmount ? fmt.currency(loan.emiAmount) : '—'}</td>
                    <td className="table-cell">
                      <span className={loanStatusBadge(loan.status)}>{loan.status}</span>
                    </td>
                    <td className="table-cell text-ink-400">{fmt.date(loan.appliedAt)}</td>
                    <td className="table-cell">
                      <Link to={`/loans/${loan.id}`}
                        className="flex items-center gap-1 text-jade text-xs hover:text-jade-300 transition-colors">
                        Details <ChevronRight size={13} />
                      </Link>
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
    </div>
  )
}
