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
    // If single line is short, use as title
    if (lines[0].length <= 60) return { title: lines[0], body: '' }
    // Otherwise split at a natural point
    const words = lines[0].split(' ')
    const mid = Math.min(6, Math.ceil(words.length / 3))
    return {
      title: words.slice(0, mid).join(' '),
      body: words.slice(mid).join(' '),
    }
  }
  // First line as title, rest as body
  let title = lines[0].replace(/^[#\-\*\u2022\d\.\)]+\s*/, '')
  if (title.length > 80) title = title.substring(0, 77) + '...'
  return { title, body: lines.slice(1).join('\n') }
}

const TOPIC_TEMPLATES: Record<string, { emoji: string; titles: string[] }> = {
  default: {
    emoji: '\u2728',
    titles: [
      'Voc\u00ea sabia disso?',
      'O ponto principal',
      'Na pr\u00e1tica...',
      'O segredo \u00e9...',
      'Dica extra',
      'Resumindo',
      'A verdade \u00e9 que...',
      'O erro mais comum',
      'Como aplicar',
      'Resultado final',
    ],
  },
}

const SLIDE_EMOJIS = ['\u2728', '1\ufe0f\u20e3', '2\ufe0f\u20e3', '3\ufe0f\u20e3', '4\ufe0f\u20e3', '5\ufe0f\u20e3', '6\ufe0f\u20e3', '7\ufe0f\u20e3', '8\ufe0f\u20e3', '9\ufe0f\u20e3', '\ud83d\udd1f']

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

  // First paragraph -> cover
  const cover = extractTitleAndBody(paragraphs[0])
  slides.push({
    id: generateId(),
    title: cover.title || 'T\u00edtulo do Carrossel',
    body: cover.body || 'Deslize para saber mais \u2192',
    quote: '',
    emoji: '\u2728',
  })

  // Middle paragraphs -> content slides
  const contentCount = totalSlides - 2 // minus cover and CTA
  const contentParagraphs = paragraphs.slice(1)

  if (contentParagraphs.length >= contentCount) {
    // More paragraphs than slides, distribute evenly
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
    // Fewer paragraphs than slides, use all paragraphs + fill remaining
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
          body: 'Adicione seu conte\u00fado aqui...',
          quote: '',
          emoji: SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)],
        })
      }
    }
  }

  // CTA slide
  slides.push({
    id: generateId(),
    title: 'Gostou do conte\u00fado?',
    body: 'Salve este post e compartilhe!',
    quote: '',
    emoji: '\ud83d\udc49',
  })

  return slides
}

function generateFromTopic(topic: string, totalSlides: number): Slide[] {
  const slides: Slide[] = []
  const templates = TOPIC_TEMPLATES.default

  // Cover
  slides.push({
    id: generateId(),
    title: topic || 'T\u00edtulo do Carrossel',
    body: 'Deslize para saber mais \u2192',
    quote: '',
    emoji: '\u2728',
  })

  // Content slides
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

  // CTA
  slides.push({
    id: generateId(),
    title: 'Gostou do conte\u00fado?',
    body: 'Salve este post e compartilhe!',
    quote: '',
    emoji: '\ud83d\udc49',
  })

  return slides
}
