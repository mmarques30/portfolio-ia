"use client"

import React, { useState, useMemo } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { generateCarouselSlides } from '@/lib/ai-generator'
import { analyzeEngagement, getEngagementLabel } from '@/lib/engagement-analyzer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Sparkles, FileText, BarChart3 } from 'lucide-react'

export default function AIGenerator() {
  const { state, dispatch } = useCarousel()
  const [mode, setMode] = useState<'topic' | 'script'>('script')
  const [input, setInput] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const engagement = useMemo(() => analyzeEngagement(state), [state])
  const label = useMemo(() => getEngagementLabel(engagement.total), [engagement.total])

  function handleGenerate() {
    if (!input.trim()) return
    const slides = generateCarouselSlides({ mode, input: input.trim(), slideCount })
    dispatch({ type: 'GENERATE_SLIDES', payload: slides })
    setShowAnalysis(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Modo de geração</Label>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('script')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md border transition-colors',
              mode === 'script' ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Roteiro
          </button>
          <button
            onClick={() => setMode('topic')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md border transition-colors',
              mode === 'topic' ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tópico
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
            placeholder={'Cole aqui seu roteiro completo...\n\nSepare os slides com linhas em branco.\n\nExemplo:\n\n5 Dicas de Produtividade\nAprenda a render mais no dia a dia\n\nDica 1: Planeje seu dia\nReserve 10 minutos toda manhã para organizar suas prioridades.'}
            className="text-sm min-h-[160px] resize-none"
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
        <Label className="text-xs">Número de slides</Label>
        <div className="flex items-center gap-2">
          <input type="range" min={3} max={15} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} className="flex-1 accent-primary" />
          <span className="text-sm font-medium w-6 text-center">{slideCount}</span>
        </div>
      </div>

      <Button className="w-full gap-1.5" onClick={handleGenerate} disabled={!input.trim()}>
        <Sparkles className="w-4 h-4" />
        Gerar Carrossel
      </Button>

      <p className="text-[10px] text-muted-foreground">
        {mode === 'script'
          ? 'O texto será distribuído automaticamente entre os slides. Separe seções com linhas em branco.'
          : 'Será gerada uma estrutura de carrossel com base no tópico. Edite os textos depois.'}
      </p>

      {/* Engagement Analysis */}
      <div className="border-t border-border pt-4 mt-4">
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Análise de Engajamento
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: label.color }}>{engagement.total}/100</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: label.color + '20', color: label.color }}>
              {label.label}
            </span>
          </div>
        </button>

        {showAnalysis && (
          <div className="mt-3 space-y-2.5">
            {engagement.details.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium">{d.score}/{d.max}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(d.score / d.max) * 100}%`,
                      backgroundColor: d.score >= d.max * 0.7 ? '#22c55e' : d.score >= d.max * 0.4 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {d.tip}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
