import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300">
      {/* Tricolor accent bar */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-amber-500" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-emerald-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
                IS
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-wide block">
                  BIS AI Assistant
                </span>
                <span className="text-xs text-amber-400 font-medium">
                  Bureau of Indian Standards Digital Copilot
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An intelligent, evidence-grounded compliance assistant for Indian Standards (IS),
              testing laboratories, certification schemes, and citizen consumer services.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Smart India Hackathon 2024 — Problem Statement 107</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/standards" className="hover:text-amber-400 transition-colors">
                  Know Your Standards
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-amber-400 transition-colors">
                  BIS Services Directory
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-amber-400 transition-colors">
                  Certification Schemes
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-amber-400 transition-colors">
                  Compliance Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Assistant & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/assistant" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  24x7 AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-amber-400 transition-colors">
                  Document AI Scanner
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-amber-400 transition-colors">
                  Application Tracking
                </Link>
              </li>
              <li>
                <Link href="/laboratories" className="hover:text-amber-400 transition-colors">
                  Testing Labs Finder
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.bis.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  BIS Official Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.manakonline.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  Manakonline Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.crsbis.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  CRS Electronics Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About the Platform
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Helpdesk & Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="max-w-2xl text-center md:text-left">
            <strong className="text-slate-400">Disclaimer:</strong> AI-generated guidance is advisory and designed for informational discovery. Official regulatory compliance must be verified against current Gazette notifications and standards from the Bureau of Indian Standards (www.bis.gov.in).
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <span>© 2026 BIS AI Copilot (SIH 107)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
