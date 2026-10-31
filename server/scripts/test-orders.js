// Smoke test for the orders API — run with the server listening on :9000.
//   node scripts/test-orders.js
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

// --- auth -------------------------------------------------------------------
console.log('\nAuth')
const creds = { email: 'admin@arifcakes.com', password: 'Bakery@2026' }
const login = await req('/admin/login', { method: 'POST', body: creds })
ok('admin login', login.status === 200 && login.json?.success, `(${login.status})`)
const adminCookie = login.cookie
ok('admin has role admin', login.json?.data?.user?.role === 'admin')

const me = await req('/auth/me', { cookie: adminCookie })
ok('GET /auth/me', me.status === 200 && me.json?.data?.user?.email === creds.email)

// --- guests cannot touch admin endpoints ------------------------------------
console.log('\nGuards')
const noAuthOrders = await req('/orders')
ok('guest cannot list all orders', noAuthOrders.status === 401)
const noAuthCake = await req('/cakes/new', { method: 'POST' })
ok('guest cannot create cake', noAuthCake.status === 401)

// --- catalogue --------------------------------------------------------------
console.log('\nCatalogue')
const cakes = await req('/cakes')
ok('GET /cakes is public', cakes.status === 200 && Array.isArray(cakes.json?.data))
const cake = cakes.json.data[0]
ok('catalogue has a cake', Boolean(cake), cake ? `(${cake.name})` : '')
const stockBefore = cake.stock

// --- guest checkout ---------------------------------------------------------
console.log('\nGuest checkout')
const orderBody = {
    items: [{ cake: cake._id, name: cake.name, price: cake.price, quantity: 2 }],
    deliveryAddress: 'House 14, Street 3, Jinnahabad, Abbottabad',
    phone: '+92 300 1112233',
    deliveryDate: '2026-10-20',
    specialInstructions: 'Write "Happy Birthday" in white chocolate.',
    paymentMethod: 'Cash on Delivery',
    customerName: 'Guest Checkout',
    customerEmail: 'guest@example.com',
}
const placed = await req('/orders', { method: 'POST', body: orderBody })
ok('POST /orders (guest)', placed.status === 201 && placed.json?.success, `(${placed.status})`)
const order = placed.json?.data
ok('order has orderNumber', /^ACM\d+$/.test(order?.orderNumber || ''), `(${order?.orderNumber})`)
ok('totalAmount = subtotal + delivery', order && order.totalAmount === order.subtotal + order.deliveryCharge, `(total ${order?.totalAmount}, subtotal ${order?.subtotal}, delivery ${order?.deliveryCharge})`)
ok('item name snapshot stored', order?.items?.[0]?.name === cake.name)

const cakeAfter = (await req('/cakes')).json.data.find(c => c._id === cake._id)
ok('placing an order does not touch stock', cakeAfter.stock === stockBefore, `(${stockBefore} -> ${cakeAfter.stock})`)

// --- orders have no stock limit ----------------------------------------------
// Cakes are made after the customer orders, so a quantity larger than the
// recorded stock must still be accepted.
console.log('\nNo stock limit')
const overBody = { ...orderBody, items: [{ ...orderBody.items[0], quantity: Number(stockBefore) + 5 }] }
const over = await req('/orders', { method: 'POST', body: overBody })
ok('quantity beyond stock accepted', over.status === 201 && over.json?.success, `(${over.status})`)
const overStock = (await req('/cakes')).json.data.find(c => c._id === cake._id).stock
ok('stock still unchanged', overStock === stockBefore, `(${stockBefore} -> ${overStock})`)

// --- admin manages the order ------------------------------------------------
console.log('\nAdmin order management')
const list = await req('/orders', { cookie: adminCookie })
ok('GET /orders (admin)', list.status === 200 && Array.isArray(list.json?.data))
const adminOrder = list.json.data.find(o => o._id === order._id)
ok('guest order appears in admin list', Boolean(adminOrder))
ok('guest order shows customerName', adminOrder?.customerName === 'Guest Checkout')

const steps = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']
let cur = order._id
for (const status of steps) {
    const r = await req(`/orders/${cur}/status`, { method: 'PATCH', body: { status }, cookie: adminCookie })
    ok(`status -> ${status}`, r.status === 200 && r.json?.data?.status === status, `(${r.status})`)
}

const bad = await req(`/orders/${cur}/status`, { method: 'PATCH', body: { status: 'Pending' }, cookie: adminCookie })
ok('backward transition rejected', bad.status === 400)

// --- second order: cancelling leaves stock alone -----------------------------
console.log('\nCancel leaves stock alone')
const placed2 = await req('/orders', { method: 'POST', body: orderBody })
ok('second order placed', placed2.status === 201)
const midStock = (await req('/cakes')).json.data.find(c => c._id === cake._id).stock
const cancel = await req(`/orders/${placed2.json.data._id}/cancel`, { method: 'DELETE', cookie: adminCookie })
ok('admin cancel', cancel.status === 200 && cancel.json?.data?.status === 'Cancelled')
const finalStock = (await req('/cakes')).json.data.find(c => c._id === cake._id).stock
ok('stock unchanged after cancel', finalStock === midStock, `(${midStock} -> ${finalStock})`)

// --- signed-in customer flow ------------------------------------------------
console.log('\nSigned-in customer')
const customer = {
    username: 'Test Customer',
    email: 'customer.test@example.com',
    password: 'Customer@123',
}
await req('/auth/register', { method: 'POST', body: customer }) // may already exist
const cLogin = await req('/auth/login', { method: 'POST', body: { email: customer.email, password: customer.password } })
ok('customer login', cLogin.status === 200)
const placed3 = await req('/orders', { method: 'POST', body: { ...orderBody, customerName: undefined, customerEmail: undefined }, cookie: cLogin.cookie })
ok('POST /orders (signed in)', placed3.status === 201)
ok('order linked to account', Boolean(placed3.json?.data?.customer))
const mine = await req('/orders/mine', { cookie: cLogin.cookie })
ok('GET /orders/mine', mine.status === 200 && mine.json.data.some(o => o._id === placed3.json.data._id))

// --- client-shaped payload (exactly what CheckoutModal sends) ---------------
console.log('\nClient checkout payload')
const clientPayload = {
    items: [{ cake: cake._id, name: cake.name, price: cake.price, quantity: 1 }],
    deliveryAddress: 'House 1, Test Street, Abbottabad',
    phone: '0300 1234567',
    paymentMethod: 'Cash on Delivery',
    customerName: 'Storefront Guest',
    // CheckoutModal sends customerEmail only when filled in (undefined otherwise).
}
const fromClient = await req('/orders', { method: 'POST', body: clientPayload })
ok('CheckoutModal-shaped payload accepted', fromClient.status === 201, `(${fromClient.status})`)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

