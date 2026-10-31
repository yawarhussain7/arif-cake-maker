import { useCallback, useMemo, useState } from 'react'
import { SliderContext } from './sliderContext'
import { initialSlides } from './sliderDefaults'

const STORAGE_KEY = 'sweet-bites-sidebar-slides'

function readSlides() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return { slides: initialSlides, error: '' }
    const slides = JSON.parse(stored)
    if (!Array.isArray(slides) || slides.some((slide) => (
      !slide || typeof slide.id !== 'string' || typeof slide.title !== 'string'
      || typeof slide.description !== 'string' || typeof slide.image !== 'string'
      || typeof slide.active !== 'boolean'
    ))) {
      throw new Error('Saved slider data is not valid.')
    }
    return { slides, error: '' }
  } catch (error) {
    return {
      slides: initialSlides,
      error: `Saved slider changes could not be loaded: ${error.message}`,
    }
  }
}

export function SliderProvider({ children }) {
  const [initialState] = useState(readSlides)
  const [slides, setSlides] = useState(initialState.slides)
  const [savedSlides, setSavedSlides] = useState(initialState.slides)
  const [storageError, setStorageError] = useState(initialState.error)
  const dirty = JSON.stringify(slides) !== JSON.stringify(savedSlides)

  const saveSlides = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slides))
      setSavedSlides(slides)
      setStorageError('')
      return true
    } catch (error) {
      setStorageError(`Slider changes could not be saved in this browser: ${error.message}`)
      return false
    }
  }, [slides])

  const cancelChanges = useCallback(() => {
    setSlides(savedSlides)
    setStorageError('')
  }, [savedSlides])

  const value = useMemo(() => ({
    slides,
    setSlides,
    saveSlides,
    cancelChanges,
    dirty,
    storageError,
  }), [slides, saveSlides, cancelChanges, dirty, storageError])

  return <SliderContext.Provider value={value}>{children}</SliderContext.Provider>
}
