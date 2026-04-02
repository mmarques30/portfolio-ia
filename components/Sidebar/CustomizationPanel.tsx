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
    <div className="w-96 border-l border-border bg-card flex flex-col shrink-0">
      <Tabs defaultValue="ai" className="flex flex-col flex-1 min-h-0">
        <div className="border-b border-border px-3 pt-2">
          <TabsList className="w-full h-9 grid grid-cols-4">
            <TabsTrigger value="ai" className="text-xs gap-1 px-1">
              <Sparkles className="w-3 h-3" />
              Gerar
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs gap-1 px-1">
              <PenLine className="w-3 h-3" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs gap-1 px-1">
              <Palette className="w-3 h-3" />
              Design
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs gap-1 px-1">
              <Download className="w-3 h-3" />
              Exportar
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="ai" className="mt-0">
            <AIGenerator />
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <SlideEditor />
          </TabsContent>

          <TabsContent value="design" className="mt-0 p-4 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Templates</h3>
              <TemplateSelector />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cores</h3>
              <ColorPicker />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fontes</h3>
              <FontSelector />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fundo</h3>
              <BackgroundSelector />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Marca</h3>
              <LogoUpload />
            </div>
          </TabsContent>

          <TabsContent value="export" className="mt-0 p-4">
            <ExportPanel onExport={onExport} onExportSlide={onExportSlide} isExporting={isExporting} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
