import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  CakeSlice,
  ChevronDown,
  ChevronRight,
  Grid2X2,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  TicketPercent,
  UsersRound,
  X,
} from 'lucide-react'
import { useSliderStore } from '../useSliderStore'
import { adminRequest } from '../adminApi'

const navGroups = [
  {
    label: 'Workspace',
    links: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Store management',
    links: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/customers', label: 'Customers', icon: UsersRound },
      { to: '/admin/slider', label: 'Sidebar Slider', icon: Image },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
      { to: '/admin/categories', label: 'Categories', icon: Grid2X2 },
      { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
      { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function Brand() {
  return (
    <NavLink to="/admin" className="admin-brand" aria-label="Sweet Bites admin home">
      <CakeSlice size={31} strokeWidth={1.5} />
      <span>
        <strong>Sweet Bites</strong>
        <small>Fresh Cakes · Happy Moments</small>
      </span>
    </NavLink>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [savedNotice, setSavedNotice] = useState('')
  const location = useLocation()
  const { saveSlides, dirty, storageError } = useSliderStore()
  const currentLabel = navGroups.flatMap((group) => group.links).find((link) => link.to === location.pathname)?.label || 'Admin'
  const [logoutError, setLogoutError] = useState('')

  const saveChanges = () => {
    if (saveSlides()) setSavedNotice('Changes saved on this device.')
    else setSavedNotice('')
    window.setTimeout(() => setSavedNotice(''), 3500)
  }

  const signOut = async () => {
    try {
      await adminRequest('/auth/logout', { method: 'POST' })
      window.location.assign('/admin/login')
    } catch (error) {
      setLogoutError(error.message)
    }
  }

  return (
    <div className="admin-shell">
      {sidebarOpen && <button className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Admin navigation">
        <div className="admin-sidebar__brand"><Brand /><button type="button" className="admin-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
        <nav className="admin-nav">
          {navGroups.map((group) => (
            <div className="admin-nav__group" key={group.label}>
              <p className="admin-nav__label">{group.label}</p>
              {group.links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  {label === 'Sidebar Slider' && <ChevronRight size={15} className="admin-nav__chevron" />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__account">
            <span className="admin-profile__avatar">A</span>
            <span><strong>Admin account</strong><small>Store administrator</small></span>
          </div>
          <button type="button" className="admin-sidebar__signout" onClick={signOut}><LogOut size={15} /> Sign out</button>
          <p className="admin-sidebar__copyright">© {new Date().getFullYear()} Sweet Bites. All rights reserved.</p>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className={`admin-topbar${location.pathname === '/admin' ? ' admin-topbar--dashboard' : ''}`}>
          <button type="button" className="admin-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <form className="admin-search" role="search" onSubmit={(event) => {
            event.preventDefault()
            const query = new FormData(event.currentTarget).get('query')?.toString().trim()
            if (query) window.location.assign(`/admin/products?q=${encodeURIComponent(query)}`)
          }}>
            <Search size={16} aria-hidden="true" />
            <input name="query" aria-label="Search products" placeholder="Search products..." />
          </form>
          <div className="admin-topbar__right">
            <span className="admin-topbar__date">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {(dirty || savedNotice) && (
              <button type="button" className="admin-save-button" onClick={saveChanges} disabled={!dirty}>
                <span>{dirty ? 'Save Changes' : savedNotice}</span>
              </button>
            )}
            <NavLink to="/admin/settings" className="admin-profile" aria-label="Admin settings">
              <span className="admin-profile__avatar">A</span>
              <span><strong>Admin</strong><small>Administrator</small></span>
              <ChevronDown size={14} />
            </NavLink>
          </div>
        </header>

        <main className="admin-content">
          {(storageError || logoutError) && <p className="admin-alert" role="alert">{logoutError || storageError}</p>}
          <div className={`admin-content__heading${location.pathname === '/admin' ? ' admin-content__heading--dashboard' : ''}`}>
            <div>
              <h1>{currentLabel}</h1>
              {location.pathname === '/admin/slider' && <p>Create and manage image slides and promotional cards shown on your sidebar.</p>}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
