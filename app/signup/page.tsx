"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { useAuth } from "@/app/context/AuthContext";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { signup, loginAsDemo } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  function handleDemoAccess() {
    setLoading(true);
    setTimeout(() => {
      loginAsDemo();
      setLoading(false);
      router.push(redirectPath);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#17170F] font-sans flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#d0e8a4] selection:text-[#17170F]">
      {/* ── MAIN CARD CONTAINER ────────────────────────── */}
      <div className="mx-auto w-full max-w-5xl bg-white rounded-[28px] sm:rounded-[36px] border border-[#ECEAE0] shadow-xl shadow-black/[0.03] overflow-hidden">
        <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#ECEAE0]">
          {/* ── LEFT COLUMN (Branding, Headline, Illustration, Trust Badge) ── */}
          <div className="md:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white relative">
            <div>
              {/* Logo */}
              <Link href="/" className="inline-block mb-6">
                <Logo className="text-2xl tracking-tight" />
              </Link>

              {/* Headline */}
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#17170F] leading-[1.1] tracking-tight">
                Create your<br />
                <span className="text-[#8CC63F]">Aidex</span> account
              </h1>

              {/* Subtitle */}
              <p className="mt-3 text-sm text-[#595B52] leading-relaxed max-w-sm font-normal">
                Start individual or group savings goals with automatic payout rails.
              </p>
            </div>

            {/* Illustration with green sun doodle */}
            <div className="relative my-6 sm:my-8 flex flex-col items-center justify-center">
              {/* Green Sun / Starburst Doodle */}
              <div aria-hidden="true" className="text-[#8CC63F] mb-1">
                <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
                  {/* Central circle */}
                  <circle cx="18" cy="18" r="4.5" stroke="#8CC63F" strokeWidth="2.5" />
                  {/* 8 rays */}
                  <line x1="18" y1="3" x2="18" y2="33" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 20" />
                  <line x1="3" y1="18" x2="33" y2="18" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 20" />
                  <line x1="7.5" y1="7.5" x2="28.5" y2="28.5" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 20" />
                  <line x1="7.5" y1="28.5" x2="28.5" y2="7.5" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 20" />
                </svg>
              </div>

              <img
                src="/images/pe2.webp"
                alt="Students collaborating on Aidex"
                className="w-full max-w-[320px] sm:max-w-[360px] h-auto object-contain select-none"
              />
            </div>

            {/* Bottom Trust Badge Card */}
            <div className="rounded-2xl bg-[#FBF9F4] border border-[#ECEAE0] p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full border-2 border-[#8CC63F]/40 bg-[#EEF8DA] flex items-center justify-center shrink-0 text-[#67A422]">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17170F] leading-snug">
                  Your money is safe with us
                </p>
                <p className="text-[11px] text-[#595B52] leading-snug mt-0.5 font-normal">
                  We use bank-level security to protect your data and funds.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (Step Banner, Registration Form, Login Link) ── */}
          <div className="md:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#FCFBF8] md:bg-white space-y-6">
            {/* Step 1 of 2 Banner Card */}
            <div className="rounded-2xl bg-[#FAF8F2] border border-[#EBE8DE] p-4 sm:p-5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-[13px] text-[#17170F]">
                <CheckCircle2 className="h-4 w-4 text-[#8CC63F] stroke-[2.5]" />
                <span>Step 1 of 2: Account Creation</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#595B52] leading-relaxed font-normal">
                After creating your credentials, you will complete a quick Tier-1 verification (BVN/NIN + bank linking) to enable goal payouts.
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                  Full Name (Official / As on ID)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tolu Adeyemi"
                  className="w-full rounded-2xl border border-[#E2DFD2] bg-white px-4 py-3 sm:py-3.5 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="+234 801 234 5678 or user@email.com"
                  className="w-full rounded-2xl border border-[#E2DFD2] bg-white px-4 py-3 sm:py-3.5 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17170F] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#E2DFD2] bg-white px-4 py-3 sm:py-3.5 pr-11 text-sm text-[#17170F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !fullName || !phoneOrEmail}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#8CC63F] hover:bg-[#7db835] text-[#17170F] py-3.5 px-6 text-sm font-bold transition-all shadow-sm hover:shadow disabled:opacity-40"
                >
                  <span>{loading ? "Creating account..." : "Continue to Verification"}</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </form>

            {/* Bottom Link */}
            <div className="text-center text-xs text-[#595B52]">
              Already have an account?{" "}
              <Link
                href={redirectPath !== "/dashboard" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login"}
                className="font-bold text-[#8CC63F] hover:underline"
              >
                Log in
              </Link>
            </div>

            {/* Demo Fast Access Option */}
            <div className="pt-2 border-t border-[#ECEAE0]/60 flex items-center justify-between text-[11px] text-[#595B52]">
              <span>Testing the app?</span>
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={loading}
                className="inline-flex items-center gap-1 font-bold text-[#17170F] hover:text-[#8CC63F] transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-[#8CC63F] fill-[#8CC63F]" />
                <span>Instant Demo Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER RAIL NOTE ───────────────────────────── */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#7A7C73]">
        <Lock className="h-3.5 w-3.5 text-[#8CC63F]" />
        <span>Self-custodied savings rails powered by BMONI</span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F6F1] flex items-center justify-center text-sm text-[#595B52]">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
