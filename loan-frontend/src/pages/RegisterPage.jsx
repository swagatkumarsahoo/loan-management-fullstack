import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorMessage } from '../components/ui'
import { getErrorMessage } from '../utils/helpers'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'

const INIT = { fullName:'', email:'', password:'', phone:'', annualIncome:'', creditScore:'' }

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(INIT)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        ...form,
        annualIncome: Number(form.annualIncome) || null,
        creditScore:  Number(form.creditScore)  || null,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const f = (name, label, props = {}) => (
    <div>
      <label className="label">{label}</label>
      <input name={name} value={form[name]} onChange={handle} className="input-base" {...props} />
    </div>
  )

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dot-grid bg-dot opacity-40 pointer-events-none" />

      <div className="w-full max-w-lg relative">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-jade flex items-center justify-center shadow-glow-sm">
            <Zap size={18} className="text-ink-900" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-xl text-ink-50">LoanSpark</span>
        </div>

        <div className="card p-8 animate-slide-up">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold text-ink-50 mb-1">Create your account</h1>
            <p className="text-sm text-ink-400">Join thousands managing credit smartly</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {f('fullName', 'Full name', { placeholder: 'Swagat Kumar Sahoo', required: true })}
              {f('phone',    'Mobile number', { placeholder: '8249088372' })}
            </div>

            {f('email', 'Email address', { type: 'email', placeholder: 'swagatksahoo.dev@gmail.com', required: true })}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={show ? 'text' : 'password'}
                  value={form.password} onChange={handle}
                  placeholder="Min 8 chars, uppercase + digit"
                  className="input-base pr-11" required />
                <button type="button" onClick={() => setShow(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {f('annualIncome', 'Annual income (₹)', { type: 'number', placeholder: '600000' })}
              {f('creditScore',  'Credit score',      { type: 'number', placeholder: '300–900' })}
            </div>

            <p className="text-xs text-ink-500 -mt-1">
              Income and credit score help determine your loan eligibility. You can update them later.
            </p>

            <ErrorMessage message={error} />

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">Create account <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-ink-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-jade hover:text-jade-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
