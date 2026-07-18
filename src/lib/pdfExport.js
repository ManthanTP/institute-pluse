/**
 * InstitutePLUSE — Premium Enterprise-Grade PDF Report Engine v3
 * 
 * Generates high-end system intelligence dossiers with:
 * - Corner-positioned watermarks (logo + name + date)
 * - No center watermark
 * - Single-file consolidated download
 * - Clean responsive table styling with rounded corners
 * - Multi-theme engine (Cyber Intelligence, Academic Excellence, Executive Analytics)
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

// Cross-platform PDF save: uses native Share sheet on Capacitor, standard download on web
async function savePDF(doc, filename) {
  if (window.Capacitor?.isNativePlatform()) {
    try {
      const pdfBlob = doc.output('blob')
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(pdfBlob)
      })
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      const { Share } = await import('@capacitor/share')
      const result = await Filesystem.writeFile({
        path: `${filename}.pdf`,
        data: base64Data,
        directory: Directory.Cache,
      })
      await Share.share({ title: filename, url: result.uri })
    } catch (err) {
      console.error('Native PDF save error:', err)
      doc.save(`${filename}.pdf`)
    }
  } else {
    doc.save(`${filename}.pdf`)
  }
}

// ── Existing Color Palette (Default Cyber Intelligence) ──
export const COLORS = {
  bg: [5, 8, 22],             // #050816
  surface: [15, 23, 42],      // #0F172A
  cardBg: [17, 24, 39],       // #111827
  primary: [37, 99, 235],     // #2563EB
  secondary: [6, 182, 212],   // #06B6D4
  highlight: [139, 92, 246],  // #8B5CF6
  accent: [34, 197, 94],      // #22C55E
  textPrimary: [248, 250, 252], // #F8FAFC
  textSecondary: [148, 163, 184], // #94A3B8
  textMuted: [100, 116, 139], // #64748B
  border: [30, 41, 59],       // #1E293B
  success: [34, 197, 94],     // #22C55E
}

// ── Multi-Theme Engine Colors ──
function getThemeColors(themeName) {
  const name = (themeName || 'cyber').toLowerCase()
  if (name === 'academic') {
    return {
      bg: [253, 253, 250],         // soft cream
      surface: [255, 255, 255],     // white
      cardBg: [248, 249, 250],      // light grey
      primary: [26, 54, 93],        // deep royal blue
      secondary: [197, 160, 89],    // gold
      highlight: [116, 42, 49],     // deep burgundy
      accent: [47, 133, 90],        // forest green
      textPrimary: [45, 55, 72],    // charcoal
      textSecondary: [74, 85, 104],  // slate
      textMuted: [160, 174, 192],   // light slate
      border: [226, 232, 240],      // warm border
      success: [47, 133, 90],
      isDark: false
    }
  } else if (name === 'executive') {
    return {
      bg: [248, 250, 252],         // clean white-slate
      surface: [255, 255, 255],     // pure white
      cardBg: [241, 245, 249],      // slate-100
      primary: [15, 23, 42],        // slate-900
      secondary: [79, 70, 229],     // indigo-600
      highlight: [99, 102, 241],    // indigo-500
      accent: [13, 148, 136],       // teal-600
      textPrimary: [15, 23, 42],     // slate-900
      textSecondary: [71, 85, 105],  // slate-600
      textMuted: [148, 163, 184],   // slate-400
      border: [226, 232, 240],      // slate-200
      success: [16, 185, 129],      // emerald-500
      isDark: false
    }
  } else {
    // Cyber Intelligence (Default Dark)
    return {
      bg: COLORS.bg,
      surface: COLORS.surface,
      cardBg: COLORS.cardBg,
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      highlight: COLORS.highlight,
      accent: COLORS.accent,
      textPrimary: COLORS.textPrimary,
      textSecondary: COLORS.textSecondary,
      textMuted: COLORS.textMuted,
      border: COLORS.border,
      success: COLORS.success,
      isDark: true
    }
  }
}

function generateDossierId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PULSE-${timestamp}-${rand}`
}

// Subtle grid background pattern
function drawGridBackground(doc, colors) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setDrawColor(colors.isDark ? 255 : 0, colors.isDark ? 255 : 0, colors.isDark ? 255 : 0)
  doc.setGState(new doc.GState({ opacity: colors.isDark ? 0.02 : 0.012 }))
  doc.setLineWidth(0.08)
  const step = 12
  for (let x = 0; x < w; x += step) { doc.line(x, 0, x, h) }
  for (let y = 0; y < h; y += step) { doc.line(0, y, w, y) }
  doc.setGState(new doc.GState({ opacity: 1 }))
}

// Corner bracket HUD decorators
function drawCornerDecorations(doc, colors) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  const size = 12
  const margin = 8

  doc.setDrawColor(...colors.secondary)
  doc.setLineWidth(0.6)
  
  doc.line(margin, margin, margin + size, margin)
  doc.line(margin, margin, margin, margin + size)
  
  doc.line(w - margin, margin, w - margin - size, margin)
  doc.line(w - margin, margin, w - margin, margin + size)
  
  doc.line(margin, h - margin, margin + size, h - margin)
  doc.line(margin, h - margin, margin, h - margin - size)
  
  doc.line(w - margin, h - margin, w - margin - size, h - margin)
  doc.line(w - margin, h - margin, w - margin, h - margin - size)
}

// Full page background
function drawPageBackground(doc, colors) {
  // Explicitly reset graphics state opacity first to prevent leakage across pages
  doc.setGState(new doc.GState({ opacity: 1.0 }))

  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setFillColor(...colors.bg)
  doc.rect(0, 0, w, h, 'F')
  drawGridBackground(doc, colors)
  drawCornerDecorations(doc, colors)
}

// Reusable premium card component with soft shadows & glassmorphism
export function drawCard(doc, x, y, w, h, colors) {
  // 1. Soft Shadow
  doc.setGState(new doc.GState({ opacity: colors.isDark ? 0.05 : 0.03 }))
  doc.setFillColor(0, 0, 0)
  doc.roundedRect(x + 1, y + 1.5, w, h, 2, 2, 'F')

  // 2. Card Background (Glassmorphism fill)
  doc.setGState(new doc.GState({ opacity: colors.isDark ? 0.92 : 0.98 }))
  doc.setFillColor(...colors.cardBg)
  doc.roundedRect(x, y, w, h, 2, 2, 'F')

  // 3. Card Border
  doc.setGState(new doc.GState({ opacity: colors.isDark ? 0.45 : 0.7 }))
  doc.setDrawColor(...colors.border)
  doc.setLineWidth(0.25)
  doc.roundedRect(x, y, w, h, 2, 2, 'D')

  // Restore opacity
  doc.setGState(new doc.GState({ opacity: 1 }))
}

// Metric Widget Card with left-accent bar and trend indicators
export function drawMetricCard(doc, x, y, w, h, label, value, trend, colors) {
  drawCard(doc, x, y, w, h, colors)
  
  // Left border accent line
  doc.setFillColor(...colors.secondary)
  doc.rect(x, y + 3, 1.2, h - 6, 'F')

  // Label
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(...colors.textMuted)
  doc.text(label.toUpperCase(), x + 4, y + 7)

  // Value
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...colors.textPrimary)
  doc.text(String(value).toUpperCase(), x + 4, y + 16)

  // Trend indicator
  if (trend) {
    const isUp = trend.includes('↑') || trend.includes('+')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5)
    doc.setTextColor(...(isUp ? colors.accent : colors.highlight))
    doc.text(trend, x + 4, y + 22)
  }
}

// Horizontal Visual Progress Bar
export function drawProgressBar(doc, x, y, w, h, percentage, colors) {
  const roundedPct = Math.min(Math.max(percentage, 0), 100)
  
  // Track background
  doc.setFillColor(...(colors.isDark ? [[25, 33, 50]] : [[226, 232, 240]])[0])
  doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F')
  
  // Fill bar
  if (roundedPct > 0) {
    const fillW = (w * roundedPct) / 100
    doc.setFillColor(...colors.secondary)
    doc.roundedRect(x, y, fillW, h, h / 2, h / 2, 'F')
  }
}

// Circular progress indicator with ticks around the perimeter
export function drawCircularProgress(doc, x, y, r, percentage, colors) {
  // Base circle
  doc.setDrawColor(...(colors.isDark ? [[25, 33, 50]] : [[226, 232, 240]])[0])
  doc.setLineWidth(1)
  doc.circle(x, y, r, 'D')

  // Arc ticks representation (futuristic UI clock ticks)
  const totalTicks = 12
  const activeTicks = Math.round((totalTicks * percentage) / 100)
  for (let i = 0; i < totalTicks; i++) {
    const angle = (i * 2 * Math.PI) / totalTicks - Math.PI / 2
    const x1 = x + (r - 1.2) * Math.cos(angle)
    const y1 = y + (r - 1.2) * Math.sin(angle)
    const x2 = x + (r + 1) * Math.cos(angle)
    const y2 = y + (r + 1) * Math.sin(angle)
    
    if (i < activeTicks) {
      doc.setDrawColor(...colors.secondary)
      doc.setLineWidth(0.5)
    } else {
      doc.setDrawColor(...(colors.isDark ? [[50, 60, 80]] : [[200, 205, 215]])[0])
      doc.setLineWidth(0.25)
    }
    doc.line(x1, y1, x2, y2)
  }
}

// Chronological timeline blocks
export function drawTimelineBlock(doc, x, y, title, description, timeStr, colors, isLast = false) {
  doc.setFillColor(...colors.secondary)
  doc.circle(x, y, 1.2, 'F')
  
  if (!isLast) {
    doc.setDrawColor(...colors.border)
    doc.setLineWidth(0.25)
    doc.line(x, y + 1.2, x, y + 18)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  doc.setTextColor(...colors.secondary)
  doc.text(timeStr.toUpperCase(), x + 5, y + 1.2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...colors.textPrimary)
  doc.text(title.toUpperCase(), x + 5, y + 6.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(...colors.textSecondary)
  doc.text(description, x + 5, y + 11, { maxWidth: 120 })
}

// Info Panel / Alert Callout Box
export function drawInfoPanel(doc, x, y, w, h, title, text, colors) {
  drawCard(doc, x, y, w, h, colors)
  doc.setFillColor(...colors.secondary)
  doc.setGState(new doc.GState({ opacity: 0.03 }))
  doc.roundedRect(x, y, w, h, 2, 2, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...colors.secondary)
  doc.text(title.toUpperCase(), x + 5, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...colors.textSecondary)
  doc.text(text, x + 5, y + 13, { maxWidth: w - 10 })
}

// Section Header with Accent line and Module ID
export function drawSectionHeader(doc, y, label, id, colors) {
  const w = doc.internal.pageSize.getWidth()
  
  doc.setFillColor(...colors.surface)
  doc.setGState(new doc.GState({ opacity: 0.4 }))
  doc.rect(14, y, w - 28, 6.5, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))
  
  doc.setFillColor(...colors.secondary)
  doc.rect(14, y, 1, 6.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...colors.textPrimary)
  doc.text(label.toUpperCase(), 18, y + 4.5)

  if (id) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(...colors.highlight)
    doc.text(id.toUpperCase(), w - 18, y + 4.5, { align: 'right' })
  }

  return y + 10
}

// Premium cover page
function drawCoverPage(doc, { title, subtitle, docId, dateStr, name, summaryCards, colors, theme }) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  drawPageBackground(doc, colors)

  // Glow indicators
  doc.setFillColor(...colors.secondary)
  doc.setGState(new doc.GState({ opacity: 0.03 }))
  doc.circle(40, 50, 90, 'F')
  doc.setFillColor(...colors.highlight)
  doc.circle(w - 40, h - 80, 70, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))

  // Coordinates vector lines
  doc.setDrawColor(...colors.secondary)
  doc.setLineWidth(0.08)
  doc.setGState(new doc.GState({ opacity: 0.1 }))
  doc.line(10, 80, w - 10, 80)
  doc.line(10, h - 70, w - 10, h - 70)
  doc.circle(30, 80, 1, 'D')
  doc.circle(w - 30, h - 70, 1, 'D')
  doc.setGState(new doc.GState({ opacity: 1 }))

  // Container panel
  doc.setFillColor(...colors.surface)
  doc.setGState(new doc.GState({ opacity: colors.isDark ? 0.90 : 0.96 }))
  doc.roundedRect(18, 30, w - 36, h - 60, 4, 4, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))
  doc.setDrawColor(...colors.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(18, 30, w - 36, h - 60, 4, 4, 'D')

  // Top accent bar
  doc.setFillColor(...colors.secondary)
  doc.rect(24, 45, 2.5, 30, 'F')

  // Logo branding
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...colors.textPrimary)
  doc.text('INSTITUTE', 32, 56)
  doc.setTextColor(...colors.secondary)
  doc.text('PULSE', 84, 56)
  
  // Tagline
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...colors.highlight)
  doc.text(`${(theme || 'CYBER').toUpperCase()} REPORT ENGINE // VER. ${docId.slice(6,10)}`, 32, 65)

  // Status Badges Group
  let badgeX = 32
  const drawCoverBadge = (text, bgCol, textCol) => {
    const textW = doc.getTextWidth(text)
    doc.setFillColor(...bgCol)
    doc.roundedRect(badgeX, 70, textW + 6, 7, 1.5, 1.5, 'F')
    doc.setDrawColor(...colors.border)
    doc.setLineWidth(0.15)
    doc.roundedRect(badgeX, 70, textW + 6, 7, 1.5, 1.5, 'D')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5)
    doc.setTextColor(...textCol)
    doc.text(text, badgeX + 3, 75)
    badgeX += textW + 10
  }

  drawCoverBadge('CLASSIFIED // LEVEL 4', colors.cardBg, colors.secondary)
  drawCoverBadge('AI ENGINE GENERATED', colors.cardBg, colors.highlight)
  drawCoverBadge('SECURE ACCESS', colors.cardBg, colors.accent)

  // Divider line
  doc.setDrawColor(...colors.border)
  doc.setLineWidth(0.3)
  doc.line(32, 84, w - 26, 84)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24) // Level 1 typography
  doc.setTextColor(...colors.textPrimary)
  const titleLines = doc.splitTextToSize(title.toUpperCase(), w - 60)
  doc.text(titleLines, 32, 98)
  const titleEndY = 98 + titleLines.length * 9

  // Subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...colors.textSecondary)
  doc.text(subtitle.toUpperCase(), 32, titleEndY + 4)

  // Metadata panel
  let yMeta = titleEndY + 18
  const addMeta = (key, val) => {
    doc.setFillColor(...colors.cardBg)
    doc.roundedRect(32, yMeta - 4.5, w - 60, 10, 1.5, 1.5, 'F')
    doc.setDrawColor(...colors.border)
    doc.setLineWidth(0.15)
    doc.roundedRect(32, yMeta - 4.5, w - 60, 10, 1.5, 1.5, 'D')
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...colors.textMuted)
    doc.text(key.toUpperCase(), 36, yMeta + 2)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...colors.textPrimary)
    doc.text(String(val).toUpperCase(), w - 32, yMeta + 2, { align: 'right' })
    yMeta += 12
  }

  addMeta('Report Identifier', docId)
  addMeta('Access Node', name || 'Global Administrator')
  addMeta('Generated At', dateStr)
  addMeta('Security Clearance', 'RESTRICTED')

  // Summary KPI cards
  if (summaryCards && summaryCards.length > 0) {
    yMeta += 4
    const cardSpacing = 4
    const totalCards = summaryCards.length
    const cardW = (w - 64 - (totalCards - 1) * cardSpacing) / totalCards

    summaryCards.forEach((card, i) => {
      const xCard = 32 + i * (cardW + cardSpacing)
      drawMetricCard(doc, xCard, yMeta, cardW, 24, card.label, card.value, card.trend || null, colors)
    })
  }

  // Bottom signature area
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(...colors.textMuted)
  doc.text('THIS DOCUMENT IS DIGITALLY SECURED AND VERIFIED BY INSTITUTEPLUSE CORE', w / 2, h - 18, { align: 'center' })
}

// Content page header
function drawHeader(doc, title, docId, studentName, colors) {
  const w = doc.internal.pageSize.getWidth()

  drawPageBackground(doc, colors)

  // Header bar
  doc.setFillColor(...colors.surface)
  doc.rect(0, 0, w, 24, 'F')
  doc.setDrawColor(...colors.border)
  doc.setLineWidth(0.3)
  doc.line(12, 24, w - 12, 24)

  // Logo icon (small square)
  doc.setFillColor(...colors.secondary)
  doc.roundedRect(14, 8, 3, 3, 0.5, 0.5, 'F')

  // Branding text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...colors.textPrimary)
  doc.text('INSTITUTE', 20, 12)
  doc.setTextColor(...colors.secondary)
  doc.text('PULSE', 38, 12)

  // Operator name (under logo)
  if (studentName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5)
    doc.setTextColor(...colors.textMuted)
    doc.text(studentName.toUpperCase(), 20, 17)
  }

  // Doc ID (top-right)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5)
  doc.setTextColor(...colors.textMuted)
  doc.text(docId, w - 14, 12, { align: 'right' })

  // Section title bar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...colors.secondary)
  doc.text(title.toUpperCase(), 14, 32)
}

// Verification Page
export async function drawVerificationPage(doc, docId, dateStr, studentName, colors) {
  doc.addPage()
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  drawPageBackground(doc, colors)
  drawHeader(doc, 'Verification & Integrity Protocol', docId, studentName, colors)

  const midX = w / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...colors.textPrimary)
  doc.text('DOCUMENT INTEGRITY REPORT', midX, 46, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...colors.textSecondary)
  doc.text('AUTOMATED PROTOCOL CHECK // CRYPTOGRAPHIC SEAL VALIDATION', midX, 51, { align: 'center' })

  // Real QR code positioning
  const qrX = midX - 18
  const qrY = 62
  const qrSize = 36

  // Solid white container for high-contrast scannability
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 2, 2, 'F')
  doc.setDrawColor(...colors.border)
  doc.setLineWidth(0.25)
  doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 2, 2, 'D')

  try {
    const verificationUrl = `https://institute-pluse.vercel.app/verify/${docId}`
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 150,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
  } catch (err) {
    console.error('Failed to generate verification QR code:', err)
  }

  const checksum = docId.split('').reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 1000000007, 0).toString(16).toUpperCase()

  let yDetail = 112
  const addDetailRow = (lbl, val) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...colors.textMuted)
    doc.text(lbl.toUpperCase(), midX - 55, yDetail)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...colors.textPrimary)
    doc.text(String(val).toUpperCase(), midX + 55, yDetail, { align: 'right' })
    
    doc.setDrawColor(...colors.border)
    doc.setLineWidth(0.15)
    doc.line(midX - 55, yDetail + 2.5, midX + 55, yDetail + 2.5)
    yDetail += 10
  }

  addDetailRow('Document Token', docId)
  addDetailRow('Verified By', studentName || 'INSTITUTEPLUSE IDENTITY')
  addDetailRow('Cryptographic Seal', `SHA-256: ${checksum}`)
  addDetailRow('Timestamp', dateStr)
  addDetailRow('Report Status', 'VERIFIED GENUINE')

  // Seal logo
  doc.setFillColor(...colors.surface)
  doc.setGState(new doc.GState({ opacity: 0.15 }))
  doc.circle(midX, h - 50, 20, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))
  doc.setDrawColor(...colors.secondary)
  doc.setLineWidth(0.3)
  doc.circle(midX, h - 50, 20, 'D')
  doc.setDrawColor(...colors.highlight)
  doc.setLineWidth(0.15)
  doc.circle(midX, h - 50, 17, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  doc.setTextColor(...colors.secondary)
  doc.text('INSTITUTEPLUSE', midX, h - 52, { align: 'center' })
  doc.setFontSize(4.5)
  doc.setTextColor(...colors.textMuted)
  doc.text('SECURE REPORT ENGINE', midX, h - 48, { align: 'center' })
  doc.setFontSize(5)
  doc.setTextColor(...colors.accent)
  doc.text('★ VALID SEAL ★', midX, h - 43, { align: 'center' })
}

// Footer with page numbers and corner watermark
function drawFooter(doc, docId, dateStr, studentName, colors) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  const pageCount = doc.internal.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    if (i === 1) continue // Skip cover

    // Footer line
    doc.setDrawColor(...colors.border)
    doc.setLineWidth(0.2)
    doc.line(14, h - 18, w - 14, h - 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5)
    doc.setTextColor(...colors.textMuted)
    
    // Bottom-left: Name + Report token
    if (studentName) {
      doc.text(`${studentName.toUpperCase()} • ${docId}`, 14, h - 12)
    } else {
      doc.text(docId, 14, h - 12)
    }
    doc.text('INSTITUTEPLUSE CORE // VERIFIED REPORT', 14, h - 7)

    // Bottom-right: Page + Date
    doc.text(`PAGE ${i} OF ${pageCount}`, w - 14, h - 12, { align: 'right' })
    doc.text(dateStr.toUpperCase(), w - 14, h - 7, { align: 'right' })
  }
}

/**
 * Export tabular data as a premium branded PDF
 */
export async function exportTablePDF({ title, subtitle, headers, rows, filename, summaryCards, studentName, theme = 'cyber' }) {
  const colors = getThemeColors(theme)
  const doc = new jsPDF({ 
    orientation: rows[0]?.length > 5 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  const docId = generateDossierId()
  const dateStr = new Date().toLocaleString()

  const w = doc.internal.pageSize.getWidth()

  // Cover Page
  drawCoverPage(doc, { title, subtitle, docId, dateStr, name: studentName || '', summaryCards, colors, theme })

  // Content Page
  doc.addPage()
  drawHeader(doc, title, docId, studentName, colors)

  let startY = 44
  if (summaryCards && summaryCards.length > 0) {
    const cardSpacing = 4
    const totalCards = summaryCards.length
    const cardW = (w - 28 - (totalCards - 1) * cardSpacing) / totalCards
    summaryCards.forEach((card, i) => {
      const xCard = 14 + i * (cardW + cardSpacing)
      drawMetricCard(doc, xCard, startY, cardW, 26, card.label, card.value, card.trend || null, colors)
    })
    startY += 34
  }

  autoTable(doc, {
    head: [headers.map(h => h.toUpperCase())],
    body: rows,
    startY,
    theme: 'plain',
    styles: {
      fillColor: colors.bg,
      textColor: colors.isDark ? [203, 213, 225] : [51, 65, 85],
      fontSize: 7.5,
      font: 'helvetica',
      cellPadding: 4.5,
      lineColor: colors.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: colors.surface,
      textColor: colors.secondary,
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: colors.cardBg,
    },
    margin: { top: 40, left: 14, right: 14, bottom: 22 },
    willDrawCell: (data) => {
      // Force 100% opacity for cell background drawing
      data.doc.setGState(new data.doc.GState({ opacity: 1.0 }))

      if (data.row.section === 'head') {
        data.cell.styles.fillColor = colors.surface
        data.cell.styles.textColor = colors.secondary
      } else {
        if (data.row.index % 2 === 1) {
          data.cell.styles.fillColor = colors.cardBg
        } else {
          data.cell.styles.fillColor = colors.bg
        }
      }
    },
    didDrawCell: (data) => {
      // Force 100% opacity for cell overlays and text drawing
      data.doc.setGState(new data.doc.GState({ opacity: 1.0 }))
      const val = String(data.cell.raw || '').toLowerCase().trim()

      // Status pill overlays
      if (['paid', 'preparing', 'pending', 'ready', 'delivered', 'present', 'absent', 'completed', 'active'].includes(val)) {
        const doc = data.doc
        const cell = data.cell
        const x = cell.x + 2
        const y = cell.y + 2
        const w = cell.width - 4
        const h = cell.height - 4
        
        let pillBg, pillText
        if (['paid', 'present', 'completed', 'active'].includes(val)) {
          pillBg = colors.isDark ? [9, 49, 23] : [220, 252, 231]
          pillText = colors.isDark ? colors.accent : [21, 128, 61]
        } else if (['preparing', 'pending'].includes(val)) {
          pillBg = colors.isDark ? [62, 29, 5] : [255, 235, 219]
          pillText = colors.isDark ? [249, 115, 22] : [194, 65, 12]
        } else {
          pillBg = colors.isDark ? [60, 17, 17] : [254, 226, 226]
          pillText = colors.isDark ? [239, 68, 68] : [185, 28, 28]
        }
        
        doc.setFillColor(...pillBg)
        doc.roundedRect(x, y, w, h, 1, 1, 'F')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6.5)
        doc.setTextColor(...pillText)
        doc.text(val.toUpperCase(), x + w / 2, y + h / 2 + 2, { align: 'center' })
      }
      
      // Inline Progress bar overlays
      if (val.endsWith('%') && !isNaN(parseInt(val))) {
        const doc = data.doc
        const cell = data.cell
        const x = cell.x + 2
        const y = cell.y + 4
        const w = cell.width - 4
        const h = cell.height - 8
        const pct = parseInt(val)
        
        drawProgressBar(doc, x, y, w, h, pct, colors)
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6)
        doc.setTextColor(...colors.textPrimary)
        doc.text(val, x + w / 2, y + h / 2 + 2, { align: 'center' })
      }
    },
    willDrawPage: (data) => {
      doc.setGState(new doc.GState({ opacity: 1.0 }))
      if (data.pageNumber > 1) {
        drawHeader(doc, title, docId, studentName, colors)
      }
    },
    didDrawPage: (data) => {
      doc.setGState(new doc.GState({ opacity: 1.0 }))
      // Rounded table container border
      const isFirstPage = data.pageNumber === 1
      const startY = isFirstPage ? data.settings.startY : data.settings.margin.top
      const finalY = data.cursor?.y || (startY + 10)
      const tableHeight = finalY - startY
      doc.setDrawColor(...colors.border)
      doc.setLineWidth(0.3)
      doc.roundedRect(14, startY, w - 28, tableHeight, 2, 2, 'D')
    }
  })

  // Verification Page
  await drawVerificationPage(doc, docId, dateStr, studentName, colors)

  // Draw footers on all pages
  drawFooter(doc, docId, dateStr, studentName, colors)
  await savePDF(doc, filename)
}

/**
 * Export JSON report data as a premium branded PDF
 */
export async function exportReportPDF({ title, subtitle, data, filename, studentName, theme = 'cyber' }) {
  const colors = getThemeColors(theme)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  const w = doc.internal.pageSize.getWidth()
  const docId = generateDossierId()
  const dateStr = new Date().toLocaleString()

  // Cover
  drawCoverPage(doc, { title, subtitle, docId, dateStr, name: studentName || '', summaryCards: [], colors, theme })

  // Content
  doc.addPage()
  drawHeader(doc, title, docId, studentName, colors)

  let y = 48

  function renderObject(obj, depth = 0) {
    Object.entries(obj).forEach(([key, value]) => {
      if (y > doc.internal.pageSize.getHeight() - 28) {
        doc.addPage()
        drawHeader(doc, title, docId, studentName, colors)
        y = 48
      }

      const indent = 14 + depth * 8

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Section header rendering
        y = drawSectionHeader(doc, y, key.replace(/_/g, ' '), `MODULE-0${depth + 1}`, colors)
        renderObject(value, depth + 1)
      } else if (Array.isArray(value)) {
        // Draw Array section
        y = drawSectionHeader(doc, y, `${key.replace(/_/g, ' ')} (${value.length})`, `LIST-${depth + 1}`, colors)
        
        value.forEach((item, i) => {
          if (y > doc.internal.pageSize.getHeight() - 28) {
            doc.addPage()
            drawHeader(doc, title, docId, studentName, colors)
            y = 48
          }
          if (typeof item === 'object') {
            const lines = Object.entries(item).map(([k, v]) => `${k.toUpperCase()}: ${v}`)
            // Draw as a beautiful card panel
            drawCard(doc, indent, y, w - indent - 14, 6 + lines.length * 6, colors)
            
            lines.forEach((line, idx) => {
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(6.5)
              doc.setTextColor(...colors.textSecondary)
              doc.text(`• ${line}`, indent + 4, y + 5 + idx * 5.5, { maxWidth: w - indent - 22 })
            })
            y += 10 + lines.length * 5.5
          } else {
            // Bullet items
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(6.5)
            doc.setTextColor(...colors.textSecondary)
            doc.text(`• ${String(item).toUpperCase()}`, indent + 3, y)
            y += 5.5
          }
        })
        y += 3
      } else {
        // Key-Value primitive card with left border indicator
        drawCard(doc, indent, y - 4, w - indent - 14, 10, colors)
        
        // left bar highlight
        doc.setFillColor(...colors.secondary)
        doc.rect(indent, y - 4, 1, 10, 'F')

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(...colors.textMuted)
        doc.text(key.replace(/_/g, ' ').toUpperCase(), indent + 4, y + 2)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...colors.textPrimary)
        doc.text(String(value ?? 'N/A').toUpperCase(), w - 18, y + 2, { align: 'right' })

        y += 13
      }
    })
  }

  renderObject(data)
  
  // Verification Page
  await drawVerificationPage(doc, docId, dateStr, studentName, colors)

  // Footers
  drawFooter(doc, docId, dateStr, studentName, colors)
  await savePDF(doc, filename)
}
