"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Activity, CreditCard,
  Landmark, Settings, HelpCircle, ArrowRight, UserCheck, LogOut,
  Menu, X,
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

type MobileNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error("useMobileNav must be used within AppShell");
  }
  return ctx;
}

/** Hamburger that opens the mobile drawer — place in page headers. */
export function MobileNavButton({ className }: { className?: string }) {
  const { open, toggle } = useMobileNav();
  return (
    <button
      type="button"
      id="mobile-nav-toggle"
      aria-label={open ? "Close navigation" : "Open navigation"}
      aria-expanded={open}
      aria-controls="mobile-nav-drawer"
      onClick={toggle}
      className={cn(
        "md:hidden shrink-0 rounded-xl border border-line bg-surface p-2.5 text-ink hover:bg-brand-50 transition-colors",
        className
      )}
    >
      {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

function SidebarNav({
  onNavigate,
  idPrefix,
}: {
  onNavigate?: () => void;
  idPrefix: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    onNavigate?.();
    router.push("/login");
  }

  return (
    <>
      <div className="p-5 border-b border-line">
        <Logo className="text-2xl" />
      </div>

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

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              id={`${idPrefix}-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              onClick={onNavigate}
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

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted hover:text-coral-600 hover:bg-coral-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>

      <div className="p-4 border-t border-line">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <div>
            <p className="font-medium">Need help?</p>
            <p className="text-xs text-faint">We&apos;ve got you.</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </Link>
      </div>
    </>
  );
}

function SidebarChrome({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[60]",
          open ? "visible" : "invisible pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close navigation overlay"
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          id="mobile-nav-drawer"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-line bg-surface shadow-xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-end border-b border-line px-3 py-2">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto scroll-slim">
            <SidebarNav idPrefix="mobile-sidebar" onNavigate={() => setOpen(false)} />
          </div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line bg-surface sticky top-0 h-screen overflow-y-auto scroll-slim">
        <SidebarNav idPrefix="sidebar" />
      </aside>
    </>
  );
}

/** Shared app chrome: sidebar + mobile drawer context. */
export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <MobileNavContext.Provider value={{ open, setOpen, toggle }}>
      <div
        className={cn(
          "flex flex-col md:flex-row min-h-screen bg-cream font-sans",
          className
        )}
      >
        <SidebarChrome open={open} setOpen={setOpen} />
        {children}
      </div>
    </MobileNavContext.Provider>
  );
}
