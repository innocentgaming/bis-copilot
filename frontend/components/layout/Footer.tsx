import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, ExternalLink, Bot, CheckCircle2, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300">
      {/* Tricolor accent bar */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top brand header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center font-black text-white text-lg shadow-lg">
                BIS
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight block">
                  BIS AI – Intelligent Standards & Consumer Assistance
                </span>
                <span className="text-xs text-blue-400 font-medium">
                  Built to make Bureau of Indian Standards information simple, accessible & actionable.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>7,000+ Indian Standards Grounded</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800 text-xs text-blue-300">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>24x7 Multilingual AI</span>
            </div>
          </div>
        </div>

        {/* Multi-column navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 py-10 text-xs">
          {/* Col 1: Platform & AI */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              AI Assistant
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/assistant" className="hover:text-blue-400 transition flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Ask BIS AI (24x7)
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-blue-400 transition">
                  Document AI Scanner
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition">
                  Citizen Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Standards */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Standards
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/standards/search" className="hover:text-blue-400 transition">
                  Smart Standards Search
                </Link>
              </li>
              <li>
                <Link href="/standards" className="hover:text-blue-400 transition">
                  Know Your Standards
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-blue-400 transition">
                  Mandatory QCO Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: BIS Services */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              BIS Services
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/services" className="hover:text-blue-400 transition">
                  Services Directory
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-blue-400 transition">
                  Scheme-I (ISI Mark)
                </Link>
              </li>
              <li>
                <Link href="/services/compulsory-registration-scheme-crs" className="hover:text-blue-400 transition">
                  CRS Electronics
                </Link>
              </li>
              <li>
                <Link href="/services/foreign-manufacturers-certification-scheme-fmcs" className="hover:text-blue-400 transition">
                  FMCS Foreign Scheme
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hallmarking */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Hallmarking
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/hallmarking" className="hover:text-blue-400 transition font-medium text-amber-400">
                  Verify HUID Code
                </Link>
              </li>
              <li>
                <Link href="/hallmarking" className="hover:text-blue-400 transition">
                  Gold & Silver Purity
                </Link>
              </li>
              <li>
                <Link href="/hallmarking" className="hover:text-blue-400 transition">
                  Assaying Centers (AHCs)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Consumer & Complaints */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Consumer Help
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/consumer-help" className="hover:text-blue-400 transition">
                  Consumer Help Center
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="hover:text-blue-400 transition text-rose-400 font-medium">
                  File Quality Complaint
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-blue-400 transition">
                  Track Grievance Status
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 6: Official Portals */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Official Portals
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="https://www.bis.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition flex items-center gap-1"
                >
                  BIS Official Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.manakonline.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition flex items-center gap-1"
                >
                  Manakonline Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.crsbis.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 transition flex items-center gap-1"
                >
                  CRS Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition">
                  About BIS AI
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-blue-400 transition text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Security &amp; Privacy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition">
                  Helpdesk & Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Trust Note */}
        <div className="pt-8 border-t border-slate-800 space-y-3">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
              Important Trust & Safety Notice:
            </strong>
            AI-generated guidance. Verify critical information through official BIS channels before making regulatory, legal or financial decisions. Official standards, gazette notifications, and valid license databases can be accessed directly at{" "}
            <a href="https://www.bis.gov.in" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              www.bis.gov.in
            </a>
            .
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 pt-2">
            <span>© 2026 BIS AI – Intelligent Standards & Consumer Assistance. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-slate-300">About</Link>
              <Link href="/security" className="hover:text-slate-300 text-emerald-400">Security</Link>
              <Link href="/faq" className="hover:text-slate-300">FAQ</Link>
              <Link href="/contact" className="hover:text-slate-300">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
