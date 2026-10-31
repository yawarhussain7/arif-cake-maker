import { useMemo, useState } from 'react'
import { BadgePercent, CalendarClock, Gift, MessageSquareText, Pencil, Plus, Save, Trash2, Users, X } from 'lucide-react'
import { adminJson, adminRequest } from '../adminApi'
import { useAdminData } from '../hooks/useAdminData'
import { DataPanel, DataToolbar, FormField, LoadState, MetricGrid, Modal, PageHeader, SearchBox, StatusPill } from '../components/AdminUI'

const COUPON_STORAGE_KEY = 'sweet-bites-admin-coupons'
const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`
const date = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const today = () => new Date().toISOString().slice(0, 10)

function getCoupons() {
  try {
    const stored = window.localStorage.getItem(COUPON_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) throw new Error('Saved coupon data is not a list.')
    return parsed
  } catch (error) {
    return { error: `Saved coupon data could not be loaded: ${error.message}` }
  }
}

function couponStatus(coupon) {
  const now = today()
  if (coupon.expiresAt && coupon.expiresAt < now) return 'Expired'
  if (coupon.startsAt && coupon.startsAt > now) return 'Upcoming'
  return 'Active'
}

export function CouponsPage() {
  const initial = useMemo(() => getCoupons(), [])
  const [coupons, setCoupons] = useState(Array.isArray(initial) ? initial : [])
  const [storageError, setStorageError] = useState(Array.isArray(initial) ? '' : initial.error)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editor, setEditor] = useState(null)
  const [error, setError] = useState('')
  const filtered = coupons.filter((coupon) => {
    const status = couponStatus(coupon)
    return (!statusFilter || status === statusFilter)
      && (!query.trim() || `${coupon.code} ${coupon.name} ${coupon.description}`.toLowerCase().includes(query.trim().toLowerCase()))
  })
  const counts = { Active: coupons.filter((item) => couponStatus(item) === 'Active').length, Expired: coupons.filter((item) => couponStatus(item) === 'Expired').length, Upcoming: coupons.filter((item) => couponStatus(item) === 'Upcoming').length }
  const totalRedemptions = coupons.reduce((sum, item) => sum + Number(item.used || 0), 0)

  const openNew = () => {
    setError('')
    setEditor({ code: '', name: '', description: '', kind: 'percent', value: '', minSpend: '0', startsAt: today(), expiresAt: '', limit: '', used: '0' })
  }
  const openEdit = (coupon) => { setError(''); setEditor({ ...coupon }) }
  const save = (event) => {
    event.preventDefault()
    setError('')
    const code = editor.code.trim().toUpperCase()
    if (!/^[A-Z0-9_-]{3,24}$/.test(code)) { setError('Use 3–24 letters, numbers, underscores, or hyphens for the coupon code.'); return }
    if (coupons.some((coupon) => coupon.code === code && coupon.id !== editor.id)) { setError('A coupon with this code already exists.'); return }
    const value = Number(editor.value)
    if (!Number.isFinite(value) || value <= 0 || (editor.kind === 'percent' && value > 100)) { setError(editor.kind === 'percent' ? 'Enter a discount between 1 and 100 percent.' : 'Enter a discount greater than zero.'); return }
    if (editor.startsAt && editor.expiresAt && editor.expiresAt < editor.startsAt) { setError('The expiry date must be on or after the start date.'); return }
    const next = { ...editor, id: editor.id || window.crypto?.randomUUID?.() || `coupon-${Date.now()}`, code, name: editor.name.trim() || code, value, minSpend: Number(editor.minSpend || 0), limit: editor.limit ? Number(editor.limit) : null, used: Number(editor.used || 0) }
    setCoupons((current) => editor.id ? current.map((item) => item.id === editor.id ? next : item) : [next, ...current])
    setEditor(null)
    setStorageError('Unsaved coupon changes. Save them to keep this list on this browser.')
  }
  const remove = (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return
    setCoupons((current) => current.filter((item) => item.id !== coupon.id))
    setStorageError('Unsaved coupon changes. Save them to keep this list on this browser.')
  }
  const saveCoupons = () => {
    try {
      window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupons))
      setStorageError('')
    } catch (saveError) {
      setStorageError(`Coupons could not be saved in this browser: ${saveError.message}`)
    }
  }

  return (
    <div className="data-page">
      <PageHeader title="Coupons" description="Create and track promotional discounts and offers." actions={<button type="button" className="data-button data-button--primary" onClick={openNew}><Plus size={16} /> Create coupon</button>} />
      <p className="local-data-notice">Coupon management is saved in this browser. Coupon codes are not connected to checkout until a coupon API is added.</p>
      {storageError && <p className="inline-warning" role="status">{storageError}</p>}
      <MetricGrid metrics={[
        { label: 'Total coupons', value: coupons.length, icon: BadgePercent, tone: 'purple' },
        { label: 'Active coupons', value: counts.Active, icon: Gift, tone: 'green' },
        { label: 'Expired coupons', value: counts.Expired, icon: CalendarClock, tone: 'amber' },
        { label: 'Total redemptions', value: totalRedemptions.toLocaleString(), icon: Users, tone: 'blue' },
      ]} />
      <DataPanel>
        <DataToolbar>
          <SearchBox value={query} onChange={setQuery} placeholder="Search coupons..." />
          <select className="data-select" aria-label="Filter coupon status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option>Active</option><option>Upcoming</option><option>Expired</option></select>
          <button type="button" className="data-button data-button--secondary" onClick={saveCoupons}><Save size={15} /> Save on this device</button>
        </DataToolbar>
        <div className="coupon-grid">
          {filtered.map((coupon, index) => {
            const status = couponStatus(coupon)
            const colors = ['purple', 'amber', 'blue', 'green', 'violet']
            return <article className={`coupon-card coupon-card--${colors[index % colors.length]}`} key={coupon.id}>
              <div className="coupon-card__banner"><div><strong>{coupon.kind === 'percent' ? `${coupon.value}% OFF` : `${money(coupon.value)} OFF`}</strong><span>{coupon.code}</span></div><i /></div>
              <div className="coupon-card__body"><div className="coupon-card__heading"><h3>{coupon.name}</h3><StatusPill status={status.toLowerCase()}>{status}</StatusPill></div><p>{coupon.description || `Discount applies to qualifying orders${Number(coupon.minSpend) ? ` over ${money(coupon.minSpend)}` : ''}.`}</p>
                <div className="coupon-card__meta"><span>{coupon.startsAt ? `Starts ${date(coupon.startsAt)}` : 'Available now'}</span><span>{coupon.expiresAt ? `Expires ${date(coupon.expiresAt)}` : 'No expiry date'}</span></div>
                <div className="coupon-card__usage"><span>{coupon.used || 0} / {coupon.limit || '∞'} used</span>{coupon.limit && <span><i style={{ width: `${Math.min(100, coupon.used / coupon.limit * 100)}%` }} /></span>}</div>
                <div className="coupon-card__actions"><button type="button" onClick={() => openEdit(coupon)}><Pencil size={14} /> Edit</button><button type="button" className="is-danger" onClick={() => remove(coupon)}><Trash2 size={14} /> Delete</button></div>
              </div>
            </article>
          })}
          {!filtered.length && <div className="product-grid-empty">No coupons found. Create your first offer to get started.</div>}
        </div>
      </DataPanel>
      {editor && <Modal title={editor.id ? 'Edit coupon' : 'Create coupon'} onClose={() => setEditor(null)}>
        <form className="admin-form" onSubmit={save}>
          <FormField label="Coupon code"><input required minLength={3} maxLength={24} value={editor.code} onChange={(event) => setEditor({ ...editor, code: event.target.value })} placeholder="SPRING20" /></FormField>
          <FormField label="Offer name"><input maxLength={80} value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} placeholder="Spring seasonal offer" /></FormField>
          <FormField label="Description"><textarea rows={2} maxLength={220} value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} /></FormField>
          <div className="admin-form__row">
            <FormField label="Discount type"><select value={editor.kind} onChange={(event) => setEditor({ ...editor, kind: event.target.value })}><option value="percent">Percent off</option><option value="fixed">Fixed amount off</option></select></FormField>
            <FormField label={editor.kind === 'percent' ? 'Discount (%)' : 'Discount (Rs.)'}><input type="number" min="1" step="1" max={editor.kind === 'percent' ? '100' : undefined} required value={editor.value} onChange={(event) => setEditor({ ...editor, value: event.target.value })} /></FormField>
          </div>
          <div className="admin-form__row">
            <FormField label="Minimum spend (Rs.)"><input type="number" min="0" step="1" value={editor.minSpend} onChange={(event) => setEditor({ ...editor, minSpend: event.target.value })} /></FormField>
            <FormField label="Redemption limit"><input type="number" min="1" step="1" value={editor.limit || ''} onChange={(event) => setEditor({ ...editor, limit: event.target.value })} placeholder="Unlimited" /></FormField>
          </div>
          <div className="admin-form__row">
            <FormField label="Start date"><input type="date" value={editor.startsAt} onChange={(event) => setEditor({ ...editor, startsAt: event.target.value })} /></FormField>
            <FormField label="Expiry date"><input type="date" value={editor.expiresAt} onChange={(event) => setEditor({ ...editor, expiresAt: event.target.value })} /></FormField>
          </div>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <div className="admin-form__actions"><button type="button" className="data-button data-button--secondary" onClick={() => setEditor(null)}>Cancel</button><button type="submit" className="data-button data-button--primary">{editor.id ? 'Save coupon' : 'Create coupon'}</button></div>
        </form>
      </Modal>}
    </div>
  )
}

export function ReviewsPage() {
  return (
    <div className="data-page">
      <PageHeader title="Reviews" description="Review moderation and customer ratings." />
      <DataPanel className="feature-unavailable">
        <span><MessageSquareText size={23} /></span>
        <h3>Reviews are not available through the current API</h3>
        <p>This backend does not yet expose customer reviews or moderation endpoints. Review data is not fabricated here. Add a reviews API to enable ratings, replies, approvals, and exports.</p>
      </DataPanel>
    </div>
  )
}

export function SettingsPage() {
  const profile = useAdminData(() => adminRequest('/auth/me'))
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const user = profile.data?.user
  const values = form || { username: user?.username || '', email: user?.email || '', phone: user?.phone || '' }

  const save = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const updated = await adminJson('/admin/profile', 'PATCH', {
        username: values.username.trim(),
        email: values.email.trim(),
        ...(values.phone !== undefined ? { phone: values.phone.trim() } : {}),
      })
      profile.setData({ user: updated })
      setForm(null)
      setNotice('Your administrator profile has been updated.')
    } catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  const signOut = async () => {
    try {
      await adminRequest('/auth/logout', { method: 'POST' })
      window.location.assign('/admin/login')
    } catch (requestError) { setError(requestError.message) }
  }

  return (
    <div className="data-page">
      <PageHeader title="Settings" description="Manage your administrator account and session." />
      <LoadState loading={profile.loading} error={profile.error} onRetry={profile.reload}>
        <DataPanel className="settings-panel">
          <div className="data-panel__heading"><div><h3>Administrator profile</h3><p>These details are associated with your signed-in admin account.</p></div></div>
          <form className="admin-form settings-form" onSubmit={save}>
            <div className="admin-form__row"><FormField label="Name"><input required minLength={3} maxLength={50} value={values.username} onChange={(event) => setForm({ ...values, username: event.target.value })} /></FormField><FormField label="Email"><input required type="email" value={values.email} onChange={(event) => setForm({ ...values, email: event.target.value })} /></FormField></div>
            <FormField label="Phone"><input maxLength={30} value={values.phone || ''} onChange={(event) => setForm({ ...values, phone: event.target.value })} placeholder="Add a contact phone number" /></FormField>
            <p className="settings-note">Password changes are not supported by the current admin API.</p>
            {error && <p className="inline-error" role="alert">{error}</p>}
            {notice && <p className="inline-success" role="status">{notice}</p>}
            <div className="admin-form__actions"><button type="submit" className="data-button data-button--primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button></div>
          </form>
        </DataPanel>
        <DataPanel className="settings-panel settings-session">
          <div><h3>Sign out</h3><p>End this administrator session on this device.</p></div>
          <button type="button" className="data-button data-button--danger" onClick={signOut}><X size={15} /> Sign out</button>
        </DataPanel>
      </LoadState>
    </div>
  )
}
