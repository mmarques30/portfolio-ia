import { CarouselState, Slide } from './types'
import { generateMasterImagePrompt } from './ai-generator'

export interface Suggestion {
  slideIndex: number
  type: 'title' | 'body' | 'emoji' | 'image-prompt' | 'general'
  label: string
  description: string
  action?: { field: string; value: string }
  copyText?: string
}

function suggestEmoji(text: string): string {
  const lower = text.toLowerCase()
  const map: Record<string, string> = {
    dica: '💡', erro: '❌', certo: '✅', importante: '🚨',
    resultado: '📊', dinheiro: '💰', tempo: '⏰', pessoa: '👤',
    amor: '❤️', ideia: '💡', segredo: '🤫', verdade: '🎯',
  }
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji
  }
  return '✨'
}

function makeHookTitle(originalTitle: string): string {
  if (!/\d/.test(originalTitle)) {
    return `3 ${originalTitle.charAt(0).toLowerCase() + originalTitle.slice(1)} que vão mudar seu jogo`
  }
  if (!originalTitle.includes('?')) {
    return `${originalTitle} — você sabia?`
  }
  return originalTitle
}

export function generateSuggestions(state: CarouselState): Suggestion[] {
  const suggestions: Suggestion[] = []
  const { slides } = state

  // Cover analysis
  const cover = slides[0]
  if (cover) {
    if (cover.title.length < 10) {
      suggestions.push({
        slideIndex: 0, type: 'title', label: '🎯 Gancho fraco',
        description: 'O título da capa está muito curto. Use um hook forte.',
        action: { field: 'title', value: makeHookTitle(cover.title) },
      })
    } else if (!cover.title.includes('?') && !cover.title.includes('!') && !/\d/.test(cover.title)) {
      suggestions.push({
        slideIndex: 0, type: 'title', label: '🎯 Melhorar gancho da capa',
        description: 'Use números, perguntas ou exclamações para mais engajamento.',
        action: { field: 'title', value: makeHookTitle(cover.title) },
      })
    }
    if (!cover.emoji) {
      suggestions.push({
        slideIndex: 0, type: 'emoji', label: '✨ Adicionar emoji na capa',
        description: 'Emojis chamam atenção no feed.',
        action: { field: 'emoji', value: suggestEmoji(cover.title) },
      })
    }
    if (!cover.body || cover.body.length < 10) {
      suggestions.push({
        slideIndex: 0, type: 'body', label: '📝 Adicionar subtítulo',
        description: 'Um subtítulo curto ajuda a contextualizar.',
        action: { field: 'body', value: 'Deslize para descobrir →' },
      })
    }
  }

  // Content slides
  for (let i = 1; i < slides.length - 1; i++) {
    const slide = slides[i]
    if (!slide.emoji) {
      suggestions.push({
        slideIndex: i, type: 'emoji', label: `✨ Emoji no slide ${i + 1}`,
        description: 'Adicionar emoji para destaque visual.',
        action: { field: 'emoji', value: suggestEmoji(slide.title + ' ' + slide.body) },
      })
    }
    if (slide.body.length < 20) {
      suggestions.push({
        slideIndex: i, type: 'body', label: `📝 Slide ${i + 1}: texto curto`,
        description: 'Textos com 30-150 caracteres performam melhor.',
      })
    }
  }

  // Master image prompt (ONE for all slides)
  const hasAnyImage = slides.some(s => s.image) || state.background.image
  if (!hasAnyImage) {
    const topic = slides[0]?.title || 'carrossel'
    suggestions.push({
      slideIndex: -1, type: 'image-prompt', label: '🎨 Prompt master para TODAS as imagens',
      description: 'Copie este prompt e cole no ChatGPT, Midjourney, DALL-E ou Canva IA. Ele descreve todas as imagens do carrossel de uma vez:',
      copyText: generateMasterImagePrompt(slides, topic),
    })
  }

  // CTA
  const cta = slides[slides.length - 1]
  if (cta && slides.length > 1) {
    if (!state.profileImage) {
      suggestions.push({
        slideIndex: slides.length - 1, type: 'general', label: '📷 Foto de perfil no CTA',
        description: 'Carrosséis com foto de perfil no CTA têm 40% mais cliques. Adicione em Design > Marca.',
      })
    }
  }

  // Visual
  if (!state.logo) {
    suggestions.push({ slideIndex: -1, type: 'general', label: '🏢 Adicionar logo', description: "Uma marca d'agua sutil aumenta reconhecimento. Vá em Design > Marca." })
  }
  if (state.fonts.heading === state.fonts.body) {
    suggestions.push({ slideIndex: -1, type: 'general', label: '🔤 Variar fontes', description: 'Use fontes diferentes para título e corpo. Ex: Playfair Display + DM Sans.' })
  }

  return suggestions
}
