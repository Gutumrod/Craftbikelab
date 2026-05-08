"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/home-content";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0e0e0e]/60 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-8">
        <Link
          href="/"
          className="font-headline text-xl font-black italic uppercase tracking-tighter text-[#69daff] md:text-2xl"
        >
          CRAFTBIKELAB
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-headline uppercase tracking-tighter text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button type="button" className="text-white/70 transition-all duration-300 hover:text-[#69daff] active:scale-95" aria-label="shopping cart">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          </button>
          <button type="button" className="text-white/70 transition-all duration-300 hover:text-[#69daff] active:scale-95" aria-label="account">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="block text-white/70 transition-colors hover:text-[#69daff] md:hidden"
            aria-label="menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-b from-[#69daff]/10 to-transparent" />

      <div
        className={`mobile-menu bg-[#0e0e0e]/95 shadow-lg backdrop-blur-xl md:hidden border-t border-white/10 ${
          menuOpen ? "" : "hidden"
        }`}
      >
        <div className="flex flex-col gap-4 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 font-headline uppercase tracking-tighter text-white/80 transition-colors hover:text-[#69daff]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
