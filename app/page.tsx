"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  ArrowRight, Play, Shield, Users, Lock, Zap,
  Target, Calculator, Wallet, CheckCircle2,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { formatNaira } from "@/lib/utils";

/* ─── tiny animation helpers ─────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── mock phone data ─────────────────────────────────────── */
const PHONE_GOALS = [
  { name: "MacBook Air", emoji: "💻", saved: 345_600, target: 480_000, pct: 72, tag: "SOLO GOAL", tagColor: "brand" },
  { name: "Department Projector", emoji: "🎥", saved: 180_000, target: 300_000, pct: 60, tag: "GROUP GOAL", tagColor: "amber" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      {/* ── NAV ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-6">
          <Logo className="text-2xl" />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted">
            <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#groups" className="hover:text-ink transition-colors">For groups</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQs</a>
          </nav>
          <Link
            href="/dashboard"
            id="nav-start-btn"
            className="rounded-full bg-ink text-cream px-5 py-2.5 text-sm font-semibold hover:bg-ink-hover transition-colors shrink-0"
          >
            Start a goal
          </Link>
        </div>
      </header>

      <main>
        {/* ── HERO ───────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-10 grid md:grid-cols-2 gap-12 items-center overflow-hidden">
          {/* Blob bg */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 w-[520px] h-[520px] rounded-full opacity-40 -translate-y-1/4 translate-x-1/4"
            style={{ background: "radial-gradient(circle, #b8dd74 0%, transparent 70%)" }}
          />

          {/* Left */}
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl md:text-6xl font-bold text-ink leading-[1.08] tracking-tight"
            >
              Big things start{" "}
              <span className="relative">
                with{" "}
                <span className="text-brand-500 italic">small steps.</span>
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                  viewBox="0 0 220 12"
                  className="absolute -bottom-2 left-0 w-full"
                  fill="none"
                >
                  <path d="M2 9 Q55 2 110 8 Q165 14 218 5" stroke="#8cc63f" strokeWidth="3" strokeLinecap="round" />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-8 text-base text-muted leading-relaxed max-w-md"
            >
              Plan your goal, save on a schedule, and hit your target.
              Solo or with friends. No account needed to contribute.
              We keep it fair when plans change.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/dashboard"
                id="hero-start-btn"
                className="flex items-center gap-2 rounded-full bg-brand-500 text-ink px-6 py-3.5 text-sm font-bold hover:bg-brand-400 transition-colors shadow-md shadow-brand-200"
              >
                Start a goal <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                id="hero-how-btn"
                className="flex items-center gap-2 rounded-full border-2 border-ink/10 bg-surface text-ink px-6 py-3.5 text-sm font-semibold hover:border-ink/20 transition-colors"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink text-cream">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                How it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex items-center gap-3"
            >
              <div className="flex -space-x-2.5">
                {["#8cc63f","#f3c449","#ee6f57","#4a59a0","#6fa62f"].map((c, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: c + "33", borderColor: c }}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  >
                    <span style={{ color: c }}>
                      {["TF","KB","JO","AA","BM"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted leading-tight">
                Trusted by students<br />
                <span className="text-ink font-semibold">across Nigeria</span>
              </p>
            </motion.div>
          </div>

          {/* Right — phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex justify-center"
          >
            <PhoneMockup />
          </motion.div>
        </section>

        {/* ── TRUST BADGES ───────────────────────────────── */}
        <FadeUp>
          <section
            id="features"
            className="mx-auto max-w-6xl px-6 py-8"
          >
            <div className="rounded-2xl border border-line bg-surface grid sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line">
              {[
                { icon: <Shield className="h-6 w-6" />, title: "Secure & regulated", body: "Powered by BMONI\nNigeria's licensed rail." },
                { icon: <Users className="h-6 w-6" />, title: "No account needed", body: "Anyone can contribute\nwith a bank transfer." },
                { icon: <Lock className="h-6 w-6" />, title: "Fair when plans change", body: "Emergency refunds are\nsafe and proportional." },
                { icon: <Zap className="h-6 w-6" />, title: "Built for students", body: "Simple, transparent,\nand affordable." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex items-start gap-4 px-6 py-6">
                  <div className="rounded-xl bg-brand-50 p-2 text-brand-600 shrink-0">{icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="text-xs text-muted mt-1 whitespace-pre-line leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeUp>

        {/* ── HOW IT WORKS ───────────────────────────────── */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <FadeUp>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="font-display text-4xl font-bold text-ink">
              Your goal. Your plan. Your win.
            </h2>
          </FadeUp>

          <div className="mt-12 relative">
            {/* connector */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px border-t-2 border-dashed border-line" aria-hidden />

            <div className="grid md:grid-cols-5 gap-8 md:gap-4">
              {[
                { n: 1, icon: <Target className="h-6 w-6" />, title: "Create your goal", body: "Tell us what you want, how much it costs, and your deadline.", color: "brand" },
                { n: 2, icon: <Calculator className="h-6 w-6" />, title: "Get your plan", body: "We calculate how much you need to save daily, weekly, or monthly.", color: "amber" },
                { n: 3, icon: <Wallet className="h-6 w-6" />, title: "Start saving", body: "Fund it yourself or share your link. Anyone can contribute.", color: "brand" },
                { n: 4, icon: <Target className="h-6 w-6" />, title: "Hit your target", body: "We pay out to the admin (group goals) or to you (individual goals).", color: "amber" },
                { n: 5, icon: <CheckCircle2 className="h-6 w-6" />, title: "Need to change plan?", body: "Get group approval and refunds are shared fairly, based on contributions.", color: "coral" },
              ].map(({ n, icon, title, body, color }, i) => (
                <FadeUp key={n} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    <div className={`relative z-10 rounded-2xl p-3 mb-4 ${
                      color === "brand" ? "bg-brand-100 text-brand-600" :
                      color === "amber" ? "bg-amber-100 text-amber-500" :
                      "bg-coral-100 text-coral-500"
                    }`}>
                      {icon}
                      <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        color === "brand" ? "bg-brand-500 text-ink" :
                        color === "amber" ? "bg-amber-400 text-ink" :
                        "bg-coral-400 text-white"
                      }`}>{n}</span>
                    </div>
                    <p className="text-sm font-bold text-ink">{title}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{body}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── GROUP GOALS ────────────────────────────────── */}
        <section id="groups" className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl bg-surface border border-line overflow-hidden grid md:grid-cols-2 gap-0">
            {/* Left — demo card */}
            <FadeUp className="p-8 border-b md:border-b-0 md:border-r border-line space-y-4">
              <div className="rounded-2xl border border-line bg-cream p-5 shadow-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎥</span>
                  <p className="font-display font-semibold text-ink text-sm">Department Projector</p>
                  <span className="ml-auto text-xs font-medium text-brand-600 bg-brand-50 rounded-full px-2 py-0.5">Group goal</span>
                </div>
                <p className="text-xs text-muted mb-3">₦180,000 / ₦300,000</p>
                <div className="h-2 w-full rounded-full bg-line overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "60%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="flex -space-x-1.5">
                    {["#8cc63f","#f3c449","#ee6f57","#4a59a0"].map((c, i) => (
                      <div key={i} style={{ backgroundColor: c }} className="w-5 h-5 rounded-full border-2 border-surface" />
                    ))}
                  </div>
                  <span>8 contributors</span>
                </div>
              </div>

              {/* quorum mini card */}
              <div className="rounded-2xl border-2 border-coral-200 bg-coral-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-coral-500">🔒</span>
                  <p className="text-sm font-semibold text-ink">Emergency withdrawal</p>
                </div>
                <p className="text-xs text-muted mb-3">4 of 6 people have agreed</p>
                <div className="flex gap-1.5 mb-4">
                  {[true,true,true,true,false,false].map((yes, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${yes ? "bg-coral-400" : "bg-line"}`} />
                  ))}
                </div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Refund breakdown</p>
                {[
                  { name: "Amaka", amount: 45_000 },
                  { name: "Tolu (you)", amount: 37_500 },
                  { name: "Bayo", amount: 32_500 },
                  { name: "Chinedu", amount: 27_000 },
                ].map(({ name, amount }) => (
                  <div key={name} className="flex items-center justify-between py-1.5 border-b border-coral-100 last:border-0 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-coral-200" />
                      <span className="text-ink">{name}</span>
                    </div>
                    <span className="font-semibold tabular text-ink">{formatNaira(amount)}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Right — copy */}
            <FadeUp delay={0.15} className="p-8 flex flex-col justify-center">
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">Group Goals</p>
              <h2 className="font-display text-4xl font-bold text-ink leading-tight">
                Stronger together.<br />
                <span className="text-brand-500 italic">Fairer</span> together.
              </h2>
              <p className="text-muted text-sm mt-4 leading-relaxed max-w-sm">
                Pool money for shared goals with friends, classmates, or your department.
                Everyone contributes. Everyone has a say. If plans change, everyone gets
                their fair share back.
              </p>
              <Link
                href="/dashboard"
                id="group-goal-btn"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-6 py-3.5 text-sm font-bold hover:bg-ink-hover transition-colors self-start"
              >
                Create a group goal <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeUp>
          </div>
        </section>
      </main>

      {/* ── FOOTER CTA ─────────────────────────────────── */}
      <footer className="bg-ink text-cream">
        <div className="mx-auto max-w-6xl px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-2xl font-bold">
              We're building things <span className="text-brand-400 italic">worth it.</span>
            </p>
            <p className="text-cream/50 text-sm mt-1">
              Join thousands of students hitting their goals — one step at a time.
            </p>
          </div>
          <Link
            href="/dashboard"
            id="footer-start-btn"
            className="flex items-center gap-2 rounded-full bg-brand-500 text-ink px-6 py-3.5 text-sm font-bold hover:bg-brand-400 transition-colors shrink-0"
          >
            Start your first goal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="border-t border-white/10 mx-6 py-4 flex items-center justify-between text-xs text-cream/30">
          <Logo className="text-sm" />
          <span>Powered by BMONI Embedded · Learn2Earn Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Phone Mockup ─────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative w-[280px] md:w-[320px]">
      {/* Blob behind phone */}
      <div
        aria-hidden
        className="absolute inset-0 -m-8 rounded-full opacity-70 animate-[float_9s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #b8dd74 0%, transparent 65%)" }}
      />

      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] bg-ink border-4 border-ink shadow-[0_40px_80px_-10px_rgba(23,23,15,0.5)] overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 text-cream/60 text-[10px]">
          <span>9:41</span>
          <div className="w-20 h-4 rounded-full bg-ink absolute left-1/2 -translate-x-1/2 top-0" />
          <span>●●●</span>
        </div>

        {/* App content */}
        <div className="bg-cream px-4 pb-4 pt-3 min-h-[460px]">
          <p className="text-xs text-muted">Good morning, Tolu 👋</p>
          <div className="mt-3 rounded-xl bg-ink text-cream p-4 mb-4">
            <p className="text-[10px] text-cream/50 mb-1">Total saved across goals</p>
            <p className="font-display font-bold text-2xl tabular">₦345,600</p>
            <p className="text-brand-400 text-xs mt-1 font-semibold">Across 3 goals</p>
          </div>

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-ink">Your goals</p>
            <span className="text-[10px] text-brand-600 font-semibold">View all</span>
          </div>

          <div className="space-y-3">
            {PHONE_GOALS.map((g) => (
              <div key={g.name} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{g.name}</p>
                    <p className="text-[10px] text-muted tabular">
                      {formatNaira(g.saved)} / {formatNaira(g.target)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-muted">{g.pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.pct}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${g.tag.includes("GROUP") ? "bg-amber-400" : "bg-brand-500"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="bg-surface border-t border-line flex items-center justify-around py-3 px-4">
          {["🏠","🎯","➕","👥","👤"].map((icon, i) => (
            <div
              key={i}
              className={`text-base flex items-center justify-center w-8 h-8 rounded-full ${i === 2 ? "bg-brand-500 scale-110 shadow-md" : ""}`}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
