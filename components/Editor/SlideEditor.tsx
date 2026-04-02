"use client"

import React, { useRef } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SlideType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Upload, X, AlignLeft, AlignCenter, AlignRight, ArrowUp, Minus, ArrowDown, Trash2 } from 'lucide-react'

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

  if (!slide) return null

  function update(field: string, value: string | null) {
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {slideType === 'cover' ? 'Capa' : slideType === 'cta' ? 'Slide Final (CTA)' : `Slide ${activeSlideIndex + 1}`}
        </span>
        {slides.length > 1 && (
          <button
            onClick={() => dispatch({ type: 'REMOVE_SLIDE', payload: activeSlideIndex })}
            className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            title="Excluir slide"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Emoji / Ícone</Label>
        <Input
          value={slide.emoji}
          onChange={e => update('emoji', e.target.value)}
          placeholder="Ex: ✨ 🚀 1️⃣"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Título</Label>
        <Input
          value={slide.title}
          onChange={e => update('title', e.target.value)}
          placeholder="Título do slide"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">
            {slideType === 'cover' ? 'Subtítulo' : slideType === 'cta' ? 'Texto do CTA' : 'Corpo do texto'}
          </Label>
          <span className="text-[10px] text-muted-foreground">**negrito** *itálico*</span>
        </div>
        <Textarea
          value={slide.body}
          onChange={e => update('body', e.target.value)}
          placeholder={slideType === 'cover' ? 'Subtítulo ou descrição breve...' : 'Conteúdo do slide...\n\nUse Enter para parágrafos.\nUse **texto** para negrito e *texto* para itálico.'}
          className="text-sm min-h-[100px] resize-y"
        />
      </div>

      {slideType === 'content' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Destaque / Citação (opcional)</Label>
            <span className="text-[10px] text-muted-foreground">**negrito**</span>
          </div>
          <Textarea
            value={slide.quote}
            onChange={e => update('quote', e.target.value)}
            placeholder="Texto em destaque..."
            className="text-sm min-h-[50px] resize-y"
          />
        </div>
      )}

      {slideType === 'cta' && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Arroba do perfil</Label>
            <Input
              value={state.ctaHandle}
              onChange={e => dispatch({ type: 'SET_CTA', payload: { handle: e.target.value } })}
              placeholder="@seuperfil"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Texto de CTA</Label>
            <Input
              value={state.ctaText}
              onChange={e => dispatch({ type: 'SET_CTA', payload: { text: e.target.value } })}
              placeholder="Siga para mais conteúdo"
              className="h-9 text-sm"
            />
          </div>
        </>
      )}

      {/* Text position */}
      <div className="space-y-2">
        <Label className="text-xs">Posição do texto</Label>
        <div className="flex gap-1">
          {([['top', ArrowUp, 'Topo'], ['center', Minus, 'Centro'], ['bottom', ArrowDown, 'Base']] as const).map(([pos, Icon, label]) => (
            <button
              key={pos}
              onClick={() => update('textPosition', pos)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-md border transition-colors',
                slide.textPosition === pos
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Text alignment */}
      <div className="space-y-2">
        <Label className="text-xs">Alinhamento</Label>
        <div className="flex gap-1">
          {([['left', AlignLeft, 'Esquerda'], ['center', AlignCenter, 'Centro'], ['right', AlignRight, 'Direita']] as const).map(([align, Icon, label]) => (
            <button
              key={align}
              onClick={() => update('textAlign', align)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-md border transition-colors',
                slide.textAlign === align
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Per-slide image */}
      <div className="space-y-2">
        <Label className="text-xs">Imagem deste slide</Label>
        {slide.image ? (
          <div className="space-y-2">
            <div className="relative rounded-md overflow-hidden border border-border">
              <img src={slide.image} alt="" className="w-full h-20 object-cover" />
              <button
                onClick={() => update('image', null)}
                className="absolute top-1 right-1 p-1 rounded-md bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => imageInputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5" />
              Trocar imagem
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => imageInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Adicionar imagem
          </Button>
        )}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    </div>
  )
}
