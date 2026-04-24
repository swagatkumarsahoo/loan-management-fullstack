import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { loanAPI, emiAPI } from '../api/api'
import { PageLoader, EmptyState, StatCard } from '../components/ui'
import { fmt, loanStatusBadge, emiStatusBadge, loanTypeLabel } from '../utils/helpers'
import { ArrowLeft, Calendar, CreditCard } from 'lucide-react'

export default function LoanDetailPage() {
  const { id } = useParams()
  const [loan, setLoan] = useState(null)
  const [emis, setEmis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loanAPI.getLoanById(id).then(res => {
      const l = res.data.data
      setLoan(l)
      if (['ACTIVE','CLOSED'].includes(l.status)) {
        return emiAPI.getSchedule(id).then(r => setEmis(r.data.data ?? []))
      }
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!loan) return <div className="text-ink-400">Loan not found</div>

  const paid    = emis.filter(e => e.status === 'PAID').length
  const percent = emis.length ? Math.round((paid / emis.length) * 100) : 0

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center gap-3">
        <Link to="/loans" className="btn-secondary py-2 px-3"><ArrowLeft size={15} /></Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-50">{loanTypeLabel(loan.loanType)}</h1>
          <p className="text-xs text-ink-400">Loan #{loan.id} · Applied {fmt.date(loan.appliedAt)}</p>
        </div>
        <span className={`ml-auto ${loanStatusBadge(loan.status)} text-sm px-3 py-1.5`}>{loan.status}</span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Principal"   value={fmt.currency(loan.principalAmount)}   accent="sky" />
        <StatCard label="Monthly EMI" value={loan.emiAmount ? fmt.currency(loan.emiAmount) : '—'} accent="jade" />
        <StatCard label="Total Payable" value={loan.totalPayableAmount ? fmt.currency(loan.totalPayableAmount) : '—'} accent="amber" />
        <StatCard label="Interest"    value={loan.totalInterestAmount ? fmt.currency(loan.totalInterestAmount) : '—'} accent="rose" />
      </div>

      {/* Loan info */}
      <div className="card p-5">
        <p className="section-title mb-4">Loan details</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Interest rate',   value: `${loan.annualInterestRate}% p.a.` },
            { label: 'Tenure',          value: `${loan.tenureMonths} months` },
            { label: 'Purpose',         value: loan.purpose ?? '—' },
            { label: 'Disbursed on',    value: fmt.date(loan.disbursedAt) },
            { label: 'Reviewed on',     value: fmt.date(loan.reviewedAt) },
            { label: 'Rejection reason',value: loan.rejectionReason ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-ink-400 mb-0.5">{label}</p>
              <p className="text-ink-100 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Repayment progress */}
      {emis.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Repayment progress</p>
            <span className="text-sm font-semibold text-jade">{paid}/{emis.length} EMIs paid</span>
          </div>
          <div className="h-2.5 bg-ink-700 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-jade rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }} />
          </div>

          {/* EMI table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-700">
                <tr>
                  {['#','Due date','EMI','Principal','Interest','Outstanding','Status'].map(h => (
                    <th key={h} className="table-head text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {emis.map(e => (
                  <tr key={e.id} className="table-row">
                    <td className="table-cell text-ink-400 font-mono">{e.instalmentNumber}</td>
                    <td className="table-cell">{fmt.date(e.dueDate)}</td>
                    <td className="table-cell font-mono text-jade">{fmt.currency(e.emiAmount)}</td>
                    <td className="table-cell font-mono">{fmt.currency(e.principalComponent)}</td>
                    <td className="table-cell font-mono text-amber">{fmt.currency(e.interestComponent)}</td>
                    <td className="table-cell font-mono text-ink-300">{fmt.currency(e.outstandingPrincipal)}</td>
                    <td className="table-cell">
                      <span className={emiStatusBadge(e.status)}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loan.status === 'ACTIVE' && (
        <Link to="/emi" className="btn-primary inline-flex items-center gap-2">
          <Calendar size={15} /> Pay next EMI
        </Link>
      )}
    </div>
  )
}
