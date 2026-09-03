"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Wallet, ArrowRight, CheckCircle2, Building2 } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { user, updateKycAndBank } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form inputs
  const [fullName, setFullName] = useState(user?.name || "Tolu Adeyemi");
  const [phone, setPhone] = useState(user?.phoneOrEmail || "+234 801 234 5678");
  const [ninBvn, setNinBvn] = useState(user?.ninBvn || "22334455667");
  const [bankName, setBankName] = useState(user?.bankAccount?.bankName || "GTBank");
  const [accountNumber, setAccountNumber] = useState(user?.bankAccount?.accountNumber || "0123456789");

  const [loading, setLoading] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{
    bmoniUserId: string;
    smartWalletId: string;
    walletAddress: string;
  } | null>(null);

  async function handleSubmitKyc(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const generatedWallet = {
      bmoniUserId: `bm_usr_${Math.random().toString(36).substring(2, 9)}`,
      smartWalletId: `sw_${Math.random().toString(36).substring(2, 9)}`,
      walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
    };

    setTimeout(() => {
      setLoading(false);
      setWalletDetails(generatedWallet);

      // Save to AuthContext
      updateKycAndBank({
        ninBvn,
        bankName,
        accountNumber,
        accountName: fullName,
        ...generatedWallet,
      });

      setStep(3);
    }, 1200);
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
            Smart Wallet
          </div>
        </div>

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
            <p className="text-xs text-muted">Enter the bank account where your savings target payouts will be sent.</p>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                <option value="Access Bank">Access Bank</option>
                <option value="Kuda Bank">Kuda Microfinance Bank</option>
                <option value="OPay">OPay Digital Services</option>
                <option value="Zenith Bank">Zenith Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Account Number</label>
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
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
                {loading ? "Creating BMONI Wallet..." : "Complete Setup 🚀"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3 Success */}
        {step === 3 && walletDetails && (
          <div className="rounded-card border-2 border-brand-300 bg-brand-50/50 p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500 text-ink flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-ink">BMONI Smart Wallet Ready!</h2>
              <p className="text-xs text-muted mt-1">Your non-custodial smart wallet has been created and linked to your NIN/BVN &amp; payout bank account.</p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-muted">BMONI User ID:</span>
                <span className="font-bold text-ink">{walletDetails.bmoniUserId}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-muted">Smart Wallet ID:</span>
                <span className="font-bold text-ink">{walletDetails.smartWalletId}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-muted">Payout Account:</span>
                <span className="font-bold text-ink">{bankName} ({accountNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Wallet Address:</span>
                <span className="font-bold text-ink truncate max-w-[180px]">{walletDetails.walletAddress}</span>
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
