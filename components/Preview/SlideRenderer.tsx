"use client"

import React from 'react'
import { Slide, CarouselState, SlideType } from '@/lib/types'
import { getFontFamily } from '@/lib/fonts'

interface SlideRendererProps {
  slide: Slide
  slideIndex: number
  totalSlides: number
  state: CarouselState
  slideType: SlideType
  scale?: number
}

function FormattedText({ text }: { text: string }) {
  if (!text) return null
  const lines = text.split('\n')
  function parseLine(line: string, lineKey: number): React.ReactNode {
    const parts: React.ReactNode[] = []
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    let key = 0
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(<React.Fragment key={`t${lineKey}-${key++}`}>{line.substring(lastIndex, match.index)}</React.Fragment>)
      if (match[2]) parts.push(<strong key={`b${lineKey}-${key++}`}>{match[2]}</strong>)
      else if (match[3]) parts.push(<em key={`i${lineKey}-${key++}`}>{match[3]}</em>)
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) parts.push(<React.Fragment key={`e${lineKey}-${key++}`}>{line.substring(lastIndex)}</React.Fragment>)
    return parts.length > 0 ? parts : line
  }
  return <span>{lines.map((line, i) => (<React.Fragment key={i}>{i > 0 && <br />}{parseLine(line, i)}</React.Fragment>))}</span>
}

function getBackgroundStyle(state: CarouselState): React.CSSProperties {
  const { background, colors } = state
  if (background.type === 'gradient') return { background: `linear-gradient(135deg, ${background.color1}, ${background.color2})` }
  return { backgroundColor: colors.background }
}

function getPatternOverlay(state: CarouselState): React.ReactNode {
  if (state.background.type !== 'pattern') return null
  const color = state.colors.textSecondary + '15'
  const patterns: Record<string, React.CSSProperties> = {
    dots: { backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`, backgroundSize: '24px 24px' },
    lines: { backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 23px, ${color} 23px, ${color} 24px)` },
    grid: { backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '40px 40px' },
  }
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...(patterns[state.background.pattern] || {}) }} />
}

function GlobalBackgroundImage({ state }: { state: CarouselState }) {
  if (state.background.type !== 'image' || !state.background.image) return null
  const opacity = state.background.imageOpacity ?? 0.3
  return (
    <>
      <img src={state.background.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity, display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: state.colors.background, opacity: 1 - opacity }} />
    </>
  )
}

function SlideBackgroundImage({ slide }: { slide: Slide }) {
  if (!slide.image) return null
  const opacity = slide.imageOpacity ?? 0.5
  const overlayColor = slide.imageOverlayColor || '#000000'
  return (
    <>
      <img src={slide.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: overlayColor, opacity: 1 - opacity }} />
    </>
  )
}

function OverlayImages({ slide }: { slide: Slide }) {
  const images = slide.overlayImages || []
  if (images.length === 0) return null
  return (
    <>
      {images.map(img => (
        <img key={img.id} src={img.src} alt="" style={{ position: 'absolute', left: `${img.x}%`, top: `${img.y}%`, width: `${img.width}%`, height: 'auto', transform: 'translate(-50%, -50%)', opacity: img.opacity / 100, borderRadius: `${img.borderRadius}%`, zIndex: img.zIndex || 1, pointerEvents: 'none', display: 'block' }} />
      ))}
    </>
  )
}

function getPositionStyle(position: string, py: number, offsetY: number = 0): React.CSSProperties {
  const base: React.CSSProperties = { transform: `translateY(${offsetY}px)` }
  switch (position) {
    case 'top': return { ...base, justifyContent: 'flex-start', paddingTop: `${py + 40}px` }
    case 'bottom': return { ...base, justifyContent: 'flex-end', paddingBottom: `${py + 40}px` }
    default: return { ...base, justifyContent: 'center' }
  }
}

function getTextColor(slide: Slide, state: CarouselState): string {
  if (slide.textColor) return slide.textColor
  if (slide.image) return '#FFFFFF'
  return state.colors.text
}

function getSubColor(slide: Slide, state: CarouselState): string {
  if (slide.textSecondaryColor) return slide.textSecondaryColor
  if (slide.image) return '#FFFFFFCC'
  return state.colors.textSecondary
}

function getTitleSize(slide: Slide, slideType: SlideType, template: string): number {
  if (slide.titleSize && slide.titleSize > 0) return slide.titleSize
  if (slideType === 'cover') return template === 'provocative' ? 72 : 56
  if (slideType === 'cta') return 40
  return template === 'provocative' ? 48 : template === 'data-trends' ? 40 : 36
}

function getBodySize(slide: Slide, slideType: SlideType, template: string): number {
  if (slide.bodySize && slide.bodySize > 0) return slide.bodySize
  if (slideType === 'cover') return 24
  if (slideType === 'cta') return 22
  return template === 'provocative' ? 22 : 20
}

function CoverSlide({ slide, state }: { slide: Slide; state: CarouselState }) {
  const textColor = getTextColor(slide, state)
  const subColor = getSubColor(slide, state)
  const px = slide.paddingX ?? 80
  const py = slide.paddingY ?? 80
  const tSize = getTitleSize(slide, 'cover', state.template)
  const bSize = getBodySize(slide, 'cover', state.template)
  const isProvocative = state.template === 'provocative'
  const maxW = `${slide.textMaxWidth || 100}%`
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: slide.textAlign === 'left' ? 'flex-start' : slide.textAlign === 'right' ? 'flex-end' : 'center', height: '100%', padding: `${py}px ${px}px`, textAlign: (slide.textAlign || 'center') as any, ...getPositionStyle(slide.textPosition || 'center', py, slide.textOffsetY || 0), zIndex: 2 }}>
      {slide.emoji && <div style={{ marginBottom: '32px', fontSize: '64px', lineHeight: 1 }}>{slide.emoji}</div>}
      <h1 style={{ lineHeight: 1.1, fontWeight: 'bold', marginBottom: '24px', width: '100%', maxWidth: maxW, fontFamily: getFontFamily(state.fonts.heading), fontSize: `${tSize}px`, color: textColor, letterSpacing: isProvocative ? '-2px' : '-1px', textTransform: isProvocative ? 'uppercase' : 'none' }}><FormattedText text={slide.title} /></h1>
      {slide.body && <div style={{ fontFamily: getFontFamily(state.fonts.body), fontSize: `${bSize}px`, color: subColor, lineHeight: 1.5, maxWidth: maxW }}><FormattedText text={slide.body} /></div>}
    </div>
  )
}

function ContentSlide({ slide, slideIndex, state }: { slide: Slide; slideIndex: number; state: CarouselState }) {
  const textColor = getTextColor(slide, state)
  const subColor = getSubColor(slide, state)
  const px = slide.paddingX ?? 80
  const py = slide.paddingY ?? 80
  const tSize = getTitleSize(slide, 'content', state.template)
  const bSize = getBodySize(slide, 'content', state.template)
  const isProvocative = state.template === 'provocative'
  const maxW = `${slide.textMaxWidth || 100}%`
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: `${py}px ${px}px`, textAlign: (slide.textAlign || 'left') as any, ...getPositionStyle(slide.textPosition || 'center', py, slide.textOffsetY || 0), zIndex: 2 }}>
      {slide.emoji && <div style={{ marginBottom: '20px', fontSize: '40px', lineHeight: 1 }}>{slide.emoji}</div>}
      <h2 style={{ fontWeight: 'bold', marginBottom: '20px', lineHeight: 1.15, width: '100%', maxWidth: maxW, fontFamily: getFontFamily(state.fonts.heading), fontSize: `${tSize}px`, color: textColor, letterSpacing: isProvocative ? '-1.5px' : '-0.5px', textTransform: isProvocative ? 'uppercase' : 'none' }}><FormattedText text={slide.title} /></h2>
      <div style={{ lineHeight: 1.7, width: '100%', maxWidth: maxW, fontFamily: getFontFamily(state.fonts.body), fontSize: `${bSize}px`, color: subColor }}><FormattedText text={slide.body} /></div>
      {slide.quote && <div style={{ marginTop: '32px', paddingLeft: '20px', borderLeft: `3px solid ${textColor}30`, width: '100%', maxWidth: maxW, fontFamily: getFontFamily(state.fonts.body), fontSize: `${Math.round(bSize * 0.9)}px`, color: textColor, lineHeight: 1.6 }}><FormattedText text={slide.quote} /></div>}
    </div>
  )
}

function CTASlide({ slide, state }: { slide: Slide; state: CarouselState }) {
  const textColor = getTextColor(slide, state)
  const subColor = getSubColor(slide, state)
  const px = slide.paddingX ?? 80
  const py = slide.paddingY ?? 80
  const tSize = getTitleSize(slide, 'cta', state.template)
  const bSize = getBodySize(slide, 'cta', state.template)
  const maxW = `${slide.textMaxWidth || 100}%`
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', padding: `${py}px ${px}px`, textAlign: (slide.textAlign || 'center') as any, ...getPositionStyle(slide.textPosition || 'center', py, slide.textOffsetY || 0), zIndex: 2 }}>
      <div style={{ width: '96px', height: '96px', borderRadius: '50%', marginBottom: '32px', flexShrink: 0, overflow: 'hidden', backgroundColor: state.colors.accent + '20', border: `3px solid ${state.colors.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state.profileImage ? <img src={state.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <span style={{ fontSize: '40px', color: state.colors.accent, lineHeight: 1 }}>{slide.emoji || ''}</span>}
      </div>
      <h2 style={{ fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.2, width: '100%', maxWidth: maxW, fontFamily: getFontFamily(state.fonts.heading), fontSize: `${tSize}px`, color: textColor, letterSpacing: '-1px' }}><FormattedText text={slide.title} /></h2>
      <div style={{ marginBottom: '32px', width: '100%', maxWidth: maxW, fontFamily: getFontFamily(state.fonts.body), fontSize: `${bSize}px`, color: subColor, lineHeight: 1.5 }}><FormattedText text={state.ctaText || slide.body} /></div>
      <div style={{ padding: '14px 32px', borderRadius: '9999px', fontWeight: 600, backgroundColor: state.colors.accent, color: state.colors.background, fontFamily: getFontFamily(state.fonts.body), fontSize: '20px' }}>{state.ctaHandle}</div>
    </div>
  )
}

export default function SlideRenderer({ slide, slideIndex, totalSlides, state, slideType, scale = 1 }: SlideRendererProps) {
  const width = 1080
  const height = state.format === '1080x1080' ? 1080 : 1350
  return (
    <div style={{ width: `${width}px`, height: `${height}px`, transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left', ...getBackgroundStyle(state), position: 'relative', overflow: 'hidden' }}>
      <GlobalBackgroundImage state={state} />
      <SlideBackgroundImage slide={slide} />
      {getPatternOverlay(state)}
      {slideType === 'cover' && <CoverSlide slide={slide} state={state} />}
      {slideType === 'content' && <ContentSlide slide={slide} slideIndex={slideIndex} state={state} />}
      {slideType === 'cta' && <CTASlide slide={slide} state={state} />}
      <OverlayImages slide={slide} />
      {state.showSlideNumbers && slide.showSlideNumber !== false && (
        <div style={{ position: 'absolute', top: '40px', right: '40px', fontFamily: getFontFamily(state.fonts.body), fontSize: '16px', color: slide.image ? '#FFFFFF80' : state.colors.textSecondary + '80', fontWeight: 500, zIndex: 10 }}>
          {String(slideIndex + 1).padStart(2, '0')}/{String(totalSlides).padStart(2, '0')}
        </div>
      )}
      {state.logo && slide.showLogo !== false && (
        <div style={{ position: 'absolute', bottom: '32px', right: '32px', zIndex: 10 }}>
          <img src={state.logo} alt="" style={{ height: '32px', width: 'auto', opacity: 0.6 }} />
        </div>
      )}
    </div>
  )
}
