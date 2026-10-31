import { useMemo, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useSliderStore } from '../useSliderStore'

const emptyForm = {
  id: '',
  image: '',
  imageName: '',
  title: '',
  description: '',
  link: '',
  active: true,
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.naturalWidth * scale)
      canvas.height = Math.round(image.naturalHeight * scale)
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Your browser could not process this image.'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Your browser could not process this image.'))
          return
        }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('The image could not be read.'))
        reader.readAsDataURL(blob)
      }, 'image/jpeg', 0.82)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('This image could not be opened.'))
    }
    image.src = objectUrl
  })
}

function formFromSlide(slide) {
  return { ...slide }
}

export default function SidebarSlider() {
  const { slides, setSlides, saveSlides, cancelChanges, dirty } = useSliderStore()
  const [form, setForm] = useState(emptyForm)
  const [activePreviewId, setActivePreviewId] = useState(slides[0]?.id || '')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [draggedId, setDraggedId] = useState('')
  const [savingImage, setSavingImage] = useState(false)

  const previewSlides = useMemo(() => {
    const activeSlides = slides.filter((slide) => slide.active)
    return activeSlides.length ? activeSlides : slides
  }, [slides])
  const previewSlide = previewSlides.find((slide) => slide.id === activePreviewId) || previewSlides[0]
  const editing = Boolean(form.id)

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setNotice('')
  }

  const uploadImage = async (file) => {
    setError('')
    setNotice('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.')
      return
    }
    setSavingImage(true)
    try {
      const image = await resizeImage(file)
      setForm((current) => ({ ...current, image, imageName: file.name }))
    } catch (imageError) {
      setError(imageError.message)
    } finally {
      setSavingImage(false)
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setError('')
    setNotice('')
  }

  const submitForm = (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    const title = form.title.trim()
    const description = form.description.trim()
    const link = form.link.trim()
    if (!form.image) {
      setError('Upload an image before saving this slide.')
      return
    }
    if (!title) {
      setError('Enter a heading for this slide.')
      return
    }
    if (link) {
      try {
        const url = new URL(link, window.location.origin)
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
      } catch {
        setError('Enter a valid website URL or a path such as /cakes.')
        return
      }
    }

    const slide = {
      ...form,
      id: form.id || window.crypto?.randomUUID?.() || `slide-${Date.now()}`,
      title,
      description,
      link,
    }
    setSlides((current) => (
      editing
        ? current.map((item) => item.id === slide.id ? slide : item)
        : [...current, slide]
    ))
    setActivePreviewId(slide.id)
    setNotice(editing ? 'Slide updated. Save changes to publish it.' : 'Slide added. Save changes to publish it.')
    setForm(emptyForm)
  }

  const editSlide = (slide) => {
    setForm(formFromSlide(slide))
    setActivePreviewId(slide.id)
    setError('')
    setNotice('')
    document.getElementById('slide-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteSlide = (id) => {
    if (!window.confirm('Delete this slide? You can save the change after reviewing it.')) return
    setSlides((current) => current.filter((slide) => slide.id !== id))
    if (form.id === id) resetForm()
    setNotice('Slide removed from the draft. Save changes to publish it.')
  }

  const moveSlide = (fromId, toId) => {
    if (!fromId || fromId === toId) return
    setSlides((current) => {
      const fromIndex = current.findIndex((slide) => slide.id === fromId)
      const toIndex = current.findIndex((slide) => slide.id === toId)
      if (fromIndex < 0 || toIndex < 0) return current
      const reordered = [...current]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)
      return reordered
    })
    setDraggedId('')
  }

  const toggleActive = (id) => {
    setSlides((current) => current.map((slide) => (
      slide.id === id ? { ...slide, active: !slide.active } : slide
    )))
  }

  const discardChanges = () => {
    cancelChanges()
    resetForm()
    setNotice('Unsaved changes were discarded.')
  }

  const saveAndShowNotice = () => {
    if (saveSlides()) setNotice('All slide changes were saved on this device.')
    else setError('Changes could not be saved. Check browser storage and try again.')
  }

  const showPreview = (offset) => {
    if (!previewSlides.length) return
    const currentIndex = previewSlides.findIndex((slide) => slide.id === previewSlide?.id)
    const nextIndex = (currentIndex + offset + previewSlides.length) % previewSlides.length
    setActivePreviewId(previewSlides[nextIndex].id)
  }

  return (
    <div className="slider-page">
      <div className="slider-page__grid">
        <section className="admin-panel slider-editor" id="slide-form" aria-labelledby="slide-form-title">
          <div className="slider-panel-heading">
            <div>
              <h2 id="slide-form-title">{editing ? 'Edit Slide Details' : 'Add Slide Details'}</h2>
              <p>Upload an image and add your promotion details.</p>
            </div>
            {editing && <button type="button" className="slider-icon-button" onClick={resetForm} aria-label="Exit edit mode"><X size={18} /></button>}
          </div>

          <form onSubmit={submitForm}>
            <div className="slider-form-fields">
              <div className="slider-field">
                <span className="slider-field__label"><Upload size={16} /> Upload Image <span className="required-mark">*</span></span>
                <div
                  className={`slider-upload${dragOver ? ' is-drag-over' : ''}`}
                  onDragOver={(event) => { event.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragOver(false)
                    uploadImage(event.dataTransfer.files[0])
                  }}
                >
                  <input id="slide-image-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(event.target.files?.[0])} />
                  {form.image ? (
                    <span className="slider-upload__file">
                      <label htmlFor="slide-image-input" className="slider-upload__browse">
                        <img src={form.image} alt="" />
                        <span><strong>{form.imageName || 'Slide image'}</strong><small>Click or drop another image to replace</small></span>
                      </label>
                      <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setForm((current) => ({ ...current, image: '', imageName: '' })) }} aria-label="Remove uploaded image">
                        <X size={16} />
                      </button>
                    </span>
                  ) : (
                    <label htmlFor="slide-image-input" className="slider-upload__empty">
                      <span className="slider-upload__icon"><Upload size={20} /></span>
                      <span><strong>{savingImage ? 'Preparing image…' : 'Drag & drop your image here, or browse'}</strong><small>Recommended 300 × 200 px · JPG, PNG, WebP · Max 5 MB</small></span>
                    </label>
                  )}
                </div>
              </div>

              <label className="slider-field">
                <span className="slider-field__label">Slide Heading <span className="required-mark">*</span></span>
                <input name="title" value={form.title} onChange={updateForm} maxLength={90} required placeholder="Good things are always baked with love." />
                <span className="slider-field__hint">{form.title.length}/90 characters</span>
              </label>

              <label className="slider-field">
                <span className="slider-field__label">Slide Description / Subtext</span>
                <textarea name="description" value={form.description} onChange={updateForm} rows={3} maxLength={220} placeholder="Enjoy our freshly baked cakes & pastries daily." />
                <span className="slider-field__hint">{form.description.length}/220 characters</span>
              </label>

              <label className="slider-field">
                <span className="slider-field__label">Button / Link URL</span>
                <span className="slider-link-input">
                  <input name="link" value={form.link} onChange={updateForm} maxLength={500} placeholder="/cakes or https://example.com" />
                  <LinkIcon size={16} aria-hidden="true" />
                </span>
                <span className="slider-field__hint">Optional. Use an internal path or a full https:// link.</span>
              </label>

              <label className="slider-visibility">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
                <span className="slider-toggle" aria-hidden="true" />
                <span><strong>Show on live sidebar</strong><small>Make this slide visible in the sidebar preview.</small></span>
              </label>
            </div>

            {error && <p className="slider-message is-error" role="alert">{error}</p>}
            {notice && <p className="slider-message is-success" role="status">{notice}</p>}

            <div className="slider-form-actions">
              <button type="button" className="admin-button admin-button--secondary" onClick={resetForm}>Reset</button>
              <button type="submit" className="admin-button admin-button--primary" disabled={savingImage}>
                {editing ? <Check size={17} /> : <Plus size={17} />}
                {editing ? 'Update Slide' : 'Create Slide'}
              </button>
            </div>
          </form>
        </section>

        <div className="slider-side-column">
          <section className="admin-panel slider-preview" aria-labelledby="slider-preview-title">
            <div className="slider-section-heading">
              <div><h2 id="slider-preview-title">Live Preview</h2><p>Sidebar card preview</p></div>
              <span className="slider-live-label"><span /> Live</span>
            </div>
            {previewSlide ? (
              <>
                <div className="slider-preview__card">
                  <div className="slider-preview__image">
                    <img src={previewSlide.image} alt={previewSlide.title} />
                    <button type="button" onClick={() => showPreview(-1)} aria-label="Previous slide" disabled={previewSlides.length < 2}><ChevronLeft size={18} /></button>
                    <button type="button" onClick={() => showPreview(1)} aria-label="Next slide" disabled={previewSlides.length < 2}><ChevronRight size={18} /></button>
                  </div>
                  <div className="slider-preview__copy">
                    <h3>{previewSlide.title}</h3>
                    <p>{previewSlide.description || 'Freshly baked with love.'}</p>
                    {previewSlide.link && <span className="slider-preview__link">Explore <ChevronRight size={13} /></span>}
                  </div>
                </div>
                <div className="slider-preview__dots">
                  {previewSlides.map((slide, index) => (
                    <button type="button" key={slide.id} className={previewSlide.id === slide.id ? 'is-active' : ''} onClick={() => setActivePreviewId(slide.id)} aria-label={`Preview slide ${index + 1}`} />
                  ))}
                </div>
              </>
            ) : (
              <div className="slider-preview__empty"><ImageIcon size={29} /><p>Add a slide to see your sidebar preview.</p></div>
            )}
          </section>

          <section className="admin-panel slider-list" aria-labelledby="slide-list-title">
            <div className="slider-section-heading">
              <div><h2 id="slide-list-title">Your Slides <span>({slides.length})</span></h2><p>Drag rows to change the display order.</p></div>
            </div>
            {slides.length ? (
              <div className="slider-list__rows">
                {slides.map((slide) => (
                  <article
                    className={`slider-row${draggedId === slide.id ? ' is-dragging' : ''}`}
                    key={slide.id}
                    draggable
                    onDragStart={() => setDraggedId(slide.id)}
                    onDragEnd={() => setDraggedId('')}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => moveSlide(draggedId, slide.id)}
                  >
                    <GripVertical className="slider-row__grip" size={17} aria-label="Drag to reorder" />
                    <button type="button" className="slider-row__preview" onClick={() => setActivePreviewId(slide.id)} aria-label={`Preview ${slide.title}`}>
                      <img src={slide.image} alt="" />
                    </button>
                    <div className="slider-row__details">
                      <strong title={slide.title}>{slide.title}</strong>
                      <span className={`slider-status${slide.active ? ' is-active' : ''}`}>{slide.active ? 'Active' : 'Draft / Inactive'}</span>
                    </div>
                    <button type="button" className={`slider-row__toggle${slide.active ? ' is-on' : ''}`} onClick={() => toggleActive(slide.id)} aria-label={`${slide.active ? 'Deactivate' : 'Activate'} ${slide.title}`} aria-pressed={slide.active}>
                      <span />
                    </button>
                    <button type="button" className="slider-row__action" onClick={() => editSlide(slide)} aria-label={`Edit ${slide.title}`}><Pencil size={16} /></button>
                    <button type="button" className="slider-row__action is-danger" onClick={() => deleteSlide(slide.id)} aria-label={`Delete ${slide.title}`}><Trash2 size={16} /></button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="slider-list__empty"><ImageIcon size={25} /><p>No slides yet. Use the form to create your first slide.</p></div>
            )}
            <div className="slider-list__footer">
              <span>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
              {dirty && <button type="button" onClick={saveAndShowNotice}><Save size={14} /> Save now</button>}
            </div>
          </section>
        </div>
      </div>

      <footer className="slider-page__footer">
        <span>Slide updates are stored in this browser.</span>
        <div>
          <button type="button" className="admin-button admin-button--secondary" onClick={discardChanges}>Cancel</button>
          <button type="button" className="admin-button admin-button--primary" onClick={saveAndShowNotice} disabled={!dirty}><Save size={16} /> Save Changes</button>
        </div>
      </footer>
    </div>
  )
}
