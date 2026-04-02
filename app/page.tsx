"use client"

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { CarouselProvider, useCarousel } from '@/lib/carousel-context'
import { SlideType, SavedCarousel } from '@/lib/types'
import { exportCarouselAsZip, exportSlideAsPng } from '@/lib/export'
import { saveDraft, getDrafts, deleteDraft, loadDraft } from '@/lib/storage'
import { useKeyboardShortcuts } from '@/lib/keyboard'
import { TooltipProvider } from '@/components/ui/tooltip'
import Toolbar from '@/components/Toolbar/Toolbar'
import SlideList from '@/components/Editor/SlideList'
import SlidePreview from '@/components/Preview/SlidePreview'
import CarouselNavigation from '@/components/Preview/CarouselNavigation'
import CustomizationPanel from '@/components/Sidebar/CustomizationPanel'
import PhoneMockup from '@/components/Preview/PhoneMockup'
import SlideRenderer from '@/components/Preview/SlideRenderer'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

function getSlideType(index: number, total: number): SlideType {
  if (index === 0) return 'cover'
  if (index === total - 1) return 'cta'
  return 'content'
}

function CarouselEditor() {
  const { state, dispatch } = useCarousel()
  const [isExporting, setIsExporting] = useState(false)
  const [showMockup, setShowMockup] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [drafts, setDrafts] = useState<SavedCarousel[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const exportContainerRef = useRef<HTMLDivElement>(null)

  const handleSave = useCallback(() => {
    try {
      saveDraft(state)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Save failed:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [state])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await new Promise(r => setTimeout(r, 500))
      const container = exportContainerRef.current
      if (!container) return
      const elements = Array.from(container.children) as HTMLElement[]
      await exportCarouselAsZip(elements, state.name)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [state])

  const handleExportSlide = useCallback(async (index: number) => {
    setIsExporting(true)
    try {
      await new Promise(r => setTimeout(r, 500))
      const container = exportContainerRef.current
      if (!container) return
      const element = container.children[index] as HTMLElement
      if (!element) return
      await exportSlideAsPng(element, `slide-${String(index + 1).padStart(2, '0')}.png`)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [])

  const handleNewCarousel = useCallback(() => { dispatch({ type: 'NEW_CAROUSEL' }) }, [dispatch])
  const handleLoadDrafts = useCallback(() => { setDrafts(getDrafts()); setShowDrafts(true) }, [])
  const handleLoadDraft = useCallback((id: string) => { const draft = loadDraft(id); if (draft) { dispatch({ type: 'LOAD_CAROUSEL', payload: draft }); setShowDrafts(false) } }, [dispatch])
  const handleDeleteDraft = useCallback((id: string) => { deleteDraft(id); setDrafts(getDrafts()) }, [])

  const keyboardHandlers = useMemo(() => ({
    onSave: handleSave,
    onExport: handleExport,
    onPrevSlide: () => dispatch({ type: 'SET_ACTIVE_SLIDE', payload: state.activeSlideIndex - 1 }),
    onNextSlide: () => dispatch({ type: 'SET_ACTIVE_SLIDE', payload: state.activeSlideIndex + 1 }),
  }), [handleSave, handleExport, dispatch, state.activeSlideIndex])

  useKeyboardShortcuts(keyboardHandlers)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar onExport={handleExport} onSave={handleSave} onLoadDrafts={handleLoadDrafts} onNewCarousel={handleNewCarousel} onToggleMockup={() => setShowMockup(!showMockup)} isExporting={isExporting} saveStatus={saveStatus} />
      <div className="flex-1 flex min-h-0">
        <SlideList />
        <div className="flex-1 flex flex-col min-w-0" style={{ background: 'hsl(40,20%,96%)' }}>
          {showMockup ? (
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto"><PhoneMockup /></div>
          ) : (
            <><SlidePreview /><CarouselNavigation /></>
          )}
        </div>
        <CustomizationPanel onExport={handleExport} onExportSlide={handleExportSlide} isExporting={isExporting} />
      </div>

      {/* Export container - positioned off-screen but still rendered */}
      <div
        ref={exportContainerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: '0',
          opacity: 1,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {state.slides.map((slide, index) => (
          <SlideRenderer key={slide.id} slide={slide} slideIndex={index} totalSlides={state.slides.length} state={state} slideType={getSlideType(index, state.slides.length)} scale={1} />
        ))}
      </div>

      {/* Drafts dialog */}
      <Dialog open={showDrafts} onOpenChange={setShowDrafts}>
        <DialogContent style={{ maxWidth: '440px', borderRadius: '16px' }}>
          <DialogHeader>
            <DialogTitle>Rascunhos salvos</DialogTitle>
            <DialogDescription>Selecione um rascunho para continuar editando.</DialogDescription>
          </DialogHeader>
          <div style={{ maxHeight: '320px', overflow: 'auto' }} className="space-y-2">
            {drafts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontSize: '14px', color: 'hsl(0,0%,46%)' }}>Nenhum rascunho salvo.</p>
                <p style={{ fontSize: '12px', color: 'hsl(0,0%,60%)', marginTop: '4px' }}>Clique em "Salvar" para guardar seu trabalho.</p>
              </div>
            ) : drafts.map(d => (
              <div key={d.id} className="group" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid hsl(0,0%,88%)', cursor: 'pointer', transition: 'all 150ms' }} onMouseOver={e => (e.currentTarget.style.background = 'hsl(80,40%,97%)')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                <button style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => handleLoadDraft(d.id)}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: '12px', color: 'hsl(0,0%,46%)' }}>{new Date(d.updatedAt).toLocaleDateString('pt-BR')} — {d.state.slides.length} slides</div>
                </button>
                <button onClick={() => handleDeleteDraft(d.id)} className="opacity-0 group-hover:opacity-100" style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: 'hsl(0,0%,46%)', cursor: 'pointer', transition: 'opacity 150ms' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Home() {
  return (
    <TooltipProvider>
      <CarouselProvider>
        <CarouselEditor />
      </CarouselProvider>
    </TooltipProvider>
  )
}
