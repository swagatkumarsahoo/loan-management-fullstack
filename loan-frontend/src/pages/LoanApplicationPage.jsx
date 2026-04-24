import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loanAPI } from '../api/api'
import { PageHeader, ErrorMessage } from '../components/ui'
import { fmt, getErrorMessage } from '../utils/helpers'
import { CheckCircle2, XCircle, Calculator, Send, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const LOAN_TYPES = [
  { value: 'PERSONAL_LOAN',  label: '👤 Personal Loan',  rate: '14.0%' },
  { value: 'HOME_LOAN',      label: '🏠 Home Loan',      rate: '8.5%'  },
  { value: 'CAR_LOAN',       label: '🚗 Car Loan',       rate: '9.5%'  },
  { value: 'EDUCATION_LOAN', label: '🎓 Education Loan', rate: '7.0%'  },
  { value: 'BUSINESS_LOAN',  label: '💼 Business Loan',  rate: '12.0%' },
  { value: 'GOLD_LOAN',      label: '⭐ Gold Loan',      rate: '9.0%'  },
]

const INIT = { loanType: 'PERSONAL_LOAN', principalAmount: '', tenureMonths: 12, purpose: '' }

export default function LoanApplicationPage() {
  const navigate = useNavigate()
  const [form, setForm]           = useState(INIT)
  const [eligibility, setEligibility] = useState(null)
  const [checking, setChecking]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [step, setStep]           = useState(1)  // 1 = form, 2 = eligibility, 3 = confirm

  const handle = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setEligibility(null)
  }

  const checkEligibility = async () => {
    if (!form.principalAmount || !form.tenureMonths) {
      setError('Please enter amount and tenure first')
      return
    }
    setError('')
    setChecking(true)
    try {
      const res = await loanAPI.checkEligibility({
        amount: Number(form.principalAmount),
        tenureMonths: Number(form.tenureMonths),
        loanType: form.loanType,
      })
      setEligibility(res.data.data)
      setStep(2)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setChecking(false)
    }
  }

  const submit = async () => {
    if (!form.purpose.trim()) { setError('Please enter the loan purpose'); return }
    setError('')
    setSubmitting(true)
    try {
      await loanAPI.apply({
        ...form,
        principalAmount: Number(form.principalAmount),
        tenureMonths: Number(form.tenureMonths),
      })
      toast.success('Loan application submitted! Awaiting admin review.')
      navigate('/loans')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedType = LOAN_TYPES.find(t => t.value === form.loanType)
  const emi = eligibility?.suggestedEMI ? fmt.currency(eligibility.suggestedEMI) : '—'

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <PageHeader title="Apply for a Loan" subtitle="Check eligibility before submitting your application" />

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {['Loan details', 'Eligibility', 'Confirm'].map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${step > i + 1 ? 'bg-jade text-ink-900' : step === i + 1 ? 'bg-jade/20 border-2 border-jade text-jade' : 'bg-ink-700 text-ink-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? 'text-jade' : 'text-ink-500'}`}>{s}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px mb-5 mx-2 ${step > i + 1 ? 'bg-jade/40' : 'bg-ink-700'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-7 space-y-5">
        {/* Loan type selector */}
        <div>
          <label className="label">Loan type</label>
          <div className="grid grid-cols-3 gap-2">
            {LOAN_TYPES.map(t => (
              <button key={t.value} type="button"
                onClick={() => { setForm(p => ({...p, loanType: t.value})); setEligibility(null) }}
                className={`p-3 rounded-xl border text-left transition-all
                  ${form.loanType === t.value
                    ? 'border-jade bg-jade/10 text-jade'
                    : 'border-ink-600 bg-ink-700/50 text-ink-300 hover:border-ink-500'}`}>
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="text-xs opacity-70">{t.rate} p.a.</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount + Tenure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Loan amount (₹)</label>
            <input name="principalAmount" type="number" value={form.principalAmount}
              onChange={handle} placeholder="e.g. 500000"
              className="input-base" min="10000" max="50000000" />
          </div>
          <div>
            <label className="label">Tenure (months)</label>
            <select name="tenureMonths" value={form.tenureMonths}
              onChange={handle} className="input-base">
              {[6,12,24,36,48,60,84,120,180,240].map(m => (
                <option key={m} value={m}>{m} months ({Math.round(m/12 * 10)/10} yr)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="label">Purpose of loan</label>
          <textarea name="purpose" value={form.purpose} onChange={handle}
            placeholder="Briefly describe why you need this loan…"
            rows={3} className="input-base resize-none" />
        </div>

        <ErrorMessage message={error} />

        {/* Eligibility result */}
        {eligibility && (
          <div className={`p-4 rounded-xl border ${eligibility.eligible
            ? 'bg-jade/5 border-jade/20' : 'bg-rose/5 border-rose/20'}`}>
            <div className="flex items-start gap-3">
              {eligibility.eligible
                ? <CheckCircle2 size={20} className="text-jade flex-shrink-0 mt-0.5" />
                : <XCircle     size={20} className="text-rose flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={`font-semibold text-sm mb-1 ${eligibility.eligible ? 'text-jade' : 'text-rose'}`}>
                  {eligibility.eligible ? 'You are eligible!' : 'Not eligible'}
                </p>
                <p className="text-xs text-ink-300">{eligibility.reason}</p>
                {eligibility.eligible && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      { label: 'Monthly EMI',   value: emi },
                      { label: 'Interest rate', value: `${eligibility.annualInterestRate}% p.a.` },
                      { label: 'Max eligible',  value: fmt.currency(eligibility.maxEligibleAmount) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-ink-700/50 rounded-lg p-2.5">
                        <p className="text-[10px] text-ink-400 mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-ink-100">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={checkEligibility} disabled={checking || !form.principalAmount}
            className="btn-secondary flex items-center gap-2 flex-1">
            {checking
              ? <span className="w-4 h-4 border-2 border-ink-400/30 border-t-ink-400 rounded-full animate-spin" />
              : <Calculator size={15} />}
            Check eligibility
          </button>
          {eligibility?.eligible && (
            <button onClick={submit} disabled={submitting}
              className="btn-primary flex items-center gap-2 flex-1">
              {submitting
                ? <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
                : <Send size={15} />}
              Submit application
            </button>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-sky/5 border border-sky/20 rounded-xl">
        <Info size={16} className="text-sky flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-400 leading-relaxed">
          Your application will be reviewed by an admin within 1–2 business days.
          You will be notified once a decision is made. Make sure your profile has accurate
          income and credit score data for faster approvals.
        </p>
      </div>
    </div>
  )
}
