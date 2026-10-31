// Smoke test for the admin API — run with the server listening on :9000.
//   node scripts/test-admin.js
const BASE = 'http://localhost:9000'

let passed = 0
let failed = 0
const ok = (label, cond, extra = '') => {
    if (cond) { passed++; console.log(`  PASS  ${label} ${extra}`) }
    else { failed++; console.log(`  FAIL  ${label} ${extra}`) }
}

const req = async (path, { method = 'GET', body, cookie } = {}) => {
    const headers = {}
    if (body) headers['Content-Type'] = 'application/json'
    if (cookie) headers['Cookie'] = cookie
    const res = await fetch(BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    const json = await res.json().catch(() => null)
    const setCookie = res.headers.getSetCookie?.() || []
    return { status: res.status, json, cookie: setCookie.map(c => c.split(';')[0]).join('; ') }
}

const ADMIN = { email: 'admin@arifcakes.com', password: 'Bakery@2026' }

// --- auth --------------------------------------------------------------------
console.log('\nAuth')
const login = await req('/admin/login', { method: 'POST', body: ADMIN })
ok('admin login', login.status === 200 && login.json?.success, `(${login.status})`)
const adminCookie = login.cookie
const adminId = login.json?.data?.user?.id

// --- guards: nobody else may touch these -------------------------------------
console.log('\nGuards')
ok('guest cannot list customers', (await req('/admin/customers')).status === 401)
ok('guest cannot delete a customer', (await req('/admin/customers/000000000000000000000000', { method: 'DELETE' })).status === 401)
ok('guest cannot update the admin profile', (await req('/admin/profile', { method: 'PATCH', body: { username: 'Nobody' } })).status === 401)

const customer = { username: 'Admin Api Probe', email: 'admin.probe@example.com', password: 'Customer@123' }
await req('/auth/register', { method: 'POST', body: customer }) // may already exist
const cLogin = await req('/auth/login', { method: 'POST', body: { email: customer.email, password: customer.password } })
ok('customer login', cLogin.status === 200, `(${cLogin.status})`)
ok('customer cannot list customers', (await req('/admin/customers', { cookie: cLogin.cookie })).status === 403)
ok('customer cannot delete a customer', (await req('/admin/customers/000000000000000000000000', { method: 'DELETE', cookie: cLogin.cookie })).status === 403)
ok('customer cannot update the admin profile', (await req('/admin/profile', { method: 'PATCH', cookie: cLogin.cookie, body: { username: 'Nobody' } })).status === 403)

// --- listing -----------------------------------------------------------------
console.log('\nListing customers')
const list = await req('/admin/customers', { cookie: adminCookie })
ok('GET /admin/customers (admin)', list.status === 200 && Array.isArray(list.json?.data), `(${list.status})`)
const probe = (list.json?.data || []).find(u => u.email === customer.email)
ok('registered customer shows up for the admin', Boolean(probe), probe ? `(${probe.username})` : '')
ok('admins are not in the customer list', (list.json?.data || []).every(u => u.role === 'customer'))

// --- the admin's own profile -------------------------------------------------
console.log('\nAdmin profile')
const me0 = await req('/auth/me', { cookie: adminCookie })
const original = me0.json?.data?.user
const renamed = await req('/admin/profile', {
    method: 'PATCH',
    cookie: adminCookie,
    body: { username: 'Renamed Probe Admin', phone: '+92 300 1112233' },
})
ok('PATCH /admin/profile', renamed.status === 200 && renamed.json?.data?.username === 'Renamed Probe Admin', `(${renamed.status})`)
ok('profile response never leaks the password', !('password' in (renamed.json?.data || {})))
const me1 = await req('/auth/me', { cookie: adminCookie })
ok('the change is visible on /auth/me', me1.json?.data?.user?.username === 'Renamed Probe Admin')

const badEmail = await req('/admin/profile', {
    method: 'PATCH',
    cookie: adminCookie,
    body: { email: customer.email }, // taken by the probe customer
})
ok('email already in use is rejected with 409', badEmail.status === 409, `(${badEmail.status})`)

const emptyBody = await req('/admin/profile', { method: 'PATCH', cookie: adminCookie, body: {} })
ok('empty profile update rejected with 400', emptyBody.status === 400, `(${emptyBody.status})`)

// Put the original details back so the next run starts from a known state.
const restored = await req('/admin/profile', {
    method: 'PATCH',
    cookie: adminCookie,
    body: { username: original.username, email: original.email, phone: '' },
})
ok('profile restored', restored.status === 200 && restored.json?.data?.username === original.username, `(${restored.status})`)

// --- dashboard stats ---------------------------------------------------------
console.log('\nDashboard stats')
ok('guest cannot read stats', (await req('/admin/stats')).status === 401)
ok('customer cannot read stats', (await req('/admin/stats', { cookie: cLogin.cookie })).status === 403)

const statsRes = await req('/admin/stats', { cookie: adminCookie })
ok('GET /admin/stats (admin)', statsRes.status === 200 && statsRes.json?.success, `(${statsRes.status})`)
const stats = statsRes.json?.data || {}

const orderList = (await req('/orders', { cookie: adminCookie })).json?.data || []
const cakeList = (await req('/cakes')).json?.data || []
const customerList = (await req('/admin/customers', { cookie: adminCookie })).json?.data || []
const expectedRevenue = orderList.filter(o => o.status !== 'Cancelled').reduce((a, o) => a + (Number(o.totalAmount) || 0), 0)
const expectedStock = cakeList.reduce((a, c) => a + (Number(c.stock) || 0), 0)

ok('totalOrders matches the order list', stats.totalOrders === orderList.length, `(${stats.totalOrders} vs ${orderList.length})`)
ok('revenue excludes cancelled orders', Math.abs((stats.revenue || 0) - expectedRevenue) < 0.01, `(${stats.revenue} vs ${expectedRevenue})`)
ok('stock matches the catalogue', stats.stock === expectedStock, `(${stats.stock} vs ${expectedStock})`)
ok('customers matches the customer list', stats.customers === customerList.length, `(${stats.customers} vs ${customerList.length})`)

// --- deleting ----------------------------------------------------------------
console.log('\nDelete customer')
ok('deleting your own account is rejected', (await req(`/admin/customers/${adminId}`, { method: 'DELETE', cookie: adminCookie })).status === 400)
ok('malformed id rejected with 400', (await req('/admin/customers/not-an-id', { method: 'DELETE', cookie: adminCookie })).status === 400)
ok('unknown customer is a 404', (await req('/admin/customers/000000000000000000000000', { method: 'DELETE', cookie: adminCookie })).status === 404)

const removed = await req(`/admin/customers/${probe._id}`, { method: 'DELETE', cookie: adminCookie })
ok('DELETE /admin/customers/:id', removed.status === 200 && removed.json?.success, `(${removed.status})`)
const after = await req('/admin/customers', { cookie: adminCookie })
ok('the customer is gone from the list', !(after.json?.data || []).some(u => u._id === probe._id))
ok('deleting twice is a 404', (await req(`/admin/customers/${probe._id}`, { method: 'DELETE', cookie: adminCookie })).status === 404)
ok('the deleted account can no longer sign in', (await req('/auth/login', { method: 'POST', body: { email: customer.email, password: customer.password } })).status === 401)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
