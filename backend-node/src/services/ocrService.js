const Tesseract = require('tesseract.js');
const { createWorker } = Tesseract;
const path = require('path');
const fs = require('fs');
const os = require('os');
const logger = require('../utils/logger');

/**
 * OCR Service.
 * Extracts structured invoice data from uploaded image/PDF files.
 *
 * NOTE: PDF support requires pdf-poppler or poppler-utils installed.
 * For production, consider using pdf2pic or pdfjs-dist for PDF rendering.
 */

// ─── Date Pattern Helpers ─────────────────────────────────────────────────────

const DATE_PATTERNS = [
  /(\d{2})\/(\d{2})\/(\d{4})/, // dd/MM/yyyy or MM/dd/yyyy
  /(\d{4})-(\d{2})-(\d{2})/,  // yyyy-MM-dd (ISO)
  /(\d{2})-(\d{2})-(\d{4})/,  // dd-MM-yyyy
  /(\w+ \d{1,2},? \d{4})/,    // "June 5, 2026"
  /(\d{1,2} \w+ \d{4})/,      // "5 June 2026"
];

// ─── Main OCR Entry Point ─────────────────────────────────────────────────────

/**
 * Extract invoice data from an uploaded file (buffer).
 */
async function extractInvoiceData(file) {
  const { buffer, mimetype, originalname } = file;

  logger.info(`OCR processing file: ${originalname} (${mimetype})`);

  let rawText;

  try {
    if (mimetype === 'application/pdf') {
      rawText = await extractFromPdf(buffer);
    } else {
      rawText = await extractFromImage(buffer, mimetype);
    }
  } catch (err) {
    logger.warn(`OCR extraction failed: ${err.message}. Using empty text.`);
    rawText = '';
  }

  logger.debug(`OCR raw text extracted (${rawText.length} chars)`);
  return parseInvoiceData(rawText);
}

// ─── Image Extraction ─────────────────────────────────────────────────────────

async function extractFromImage(buffer, mimetype) {
  // Write buffer to temp file
  const ext = mimeToExt(mimetype);
  const tmpFile = path.join(os.tmpdir(), `ocr_${Date.now()}${ext}`);

  try {
    fs.writeFileSync(tmpFile, buffer);
    const worker = await createWorker('eng', 1, {
      logger: m => logger.debug(`Tesseract: ${m.status} ${Math.round((m.progress || 0) * 100)}%`),
    });
    const { data: { text } } = await worker.recognize(tmpFile);
    await worker.terminate();
    return text;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

async function extractFromPdf(buffer) {
  // Tesseract.js can also accept a buffer directly for images
  // For PDFs, we attempt to use tesseract on the raw buffer as-is (basic support)
  // For proper PDF support, a PDF-to-image conversion step would be needed.
  // We fallback to treating the buffer as a raw document.
  try {
    const worker = await createWorker('eng', 1, {
      logger: m => logger.debug(`Tesseract: ${m.status}`),
    });
    // tesseract.js can handle PDFs in some versions
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text;
  } catch (err) {
    logger.warn(`PDF OCR failed: ${err.message}. Converting to image not available in this environment.`);
    return '';
  }
}

// ─── Data Parsing ─────────────────────────────────────────────────────────────

function parseInvoiceData(text) {
  const vendorName = extractVendorName(text);
  const invoiceNumber = extractInvoiceNumber(text);
  const invoiceDate = extractDate(text, /(?:invoice\s*date|date)[:\s]+([^\n]+)/i);
  const purchaseDate = extractDate(text, /(?:purchase\s*date|order\s*date)[:\s]+([^\n]+)/i);
  const totalAmount = extractAmount(text, /(?:total|amount|grand\s*total)[:\s]*[\$₹€£]?\s*([\d,]+\.?\d*)/i);
  const warrantyPeriod = extractWarrantyPeriod(text);
  const assetName = extractAssetName(text);
  const serialNumber = extractSerialNumber(text);
  const extractionConfidence = calculateConfidence({
    vendorName, invoiceNumber, invoiceDate, totalAmount,
  });

  return {
    rawText: text,
    vendorName,
    invoiceNumber,
    invoiceDate,
    purchaseDate,
    totalAmount,
    warrantyPeriod,
    assetName,
    serialNumber,
    extractionConfidence,
  };
}

// ─── Extractors ───────────────────────────────────────────────────────────────

function extractVendorName(text) {
  const m = text.match(/(?:vendor|supplier|from|sold\s*by|company)[:\s]+([A-Z][\w\s&.,]+?)(?:\n|$)/i);
  if (m) return m[1].trim();
  // Fallback: find first all-caps line
  const lines = text.split('\n');
  for (const line of lines) {
    if (/^[A-Z][A-Z\s&.,]+$/.test(line.trim()) && line.trim().length > 3) {
      return line.trim();
    }
  }
  return null;
}

function extractInvoiceNumber(text) {
  const m = text.match(/(?:invoice\s*(?:no|number|#|num))[.:\s]*([A-Z0-9\-/]+)/i);
  return m ? m[1].trim() : null;
}

function extractDate(text, pattern) {
  const m = text.match(pattern);
  if (!m) return null;
  const raw = m[1].trim();
  // Try ISO date first
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // Try dd/MM/yyyy
  const ddmm = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmm) return `${ddmm[3]}-${ddmm[2]}-${ddmm[1]}`;
  // Try MM/dd/yyyy
  const mmdd = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mmdd) {
    const d = new Date(`${mmdd[3]}-${mmdd[1]}-${mmdd[2]}`);
    if (!isNaN(d)) return `${mmdd[3]}-${mmdd[1]}-${mmdd[2]}`;
  }
  // Try parsing naturally
  const d = new Date(raw);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

function extractAmount(text, pattern) {
  const m = text.match(pattern);
  if (!m) return null;
  const num = parseFloat(m[1].replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

function extractWarrantyPeriod(text) {
  const m = text.match(/warranty[:\s]+(\d+\s*(?:year|month|day)s?)/i);
  return m ? m[1].trim() : null;
}

function extractAssetName(text) {
  const m = text.match(/(?:product|item|description|asset)[:\s]+([A-Za-z][\w\s]+?)(?:\n|$)/i);
  return m ? m[1].trim() : null;
}

function extractSerialNumber(text) {
  const m = text.match(/(?:serial\s*(?:no|number|#))[.:\s]*([A-Z0-9\-]+)/i);
  return m ? m[1].trim() : null;
}

function calculateConfidence({ vendorName, invoiceNumber, invoiceDate, totalAmount }) {
  let fieldsFound = 0;
  if (invoiceNumber) fieldsFound++;
  if (vendorName) fieldsFound++;
  if (invoiceDate) fieldsFound++;
  if (totalAmount) fieldsFound++;
  return Math.round((fieldsFound / 4) * 100);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mimeToExt(mimetype) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  };
  return map[mimetype] || '.tmp';
}

module.exports = { extractInvoiceData };
