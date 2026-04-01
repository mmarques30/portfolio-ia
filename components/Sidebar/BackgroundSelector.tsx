"use client"

import React, { useRef } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BackgroundType, PatternType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Upload, X } from 'lucide-react'

const BG_TYPES: { value: BackgroundType; label: string }[] = [
  { value: 'solid', label: 'Sólido' },
  { value: 'gradient', label: 'Gradiente' },
  { value: 'pattern', label: 'Padrão' },
  { value: 'image', label: 'Imagem' },
]

const PATTERNS: { value: PatternType; label: string }[] = [
  { value: 'dots', label: 'Pontos' },
  { value: 'lines', label: 'Linhas' },
  { value: 'grid', label: 'Grade' },
]

export default function BackgroundSelector() {
  const { state, dispatch } = useCarousel()
  const imageInputRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      dispatch({ type: 'SET_BACKGROUND', payload: { image: reader.result as string, type: 'image' } })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Tipo de fundo</Label>
        <div className="grid grid-cols-2 gap-1">
          {BG_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: { type: t.value } })}
              className={cn(
                'text-xs py-1.5 rounded-md border transition-colors',
                state.background.type === t.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {state.background.type === 'gradient' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={state.background.color1}
              onChange={e => dispatch({ type: 'SET_BACKGROUND', payload: { color1: e.target.value } })}
              className="w-8 h-8 rounded-md border border-border cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
            <span className="text-xs text-muted-foreground">Cor 1</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={state.background.color2}
              onChange={e => dispatch({ type: 'SET_BACKGROUND', payload: { color2: e.target.value } })}
              className="w-8 h-8 rounded-md border border-border cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
            <span className="text-xs text-muted-foreground">Cor 2</span>
          </div>
          <div
            className="h-8 rounded-md border border-border"
            style={{ background: `linear-gradient(135deg, ${state.background.color1}, ${state.background.color2})` }}
          />
        </div>
      )}

      {state.background.type === 'pattern' && (
        <div className="space-y-2">
          <Label className="text-xs">Padrão</Label>
          <div className="flex gap-1">
            {PATTERNS.map(p => (
              <button
                key={p.value}
                onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: { pattern: p.value } })}
                className={cn(
                  'flex-1 text-xs py-1.5 rounded-md border transition-colors',
                  state.background.pattern === p.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.background.type === 'image' && (
        <div className="space-y-3">
          {state.background.image ? (
            <div className="space-y-2">
              <div className="relative rounded-md overflow-hidden border border-border">
                <img
                  src={state.background.image}
                  alt="Fundo"
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: { image: null } })}
                  className="absolute top-1 right-1 p-1 rounded-md bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => imageInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                Trocar imagem
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={() => imageInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload imagem de fundo
            </Button>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Opacidade da imagem</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={(state.background.imageOpacity ?? 0.3) * 100}
                onChange={e => dispatch({ type: 'SET_BACKGROUND', payload: { imageOpacity: Number(e.target.value) / 100 } })}
                className="flex-1 accent-primary"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round((state.background.imageOpacity ?? 0.3) * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Cor de overlay</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={state.colors.background}
                onChange={e => dispatch({ type: 'SET_COLORS', payload: { background: e.target.value } })}
                className="w-8 h-8 rounded-md border border-border cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
              />
              <span className="text-xs text-muted-foreground">Sobre a imagem</span>
            </div>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}
    </div>
  )
}
