import Link from "next/link";

export type Crumb = { name: string; href: string };

export default function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[2px] text-gold-400">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex min-w-0 items-center gap-2">
              {last ? (
                <span aria-current="page" className="max-w-[60vw] truncate text-white/70 sm:max-w-none">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="transition-colors hover:text-gold-300">
                    {item.name}
                  </Link>
                  <span aria-hidden className="text-white/30">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
