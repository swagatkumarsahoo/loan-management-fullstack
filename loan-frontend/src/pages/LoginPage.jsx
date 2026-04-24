import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorMessage } from '../components/ui'
import { getErrorMessage } from '../utils/helpers'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form)
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-dot-grid bg-dot opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-jade flex items-center justify-center shadow-glow-sm">
            <Zap size={18} className="text-ink-900" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-xl text-ink-50">LoanSpark</span>
        </div>

        <div className="card p-8 animate-slide-up">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold text-ink-50 mb-1">Welcome back</h1>
            <p className="text-sm text-ink-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" value={form.email}
                onChange={handle} placeholder="swagatksahoo.dev@gmail.com"
                className="input-base" required autoFocus />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={show ? 'text' : 'password'}
                  value={form.password} onChange={handle} placeholder="••••••••"
                  className="input-base pr-11" required />
                <button type="button" onClick={() => setShow(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <ErrorMessage message={error} />

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">Sign in <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-ink-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-jade hover:text-jade-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>


      </div>
    </div>
  )
}
