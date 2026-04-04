"use client"

import React, { useRef } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SlideType, SlideImage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Upload, X, AlignLeft, AlignCenter, AlignRight, ArrowUp, Minus, ArrowDown, Trash2, Bold, Italic, ImageIcon, Plus, Layers } from 'lucide-react'

function getSlideType(index: number, total: number): SlideType {
  if (index === 0) return 'cover'
  if (index === total - 1) return 'cta'
  return 'content'
}

export default function SlideEditor() {
  const { state, dispatch } = useCarousel()
  const { activeSlideIndex, slides } = state
  const slide = slides[activeSlideIndex]
  const slideType = getSlideType(activeSlideIndex, slides.length)
  const bgImageInputRef = useRef<HTMLInputElement>(null)
  const overlayImageInputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  if (!slide) return null

  function update(field: string, value: string | number | null) {
    dispatch({ type: 'UPDATE_SLIDE', payload: { index: activeSlideIndex, slide: { [field]: value } } })
  }

  function handleBgImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('image', reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleOverlayImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const newImage: SlideImage = {
        id: Math.random().toString(36).substring(2, 9),
        src: reader.result as string,
        x: 50, y: 50,
        width: 30, height: 30,
        opacity: 100,
        borderRadius: 0,
        zIndex: (slide.overlayImages?.length || 0) + 1,
      }
      dispatch({ type: 'ADD_OVERLAY_IMAGE', payload: { slideIndex: activeSlideIndex, image: newImage } })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function updateOverlay(imageId: string, updates: Partial<SlideImage>) {
    dispatch({ type: 'UPDATE_OVERLAY_IMAGE', payload: { slideIndex: activeSlideIndex, imageId, updates } })
  }

  function removeOverlay(imageId: string) {
    dispatch({ type: 'REMOVE_OVERLAY_IMAGE', payload: { slideIndex: activeSlideIndex, imageId } })
  }

  function wrapSelection(wrapper: '**' | '*') {
    const textarea = bodyRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = slide.body
    const selected = text.substring(start, end)
    if (selected.length === 0) return
    const newText = text.substring(0, start) + wrapper + selected + wrapper + text.substring(end)
    update('body', newText)
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + wrapper.length, end + wrapper.length) }, 0)
  }

  const overlayImages = slide.overlayImages || []

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(0,0%,46%)' }}>
          {slideType === 'cover' ? 'Capa' : slideType === 'cta' ? 'Slide Final (CTA)' : `Slide ${activeSlideIndex + 1}`}
        </span>
        {slides.length > 1 && (
          <button onClick={() => dispatch({ type: 'REMOVE_SLIDE', payload: activeSlideIndex })} style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', color: 'hsl(0,0%,50%)', cursor: 'pointer' }} title="Excluir slide">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Background image */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" style={{ color: 'hsl(0,0%,46%)' }} />
          <Label className="text-xs font-semibold">Imagem de fundo</Label>
        </div>
        {slide.image ? (
          <div className="space-y-2">
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid hsl(0,0%,25%)' }}>
              <img src={slide.image} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => update('image', null)} style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer' }}><X className="w-3 h-3" /></button>
            </div>
            <div className="space-y-1">
              <Label style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Opacidade</Label>
              <div className="flex items-center gap-2">
                <input type="range" min={10} max={100} value={Math.round((slide.imageOpacity ?? 0.5) * 100)} onChange={e => update('imageOpacity', Number(e.target.value) / 100)} style={{ flex: 1, minWidth: 0 }} className="accent-[#A8E63D]" />
                <span style={{ fontSize: '10px', color: 'hsl(0,0%,46%)', width: '28px', textAlign: 'right' }}>{Math.round((slide.imageOpacity ?? 0.5) * 100)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Cor do overlay</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={slide.imageOverlayColor || '#000000'} onChange={e => update('imageOverlayColor', e.target.value)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid hsl(0,0%,25%)', cursor: 'pointer' }} />
                <span style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Sobre a imagem</span>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => bgImageInputRef.current?.click()} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '12px', background: 'transparent', border: '1px solid hsl(0,0%,25%)', borderRadius: '8px', color: 'hsl(0,0%,70%)', cursor: 'pointer' }}>
            <Upload className="w-3.5 h-3.5" /> Adicionar imagem de fundo
          </button>
        )}
        <input ref={bgImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
      </div>

      {/* Overlay images - multiple */}
      <div className="space-y-2" style={{ borderTop: '1px solid hsl(0,0%,18%)', paddingTop: '12px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" style={{ color: '#A8E63D' }} />
            <Label className="text-xs font-semibold">Imagens extras ({overlayImages.length})</Label>
          </div>
          <button onClick={() => overlayImageInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 500, background: '#A8E63D', color: 'hsl(0,0%,6%)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            <Plus className="w-3 h-3" /> Adicionar
          </button>
        </div>
        <p style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Adicione logos, stickers, fotos. Ajuste posição X/Y, tamanho e opacidade.</p>
        <input ref={overlayImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleOverlayImageUpload} />

        {overlayImages.map((img, idx) => (
          <div key={img.id} style={{ padding: '8px', borderRadius: '8px', border: '1px solid hsl(0,0%,25%)', background: 'hsl(0,0%,9%)' }} className="space-y-2">
            <div className="flex items-center gap-2">
              <img src={img.src} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
              <span style={{ flex: 1, fontSize: '11px', color: 'hsl(0,0%,70%)' }}>Imagem {idx + 1}</span>
              <button onClick={() => removeOverlay(img.id)} style={{ padding: '2px', background: 'none', border: 'none', color: 'hsl(0,72%,51%)', cursor: 'pointer' }}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2" style={{ fontSize: '10px' }}>
              <div>
                <Label style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>X (%)</Label>
                <input type="range" min={0} max={100} value={img.x} onChange={e => updateOverlay(img.id, { x: Number(e.target.value) })} style={{ width: '100%' }} className="accent-[#A8E63D]" />
              </div>
              <div>
                <Label style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Y (%)</Label>
                <input type="range" min={0} max={100} value={img.y} onChange={e => updateOverlay(img.id, { y: Number(e.target.value) })} style={{ width: '100%' }} className="accent-[#A8E63D]" />
              </div>
              <div>
                <Label style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Largura (%)</Label>
                <input type="range" min={5} max={100} value={img.width} onChange={e => updateOverlay(img.id, { width: Number(e.target.value) })} style={{ width: '100%' }} className="accent-[#A8E63D]" />
              </div>
              <div>
                <Label style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Opacidade</Label>
                <input type="range" min={10} max={100} value={img.opacity} onChange={e => updateOverlay(img.id, { opacity: Number(e.target.value) })} style={{ width: '100%' }} className="accent-[#A8E63D]" />
              </div>
              <div>
                <Label style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Arredondamento</Label>
                <input type="range" min={0} max={50} value={img.borderRadius} onChange={e => updateOverlay(img.id, { borderRadius: Number(e.target.value) })} style={{ width: '100%' }} className="accent-[#A8E63D]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid hsl(0,0%,18%)', paddingTop: '12px' }} />

      {/* Text colors */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Cores do texto</Label>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <input type="color" value={slide.textColor || state.colors.text} onChange={e => update('textColor', e.target.value)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid hsl(0,0%,25%)', cursor: 'pointer' }} />
            <span style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Título</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input type="color" value={slide.textSecondaryColor || state.colors.textSecondary} onChange={e => update('textSecondaryColor', e.target.value)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid hsl(0,0%,25%)', cursor: 'pointer' }} />
            <span style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Corpo</span>
          </div>
          {(slide.textColor || slide.textSecondaryColor) && (
            <button onClick={() => { update('textColor', null); update('textSecondaryColor', null) }} style={{ fontSize: '10px', color: 'hsl(0,0%,46%)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Resetar</button>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid hsl(0,0%,18%)', paddingTop: '12px' }} />

      <div className="space-y-2">
        <Label className="text-xs">Emoji / Ícone</Label>
        <Input value={slide.emoji} onChange={e => update('emoji', e.target.value)} placeholder="Ex: ✨ 🚀 1️⃣" className="h-9 text-sm" style={{ background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,25%)', color: 'white', borderRadius: '8px' }} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Título</Label>
          <span style={{ fontSize: '10px', color: 'hsl(0,0%,46%)' }}>Enter = nova linha</span>
        </div>
        <Textarea value={slide.title} onChange={e => update('title', e.target.value)} placeholder="Título do slide" className="text-sm min-h-[60px] resize-y" style={{ background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,25%)', color: 'white', borderRadius: '8px' }} />
      </div>

      {slideType !== 'cta' && (
        <div className="space-y-2">
          <Label className="text-xs">{slideType === 'cover' ? 'Subtítulo' : 'Corpo do texto'}</Label>
          <div className="flex items-center gap-1 mb-1">
            <button onClick={() => wrapSelection('**')} style={{ padding: '6px', borderRadius: '6px', border: '1px solid hsl(0,0%,25%)', background: 'none', color: 'hsl(0,0%,60%)', cursor: 'pointer' }} title="Negrito"><Bold className="w-3.5 h-3.5" /></button>
            <button onClick={() => wrapSelection('*')} style={{ padding: '6px', borderRadius: '6px', border: '1px solid hsl(0,0%,25%)', background: 'none', color: 'hsl(0,0%,60%)', cursor: 'pointer' }} title="Itálico"><Italic className="w-3.5 h-3.5" /></button>
            <span style={{ fontSize: '10px', color: 'hsl(0,0%,46%)', marginLeft: '4px' }}>Selecione + B ou I</span>
          </div>
          <Textarea ref={bodyRef} value={slide.body} onChange={e => update('body', e.target.value)} placeholder={'Conteúdo do slide...\n\nUse Enter para parágrafos.'} className="text-sm min-h-[100px] resize-y" style={{ background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,25%)', color: 'white', borderRadius: '8px' }} />
        </div>
      )}

      {slideType === 'content' && (
        <div className="space-y-2">
          <Label className="text-xs">Destaque / Citação (opcional)</Label>
          <Textarea value={slide.quote} onChange={e => update('quote', e.target.value)} placeholder="Texto em destaque..." className="text-sm min-h-[50px] resize-y" style={{ background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,25%)', color: 'white', borderRadius: '8px' }} />
        </div>
      )}

      {slideType === 'cta' && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Arroba do perfil</Label>
            <Input value={state.ctaHandle} onChange={e => dispatch({ type: 'SET_CTA', payload: { handle: e.target.value } })} placeholder="@seuperfil" className="h-9 text-sm" style={{ background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,25%)', color: 'white', borderRadius: '8px' }} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Texto do CTA</Label>
            <Textarea value={state.ctaText} onChange={e => dispatch({ type: 'SET_CTA', payload: { text: e.target.value } })} placeholder="Siga para mais conteúdo" className="text-sm min-h-[60px] resize-y" style={{ background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,25%)', color: 'white', borderRadius: '8px' }} />
          </div>
        </>
      )}

      <div style={{ borderTop: '1px solid hsl(0,0%,18%)', paddingTop: '12px' }} />

      <div className="space-y-2">
        <Label className="text-xs">Posição do texto</Label>
        <div className="flex gap-1">
          {([['top', ArrowUp, 'Topo'], ['center', Minus, 'Centro'], ['bottom', ArrowDown, 'Base']] as const).map(([pos, Icon, label]) => (
            <button key={pos} onClick={() => update('textPosition', pos)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', padding: '6px', borderRadius: '8px', border: slide.textPosition === pos ? '1px solid #A8E63D' : '1px solid hsl(0,0%,25%)', background: slide.textPosition === pos ? 'rgba(168,230,61,0.1)' : 'transparent', color: slide.textPosition === pos ? 'white' : 'hsl(0,0%,60%)', cursor: 'pointer', transition: 'all 150ms' }}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Alinhamento</Label>
        <div className="flex gap-1">
          {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([align, Icon]) => (
            <button key={align} onClick={() => update('textAlign', align)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', padding: '6px', borderRadius: '8px', border: slide.textAlign === align ? '1px solid #A8E63D' : '1px solid hsl(0,0%,25%)', background: slide.textAlign === align ? 'rgba(168,230,61,0.1)' : 'transparent', color: slide.textAlign === align ? 'white' : 'hsl(0,0%,60%)', cursor: 'pointer', transition: 'all 150ms' }}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
