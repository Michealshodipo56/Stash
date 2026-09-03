"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Activity, CreditCard,
  Landmark, Settings, HelpCircle, ArrowRight, ChevronDown, UserCheck
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { Avatar } from "@/app/components/Avatar";
import { USERS_MAP } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard", href: "/dashboard" },
  { icon: <Activity className="h-4 w-4" />, label: "Activity", href: "/activity" },
  { icon: <CreditCard className="h-4 w-4" />, label: "Contributions", href: "/contributions" },
  { icon: <Landmark className="h-4 w-4" />, label: "Payouts", href: "/payouts" },
  { icon: <UserCheck className="h-4 w-4" />, label: "Onboarding / KYC", href: "/onboarding" },
  { icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const owner = USERS_MAP.get("u-tolu");

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line bg-surface sticky top-0 h-screen overflow-y-auto scroll-slim">
      <div className="p-5 border-b border-line">
        <Logo className="text-2xl" />
      </div>

      {/* User info */}
      <div className="p-4 border-b border-line">
        <Link href="/settings" className="flex items-center gap-2.5 w-full hover:bg-surface-2 rounded-xl px-2 py-2 transition-colors group">
          <Avatar name={owner?.name ?? "Tolu A."} color={owner?.avatarColor} size="md" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-ink truncate">{owner?.name?.split(" ")[0]} A.</p>
            <p className="text-xs text-brand-600 font-medium">Verified User ✓</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-faint group-hover:text-muted transition-colors" />
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              id={`sidebar-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-ink border border-brand-200"
                  : "text-muted hover:text-ink hover:bg-surface-2"
              )}
            >
              <span className={active ? "text-brand-600" : ""}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Invite banner */}
      <div className="p-3">
        <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 relative overflow-hidden">
          <div aria-hidden className="absolute right-2 bottom-0 text-4xl opacity-20">👥</div>
          <p className="text-sm font-bold text-ink mb-1">Invite friends,<br />hit goals faster</p>
          <p className="text-xs text-muted mb-3 leading-snug">Share a payment link or account number.</p>
          <Link
            href="/dashboard"
            className="block text-center rounded-lg bg-ink text-cream text-xs font-semibold py-2 hover:bg-ink-hover transition-colors"
          >
            Invites &amp; links
          </Link>
        </div>
      </div>

      {/* Help footer */}
      <div className="p-4 border-t border-line">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors">
          <HelpCircle className="h-4 w-4" />
          <div>
            <p className="font-medium">Need help?</p>
            <p className="text-xs text-faint">We've got you.</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </Link>
      </div>
    </aside>
  );
}
