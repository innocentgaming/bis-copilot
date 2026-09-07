export type UserRole = "user" | "auditor" | "admin";
export type PreferredLanguage = "en" | "hi" | "mr";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferred_language: PreferredLanguage;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
