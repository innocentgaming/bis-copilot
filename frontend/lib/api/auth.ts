import { apiClient } from "./client";
import { User, TokenResponse } from "@/types/auth";

export const authApi = {
  login(email: string, password: string): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>("/auth/login", { email, password });
  },

  register(payload: {
    name: string;
    email: string;
    password: string;
    preferred_language: string;
  }): Promise<User> {
    return apiClient.post<User>("/auth/register", payload);
  },

  getMe(): Promise<User> {
    return apiClient.get<User>("/auth/me");
  },

  refresh(refreshToken: string): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
  },
};
