"use client"

import React, { useState, useMemo } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { generateCarouselSlides } from '@/lib/ai-generator'
import { analyzeEngagement, getEngagementLabel } from '@/lib/engagement-analyzer'
import { generateSuggestions } from '@/lib/smart-suggestions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Sparkles, FileText, BarChart3, Lightbulb, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react'

export default function AIGenerator() {
  const { state, dispatch } = useCarousel()
  const [mode, setMode] = useState<'topic' | 'script'>('script')
  const [input, setInput] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [appliedIdx, setAppliedIdx] = useState<Set<number>>(new Set())

  const engagement = useMemo(() => analyzeEngagement(state), [state])
  const label = useMemo(() => getEngagementLabel(engagement.total), [engagement.total])
  const suggestions = useMemo(() => generateSuggestions(state), [state])

  function handleGenerate() {
    if (!input.trim()) return
    const slides = generateCarouselSlides({ mode, input: input.trim(), slideCount })
    dispatch({ type: 'GENERATE_SLIDES', payload: slides })
    setAppliedIdx(new Set())
  }

  function applySuggestion(idx: number) {
    const s = suggestions[idx]
    if (!s.action) return
    dispatch({ type: 'UPDATE_SLIDE', payload: { index: s.slideIndex, slide: { [s.action.field]: s.action.value } } })
    setAppliedIdx(prev => new Set(prev).add(idx))
  }

  function copyPrompt(idx: number, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const actionableSuggestions = suggestions.filter(s => s.action || s.copyText)
  const generalSuggestions = suggestions.filter(s => !s.action && !s.copyText)

  return (
    <div className="p-4 space-y-4" style={{ maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Generator */}
      <div className="space-y-2">
        <Label className="text-xs">Modo de geração</Label>
        <div className="flex gap-1">
          <button onClick={() => setMode('script')} className={cn('flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md border transition-colors', mode === 'script' ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
            <FileText className="w-3.5 h-3.5 shrink-0" /> Roteiro
          </button>
          <button onClick={() => setMode('topic')} className={cn('flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-md border transition-colors', mode === 'topic' ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
            <Sparkles className="w-3.5 h-3.5 shrink-0" /> Tópico
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">{mode === 'script' ? 'Cole seu roteiro / texto' : 'Tema do carrossel'}</Label>
        {mode === 'script' ? (
          <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder={'Cole aqui seu roteiro completo...\n\nSepare os slides com linhas em branco.'} className="text-sm min-h-[120px] resize-none" style={{ maxWidth: '100%' }} />
        ) : (
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ex: 5 Dicas de Produtividade" className="h-9 text-sm" style={{ maxWidth: '100%' }} />
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Número de slides</Label>
        <div className="flex items-center gap-2" style={{ maxWidth: '100%' }}>
          <input type="range" min={3} max={15} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} style={{ flex: 1, minWidth: 0 }} className="accent-primary" />
          <span className="text-sm font-medium" style={{ width: '24px', textAlign: 'center', flexShrink: 0 }}>{slideCount}</span>
        </div>
      </div>

      <Button className="w-full gap-1.5" onClick={handleGenerate} disabled={!input.trim()} style={{ maxWidth: '100%' }}>
        <Sparkles className="w-4 h-4 shrink-0" /> Gerar Carrossel
      </Button>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-border pt-4">
          <button onClick={() => setShowSuggestions(!showSuggestions)} className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors">
            <div className="flex items-center gap-1.5" style={{ minWidth: 0 }}>
              <Lightbulb className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sugestões da IA ({suggestions.length})</span>
            </div>
            {showSuggestions ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          </button>

          {showSuggestions && (
            <div className="mt-3 space-y-2">
              {actionableSuggestions.map((s) => {
                const globalIdx = suggestions.indexOf(s)
                const isApplied = appliedIdx.has(globalIdx)
                const isCopied = copiedIdx === globalIdx

                return (
                  <div key={globalIdx} className={cn('p-2.5 rounded-lg border text-xs space-y-1.5', isApplied ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-accent/30')} style={{ overflow: 'hidden', maxWidth: '100%' }}>
                    <div className="font-medium text-foreground" style={{ wordBreak: 'break-word' }}>{s.label}</div>
                    <div className="text-muted-foreground leading-relaxed" style={{ wordBreak: 'break-word' }}>{s.description}</div>

                    {s.action && (
                      <div className="flex items-center gap-1.5 pt-1" style={{ maxWidth: '100%' }}>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="px-2 py-1 rounded bg-background border border-border text-[10px] font-mono text-muted-foreground">
                          {s.action.value}
                        </div>
                        <button
                          onClick={() => applySuggestion(globalIdx)}
                          disabled={isApplied}
                          style={{ flexShrink: 0 }}
                          className={cn('px-2 py-1 rounded text-[10px] font-medium transition-colors', isApplied ? 'bg-green-500/20 text-green-500' : 'bg-primary text-primary-foreground hover:bg-primary/90')}
                        >
                          {isApplied ? 'OK' : 'Aplicar'}
                        </button>
                      </div>
                    )}

                    {s.copyText && (
                      <div className="space-y-1.5 pt-1">
                        <div className="px-2 py-1.5 rounded bg-background border border-border text-[10px] font-mono text-muted-foreground leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {s.copyText}
                        </div>
                        <button
                          onClick={() => copyPrompt(globalIdx, s.copyText!)}
                          className={cn('flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors', isCopied ? 'bg-green-500/20 text-green-500' : 'bg-accent text-foreground hover:bg-accent/80')}
                        >
                          {isCopied ? <><Check className="w-3 h-3 shrink-0" /> Copiado!</> : <><Copy className="w-3 h-3 shrink-0" /> Copiar prompt</>}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {generalSuggestions.map((s, i) => (
                <div key={`g${i}`} className="p-2.5 rounded-lg border border-border bg-accent/20 text-xs space-y-1" style={{ overflow: 'hidden' }}>
                  <div className="font-medium text-foreground" style={{ wordBreak: 'break-word' }}>{s.label}</div>
                  <div className="text-muted-foreground leading-relaxed" style={{ wordBreak: 'break-word' }}>{s.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Engagement Score */}
      <div className="border-t border-border pt-4">
        <button onClick={() => setShowAnalysis(!showAnalysis)} className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>Engajamento</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-sm" style={{ color: label.color }}>{engagement.total}/100</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: label.color + '20', color: label.color }}>{label.label}</span>
          </div>
        </button>

        {showAnalysis && (
          <div className="mt-3 space-y-2.5">
            {engagement.details.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                  <span className="font-medium shrink-0 ml-2">{d.score}/{d.max}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(d.score / d.max) * 100}%`, backgroundColor: d.score >= d.max * 0.7 ? '#22c55e' : d.score >= d.max * 0.4 ? '#eab308' : '#ef4444' }} />
                </div>
                <p className="text-[10px] text-muted-foreground" style={{ wordBreak: 'break-word' }}>{d.tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
