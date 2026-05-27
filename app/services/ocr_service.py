# app/services/ocr_service.py
# Stub — optional server-side OCR fallback, implemented in Phase 5.
# Client-side OCR via Tesseract.js Web Worker is the primary path.


def parse_receipt_text(ocr_text: str) -> dict:
    """Parse raw OCR text to extract amount and date.

    Returns:
        {"amount": float | None, "date": str | None}
    """
    # TODO Phase 5: implement regex-based extraction
    return {"amount": None, "date": None}
