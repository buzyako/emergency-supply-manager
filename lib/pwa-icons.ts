// Simple icon generator for PWA icons
// This creates basic icons using canvas and data URLs

export function generatePWAIcon(size: number): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  canvas.width = size
  canvas.height = size
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#1e40af')
  gradient.addColorStop(1, '#3b82f6')
  
  // Draw background
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  // Draw shield icon
  ctx.fillStyle = 'white'
  ctx.font = `${size * 0.6}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🛡️', size / 2, size / 2)
  
  return canvas.toDataURL('image/png')
}

export function createIconElement(size: number): HTMLLinkElement {
  const link = document.createElement('link')
  link.rel = 'icon'
  link.sizes = `${size}x${size}`
  link.href = generatePWAIcon(size)
  return link
}

export function addPWAIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
  
  sizes.forEach(size => {
    const icon = createIconElement(size)
    document.head.appendChild(icon)
  })
}
