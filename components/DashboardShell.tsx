"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/inquiries", label: "Propositions et questions" },
  { href: "/admin/investors", label: "Investors" },
  { href: "/admin/requests", label: "Requests" },
];

export default function DashboardShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(pathname.startsWith("/admin") ? "/login" : "/contact");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/contact");
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-dark">
        Loading secure workspace…
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto grid max-w-wrap grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[220px_1fr] lg:px-10">
        <aside className="card-shadow h-fit rounded-[6px] bg-navy-900 p-5 text-white">
          <div className="text-[10px] uppercase tracking-[2px] text-gold-400">
            Administrator
          </div>
          <div className="mt-2 font-serif text-xl">
            {user.firstName} {user.lastName}
          </div>
          <div className="mt-1 text-[12px] text-muted">{user.email}</div>
          <nav className="mt-6 flex flex-col gap-1">
            {adminNav.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[3px] px-3 py-2 text-[12px] uppercase tracking-[1.5px] ${
                    active
                      ? "bg-gold-500 text-navy-900"
                      : "text-[#c7d1e0] hover:bg-white/5 hover:text-gold-400"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-6 text-left text-[11px] uppercase tracking-[1.5px] text-muted hover:text-gold-400"
          >
            Sign out
          </button>
        </aside>
        <section>
          <h1 className="mb-6 font-serif text-3xl text-navy-900">{title}</h1>
          {children}
        </section>
      </div>
    </div>
  );
}
