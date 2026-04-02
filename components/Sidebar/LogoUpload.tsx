"use client"

import React, { useRef } from 'react'
import { useCarousel } from '@/lib/carousel-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'

export default function LogoUpload() {
  const { state, dispatch } = useCarousel()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'profile') {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (type === 'logo') {
        dispatch({ type: 'SET_LOGO', payload: result })
      } else {
        dispatch({ type: 'SET_PROFILE_IMAGE', payload: result })
      }
    }
    reader.onerror = () => {
      alert('Erro ao carregar imagem. Tente novamente.')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Logo / Watermark</Label>
        {state.logo ? (
          <div className="flex items-center gap-2">
            <img src={state.logo} alt="Logo" className="h-8 w-auto rounded" style={{ maxWidth: '120px' }} />
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_LOGO', payload: null })}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => logoInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Upload logo
          </Button>
        )}
        <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={e => handleFile(e, 'logo')} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Foto de perfil (CTA)</Label>
        {state.profileImage ? (
          <div className="flex items-center gap-2">
            <img
              src={state.profileImage}
              alt="Perfil"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_PROFILE_IMAGE', payload: null })}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => profileInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Upload foto de perfil
          </Button>
        )}
        <input ref={profileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => handleFile(e, 'profile')} />
      </div>
    </div>
  )
}
