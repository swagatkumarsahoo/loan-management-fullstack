import { useEffect, useState } from 'react'
import { loanAPI, emiAPI, paymentAPI } from '../api/api'
import { PageHeader, PageLoader, EmptyState } from '../components/ui'
import { fmt, emiStatusBadge, loanTypeLabel, getErrorMessage } from '../utils/helpers'
import { Calendar, CheckCircle2, AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'

function PayModal({ emi, loanId, onClose, onSuccess }) {
  const [form, setForm] = useState({ paymentMode: 'UPI', remarks: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const penalty = emi.penaltyAmount ?? 0
  const total   = emi.emiAmount + penalty

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      await paymentAPI.makePayment({
        emiScheduleId: emi.id,
        amountPaid:    total,
        paymentMode:   form.paymentMode,
        remarks:       form.remarks,
      })
      toast.success(`EMI #${emi.instalmentNumber} paid — ${fmt.currency(total)}`)
      onSuccess()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-ink-50">Pay EMI #{emi.instalmentNumber}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-ink-700/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-ink-400">EMI amount</span><span className="font-mono">{fmt.currency(emi.emiAmount)}</span></div>
          {penalty > 0 && <div className="flex justify-between text-rose"><span>Late penalty</span><span className="font-mono">+{fmt.currency(penalty)}</span></div>}
          <div className="flex justify-between pt-2 border-t border-ink-600 font-semibold">
            <span>Total due</span><span className="text-jade font-mono">{fmt.currency(total)}</span>
          </div>
        </div>

        {/* Payment mode */}
        <div>
          <label className="label">Payment mode</label>
          <select value={form.paymentMode}
            onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}
            className="input-base">
            {['UPI','NEFT','IMPS','CARD','CASH'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Remarks (optional)</label>
          <input value={form.remarks}
            onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
            placeholder="e.g. Google Pay transfer"
            className="input-base" />
        </div>

        {error && <p className="text-xs text-rose">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin mx-auto" /> : 'Confirm payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EMITrackerPage() {
  const [loans,   setLoans]   = useState([])
  const [selected, setSelected] = useState(null)  // selected loanId
  const [emis,    setEmis]    = useState([])
  const [loading, setLoading] = useState(true)
  const [emiLoading, setEmiLoading] = useState(false)
  const [payTarget, setPayTarget] = useState(null) // EMI to pay
  const [refresh,  setRefresh] = useState(0)

  useEffect(() => {
    loanAPI.getMyLoans({ page: 0, size: 50 }).then(res => {
      const active = (res.data.data.content ?? []).filter(l => l.status === 'ACTIVE')
      setLoans(active)
      if (active.length && !selected) setSelected(active[0].id)
    }).finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => {
    if (!selected) return
    setEmiLoading(true)
    emiAPI.getSchedule(selected)
      .then(res => setEmis(res.data.data ?? []))
      .finally(() => setEmiLoading(false))
  }, [selected, refresh])

  const pendingCount = emis.filter(e => e.status === 'PENDING' || e.status === 'OVERDUE').length
  const paidCount    = emis.filter(e => e.status === 'PAID').length

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 page-enter">
      <PageHeader title="EMI Tracker" subtitle="Track and pay your monthly instalments" />

      {loans.length === 0 ? (
        <EmptyState icon={Calendar} title="No active loans" description="You have no active loans with EMI schedules right now." />
      ) : (
        <>
          {/* Loan tabs */}
          <div className="flex gap-2 flex-wrap">
            {loans.map(l => (
              <button key={l.id} onClick={() => setSelected(l.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                  ${selected === l.id ? 'bg-jade/10 border-jade text-jade' : 'bg-ink-700 border-ink-600 text-ink-300 hover:border-ink-500'}`}>
                {loanTypeLabel(l.loanType).replace(/^.+? /, '')} #{l.id}
              </button>
            ))}
          </div>

          {/* Progress summary */}
          {emis.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-jade">{paidCount}</p>
                <p className="text-xs text-ink-400 mt-0.5">Paid</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-amber">{pendingCount}</p>
                <p className="text-xs text-ink-400 mt-0.5">Pending</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-ink-200">{emis.length}</p>
                <p className="text-xs text-ink-400 mt-0.5">Total</p>
              </div>
            </div>
          )}

          {/* EMI list */}
          <div className="card">
            {emiLoading ? <PageLoader /> : emis.length === 0 ? (
              <EmptyState icon={Calendar} title="No EMI data" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-ink-700">
                    <tr>
                      {['#','Due date','EMI','Principal','Interest','Outstanding','Status','Action'].map(h => (
                        <th key={h} className="table-head text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {emis.map(e => (
                      <tr key={e.id} className={`table-row ${e.status === 'OVERDUE' ? 'bg-rose/5' : ''}`}>
                        <td className="table-cell font-mono text-ink-400">{e.instalmentNumber}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1.5">
                            {e.status === 'OVERDUE' && <AlertTriangle size={12} className="text-rose" />}
                            {fmt.date(e.dueDate)}
                          </div>
                        </td>
                        <td className="table-cell font-mono text-jade">{fmt.currency(e.emiAmount)}</td>
                        <td className="table-cell font-mono text-sm">{fmt.currency(e.principalComponent)}</td>
                        <td className="table-cell font-mono text-amber text-sm">{fmt.currency(e.interestComponent)}</td>
                        <td className="table-cell font-mono text-ink-300">{fmt.currency(e.outstandingPrincipal)}</td>
                        <td className="table-cell">
                          <span className={emiStatusBadge(e.status)}>{e.status}</span>
                        </td>
                        <td className="table-cell">
                          {(e.status === 'PENDING' || e.status === 'OVERDUE') && (
                            <button onClick={() => setPayTarget(e)}
                              className="flex items-center gap-1 text-xs text-jade border border-jade/30 bg-jade/10 px-3 py-1.5 rounded-lg hover:bg-jade/20 transition-colors">
                              <CheckCircle2 size={12} /> Pay
                            </button>
                          )}
                          {e.status === 'PAID' && (
                            <span className="text-xs text-ink-500 flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-jade" /> {fmt.date(e.paidDate)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {payTarget && (
        <PayModal
          emi={payTarget}
          loanId={selected}
          onClose={() => setPayTarget(null)}
          onSuccess={() => setRefresh(r => r + 1)}
        />
      )}
    </div>
  )
}
