"use client"

import React from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CarouselNavigation() {
  const { state, dispatch } = useCarousel()
  const { activeSlideIndex, slides } = state

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '12px 0', flexShrink: 0, background: 'hsl(40,20%,96%)', borderTop: '1px solid hsl(0,0%,88%)' }}>
      <button
        onClick={() => dispatch({ type: 'SET_ACTIVE_SLIDE', payload: activeSlideIndex - 1 })}
        disabled={activeSlideIndex === 0}
        style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer', opacity: activeSlideIndex === 0 ? 0.3 : 1, color: 'hsl(0,0%,30%)', transition: 'all 150ms' }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => dispatch({ type: 'SET_ACTIVE_SLIDE', payload: i })}
            style={{
              width: i === activeSlideIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              background: i === activeSlideIndex ? '#A8E63D' : 'hsl(0,0%,75%)',
            }}
          />
        ))}
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_ACTIVE_SLIDE', payload: activeSlideIndex + 1 })}
        disabled={activeSlideIndex === slides.length - 1}
        style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: activeSlideIndex === slides.length - 1 ? 'not-allowed' : 'pointer', opacity: activeSlideIndex === slides.length - 1 ? 0.3 : 1, color: 'hsl(0,0%,30%)', transition: 'all 150ms' }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
