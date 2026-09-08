"""BIS Frequently Asked Questions Service."""

from typing import List, Optional, Dict, Any

DEFAULT_FAQS = [
    {
        "id": "faq-1",
        "category": "ISI Mark & Certification",
        "question": "How do I apply for an ISI Mark licence for my manufacturing unit?",
        "answer": "To obtain an ISI Mark licence under Scheme-I of BIS (Conformity Assessment) Regulations, 2018, register on the Manakonline portal (www.manakonline.in), fill Form-1, upload required documentation (manufacturing machinery, QC testing equipment, calibration certificates, and factory layout), pay the ₹1,000 application fee, and host a BIS inspection team for factory verification and sample draw.",
        "related_standard": "IS 1293 / IS 10500",
        "source_url": "https://www.manakonline.in"
    },
    {
        "id": "faq-2",
        "category": "Compulsory Registration (CRS)",
        "question": "What is the difference between ISI Mark and Compulsory Registration Scheme (CRS)?",
        "answer": "ISI Mark (Scheme-I) requires factory audit, in-house testing facilities, and routine sample draws for domestic and foreign manufacturers. Compulsory Registration Scheme (CRS / Scheme-II) is a self-declaration scheme primarily for electronics, IT hardware, and solar devices based solely on test reports from BIS-recognized laboratories, without mandatory factory audit for grant.",
        "related_standard": "IS 13252 / IS 16046",
        "source_url": "https://www.crsbis.in"
    },
    {
        "id": "faq-3",
        "category": "Hallmarking",
        "question": "What is HUID and why is it mandatory on gold jewellery?",
        "answer": "Hallmark Unique Identification (HUID) is a 6-digit alphanumeric code laser-engraved on each piece of gold jewellery alongside the BIS hallmark logo and purity grade (e.g., 22K916, 18K750). It ensures complete traceability, prevents adulteration, and enables consumers to verify purity using the 'Verify HUID' feature on the BIS Care App.",
        "related_standard": "IS 1417:2016",
        "source_url": "https://www.bis.gov.in"
    },
    {
        "id": "faq-4",
        "category": "Foreign Manufacturers",
        "question": "Can foreign companies sell products in India without BIS certification?",
        "answer": "If the product is covered under a mandatory Quality Control Order (QCO) issued by the Government of India, foreign manufacturers must obtain a valid BIS licence under the Foreign Manufacturers Certification Scheme (FMCS) before exporting or selling goods in India. Selling non-certified mandatory goods attracts penal provisions under the BIS Act, 2016.",
        "related_standard": "FMCS Guidelines",
        "source_url": "https://www.bis.gov.in"
    },
    {
        "id": "faq-5",
        "category": "Consumer Rights",
        "question": "How can a consumer verify if an ISI mark on a purchased product is genuine?",
        "answer": "Consumers can check the 7 or 8-digit CML (Certification Marks Licence) number written underneath the ISI mark by using the 'Verify Licence Details' feature on the BIS Care Mobile App or web portal. The portal instantly displays the manufacturer name, brand, factory address, valid standards, and expiry date.",
        "related_standard": "BIS Care Portal",
        "source_url": "https://www.bis.gov.in"
    },
    {
        "id": "faq-6",
        "category": "Laboratories & Testing",
        "question": "What are the requirements for an independent laboratory to become BIS-recognized?",
        "answer": "Laboratories must hold valid NABL accreditation as per ISO/IEC 17025:2017 with specific Indian Standards included in their accredited scope, have qualified testing personnel, and apply online under the Laboratory Recognition Scheme (LRS) on the BIS LIMS portal.",
        "related_standard": "ISO/IEC 17025",
        "source_url": "https://www.bis.gov.in"
    },
    {
        "id": "faq-7",
        "category": "MSME Concessions",
        "question": "Are there fee concessions for Startups, Women Entrepreneurs, and Micro Enterprises?",
        "answer": "Yes. Under BIS promotional policies, eligible Micro Enterprises, Startups recognized by DPIIT, and Women-led enterprises receive a 50% concession on application and annual minimum marking fees under the Product Certification Scheme.",
        "related_standard": "MSME Policy 2022",
        "source_url": "https://www.bis.gov.in"
    },
    {
        "id": "faq-8",
        "category": "Quality Control Orders",
        "question": "What is a Quality Control Order (QCO)?",
        "answer": "A Quality Control Order (QCO) is a statutory order issued by line ministries (like DPIIT, Ministry of Steel, MeitY) under Section 16 of the BIS Act, 2016, making standard compliance and BIS certification mandatory for specific goods to ensure public health, safety, and consumer protection.",
        "related_standard": "BIS Act 2016",
        "source_url": "https://www.bis.gov.in"
    }
]


class FAQService:
    """Provides categorized search and listing over BIS FAQs."""

    @classmethod
    def list_faqs(cls, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Filter and search FAQs."""
        results = DEFAULT_FAQS
        if category and category.lower() != "all":
            results = [f for f in results if f["category"].lower() == category.lower()]
        if search:
            q = search.lower()
            results = [
                f for f in results
                if q in f["question"].lower() or q in f["answer"].lower() or q in f["category"].lower()
            ]
        return results
