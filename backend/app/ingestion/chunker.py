"""Clause-aware text chunking with context preservation and deterministic indexing."""

import re
from typing import List, Optional, Dict, Any
from backend.app.ingestion.models import ParsedClause, DocumentChunkData


def split_text_with_overlap(
    text: str,
    chunk_size: int = 1200,
    chunk_overlap: int = 150,
) -> List[str]:
    """Split text respecting paragraph, sentence, and word boundaries with overlap.

    Args:
        text: Input string to split.
        chunk_size: Target maximum character length per chunk.
        chunk_overlap: Overlap length between consecutive chunks.

    Returns:
        List of text slices.
    """
    if len(text) <= chunk_size:
        return [text]

    chunks: List[str] = []
    paragraphs = text.split("\n\n")
    current_chunk = ""

    for para in paragraphs:
        para_clean = para.strip()
        if not para_clean:
            continue

        if not current_chunk:
            current_chunk = para_clean
        elif len(current_chunk) + len(para_clean) + 2 <= chunk_size:
            current_chunk += "\n\n" + para_clean
        else:
            # Current chunk is full
            chunks.append(current_chunk)
            # Retain overlap from end of current chunk
            if chunk_overlap > 0 and len(current_chunk) > chunk_overlap:
                overlap_text = current_chunk[-chunk_overlap:]
                # Find space in overlap to avoid slicing mid-word
                space_idx = overlap_text.find(" ")
                if space_idx != -1:
                    overlap_text = overlap_text[space_idx + 1:]
                current_chunk = overlap_text + "\n\n" + para_clean
            else:
                current_chunk = para_clean

    if current_chunk:
        chunks.append(current_chunk)

    # Fallback for unusually long unbroken blocks (e.g. huge tables without blank lines)
    refined_chunks: List[str] = []
    for ch in chunks:
        if len(ch) <= chunk_size * 1.3:
            refined_chunks.append(ch)
        else:
            # Split by sentences or words
            start = 0
            while start < len(ch):
                end = min(start + chunk_size, len(ch))
                if end < len(ch):
                    # Try to break at sentence or space
                    split_pt = ch.rfind(". ", start, end)
                    if split_pt == -1:
                        split_pt = ch.rfind(" ", start, end)
                    if split_pt != -1 and split_pt > start + (chunk_size // 2):
                        end = split_pt + 1
                refined_chunks.append(ch[start:end].strip())
                start = end - chunk_overlap if end < len(ch) else end

    return [c for c in refined_chunks if c]


def chunk_parsed_clauses(
    clauses: List[ParsedClause],
    standard_number: Optional[str] = None,
    chunk_size: int = 1200,
    chunk_overlap: int = 150,
    extraction_method: str = "native_pdf",
) -> List[DocumentChunkData]:
    """Generate deterministic, clause-aware chunks with contextual header prefix.

    Prefix format:
    Standard: {standard_number}
    Clause: {clause_number}
    Heading: {heading}

    {content}
    """
    chunks: List[DocumentChunkData] = []
    chunk_idx = 0

    for clause in clauses:
        clause_header_parts = []
        if standard_number:
            clause_header_parts.append(f"Standard: {standard_number}")
        clause_header_parts.append(f"Clause: {clause.clause_number}")
        if clause.heading:
            clause_header_parts.append(f"Heading: {clause.heading}")

        context_prefix = "\n".join(clause_header_parts) + "\n\n"

        # If content is short or empty (e.g. clause heading only), emit single chunk
        content_to_split = clause.content or f"Clause {clause.clause_number} - {clause.heading or ''}"
        text_slices = split_text_with_overlap(
            content_to_split,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        for slice_text in text_slices:
            full_chunk_text = f"{context_prefix}{slice_text}".strip()

            meta = {
                "clause_number": clause.clause_number,
                "heading": clause.heading,
                "standard_number": standard_number,
                "page_start": clause.page_start,
                "page_end": clause.page_end,
                "is_annex": clause.is_annex,
                "extraction_method": extraction_method,
                "chunk_index": chunk_idx,
            }

            chunks.append(
                DocumentChunkData(
                    chunk_index=chunk_idx,
                    content=full_chunk_text,
                    page_start=clause.page_start,
                    page_end=clause.page_end,
                    clause_number=clause.clause_number,
                    heading=clause.heading,
                    standard_number=standard_number,
                    metadata=meta,
                )
            )
            chunk_idx += 1

    return chunks
