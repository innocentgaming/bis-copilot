"""IS Number Lookup Service.
Performs deterministic exact and close/partial matching over the BIS standards dataset.
"""

import os
import sqlite3
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any

from backend.app.api.schemas.is_lookup import (
    CloseMatchRecord,
    ISLookupResponse,
    StandardRecord,
)
from backend.app.services.is_normalizer import ISNormalizer, ParsedISNumber

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DB_PATH = PROJECT_ROOT / "data" / "bis_standards.db"
CSV_PATH = PROJECT_ROOT / "data" / "bis_is_standards_dataset.csv"


class ISLookupService:
    """Fast, accurate lookup service for Indian Standards without machine learning."""

    @classmethod
    def get_db_connection(cls) -> sqlite3.Connection:
        """Get a connection to the SQLite database, auto-seeding if needed."""
        if not DB_PATH.exists() and CSV_PATH.exists():
            from scripts.import_standards_dataset import import_csv_to_sqlite
            import_csv_to_sqlite(CSV_PATH, DB_PATH)

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @classmethod
    def _row_to_standard(cls, row: sqlite3.Row) -> StandardRecord:
        """Convert a SQLite row to a StandardRecord model."""
        return StandardRecord(
            id=row["id"] if "id" in row.keys() else None,
            is_number=row["is_number"],
            title=row["title"],
            section=row["section"],
            year_notified=row["year_notified"],
            ics_code=row["ics_code"],
            status=row["status"],
            applicable_to=row["applicable_to"],
            scope_description=row["scope_description"],
        )

    @classmethod
    def lookup(cls, query_str: str, max_close_matches: int = 10) -> ISLookupResponse:
        """Look up an Indian Standard by IS number, handling formatting variations.
        
        Returns:
            ISLookupResponse containing exact_match (if any) and close_matches.
        """
        raw_query = query_str.strip() if query_str else ""
        if not raw_query:
            return ISLookupResponse(
                query="",
                normalized_query="",
                match_type="none",
                exact_match=None,
                close_matches=[],
                total_results=0,
                message="Please enter an IS Number to search (e.g. IS 1910-6:1993, IS 356, IS 1786).",
            )

        parsed: ParsedISNumber = ISNormalizer.parse(raw_query)
        conn = cls.get_db_connection()
        cur = conn.cursor()

        exact_record: Optional[StandardRecord] = None
        exact_id: Optional[int] = None
        close_matches_dict: Dict[int, CloseMatchRecord] = {}

        # 1. Exact Match Search
        # Try raw is_number, canonical number, or compact key
        exact_sql = """
            SELECT * FROM standards_dataset
            WHERE LOWER(TRIM(is_number)) = LOWER(TRIM(?))
               OR LOWER(TRIM(canonical_is_number)) = LOWER(TRIM(?))
               OR compact_key = ?
            LIMIT 1
        """
        exact_row = cur.execute(exact_sql, (raw_query, parsed.canonical_number, parsed.compact_key)).fetchone()

        if exact_row:
            exact_record = cls._row_to_standard(exact_row)
            exact_id = exact_row["id"]

        # 2. Close / Partial Matches
        # If user searched with base number (e.g. 1910)
        if parsed.base_number:
            # 2a. Same base number and same part, but different year
            if parsed.part_number:
                part_sql = """
                    SELECT * FROM standards_dataset
                    WHERE base_number = ? AND part_number = ? AND id != ?
                    ORDER BY year_notified DESC
                    LIMIT ?
                """
                for row in cur.execute(part_sql, (parsed.base_number, parsed.part_number, exact_id or -1, max_close_matches)):
                    rid = row["id"]
                    if rid not in close_matches_dict:
                        close_matches_dict[rid] = CloseMatchRecord(
                            standard=cls._row_to_standard(row),
                            match_reason=f"Same standard and Part {parsed.part_number} (Year: {row['year_notified'] or 'N/A'})",
                            similarity_score=0.90,
                        )

            # 2b. Same base number, any part
            base_sql = """
                SELECT * FROM standards_dataset
                WHERE base_number = ? AND id != ?
                ORDER BY year_notified DESC, part_number ASC
                LIMIT ?
            """
            for row in cur.execute(base_sql, (parsed.base_number, exact_id or -1, max_close_matches)):
                rid = row["id"]
                if rid not in close_matches_dict:
                    part_desc = f"Part {row['part_number']}" if row["part_number"] else "Main Part"
                    close_matches_dict[rid] = CloseMatchRecord(
                        standard=cls._row_to_standard(row),
                        match_reason=f"Same base standard family IS {parsed.base_number} ({part_desc})",
                        similarity_score=0.75,
                    )

            # 2c. Base number prefix / contains
            prefix_sql = """
                SELECT * FROM standards_dataset
                WHERE base_number LIKE ? AND id != ?
                ORDER BY is_number ASC
                LIMIT ?
            """
            for row in cur.execute(prefix_sql, (f"{parsed.base_number}%", exact_id or -1, max_close_matches)):
                rid = row["id"]
                if rid not in close_matches_dict:
                    close_matches_dict[rid] = CloseMatchRecord(
                        standard=cls._row_to_standard(row),
                        match_reason="Matching standard number prefix",
                        similarity_score=0.60,
                    )

        # 2d. If no base number or need more close matches, search by substring / keyword in IS_Number or Title
        if len(close_matches_dict) < max_close_matches:
            keyword_sql = """
                SELECT * FROM standards_dataset
                WHERE (is_number LIKE ? OR title LIKE ? OR applicable_to LIKE ?)
                  AND id != ?
                LIMIT ?
            """
            search_pattern = f"%{parsed.canonical_number.replace('IS ', '')}%"
            for row in cur.execute(keyword_sql, (search_pattern, f"%{raw_query}%", f"%{raw_query}%", exact_id or -1, max_close_matches - len(close_matches_dict))):
                rid = row["id"]
                if rid not in close_matches_dict:
                    close_matches_dict[rid] = CloseMatchRecord(
                        standard=cls._row_to_standard(row),
                        match_reason="Matching number or title keyword",
                        similarity_score=0.50,
                    )

        # 2e. FTS5 fallback if still empty
        if not exact_record and not close_matches_dict and len(raw_query) >= 3:
            # Clean fts query
            fts_query = "".join(c if c.isalnum() else " " for c in raw_query).strip()
            if fts_query:
                fts_terms = " OR ".join(f'"{t}"*' for t in fts_query.split() if len(t) >= 2)
                if fts_terms:
                    try:
                        fts_sql = """
                            SELECT standards_dataset.* FROM standards_fts
                            JOIN standards_dataset ON standards_fts.rowid = standards_dataset.id
                            WHERE standards_fts MATCH ?
                            LIMIT ?
                        """
                        for row in cur.execute(fts_sql, (fts_terms, max_close_matches)):
                            rid = row["id"]
                            if rid not in close_matches_dict and (not exact_id or rid != exact_id):
                                close_matches_dict[rid] = CloseMatchRecord(
                                    standard=cls._row_to_standard(row),
                                    match_reason="Full-text search keyword match",
                                    similarity_score=0.40,
                                )
                    except Exception:
                        pass

        conn.close()

        # Sort close matches by similarity score descending
        sorted_close = sorted(
            close_matches_dict.values(),
            key=lambda m: (m.similarity_score, m.standard.year_notified or 0),
            reverse=True,
        )[:max_close_matches]

        # Determine match type and message
        if exact_record:
            match_type = "exact"
            message = f"Found exact match for standard {exact_record.is_number}."
        elif sorted_close:
            match_type = "partial"
            message = f"No exact match for '{raw_query}', but found {len(sorted_close)} close or related standards."
        else:
            match_type = "none"
            message = f"No standard match found for '{raw_query}'. Please verify the IS number or try another query."

        return ISLookupResponse(
            query=raw_query,
            normalized_query=parsed.canonical_number,
            match_type=match_type,
            exact_match=exact_record,
            close_matches=sorted_close,
            total_results=(1 if exact_record else 0) + len(sorted_close),
            message=message,
        )
