import { CarouselState, SavedCarousel } from './types'

const STORAGE_KEY = 'carousel-studio-drafts'

export function saveDraft(state: CarouselState): void {
  const drafts = getDrafts()
  const existing = drafts.findIndex(d => d.id === state.id)
  const saved: SavedCarousel = {
    id: state.id,
    name: state.name,
    updatedAt: new Date().toISOString(),
    state: {
      ...state,
      // Strip large base64 images to avoid localStorage quota
      slides: state.slides.map(s => ({
        ...s,
        image: s.image && s.image.length > 50000 ? null : s.image,
      })),
      background: {
        ...state.background,
        image: state.background.image && state.background.image.length > 50000 ? null : state.background.image,
      },
      logo: state.logo && state.logo.length > 50000 ? null : state.logo,
      profileImage: state.profileImage && state.profileImage.length > 50000 ? null : state.profileImage,
    },
  }

  if (existing >= 0) {
    drafts[existing] = saved
  } else {
    drafts.unshift(saved)
  }

  const trimmed = drafts.slice(0, 20)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (e) {
    // If still too large, strip ALL images
    const lighter = trimmed.map(d => ({
      ...d,
      state: {
        ...d.state,
        slides: d.state.slides.map(s => ({ ...s, image: null })),
        background: { ...d.state.background, image: null },
        logo: null,
        profileImage: null,
      }
    }))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lighter))
    } catch {
      // Last resort: keep only 5 most recent
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lighter.slice(0, 5)))
    }
  }
}

export function getDrafts(): SavedCarousel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter(d => d.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch {
    // ignore
  }
}

export function loadDraft(id: string): CarouselState | null {
  const draft = getDrafts().find(d => d.id === id)
  return draft?.state || null
}
