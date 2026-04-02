"use client"

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import TemplateSelector from './TemplateSelector'
import ColorPicker from './ColorPicker'
import FontSelector from './FontSelector'
import BackgroundSelector from './BackgroundSelector'
import LogoUpload from './LogoUpload'
import ExportPanel from './ExportPanel'
import SlideEditor from '@/components/Editor/SlideEditor'
import AIGenerator from './AIGenerator'
import { Sparkles, PenLine, Palette, Download } from 'lucide-react'

interface CustomizationPanelProps {
  onExport: () => void
  onExportSlide: (index: number) => void
  isExporting: boolean
}

export default function CustomizationPanel({ onExport, onExportSlide, isExporting }: CustomizationPanelProps) {
  return (
    <div style={{ width: '420px', minWidth: '420px', maxWidth: '420px', background: 'hsl(0,0%,6%)', borderLeft: '1px solid hsl(0,0%,18%)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', color: 'hsl(0,0%,95%)' }}>
      <Tabs defaultValue="ai" className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div style={{ borderBottom: '1px solid hsl(0,0%,18%)', padding: '12px 16px 8px' }}>
          <TabsList className="w-full h-9 grid grid-cols-4">
            <TabsTrigger value="ai" className="text-xs gap-1 px-1 data-[state=active]:bg-[#A8E63D] data-[state=active]:text-black">
              <Sparkles className="w-3 h-3 shrink-0" />
              Gerar
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs gap-1 px-1 data-[state=active]:bg-[#A8E63D] data-[state=active]:text-black">
              <PenLine className="w-3 h-3 shrink-0" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs gap-1 px-1 data-[state=active]:bg-[#A8E63D] data-[state=active]:text-black">
              <Palette className="w-3 h-3 shrink-0" />
              Design
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs gap-1 px-1 data-[state=active]:bg-[#A8E63D] data-[state=active]:text-black">
              <Download className="w-3 h-3 shrink-0" />
              Exportar
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div style={{ width: '420px', maxWidth: '420px', boxSizing: 'border-box' }}>
            <TabsContent value="ai" className="mt-0">
              <AIGenerator />
            </TabsContent>
            <TabsContent value="content" className="mt-0">
              <SlideEditor />
            </TabsContent>
            <TabsContent value="design" className="mt-0 p-4 space-y-6">
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(0,0%,46%)', marginBottom: '12px' }}>Templates</h3>
                <TemplateSelector />
              </div>
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(0,0%,46%)', marginBottom: '12px' }}>Cores</h3>
                <ColorPicker />
              </div>
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(0,0%,46%)', marginBottom: '12px' }}>Fontes</h3>
                <FontSelector />
              </div>
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(0,0%,46%)', marginBottom: '12px' }}>Fundo</h3>
                <BackgroundSelector />
              </div>
              <div>
                <h3 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(0,0%,46%)', marginBottom: '12px' }}>Marca</h3>
                <LogoUpload />
              </div>
            </TabsContent>
            <TabsContent value="export" className="mt-0 p-4">
              <ExportPanel onExport={onExport} onExportSlide={onExportSlide} isExporting={isExporting} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
