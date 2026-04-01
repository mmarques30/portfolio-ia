"use client"

import React, { useState } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { generateCarouselSlides } from '@/lib/ai-generator'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Sparkles, FileText } from 'lucide-react'

export default function AIGenerator() {
  const { dispatch } = useCarousel()
  const [mode, setMode] = useState<'topic' | 'script'>('script')
  const [input, setInput] = useState('')
  const [slideCount, setSlideCount] = useState(5)

  function handleGenerate() {
    if (!input.trim()) return
    const slides = generateCarouselSlides({ mode, input: input.trim(), slideCount })
    dispatch({ type: 'GENERATE_SLIDES', payload: slides })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Modo de gera\u00e7\u00e3o</Label>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('script')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md border transition-colors',
              mode === 'script'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Roteiro
          </button>
          <button
            onClick={() => setMode('topic')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md border transition-colors',
              mode === 'topic'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            T\u00f3pico
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">
          {mode === 'script' ? 'Cole seu roteiro / texto' : 'Tema do carrossel'}
        </Label>
        {mode === 'script' ? (
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'Cole aqui seu roteiro completo...\n\nSepare os slides com linhas em branco.\n\nExemplo:\n\n5 Dicas de Produtividade\nAprenda a render mais no dia a dia\n\nDica 1: Planeje seu dia\nReserve 10 minutos toda manh\u00e3 para organizar suas prioridades.\n\nDica 2: Use blocos de tempo\nDivida seu dia em blocos focados de 25-50 minutos.'}
            className="text-sm min-h-[200px] resize-none"
          />
        ) : (
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ex: 5 Dicas de Produtividade para Empreendedores"
            className="h-9 text-sm"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">N\u00famero de slides</Label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={3}
            max={15}
            value={slideCount}
            onChange={e => setSlideCount(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-medium w-6 text-center">{slideCount}</span>
        </div>
      </div>

      <Button
        className="w-full gap-1.5"
        onClick={handleGenerate}
        disabled={!input.trim()}
      >
        <Sparkles className="w-4 h-4" />
        Gerar Carrossel
      </Button>

      <p className="text-[10px] text-muted-foreground">
        {mode === 'script'
          ? 'O texto ser\u00e1 distribu\u00eddo automaticamente entre os slides. Separe se\u00e7\u00f5es com linhas em branco.'
          : 'Ser\u00e1 gerada uma estrutura de carrossel com base no t\u00f3pico informado. Edite os textos depois.'}
      </p>
    </div>
  )
}
