"use client"

import React, { createContext, useContext, useReducer } from 'react'
import { CarouselState, Slide, SlideImage, ColorConfig, FontConfig, BackgroundConfig, TemplateId, FormatType } from './types'
import { getTemplate } from './templates'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const defaultSlideFields = {
  quote: '',
  image: null as string | null,
  imageOpacity: 0.5,
  imageOverlayColor: '#000000',
  textColor: null as string | null,
  textSecondaryColor: null as string | null,
  textPosition: 'center' as const,
  overlayImages: [] as SlideImage[],
  titleSize: 32,
  bodySize: 18,
  paddingX: 40,
  paddingY: 40,
  textOffsetY: 0,
  textMaxWidth: 100,
  showLogo: true,
  showSlideNumber: true,
}

function createDefaultSlide(index: number): Slide {
  const isCover = index === 0
  return {
    id: generateId(),
    title: isCover ? 'Título do Carrossel' : `Slide ${index + 1}`,
    body: isCover ? 'Subtítulo ou descrição breve' : 'Conteúdo do slide...',
    emoji: '',
    textAlign: isCover ? 'center' : 'left',
    ...defaultSlideFields,
  }
}

const defaultTemplate = getTemplate('educational')

export const initialState: CarouselState = {
  id: generateId(),
  name: 'Meu Carrossel',
  slides: [
    { id: generateId(), title: 'Título do Carrossel', body: 'Subtítulo ou descrição breve', emoji: '✨', textAlign: 'center', ...defaultSlideFields },
    { id: generateId(), title: 'Primeiro Ponto', body: 'Desenvolva sua ideia aqui com detalhes relevantes para seu público.', emoji: '1️⃣', textAlign: 'left', ...defaultSlideFields },
    { id: generateId(), title: 'Segundo Ponto', body: 'Continue construindo sua narrativa de forma clara e objetiva.', emoji: '2️⃣', textAlign: 'left', ...defaultSlideFields },
    { id: generateId(), title: 'Terceiro Ponto', body: 'Reforce sua mensagem com exemplos práticos ou dados.', emoji: '3️⃣', textAlign: 'left', ...defaultSlideFields },
    { id: generateId(), title: 'Gostou do conteúdo?', body: 'Salve este post e siga para mais!', emoji: '👉', textAlign: 'center', ...defaultSlideFields },
  ],
  activeSlideIndex: 0,
  template: 'educational',
  format: '1080x1080',
  colors: { ...defaultTemplate.defaults.colors },
  fonts: { ...defaultTemplate.defaults.fonts },
  background: { ...defaultTemplate.defaults.background },
  showSlideNumbers: true,
  logo: null,
  ctaHandle: '@iaplicada',
  ctaText: 'Siga para mais conteúdo',
  profileImage: null,
}

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_SLIDES'; payload: Slide[] }
  | { type: 'ADD_SLIDE' }
  | { type: 'REMOVE_SLIDE'; payload: number }
  | { type: 'UPDATE_SLIDE'; payload: { index: number; slide: Partial<Slide> } }
  | { type: 'REORDER_SLIDES'; payload: { oldIndex: number; newIndex: number } }
  | { type: 'DUPLICATE_SLIDE'; payload: number }
  | { type: 'SET_ACTIVE_SLIDE'; payload: number }
  | { type: 'SET_TEMPLATE'; payload: TemplateId }
  | { type: 'SET_FORMAT'; payload: FormatType }
  | { type: 'SET_COLORS'; payload: Partial<ColorConfig> }
  | { type: 'SET_FONTS'; payload: Partial<FontConfig> }
  | { type: 'SET_BACKGROUND'; payload: Partial<BackgroundConfig> }
  | { type: 'SET_SHOW_SLIDE_NUMBERS'; payload: boolean }
  | { type: 'SET_LOGO'; payload: string | null }
  | { type: 'SET_PROFILE_IMAGE'; payload: string | null }
  | { type: 'SET_CTA'; payload: { handle?: string; text?: string } }
  | { type: 'LOAD_CAROUSEL'; payload: CarouselState }
  | { type: 'NEW_CAROUSEL' }
  | { type: 'GENERATE_SLIDES'; payload: Slide[] }
  | { type: 'ADD_OVERLAY_IMAGE'; payload: { slideIndex: number; image: SlideImage } }
  | { type: 'UPDATE_OVERLAY_IMAGE'; payload: { slideIndex: number; imageId: string; updates: Partial<SlideImage> } }
  | { type: 'REMOVE_OVERLAY_IMAGE'; payload: { slideIndex: number; imageId: string } }

function carouselReducer(state: CarouselState, action: Action): CarouselState {
  switch (action.type) {
    case 'SET_NAME': return { ...state, name: action.payload }
    case 'SET_SLIDES': return { ...state, slides: action.payload }
    case 'ADD_SLIDE': {
      if (state.slides.length >= 15) return state
      const newSlide = createDefaultSlide(state.slides.length)
      const newSlides = [...state.slides]
      newSlides.splice(state.slides.length - 1, 0, newSlide)
      return { ...state, slides: newSlides, activeSlideIndex: state.slides.length - 1 }
    }
    case 'REMOVE_SLIDE': {
      if (state.slides.length <= 1) return state
      const slides = state.slides.filter((_, i) => i !== action.payload)
      return { ...state, slides, activeSlideIndex: Math.min(state.activeSlideIndex, slides.length - 1) }
    }
    case 'UPDATE_SLIDE': {
      const { index, slide } = action.payload
      const slides = [...state.slides]
      slides[index] = { ...slides[index], ...slide }
      return { ...state, slides }
    }
    case 'REORDER_SLIDES': {
      const { oldIndex, newIndex } = action.payload
      const slides = [...state.slides]
      const [removed] = slides.splice(oldIndex, 1)
      slides.splice(newIndex, 0, removed)
      let activeIndex = state.activeSlideIndex
      if (activeIndex === oldIndex) activeIndex = newIndex
      else if (oldIndex < activeIndex && newIndex >= activeIndex) activeIndex--
      else if (oldIndex > activeIndex && newIndex <= activeIndex) activeIndex++
      return { ...state, slides, activeSlideIndex: activeIndex }
    }
    case 'DUPLICATE_SLIDE': {
      if (state.slides.length >= 15) return state
      const original = state.slides[action.payload]
      const duplicate = { ...original, id: generateId(), overlayImages: (original.overlayImages || []).map(img => ({ ...img, id: generateId() })) }
      const slides = [...state.slides]
      slides.splice(action.payload + 1, 0, duplicate)
      return { ...state, slides, activeSlideIndex: action.payload + 1 }
    }
    case 'SET_ACTIVE_SLIDE': return { ...state, activeSlideIndex: Math.max(0, Math.min(action.payload, state.slides.length - 1)) }
    case 'SET_TEMPLATE': {
      const template = getTemplate(action.payload)
      return { ...state, template: action.payload, colors: { ...template.defaults.colors }, fonts: { ...template.defaults.fonts }, background: { ...template.defaults.background } }
    }
    case 'SET_FORMAT': return { ...state, format: action.payload }
    case 'SET_COLORS': return { ...state, colors: { ...state.colors, ...action.payload } }
    case 'SET_FONTS': return { ...state, fonts: { ...state.fonts, ...action.payload } }
    case 'SET_BACKGROUND': return { ...state, background: { ...state.background, ...action.payload } }
    case 'SET_SHOW_SLIDE_NUMBERS': return { ...state, showSlideNumbers: action.payload }
    case 'SET_LOGO': return { ...state, logo: action.payload }
    case 'SET_PROFILE_IMAGE': return { ...state, profileImage: action.payload }
    case 'SET_CTA': return { ...state, ctaHandle: action.payload.handle ?? state.ctaHandle, ctaText: action.payload.text ?? state.ctaText }
    case 'LOAD_CAROUSEL': return { ...action.payload }
    case 'NEW_CAROUSEL': return { ...initialState, id: generateId() }
    case 'GENERATE_SLIDES': return { ...state, slides: action.payload, activeSlideIndex: 0 }
    case 'ADD_OVERLAY_IMAGE': {
      const slides = [...state.slides]
      const slide = { ...slides[action.payload.slideIndex] }
      slide.overlayImages = [...(slide.overlayImages || []), action.payload.image]
      slides[action.payload.slideIndex] = slide
      return { ...state, slides }
    }
    case 'UPDATE_OVERLAY_IMAGE': {
      const slides = [...state.slides]
      const slide = { ...slides[action.payload.slideIndex] }
      slide.overlayImages = (slide.overlayImages || []).map(img =>
        img.id === action.payload.imageId ? { ...img, ...action.payload.updates } : img
      )
      slides[action.payload.slideIndex] = slide
      return { ...state, slides }
    }
    case 'REMOVE_OVERLAY_IMAGE': {
      const slides = [...state.slides]
      const slide = { ...slides[action.payload.slideIndex] }
      slide.overlayImages = (slide.overlayImages || []).filter(img => img.id !== action.payload.imageId)
      slides[action.payload.slideIndex] = slide
      return { ...state, slides }
    }
    default: return state
  }
}

interface CarouselContextType { state: CarouselState; dispatch: React.Dispatch<Action> }
const CarouselContext = createContext<CarouselContextType | null>(null)

export function CarouselProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(carouselReducer, initialState)
  return <CarouselContext.Provider value={{ state, dispatch }}>{children}</CarouselContext.Provider>
}

export function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) throw new Error('useCarousel must be used within a CarouselProvider')
  return context
}
