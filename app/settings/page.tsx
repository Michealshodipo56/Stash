"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell, MobileNavButton } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { useAuth } from "@/app/context/AuthContext";
import { User, Wallet, Landmark, ShieldCheck, Check, Save, ArrowRight } from "lucide-react";
import { NIGERIAN_BANKS } from "@/lib/banks";

export default function SettingsPage() {
  const { user, updateKycAndBank, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("Guaranty Trust Bank (GTBank)");
  const [accountNumber, setAccountNumber] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      if (user.phoneOrEmail?.includes("@")) {
        setEmail(user.phoneOrEmail);
      } else {
        setPhone(user.phoneOrEmail || "");
      }
      if (user.bankAccount) {
        setBankName(user.bankAccount.bankName || "Guaranty Trust Bank (GTBank)");
        setAccountNumber(user.bankAccount.accountNumber || "");
      }
    }
  }, [user]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    updateKycAndBank({
      fullName: name || user.name,
      accountName: name || user.name,
      ninBvn: user.ninBvn || "22233344455",
      bankName,
      accountNumber,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm font-medium text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <AppShell>
      <main className="flex-1 p-6 max-w-4xl space-y-6">
        <div className="flex items-start gap-3">
          <MobileNavButton className="mt-0.5" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Settings &amp; Account</h1>
            <p className="text-sm text-muted">Manage your profile, payout bank account, and BMONI Smart Wallet.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-card border border-line bg-surface p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-ink text-base">Personal Information</h2>
                <p className="text-xs text-muted">Your identity as verified on Aidex</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar name={name || user.name} color="#8cc63f" size="lg" />
              <div>
                <p className="font-semibold text-ink">{name || user.name}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> {user.isKycVerified ? "Tier 1 Verified (NIN / BVN)" : "KYC Pending"}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  placeholder="+234 800 000 0000"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
          </div>

          {/* Payout Bank Account */}
          <div className="rounded-card border border-line bg-surface p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-ink text-base">Destination Payout Bank Account</h2>
                <p className="text-xs text-muted">Where your target payouts and emergency refunds will be automatically offramped.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Bank Name</label>
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
                <label className="block text-xs font-semibold text-ink mb-1.5">Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>

            <div className="rounded-xl bg-surface-2 p-3 text-xs text-muted flex items-center justify-between">
              <span>Account Name: <strong>{user.bankAccount?.accountName || name || user.name}</strong></span>
              <span className="text-brand-600 font-semibold">{user.isKycVerified ? "Verified ✓" : "Pending Verification"}</span>
            </div>
          </div>

          {/* BMONI Smart Wallet Metadata */}
          <div className="rounded-card border border-line bg-surface p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-ink text-base">BMONI Embedded Smart Wallet</h2>
                <p className="text-xs text-muted">Self-custodial non-custodial smart wallet managed via BMONI rails</p>
              </div>
            </div>

            {user.smartWalletId ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between py-1 border-b border-line">
                  <span className="text-muted">BMONI User ID:</span>
                  <span className="text-ink font-semibold">{user.bmoniUserId || "Pending BMONI Setup"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-line">
                  <span className="text-muted">Smart Wallet ID:</span>
                  <span className="text-ink font-semibold">{user.smartWalletId}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted">On-Chain Wallet Address:</span>
                  <span className="text-ink font-semibold truncate max-w-[240px]">
                    {user.walletAddress || "Pending generation"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-3 text-center">
                <p className="text-xs text-muted">Complete KYC onboarding to generate your non-custodial smart wallet.</p>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 mt-2 hover:underline"
                >
                  Verify Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-brand-500 text-ink px-6 py-3 text-sm font-semibold hover:bg-brand-400 transition-colors shadow-sm"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved Changes!" : "Save Account Settings"}
            </button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}
