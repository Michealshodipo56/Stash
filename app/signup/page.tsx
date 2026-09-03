"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { useAuth } from "@/app/context/AuthContext";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phoneOrEmail) return;

    setLoading(true);
    setTimeout(() => {
      signup(fullName, phoneOrEmail);
      setLoading(false);
      // Immediately forward to KYC onboarding
      router.push(`/onboarding?redirect=${encodeURIComponent(redirectPath)}`);
    }, 500);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-block mb-4">
          <Logo className="text-3xl justify-center" />
        </Link>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Create your Aidex account
        </h2>
        <p className="mt-2 text-sm text-muted">
          Start individual or group savings goals with automatic payout rails.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 shadow-card rounded-2xl border border-line space-y-6 sm:px-10">
          <div className="rounded-xl bg-surface-2 p-3.5 space-y-1.5 text-xs text-muted">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              <span>Step 1 of 2: Account Creation</span>
            </div>
            <p className="text-[11px]">
              After creating your credentials, you will complete a quick Tier-1 verification (BVN/NIN + bank linking) to enable goal payouts.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Full Name (Official / As on ID)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tolu Adeyemi"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Phone Number or Email
              </label>
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="+234 801 234 5678 or user@email.com"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !fullName || !phoneOrEmail}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-500 text-ink py-3 text-sm font-bold hover:bg-brand-400 disabled:opacity-40 transition-colors shadow-sm"
            >
              <span>{loading ? "Creating account..." : "Continue to Verification"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link
              href={redirectPath !== "/dashboard" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login"}
              className="font-bold text-ink underline hover:text-brand-600"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-faint">
          <Shield className="h-3.5 w-3.5 text-brand-600" />
          <span>Self-custodied savings rails powered by BMONI</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center text-sm text-muted">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
