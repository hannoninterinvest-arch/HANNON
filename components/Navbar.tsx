"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#reach", label: "Global Reach" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const portalHref = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-[100] border-b border-white/[0.06] bg-navy-900/[0.92] backdrop-blur-md">
      <div className="mx-auto flex max-w-wrap items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
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
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex gap-[28px]">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/projects"
                  ? pathname.startsWith("/projects")
                  : link.href === "/"
                    ? pathname === "/"
                    : false;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`border-b pb-1 text-[11.5px] font-medium uppercase tracking-[1.5px] text-[#c7d1e0] transition-colors duration-200 hover:border-gold-500 hover:text-gold-400 ${
                      active ? "border-gold-500 text-gold-400" : "border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={portalHref}
                className="hidden rounded-[2px] border border-gold-500 px-4 py-2.5 text-[10.5px] tracking-[1.5px] text-gold-400 transition-colors hover:bg-gold-500 hover:text-navy-900 sm:inline-flex"
              >
                {user.role === "admin" ? "Admin console" : "Investor portal"}
              </Link>
              <button
                onClick={logout}
                className="hidden text-[10.5px] uppercase tracking-[1.5px] text-[#c7d1e0] hover:text-gold-400 sm:inline"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-[10.5px] uppercase tracking-[1.5px] text-[#c7d1e0] hover:text-gold-400 sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-[2px] border border-gold-500 px-4 py-2.5 text-[10.5px] tracking-[1.5px] text-gold-400 transition-colors duration-200 hover:bg-gold-500 hover:text-navy-900"
              >
                Become an investor
              </Link>
            </>
          )}
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

      {open && (
        <nav className="absolute left-0 right-0 top-full bg-navy-800 px-10 py-5 lg:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-[11.5px] font-medium uppercase tracking-[1.5px] text-[#c7d1e0] hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={user ? portalHref : "/login"}
                onClick={() => setOpen(false)}
                className="text-[11.5px] font-medium uppercase tracking-[1.5px] text-gold-400"
              >
                {user ? "Portal" : "Sign in"}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
