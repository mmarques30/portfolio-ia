import { CarouselState, Slide } from './types'

export interface Suggestion {
  slideIndex: number
  type: 'title' | 'body' | 'emoji' | 'image-prompt' | 'general'
  label: string
  description: string
  action?: { field: string; value: string }
  copyText?: string
}

const POWER_WORDS = ['segredo', 'erro', 'verdade', 'nunca', 'sempre', 'pare', 'evite', 'descubra', 'aprenda', 'domine']
const HOOK_STARTERS = [
  'Você está cometendo esse erro?',
  'A maioria das pessoas não sabe disso...',
  'Pare de fazer isso AGORA',
  'O que ninguém te conta sobre',
  'X coisas que você precisa saber',
]

const EMOJI_MAP: Record<string, string[]> = {
  dica: ['💡', '✨', '🔥'],
  erro: ['❌', '⚠️', '🚫'],
  certo: ['✅', '👍', '🎯'],
  importante: ['🚨', '❗', '📌'],
  resultado: ['📊', '🚀', '📈'],
  dinheiro: ['💰', '💵', '💸'],
  tempo: ['⏰', '⌛', '📅'],
  pessoa: ['👤', '🧑‍💻', '👩‍💼'],
  amor: ['❤️', '💖', '😍'],
  ideia: ['💡', '🧠', '💭'],
}

function suggestEmoji(text: string): string {
  const lower = text.toLowerCase()
  for (const [key, emojis] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emojis[0]
  }
  return '✨'
}

function makeHookTitle(originalTitle: string): string {
  const words = originalTitle.split(' ')
  // Add number if not present
  if (!/\d/.test(originalTitle)) {
    return `3 ${originalTitle.charAt(0).toLowerCase() + originalTitle.slice(1)} que vão mudar seu jogo`
  }
  // Add question if not present
  if (!originalTitle.includes('?')) {
    return `${originalTitle} — você sabia?`
  }
  return originalTitle
}

function generateImagePrompt(slide: Slide, slideIndex: number, total: number): string {
  const topic = slide.title.toLowerCase()
  const isFirst = slideIndex === 0
  const isLast = slideIndex === total - 1

  if (isFirst) {
    return `Professional Instagram carousel cover about "${slide.title}". Modern, clean design with bold typography, gradient background, minimalist style. High quality, 1080x1080, social media ready.`
  }
  if (isLast) {
    return `Professional Instagram CTA slide, "follow for more" design, clean and modern, brand colors, call to action style, 1080x1080.`
  }
  return `Professional background image for Instagram carousel slide about "${slide.title}". Clean, modern, subtle, not too busy, good for text overlay. 1080x1080, social media style.`
}

export function generateSuggestions(state: CarouselState): Suggestion[] {
  const suggestions: Suggestion[] = []
  const { slides } = state

  // Cover analysis
  const cover = slides[0]
  if (cover) {
    // Hook quality
    if (cover.title.length < 10) {
      suggestions.push({
        slideIndex: 0, type: 'title', label: '🎯 Gancho fraco',
        description: 'O título da capa está muito curto. Use um hook forte para prender a atenção.',
        action: { field: 'title', value: makeHookTitle(cover.title) },
      })
    } else if (!cover.title.includes('?') && !cover.title.includes('!') && !/\d/.test(cover.title)) {
      const improved = makeHookTitle(cover.title)
      suggestions.push({
        slideIndex: 0, type: 'title', label: '🎯 Melhorar gancho da capa',
        description: 'Use números, perguntas ou exclamações no título para mais engajamento.',
        action: { field: 'title', value: improved },
      })
    }

    if (!cover.emoji) {
      suggestions.push({
        slideIndex: 0, type: 'emoji', label: '✨ Adicionar emoji na capa',
        description: 'Emojis chamam atenção no feed. Sugestao baseada no seu conteúdo.',
        action: { field: 'emoji', value: suggestEmoji(cover.title) },
      })
    }

    if (!cover.body || cover.body.length < 10) {
      suggestions.push({
        slideIndex: 0, type: 'body', label: '📝 Adicionar subtítulo',
        description: 'Um subtítulo curto ajuda a contextualizar o conteúdo.',
        action: { field: 'body', value: 'Deslize para descobrir →' },
      })
    }

    // Image prompt for cover
    if (!cover.image) {
      suggestions.push({
        slideIndex: 0, type: 'image-prompt', label: '🎨 Prompt para imagem de capa',
        description: 'Copie este prompt e use no ChatGPT, Midjourney ou Canva IA para gerar uma imagem de fundo:',
        copyText: generateImagePrompt(cover, 0, slides.length),
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
        description: 'Textos com 30-150 caracteres performam melhor. Desenvolva mais a ideia.',
      })
    } else if (slide.body.length > 200) {
      suggestions.push({
        slideIndex: i, type: 'body', label: `✂️ Slide ${i + 1}: texto longo`,
        description: 'Textos longos demais perdem atenção. Tente resumir em 2-3 frases.',
      })
    }

    if (!slide.image) {
      suggestions.push({
        slideIndex: i, type: 'image-prompt', label: `🎨 Prompt para slide ${i + 1}`,
        description: 'Prompt para gerar imagem de fundo:',
        copyText: generateImagePrompt(slide, i, slides.length),
      })
    }
  }

  // CTA slide
  const cta = slides[slides.length - 1]
  if (cta && slides.length > 1) {
    if (!state.profileImage) {
      suggestions.push({
        slideIndex: slides.length - 1, type: 'general', label: '📷 Foto de perfil no CTA',
        description: 'Carrosséis com foto de perfil no CTA têm 40% mais cliques no perfil. Adicione em Design > Marca.',
      })
    }
    if (!state.ctaHandle || state.ctaHandle === '@iaplicada') {
      suggestions.push({
        slideIndex: slides.length - 1, type: 'general', label: '📌 Personalizar arroba',
        description: 'Altere o @handle para o seu perfil real.',
      })
    }
  }

  // Visual suggestions
  if (!state.logo) {
    suggestions.push({
      slideIndex: -1, type: 'general', label: '🏢 Adicionar logo',
      description: 'Uma marca d\'agua sutil aumenta o reconhecimento de marca. Vá em Design > Marca.',
    })
  }

  if (state.fonts.heading === state.fonts.body) {
    suggestions.push({
      slideIndex: -1, type: 'general', label: '🔤 Variar fontes',
      description: 'Use fontes diferentes para título e corpo. Ex: título em Playfair Display e corpo em DM Sans.',
    })
  }

  return suggestions
}
