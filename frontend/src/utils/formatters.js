import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

// ─── Date Formatters ──────────────────────────────────────────────────────────
export const formatDate = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, 'dd MMM yyyy') : '—'
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm') : '—'
}

export const formatRelative = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

// ─── Currency Formatters ──────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = '₹') => {
  if (amount == null) return '—'
  return `${currency}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// ─── Number Formatters ────────────────────────────────────────────────────────
export const formatNumber = (n) => {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-IN')
}

export const formatPercent = (n) => {
  if (n == null) return '—'
  return `${Number(n).toFixed(1)}%`
}

// ─── Status / Badge Formatters ────────────────────────────────────────────────
export const formatStatus = (status) => {
  if (!status) return '—'
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export const getStatusClass = (status) => {
  const map = {
    AVAILABLE: 'badge-success',
    ASSIGNED: 'badge-info',
    UNDER_REPAIR: 'badge-warning',
    DISPOSED: 'badge-danger',
  }
  return map[status] || 'badge-gray'
}

export const getHealthClass = (level) => {
  const map = {
    EXCELLENT: 'health-excellent',
    GOOD: 'health-good',
    AVERAGE: 'health-average',
    POOR: 'health-poor',
    CRITICAL: 'health-critical',
  }
  return map[level] || 'badge-gray'
}

export const getRiskClass = (level) => {
  const map = { LOW: 'badge-success', MEDIUM: 'badge-warning', HIGH: 'badge-danger' }
  return map[level] || 'badge-gray'
}

// ─── File helpers ─────────────────────────────────────────────────────────────
export const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// ─── String helpers ───────────────────────────────────────────────────────────
export const truncate = (str, len = 40) =>
  str && str.length > len ? str.substring(0, len) + '...' : str || '—'

export const initials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)
}

export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred'
  if (error.response?.data?.message) return error.response.data.message
  if (error.message) return error.message
  return 'An unexpected error occurred'
}
