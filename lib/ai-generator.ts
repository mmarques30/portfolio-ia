import { Slide } from './types'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

interface GenerateOptions {
  mode: 'topic' | 'script'
  input: string
  slideCount: number
  isSingleAd?: boolean
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
    return { title: words.slice(0, mid).join(' '), body: words.slice(mid).join(' ') }
  }
  let title = lines[0].replace(/^[#\-\*\u2022\d\.\)]+\s*/, '')
  if (title.length > 80) title = title.substring(0, 77) + '...'
  return { title, body: lines.slice(1).join('\n') }
}

const TOPIC_TITLES = [
  'Você sabia disso?', 'O ponto principal', 'Na prática...', 'O segredo é...',
  'Dica extra', 'Resumindo', 'A verdade é que...', 'O erro mais comum',
  'Como aplicar', 'Resultado final',
]

const SLIDE_EMOJIS = ['✨', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

function makeSlide(title: string, body: string, emoji: string, isCover = false): Slide {
  return {
    id: generateId(), title, body, quote: '', emoji,
    image: null, imageOpacity: 0.5, imageOverlayColor: '#000000',
    textColor: null, textSecondaryColor: null,
    textPosition: 'center', textAlign: isCover ? 'center' : 'left',
    overlayImages: [],
  }
}

export function generateCarouselSlides(options: GenerateOptions): Slide[] {
  const { mode, input, slideCount, isSingleAd } = options
  if (isSingleAd) return [makeSlide(input, '', '✨', true)]
  const totalSlides = Math.max(3, Math.min(15, slideCount))
  if (mode === 'script') return generateFromScript(input, totalSlides)
  return generateFromTopic(input, totalSlides)
}

function generateFromScript(script: string, totalSlides: number): Slide[] {
  const paragraphs = splitIntoParagraphs(script)
  const slides: Slide[] = []
  if (paragraphs.length === 0) return generateFromTopic('Meu Carrossel', totalSlides)
  const cover = extractTitleAndBody(paragraphs[0])
  slides.push(makeSlide(cover.title || 'Título do Carrossel', cover.body || 'Deslize para saber mais →', '✨', true))
  const contentCount = totalSlides - 2
  const contentParagraphs = paragraphs.slice(1)
  for (let i = 0; i < contentCount; i++) {
    if (i < contentParagraphs.length) {
      const { title, body } = extractTitleAndBody(contentParagraphs[i])
      slides.push(makeSlide(title || `Ponto ${i + 1}`, body || contentParagraphs[i], SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)]))
    } else {
      slides.push(makeSlide(`Ponto ${i + 1}`, 'Adicione seu conteúdo aqui...', SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)]))
    }
  }
  slides.push(makeSlide('Gostou do conteúdo?', 'Salve este post e compartilhe!', '👉', true))
  return slides
}

function generateFromTopic(topic: string, totalSlides: number): Slide[] {
  const slides: Slide[] = []
  slides.push(makeSlide(topic || 'Título do Carrossel', 'Deslize para saber mais →', '✨', true))
  const contentCount = totalSlides - 2
  for (let i = 0; i < contentCount; i++) {
    slides.push(makeSlide(TOPIC_TITLES[i % TOPIC_TITLES.length], `Desenvolva o ponto ${i + 1} sobre "${topic}" aqui...`, SLIDE_EMOJIS[Math.min(i + 1, SLIDE_EMOJIS.length - 1)]))
  }
  slides.push(makeSlide('Gostou do conteúdo?', 'Salve este post e compartilhe!', '👉', true))
  return slides
}

export function generateMasterImagePrompt(slides: Slide[], topic: string): string {
  const slideDescriptions = slides.map((slide, i) => {
    const isFirst = i === 0
    const isLast = i === slides.length - 1
    if (isFirst) return `Slide ${i + 1} (CAPA): "${slide.title}" - Imagem impactante que represente o tema principal.`
    if (isLast) return `Slide ${i + 1} (CTA): "${slide.title}" - Fundo clean para destaque do call-to-action.`
    return `Slide ${i + 1}: "${slide.title}" - ${slide.body ? slide.body.substring(0, 80) : 'Conteúdo informativo'}.`
  }).join('\n')
  return `Crie ${slides.length} imagens para um carrossel de Instagram sobre "${topic}".\n\nEstilo: Profissional, moderno, clean. Boas para sobreposição de texto branco.\nFormato: 1080x1080px cada imagem.\nImportante: As imagens devem ser sutis o suficiente para não competir com o texto sobreposto.\n\nDescrição de cada slide:\n${slideDescriptions}\n\nPaleta sugerida: Tons escuros com contraste, ou imagens com overlay escuro (40-60% opacidade).`
}
