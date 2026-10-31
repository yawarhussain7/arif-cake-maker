// Smoke test for the notifications API — run with the server on :9000.
//   node scripts/test-notifications.js
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

// --- auth --------------------------------------------------------------------
console.log('\nAuth')
const creds = { email: 'admin@arifcakes.com', password: 'Bakery@2026' }
const login = await req('/admin/login', { method: 'POST', body: creds })
ok('admin login', login.status === 200 && login.json?.success, `(${login.status})`)
const adminCookie = login.cookie
const adminId = login.json?.data?.user?.id

// --- guests are locked out ---------------------------------------------------
console.log('\nGuards')
ok('guest cannot list notifications', (await req('/notifications')).status === 401)
ok('guest cannot read the unread count', (await req('/notifications/unread-count')).status === 401)
ok('guest cannot mark a notification read', (await req('/notifications/000000000000000000000000/read', { method: 'PATCH' })).status === 401)

// --- the admin's own inbox ---------------------------------------------------
console.log('\nAdmin inbox')
const list0 = await req('/notifications', { cookie: adminCookie })
ok('GET /notifications (admin)', list0.status === 200 && Array.isArray(list0.json?.data), `(${list0.status})`)
const count0 = await req('/notifications/unread-count', { cookie: adminCookie })
ok('GET /notifications/unread-count', count0.status === 200 && typeof count0.json?.data?.count === 'number', `(count ${count0.json?.data?.count})`)

const created = await req('/notifications', {
    method: 'POST',
    cookie: adminCookie,
    body: { title: 'Integration test note', message: 'Created by scripts/test-notifications.js', type: 'success' },
})
ok('POST /notifications (admin, defaults to self)', created.status === 201 && created.json?.success, `(${created.status})`)
const note = created.json?.data
ok('notification is unread with the right shape', note?.isRead === false && note?.type === 'success', `(${note?._id})`)
ok('notification belongs to the admin', note?.user === adminId || String(note?.user) === String(adminId), `(${note?.user})`)

const count1 = await req('/notifications/unread-count', { cookie: adminCookie })
ok('unread count went up', count1.json?.data?.count === (count0.json?.data?.count ?? 0) + 1, `(${count0.json?.data?.count} -> ${count1.json?.data?.count})`)

const badType = await req('/notifications', {
    method: 'POST',
    cookie: adminCookie,
    body: { title: 'Bad type note', message: 'nope', type: 'celebration' },
})
ok('invalid type rejected with 400', badType.status === 400, `(${badType.status})`)

const shortTitle = await req('/notifications', {
    method: 'POST',
    cookie: adminCookie,
    body: { title: 'x', message: 'title shorter than the model allows' },
})
ok('title shorter than 3 chars rejected with 400', shortTitle.status === 400, `(${shortTitle.status})`)

const empty = await req('/notifications', { method: 'POST', cookie: adminCookie, body: {} })
ok('empty body rejected with 400', empty.status === 400, `(${empty.status})`)

// --- reading -----------------------------------------------------------------
console.log('\nMarking as read')
const read = await req(`/notifications/${note._id}/read`, { method: 'PATCH', cookie: adminCookie })
ok('PATCH /notifications/:id/read', read.status === 200 && read.json?.data?.isRead === true, `(${read.status})`)
ok('readAt is stamped', Boolean(read.json?.data?.readAt))

const listAfterRead = (await req('/notifications', { cookie: adminCookie })).json?.data || []
ok('reading removes it from the inbox', !listAfterRead.some(n => n._id === note._id), `(${listAfterRead.length} left)`)

const count2 = await req('/notifications/unread-count', { cookie: adminCookie })
ok('unread count went back down', count2.json?.data?.count === count1.json?.data?.count - 1, `(${count1.json?.data?.count} -> ${count2.json?.data?.count})`)

const missing = await req('/notifications/000000000000000000000000/read', { method: 'PATCH', cookie: adminCookie })
ok('marking an unknown notification is a 404', missing.status === 404, `(${missing.status})`)

const malformed = await req('/notifications/not-an-id/read', { method: 'PATCH', cookie: adminCookie })
ok('malformed id rejected with 400', malformed.status === 400, `(${malformed.status})`)

const created2 = await req('/notifications', {
    method: 'POST',
    cookie: adminCookie,
    body: { title: 'Second note', message: 'For the mark-all-read check', type: 'info' },
})
const note2 = created2.json?.data
const all = await req('/notifications/read-all', { method: 'PATCH', cookie: adminCookie })
ok('PATCH /notifications/read-all', all.status === 200 && all.json?.success, `(${all.status})`)
const count3 = await req('/notifications/unread-count', { cookie: adminCookie })
ok('nothing left unread', count3.json?.data?.count === 0, `(count ${count3.json?.data?.count})`)
const listAfterAll = (await req('/notifications', { cookie: adminCookie })).json?.data || []
ok('read-all empties the inbox', listAfterAll.length === 0, `(${listAfterAll.length} left)`)

// --- somebody else's notifications stay private ------------------------------
console.log('\nOwnership')
const customer = { username: 'Note Test Customer', email: 'note.tester@example.com', password: 'Customer@123' }
await req('/auth/register', { method: 'POST', body: customer }) // may already exist
const cLogin = await req('/auth/login', { method: 'POST', body: { email: customer.email, password: customer.password } })
ok('customer login', cLogin.status === 200, `(${cLogin.status})`)
const cList = await req('/notifications', { cookie: cLogin.cookie })
ok('customer sees only their own inbox', cList.status === 200 && cList.json.data.every(n => n.user !== note.user && String(n.user) !== String(note.user)), `(${cList.json?.data?.length} items)`)
ok('customer cannot read the admin notification', (await req(`/notifications/${note._id}/read`, { method: 'PATCH', cookie: cLogin.cookie })).status === 404)
ok('customer cannot delete the admin notification', (await req(`/notifications/${note._id}`, { method: 'DELETE', cookie: cLogin.cookie })).status === 404)
ok('customer cannot create notifications for others', (await req('/notifications', { method: 'POST', cookie: cLogin.cookie, body: { title: 'Sneaky note', message: 'trying' } })).status === 403)

// --- a new order notifies the admins -----------------------------------------
console.log('\nOrder events')
const cake = (await req('/cakes')).json?.data?.[0]
ok('catalogue has a cake', Boolean(cake), cake ? `(${cake.name})` : '')
const placed = await req('/orders', {
    method: 'POST',
    body: {
        items: [{ cake: cake._id, name: cake.name, price: cake.price, quantity: 1 }],
        deliveryAddress: 'House 1, Notification Street, Abbottabad',
        phone: '0300 1234567',
        customerName: 'Notification Probe',
    },
})
ok('order placed', placed.status === 201, `(${placed.status})`)
const orderNumber = placed.json?.data?.orderNumber
const afterOrder = (await req('/notifications', { cookie: adminCookie })).json?.data
const orderNote = afterOrder.find(n => n.type === 'order' && n.metadata?.orderNumber === orderNumber)
ok('admin got an "order" notification', Boolean(orderNote), `(${orderNote?.title})`)

// --- the order's customer hears about it too --------------------------------
console.log('\nCustomer inbox')
const cOrder = await req('/orders', {
    method: 'POST',
    cookie: cLogin.cookie,
    body: {
        items: [{ cake: cake._id, name: cake.name, price: cake.price, quantity: 1 }],
        deliveryAddress: 'House 2, Notification Street, Abbottabad',
        phone: '0300 1234567',
    },
})
ok('signed-in customer placed an order', cOrder.status === 201, `(${cOrder.status})`)
const cOrderId = cOrder.json?.data?._id
const cNotes = (await req('/notifications', { cookie: cLogin.cookie })).json?.data || []
ok('customer got the "received" notification', cNotes.some(n => n.type === 'order' && n.metadata?.orderId === cOrderId))

const confirmed = await req(`/orders/${cOrderId}/status`, { method: 'PATCH', body: { status: 'Confirmed' }, cookie: adminCookie })
ok('admin confirmed the order', confirmed.status === 200, `(${confirmed.status})`)
const cNotes2 = (await req('/notifications', { cookie: cLogin.cookie })).json?.data || []
const updateNote = cNotes2.find(n => n.metadata?.orderId === cOrderId && /confirmed/i.test(n.title))
ok('customer got the status update', Boolean(updateNote), `(${updateNote?.title})`)

const cReadAll = await req('/notifications/read-all', { method: 'PATCH', cookie: cLogin.cookie })
ok('customer can mark all read', cReadAll.status === 200, `(${cReadAll.status})`)
const cUnread = await req('/notifications/unread-count', { cookie: cLogin.cookie })
ok('customer inbox is now clear', cUnread.json?.data?.count === 0, `(count ${cUnread.json?.data?.count})`)

const cancelled = await req(`/orders/${cOrderId}/cancel`, { method: 'DELETE', cookie: adminCookie })
ok('admin cancelled the order', cancelled.status === 200, `(${cancelled.status})`)
const cNotes3 = (await req('/notifications', { cookie: cLogin.cookie })).json?.data || []
const cancelNote = cNotes3.find(n => n.metadata?.orderId === cOrderId && /cancelled/i.test(n.title))
ok('customer got the cancellation notice', Boolean(cancelNote))

const cReadOne = await req(`/notifications/${cancelNote._id}/read`, { method: 'PATCH', cookie: cLogin.cookie })
ok('customer can read their notification', cReadOne.status === 200, `(${cReadOne.status})`)
const cListAfter = (await req('/notifications', { cookie: cLogin.cookie })).json?.data || []
ok('reading removes it from the customer inbox too', !cListAfter.some(n => n._id === cancelNote._id), `(${cListAfter.length} left)`)

// --- delete ------------------------------------------------------------------
console.log('\nDelete')
const doomed = await req('/notifications', {
    method: 'POST',
    cookie: adminCookie,
    body: { title: 'Doomed note', message: 'For the delete check', type: 'info' },
})
const doomedId = doomed.json?.data?._id
const removed = await req(`/notifications/${doomedId}`, { method: 'DELETE', cookie: adminCookie })
ok('DELETE /notifications/:id', removed.status === 200 && removed.json?.success, `(${removed.status})`)
ok('deleting twice is a 404', (await req(`/notifications/${doomedId}`, { method: 'DELETE', cookie: adminCookie })).status === 404)
ok('reading an already-gone notification is a 404', (await req(`/notifications/${note._id}/read`, { method: 'PATCH', cookie: adminCookie })).status === 404)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
