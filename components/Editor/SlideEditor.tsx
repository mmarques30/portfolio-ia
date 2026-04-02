"use client"

import React, { useRef } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SlideType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Upload, X, AlignLeft, AlignCenter, AlignRight, ArrowUp, Minus, ArrowDown, Trash2, Bold, Italic, ImageIcon } from 'lucide-react'

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
  const imageInputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  if (!slide) return null

  function update(field: string, value: string | number | null) {
    dispatch({ type: 'UPDATE_SLIDE', payload: { index: activeSlideIndex, slide: { [field]: value } } })
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('image', reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {slideType === 'cover' ? 'Capa' : slideType === 'cta' ? 'Slide Final (CTA)' : `Slide ${activeSlideIndex + 1}`}
        </span>
        {slides.length > 1 && (
          <button onClick={() => dispatch({ type: 'REMOVE_SLIDE', payload: activeSlideIndex })} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Excluir slide">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Per-slide image */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <Label className="text-xs font-semibold">Imagem deste slide</Label>
        </div>
        {slide.image ? (
          <div className="space-y-2">
            <div className="relative rounded-md overflow-hidden border border-border">
              <img src={slide.image} alt="" className="w-full h-20 object-cover" />
              <button onClick={() => update('image', null)} className="absolute top-1 right-1 p-1 rounded-md bg-black/50 hover:bg-black/70 text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Opacidade da imagem</Label>
              <div className="flex items-center gap-2">
                <input type="range" min={10} max={100} value={Math.round((slide.imageOpacity ?? 0.5) * 100)} onChange={e => update('imageOpacity', Number(e.target.value) / 100)} style={{ flex: 1, minWidth: 0 }} className="accent-primary" />
                <span className="text-[10px] text-muted-foreground" style={{ width: '28px', textAlign: 'right', flexShrink: 0 }}>{Math.round((slide.imageOpacity ?? 0.5) * 100)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Cor do overlay</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={slide.imageOverlayColor || '#000000'} onChange={e => update('imageOverlayColor', e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-none" />
                <span className="text-[10px] text-muted-foreground">Sobre a imagem</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => imageInputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> Trocar imagem
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => imageInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" /> Adicionar imagem (só neste slide)
          </Button>
        )}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div className="border-t border-border" />

      {/* Text colors */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Cores do texto (este slide)</Label>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <input type="color" value={slide.textColor || state.colors.text} onChange={e => update('textColor', e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-none" />
            <span className="text-[10px] text-muted-foreground">Título</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input type="color" value={slide.textSecondaryColor || state.colors.textSecondary} onChange={e => update('textSecondaryColor', e.target.value)} className="w-6 h-6 rounded border border-border cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-none" />
            <span className="text-[10px] text-muted-foreground">Corpo</span>
          </div>
          {(slide.textColor || slide.textSecondaryColor) && (
            <button onClick={() => { update('textColor', null); update('textSecondaryColor', null) }} className="text-[10px] text-muted-foreground hover:text-foreground underline">Resetar</button>
          )}
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="space-y-2">
        <Label className="text-xs">Emoji / Ícone</Label>
        <Input value={slide.emoji} onChange={e => update('emoji', e.target.value)} placeholder="Ex: ✨ 🚀 1️⃣" className="h-9 text-sm" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Título</Label>
          <span className="text-[10px] text-muted-foreground">Enter = nova linha</span>
        </div>
        <Textarea
          value={slide.title}
          onChange={e => update('title', e.target.value)}
          placeholder="Título do slide"
          className="text-sm min-h-[60px] resize-y"
        />
      </div>

      {/* Body text - NOT shown for CTA (ctaText handles it) */}
      {slideType !== 'cta' && (
        <div className="space-y-2">
          <Label className="text-xs">
            {slideType === 'cover' ? 'Subtítulo' : 'Corpo do texto'}
          </Label>
          <div className="flex items-center gap-1 mb-1">
            <button onClick={() => wrapSelection('**')} className="p-1.5 rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Negrito">
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => wrapSelection('*')} className="p-1.5 rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Itálico">
              <Italic className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-muted-foreground ml-1">Selecione + B ou I</span>
          </div>
          <Textarea ref={bodyRef} value={slide.body} onChange={e => update('body', e.target.value)} placeholder={'Conteúdo do slide...\n\nUse Enter para parágrafos.'} className="text-sm min-h-[100px] resize-y" />
        </div>
      )}

      {slideType === 'content' && (
        <div className="space-y-2">
          <Label className="text-xs">Destaque / Citação (opcional)</Label>
          <Textarea value={slide.quote} onChange={e => update('quote', e.target.value)} placeholder="Texto em destaque..." className="text-sm min-h-[50px] resize-y" />
        </div>
      )}

      {slideType === 'cta' && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Arroba do perfil</Label>
            <Input value={state.ctaHandle} onChange={e => dispatch({ type: 'SET_CTA', payload: { handle: e.target.value } })} placeholder="@seuperfil" className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Texto do CTA</Label>
            <Textarea
              value={state.ctaText}
              onChange={e => dispatch({ type: 'SET_CTA', payload: { text: e.target.value } })}
              placeholder="Siga para mais conteúdo"
              className="text-sm min-h-[60px] resize-y"
            />
          </div>
        </>
      )}

      <div className="border-t border-border" />

      <div className="space-y-2">
        <Label className="text-xs">Posição do texto</Label>
        <div className="flex gap-1">
          {([['top', ArrowUp, 'Topo'], ['center', Minus, 'Centro'], ['bottom', ArrowDown, 'Base']] as const).map(([pos, Icon, label]) => (
            <button key={pos} onClick={() => update('textPosition', pos)} className={cn('flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-md border transition-colors', slide.textPosition === pos ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Alinhamento</Label>
        <div className="flex gap-1">
          {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([align, Icon]) => (
            <button key={align} onClick={() => update('textAlign', align)} className={cn('flex-1 flex items-center justify-center text-xs py-1.5 rounded-md border transition-colors', slide.textAlign === align ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
