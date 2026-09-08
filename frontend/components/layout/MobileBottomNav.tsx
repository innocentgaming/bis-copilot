"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Bot,
  ShieldCheck,
  HelpCircle,
  User,
  Sparkles,
  BookOpen,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Ask AI", href: "/assistant", icon: Bot, isAi: true },
    { label: "Verify", href: "/product-verification", icon: ShieldCheck },
    { label: "Help", href: "/consumer-help", icon: HelpCircle },
    { label: "Dashboard", href: "/dashboard", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-3 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        if (item.isAi) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg transform active:scale-95 transition">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition ${
              isActive
                ? "text-blue-600 dark:text-blue-400 font-bold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
