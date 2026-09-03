"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { useAuth } from "@/app/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { login, loginAsDemo } = useAuth();

  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneOrEmail) return;

    setLoading(true);
    setTimeout(() => {
      login(phoneOrEmail);
      setLoading(false);
      router.push(redirectPath);
    }, 500);
  }

  function handleDemoLogin() {
    setLoading(true);
    setTimeout(() => {
      loginAsDemo();
      setLoading(false);
      router.push(redirectPath);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-block mb-4">
          <Logo className="text-3xl justify-center" />
        </Link>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Log in to your account
        </h2>
        <p className="mt-2 text-sm text-muted">
          Manage your savings goals, payouts, and track group contributions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 shadow-card rounded-2xl border border-line space-y-6 sm:px-10">
          {/* Quick Demo Login Option */}
          <div className="rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/60 p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-ink">
              <Zap className="h-4 w-4 text-brand-600 fill-brand-500" />
              <span>Fast Testing / Demo Access</span>
            </div>
            <p className="text-[11px] text-muted">
              Log in instantly as a pre-verified user (Tolu Adeyemi, Tier-1 KYC with GTBank linked).
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full mt-2 py-2 px-3 rounded-full bg-brand-500 hover:bg-brand-400 text-ink text-xs font-bold transition-all shadow-xs"
            >
              ⚡ Instant Demo Login
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-faint font-semibold">Or with credentials</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
              disabled={loading || !phoneOrEmail}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-ink text-cream py-3 text-sm font-semibold hover:bg-ink-hover disabled:opacity-40 transition-colors shadow-sm"
            >
              <span>{loading ? "Signing in..." : "Log in"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href={redirectPath !== "/dashboard" ? `/signup?redirect=${encodeURIComponent(redirectPath)}` : "/signup"}
              className="font-bold text-ink underline hover:text-brand-600"
            >
              Sign up
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center text-sm text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
