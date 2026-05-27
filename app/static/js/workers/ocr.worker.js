/**
 * app/static/js/workers/ocr.worker.js
 * ─────────────────────────────────────────────────────────────
 * Web Worker: runs Tesseract.js OCR on a receipt image.
 * Lazy-loaded only when the /receipts/capture page is open.
 * Full implementation in Phase 5.
 *
 * Messages received:
 *   { type: 'OCR_IMAGE', imageData: <base64 string> }
 *
 * Messages sent:
 *   { type: 'OCR_PROGRESS', progress: 0-100 }
 *   { type: 'OCR_RESULT', text: '...', amount: 123.45, date: '2025-01-12' }
 *   { type: 'OCR_ERROR', message: '...' }
 */

// Tesseract.js is imported inside the worker (lazy) — Phase 5
// importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');

self.onmessage = async function(event) {
  const { type, imageData } = event.data;

  if (type !== 'OCR_IMAGE') return;

  // Stub: Phase 5 will call Tesseract.recognize() here
  self.postMessage({
    type: 'OCR_RESULT',
    text: '',
    amount: null,
    date: null,
    note: 'OCR not yet implemented — Phase 5',
  });
};
