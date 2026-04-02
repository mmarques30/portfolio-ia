"use client"

import React from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { TEMPLATES } from '@/lib/templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Download, Square, RectangleVertical, Save, FolderOpen, FilePlus, Smartphone, Check, AlertCircle } from 'lucide-react'
import { FormatType, TemplateId } from '@/lib/types'

interface ToolbarProps {
  onExport: () => void
  onSave: () => void
  onLoadDrafts: () => void
  onNewCarousel: () => void
  onToggleMockup: () => void
  isExporting: boolean
  saveStatus?: 'idle' | 'saved' | 'error'
}

export default function Toolbar({ onExport, onSave, onLoadDrafts, onNewCarousel, onToggleMockup, isExporting, saveStatus = 'idle' }: ToolbarProps) {
  const { state, dispatch } = useCarousel()

  return (
    <div style={{ height: '56px', borderBottom: '1px solid hsl(0,0%,18%)', background: 'hsl(0,0%,6%)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#A8E63D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(0,0%,6%)', fontWeight: 700, fontSize: '16px' }}>C</span>
        </div>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'white' }} className="hidden md:inline">Carousel Studio</span>
      </div>

      <Separator orientation="vertical" className="h-6" style={{ background: 'hsl(0,0%,18%)' }} />

      <Input
        value={state.name}
        onChange={e => dispatch({ type: 'SET_NAME', payload: e.target.value })}
        style={{ width: '180px', height: '34px', fontSize: '13px', background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,18%)', color: 'white', borderRadius: '8px' }}
        placeholder="Nome do carrossel"
      />

      <Separator orientation="vertical" className="h-6" style={{ background: 'hsl(0,0%,18%)' }} />

      <Select value={state.template} onValueChange={v => dispatch({ type: 'SET_TEMPLATE', payload: v as TemplateId })}>
        <SelectTrigger style={{ width: '160px', height: '34px', fontSize: '13px', background: 'hsl(0,0%,11%)', border: '1px solid hsl(0,0%,18%)', color: 'white', borderRadius: '8px' }}>
          <SelectValue placeholder="Template" />
        </SelectTrigger>
        <SelectContent>{TEMPLATES.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent>
      </Select>

      {/* Format toggle */}
      <div style={{ display: 'flex', border: '1px solid hsl(0,0%,18%)', borderRadius: '8px', overflow: 'hidden' }}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '12px', background: state.format === '1080x1080' ? '#A8E63D' : 'transparent', color: state.format === '1080x1080' ? 'hsl(0,0%,6%)' : 'hsl(0,0%,60%)', fontWeight: state.format === '1080x1080' ? 600 : 400, transition: 'all 150ms ease' }}
          onClick={() => dispatch({ type: 'SET_FORMAT', payload: '1080x1080' })}
        >
          <Square className="w-3.5 h-3.5" /><span className="hidden lg:inline">1:1</span>
        </button>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '12px', background: state.format === '1080x1350' ? '#A8E63D' : 'transparent', color: state.format === '1080x1350' ? 'hsl(0,0%,6%)' : 'hsl(0,0%,60%)', fontWeight: state.format === '1080x1350' ? 600 : 400, transition: 'all 150ms ease' }}
          onClick={() => dispatch({ type: 'SET_FORMAT', payload: '1080x1350' })}
        >
          <RectangleVertical className="w-3.5 h-3.5" /><span className="hidden lg:inline">4:5</span>
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <button onClick={onToggleMockup} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', color: 'hsl(0,0%,70%)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', transition: 'all 150ms' }} onMouseOver={e => (e.currentTarget.style.color = 'white')} onMouseOut={e => (e.currentTarget.style.color = 'hsl(0,0%,70%)')}>
        <Smartphone className="w-4 h-4" /><span className="hidden lg:inline">Mockup</span>
      </button>

      <button onClick={onNewCarousel} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', color: 'hsl(0,0%,70%)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', transition: 'all 150ms' }} onMouseOver={e => (e.currentTarget.style.color = 'white')} onMouseOut={e => (e.currentTarget.style.color = 'hsl(0,0%,70%)')}>
        <FilePlus className="w-4 h-4" /><span className="hidden lg:inline">Novo</span>
      </button>

      <button onClick={onLoadDrafts} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', color: 'hsl(0,0%,70%)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', transition: 'all 150ms' }} onMouseOver={e => (e.currentTarget.style.color = 'white')} onMouseOut={e => (e.currentTarget.style.color = 'hsl(0,0%,70%)')}>
        <FolderOpen className="w-4 h-4" /><span className="hidden lg:inline">Rascunhos</span>
      </button>

      <button onClick={onSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', color: saveStatus === 'saved' ? '#A8E63D' : saveStatus === 'error' ? '#ef4444' : 'hsl(0,0%,70%)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', transition: 'all 150ms' }}>
        {saveStatus === 'saved' ? <Check className="w-4 h-4" /> : saveStatus === 'error' ? <AlertCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        <span className="hidden lg:inline">{saveStatus === 'saved' ? 'Salvo!' : saveStatus === 'error' ? 'Erro' : 'Salvar'}</span>
      </button>

      {/* Export CTA button - lime green */}
      <button
        onClick={onExport}
        disabled={isExporting}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, background: '#A8E63D', color: 'hsl(0,0%,6%)', border: 'none', borderRadius: '8px', cursor: isExporting ? 'wait' : 'pointer', opacity: isExporting ? 0.7 : 1, transition: 'all 150ms' }}
      >
        <Download className="w-4 h-4" />
        {isExporting ? 'Exportando...' : 'Exportar'}
      </button>
    </div>
  )
}
