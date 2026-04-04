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

function makeSlide(title: string, body: string, emoji: string, isCover = false): Slide {
  return {
    id: generateId(), title, body, quote: '', emoji,
    image: null, imageOpacity: 0.5, imageOverlayColor: '#000000',
    textColor: null, textSecondaryColor: null,
    textPosition: 'center', textAlign: isCover ? 'center' : 'left',
    overlayImages: [],
  }
}

// Detect if script has structured SLIDE markers
function hasSlideMarkers(text: string): boolean {
  return /SLIDE\s*\d+/i.test(text)
}

// Parse structured script with SLIDE 1, SLIDE 2 markers
function parseStructuredScript(script: string): Slide[] {
  const slides: Slide[] = []

  // Split by SLIDE N markers
  const slideBlocks = script.split(/(?=SLIDE\s*\d+)/i).filter(b => b.trim().length > 0)

  for (const block of slideBlocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (lines.length === 0) continue

    // Check if this block starts with a SLIDE marker
    const headerMatch = lines[0].match(/SLIDE\s*(\d+)\s*(?:\(([^)]+)\))?\s*:?/i)
    if (!headerMatch) continue

    const slideNum = parseInt(headerMatch[1])
    const slideLabel = (headerMatch[2] || '').toLowerCase()
    const isCover = slideLabel.includes('capa') || slideNum === 1
    const isCTA = slideLabel.includes('cta') || slideLabel.includes('final')

    let title = ''
    let subtitle = ''
    let body = ''
    let footer = ''
    let emoji = ''

    // Parse fields from remaining lines
    const contentLines = lines.slice(1)
    let currentField = ''
    const fields: Record<string, string[]> = {}

    for (const line of contentLines) {
      // Check for field markers
      const fieldMatch = line.match(/^(T[i\u00ed]tulo|Subt[i\u00ed]tulo|Corpo|Rodap[e\u00e9]|Assinatura|Emoji)\s*:\s*(.*)/i)
      if (fieldMatch) {
        currentField = fieldMatch[1].toLowerCase()
          .replace(/\u00ed/g, 'i')
          .replace(/\u00e9/g, 'e')
        const value = fieldMatch[2].trim()
        if (!fields[currentField]) fields[currentField] = []
        if (value) fields[currentField].push(value)
      } else if (currentField && !line.match(/^---/)) {
        if (!fields[currentField]) fields[currentField] = []
        fields[currentField].push(line)
      }
    }

    // Extract values
    title = (fields['titulo'] || []).join('\n')
    subtitle = (fields['subtitulo'] || []).join('\n')
    body = (fields['corpo'] || []).join('\n')
    footer = (fields['rodape'] || fields['assinatura'] || []).join('\n')
    emoji = (fields['emoji'] || []).join('')

    // Auto-assign emoji based on content
    if (!emoji) {
      if (isCover) emoji = '\u2728'
      else if (isCTA) emoji = '\ud83d\udc49'
      else if (/\d+\./.test(title) || /^\d/.test(title)) {
        const num = parseInt(title.match(/\d+/)?.[0] || '0')
        const numEmojis = ['', '1\ufe0f\u20e3', '2\ufe0f\u20e3', '3\ufe0f\u20e3', '4\ufe0f\u20e3', '5\ufe0f\u20e3', '6\ufe0f\u20e3', '7\ufe0f\u20e3', '8\ufe0f\u20e3', '9\ufe0f\u20e3', '\ud83d\udd1f']
        emoji = numEmojis[num] || '\ud83d\udccc'
      } else if (/dado|estat|n\u00famero|%/i.test(title + body)) emoji = '\ud83d\udcca'
      else emoji = '\ud83d\udccc'
    }

    // Build the slide body from available fields
    let fullBody = ''
    if (isCover) {
      fullBody = subtitle || body
      if (footer) fullBody += (fullBody ? '\n\n' : '') + footer
    } else if (isCTA) {
      fullBody = body || subtitle
      if (footer) fullBody += (fullBody ? '\n\n' : '') + footer
    } else {
      fullBody = body
    }

    const slide = makeSlide(
      title || `Slide ${slideNum}`,
      fullBody,
      emoji,
      isCover || isCTA
    )

    // Set text alignment based on slide type
    if (isCover || isCTA) {
      slide.textAlign = 'center'
      slide.textPosition = isCover ? 'center' : 'center'
    }

    slides.push(slide)
  }

  return slides
}

// Simple paragraph-based parsing
function parseSimpleScript(script: string, totalSlides: number): Slide[] {
  const paragraphs = script
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.match(/^(Pilar|Objetivo|Framework|Slides|Produto|---)/i))

  const slides: Slide[] = []
  if (paragraphs.length === 0) return generateFromTopic('Meu Carrossel', totalSlides)

  // First paragraph = cover
  const coverLines = paragraphs[0].split('\n').map(l => l.trim()).filter(l => l)
  const coverTitle = coverLines[0] || 'T\u00edtulo do Carrossel'
  const coverBody = coverLines.slice(1).join('\n') || 'Deslize para saber mais \u2192'
  slides.push(makeSlide(coverTitle, coverBody, '\u2728', true))

  const EMOJIS = ['\u2728', '1\ufe0f\u20e3', '2\ufe0f\u20e3', '3\ufe0f\u20e3', '4\ufe0f\u20e3', '5\ufe0f\u20e3', '6\ufe0f\u20e3', '7\ufe0f\u20e3', '8\ufe0f\u20e3', '9\ufe0f\u20e3', '\ud83d\udd1f']
  const contentCount = totalSlides - 2
  const contentParagraphs = paragraphs.slice(1)

  for (let i = 0; i < contentCount; i++) {
    if (i < contentParagraphs.length) {
      const lines = contentParagraphs[i].split('\n').map(l => l.trim()).filter(l => l)
      const title = lines[0] || `Ponto ${i + 1}`
      const body = lines.slice(1).join('\n') || contentParagraphs[i]
      slides.push(makeSlide(title, body, EMOJIS[Math.min(i + 1, EMOJIS.length - 1)]))
    } else {
      slides.push(makeSlide(`Ponto ${i + 1}`, 'Adicione seu conte\u00fado aqui...', EMOJIS[Math.min(i + 1, EMOJIS.length - 1)]))
    }
  }

  slides.push(makeSlide('Gostou do conte\u00fado?', 'Salve este post e compartilhe!', '\ud83d\udc49', true))
  return slides
}

const TOPIC_TITLES = [
  'Voc\u00ea sabia disso?', 'O ponto principal', 'Na pr\u00e1tica...', 'O segredo \u00e9...',
  'Dica extra', 'Resumindo', 'A verdade \u00e9 que...', 'O erro mais comum',
  'Como aplicar', 'Resultado final',
]

function generateFromTopic(topic: string, totalSlides: number): Slide[] {
  const EMOJIS = ['\u2728', '1\ufe0f\u20e3', '2\ufe0f\u20e3', '3\ufe0f\u20e3', '4\ufe0f\u20e3', '5\ufe0f\u20e3', '6\ufe0f\u20e3', '7\ufe0f\u20e3', '8\ufe0f\u20e3', '9\ufe0f\u20e3', '\ud83d\udd1f']
  const slides: Slide[] = []
  slides.push(makeSlide(topic || 'T\u00edtulo do Carrossel', 'Deslize para saber mais \u2192', '\u2728', true))
  const contentCount = totalSlides - 2
  for (let i = 0; i < contentCount; i++) {
    slides.push(makeSlide(TOPIC_TITLES[i % TOPIC_TITLES.length], `Desenvolva o ponto ${i + 1} sobre "${topic}" aqui...`, EMOJIS[Math.min(i + 1, EMOJIS.length - 1)]))
  }
  slides.push(makeSlide('Gostou do conte\u00fado?', 'Salve este post e compartilhe!', '\ud83d\udc49', true))
  return slides
}

export function generateCarouselSlides(options: GenerateOptions): Slide[] {
  const { mode, input, slideCount, isSingleAd } = options
  if (isSingleAd) return [makeSlide(input, '', '\u2728', true)]

  if (mode === 'script') {
    // Auto-detect structured format
    if (hasSlideMarkers(input)) {
      const slides = parseStructuredScript(input)
      if (slides.length >= 2) return slides
    }
    // Fallback to simple parsing
    return parseSimpleScript(input, Math.max(3, Math.min(15, slideCount)))
  }

  return generateFromTopic(input, Math.max(3, Math.min(15, slideCount)))
}

export function generateMasterImagePrompt(slides: Slide[], topic: string): string {
  const slideDescriptions = slides.map((slide, i) => {
    const isFirst = i === 0
    const isLast = i === slides.length - 1
    if (isFirst) return `Slide ${i + 1} (CAPA): "${slide.title}" - Imagem impactante que represente o tema principal.`
    if (isLast) return `Slide ${i + 1} (CTA): "${slide.title}" - Fundo clean para destaque do call-to-action.`
    return `Slide ${i + 1}: "${slide.title}" - ${slide.body ? slide.body.substring(0, 80) : 'Conte\u00fado informativo'}.`
  }).join('\n')
  return `Crie ${slides.length} imagens para um carrossel de Instagram sobre "${topic}".\n\nEstilo: Profissional, moderno, clean. Boas para sobreposi\u00e7\u00e3o de texto branco.\nFormato: 1080x1080px cada.\nImportante: Imagens sutis para n\u00e3o competir com texto sobreposto.\n\nDescri\u00e7\u00e3o:\n${slideDescriptions}\n\nPaleta: Tons escuros com contraste, overlay 40-60%.`
}
