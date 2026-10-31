import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CakeSlice,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Package,
  Pencil,
  PieChart,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
  TicketPercent,
  UserRound,
  UsersRound,
  Zap,
} from 'lucide-react'
import { adminJson, adminRequest, imageUrl } from '../adminApi'
import { useAdminData } from '../hooks/useAdminData'
import { DataPanel, DataTable, DataToolbar, LoadState, MetricGrid, Modal, PageHeader, Pagination, SearchBox, StatusPill } from '../components/AdminUI'

const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`
const date = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const array = (value) => Array.isArray(value) ? value : []
const pageSize = 8
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']
const NEXT_ORDER_STATUS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered'],
  Delivered: [],
  Cancelled: [],
}

function usePagedRows(rows, query, filter) {
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => (!filter || filter(row)) && (!needle || JSON.stringify(row).toLowerCase().includes(needle)))
  }, [rows, query, filter])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pages)
  const items = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  return { page: currentPage, setPage, pages, total: filtered.length, items }
}

export function DashboardPage() {
  const stats = useAdminData(() => adminRequest('/admin/stats'))
  const orders = useAdminData(() => adminRequest('/orders'))
  const cakes = useAdminData(() => adminRequest('/cakes'))
  const [dateRange, setDateRange] = useState(7)

  const allOrders = useMemo(() => array(orders.data), [orders.data])
  const allCakes = useMemo(() => array(cakes.data), [cakes.data])
  const recentOrders = allOrders.slice(0, 5)

  const s = stats.data || {}
  const totalOrders = Number(s.totalOrders || 0)
  const revenue = Number(s.revenue || 0)
  const customers = Number(s.customers || 0)

  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Processing: 0, Delivered: 0, Cancelled: 0 }
    allOrders.forEach((order) => {
      const status = String(order.status || 'Pending').toLowerCase()
      const key = status === 'delivered'
        ? 'Delivered'
        : status === 'cancelled'
          ? 'Cancelled'
          : status === 'pending'
            ? 'Pending'
            : 'Processing'
      counts[key] += 1
    })
    return counts
  }, [allOrders])

  const dailyRevenue = useMemo(() => {
    const days = []
    for (let i = dateRange - 1; i >= 0; i--) {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      day.setDate(day.getDate() - i)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      const value = allOrders
        .filter((o) => { const c = new Date(o.createdAt); return c >= day && c < next })
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
      days.push({ label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value })
    }
    return days
  }, [allOrders, dateRange])

  const topProducts = useMemo(() => {
    const sales = {}
    allOrders.forEach((order) => {
      array(order.items).forEach((item) => {
        const name = item.name || item.cakename
        if (!name) return
        if (!sales[name]) {
          const cake = allCakes.find((product) => product.name === name)
          sales[name] = { name, sold: 0, price: Number(item.price || cake?.price || 0), photo: cake?.photo }
        }
        sales[name].sold += Number(item.quantity || 0)
      })
    })
    return Object.values(sales).sort((a, b) => b.sold - a.sold).slice(0, 5)
  }, [allOrders, allCakes])

  const lowStock = allCakes.filter((cake) => Number(cake.stock) <= 5 && cake.isAvailable !== false)

  const loading = stats.loading || orders.loading || cakes.loading
  const error = stats.error || orders.error || cakes.error

  return (
    <div className="data-page">
      <div className="dashboard__header">
        <div className="dashboard__header__text">
          <h1>Welcome back, Admin!</h1>
          <p>Here's what's happening with your bakery today.</p>
        </div>
        <div className="dashboard__header__meta">
          <span><CalendarDays size={15} /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <LoadState loading={loading} error={error} onRetry={() => { stats.reload(); orders.reload(); cakes.reload() }}>
        <MetricGrid metrics={[
          { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, tone: 'purple', trend: '+12%', trendUp: true },
          { label: 'Total Revenue', value: money(revenue), icon: Banknote, tone: 'green', trend: '+18%', trendUp: true },
          { label: 'Total Customers', value: customers, icon: UsersRound, tone: 'blue', trend: '+9%', trendUp: true },
          { label: 'Average Rating', value: '4.8', icon: Star, tone: 'amber', trend: '+2%', trendUp: true },
        ]} />

        <div className="dashboard-grid dashboard-grid--overview">
          <DataPanel className="dashboard-panel--chart sales-panel">
            <div className="data-panel__heading">
              <div className="dashboard-panel__title"><Activity size={17} /><div><h3>Sales Overview</h3><p>Revenue over the last {dateRange} days.</p></div></div>
              <select className="data-select" aria-label="Sales date range" value={dateRange} onChange={(event) => setDateRange(Number(event.target.value))}>
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
            <SalesSparkline days={dailyRevenue} />
          </DataPanel>

          <DataPanel className="dashboard-panel--chart status-panel">
            <div className="data-panel__heading"><div className="dashboard-panel__title"><PieChart size={17} /><div><h3>Order Status</h3><p>{allOrders.length} orders in your store.</p></div></div></div>
            <StatusDonut counts={statusCounts} total={totalOrders} />
          </DataPanel>

          <DataPanel className="dashboard-panel--actions">
            <div className="data-panel__heading"><div className="dashboard-panel__title"><Zap size={17} /><div><h3>Quick Actions</h3><p>Common admin tasks.</p></div></div></div>
            <div className="quick-actions">
              <Link className="quick-action" to="/admin/products"><Plus size={15} /><span>Add New Product</span></Link>
              <Link className="quick-action" to="/admin/orders"><ShoppingCart size={15} /><span>Manage Orders</span></Link>
              <Link className="quick-action" to="/admin/customers"><UsersRound size={15} /><span>View Customers</span></Link>
              <Link className="quick-action" to="/admin/coupons"><TicketPercent size={15} /><span>Create Coupon</span></Link>
            </div>
          </DataPanel>
        </div>

        <div className="dashboard-grid dashboard-grid--lower">
          <DataPanel className="dashboard-panel--recent">
            <div className="data-panel__heading"><div className="dashboard-panel__title"><ShoppingBag size={17} /><div><h3>Recent Orders</h3><p>Latest activity from your customers.</p></div></div><Link to="/admin/orders" className="text-link">View all <ArrowUpRight size={14} /></Link></div>
            <DataTable minWidth={560} columns={[
              { key: 'order', label: 'Order', render: (row) => <strong>#{row.orderNumber || String(row._id).slice(-7)}</strong> },
              { key: 'customer', label: 'Customer', render: (row) => row.customerName || row.customer?.username || row.customerEmail || 'Guest' },
              { key: 'status', label: 'Status', render: (row) => <StatusPill status={row.status}>{row.status || 'Pending'}</StatusPill> },
              { key: 'total', label: 'Total', render: (row) => money(row.totalAmount) },
              { key: 'date', label: 'Date', render: (row) => date(row.createdAt) },
            { key: 'time', label: 'Time', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'u2014' },
            ]} rows={recentOrders.map((row) => ({ ...row, id: row._id }))} empty="No orders have been placed yet." minWidth={380} />
          </DataPanel>

          <DataPanel className="dashboard-panel--products">
              <div className="data-panel__heading"><div className="dashboard-panel__title"><CakeSlice size={17} /><div><h3>Top Products</h3><p>Best sellers by units sold.</p></div></div><Link to="/admin/products" className="text-link">View all <ArrowUpRight size={14} /></Link></div>
              <div className="top-products-list">
                {topProducts.length ? topProducts.map((item) => (
                  <div key={item.name} className="top-product-row">
                    <div className="top-product__photo">{item.photo ? <img src={imageUrl(item.photo)} alt="" /> : <CakeSlice size={18} />}</div>
                    <div className="top-product__info">
                      <strong>{item.name}</strong>
                      <small>{item.sold} sold</small>
                    </div>
                    <span className="top-product__price">{money(item.price)}</span>
                  </div>
                )) : <p className="empty-copy">No product sales recorded yet.</p>}
              </div>

          </DataPanel>

          <DataPanel className="dashboard-panel--lowstock">
              <div className="data-panel__heading"><div className="dashboard-panel__title"><Package size={17} /><div><h3>Low Stock Alert</h3><p>Products that may need restocking.</p></div></div></div>
              <div className="low-stock-list">
                {lowStock.length ? lowStock.slice(0, 5).map((cake) => (
                  <div key={cake._id} className="low-stock-row">
                    <div className="low-stock__photo" style={{ backgroundImage: `url(${imageUrl(cake.photo)})` }} />
                    <div className="low-stock__info">
                      <strong>{cake.name}</strong>
                      <small>{cake.stock} left</small>
                    </div>
                    <StatusPill status={cake.stock === 0 ? 'cancelled' : 'upcoming'}>{cake.stock === 0 ? 'Out of stock' : 'Low stock'}</StatusPill>
                  </div>
                )) : <p className="empty-copy">All products have healthy stock levels.</p>}
              </div>
          </DataPanel>
        </div>
      </LoadState>
    </div>
  )
}

function SalesSparkline({ days }) {
  const max = Math.max(1, ...days.map((d) => d.value))
  const width = 520
  const height = 180
  const padding = { top: 12, right: 8, bottom: 18, left: 8 }
  const plotBottom = height - padding.bottom
  const plotHeight = plotBottom - padding.top
  const step = (width - padding.left - padding.right) / (days.length - 1 || 1)
  const points = days.map((d, i) => {
    const x = padding.left + i * step
    const y = padding.top + plotHeight - (d.value / max) * plotHeight
    return `${x},${y}`
  }).join(' ')
  const area = `${points} ${width - padding.right},${plotBottom} ${padding.left},${plotBottom}`
  const labelStep = Math.ceil(days.length / 7)

  return (
    <div className="sales-sparkline">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Sales trend over the last ${days.length} days`} className="sales-sparkline__svg">
        <defs>
          <linearGradient id="sales-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f18d7d" stopOpacity=".28" />
            <stop offset="100%" stopColor="#f18d7d" stopOpacity=".02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding.top + (plotHeight / 3) * line
          return <line key={line} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#eeeae4" strokeWidth="1" />
        })}
        <polygon points={area} fill="url(#sales-area-fill)" />
        <polyline points={points} fill="none" stroke="#ed8177" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {days.map((d, i) => {
          const x = padding.left + i * step
          const y = padding.top + plotHeight - (d.value / max) * plotHeight
          return <circle key={d.label} cx={x} cy={y} r={days.length === 30 ? 1.8 : 3.2} fill="#fff" stroke="#ed8177" strokeWidth="2" />
        })}
      </svg>
      <div className="sales-sparkline__dates">
        {days.map((d, index) => (index % labelStep === 0 || index === days.length - 1) ? <span key={d.label}>{d.label}</span> : null)}
      </div>
    </div>
  )
}

function StatusDonut({ counts, total }) {
  const ordered = ['Pending', 'Processing', 'Delivered', 'Cancelled']
  const colors = { Pending: '#a98ae2', Processing: '#f3c65e', Delivered: '#55b890', Cancelled: '#ed8177' }
  const labels = { Pending: 'Pending', Processing: 'Processing', Delivered: 'Delivered', Cancelled: 'Cancelled' }
  const items = ordered
  const sum = items.reduce((acc, key) => acc + counts[key], 0)
  const circumference = 2 * Math.PI * 50
  let offset = 0
  const arcs = items.map((key) => {
    const value = counts[key] || 0
    const segment = sum ? (value / sum) * circumference : 0
    const arc = { key, value, color: colors[key], label: labels[key], pct: sum ? Math.round((value / sum) * 100) : 0, segment, offset }
    offset += segment
    return arc
  })

  return (
    <div className="status-donut">
      <div className="status-donut__chart">
        <svg viewBox="0 0 140 140" className="status-donut__svg">
          <circle cx="70" cy="70" r="50" fill="none" stroke="#f3e8ff" strokeWidth="12" />
          {arcs.map((arc) => arc.value > 0 && <circle key={arc.key} cx="70" cy="70" r="50" fill="none" stroke={arc.color} strokeWidth="12" strokeDasharray={`${arc.segment} ${circumference}`} strokeDashoffset={-arc.offset} transform="rotate(-90 70 70)" />)}
          <text x="70" y="64" textAnchor="middle" fontSize="18" fontWeight="700" fill="#242a33">{total}</text>
          <text x="70" y="84" textAnchor="middle" fontSize="10" fill="#78808b">Total Orders</text>
        </svg>
      </div>
      <div className="status-donut__legend">
        {arcs.map((arc) => (
          <div key={arc.key} className="status-donut__legend-item">
            <span className="status-donut__legend-color" style={{ background: arc.color }} />
            <span>{arc.label}</span>
            <span className="status-donut__legend-value">{arc.value} ({arc.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrdersPage() {
  const resource = useAdminData(() => adminRequest('/orders'))
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [actionError, setActionError] = useState('')
  const [workingId, setWorkingId] = useState('')
  const rows = array(resource.data)
  const filter = useMemo(() => (row) => !statusFilter || row.status === statusFilter, [statusFilter])
  const paged = usePagedRows(rows, query, filter)

  const updateStatus = async (order, status) => {
    setActionError('')
    setWorkingId(order._id)
    try {
      const updated = await adminJson(`/orders/${order._id}/status`, 'PATCH', { status })
      resource.setData((current) => current.map((item) => item._id === order._id ? updated : item))
      setSelected(updated)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setWorkingId('')
    }
  }

  const removeOrder = async (order) => {
    if (!window.confirm(`Permanently delete order ${order.orderNumber || order._id}?`)) return
    setActionError('')
    setWorkingId(order._id)
    try {
      await adminRequest(`/orders/${order._id}`, { method: 'DELETE' })
      resource.setData((current) => current.filter((item) => item._id !== order._id))
      setSelected(null)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setWorkingId('')
    }
  }

  return (
    <div className="data-page">
      <PageHeader title="Orders" description="Track, manage, and process customer orders." actions={<button type="button" className="data-button data-button--primary"><Plus size={16} /> Create New Order</button>} />
      <LoadState loading={resource.loading} error={resource.error} onRetry={resource.reload}>
        <MetricGrid metrics={[
          { label: 'Total orders', value: rows.length, icon: ShoppingBag, tone: 'purple' },
          { label: 'Pending', value: rows.filter((row) => row.status === 'Pending').length, icon: Clock3, tone: 'amber' },
          { label: 'In progress', value: rows.filter((row) => ['Confirmed', 'Preparing', 'Out for Delivery'].includes(row.status)).length, icon: Truck, tone: 'blue' },
          { label: 'Delivered', value: rows.filter((row) => row.status === 'Delivered').length, icon: CheckCircle2, tone: 'green' },
        ]} />
        <DataPanel>
          <DataToolbar>
            <SearchBox value={query} onChange={(value) => { setQuery(value); paged.setPage(1) }} placeholder="Search order or customer..." />
            <select className="data-select" aria-label="Filter by order status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); paged.setPage(1) }}>
              <option value="">All statuses</option>{ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </DataToolbar>
          {actionError && <p className="inline-error" role="alert">{actionError}</p>}
          <DataTable minWidth={850} columns={[
            { key: 'number', label: 'Order ID', render: (row) => <strong>#{row.orderNumber || String(row._id).slice(-7)}</strong> },
            { key: 'customer', label: 'Customer', render: (row) => <span>{row.customerName || row.customer?.username || 'Guest'}<small className="table-subtext">{row.customerEmail || row.customer?.email}</small></span> },
            { key: 'items', label: 'Items', render: (row) => array(row.items).map((item) => `${item.name} ×${item.quantity}`).join(', ') || '—' },
            { key: 'date', label: 'Date', render: (row) => date(row.createdAt) },
            { key: 'time', label: 'Time', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'u2014' },
            { key: 'status', label: 'Status', render: (row) => <StatusPill>{row.status}</StatusPill> },
            { key: 'total', label: 'Total', render: (row) => money(row.totalAmount) },
            { key: 'actions', label: 'Actions', render: (row) => <span className="table-actions"><button type="button" onClick={() => setSelected(row)} aria-label={`View order ${row.orderNumber}`}><Eye size={15} /></button><button type="button" onClick={() => setSelected(row)} aria-label={`Edit order ${row.orderNumber}`}><Pencil size={15} /></button><button type="button" onClick={() => removeOrder(row)} disabled={workingId === row._id} aria-label={`Delete order ${row.orderNumber}`}><Trash2 size={15} /></button></span> },
          ]} rows={paged.items.map((row) => ({ ...row, id: row._id }))} empty="No orders match your search." />
          <Pagination {...paged} pageSize={pageSize} onChange={paged.setPage} />
        </DataPanel>
      </LoadState>
      {selected && <Modal title={`Order ${selected.orderNumber || `#${String(selected._id).slice(-7)}`}`} onClose={() => setSelected(null)} wide>
        <div className="order-detail-grid">
          <p><span>Customer</span><strong>{selected.customerName || selected.customer?.username || 'Guest'}</strong></p>
          <p><span>Email</span><strong>{selected.customerEmail || selected.customer?.email || '—'}</strong></p>
          <p><span>Phone</span><strong>{selected.phone || '—'}</strong></p>
          <p><span>Placed</span><strong>{date(selected.createdAt)}</strong></p>
          <p className="order-detail-grid__wide"><span>Delivery address</span><strong>{selected.deliveryAddress || '—'}</strong></p>
        </div>
        <DataTable minWidth={420} columns={[
          { key: 'name', label: 'Item', render: (row) => row.name },
          { key: 'quantity', label: 'Quantity' },
          { key: 'price', label: 'Unit price', render: (row) => money(row.price) },
          { key: 'total', label: 'Subtotal', render: (row) => money(row.price * row.quantity) },
        ]} rows={array(selected.items).map((item, index) => ({ ...item, id: item._id || `${item.name}-${index}`, total: item.price * item.quantity }))} empty="No items listed." />
        <div className="order-detail-footer"><p>Total: <strong>{money(selected.totalAmount)}</strong></p><label>Update status<select className="data-select" value={selected.status} disabled={workingId === selected._id} onChange={(event) => updateStatus(selected, event.target.value)}><option value={selected.status}>{selected.status}</option>{(NEXT_ORDER_STATUS[selected.status] || []).map((status) => <option key={status}>{status}</option>)}</select></label></div>
      </Modal>}
    </div>
  )
}

export function CustomersPage() {
  const resource = useAdminData(() => adminRequest('/admin/customers?role=customer'))
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [selected, setSelected] = useState(null)
  const [actionError, setActionError] = useState('')
  const rows = array(resource.data)
  const [now] = useState(() => Date.now())
  const filter = useMemo(() => (row) => {
    if (type === 'Active') return row.isActive !== false
    if (type === 'Inactive') return row.isActive === false
    if (type === 'New') return now - new Date(row.createdAt).getTime() < 30 * 86400000
    return true
  }, [type, now])
  const paged = usePagedRows(rows, query, filter)

  const remove = async (customer) => {
    if (!window.confirm(`Delete customer ${customer.username} (${customer.email})? This cannot be undone.`)) return
    setActionError('')
    try {
      await adminRequest(`/admin/customers/${customer._id}`, { method: 'DELETE' })
      resource.setData((current) => current.filter((item) => item._id !== customer._id))
      setSelected(null)
    } catch (error) {
      setActionError(error.message)
    }
  }

  return (
    <div className="data-page">
      <PageHeader title="Customers" description="Manage and view your bakery’s customer base." />
      <LoadState loading={resource.loading} error={resource.error} onRetry={resource.reload}>
        <MetricGrid metrics={[
          { label: 'Total customers', value: rows.length, icon: UsersRound, tone: 'blue' },
          { label: 'New customers (30d)', value: rows.filter((row) => now - new Date(row.createdAt).getTime() < 30 * 86400000).length, icon: UserRound, tone: 'purple' },
          { label: 'Active customers', value: rows.filter((row) => row.isActive !== false).length, icon: CheckCircle2, tone: 'green' },
          { label: 'Inactive customers', value: rows.filter((row) => row.isActive === false).length, icon: UserRound, tone: 'amber' },
        ]} />
        <DataPanel>
          <DataToolbar>
            <SearchBox value={query} onChange={(value) => { setQuery(value); paged.setPage(1) }} placeholder="Search customers..." />
            <select className="data-select" aria-label="Filter customer type" value={type} onChange={(event) => { setType(event.target.value); paged.setPage(1) }}>
              <option value="">All customer types</option><option>Active</option><option>New</option><option>Inactive</option>
            </select>
          </DataToolbar>
          {actionError && <p className="inline-error" role="alert">{actionError}</p>}
          <DataTable minWidth={780} columns={[
            { key: 'idLabel', label: 'Customer ID', render: (row) => `#${String(row._id).slice(-6).toUpperCase()}` },
            { key: 'username', label: 'Name', render: (row) => <span style={{display:'flex',alignItems:'center',gap:'7px'}}><span className="admin-profile__avatar" style={{width:'26px',height:'26px',fontSize:'11px',flexShrink:0}}>{(row.username||'G').slice(0,1).toUpperCase()}</span><strong>{row.username}</strong></span> },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
            { key: 'city', label: 'City', render: (row) => row.city || '—' },
            { key: 'createdAt', label: 'Registered', render: (row) => date(row.createdAt) },
            { key: 'actions', label: 'Actions', render: (row) => <span className="table-actions"><button type="button" onClick={() => setSelected(row)} aria-label={`View ${row.username}`}><Eye size={15} /></button><button type="button" onClick={() => setSelected(row)} aria-label={`Edit ${row.username}`}><Pencil size={15} /></button><button type="button" className="is-danger" onClick={() => remove(row)} aria-label={`Delete ${row.username}`}><Trash2 size={15} /></button></span> },
          ]} rows={paged.items.map((row) => ({ ...row, id: row._id }))} empty="No customers match your search." />
          <Pagination {...paged} pageSize={pageSize} onChange={paged.setPage} />
        </DataPanel>
      </LoadState>
      {selected && <Modal title="Customer details" onClose={() => setSelected(null)}>
        <div className="customer-detail">
          <span className="customer-detail__avatar">{selected.username?.slice(0, 1).toUpperCase()}</span>
          <h3>{selected.username}</h3>
          <p>{selected.email}</p>
          <dl><div><dt>Phone</dt><dd>{selected.phone || 'Not provided'}</dd></div><div><dt>City</dt><dd>{selected.city || 'Not provided'}</dd></div><div><dt>Registered</dt><dd>{date(selected.createdAt)}</dd></div></dl>
        </div>
      </Modal>}
    </div>
  )
}

export function ReportsPage() {
  const orders = useAdminData(() => adminRequest('/orders'))
  const cakes = useAdminData(() => adminRequest('/cakes'))
  const categories = useAdminData(() => adminRequest('/categories'))
  const data = array(orders.data)
  const availableOrders = data.filter((order) => order.status !== 'Cancelled')
  const revenue = availableOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
  const average = availableOrders.length ? revenue / availableOrders.length : 0
  const categorySales = array(categories.data).map((category) => {
    const matched = availableOrders.filter((order) => array(order.items).some((item) => item.cake?.category === category.name || item.category === category.name))
    return { name: category.name, count: matched.length, color: category.chartColor || '#c4b5fd' }
  }).sort((a, b) => b.count - a.count)
  const topProducts = array(cakes.data).map((cake) => ({
    id: cake._id,
    name: cake.name,
    sold: availableOrders.reduce((sum, order) => sum + array(order.items).filter((item) => item.cake?._id === cake._id || item.cake === cake._id || item.name === cake.name).reduce((subtotal, item) => subtotal + Number(item.quantity || 0), 0), 0),
    price: cake.price,
  })).sort((a, b) => b.sold - a.sold).slice(0, 5)
  const loading = orders.loading || cakes.loading || categories.loading
  const error = orders.error || cakes.error || categories.error
  const downloadReport = () => {
    const csvRows = [['Order', 'Customer', 'Status', 'Date', 'Total'], ...data.map((order) => [order.orderNumber || order._id, order.customerName || order.customer?.username || 'Guest', order.status, date(order.createdAt), order.totalAmount])]
    const csv = csvRows.map((row) => row.map((field) => `"${String(field ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'sweet-bites-orders-report.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="data-page">
      <PageHeader title="Reports & Analytics" description="Sales and product performance, calculated from your actual orders." actions={<button type="button" className="data-button data-button--primary" disabled={loading || !data.length} onClick={downloadReport}><ArrowDownToLine size={16} /> Download report</button>} />
      <LoadState loading={loading} error={error} onRetry={() => { orders.reload(); cakes.reload(); categories.reload() }}>
        <MetricGrid metrics={[
          { label: 'Total revenue', value: money(revenue), icon: Banknote, tone: 'purple' },
          { label: 'Average order value', value: money(average), icon: ShoppingBag, tone: 'green' },
          { label: 'Total orders', value: availableOrders.length, icon: Package, tone: 'blue' },
          { label: 'Net units sold', value: availableOrders.reduce((sum, order) => sum + array(order.items).reduce((total, item) => total + Number(item.quantity || 0), 0), 0), icon: CakeSlice, tone: 'amber' },
        ]} />
        <div className="reports-grid">
          <DataPanel>
            <div className="data-panel__heading"><div><h3>Revenue by day</h3><p>Last 14 days from non-cancelled orders.</p></div><CalendarDays size={18} /></div>
            <RevenueChart orders={availableOrders} />
          </DataPanel>
          <DataPanel>
            <div className="data-panel__heading"><div><h3>Sales by category</h3><p>Orders containing category products.</p></div></div>
            {categorySales.length ? <div className="category-bars">{categorySales.slice(0, 6).map((item) => <div key={item.name}><div><span>{item.name}</span><strong>{item.count}</strong></div><span className="category-bars__track"><i style={{ width: `${Math.max(3, item.count / Math.max(1, categorySales[0].count) * 100)}%`, background: item.color }} /></span></div>)}</div> : <p className="empty-copy">Category data is not available yet.</p>}
          </DataPanel>
          <DataPanel className="reports-grid__wide">
            <div className="data-panel__heading"><div><h3>Top selling products</h3><p>Units sold from completed order records.</p></div></div>
            <DataTable minWidth={420} columns={[
              { key: 'rank', label: '#', render: (_, index) => index + 1 },
              { key: 'name', label: 'Product' },
              { key: 'sold', label: 'Units sold' },
              { key: 'price', label: 'Current price', render: (row) => money(row.price) },
            ]} rows={topProducts.map((item) => ({ ...item, id: item.id }))} empty="No product sales have been recorded." />
          </DataPanel>
        </div>
      </LoadState>
    </div>
  )
}

function RevenueChart({ orders }) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - (13 - index))
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    const value = orders.filter((order) => {
      const created = new Date(order.createdAt)
      return created >= day && created < next
    }).reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
    return { day, value }
  })
  const max = Math.max(1, ...days.map((item) => item.value))
  const points = days.map((item, index) => `${24 + index * 36},${126 - item.value / max * 100}`).join(' ')
  return (
    <div className="revenue-chart">
      <div className="revenue-chart__scale"><span>{money(max)}</span><span>{money(max / 2)}</span><span>Rs. 0</span></div>
      <svg viewBox="0 0 510 140" role="img" aria-label="Revenue per day for the last two weeks">
        {[25, 75, 125].map((y) => <line key={y} x1="20" x2="510" y1={y} y2={y} stroke="#eeece8" strokeDasharray="4 5" />)}
        <polyline points={points} fill="none" stroke="#cf6675" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {days.map((item, index) => <circle key={item.day.toISOString()} cx={24 + index * 36} cy={126 - item.value / max * 100} r="3" fill="#fff" stroke="#cf6675" strokeWidth="2" />)}
      </svg>
      <div className="revenue-chart__dates"><span>{date(days[0].day)}</span><span>{date(days[6].day)}</span><span>{date(days[13].day)}</span></div>
    </div>
  )
}
