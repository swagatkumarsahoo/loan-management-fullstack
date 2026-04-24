import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-jade ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Spinner size={32} />
      <p className="text-ink-400 text-sm">Loading…</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ink-700 flex items-center justify-center">
        {Icon && <Icon size={26} className="text-ink-400" />}
      </div>
      <div>
        <p className="font-display font-semibold text-ink-200 mb-1">{title}</p>
        {description && <p className="text-sm text-ink-400 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, sub, trend, icon: Icon, accent = 'jade' }) {
  const colors = { jade: 'text-jade', amber: 'text-amber', rose: 'text-rose', sky: 'text-sky' }
  const bgColors = { jade: 'bg-jade/10', amber: 'bg-amber/10', rose: 'bg-rose/10', sky: 'bg-sky/10' }

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${bgColors[accent]} flex items-center justify-center flex-shrink-0`}>
            <Icon size={15} className={colors[accent]} />
          </div>
        )}
      </div>
      <p className={`font-display text-2xl font-bold ${colors[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-ink-400">{sub}</p>}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{title}</h1>
        {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 p-3 bg-rose/10 border border-rose/20 rounded-xl text-sm text-rose">
      <AlertCircle size={15} className="flex-shrink-0" />
      {message}
    </div>
  )
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-700">
      <p className="text-xs text-ink-400">Page {page + 1} of {totalPages}</p>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page === 0}
          className="btn-secondary py-2 px-4 text-xs disabled:opacity-40">← Prev</button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages - 1}
          className="btn-secondary py-2 px-4 text-xs disabled:opacity-40">Next →</button>
      </div>
    </div>
  )
}
