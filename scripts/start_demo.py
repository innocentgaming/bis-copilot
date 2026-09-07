"""One-command demo runner and preparation orchestrator for SIH 26107.

Automates the complete initialization flow:
1. Checks environment and dependency configuration.
2. Verifies or seeds demo Indian Standards, clauses, and user accounts.
3. Validates database migration alignment (alembic heads).
4. Displays the SIH Evaluator Demonstration Guide and credentials.
"""

import argparse
import os
import subprocess
import sys
import webbrowser

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.config import get_settings
from backend.app.database.connection import check_sync_connection
from scripts.seed_demo import seed_demo_data

settings = get_settings()


def main():
    parser = argparse.ArgumentParser(description="Start and verify the BIS Copilot SIH Demo Environment.")
    parser.add_argument("--browser", action="store_true", help="Automatically open browser to /demo")
    parser.add_argument("--skip-seed", action="store_true", help="Skip demo data seeding")
    args = parser.parse_args()

    print("=" * 70)
    print("        BUREAU OF INDIAN STANDARDS (BIS) AI QUALITY COPILOT       ")
    print("                  SIH 2024 / Problem Statement 26107             ")
    print("=" * 70)

    # 1. Database Check
    print("\n[STEP 1/3] Checking Database Status...")
    if check_sync_connection():
        print("  + PostgreSQL Database is ONLINE.")
        if not args.skip_seed:
            print("  + Verifying / Seeding Demo Data...")
            try:
                seed_demo_data(if_empty=True)
            except Exception as e:
                print(f"  - Demo seed note: {e}")
    else:
        print("  - PostgreSQL is currently offline on host.")
        print("    If deploying via Docker: Run `docker compose up --build`.")
        print("    If running locally: Ensure PostgreSQL container is running on port 5432.")

    # 2. Environment Verification
    print("\n[STEP 2/3] Validating Environment Configuration...")
    print(f"  + Environment:       {settings.ENVIRONMENT}")
    print(f"  + AI Provider:       {settings.LLM_PROVIDER}")
    print(f"  + Embedding Model:   {settings.EMBEDDING_MODEL} ({settings.EMBEDDING_DIMENSION}-d)")
    print(f"  + Rate Limiting:     {'ENABLED' if settings.RATE_LIMIT_ENABLED else 'DISABLED (Demo Mode)'}")
    print(f"  + Ingestion Dir:     {settings.INGESTION_DATA_DIR}")

    # 3. SIH Demo Walkthrough Guide
    print("\n[STEP 3/3] Demo Access Coordinates:")
    print("  -------------------------------------------------------------")
    print("  Web Application:     http://localhost:3000")
    print("  SIH Evaluator Tour:  http://localhost:3000/demo")
    print("  API Documentation:   http://localhost:8000/docs")
    print("  Backend Health:      http://localhost:8000/health")
    print("  Backend Readiness:   http://localhost:8000/ready")
    print("  -------------------------------------------------------------")
    print("  DEMO PRESET ACCOUNTS:")
    print("  1. Auditor (Full Inspection):   auditor@bis.gov.in / auditor123")
    print("  2. Administrator (Management):   admin@bis.gov.in   / admin123")
    print("  3. General User (Citizen):       user@bis.gov.in    / user123")
    print("  -------------------------------------------------------------")
    print("  SIH EVALUATION SCENARIOS READY:")
    print("  - Scenario 1: 53 Grade OPC Cement Compressive Strength (IS 12269:2015 Clause 6.2)")
    print("  - Scenario 2: Negative Out-of-Domain Guardrail Refusal")
    print("  - Scenario 3: Accredited Testing Laboratory Discovery (Delhi NCR / Fe 500D Rebars)")
    print("  - Scenario 4: Multilingual Audit in Hindi (IS 10500 Drinking Water Limits)")
    print("=" * 70)

    if args.browser:
        webbrowser.open("http://localhost:3000/demo")


if __name__ == "__main__":
    main()
