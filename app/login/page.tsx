"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-16">
      <form
        onSubmit={onSubmit}
        className="card-shadow w-full max-w-md rounded-[6px] bg-white p-8"
      >
        <div className="eyebrow">Investor access</div>
        <h1 className="mt-2 font-serif text-3xl text-navy-900">Sign in</h1>
        <p className="mt-2 text-sm text-muted-dark">
          Access HANNON project mandates, statistics and investment requests.
        </p>
        {error && (
          <p className="mt-4 rounded-[3px] bg-[#f8e4e4] px-3 py-2 text-sm text-[#8a2a2a]">
            {error}
          </p>
        )}
        <label className="mt-6 block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm text-navy-900 outline-none focus:border-gold-500"
          />
        </label>
        <label className="mt-4 block text-[11px] uppercase tracking-[1.5px] text-muted-dark">
          Password
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm text-navy-900 outline-none focus:border-gold-500"
          />
        </label>
        <button disabled={busy} className="btn btn-gold mt-6 w-full justify-center">
          {busy ? "Signing in…" : "Enter portal"}
        </button>
        <p className="mt-4 text-center text-sm text-muted-dark">
          No account yet?{" "}
          <Link href="/register" className="text-gold-500 hover:underline">
            Request access
          </Link>
        </p>
      </form>
    </main>
  );
}
