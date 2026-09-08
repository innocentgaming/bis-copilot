#!/usr/bin/env python
"""
BIS Standards Dataset Import Script.
Loads standard specification records from CSV into a fast SQLite query store.

Usage:
    python scripts/import_standards_dataset.py [path_to_csv]
Default CSV path:
    data/bis_is_standards_dataset.csv
Output Database:
    data/bis_standards.db
"""

import csv
import os
import sqlite3
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.services.is_normalizer import ISNormalizer


DEFAULT_CSV_PATH = PROJECT_ROOT / "data" / "bis_is_standards_dataset.csv"
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "bis_standards.db"


def init_db(db_path: Path):
    """Initialize SQLite tables and indexes."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Drop existing tables for fresh re-seed
    cur.execute("DROP TABLE IF EXISTS standards_dataset")
    cur.execute("DROP TABLE IF EXISTS standards_fts")

    # Main standards dataset table
    cur.execute("""
        CREATE TABLE standards_dataset (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            is_number TEXT NOT NULL,
            canonical_is_number TEXT NOT NULL,
            compact_key TEXT NOT NULL,
            base_number TEXT,
            part_number TEXT,
            year_notified INTEGER,
            title TEXT NOT NULL,
            section TEXT NOT NULL,
            ics_code TEXT,
            status TEXT NOT NULL,
            applicable_to TEXT,
            scope_description TEXT
        )
    """)

    # Standard B-tree indexes for instant lookups
    cur.execute("CREATE INDEX idx_std_is_number ON standards_dataset(is_number)")
    cur.execute("CREATE INDEX idx_std_canonical ON standards_dataset(canonical_is_number)")
    cur.execute("CREATE INDEX idx_std_compact ON standards_dataset(compact_key)")
    cur.execute("CREATE INDEX idx_std_base ON standards_dataset(base_number)")
    cur.execute("CREATE INDEX idx_std_base_part ON standards_dataset(base_number, part_number)")
    cur.execute("CREATE INDEX idx_std_status ON standards_dataset(status)")
    cur.execute("CREATE INDEX idx_std_section ON standards_dataset(section)")

    # Full Text Search (FTS5) for search fallback
    cur.execute("""
        CREATE VIRTUAL TABLE standards_fts USING fts5(
            is_number,
            title,
            section,
            applicable_to,
            scope_description,
            content='standards_dataset',
            content_rowid='id'
        )
    """)

    conn.commit()
    conn.close()


def import_csv_to_sqlite(csv_path: Path, db_path: Path) -> int:
    """Import CSV standard records into SQLite."""
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found at: {csv_path}")

    print(f"Initializing database at: {db_path}")
    init_db(db_path)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    print(f"Reading dataset from: {csv_path}")
    records = []
    
    with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_is = row.get("IS_Number", "").strip()
            if not raw_is:
                continue

            parsed = ISNormalizer.parse(raw_is)

            # Year parsing
            raw_year = row.get("Year_Notified", "").strip()
            year_val = None
            if raw_year.isdigit():
                year_val = int(raw_year)
            elif parsed.year:
                year_val = parsed.year

            records.append((
                raw_is,
                parsed.canonical_number,
                parsed.compact_key,
                parsed.base_number,
                parsed.part_number,
                year_val,
                row.get("Title", "").strip(),
                row.get("Section", "").strip(),
                row.get("ICS_Code", "").strip(),
                row.get("Status", "Active").strip(),
                row.get("Applicable_To", "").strip(),
                row.get("Scope_Description", "").strip(),
            ))

    cur.executemany("""
        INSERT INTO standards_dataset (
            is_number,
            canonical_is_number,
            compact_key,
            base_number,
            part_number,
            year_notified,
            title,
            section,
            ics_code,
            status,
            applicable_to,
            scope_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, records)

    # Populate FTS index
    cur.execute("""
        INSERT INTO standards_fts(rowid, is_number, title, section, applicable_to, scope_description)
        SELECT id, is_number, title, section, applicable_to, scope_description FROM standards_dataset
    """)

    conn.commit()
    count = cur.execute("SELECT COUNT(*) FROM standards_dataset").fetchone()[0]
    conn.close()

    print(f"Successfully imported {count} Indian Standards into {db_path}")
    return count


if __name__ == "__main__":
    target_csv = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV_PATH
    target_db = DEFAULT_DB_PATH
    import_csv_to_sqlite(target_csv, target_db)
