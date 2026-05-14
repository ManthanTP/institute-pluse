/**
 * InstitutePulse — Branded PDF Export Utility
 * 
 * Generates themed PDF documents matching the InstitutePulse dark-mode aesthetic.
 * All file downloads across the platform use this module for consistent branding.
 */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Brand Color Palette (Synchronized with UI) ──
const COLORS = {
  bg: [2, 6, 23],           // #020617 (Slate 950)
  cardBg: [15, 23, 42],     // #0f172a (Slate 900)
  primary: [34, 197, 94],   // #22c55e (Green 500)
  accent: [59, 130, 246],    // #3b82f6 (Blue 500)
  white: [255, 255, 255],
  gray: [148, 163, 184],     // #94a3b8
  darkGray: [100, 116, 139], // #64748b
  border: [30, 41, 59],      // #1e293b (Slate 800)
}

/**
 * Draws the InstitutePulse branded header on the PDF
 */
function drawHeader(doc, title, subtitle = '') {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Full Page Background
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Accent bar (vertical)
  doc.setFillColor(...COLORS.primary)
  doc.rect(20, 15, 2, 20, 'F')

  // Logo/Brand text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...COLORS.white)
  doc.text('INSTITUTE', 25, 25)
  doc.setTextColor(...COLORS.primary)
  doc.text('PULSE', 75, 25)

  // Subtitle/Manifest info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.darkGray)
  doc.text(`${title.toUpperCase()} // SECURE EXTRACTION`, 25, 32)

  // Divider line
  doc.setDrawColor(...COLORS.border)
  doc.line(20, 45, pageWidth - 20, 45)

  if (subtitle) {
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.gray)
    doc.text(subtitle.toUpperCase(), 20, 52)
  }
}

/**
 * Draws the branded footer on each page
 */
function drawFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageCount = doc.internal.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.darkGray)
    doc.text('THIS IS A SYSTEM-GENERATED DOCUMENT FROM INSTITUTEPULSE CORE.', 20, pageHeight - 10)
    doc.text(`TRANSMISSION PAGE ${i}/${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' })
  }
}

/**
 * Export tabular data as a branded PDF
 */
export function exportTablePDF({ title, subtitle, headers, rows, filename, summaryCards }) {
  const doc = new jsPDF({ orientation: rows[0]?.length > 5 ? 'landscape' : 'portrait' })
  const pageWidth = doc.internal.pageSize.getWidth()

  drawHeader(doc, title, subtitle)

  let startY = 60

  // Summary cards
  if (summaryCards && summaryCards.length > 0) {
    const cardWidth = (pageWidth - 40 - (summaryCards.length - 1) * 6) / summaryCards.length
    summaryCards.forEach((card, i) => {
      const x = 20 + i * (cardWidth + 6)
      doc.setFillColor(...COLORS.cardBg)
      doc.roundedRect(x, startY, cardWidth, 24, 3, 3, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...COLORS.darkGray)
      doc.text(card.label.toUpperCase(), x + 6, startY + 9)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...COLORS.white)
      doc.text(String(card.value), x + 6, startY + 19)
    })
    startY += 32
  }

  // Table
  autoTable(doc, {
    head: [headers.map(h => h.toUpperCase())],
    body: rows,
    startY,
    theme: 'plain',
    styles: {
      fillColor: COLORS.bg,
      textColor: [203, 213, 225], // Slate-300
      fontSize: 8,
      font: 'helvetica',
      cellPadding: 5,
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.cardBg,
      textColor: COLORS.primary,
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLORS.cardBg,
    },
    margin: { top: 60, left: 20, right: 20, bottom: 25 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawHeader(doc, title, subtitle)
      }
    }
  })

  drawFooter(doc)
  doc.save(`${filename}.pdf`)
}

/**
 * Export JSON diagnostic / report data as a branded PDF
 */
export function exportReportPDF({ title, subtitle, data, filename }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  drawHeader(doc, title, subtitle)

  let y = 65

  function renderObject(obj, depth = 0) {
    Object.entries(obj).forEach(([key, value]) => {
      if (y > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage()
        drawHeader(doc, title, subtitle)
        y = 65
      }

      const indent = 20 + depth * 10

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Section header
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...COLORS.primary)
        doc.text(key.replace(/_/g, ' ').toUpperCase(), indent, y)
        y += 3
        doc.setDrawColor(...COLORS.primary)
        doc.setLineWidth(0.3)
        doc.line(indent, y, pageWidth - 20, y)
        y += 8
        renderObject(value, depth + 1)
      } else if (Array.isArray(value)) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...COLORS.primary)
        doc.text(`${key.replace(/_/g, ' ').toUpperCase()} (${value.length} ITEMS)`, indent, y)
        y += 8

        value.forEach((item, i) => {
          if (y > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage()
            drawHeader(doc, title, subtitle)
            y = 65
          }
          if (typeof item === 'object') {
            const line = Object.entries(item).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('  |  ')
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(...COLORS.gray)
            doc.text(`${i + 1}. ${line}`, indent + 4, y, { maxWidth: pageWidth - indent - 30 })
            y += 6
          } else {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(...COLORS.gray)
            doc.text(`• ${String(item).toUpperCase()}`, indent + 4, y)
            y += 5
          }
        })
        y += 4
      } else {
        // Key-value pair
        doc.setFillColor(...COLORS.cardBg)
        doc.roundedRect(indent, y - 4, pageWidth - indent - 20, 10, 2, 2, 'F')

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...COLORS.darkGray)
        doc.text(key.replace(/_/g, ' ').toUpperCase(), indent + 4, y + 2)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(...COLORS.white)
        doc.text(String(value ?? 'N/A').toUpperCase(), pageWidth - 24, y + 2, { align: 'right' })

        y += 14
      }
    })
  }

  renderObject(data)
  drawFooter(doc)
  doc.save(`${filename}.pdf`)
}
