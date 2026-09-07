export interface LaboratoryCapabilitySummary {
  id: string;
  standard_number: string;
  test_name?: string | null;
  parameter?: string | null;
  is_accredited: boolean;
}

export interface LaboratorySummary {
  id: string;
  name: string;
  code?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  is_active: boolean;
  capabilities_count: number;
}

export interface LaboratoryDetail extends LaboratorySummary {
  address?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  capabilities: LaboratoryCapabilitySummary[];
}

export interface CertificationSchemeSummary {
  id: string;
  scheme_name: string;
  code?: string | null;
  description?: string | null;
  is_active: boolean;
}

export interface CertificationSchemeDetail extends CertificationSchemeSummary {
  audit_frequency?: string | null;
  fee_structure?: string | null;
  applicable_standards_count: number;
}

export interface CertificationRequirementSummary {
  id: string;
  scheme_name: string;
  standard_number: string;
  requirement_type: string;
  description?: string | null;
  is_mandatory: boolean;
}
