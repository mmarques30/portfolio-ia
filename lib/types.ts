export interface Slide {
  id: string
  title: string
  body: string
  quote: string
  emoji: string
  image: string | null
  imageOpacity: number
  imageOverlayColor: string
  textColor: string | null
  textSecondaryColor: string | null
  textPosition: 'top' | 'center' | 'bottom'
  textAlign: 'left' | 'center' | 'right'
}

export interface ColorConfig {
  background: string
  text: string
  textSecondary: string
  accent: string
}

export interface FontConfig {
  heading: string
  body: string
}

export type BackgroundType = 'solid' | 'gradient' | 'pattern' | 'image'
export type PatternType = 'dots' | 'lines' | 'grid'

export interface BackgroundConfig {
  type: BackgroundType
  color1: string
  color2: string
  pattern: PatternType
  image: string | null
  imageOpacity: number
}

export type TemplateId = 'educational' | 'provocative' | 'data-trends' | 'storytelling'
export type FormatType = '1080x1080' | '1080x1350'

export interface CarouselState {
  id: string
  name: string
  slides: Slide[]
  activeSlideIndex: number
  template: TemplateId
  format: FormatType
  colors: ColorConfig
  fonts: FontConfig
  background: BackgroundConfig
  showSlideNumbers: boolean
  logo: string | null
  ctaHandle: string
  ctaText: string
  profileImage: string | null
}

export interface SavedCarousel {
  id: string
  name: string
  updatedAt: string
  state: CarouselState
}

export interface TemplateConfig {
  id: TemplateId
  name: string
  description: string
  defaults: {
    colors: ColorConfig
    fonts: FontConfig
    background: BackgroundConfig
  }
}

export type SlideType = 'cover' | 'content' | 'cta'

export interface EngagementScore {
  total: number
  details: { label: string; score: number; max: number; tip: string }[]
}
