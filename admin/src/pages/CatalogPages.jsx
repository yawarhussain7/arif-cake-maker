import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CakeSlice, Grid2X2, ImagePlus, Pencil, Plus, TrendingUp, Trash2 } from 'lucide-react'
import { adminJson, adminRequest, adminUpload, imageUrl } from '../adminApi'
import { useAdminData } from '../hooks/useAdminData'
import { DataPanel, DataToolbar, FormField, LoadState, MetricGrid, Modal, PageHeader, Pagination, SearchBox, StatusPill } from '../components/AdminUI'

const pageSize = 8
const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`
const array = (value) => Array.isArray(value) ? value : []

export function ProductsPage() {
  const products = useAdminData(() => adminRequest('/cakes'))
  const categories = useAdminData(() => adminRequest('/categories'))
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('')
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const rows = array(products.data)
  const categoryRows = array(categories.data)

  const stockStatus = (item) => {
    if (item.isAvailable === false || Number(item.stock) === 0) return 'out-of-stock'
    if (Number(item.stock) <= 3) return 'low-stock'
    return 'in-stock'
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((item) => {
      const s = stockStatus(item)
      const matchQuery = !needle || `${item.name} ${item.flavor} ${item.category}`.toLowerCase().includes(needle)
      const matchCategory = !category || item.category === category
      const matchAvail = !availability || (
        availability === 'in-stock' ? s === 'in-stock' :
        availability === 'low-stock' ? s === 'low-stock' :
        availability === 'out-of-stock' ? s === 'out-of-stock' : true
      )
      return matchQuery && matchCategory && matchAvail
    })
  }, [rows, query, category, availability])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'name') arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    else if (sort === 'price-asc') arr.sort((a, b) => Number(a.price) - Number(b.price))
    else if (sort === 'price-desc') arr.sort((a, b) => Number(b.price) - Number(a.price))
    else if (sort === 'stock-desc') arr.sort((a, b) => Number(b.stock) - Number(a.stock))
    return arr
  }, [filtered, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pages)
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const startCreate = () => {
    setError('')
    setPhoto(null)
    setPhotoPreview('')
    setEditor({ cakename: '', category: categoryRows[0]?.name || '', flavor: '', price: '', stock: '0', description: '', style: 'Other', isAvailable: true })
  }
  const startEdit = (item) => {
    setError('')
    setPhoto(null)
    setPhotoPreview(imageUrl(item.photo))
    setEditor({ _id: item._id, cakename: item.name, category: item.category, flavor: item.flavor, price: String(item.price), stock: String(item.stock), description: item.description || '', style: item.style || 'Other', isAvailable: item.isAvailable !== false, existingPhoto: item.photo })
  }
  const closeEditor = () => { setEditor(null); setPhoto(null); setPhotoPreview(''); setError('') }
  const handlePhoto = (file) => {
    setError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Choose a JPG, PNG, or WebP product photo.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Choose an image smaller than 5 MB.'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }
  const saveProduct = async (event) => {
    event.preventDefault()
    setError('')
    if (!editor.existingPhoto && !photo) { setError('A product photo is required.'); return }
    setBusy(true)
    try {
      const values = {
        cakename: editor.cakename.trim(),
        category: editor.category,
        flavor: editor.flavor.trim(),
        price: editor.price,
        stock: editor.stock,
        description: editor.description.trim(),
        style: editor.style,
        isAvailable: editor.isAvailable,
      }
      const result = await adminUpload(editor._id ? `/cakes/${editor._id}/edit` : '/cakes/new', editor._id ? 'PUT' : 'POST', values, photo)
      products.setData((current) => editor._id
        ? current.map((item) => item._id === editor._id ? result : item)
        : [result, ...current])
      closeEditor()
    } catch (requestError) {
      setError(requestError.message)
    } finally { setBusy(false) }
  }
  const deleteProduct = async (item) => {
    if (!window.confirm(`Permanently delete "${item.name}"?`)) return
    try {
      await adminRequest(`/cake/${item._id}`, { method: 'DELETE' })
      products.setData((current) => current.filter((product) => product._id !== item._id))
    } catch (requestError) { setError(requestError.message) }
  }

  return (
    <div className="data-page">
      <PageHeader title="Products" description="Manage and update your bakery's sweet offerings." actions={<button type="button" className="data-button data-button--primary" onClick={startCreate}><Plus size={16} /> Add New Product</button>} />
      <LoadState loading={products.loading || categories.loading} error={products.error || categories.error} onRetry={() => { products.reload(); categories.reload() }}>
        <MetricGrid metrics={[
          { label: 'Total Products', value: rows.length, icon: CakeSlice, tone: 'purple' },
          { label: 'Total Products', value: rows.length, icon: CakeSlice, tone: 'blue' },
          { label: 'Active', value: rows.filter((item) => item.isAvailable !== false && Number(item.stock) > 0).length, icon: CakeSlice, tone: 'green' },
          { label: 'Out of Stock', value: rows.filter((item) => Number(item.stock) === 0).length, icon: CakeSlice, tone: 'amber' },
        ]} />
        <DataPanel>
          <DataToolbar>
            <SearchBox value={query} onChange={(value) => { setQuery(value); setPage(1) }} placeholder="Search products..." />
            <select className="data-select" aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}>
              <option value="">All Categories</option>
              {categoryRows.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
            </select>
            <select className="data-select" aria-label="Filter product availability" value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1) }}>
              <option value="">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select className="data-select" aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="name">Sort by: Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-desc">Sales: High to Low</option>
            </select>
          </DataToolbar>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <div className="product-card-grid">
            {visible.map((item) => {
              const ss = stockStatus(item)
              const pillStatus = ss === 'in-stock' ? 'active' : ss === 'low-stock' ? 'upcoming' : 'cancelled'
              const pillLabel = ss === 'in-stock' ? 'In Stock' : ss === 'low-stock' ? `Low Stock - ${item.stock} left` : 'Out of Stock'
              return (
                <article className={`product-admin-card${ss === 'out-of-stock' ? ' is-unavailable' : ''}`} key={item._id}>
                  <div className="product-admin-card__photo">
                    {item.photo ? <img src={imageUrl(item.photo)} alt={item.name} /> : <CakeSlice className="product-admin-card__placeholder" size={30} aria-label="No product photo" />}
                    <span>{item.category}</span>
                    <StatusPill status={pillStatus}>{pillLabel}</StatusPill>
                  </div>
                  <div className="product-admin-card__content">
                    <h3>{item.name}</h3>
                    <p>{item.flavor} · {item.style || 'Other'}</p>
                    <div>
                      <strong>{money(item.price)}</strong>
                      <span>{Number(item.stock) === 0 ? 'Out of stock' : `${item.stock} sold`}</span>
                    </div>
                  </div>
                  <div className="product-admin-card__actions">
                    <button type="button" onClick={() => startEdit(item)}><Pencil size={14} /> Edit</button>
                    <button type="button" className="is-danger" onClick={() => deleteProduct(item)}><Trash2 size={14} /> Delete</button>
                  </div>
                </article>
              )
            })}
            {!visible.length && <div className="product-grid-empty">No products match these filters.</div>}
          </div>
          <Pagination page={currentPage} pages={pages} total={sorted.length} pageSize={pageSize} onChange={setPage} />
        </DataPanel>
      </LoadState>
      {editor && <Modal title={editor._id ? 'Edit product' : 'Add a product'} onClose={closeEditor} wide>
        <form className="admin-form" onSubmit={saveProduct}>
          <div className="product-editor-grid">
            <div className="product-editor-photo">
              {photoPreview ? <img src={photoPreview} alt="Product preview" /> : <div><ImagePlus size={30} /><span>Product image preview</span></div>}
              <label className="data-button data-button--secondary"><Plus size={15} />{photoPreview ? 'Change image' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handlePhoto(event.target.files?.[0])} /></label>
              <small>JPG, PNG or WebP. Maximum 5 MB.</small>
            </div>
            <div className="admin-form__fields">
              <FormField label="Product name"><input required minLength={2} maxLength={100} value={editor.cakename} onChange={(event) => setEditor({ ...editor, cakename: event.target.value })} /></FormField>
              <div className="admin-form__row">
                <FormField label="Category"><select required value={editor.category} onChange={(event) => setEditor({ ...editor, category: event.target.value })}>{categoryRows.map((item) => <option key={item._id}>{item.name}</option>)}</select></FormField>
                <FormField label="Flavor"><input required maxLength={100} value={editor.flavor} onChange={(event) => setEditor({ ...editor, flavor: event.target.value })} /></FormField>
              </div>
              <div className="admin-form__row">
                <FormField label="Price (Rs.)"><input type="number" min="0" step="1" required value={editor.price} onChange={(event) => setEditor({ ...editor, price: event.target.value })} /></FormField>
                <FormField label="Stock"><input type="number" min="0" step="1" required value={editor.stock} onChange={(event) => setEditor({ ...editor, stock: event.target.value })} /></FormField>
              </div>
              <FormField label="Style"><select value={editor.style} onChange={(event) => setEditor({ ...editor, style: event.target.value })}>{['Chocolate Cake', 'Pink Cake', 'Wedding Cake', 'Cream Cake', 'Velvet Cake', 'Lemon Cake', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></FormField>
              <FormField label="Description"><textarea rows={3} maxLength={2000} value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} /></FormField>
              <label className="admin-checkbox"><input type="checkbox" checked={editor.isAvailable} onChange={(event) => setEditor({ ...editor, isAvailable: event.target.checked })} /> Available for purchase</label>
            </div>
          </div>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <div className="admin-form__actions"><button type="button" className="data-button data-button--secondary" onClick={closeEditor}>Cancel</button><button type="submit" className="data-button data-button--primary" disabled={busy}>{busy ? 'Saving…' : editor._id ? 'Save product' : 'Create product'}</button></div>
        </form>
      </Modal>}
    </div>
  )
}

const CATEGORY_COLORS = ['#c4b5fd', '#d2a35a', '#6c9e8d', '#738eb3', '#a186ba', '#c9855d']

export function CategoriesPage() {
  const resource = useAdminData(() => adminRequest('/categories'))
  const products = useAdminData(() => adminRequest('/cakes'))
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('products')
  const [editor, setEditor] = useState(null)
  const [error, setError] = useState('')
  const categories = array(resource.data)
  const cakes = array(products.data)

  const enriched = useMemo(() => {
    return categories.map((item) => {
      const count = cakes.filter((cake) => cake.category === item.name).length
      const sold = cakes.filter((cake) => cake.category === item.name).reduce((sum, cake) => sum + (Number(cake.sold) || Number(cake.stock) || 0), 0)
      return { ...item, _count: count, _sold: sold, _active: count > 0 }
    })
  }, [categories, cakes])

  const visible = useMemo(() => {
    let arr = enriched.filter((item) => {
      const matchQuery = `${item.name} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase())
      const matchStatus = !statusFilter || (statusFilter === 'Active' ? item._active : !item._active)
      return matchQuery && matchStatus
    })
    if (sort === 'products') arr = [...arr].sort((a, b) => b._count - a._count)
    else if (sort === 'name') arr = [...arr].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return arr
  }, [enriched, query, statusFilter, sort])

  const startCreate = () => {
    setError('')
    setEditor({ name: '', description: '', chartColor: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length] })
  }
  const startEdit = (item) => {
    setError('')
    setEditor({ _id: item._id, name: item.name, description: item.description || '', chartColor: item.chartColor || CATEGORY_COLORS[0] })
  }
  const save = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const values = { name: editor.name.trim(), description: editor.description.trim(), chartColor: editor.chartColor }
      const result = await adminJson(editor._id ? `/categories/${editor._id}/edit` : '/categories/new', editor._id ? 'PUT' : 'POST', values)
      resource.setData((current) => editor._id ? current.map((item) => item._id === editor._id ? result : item) : [...current, result])
      setEditor(null)
    } catch (requestError) { setError(requestError.message) }
  }
  const remove = async (item) => {
    if (cakes.some((cake) => cake.category === item.name)) {
      setError(`Products still use "${item.name}". Move those products to another category before deleting it.`)
      return
    }
    if (!window.confirm(`Delete category "${item.name}"?`)) return
    setError('')
    try {
      await adminRequest(`/categories/${item._id}`, { method: 'DELETE' })
      resource.setData((current) => current.filter((category) => category._id !== item._id))
    } catch (requestError) { setError(requestError.message) }
  }

  return (
    <div className="data-page">
      <PageHeader title="Categories" description="Organize and manage your bakery product categories." actions={<button type="button" className="data-button data-button--primary" onClick={startCreate}><Plus size={16} /> Add New Category</button>} />
      <LoadState loading={resource.loading || products.loading} error={resource.error || products.error} onRetry={() => { resource.reload(); products.reload() }}>
        <MetricGrid metrics={[
          { label: 'Total Categories', value: categories.length, icon: Grid2X2, tone: 'blue' },
          { label: 'Total Products Assigned', value: cakes.length, icon: CakeSlice, tone: 'purple' },
          { label: 'Active Categories', value: enriched.filter((item) => item._active).length, icon: Grid2X2, tone: 'green' },
          { label: 'Inactive Categories', value: enriched.filter((item) => !item._active).length, icon: Grid2X2, tone: 'amber' },
        ]} />
        <DataPanel>
          <DataToolbar>
            <SearchBox value={query} onChange={setQuery} placeholder="Search categories..." />
            <select className="data-select" aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="data-select" aria-label="Sort categories" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="products">Sort by: Total Products</option>
              <option value="name">Sort by: Name A-Z</option>
            </select>
          </DataToolbar>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <div className="category-card-grid">
            {visible.map((item, index) => {
              const color = item.chartColor || CATEGORY_COLORS[index % CATEGORY_COLORS.length]
              return (
                <article className="category-admin-card" key={item._id}>
                  <div className="category-admin-card__top">
                    <span style={{ background: color }}><Grid2X2 size={22} /></span>
                    <StatusPill status={item._active ? 'active' : 'inactive'}>{item._active ? 'Active' : 'Inactive'}</StatusPill>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description || 'No description provided.'}</p>
                  <div className="category-admin-card__stats">
                    <span><CakeSlice size={13} />{item._count} Products</span>
                    <span><TrendingUp size={13} />{item._sold.toLocaleString()} Sold</span>
                  </div>
                  <div className="category-admin-card__actions">
                    <button type="button" onClick={() => startEdit(item)}><Pencil size={14} /></button>
                    <button type="button" className="is-danger" onClick={() => remove(item)}><Trash2 size={14} /></button>
                  </div>
                </article>
              )
            })}
            {!visible.length && <div className="product-grid-empty">No categories match your search.</div>}
          </div>
        </DataPanel>
      </LoadState>
      {editor && <Modal title={editor._id ? 'Edit category' : 'Add category'} onClose={() => setEditor(null)}>
        <form className="admin-form" onSubmit={save}>
          <FormField label="Category name"><input required minLength={2} maxLength={100} value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} /></FormField>
          <FormField label="Description"><textarea rows={4} maxLength={500} value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} /></FormField>
          <FormField label="Category color"><input type="color" value={editor.chartColor} onChange={(event) => setEditor({ ...editor, chartColor: event.target.value })} /></FormField>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <div className="admin-form__actions"><button type="button" className="data-button data-button--secondary" onClick={() => setEditor(null)}>Cancel</button><button type="submit" className="data-button data-button--primary">{editor._id ? 'Save category' : 'Create category'}</button></div>
        </form>
      </Modal>}
    </div>
  )
}
