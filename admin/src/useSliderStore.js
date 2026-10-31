import { useContext } from 'react'
import { SliderContext } from './sliderContext'

export function useSliderStore() {
  const context = useContext(SliderContext)
  if (!context) throw new Error('useSliderStore must be used within a SliderProvider')
  return context
}
