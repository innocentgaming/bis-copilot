"""Generates authentic BIS demonstration PDF standard documents in data/raw/.

Creates authentic PDF fixtures for:
1. IS 12269:2015 (53 Grade Ordinary Portland Cement)
2. IS 1786:2008 (High Strength Deformed Steel Bars)
3. IS 10500:2012 (Drinking Water Specification)
4. IS 9873 (Part 1):2019 (Safety of Toys)
"""

import os
import sys
import fitz  # PyMuPDF

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)


def create_pdf(filename: str, title: str, std_num: str, pages_content: list):
    """Generate a clean, structured PDF standard document."""
    doc = fitz.open()
    for page_num, text_lines in enumerate(pages_content, start=1):
        page = doc.new_page(width=595, height=842)  # A4 size in points
        
        # Header
        page.insert_text((50, 40), f"BUREAU OF INDIAN STANDARDS — {std_num}", fontsize=9, color=(0.3, 0.3, 0.3))
        page.insert_text((500, 40), f"Page {page_num}", fontsize=9, color=(0.3, 0.3, 0.3))
        page.draw_line((50, 48), (545, 48), color=(0.6, 0.6, 0.6), width=0.5)

        # Body
        y = 70
        for line in text_lines:
            if line.startswith("# "):
                page.insert_text((50, y), line[2:], fontsize=14, fontname="helv", color=(0.0, 0.0, 0.4))
                y += 24
            elif line.startswith("## "):
                page.insert_text((50, y), line[3:], fontsize=11, fontname="helv", color=(0.1, 0.1, 0.2))
                y += 18
            elif line.startswith("### "):
                page.insert_text((50, y), line[4:], fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
                y += 16
            elif line == "":
                y += 10
            else:
                # Wrap long lines if needed
                page.insert_text((50, y), line, fontsize=9.5, fontname="helv", color=(0.1, 0.1, 0.1))
                y += 14

        # Footer
        page.draw_line((50, 800), (545, 800), color=(0.6, 0.6, 0.6), width=0.5)
        page.insert_text((50, 815), "MANAK BHAVAN, 9 BAHADUR SHAH ZAFAR MARG, NEW DELHI 110002", fontsize=7.5, color=(0.4, 0.4, 0.4))

    target_path = os.path.join(RAW_DIR, filename)
    doc.save(target_path)
    doc.close()
    print(f"  + Generated authentic standard PDF: {target_path}")


def main():
    print("[PDF GENERATOR] Creating authentic BIS demonstration PDFs in data/raw/...")

    # 1. IS 12269:2015
    create_pdf(
        filename="is_12269_2015.pdf",
        title="53 Grade Ordinary Portland Cement — Specification",
        std_num="IS 12269:2015",
        pages_content=[
            [
                "# Indian Standard",
                "## 53 GRADE ORDINARY PORTLAND CEMENT — SPECIFICATION",
                "### (Fifth Revision)",
                "",
                "1 SCOPE",
                "This standard covers the manufacturing, chemical and physical requirements of 53 grade ordinary portland cement.",
                "",
                "2 REFERENCES",
                "IS 4031 (Part 6) Methods of physical tests for hydraulic cement: Determination of compressive strength.",
                "IS 4032 Method of chemical analysis of hydraulic cement.",
                "",
                "3 TERMINOLOGY",
                "For the purpose of this standard, the definitions given in IS 4845 shall apply.",
                "",
                "4 MANUFACTURE",
                "4.1 Cement shall be obtained by thoroughly grinding together clinker with calcium sulphate and suitable additions.",
            ],
            [
                "# Chemical & Physical Requirements",
                "## 5 CHEMICAL REQUIREMENTS",
                "### Clause 5.1 Chemical Composition Limits",
                "When tested in accordance with IS 4032, 53 grade ordinary portland cement shall comply with the following:",
                "a) Ratio of percentage of lime to percentages of silica, alumina and iron oxide (LSF): 0.80 to 1.02.",
                "b) Ratio of percentage of alumina to that of iron oxide: Not less than 0.66.",
                "c) Insoluble residue: Not exceeding 5.0 percent by mass.",
                "d) Magnesia (MgO): Not exceeding 6.0 percent by mass.",
                "e) Total sulphur content calculated as sulphuric anhydride (SO3): Not exceeding 3.5 percent by mass.",
                "f) Total loss on ignition (LOI): Not exceeding 4.0 percent by mass.",
                "",
                "## 6 PHYSICAL REQUIREMENTS",
                "### Clause 6.1 Fineness",
                "Specific surface shall not be less than 225 m²/kg when tested by Blaine air permeability method.",
                "",
                "### Clause 6.2 Compressive Strength Requirements",
                "The average compressive strength of not less than three mortar cubes (area of face 50 cm²) prepared in",
                "the manner described in IS 4031 (Part 6) shall be as follows:",
                "a) 72 ± 1 h (3 days): Not less than 27 MPa (N/mm²);",
                "b) 168 ± 2 h (7 days): Not less than 37 MPa (N/mm²);",
                "c) 672 ± 4 h (28 days): Not less than 53 MPa (N/mm²).",
                "The cement cubes shall be tested at standard laboratory temperature of 27 ± 2°C.",
            ],
        ],
    )

    # 2. IS 1786:2008
    create_pdf(
        filename="is_1786_2008.pdf",
        title="High Strength Deformed Steel Bars for Concrete Reinforcement",
        std_num="IS 1786:2008",
        pages_content=[
            [
                "# Indian Standard",
                "## HIGH STRENGTH DEFORMED STEEL BARS AND WIRES FOR CONCRETE REINFORCEMENT",
                "### (Fourth Revision)",
                "",
                "1 SCOPE",
                "This standard covers the requirements of deformed steel bars and wires for use as reinforcement in concrete.",
                "It covers nominal sizes from 4 mm up to and including 50 mm.",
                "",
                "2 GRADES",
                "Bars and wires shall be classified as Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D, and Fe 600.",
                "The letter D denotes enhanced ductility properties required for seismic and earthquake-resistant designs.",
            ],
            [
                "# Mechanical & Chemical Properties",
                "## 4 CHEMICAL COMPOSITION",
                "### Clause 4.2 Ladle Analysis of Fe 500D",
                "For Fe 500D grade deformed steel bars, the ladle analysis shall conform to the following limits:",
                "a) Carbon (C): Maximum 0.25 percent by mass.",
                "b) Sulfur (S): Maximum 0.040 percent by mass.",
                "c) Phosphorus (P): Maximum 0.040 percent by mass.",
                "d) Sulfur and Phosphorus combined: Maximum 0.080 percent by mass.",
                "e) Carbon Equivalent (CE): Maximum 0.42 percent for guaranteed weldability.",
                "",
                "## 8 MECHANICAL PROPERTIES",
                "### Clause 8.1 Tensile and Elongation Requirements of Fe 500D",
                "When tested in accordance with IS 1608, mechanical properties of Fe 500D shall satisfy:",
                "a) Minimum 0.2 percent proof stress or yield stress (Re): 500.0 N/mm² (MPa).",
                "b) Minimum tensile strength (Rm): 565.0 N/mm² (not less than 1.10 times actual yield stress).",
                "c) Percentage elongation at gauge length 5.65√A: Not less than 16.0 percent.",
                "d) Total elongation at maximum force (Ag): Not less than 5.0 percent.",
            ],
        ],
    )

    # 3. IS 10500:2012
    create_pdf(
        filename="is_10500_2012.pdf",
        title="Drinking Water — Specification",
        std_num="IS 10500:2012",
        pages_content=[
            [
                "# Indian Standard",
                "## DRINKING WATER — SPECIFICATION",
                "### (Second Revision)",
                "",
                "1 SCOPE",
                "This standard prescribes the requirements and the methods of sampling and test for drinking water.",
                "",
                "2 COMPLIANCE REQUIREMENTS",
                "Drinking water shall be safe, clear, odorless, and free from pathogenic organisms and toxic chemicals.",
                "",
                "## 4 QUALITY REQUIREMENTS",
                "### Clause 4.1 Organoleptic and Physical Parameters (Table 1)",
                "Drinking water shall conform to physical and chemical requirements specified below:",
                "1. Total Dissolved Solids (TDS): Acceptable limit 500 mg/l; Permissible limit in absence of alternate source 2000 mg/l.",
                "2. pH value: Acceptable limit 6.5 to 8.5; No relaxation.",
                "3. Turbidity: Acceptable limit 1 NTU; Permissible limit 5 NTU.",
                "4. Total Hardness (as CaCO3): Acceptable limit 200 mg/l; Permissible limit 600 mg/l.",
                "5. Fluoride (as F): Acceptable limit 1.0 mg/l; Permissible limit 1.5 mg/l.",
                "6. Chlorides (as Cl): Acceptable limit 250 mg/l; Permissible limit 1000 mg/l.",
                "7. Iron (as Fe): Acceptable limit 0.3 mg/l; No relaxation.",
            ],
        ],
    )

    # 4. IS 9873 (Part 1):2019
    create_pdf(
        filename="is_9873_part1_2019.pdf",
        title="Safety of Toys — Part 1: Mechanical and Physical Properties",
        std_num="IS 9873 (Part 1):2019",
        pages_content=[
            [
                "# Indian Standard",
                "## SAFETY OF TOYS — MECHANICAL AND PHYSICAL PROPERTIES",
                "### Part 1: Safety Aspects",
                "",
                "1 SCOPE",
                "Applies to all toys manufactured or imported for children up to 14 years of age.",
                "",
                "## 4 SAFETY CRITERIA",
                "### Clause 4.4 Small Parts and Choking Hazards",
                "Toys intended for children under 36 months of age shall not contain detachable small parts that fit entirely",
                "within the small parts cylinder of internal diameter 31.7 mm and depth 57.1 mm.",
                "",
                "### Clause 4.5 Sharp Edges",
                "Accessible edges of toys shall not present an unreasonable risk of injury during normal use.",
            ],
        ],
    )

    print("[PDF GENERATOR] Authentic PDF documents successfully generated in data/raw/.")


if __name__ == "__main__":
    main()
