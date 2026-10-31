// Smoke test for the categories API — run with the server listening on :9000.
//   node scripts/test-categories.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const BASE = 'http://localhost:9000'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

// Minimal multipart builder for the "a new category can be used on a cake" check.
const uploadCake = async ({ cookie, name, category, file }) => {
    const boundary = '----acmboundary' + Date.now()
    const parts = []
    const field = (k, v) => parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`)
    field('cakename', name)
    field('category', category)
    field('flavor', 'Test flavor')
    field('price', '55')
    field('stock', '3')
    field('style', 'Chocolate Cake')
    const buf = fs.readFileSync(file)
    const ext = path.extname(file).slice(1)
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="${path.basename(file)}"\r\nContent-Type: image/${ext === 'jpg' ? 'jpeg' : ext}\r\n\r\n`)
    parts.push(buf)
    parts.push('\r\n')
    parts.push(`--${boundary}--\r\n`)

    const res = await fetch(BASE + '/cakes/new', {
        method: 'POST',
        headers: { Cookie: cookie, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: Buffer.concat(parts.map(p => (typeof p === 'string' ? Buffer.from(p) : p))),
    })
    const json = await res.json().catch(() => null)
    return { status: res.status, json }
}

// --- public read + defaults --------------------------------------------------
console.log('\nCatalogue categories')
const guestList = await req('/categories')
ok('GET /categories is public', guestList.status === 200 && guestList.json?.success, `(${guestList.status})`)
const list = Array.isArray(guestList.json?.data) ? guestList.json.data : []
ok('defaults are seeded on an empty database', list.length >= 5, `(${list.length} categories)`)
const first = list[0]
ok('category carries UI fields', Boolean(first?._id && first.name && first.chartColor && typeof first.shareOfOrders === 'number'), `(${first?.name})`)

// --- guests cannot write -----------------------------------------------------
console.log('\nGuards')
const noAuthPost = await req('/categories/new', { method: 'POST', body: { name: 'Guest Category' } })
ok('guest cannot create category', noAuthPost.status === 401, `(${noAuthPost.status})`)
const noAuthDelete = await req('/categories/' + (first?._id || ''), { method: 'DELETE' })
ok('guest cannot delete category', noAuthDelete.status === 401, `(${noAuthDelete.status})`)

// --- admin manages categories ------------------------------------------------
console.log('\nAdmin management')
const creds = { email: 'admin@arifcakes.com', password: 'Bakery@2026' }
const login = await req('/admin/login', { method: 'POST', body: creds })
ok('admin login', login.status === 200 && login.json?.success, `(${login.status})`)
const adminCookie = login.cookie

const NEW_NAME = 'Integration Test Category'
// Clean up any leftovers from an earlier run of this script.
for (const c of (await req('/categories')).json.data.filter(c => c.name === NEW_NAME || c.name === NEW_NAME + ' v2')) {
    await req('/categories/' + c._id, { method: 'DELETE', cookie: adminCookie })
}

const created = await req('/categories/new', {
    method: 'POST',
    cookie: adminCookie,
    body: { name: NEW_NAME, description: 'Created by scripts/test-categories.js', shareOfOrders: 7, chartColor: '#5f8a6a' },
})
ok('POST /categories/new (admin)', created.status === 201 && created.json?.success, `(${created.status})`)
const cat = created.json?.data
ok('created category has an id', Boolean(cat?._id))

const duplicate = await req('/categories/new', {
    method: 'POST',
    cookie: adminCookie,
    body: { name: NEW_NAME, description: 'dupe', shareOfOrders: 1, chartColor: '#5f8a6a' },
})
ok('duplicate name rejected with 409', duplicate.status === 409, `(${duplicate.status})`)

const badShare = await req('/categories/new', {
    method: 'POST',
    cookie: adminCookie,
    body: { name: 'Bad Share Category', shareOfOrders: 150 },
})
ok('share above 100 rejected with 400', badShare.status === 400, `(${badShare.status})`)

const badColor = await req('/categories/new', {
    method: 'POST',
    cookie: adminCookie,
    body: { name: 'Bad Color Category', chartColor: 'not-a-color' },
})
ok('invalid colour rejected with 400', badColor.status === 400, `(${badColor.status})`)

const renamed = await req(`/categories/${cat._id}/edit`, {
    method: 'PUT',
    cookie: adminCookie,
    body: { name: NEW_NAME + ' v2', shareOfOrders: 11 },
})
ok('PUT /categories/:id/edit', renamed.status === 200 && renamed.json?.data?.name === NEW_NAME + ' v2', `(${renamed.status})`)
ok('partial update keeps untouched fields', renamed.json?.data?.description === 'Created by scripts/test-categories.js')
ok('partial update keeps the colour', renamed.json?.data?.chartColor === '#5f8a6a')

const missing = await req('/categories/000000000000000000000000/edit', { method: 'PUT', cookie: adminCookie, body: { name: 'Nope' } })
ok('updating a missing category is a 404', missing.status === 404, `(${missing.status})`)

// --- a freshly added category can be used on a cake --------------------------
console.log('\nNew categories work on cakes')
const uploadDir = path.join(__dirname, '..', 'uploads', 'cakes')
const photo = fs.readdirSync(uploadDir).find(f => /\.(jpe?g|png|webp)$/i.test(f))
ok('sample photo available for the upload test', Boolean(photo), photo ? `(${photo})` : '')
if (photo) {
    const cake = await uploadCake({ cookie: adminCookie, name: 'Category Test Cake', category: NEW_NAME, file: path.join(uploadDir, photo) })
    ok('cake accepted with the new category name', cake.status === 201 && cake.json?.data?.category === NEW_NAME, `(${cake.status})`)
    if (cake.json?.data?._id) await req('/cake/' + cake.json.data._id, { method: 'DELETE', cookie: adminCookie })
}

// --- delete ------------------------------------------------------------------
console.log('\nDelete')
const removed = await req(`/categories/${cat._id}`, { method: 'DELETE', cookie: adminCookie })
ok('DELETE /categories/:id', removed.status === 200 && removed.json?.success, `(${removed.status})`)
const after = (await req('/categories')).json.data
ok('category is gone from the list', !after.some(c => c._id === cat._id))
const again = await req(`/categories/${cat._id}`, { method: 'DELETE', cookie: adminCookie })
ok('deleting twice is a 404', again.status === 404, `(${again.status})`)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
