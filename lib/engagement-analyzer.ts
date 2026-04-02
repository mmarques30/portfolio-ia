import { CarouselState, EngagementScore } from './types'

export function analyzeEngagement(state: CarouselState): EngagementScore {
  const details: EngagementScore['details'] = []

  // 1. Slide count (ideal 5-8)
  const slideCount = state.slides.length
  let slideScore = 0
  if (slideCount >= 5 && slideCount <= 8) slideScore = 20
  else if (slideCount >= 3 && slideCount <= 10) slideScore = 15
  else if (slideCount >= 2) slideScore = 8
  else slideScore = 3
  details.push({
    label: 'Quantidade de slides',
    score: slideScore,
    max: 20,
    tip: slideCount < 5 ? 'Adicione mais slides (ideal: 5-8)' : slideCount > 8 ? 'Reduza para 5-8 slides para manter atenção' : 'Ótima quantidade!',
  })

  // 2. Cover hook quality
  const cover = state.slides[0]
  let hookScore = 0
  if (cover) {
    const titleWords = cover.title.trim().split(/\s+/).length
    if (titleWords >= 3 && titleWords <= 10) hookScore += 8
    else if (titleWords >= 2) hookScore += 4
    if (cover.emoji) hookScore += 4
    if (cover.body && cover.body.length > 5) hookScore += 3
    if (cover.title.includes('?') || cover.title.includes('!')) hookScore += 3
    if (/\d/.test(cover.title)) hookScore += 2
  }
  hookScore = Math.min(hookScore, 20)
  details.push({
    label: 'Gancho da capa',
    score: hookScore,
    max: 20,
    tip: hookScore < 12 ? 'Use números, perguntas ou emojis no título da capa' : 'Bom gancho inicial!',
  })

  // 3. Content quality (body text present, varied)
  const contentSlides = state.slides.slice(1, -1)
  let contentScore = 0
  if (contentSlides.length > 0) {
    const filledSlides = contentSlides.filter(s => s.body && s.body.length > 15)
    const withEmojis = contentSlides.filter(s => s.emoji)
    const ratio = filledSlides.length / contentSlides.length
    contentScore = Math.round(ratio * 12)
    if (withEmojis.length >= contentSlides.length * 0.5) contentScore += 4
    const avgBodyLen = contentSlides.reduce((sum, s) => sum + (s.body?.length || 0), 0) / contentSlides.length
    if (avgBodyLen >= 30 && avgBodyLen <= 150) contentScore += 4
    else if (avgBodyLen > 150) contentScore += 1
  }
  contentScore = Math.min(contentScore, 20)
  details.push({
    label: 'Qualidade do conteúdo',
    score: contentScore,
    max: 20,
    tip: contentScore < 12 ? 'Preencha todos os slides com texto de 30-150 caracteres' : 'Conteúdo bem estruturado!',
  })

  // 4. CTA quality
  const cta = state.slides[state.slides.length - 1]
  let ctaScore = 0
  if (cta) {
    if (cta.title && cta.title.length > 3) ctaScore += 5
    if (state.ctaHandle && state.ctaHandle.length > 1) ctaScore += 5
    if (state.ctaText && state.ctaText.length > 5) ctaScore += 3
    if (cta.emoji) ctaScore += 2
    if (state.profileImage) ctaScore += 5
  }
  ctaScore = Math.min(ctaScore, 20)
  details.push({
    label: 'Call to Action',
    score: ctaScore,
    max: 20,
    tip: ctaScore < 12 ? 'Adicione foto de perfil, arroba e texto de CTA claro' : 'CTA convincente!',
  })

  // 5. Visual polish
  let visualScore = 0
  if (state.logo) visualScore += 4
  if (state.background.type !== 'solid') visualScore += 4
  const hasImages = state.slides.some(s => s.image) || state.background.image
  if (hasImages) visualScore += 6
  if (state.fonts.heading !== state.fonts.body) visualScore += 3
  visualScore += 3 // base for using the tool
  visualScore = Math.min(visualScore, 20)
  details.push({
    label: 'Visual e acabamento',
    score: visualScore,
    max: 20,
    tip: visualScore < 12 ? 'Adicione logo, imagens de fundo e varie as fontes' : 'Visual caprichado!',
  })

  const total = details.reduce((sum, d) => sum + d.score, 0)

  return { total, details }
}

export function getEngagementLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excelente', color: '#22c55e' }
  if (score >= 70) return { label: 'Muito bom', color: '#84cc16' }
  if (score >= 50) return { label: 'Bom', color: '#eab308' }
  if (score >= 30) return { label: 'Regular', color: '#f97316' }
  return { label: 'Precisa melhorar', color: '#ef4444' }
}
