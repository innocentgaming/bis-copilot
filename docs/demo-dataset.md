# BIS Copilot Demonstration Dataset Specification

**Project**: Bureau of Indian Standards (BIS) AI Quality & Compliance Copilot  
**Smart India Hackathon (SIH)** — Problem Statement: 26107  
**Directory Location**: `data/raw/`  

---

## 1. Document Inventory & Provenance

The system utilizes official Indian Standards published by the Bureau of Indian Standards (BIS). All content reflects statutory criteria published in the official gazette and official BIS specifications.

| Document Filename | Standard Number | Title | Source Authority | Status | Used in Demo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `is_12269_2015.pdf` | **IS 12269:2015** | 53 Grade Ordinary Portland Cement — Specification (Fifth Revision) | Bureau of Indian Standards | Active | **Yes** (Cement Scenario) |
| `is_1786_2008.pdf` | **IS 1786:2008** | High Strength Deformed Steel Bars and Wires for Concrete Reinforcement | Bureau of Indian Standards | Active | **Yes** (TMT Scenario & Labs) |
| `is_10500_2012.pdf` | **IS 10500:2012** | Drinking Water — Specification (Second Revision) | Bureau of Indian Standards | Active | **Yes** (Water Quality & Hindi) |
| `is_9873_part1_2019.pdf` | **IS 9873 (Part 1):2019** | Safety of Toys — Part 1: Mechanical and Physical Properties | Bureau of Indian Standards | Active | **Yes** (Toy Safety Audit) |
| `sample_standard.pdf` | `IS 99999:2025` | Synthetic Standard Specification (Test Fixture) | Synthetic Test Fixture | Test Only | **No** (Unit Tests Only) |

---

## 2. Ingested Standards & Key Clauses

### 2.1 IS 12269:2015 — 53 Grade Ordinary Portland Cement
- **Domain**: Civil Engineering / Cement & Concrete
- **Key Clauses**:
  - **Clause 6.2 (Compressive Strength)**: 72±1h (3-day) $\ge 27\text{ MPa}$, 168±2h (7-day) $\ge 37\text{ MPa}$, 672±4h (28-day) $\ge 53\text{ MPa}$. Test temp: $27 \pm 2^\circ\text{C}$.
  - **Clause 5.1 (Chemical Requirements)**: Lime Saturation Factor (LSF) $0.80 - 1.02$; Insoluble residue $\le 5.0\%$; Magnesia ($\text{MgO}$) $\le 6.0\%$; $\text{SO}_3 \le 3.5\%$; Loss on Ignition $\le 4.0\%$.

### 2.2 IS 1786:2008 — High Strength Deformed Steel Bars (Fe 500D)
- **Domain**: Metallurgical Engineering / Concrete Reinforcement
- **Key Clauses**:
  - **Clause 8.1 (Mechanical Properties)**: Minimum 0.2% proof stress / yield stress $\ge 500.0\text{ N/mm}^2\text{ (MPa)}$; Minimum tensile strength $\ge 565.0\text{ N/mm}^2$; Elongation ($5.65\sqrt{A}$) $\ge 16.0\%$; Total elongation at maximum force ($A_g$) $\ge 5.0\%$.
  - **Clause 4.2 (Chemical Ladle Analysis)**: Carbon (C) max $0.25\%$; Sulfur (S) max $0.040\%$; Phosphorus (P) max $0.040\%$; Carbon Equivalent (CE) max $0.42\%$.

### 2.3 IS 10500:2012 — Drinking Water Specification
- **Domain**: Chemical & Environment / Public Health
- **Key Clauses**:
  - **Clause 4.1 / Table 1 (Physical & Chemical Parameters)**:
    - Total Dissolved Solids (TDS): Acceptable limit $500\text{ mg/l}$ (max permissible $2000\text{ mg/l}$ in absence of alternate source).
    - pH value: $6.5 - 8.5$ (No relaxation).
    - Turbidity: Acceptable limit $1\text{ NTU}$ (max permissible $5\text{ NTU}$).
    - Total Hardness (as $\text{CaCO}_3$): Acceptable limit $200\text{ mg/l}$ (max permissible $600\text{ mg/l}$).
    - Fluoride (as $\text{F}$): Acceptable limit $1.0\text{ mg/l}$ (max permissible $1.5\text{ mg/l}$).

### 2.4 IS 9873 (Part 1):2019 — Safety of Toys
- **Domain**: Consumer Products / Child Safety
- **Key Clauses**:
  - **Clause 4.4 (Small Parts & Choking Hazards)**: Prohibits detachable small parts fitting entirely within the $31.7\text{ mm}$ diameter $\times 57.1\text{ mm}$ depth cylinder for toys intended for children under 36 months.

---

## 3. Testing Laboratories Inventory

| Laboratory Name | Facility Code | City / State | Accreditation Scope | Test Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **National Test House (Northern Region)** | `NTH-NR-GZB` | Ghaziabad, Uttar Pradesh | NABL & BIS Recognized | IS 12269, IS 1786, Cement, Steel Rebars, Chemical & Mechanical testing |
| **Central Soil and Materials Research Station (CSMRS)** | `CSMRS-DELHI` | New Delhi, Delhi | NABL Accredited | IS 12269, Concrete Mortar Cubes, Compressive Testing |
| **Shriram Institute for Industrial Research** | `SIIR-DELHI` | Delhi, Delhi | NABL & BIS Recognized | IS 10500, Drinking Water Quality, TDS, Heavy Metals, Chemical analysis |
| **National Metallurgical Laboratory (CSIR-NML)** | `CSIR-NML-JSR` | Jamshedpur, Jharkhand | NABL Accredited | IS 1786, Fe 500D Tensile Stress, Elongation, Metallurgy |

---

## 4. Statutory Certification Schemes Inventory

| Scheme Code | Scheme Name | Statutory Authority | Mandatory Scope | Conformity Mark |
| :--- | :--- | :--- | :--- | :--- |
| **SCHEME-I** | Product Certification Scheme | BIS Act 2016, Section 13 | Cement, Structural Steel, Household Electricals | Standard ISI Mark |
| **SCHEME-II** | Management Systems Certification | ISO 9001 / ISO 14001 / ISO 45001 | Quality & Environmental Systems | BIS Quality Mark |
| **SCHEME-IV** | Foreign Manufacturers Certification Scheme (FMCS) | BIS Act 2016, Section 14 | Overseas factories exporting to India | ISI Mark for Export |
| **SCHEME-X** | Compulsory Registration Scheme (CRS) | MeitY & BIS Orders | Laptops, Mobile Phones, LED Lights | Self-declaration CRS Mark |

---

## 5. Ingestion & Reproducible Setup Commands

To ingest or re-ingest all authentic documents into a running database:
```bash
# Ingest single standard PDF
python scripts/ingest_document.py data/raw/is_12269_2015.pdf --force

# Ingest entire raw directory
python scripts/ingest_directory.py data/raw/ --force

# Run complete idempotent seeder
python scripts/seed_demo.py
```
