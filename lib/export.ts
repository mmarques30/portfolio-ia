import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')
  const promises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
      // Timeout after 3s
      setTimeout(resolve, 3000)
    })
  })
  await Promise.all(promises)
}

async function captureElement(element: HTMLElement): Promise<string> {
  // Wait for all images to load
  await waitForImages(element)
  // Small delay for rendering
  await new Promise(r => setTimeout(r, 200))

  const options = {
    width: element.scrollWidth || element.offsetWidth,
    height: element.scrollHeight || element.offsetHeight,
    pixelRatio: 2,
    cacheBust: true,
    skipAutoScale: true,
    style: {
      transform: 'none',
      transformOrigin: 'top left',
    },
    filter: (node: HTMLElement) => {
      // Include all nodes
      return true
    },
  }

  // Try multiple times - html-to-image can be flaky
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const dataUrl = await toPng(element, options)
      if (dataUrl && dataUrl.length > 500) {
        return dataUrl
      }
    } catch (err) {
      console.warn(`Export attempt ${attempt + 1} failed:`, err)
      await new Promise(r => setTimeout(r, 300))
    }
  }

  // Final attempt
  return toPng(element, options)
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
