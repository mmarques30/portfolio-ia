import { Slide } from './types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

interface GenerateOptions {
  mode: 'topic' | 'script'
  input: string
  slideCount: number
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n|\n(?=[A-Z0-9\u00C0-\u00FF\u2022\-\*\d])/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

function extractTitleAndBody(text: string): { title: string; body: string } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length === 0) return { title: '', body: '' }
  if (lines.length === 1) {
    if (lines[0].length <= 60) return { title: lines[0], body: '' }
    const words = lines[0].split(' ')
    const mid = Math.min(6, Math.ceil(words.length / 3))
    return {
      title: words.slice(0, mid).join(' '),
      body: words.slice(mid).join(' '),
    }
  }
  let title = lines[0].replace(/^[#\-\*\u2022\d\.\)]+\s*/, '')
  if (title.length > 80) title = title.substring(0, 77) + '...'
  return { title, body: lines.slice(1).join('\n') }
}

const TOPIC_TEMPLATES = {
  default: {
    titles: [
      'Você sabia disso?',
      'O ponto principal',
      'Na prática...',
      'O segredo é...',
      'Dica extra',
      'Resumindo',
      'A verdade é que...',
      'O erro mais comum',
      'Como aplicar',
      'Resultado final',
    ],
  },
}

const SLIDE_EMOJIS = ['✨', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

export function generateCarouselSlides(options: GenerateOptions): Slide[] {
  const { mode, input, slideCount } = options
  const totalSlides = Math.max(3, Math.min(15, slideCount))

  if (mode === 'script') {
    return generateFromScript(input, totalSlides)
  }
  return generateFromTopic(input, totalSlides)
}

function generateFromScript(script: string, totalSlides: number): Slide[] {
  const paragraphs = splitIntoParagraphs(script)
  const slides: Slide[] = []

  if (paragraphs.length === 0) {
    return generateFromTopic('Meu Carrossel', totalSlides)
  }

  const cover = extractTitleAndBody(paragraphs[0])
  slides.push({
    id: generateId(),
    title: cover.title || 'Título do Carrossel',
    body: cover.body || 'Deslize para saber mais →',
    quote: '',
    emoji: '✨',
  })

  const contentCount = totalSlides - 2
  const contentParagraphs = paragraphs.slice(1)

  if (contentParagraphs.length >= contentCount) {
    const step = contentParagraphs.length / contentCount
    for (let i = 0; i < contentCount; i++) {
      const idx = Math.floor(i * step)
      const { title, body } = extractTitleAndBody(contentParagraphs[idx])
      slides.push({
        id: generateId(),
        title: title || `Slide ${i + 2}`,
        body: body || contentParagraphs[idx],
        quote: '',
        emoji: SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)],
      })
    }
  } else {
    for (let i = 0; i < contentCount; i++) {
      if (i < contentParagraphs.length) {
        const { title, body } = extractTitleAndBody(contentParagraphs[i])
        slides.push({
          id: generateId(),
          title: title || `Slide ${i + 2}`,
          body: body || contentParagraphs[i],
          quote: '',
          emoji: SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)],
        })
      } else {
        slides.push({
          id: generateId(),
          title: `Ponto ${i + 1}`,
          body: 'Adicione seu conteúdo aqui...',
          quote: '',
          emoji: SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)],
        })
      }
    }
  }

  slides.push({
    id: generateId(),
    title: 'Gostou do conteúdo?',
    body: 'Salve este post e compartilhe!',
    quote: '',
    emoji: '👉',
  })

  return slides
}

function generateFromTopic(topic: string, totalSlides: number): Slide[] {
  const slides: Slide[] = []
  const templates = TOPIC_TEMPLATES.default

  slides.push({
    id: generateId(),
    title: topic || 'Título do Carrossel',
    body: 'Deslize para saber mais →',
    quote: '',
    emoji: '✨',
  })

  const contentCount = totalSlides - 2
  for (let i = 0; i < contentCount; i++) {
    const titleIdx = i % templates.titles.length
    slides.push({
      id: generateId(),
      title: templates.titles[titleIdx],
      body: `Desenvolva o ponto ${i + 1} sobre "${topic}" aqui...`,
      quote: '',
      emoji: SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)],
    })
  }

  slides.push({
    id: generateId(),
    title: 'Gostou do conteúdo?',
    body: 'Salve este post e compartilhe!',
    quote: '',
    emoji: '👉',
  })

  return slides
}
