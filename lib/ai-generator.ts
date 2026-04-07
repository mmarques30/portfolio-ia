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

function makeSlide(title: string, body: string, align: 'left' | 'center' = 'left', quote: string = ''): Slide {
  return {
    id: generateId(), title, body, quote, emoji: '',
    image: null, imageOpacity: 0.5, imageOverlayColor: '#000000',
    textColor: null, textSecondaryColor: null,
    textPosition: 'center', textAlign: align,
    overlayImages: [],
    titleSize: 32, bodySize: 18,
    paddingX: 80, paddingY: 80,
    textOffsetY: 0, textMaxWidth: 100, showLogo: true, showSlideNumber: true,
  }
}

function normalizeKey(s: string): string {
  return s.toLowerCase()
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .trim()
}

function detectFieldName(line: string): { field: string; value: string } | null {
  const trimmed = line.trim()
  // Find first colon
  const colonIdx = trimmed.indexOf(':')
  if (colonIdx === -1) return null
  const keyRaw = trimmed.substring(0, colonIdx).trim()
  const value = trimmed.substring(colonIdx + 1).trim()
  const key = normalizeKey(keyRaw)

  // Strip parenthetical notes like "DESTAQUE (APLICAÇÃO PRÁTICA)"
  const cleanKey = key.replace(/\s*\([^)]*\)\s*/g, '').trim()

  // Map various field names to internal names
  const fieldMap: Record<string, string> = {
    'titulo': 'titulo',
    'title': 'titulo',
    'texto principal': 'titulo',
    'texto': 'titulo',
    'subtitulo': 'subtitulo',
    'subtitle': 'subtitulo',
    'texto secundario': 'subtitulo',
    'corpo': 'corpo',
    'body': 'corpo',
    'conteudo': 'corpo',
    'destaque': 'quote',
    'citacao': 'quote',
    'quote': 'quote',
    'rodape': 'rodape',
    'rodape destaque': 'rodape',
    'footer': 'rodape',
    'cta': 'cta',
    'call to action': 'cta',
    'assinatura': 'assinatura',
    'signature': 'assinatura',
  }

  const mapped = fieldMap[cleanKey]
  if (mapped) return { field: mapped, value }
  return null
}

function parseStructuredScript(script: string): Slide[] {
  const slides: Slide[] = []

  // Find first SLIDE marker
  const firstSlideIdx = script.search(/SLIDE\s*\d+/i)
  const cleanScript = firstSlideIdx >= 0 ? script.substring(firstSlideIdx) : script

  // Split by SLIDE markers
  const blocks = cleanScript.split(/(?=SLIDE\s*\d+)/i).filter(b => b.trim().length > 0)

  for (const block of blocks) {
    // Remove separator lines (=, -, _, *, ═, —)
    const lines = block
      .split('\n')
      .filter(l => {
        const t = l.trim()
        if (!t) return false
        // Skip lines that are only separator characters
        if (/^[=\-_*═—]+$/.test(t)) return false
        return true
      })

    if (lines.length === 0) continue

    // Parse SLIDE header - supports: "SLIDE 1", "SLIDE 1 (CAPA)", "SLIDE 1 — CAPA", "SLIDE 1 - CAPA"
    const header = lines[0].trim()
    const headerMatch = header.match(/SLIDE\s*(\d+)\s*(?:[—\-:(]\s*([^)]+?)\)?)?\s*$/i)
    if (!headerMatch) continue

    const slideNum = parseInt(headerMatch[1])
    const labelRaw = (headerMatch[2] || '').toLowerCase()
    const label = normalizeKey(labelRaw)
    const isCover = label.includes('capa') || slideNum === 1
    const isCTA = label.includes('cta') || label.includes('final') || label.includes('proximo passo')

    // Parse fields
    const fieldData: Record<string, string[]> = {}
    let currentField = ''

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      const detected = detectFieldName(trimmedLine)
      if (detected) {
        currentField = detected.field
        if (!fieldData[currentField]) fieldData[currentField] = []
        if (detected.value) fieldData[currentField].push(detected.value)
      } else if (currentField) {
        if (!fieldData[currentField]) fieldData[currentField] = []
        fieldData[currentField].push(trimmedLine)
      }
    }

    const titulo = (fieldData['titulo'] || []).join('\n')
    const subtitulo = (fieldData['subtitulo'] || []).join('\n')
    const corpo = (fieldData['corpo'] || []).join('\n')
    const quote = (fieldData['quote'] || []).join('\n')
    const rodape = (fieldData['rodape'] || []).join('\n')
    const cta = (fieldData['cta'] || []).join('\n')
    const assinatura = (fieldData['assinatura'] || []).join('\n')

    // Build the slide based on type
    let finalTitle = titulo
    let finalBody = ''

    if (isCover) {
      // Cover: title is the main text, body is subtitle
      finalTitle = titulo
      finalBody = subtitulo
      if (corpo && !subtitulo) finalBody = corpo
      if (rodape) finalBody += (finalBody ? '\n\n' : '') + rodape
    } else if (isCTA) {
      // CTA: title + cta + signature
      finalTitle = titulo || cta
      finalBody = subtitulo || corpo || cta
      if (cta && finalBody !== cta) finalBody += (finalBody ? '\n\n' : '') + cta
      if (assinatura) finalBody += (finalBody ? '\n\n' : '') + assinatura
      if (rodape) finalBody += (finalBody ? '\n\n' : '') + rodape
    } else {
      // Content slide
      finalTitle = titulo
      finalBody = corpo
      if (subtitulo && !corpo) finalBody = subtitulo
      if (rodape) finalBody += (finalBody ? '\n\n' : '') + rodape
    }

    if (!finalTitle && !finalBody) continue

    const align = (isCover || isCTA) ? 'center' : 'left'
    slides.push(makeSlide(finalTitle || `Slide ${slideNum}`, finalBody, align as 'left' | 'center', quote))
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
