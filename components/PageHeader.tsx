import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 120% at 85% 0%, rgba(201,163,92,0.22) 0%, transparent 60%), radial-gradient(50% 100% at 0% 100%, rgba(22,48,79,0.9) 0%, transparent 70%)",
        }}
      />
      <div className="grid-pattern pointer-events-none absolute inset-0" />
      <div className="section-pad relative mx-auto max-w-wrap py-14 sm:py-20">
        <div className="eyebrow anim-fade-up text-gold-400">{eyebrow}</div>
        <h1
          className="display anim-fade-up mt-4 max-w-3xl text-[38px] sm:text-5xl lg:text-[58px]"
          style={{ animationDelay: "100ms" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="anim-fade-up mt-5 max-w-2xl text-[15px] font-light leading-[1.8] text-muted sm:text-base"
            style={{ animationDelay: "200ms" }}
          >
            {description}
          </p>
        )}
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
    </section>
  );
}
