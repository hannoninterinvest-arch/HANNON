"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvestorDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/contact");
  }, [router]);

  return (
    <main className="bg-ivory px-6 py-20 text-center text-sm text-muted-dark">
      Redirection vers le formulaire de contact…
    </main>
  );
}
