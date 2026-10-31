// Smoke test for cake management as admin — run with the server on :9000.
//   node scripts/test-cakes-admin.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const BASE = 'http://localhost:9000'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

let passed = 0, failed = 0
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

// Minimal multipart builder (no extra deps).
const uploadCake = async ({ cookie, cakeId, name, price, stock, file, method = 'POST', url }) => {
    const boundary = '----acmboundary' + Date.now()
    const parts = []
    const field = (k, v) => parts.push(
        `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`
    )
    field('cakename', name)
    field('category', 'Birthday Cakes')
    field('flavor', 'Test flavor')
    field('price', String(price))
    field('stock', String(stock))
    field('style', 'Chocolate Cake')
    if (file) {
        const buf = fs.readFileSync(file)
        const ext = path.extname(file).slice(1)
        parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="${path.basename(file)}"\r\nContent-Type: image/${ext === 'jpg' ? 'jpeg' : ext}\r\n\r\n`)
        parts.push(buf)
        parts.push('\r\n')
    }
    parts.push(`--${boundary}--\r\n`)

    const body = Buffer.concat(parts.map(p => (typeof p === 'string' ? Buffer.from(p) : p)))
    const res = await fetch(BASE + url, {
        method,
        headers: {
            Cookie: cookie,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body,
    })
    const json = await res.json().catch(() => null)
    return { status: res.status, json }
}

// Use one of the already-uploaded photos as the file payload.
const samplePhoto = path.join(__dirname, '..', 'uploads', 'cakes', fs.readdirSync(path.join(__dirname, '..', 'uploads', 'cakes'))[0])

console.log('\nAdmin cake management')
const login = await req('/admin/login', { method: 'POST', body: { email: 'admin@arifcakes.com', password: 'Bakery@2026' } })
ok('admin login', login.status === 200)
const cookie = login.cookie

const created = await uploadCake({
    cookie, name: 'Integration Test Cake', price: 999, stock: 4, file: samplePhoto, url: '/cakes/new',
})
ok('POST /cakes/new (multipart, admin)', created.status === 201 && created.json?.success, `(${created.status})`)
const cakeId = created.json?.data?._id
ok('created cake has id', Boolean(cakeId))
ok('photo path saved', String(created.json?.data?.photo || '').startsWith('/uploads/cakes/'), `(${created.json?.data?.photo})`)

const updated = await uploadCake({
    cookie, cakeId, name: 'Integration Test Cake v2', price: 1099, stock: 7, file: null,
    method: 'PUT', url: `/cakes/${cakeId}/edit`,
})
ok('PUT /cakes/:id/edit (multipart, admin)', updated.status === 200 && updated.json?.data?.name === 'Integration Test Cake v2', `(${updated.status})`)
ok('price/stock updated', updated.json?.data?.price === 1099 && updated.json?.data?.stock === 7)

const listed = await req('/cakes')
const found = listed.json.data.find(c => c._id === cakeId)
ok('GET /cakes includes new cake', Boolean(found))

const del = await req(`/cake/${cakeId}`, { method: 'DELETE', cookie })
ok('DELETE /cake/:id (admin)', del.status === 200)

const delNoAuth = await req(`/cake/${cakeId}`, { method: 'DELETE' })
ok('DELETE without auth rejected', delNoAuth.status === 401)

// Customer cookie must not manage cakes.
await req('/auth/register', { method: 'POST', body: { username: 'Cake Tester', email: 'cake.tester@example.com', password: 'Tester@123' } }).catch(() => {})
const cLogin = await req('/auth/login', { method: 'POST', body: { email: 'cake.tester@example.com', password: 'Tester@123' } })
const notAdmin = await uploadCake({
    cookie: cLogin.cookie, name: 'Sneaky Cake', price: 1, stock: 1, file: samplePhoto, url: '/cakes/new',
})
ok('customer cannot create cake (403)', notAdmin.status === 403, `(${notAdmin.status})`)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
