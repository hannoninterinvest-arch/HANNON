"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, logout } = useAuth();
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
      if (user.role !== "admin") {
        logout();
        setError(
          "Investor sign-in is no longer available. Please use the contact form.",
        );
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-navy-900 px-5 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 80% at 80% 0%, rgba(201,163,92,0.22) 0%, transparent 60%)" }}
      />
      <div className="grid-pattern pointer-events-none absolute inset-0" />
      <form
        onSubmit={onSubmit}
        className="card-shadow relative w-full max-w-md rounded-3xl bg-white p-7 sm:p-10"
      >
        <div className="eyebrow">Administration</div>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-navy-900">Sign in</h1>
        <p className="mt-2 text-sm text-muted-dark">
          Access is reserved for HANNON administrators.
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-[#f8e4e4] px-4 py-3 text-sm text-[#8a2a2a]">
            {error}
          </p>
        )}
        <label className="field-label mt-7">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />
        </label>
        <label className="field-label mt-5">
          Password
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
        </label>
        <button disabled={busy} className="btn btn-gold mt-7 w-full disabled:opacity-60">
          {busy ? "Signing in…" : "Enter console"}
        </button>
      </form>
    </main>
  );
}
