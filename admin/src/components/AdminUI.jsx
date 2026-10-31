import { AlertCircle, LoaderCircle, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}

export function MetricGrid({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map(({ label, value, detail, icon: Icon, tone = 'purple', trend, trendUp }) => {
        const toneConfig = {
          purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-500', ring: 'ring-purple-200' },
          green: { bg: 'bg-green-50', border: 'border-green-100', icon: 'text-green-500', ring: 'ring-green-200' },
          blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', ring: 'ring-blue-200' },
          amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-500', ring: 'ring-amber-200' },
        }
        const tc = toneConfig[tone] ?? toneConfig.rose
        return (
          <article key={label} className={`rounded-xl p-4 border border-t-4 ${tc.bg} ${tc.border} ${tc.ring} shadow-sm`}>
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-lg ${tc.icon}`}><Icon size={19} /></span>
              <div>
                <span className="block text-xs text-muted">{label}</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <strong className="text-lg font-semibold text-ink">{value}</strong>
                  {trend && <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    trendUp ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                  }`}>{trend}</span>}
                </div>
                {detail && <p className="text-xs text-muted">{detail}</p>}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <label className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400">
      <Search size={16} aria-hidden="true" className="text-gray-400" />
      <input className="flex-1 bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && <button type="button" onClick={() => onChange('')} aria-label="Clear search"><X size={14} className="text-gray-400" /></button>}
    </label>
  )
}

export function DataToolbar({ children }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 mb-4">{children}</div>
}

export function DataPanel({ children, className = '' }) {
  return <section className={`bg-white border border-gray-100 rounded-xl shadow-sm p-5 ${className}`}>{children}</section>
}

export function DataTable({ columns, rows, empty, minWidth = 680 }) {
  return (
    <div className="data-table-scroll">
      <table className="data-table" style={{ minWidth }}>
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, index) => <tr key={row.id}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row, index) : row[column.key]}</td>)}</tr>)
            : <tr><td className="data-table__empty" colSpan={columns.length}>{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function StatusPill({ children, status }) {
  const key = status || String(children || '').toLowerCase().replace(/[\s/]+/g, '-')
  return <span className={`status-pill status-${key}`}>{children}</span>
}

export function LoadState({ loading, error, onRetry, children }) {
  if (loading) return <div className="data-state"><LoaderCircle className="data-state__spinner" size={23} /><span>Loading data…</span></div>
  if (error) {
    const needsAuth = /not authenticated/i.test(error)
    return (
      <div className="data-state data-state--error">
        <AlertCircle size={21} />
        <div>
          <strong>{needsAuth ? 'Sign in required' : 'Could not load this page'}</strong>
          <p>{needsAuth ? 'Sign in with your administrator account to view store data.' : error}</p>
          {needsAuth
            ? <Link className="data-button data-button--primary" to="/admin/login">Sign in</Link>
            : onRetry && <button className="data-button data-button--secondary" type="button" onClick={onRetry}>Try again</button>}
        </div>
      </div>
    )
  }
  return children
}

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`admin-modal${wide ? ' admin-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="admin-modal__heading"><h2 id="modal-title">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div>
        {children}
      </section>
    </div>
  )
}

export function Pagination({ page, pages, onChange, total, pageSize }) {
  if (pages <= 1) return <div className="data-pagination"><span>Showing {total ? 1 : 0}–{Math.min(pageSize, total)} of {total}</span></div>
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return (
    <div className="data-pagination">
      <span>Showing {start}–{end} of {total}</span>
      <div>
        <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
        {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
          <button type="button" key={number} className={page === number ? 'is-current' : ''} onClick={() => onChange(number)}>{number}</button>
        ))}
        <button type="button" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}

export function FormField({ label, children, hint }) {
  return <label className="admin-form-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
