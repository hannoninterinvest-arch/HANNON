"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#reach", label: "Global Reach" },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname.startsWith(href);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-[100] border-b transition-all duration-300 ${
        scrolled || open
          ? "border-gold-500/20 bg-navy-900/95 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "border-white/[0.06] bg-navy-900 backdrop-blur-md"
      }`}
    >
      <div
        className={`section-pad mx-auto flex max-w-wrap items-center justify-between transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-3.5"
        }`}
      >
        <Link href="/" className="group flex items-center gap-3" aria-label="HANNON - accueil">
          <div className="relative h-11 w-11 shrink-0 transition-transform duration-500 group-hover:scale-105">
            <Image
              src="https://res.cloudinary.com/dbzweuzla/image/upload/v1786402383/logoha_lpe5ct.webp"
              alt="HANNON logo"
              fill
              sizes="44px"
              className="object-contain"
            />
          </div>
          <div>
            <div className="font-serif text-[22px] font-bold leading-none tracking-[3px] text-white">
              HANNON
            </div>
            <div className="mt-1 hidden text-[8px] uppercase tracking-[2.5px] text-gold-400 min-[400px]:block sm:text-[8.5px]">
              International Investments Ltd
            </div>
          </div>
        </Link>

        <nav className="hidden lg:block" aria-label="Navigation principale">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href, pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group relative py-2 text-[11.5px] font-medium uppercase tracking-[1.8px] transition-colors duration-200 hover:text-gold-300 ${
                      active ? "text-gold-300" : "text-[#c7d1e0]"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gradient-to-r from-gold-500 to-gold-300 transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Link
                href="/admin"
                className="hidden rounded-full border border-gold-500/70 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[1.5px] text-gold-300 transition-colors hover:bg-gold-500 hover:text-navy-900 xl:inline-flex"
              >
                Admin console
              </Link>
              <button
                onClick={logout}
                className="hidden text-[10.5px] uppercase tracking-[1.5px] text-[#c7d1e0] hover:text-gold-400 xl:inline"
              >
                Sign out
              </button>
            </>
          )}
          <Link
            href="/contact"
            className="btn btn-gold hidden px-6 py-3 text-[11px] lg:inline-flex"
          >
            Contact
          </Link>
          <button
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] transition-colors hover:border-gold-500 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`absolute h-0.5 w-5 rounded bg-gold-300 transition-all duration-300 ${
                open ? "rotate-45" : "-translate-y-[6px]"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded bg-gold-300 transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded bg-gold-300 transition-all duration-300 ${
                open ? "-rotate-45" : "translate-y-[6px]"
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Menu mobile"
          className="anim-menu-in absolute inset-x-0 top-full h-[calc(100dvh-64px)] overflow-y-auto bg-navy-900/[0.98] backdrop-blur-xl lg:hidden"
        >
          <div className="section-pad mx-auto flex min-h-full max-w-wrap flex-col py-8">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link, i) => {
                const active = isActive(link.href, pathname);
                return (
                  <li
                    key={link.href}
                    className="anim-fade-up border-b border-white/[0.07]"
                    style={{ animationDelay: `${80 + i * 55}ms` }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between py-5 font-serif text-[28px] font-semibold transition-colors hover:text-gold-300 ${
                        active ? "text-gold-300" : "text-white"
                      }`}
                    >
                      {link.label}
                      <span aria-hidden className="text-base text-gold-500">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div
              className="anim-fade-up mt-8 flex flex-col gap-3"
              style={{ animationDelay: "420ms" }}
            >
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn btn-gold w-full"
              >
                Envoyer une proposition
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="btn btn-outline w-full"
                  >
                    Admin console
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="py-2 text-[11px] uppercase tracking-[1.5px] text-muted hover:text-gold-400"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>

            <div className="mt-auto pt-10 text-[12px] font-light leading-relaxed text-muted">
              <a href="mailto:contact@hannoninterinvest.com" className="block hover:text-gold-400">
                contact@hannoninterinvest.com
              </a>
              <a href="tel:+21656147900" className="mt-1 block hover:text-gold-400">
                +216 56 147 900
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
