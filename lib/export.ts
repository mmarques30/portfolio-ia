import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

async function captureElement(element: HTMLElement): Promise<string> {
  // Multiple attempts to ensure images are loaded
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const dataUrl = await toPng(element, {
        width: element.offsetWidth,
        height: element.offsetHeight,
        pixelRatio: 2,
        cacheBust: true,
        skipAutoScale: true,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
        },
        filter: () => true,
      })
      // Check if the image is not blank (more than just a few bytes)
      if (dataUrl && dataUrl.length > 1000) {
        return dataUrl
      }
    } catch (err) {
      console.warn(`Export attempt ${attempt + 1} failed:`, err)
    }
    // Wait before retry
    await new Promise(r => setTimeout(r, 500))
  }
  // Final attempt without retry
  return toPng(element, {
    width: element.offsetWidth,
    height: element.offsetHeight,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: 'none',
      transformOrigin: 'top left',
    },
  })
}

export async function exportSlideAsPng(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await captureElement(element)
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

export async function exportCarouselAsZip(
  elements: HTMLElement[],
  carouselName: string
): Promise<void> {
  const zip = new JSZip()

  for (let i = 0; i < elements.length; i++) {
    const dataUrl = await captureElement(elements[i])
    const data = dataUrl.split(',')[1]
    const filename = `slide-${String(i + 1).padStart(2, '0')}.png`
    zip.file(filename, data, { base64: true })
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const safeName = carouselName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase()
  saveAs(blob, `${safeName}.zip`)
}
