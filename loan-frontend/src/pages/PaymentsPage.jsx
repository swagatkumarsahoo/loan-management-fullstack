import { useEffect, useState } from 'react'
import { paymentAPI } from '../api/api'
import { PageHeader, PageLoader, EmptyState, Pagination } from '../components/ui'
import { fmt } from '../utils/helpers'
import { Receipt, CheckCircle2 } from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(0)
  const [total,    setTotal]    = useState(0)

  useEffect(() => {
    setLoading(true)
    paymentAPI.getMyPayments({ page, size: 15 })
      .then(res => {
        setPayments(res.data.data.content ?? [])
        setTotal(res.data.data.totalPages ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="space-y-6 page-enter">
      <PageHeader title="Payment History" subtitle="All your EMI payments and transactions" />

      <div className="card">
        {loading ? (
          <PageLoader />
        ) : payments.length === 0 ? (
          <EmptyState icon={Receipt} title="No payments yet"
            description="Once you pay an EMI, it will appear here." />
        ) : (
          <>
            <table className="w-full">
              <thead className="border-b border-ink-700">
                <tr>
                  {['Transaction ID','Loan #','Instalment','Amount','Penalty','Mode','Date','Status'].map(h => (
                    <th key={h} className="table-head text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell font-mono text-xs text-ink-400">{p.transactionId}</td>
                    <td className="table-cell text-ink-300">#{p.loanId}</td>
                    <td className="table-cell text-ink-300">#{p.instalmentNumber}</td>
                    <td className="table-cell font-mono text-jade">{fmt.currency(p.amountPaid)}</td>
                    <td className="table-cell font-mono text-rose text-sm">
                      {p.penaltyPaid > 0 ? fmt.currency(p.penaltyPaid) : '—'}
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-gray">{p.paymentMode}</span>
                    </td>
                    <td className="table-cell text-ink-400 text-xs">{fmt.dateTime(p.paidAt)}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1 text-jade text-xs">
                        <CheckCircle2 size={12} /> {p.paymentStatus}
                      </span>
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
