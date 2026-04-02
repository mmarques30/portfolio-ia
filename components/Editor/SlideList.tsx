"use client"

import React from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useCarousel } from '@/lib/carousel-context'
import { SlideType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import SlideListItem from './SlideListItem'

function getSlideType(index: number, total: number): SlideType {
  if (index === 0) return 'cover'
  if (index === total - 1) return 'cta'
  return 'content'
}

export default function SlideList() {
  const { state, dispatch } = useCarousel()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = state.slides.findIndex(s => s.id === active.id)
    const newIndex = state.slides.findIndex(s => s.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) dispatch({ type: 'REORDER_SLIDES', payload: { oldIndex, newIndex } })
  }

  return (
    <div style={{ width: '240px', background: 'hsl(0,0%,6%)', borderRight: '1px solid hsl(0,0%,18%)', display: 'flex', flexDirection: 'column', flexShrink: 0, color: 'hsl(0,0%,80%)' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid hsl(0,0%,18%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(0,0%,46%)' }}>Slides</span>
        <span style={{ fontSize: '12px', color: 'hsl(0,0%,46%)' }}>{state.slides.length}/15</span>
      </div>
      <ScrollArea className="flex-1">
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={state.slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {state.slides.map((slide, index) => (
                <SlideListItem
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={index === state.activeSlideIndex}
                  slideType={getSlideType(index, state.slides.length)}
                  state={state}
                  onSelect={() => dispatch({ type: 'SET_ACTIVE_SLIDE', payload: index })}
                  onDuplicate={() => dispatch({ type: 'DUPLICATE_SLIDE', payload: index })}
                  onRemove={() => dispatch({ type: 'REMOVE_SLIDE', payload: index })}
                  canRemove={state.slides.length > 1}
                  canDuplicate={state.slides.length < 15}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
      <div style={{ padding: '12px', borderTop: '1px solid hsl(0,0%,18%)' }}>
        <button
          onClick={() => dispatch({ type: 'ADD_SLIDE' })}
          disabled={state.slides.length >= 15}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '12px', fontWeight: 500, background: 'transparent', border: '1px solid hsl(0,0%,25%)', borderRadius: '8px', color: 'hsl(0,0%,70%)', cursor: state.slides.length >= 15 ? 'not-allowed' : 'pointer', opacity: state.slides.length >= 15 ? 0.4 : 1, transition: 'all 150ms' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Slide
        </button>
      </div>
    </div>
  )
}
