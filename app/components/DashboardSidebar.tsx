"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Activity, CreditCard,
  Landmark, Settings, HelpCircle, ArrowRight, ChevronDown, UserCheck, LogOut
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { Avatar } from "@/app/components/Avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

const NAV_ITEMS = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard", href: "/dashboard" },
  { icon: <Activity className="h-4 w-4" />, label: "Activity", href: "/activity" },
  { icon: <CreditCard className="h-4 w-4" />, label: "Contributions", href: "/contributions" },
  { icon: <Landmark className="h-4 w-4" />, label: "Payouts", href: "/payouts" },
  { icon: <UserCheck className="h-4 w-4" />, label: "KYC & Verification", href: "/onboarding" },
  { icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line bg-surface sticky top-0 h-screen overflow-y-auto scroll-slim">
      <div className="p-5 border-b border-line">
        <Logo className="text-2xl" />
      </div>

      {/* User info */}
      <div className="p-4 border-b border-line">
        <div className="flex items-center gap-2.5 w-full rounded-xl px-2 py-2">
          <Avatar name={user?.name ?? "Guest"} color="#8CC63F" size="md" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-ink truncate">{user?.name ?? "Aidex User"}</p>
            <p className="text-xs text-brand-600 font-medium">
              {user?.isKycVerified ? "Verified ✓" : "Pending KYC"}
            </p>
          </div>
        </div>
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

      {/* Logout button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted hover:text-coral-600 hover:bg-coral-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>

      {/* Help footer */}
      <div className="p-4 border-t border-line">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors">
          <HelpCircle className="h-4 w-4" />
          <div>
            <p className="font-medium">Need help?</p>
            <p className="text-xs text-faint">We&apos;ve got you.</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </Link>
      </div>
    </aside>
  );
}
