"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import { NIGERIAN_BANKS } from "@/lib/banks";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { user, updateKycAndBank } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form inputs
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || user?.phoneOrEmail || "");
  const [ninBvn, setNinBvn] = useState(user?.ninBvn || "");
  const [bankName, setBankName] = useState(user?.bankAccount?.bankName || "Guaranty Trust Bank (GTBank)");
  const [accountNumber, setAccountNumber] = useState(user?.bankAccount?.accountNumber || "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync when user loads
  useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
    if ((user?.phone || user?.phoneOrEmail) && !phone) setPhone(user.phone || user.phoneOrEmail || "");
    if (user?.ninBvn && !ninBvn) setNinBvn(user.ninBvn);
    if (user?.bankAccount?.accountNumber && !accountNumber) setAccountNumber(user.bankAccount.accountNumber);
  }, [user]);

  async function handleSubmitKyc(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await updateKycAndBank({
      fullName,
      ninBvn,
      bankName,
      accountNumber,
      phone,
    });

    setLoading(false);

    if (res.success) {
      setStep(3);
    } else {
      setErrorMessage(res.error || "Failed to submit verification details");
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-sm border-b border-line">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted hover:text-ink transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Logo className="text-xl" />
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">BMONI Embedded Onboarding</span>
          <h1 className="font-display text-3xl font-bold text-ink mt-1">Get verified &amp; setup wallet</h1>
          <p className="text-muted text-sm mt-1">Complete your Tier-1 KYC to enable dedicated NGN Virtual Accounts and instant goal payouts.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between bg-surface border border-line rounded-xl p-3 text-xs">
          <div className={cn("flex items-center gap-2 font-semibold", step >= 1 ? "text-ink" : "text-faint")}>
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", step >= 1 ? "bg-brand-500 text-ink" : "bg-line text-faint")}>1</span>
            Basic Info
          </div>
          <div className="h-px w-8 bg-line" />
          <div className={cn("flex items-center gap-2 font-semibold", step >= 2 ? "text-ink" : "text-faint")}>
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", step >= 2 ? "bg-brand-500 text-ink" : "bg-line text-faint")}>2</span>
            Bank Offramp
          </div>
          <div className="h-px w-8 bg-line" />
          <div className={cn("flex items-center gap-2 font-semibold", step === 3 ? "text-ink" : "text-faint")}>
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", step === 3 ? "bg-brand-500 text-ink" : "bg-line text-faint")}>3</span>
            Confirmation
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <div className="rounded-card border border-line bg-surface p-6 space-y-4">
            <h2 className="font-display font-semibold text-ink text-base">1. Identity Verification</h2>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Full Name (Matches NIN/BVN)</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">NIN or BVN Number</label>
              <input
                type="text"
                maxLength={11}
                value={ninBvn}
                onChange={(e) => setNinBvn(e.target.value.replace(/\D/g, ""))}
                placeholder="11 digits"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <p className="text-[11px] text-faint mt-1">Required by CBN for NGN Virtual Account issuance.</p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!fullName || ninBvn.length < 11}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-full bg-ink text-cream py-3 text-sm font-semibold hover:bg-ink-hover disabled:opacity-40 transition-colors"
            >
              Continue to Bank Details <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleSubmitKyc} className="rounded-card border border-line bg-surface p-6 space-y-4">
            <h2 className="font-display font-semibold text-ink text-base">2. Payout Bank Account</h2>
            <p className="text-xs text-muted">Enter the Nigerian bank account where your goal target payouts will land.</p>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">Select your bank ({NIGERIAN_BANKS.length} banks available)...</option>
                <optgroup label="Popular Nigerian Banks">
                  <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                  <option value="OPay Digital Services (PayCom)">OPay Digital Services (PayCom)</option>
                  <option value="PalmPay">PalmPay</option>
                  <option value="Moniepoint Microfinance Bank">Moniepoint Microfinance Bank</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                </optgroup>
                <optgroup label="All Nigerian Commercial, Digital & Microfinance Banks (A - Z)">
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code + b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Account Number</label>
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="10 digit NUBAN"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-line py-3 text-sm font-semibold text-ink hover:bg-surface-2 transition-colors"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading || accountNumber.length < 10}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-500 text-ink py-3 text-sm font-semibold hover:bg-brand-400 disabled:opacity-40 transition-colors"
              >
                {loading ? "Verifying with BMONI..." : "Complete Setup 🚀"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3 Success */}
        {step === 3 && (
          <div className="rounded-card border-2 border-brand-300 bg-brand-50/50 p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500 text-ink flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Verification Completed!</h2>
              <p className="text-xs text-muted mt-1">Your payout bank account is linked, and your goal payout rails are ready.</p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-muted">Account Holder:</span>
                <span className="font-bold text-ink">{user?.name || fullName}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-muted">BMONI User ID:</span>
                <span className="font-bold text-ink">{user?.bmoniUserId || "Provisioning in progress"}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-muted">Payout Account:</span>
                <span className="font-bold text-ink">{bankName} ({accountNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">KYC Status:</span>
                <span className="font-bold text-emerald-700">Verified ✓</span>
              </div>
            </div>

            <button
              onClick={() => router.push(redirectPath)}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-ink text-cream py-3 text-sm font-semibold hover:bg-ink-hover transition-colors"
            >
              {redirectPath.includes("goals/new") ? "Proceed to Create Goal" : "Go to Dashboard"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center text-sm text-muted">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
