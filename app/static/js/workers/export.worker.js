/**
 * app/static/js/workers/export.worker.js
 * ─────────────────────────────────────────────────────────────
 * Web Worker: builds a CSV Blob from transaction data.
 * Runs off the main thread so the UI never freezes.
 * Full implementation in Phase 6.
 *
 * Messages received:
 *   { type: 'EXPORT_CSV', transactions: [...], filename: 'report.csv' }
 *
 * Messages sent:
 *   { type: 'EXPORT_DONE', blob: Blob, filename: '...' }
 *   { type: 'EXPORT_ERROR', message: '...' }
 */

self.onmessage = function(event) {
  const { type, transactions, filename } = event.data;

  if (type !== 'EXPORT_CSV') return;

  try {
    // ── Build CSV string ──────────────────────────────────────
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Category', 'Note'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.category?.name || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\r\n');

    // ── Create Blob ───────────────────────────────────────────
    const blob = new Blob(['\uFEFF' + csvContent], {  // BOM for Excel UTF-8
      type: 'text/csv;charset=utf-8;',
    });

    self.postMessage({ type: 'EXPORT_DONE', blob, filename });

  } catch (err) {
    self.postMessage({ type: 'EXPORT_ERROR', message: err.message });
  }
};
