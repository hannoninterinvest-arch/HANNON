"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const res = await register(form);
      setSuccess(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-16">
      <form
        onSubmit={onSubmit}
        className="card-shadow w-full max-w-lg rounded-[6px] bg-white p-8"
      >
        <div className="eyebrow">Investor onboarding</div>
        <h1 className="mt-2 font-serif text-3xl text-navy-900">Create an account</h1>
        <p className="mt-2 text-sm text-muted-dark">
          Your profile is reviewed by HANNON before you can submit investment
          requests.
        </p>
        {error && (
          <p className="mt-4 rounded-[3px] bg-[#f8e4e4] px-3 py-2 text-sm text-[#8a2a2a]">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 rounded-[3px] bg-[#e5f2ea] px-3 py-2 text-sm text-[#1f6b3a]">
            {success} You may{" "}
            <Link href="/login" className="underline">
              sign in
            </Link>{" "}
            while approval is pending.
          </p>
        )}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["email", "Email"],
              ["password", "Password"],
              ["company", "Company"],
              ["phone", "Phone"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className={`text-[11px] uppercase tracking-[1.5px] text-muted-dark ${
                key === "company" || key === "phone" ? "sm:col-span-1" : ""
              }`}
            >
              {label}
              <input
                required={key !== "company" && key !== "phone"}
                type={
                  key === "password"
                    ? "password"
                    : key === "email"
                      ? "email"
                      : "text"
                }
                minLength={key === "password" ? 8 : undefined}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1.5 w-full rounded-[3px] border border-[#e4dfd4] px-3 py-2.5 text-sm normal-case tracking-normal text-navy-900 outline-none focus:border-gold-500"
              />
            </label>
          ))}
        </div>
        <button disabled={busy || !!success} className="btn btn-gold mt-6 w-full justify-center">
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        <p className="mt-4 text-center text-sm text-muted-dark">
          Already registered?{" "}
          <Link href="/login" className="text-gold-500 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
