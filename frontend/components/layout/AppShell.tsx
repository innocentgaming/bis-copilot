"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { IndianLanguageCode } from "@/types/bis_platform";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguageCode>("en");

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
        <main className="flex-1 overflow-y-auto flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950 pb-16 md:pb-0">
          <div className="p-4 md:p-8">
            <ErrorBoundary>
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </ErrorBoundary>
          </div>
          <Footer />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
