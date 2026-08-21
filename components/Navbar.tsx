"use client";

import { useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "#home", label: "Home", active: true },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#reach", label: "Global Reach" },
  { href: "#leadership", label: "Leadership" },
  { href: "#insights", label: "Insights" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/[0.06] bg-navy-900/[0.92] backdrop-blur-md">
      <div className="mx-auto flex max-w-wrap items-center justify-between px-10 py-4">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0">
            <Image
              src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786402383/logoha_lpe5ct.webp"
              alt="HANNON logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="font-serif text-xl font-bold leading-none tracking-[2px] text-white">
              HANNON
            </div>
            <div className="mt-[3px] text-[8.5px] uppercase tracking-[2.5px] text-gold-400">
              INTERNATIONAL INVESTMENTS LTD
            </div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <ul className="flex gap-[34px]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`border-b pb-1 text-[11.5px] font-medium uppercase tracking-[1.5px] text-[#c7d1e0] transition-colors duration-200 hover:border-gold-500 hover:text-gold-400 ${
                    link.active ? "border-gold-500 text-gold-400" : "border-transparent"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-[22px]">
          <a
            href="#contact"
            className="rounded-[2px] border border-gold-500 px-5 py-2.5 text-[10.5px] tracking-[2px] text-gold-400 transition-colors duration-200 hover:bg-gold-500 hover:text-navy-900"
          >
            Contact Us
          </a>
          <div className="hidden items-center gap-1 text-[11px] tracking-wider text-[#c7d1e0] lg:flex">
            EN
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path
                d="M1 1L5 5L9 1"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </div>
          <button
            aria-label="Toggle menu"
            className="flex flex-col gap-[5px] lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="h-0.5 w-6 bg-gold-400" />
            <span className="h-0.5 w-6 bg-gold-400" />
            <span className="h-0.5 w-6 bg-gold-400" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="absolute left-0 right-0 top-full bg-navy-800 px-10 py-5 lg:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`text-[11.5px] font-medium uppercase tracking-[1.5px] text-[#c7d1e0] hover:text-gold-400 ${
                    link.active ? "text-gold-400" : ""
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}