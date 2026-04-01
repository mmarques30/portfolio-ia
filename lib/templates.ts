import { TemplateConfig } from './types'

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'educational',
    name: 'Educacional',
    description: 'Tutoriais, passo a passo, "como fazer X"',
    defaults: {
      colors: {
        background: '#F4F2ED',
        text: '#1A1A1A',
        textSecondary: '#5A5A5A',
        accent: '#6B7A2F',
      },
      fonts: {
        heading: 'DM Sans',
        body: 'DM Sans',
      },
      background: {
        type: 'solid',
        color1: '#F4F2ED',
        color2: '#E8E5DC',
        pattern: 'dots',
        image: null,
        imageOpacity: 0.3,
      },
    },
  },
  {
    id: 'provocative',
    name: 'Provocativo',
    description: 'Mitos vs verdades, hooks fortes, visual bold',
    defaults: {
      colors: {
        background: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
        accent: '#9AAD3D',
      },
      fonts: {
        heading: 'Archivo',
        body: 'Space Grotesk',
      },
      background: {
        type: 'solid',
        color1: '#1A1A1A',
        color2: '#2A2A2A',
        pattern: 'grid',
        image: null,
        imageOpacity: 0.3,
      },
    },
  },
  {
    id: 'data-trends',
    name: 'Dados & Tend\u00eancias',
    description: 'Estat\u00edsticas, compara\u00e7\u00f5es, n\u00fameros em destaque',
    defaults: {
      colors: {
        background: '#FAFAF6',
        text: '#1A1A1A',
        textSecondary: '#6B6B6B',
        accent: '#C5D1A0',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Plus Jakarta Sans',
      },
      background: {
        type: 'solid',
        color1: '#FAFAF6',
        color2: '#F0EDE5',
        pattern: 'lines',
        image: null,
        imageOpacity: 0.3,
      },
    },
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Hist\u00f3rias pessoais, cases, jornadas',
    defaults: {
      colors: {
        background: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#7A7A7A',
        accent: '#D4DEB3',
      },
      fonts: {
        heading: 'Sora',
        body: 'Sora',
      },
      background: {
        type: 'solid',
        color1: '#FFFFFF',
        color2: '#F8F8F8',
        pattern: 'dots',
        image: null,
        imageOpacity: 0.3,
      },
    },
  },
]

export const IAPLICADA_PRESETS = [
  { name: 'Sage Claro', value: '#D4DEB3' },
  { name: 'Oliva Escuro', value: '#6B7A2F' },
  { name: 'Sage M\u00e9dio', value: '#C5D1A0' },
  { name: 'Verde Amarelado', value: '#9AAD3D' },
  { name: 'Fundo Escuro', value: '#1A1A1A' },
  { name: 'Fundo Claro', value: '#F4F2ED' },
  { name: 'Fundo Card', value: '#FAFAF6' },
]

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0]
}
