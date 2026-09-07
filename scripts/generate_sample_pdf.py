"""Generate synthetic BIS Standard PDF fixtures for automated testing and demonstrations."""

import os
import pymupdf as fitz


def generate_sample_standard_pdf(output_path: str = "data/samples/sample_standard.pdf") -> str:
    """Generate a realistic 3-page synthetic Indian Standard PDF with clauses, tables, and annexes.

    IMPORTANT:
    Contains only synthetic development sample content — not copyrighted BIS text.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = fitz.open()

    # ----------------------------------------------------
    # Page 1: Cover & Title & Scope & Terminology
    # ----------------------------------------------------
    page1 = doc.new_page()
    rect1 = fitz.Rect(50, 50, 545, 792)

    page1_text = """BUREAU OF INDIAN STANDARDS

IS 99999:2025

INDIAN STANDARD
SPECIFICATION FOR DOMESTIC ELECTRIC TOASTERS
(FIRST REVISION)

Adopted 15 January 2025

1 SCOPE
1.1 This standard specifies safety, performance, and construction requirements for electric toasters intended for domestic and similar use, operating on single-phase AC supply not exceeding 250 V.

2 TERMINOLOGY
2.1 Rated Voltage
The voltage assigned to the appliance by the manufacturer for normal operation.

2.2 Rated Power Input
The electrical wattage consumed by the heating elements during steady-state toasting.
"""
    page1.insert_textbox(rect1, page1_text, fontsize=11, fontname="helv")

    # ----------------------------------------------------
    # Page 2: Requirements & Testing & Table
    # ----------------------------------------------------
    page2 = doc.new_page()
    rect2 = fitz.Rect(50, 50, 545, 792)

    page2_text = """BUREAU OF INDIAN STANDARDS
IS 99999:2025

3 GENERAL REQUIREMENTS
3.1 General Construction
Appliances shall be constructed to ensure personal safety during normal operation, surge conditions, and accidental tipping.
All external parts shall be free from sharp edges.

4 TESTING REQUIREMENTS
4.1 Electric Strength Test
The insulation of the heating element shall withstand an AC voltage of 1500 V for 60 seconds without electrical flashover or puncture.

4.2 Temperature Rise Limits
When tested at rated voltage for 5 consecutive toasting cycles, accessible surface temperatures shall not exceed the following limits:

TABLE:
Component | Maximum Temp Rise | Test Clause
Handle / Knob | 30 K | Clause 4.2
Metallic Surface | 60 K | Clause 4.2
Plastic Enclosure | 65 K | Clause 4.2
Power Cord Outer Sheath | 35 K | Clause 4.2
"""
    page2.insert_textbox(rect2, page2_text, fontsize=11, fontname="helv")

    # ----------------------------------------------------
    # Page 3: Annex A & Sub-clauses
    # ----------------------------------------------------
    page3 = doc.new_page()
    rect3 = fitz.Rect(50, 50, 545, 792)

    page3_text = """BUREAU OF INDIAN STANDARDS
IS 99999:2025

Annex A (Normative) Sampling and Conformity Assessment

A.1 Lot Inspection
A collection of toasters of identical design and rating manufactured in one production batch shall constitute a lot.

A.2 Acceptance Criteria
From each lot, a minimum of 5 samples shall be drawn at random and subjected to the electric strength test specified in Clause 4.1.
If zero samples fail, the lot conforms to the standard.
"""
    page3.insert_textbox(rect3, page3_text, fontsize=11, fontname="helv")

    doc.save(output_path)
    doc.close()
    return output_path


if __name__ == "__main__":
    path = generate_sample_standard_pdf()
    print(f"Sample standard PDF generated at: {path}")
