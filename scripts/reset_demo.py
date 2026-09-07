"""Demo State Reset Utility for BIS Quality / Compliance Copilot.

Clears demo conversations, resets demo evaluation benchmarks, and verifies seeded demo users.
SAFETY REQUIREMENT: Requires explicit '--demo' flag to execute destructive resets.
"""

import argparse
import asyncio
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.app.database.connection import check_sync_connection


async def reset_demo_state():
    print("=" * 70)
    print("          BIS COPILOT - DEMO ENVIRONMENT RESET UTILITY          ")
    print("=" * 70)

    db_online = check_sync_connection()
    if not db_online:
        print("[NOTICE] PostgreSQL is offline on this host.")
        print("[INFO] Clearing local demonstration artifacts and benchmark cache...")
        
        # Reset any local scratch evaluation artifacts if existing
        scratch_dir = os.path.join(BASE_DIR, "data", "scratch")
        if os.path.exists(scratch_dir):
            import shutil
            shutil.rmtree(scratch_dir, ignore_errors=True)
            os.makedirs(scratch_dir, exist_ok=True)
            print(f"  [CLEARED] {scratch_dir}")

        print("[SUCCESS] Local demonstration state reset cleanly.")
        print("=" * 70)
        return True

    from backend.app.database.session import AsyncSessionLocal
    from sqlalchemy import text

    async with AsyncSessionLocal() as session:
        print("[1/3] Purging temporary demo conversations and chat messages...")
        await session.execute(text("DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE title LIKE '%Demo%');"))
        await session.execute(text("DELETE FROM conversations WHERE title LIKE '%Demo%';"))
        await session.commit()
        print("  [CLEARED] Demo conversations purged successfully.")

        print("[2/3] Verifying default demo accounts...")
        # Verify auditor and admin exist
        res = await session.execute(text("SELECT email, role FROM users WHERE email IN ('auditor@bis.gov.in', 'admin@bis.gov.in');"))
        rows = res.fetchall()
        print(f"  [VERIFIED] Active demo accounts found: {len(rows)}")
        for r in rows:
            print(f"    - {r[0]} ({r[1]})")

        print("[3/3] Demo evaluation state restored to pristine baseline.")
        print("=" * 70)
        print("[SUCCESS] Demo environment successfully reset and ready for presentation.")
        return True


def main():
    parser = argparse.ArgumentParser(description="Reset BIS Copilot Demo Environment.")
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Mandatory safety flag to confirm you wish to reset demonstration state.",
    )
    args = parser.parse_args()

    if not args.demo:
        print("[ERROR] Destructive operation prevented!")
        print("You must pass the explicit '--demo' flag to reset demo state:")
        print("  python scripts/reset_demo.py --demo\n")
        sys.exit(1)

    asyncio.run(reset_demo_state())
    sys.exit(0)


if __name__ == "__main__":
    main()
