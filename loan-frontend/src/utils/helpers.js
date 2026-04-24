import { format, isAfter, parseISO } from 'date-fns'

export const fmt = {
  currency: (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0),
  date:     (d) => d ? format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy') : '—',
  dateTime: (d) => d ? format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy, h:mm a') : '—',
  percent:  (n) => `${(n ?? 0).toFixed(1)}%`,
  number:   (n) => new Intl.NumberFormat('en-IN').format(n ?? 0),
}

export const loanStatusBadge = (status) => {
  const map = {
    PENDING:  'badge-amber',
    APPROVED: 'badge-sky',
    ACTIVE:   'badge-green',
    REJECTED: 'badge-rose',
    CLOSED:   'badge-gray',
    DEFAULTED:'badge-rose',
  }
  return map[status] ?? 'badge-gray'
}

export const emiStatusBadge = (status) => {
  const map = {
    PENDING: 'badge-amber',
    PAID:    'badge-green',
    OVERDUE: 'badge-rose',
    WAIVED:  'badge-sky',
  }
  return map[status] ?? 'badge-gray'
}

export const loanTypeLabel = (type) => {
  const map = {
    HOME_LOAN:      '🏠 Home Loan',
    PERSONAL_LOAN:  '👤 Personal Loan',
    CAR_LOAN:       '🚗 Car Loan',
    EDUCATION_LOAN: '🎓 Education Loan',
    BUSINESS_LOAN:  '💼 Business Loan',
    GOLD_LOAN:      '⭐ Gold Loan',
  }
  return map[type] ?? type
}

export const getErrorMessage = (err) => {
  const d = err?.response?.data
  if (!d) return 'Something went wrong'
  if (typeof d.data === 'object') return Object.values(d.data).join(', ')
  return d.message ?? 'Something went wrong'
}

export const isOverdue = (dateStr) => isAfter(new Date(), parseISO(dateStr))
