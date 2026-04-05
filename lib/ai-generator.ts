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

function makeSlide(title: string, body: string, align: 'left' | 'center' = 'left'): Slide {
  return {
    id: generateId(), title, body, quote: '', emoji: '',
    image: null, imageOpacity: 0.5, imageOverlayColor: '#000000',
    textColor: null, textSecondaryColor: null,
    textPosition: 'center', textAlign: align,
    overlayImages: [],
    titleSize: 0, bodySize: 0,
    paddingX: 80, paddingY: 80,
    textOffsetY: 0, textMaxWidth: 100, showLogo: true, showSlideNumber: true,
  }
}

function detectFieldName(line: string): { field: string; value: string } | null {
  const lower = line.toLowerCase().trim()
  const fields = [
    { keys: ['título:', 'titulo:'], field: 'titulo' },
    { keys: ['subtítulo:', 'subtitulo:'], field: 'subtitulo' },
    { keys: ['corpo:'], field: 'corpo' },
    { keys: ['rodapé:', 'rodape:'], field: 'rodape' },
    { keys: ['assinatura:'], field: 'assinatura' },
  ]
  for (const f of fields) {
    for (const key of f.keys) {
      if (lower.startsWith(key)) {
        const value = line.substring(line.indexOf(':') + 1).trim()
        return { field: f.field, value }
      }
    }
  }
  return null
}

function parseStructuredScript(script: string): Slide[] {
  const slides: Slide[] = []
  const firstSlideIdx = script.search(/SLIDE\s*\d+/i)
  const cleanScript = firstSlideIdx >= 0 ? script.substring(firstSlideIdx) : script
  const blocks = cleanScript.split(/(?=SLIDE\s*\d+)/i).filter(b => b.trim().length > 0)

  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim().length > 0)
    if (lines.length === 0) continue
    const header = lines[0].trim()
    const headerMatch = header.match(/SLIDE\s*(\d+)\s*(?:\(([^)]+)\))?/i)
    if (!headerMatch) continue

    const slideNum = parseInt(headerMatch[1])
    const label = (headerMatch[2] || '').toLowerCase()
    const isCover = label.includes('capa') || slideNum === 1
    const isCTA = label.includes('cta') || label.includes('final')

    const fieldData: Record<string, string[]> = {}
    let currentField = ''
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === '---' || line === '') continue
      const detected = detectFieldName(line)
      if (detected) {
        currentField = detected.field
        if (!fieldData[currentField]) fieldData[currentField] = []
        if (detected.value) fieldData[currentField].push(detected.value)
      } else if (currentField) {
        if (!fieldData[currentField]) fieldData[currentField] = []
        fieldData[currentField].push(line)
      }
    }

    const titulo = (fieldData['titulo'] || []).join('\n')
    const subtitulo = (fieldData['subtitulo'] || []).join('\n')
    const corpo = (fieldData['corpo'] || []).join('\n')
    const rodape = (fieldData['rodape'] || fieldData['assinatura'] || []).join('\n')

    let finalBody = ''
    if (isCover) {
      finalBody = subtitulo || corpo
      if (rodape) finalBody += (finalBody ? '\n\n' : '') + rodape
    } else {
      finalBody = corpo
      if (subtitulo && !corpo) finalBody = subtitulo
      if (rodape) finalBody += (finalBody ? '\n\n' : '') + rodape
    }

    const align = (isCover || isCTA) ? 'center' : 'left'
    slides.push(makeSlide(titulo || `Slide ${slideNum}`, finalBody, align as 'left' | 'center'))
  }
  return slides
}

function parseSimpleScript(script: string, totalSlides: number): Slide[] {
  const paragraphs = script.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0 && !p.match(/^(Pilar|Objetivo|Framework|Slides|Produto|---)/i))
  const slides: Slide[] = []
  if (paragraphs.length === 0) return generateFromTopic('Meu Carrossel', totalSlides)
  const coverLines = paragraphs[0].split('\n').filter(l => l.trim())
  slides.push(makeSlide(coverLines[0] || 'Título', coverLines.slice(1).join('\n') || '', 'center'))
  const contentCount = totalSlides - 2
  const rest = paragraphs.slice(1)
  for (let i = 0; i < contentCount; i++) {
    if (i < rest.length) {
      const lines = rest[i].split('\n').filter(l => l.trim())
      slides.push(makeSlide(lines[0] || `Ponto ${i + 1}`, lines.slice(1).join('\n') || rest[i]))
    } else {
      slides.push(makeSlide(`Ponto ${i + 1}`, 'Adicione seu conteúdo aqui...'))
    }
  }
  slides.push(makeSlide('Gostou do conteúdo?', 'Salve este post e compartilhe!', 'center'))
  return slides
}

const TOPIC_TITLES = ['Você sabia disso?', 'O ponto principal', 'Na prática...', 'O segredo é...', 'Dica extra', 'Resumindo', 'A verdade é que...', 'O erro mais comum', 'Como aplicar', 'Resultado final']

function generateFromTopic(topic: string, totalSlides: number): Slide[] {
  const slides: Slide[] = []
  slides.push(makeSlide(topic || 'Título do Carrossel', '', 'center'))
  const contentCount = totalSlides - 2
  for (let i = 0; i < contentCount; i++) {
    slides.push(makeSlide(TOPIC_TITLES[i % TOPIC_TITLES.length], `Desenvolva o ponto ${i + 1} sobre "${topic}" aqui...`))
  }
  slides.push(makeSlide('Gostou do conteúdo?', 'Salve este post e compartilhe!', 'center'))
  return slides
}

export function generateCarouselSlides(options: GenerateOptions): Slide[] {
  const { mode, input, slideCount, isSingleAd } = options
  if (isSingleAd) return [makeSlide(input, '', 'center')]
  if (mode === 'script') {
    if (/SLIDE\s*\d+/i.test(input)) {
      const slides = parseStructuredScript(input)
      if (slides.length >= 2) return slides
    }
    return parseSimpleScript(input, Math.max(3, Math.min(15, slideCount)))
  }
  return generateFromTopic(input, Math.max(3, Math.min(15, slideCount)))
}

export function generateMasterImagePrompt(slides: Slide[], topic: string): string {
  const desc = slides.map((s, i) => {
    if (i === 0) return `Slide ${i + 1} (CAPA): "${s.title}"`
    if (i === slides.length - 1) return `Slide ${i + 1} (CTA): "${s.title}"`
    return `Slide ${i + 1}: "${s.title}" - ${s.body ? s.body.substring(0, 60) : ''}`
  }).join('\n')
  return `Crie ${slides.length} imagens para carrossel Instagram sobre "${topic}".\nEstilo: Profissional, moderno, clean para texto sobreposto.\nFormato: 1080x1080px.\n\n${desc}\n\nPaleta: Tons escuros, overlay 40-60%.`
}
