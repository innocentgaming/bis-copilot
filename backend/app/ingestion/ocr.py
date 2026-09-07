"""OCR fallback extraction module for scanned or image-only documents."""

import logging
from typing import List, Tuple
from backend.app.ingestion.models import ExtractedPage

logger = logging.getLogger(__name__)


def is_ocr_needed(
    pages: List[ExtractedPage],
    min_chars_per_page: int = 50,
) -> Tuple[bool, str]:
    """Determine whether a document has insufficient text layer and requires OCR.

    Args:
        pages: List of natively extracted pages.
        min_chars_per_page: Minimum character threshold per page.

    Returns:
        Tuple of (needs_ocr, reason_string).
    """
    if not pages:
        return True, "Document has 0 extracted pages."

    total_chars = sum(p.char_count for p in pages)
    avg_chars = total_chars / len(pages) if pages else 0

    empty_pages = sum(1 for p in pages if p.char_count < 10)

    if avg_chars < min_chars_per_page:
        return True, f"Average characters per page ({avg_chars:.1f}) is below minimum threshold ({min_chars_per_page})."

    if empty_pages > len(pages) * 0.7:
        return True, f"{empty_pages}/{len(pages)} pages have virtually no extractable text."

    return False, "Sufficient native text layer present."


def extract_page_with_ocr(
    doc_fitz,
    page_index: int,
    language: str = "eng",
) -> ExtractedPage:
    """Perform OCR on a single PDF page using Tesseract if available.

    Falls back cleanly if Tesseract is not installed on the host system.
    """
    page_number = page_index + 1
    page = doc_fitz[page_index]
    rect = page.rect

    try:
        import pytesseract
        from PIL import Image
        import io

        pix = page.get_pixmap(dpi=200)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text = pytesseract.image_to_string(img, lang=language)
        return ExtractedPage(
            page_number=page_number,
            text=text,
            char_count=len(text.strip()),
            width=rect.width,
            height=rect.height,
            is_ocr=True,
            warnings=["Page extracted via OCR fallback."],
        )
    except Exception as exc:
        logger.warning(f"OCR execution skipped on page {page_number}: {exc}")
        # Return whatever native text exists
        native_text = page.get_text()
        return ExtractedPage(
            page_number=page_number,
            text=native_text,
            char_count=len(native_text.strip()),
            width=rect.width,
            height=rect.height,
            is_ocr=False,
            warnings=[f"OCR engine unavailable ({exc}); fell back to native text."],
        )
