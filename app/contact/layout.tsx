import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact HANNON International Investments | Tunis, Tunisia",
  description:
    "Contact HANNON International Investments in Tunis to share an investment interest, submit a project proposal or ask a question. Email, phone and office address.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      {children}
    </>
  );
}
