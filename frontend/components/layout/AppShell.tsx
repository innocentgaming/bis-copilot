"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "mr">("en");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          onMenuClick={() => setMobileNavOpen(true)}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950">
          <ErrorBoundary>
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
