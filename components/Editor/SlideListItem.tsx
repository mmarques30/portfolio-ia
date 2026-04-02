"use client"

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Slide, CarouselState, SlideType } from '@/lib/types'
import { GripVertical, Copy, Trash2 } from 'lucide-react'

interface SlideListItemProps {
  slide: Slide
  index: number
  isActive: boolean
  slideType: SlideType
  state: CarouselState
  onSelect: () => void
  onDuplicate: () => void
  onRemove: () => void
  canRemove: boolean
  canDuplicate: boolean
}

export default function SlideListItem({
  slide, index, isActive, slideType, state,
  onSelect, onDuplicate, onRemove, canRemove, canDuplicate,
}: SlideListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const typeLabel = slideType === 'cover' ? 'Capa' : slideType === 'cta' ? 'CTA' : `Slide ${index + 1}`

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        background: isActive ? 'hsl(0,0%,13%)' : 'transparent',
        borderLeft: isActive ? '3px solid #A8E63D' : '3px solid transparent',
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={onSelect}
      className="group"
    >
      <button {...attributes} {...listeners} style={{ touchAction: 'none', color: 'hsl(0,0%,50%)', cursor: 'grab', background: 'none', border: 'none', padding: 0 }}>
        <GripVertical className="w-4 h-4" />
      </button>

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '6px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '7px',
          fontWeight: 500,
          overflow: 'hidden',
          backgroundColor: state.colors.background,
          color: state.colors.text,
          border: `1px solid hsl(0,0%,25%)`,
          backgroundImage: slide.image ? `url(${slide.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!slide.image && (
          <span style={{ padding: '0 4px', textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {slide.title.substring(0, 20)}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? 'white' : 'hsl(0,0%,80%)' }}>{typeLabel}</div>
        <div style={{ fontSize: '10px', color: 'hsl(0,0%,50%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.title}</div>
      </div>

      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {canDuplicate && (
          <button onClick={e => { e.stopPropagation(); onDuplicate() }} style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: 'hsl(0,0%,50%)', cursor: 'pointer' }}>
            <Copy className="w-3 h-3" />
          </button>
        )}
        {canRemove && (
          <button onClick={e => { e.stopPropagation(); onRemove() }} style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: 'hsl(0,0%,50%)', cursor: 'pointer' }}>
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
