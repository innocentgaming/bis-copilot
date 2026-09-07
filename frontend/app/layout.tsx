import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/components/common/Toast";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "BIS Copilot — AI Compliance Assistant for Indian Standards (SIH 26107)",
  description:
    "Authoritative, evidence-grounded AI Assistant platform for Bureau of Indian Standards (BIS) regulations, IS standards, testing laboratories, and conformity assessment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
