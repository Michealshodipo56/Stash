"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { Avatar } from "@/app/components/Avatar";
import { USERS_MAP } from "@/lib/mock-data";
import { User, Wallet, Landmark, ShieldCheck, Check, Save } from "lucide-react";

export default function SettingsPage() {
  const user = USERS_MAP.get("u-tolu")!;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? "tolu@university.edu.ng");
  const [phone, setPhone] = useState(user.phone ?? "+234 801 234 5678");

  // Bank Offramp details
  const [bankName, setBankName] = useState(user.bankName ?? "GTBank");
  const [accountNumber, setAccountNumber] = useState(user.bankAccountNumber ?? "0123456789");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex min-h-screen bg-cream font-sans">
      <DashboardSidebar />

      <main className="flex-1 p-6 max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Settings &amp; Account</h1>
          <p className="text-sm text-muted">Manage your profile, payout bank account, and BMONI Smart Wallet.</p>
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
              <Avatar name={name} color={user.avatarColor} size="lg" />
              <div>
                <p className="font-semibold text-ink">{name}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Tier 1 Verified (NIN / BVN)
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
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
                  <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Kuda Bank">Kuda Microfinance Bank</option>
                  <option value="OPay">OPay Digital Services</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>

            <div className="rounded-xl bg-surface-2 p-3 text-xs text-muted flex items-center justify-between">
              <span>Account Name Verified: <strong>TOLUWALASE ADEYEMI</strong></span>
              <span className="text-brand-600 font-semibold">Match confirmed ✓</span>
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

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-line">
                <span className="text-muted">BMONI User ID:</span>
                <span className="text-ink font-semibold">{user.bmoniUserId ?? "bm_user_tolu01"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line">
                <span className="text-muted">Smart Wallet ID:</span>
                <span className="text-ink font-semibold">{user.smartWalletId ?? "sw_0x8f2a419"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted">On-Chain Wallet Address:</span>
                <span className="text-ink font-semibold truncate max-w-[240px]">
                  {user.walletAddress ?? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"}
                </span>
              </div>
            </div>
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
    </div>
  );
}
