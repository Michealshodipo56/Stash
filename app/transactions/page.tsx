"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronDown,
  Search,
  Loader2,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { Avatar } from "@/app/components/Avatar";
import { useAuth } from "@/app/context/AuthContext";
import { formatNaira, formatDate, cn } from "@/lib/utils";

interface Transaction {
  id: string;
  kind: "in" | "out";
  type: "contribution" | "completion_payout" | "emergency_refund";
  label: string;
  counterparty: string;
  goalId: string;
  goalTitle: string;
  goalEmoji: string;
  amount: number;
  reference?: string;
  status?: string;
  at: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/transactions");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await fetch(`/api/transactions?userId=${encodeURIComponent(user!.id)}`);
        const data = await res.json();
        if (data.success) {
          setTransactions(data.transactions || []);
          setSummary(data.summary || { totalIn: 0, totalOut: 0, count: 0 });
        }
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = transactions.filter((t) => {
    if (filter === "in" && t.kind !== "in") return false;
    if (filter === "out" && t.kind !== "out") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.goalTitle.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5FA618] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] font-sans text-[#17170F]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E9E8E0]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo className="text-xl" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#595B52]">
              <Link href="/dashboard" className="hover:text-[#17170F] transition">
                Dashboard
              </Link>
              <Link href="/dashboard" className="hover:text-[#17170F] transition">
                My Goals
              </Link>
              <Link
                href="/transactions"
                className="text-[#17170F] font-bold border-b-2 border-[#5FA618] pb-0.5"
              >
                Transactions
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/contributions"
              className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 cursor-pointer pl-2 border-l border-gray-200"
            >
              <Avatar name={user.name} color={user.avatarColor || "#5FA618"} size="sm" />
              <span className="text-xs font-bold text-[#17170F] hidden sm:inline">{user.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#17170F]">
            Transactions
          </h1>
          <p className="text-sm text-[#73756C] mt-1">
            Every deposit, payout, and refund across your Aidex goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#E9E8E0] bg-white p-4">
            <p className="text-[11px] font-semibold text-[#73756C] uppercase tracking-wide">Money in</p>
            <p className="text-xl font-black text-[#5FA618] mt-1 tabular">{formatNaira(summary.totalIn)}</p>
          </div>
          <div className="rounded-2xl border border-[#E9E8E0] bg-white p-4">
            <p className="text-[11px] font-semibold text-[#73756C] uppercase tracking-wide">Money out</p>
            <p className="text-xl font-black text-[#17170F] mt-1 tabular">{formatNaira(summary.totalOut)}</p>
          </div>
          <div className="rounded-2xl border border-[#E9E8E0] bg-white p-4">
            <p className="text-[11px] font-semibold text-[#73756C] uppercase tracking-wide">Total transactions</p>
            <p className="text-xl font-black text-[#17170F] mt-1 tabular">{summary.count}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(
              [
                ["all", "All"],
                ["in", "Deposits"],
                ["out", "Payouts & refunds"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === key
                    ? "bg-[#17170F] text-white"
                    : "bg-white border border-[#E9E8E0] text-[#73756C] hover:text-[#17170F]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goal, person, reference…"
              className="w-full sm:w-72 rounded-xl border border-[#E9E8E0] bg-white pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5FA618]"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-[#E9E8E0] bg-white overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-sm text-[#73756C]">
              <Loader2 className="w-6 h-6 text-[#5FA618] animate-spin" />
              Loading transactions…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-[#17170F]">No transactions yet</p>
              <p className="text-xs text-[#73756C]">
                Deposits and payouts will show up here once money moves.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex mt-3 text-xs font-bold text-[#5FA618] hover:underline"
              >
                Back to dashboard →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#F0EEE6]">
              {filtered.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/goals/${t.goalId}`}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-[#FAF9F5] transition-colors"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        t.kind === "in" ? "bg-[#F3F8EC] text-[#5FA618]" : "bg-[#F5F4EF] text-[#17170F]",
                      )}
                    >
                      {t.kind === "in" ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#17170F] truncate">{t.label}</p>
                        <span className="text-[10px] font-semibold text-[#73756C] bg-[#F5F4EF] px-1.5 py-0.5 rounded-full shrink-0">
                          {t.goalEmoji} {t.goalTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#73756C] mt-0.5 truncate">
                        {t.counterparty}
                        {t.reference ? ` · ${t.reference}` : ""}
                        {" · "}
                        {formatDate(t.at)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          "text-sm font-black tabular",
                          t.kind === "in" ? "text-[#5FA618]" : "text-[#17170F]",
                        )}
                      >
                        {t.kind === "in" ? "+" : "−"}
                        {formatNaira(t.amount)}
                      </p>
                      <p className="text-[10px] font-semibold text-[#73756C] capitalize mt-0.5">
                        {t.status || "completed"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
