"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  Play,
  Shield,
  ShieldCheck,
  Users,
  Lock,
  Zap,
  Target,
  Calculator,
  Wallet,
  CheckCircle2,
  Bell,
  Plus,
  ChevronLeft,
  Share2,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";

/* ─── Avatar photos & helper ─────────────────────────────── */
const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
];

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
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#17170F] font-sans selection:bg-[#d0e8a4] selection:text-[#17170F] overflow-x-hidden">
      {/* ── HEADER / NAVIGATION ────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FBF9F4]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-3.5 flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0">
            <Logo className="text-2xl tracking-tight" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#4A4C42]">
            <a href="#how-it-works" className="hover:text-[#17170F] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#17170F] transition-colors">Features</a>
            <a href="#groups" className="hover:text-[#17170F] transition-colors">For groups</a>
            <a href="#security" className="hover:text-[#17170F] transition-colors">Security</a>
            <a href="#faqs" className="hover:text-[#17170F] transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs md:text-sm font-semibold text-[#17170F] hover:text-black px-3 py-1.5 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/goals/new"
              id="nav-start-btn"
              className="rounded-full bg-[#17170F] text-[#8CC63F] px-5 py-2 text-xs md:text-sm font-semibold hover:bg-black transition-all shrink-0 shadow-sm"
            >
              Start a goal
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-12 md:space-y-16">
        {/* ── HERO SECTION ─────────────────────────────── */}
        <section className="relative mx-auto max-w-7xl px-6 md:px-12 pt-0 sm:pt-1 pb-6 sm:pb-8 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-6 z-10 space-y-6 pt-0">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-[48px] sm:text-[60px] lg:text-[68px] font-extrabold text-[#17170F] leading-[1.04] tracking-tight"
                >
                  Big things start<br />
                  with{" "}
                  <span className="relative inline-block text-[#8CC63F]">
                    small steps.
                    {/* Hand-drawn curved doodle underline */}
                    <svg
                      viewBox="0 0 250 20"
                      className="absolute -bottom-2.5 left-0 w-full overflow-visible"
                      fill="none"
                    >
                      <path
                        d="M 4 12 Q 70 3, 140 9 T 244 5"
                        stroke="#8CC63F"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-5 text-[15px] sm:text-base text-[#595B52] leading-relaxed max-w-lg font-normal"
                >
                  Plan your goal, save on a schedule, and hit your target.
                  <br />
                  Solo or with friends. No account needed to contribute.
                  <br />
                  We keep it fair when plans change.
                </motion.p>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 pt-1"
              >
                <Link
                  href="/goals/new"
                  id="hero-start-btn"
                  className="inline-flex items-center gap-3 rounded-full bg-[#8CC63F] hover:bg-[#7db835] text-[#17170F] px-8 py-3.5 text-sm font-bold transition-all shadow-sm group"
                >
                  <span>Start a goal</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  id="hero-how-btn"
                  className="inline-flex items-center gap-3 rounded-full border border-[#E5E3D8] bg-white/90 hover:bg-white text-[#17170F] px-7 py-3.5 text-sm font-semibold transition-all shadow-2xs"
                >
                  <span>How it works</span>
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-[#17170F]/20 text-[#17170F]">
                    <Play className="h-2.5 w-2.5 fill-[#17170F] ml-0.5" />
                  </span>
                </a>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="pt-2 flex items-center gap-4"
              >
                <div className="flex -space-x-2.5">
                  {AVATAR_PHOTOS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Student avatar"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-2xs"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[13px] text-[#595B52] leading-tight">
                    Trusted by students
                    <br />
                    <span className="text-[#17170F] font-bold">across Nigeria</span>
                  </p>
                  {/* Decorative green spring doodle */}
                  <svg
                    viewBox="0 0 65 24"
                    className="w-12 h-6 text-[#8CC63F]"
                    fill="none"
                  >
                    <path
                      d="M 2 16 C 15 28, 25 2, 35 15 C 45 28, 55 5, 62 10"
                      stroke="#8CC63F"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Right Column — Dual Phone Mockups & Organic Green Backdrop */}
            <div className="lg:col-span-6 relative flex items-center justify-center pt-2 lg:pt-0">
              {/* Organic Hand-Drawn Lime Green Backdrop Shape */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-[490px] sm:w-[580px] h-[540px] sm:h-[620px] -top-8 -right-4 sm:right-0 z-0 flex items-center justify-center select-none"
              >
                <svg
                  viewBox="0 0 560 620"
                  className="w-full h-full overflow-visible"
                  fill="none"
                >
                  {/* Multi-lobed green organic shape exactly matching design */}
                  <path
                    d="M 230 45 C 380 15, 515 75, 535 210 C 555 350, 525 485, 450 550 C 385 605, 290 580, 225 565 C 155 615, 80 575, 65 480 C 5 445, -5 325, 25 225 C 50 145, 115 70, 230 45 Z"
                    fill="#A2D84C"
                  />
                  {/* Distinctive white/light dashed sketch outline along left curve */}
                  <path
                    d="M 45 180 C 18 260, 20 370, 65 440"
                    stroke="rgba(255,255,255,0.75)"
                    strokeWidth="3.5"
                    strokeDasharray="8 7"
                    strokeLinecap="round"
                  />
                  {/* Bottom right decorative sketched accent */}
                  <path
                    d="M 465 520 C 490 545, 505 555, 525 540"
                    stroke="#80B527"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Phones Container */}
              <div className="relative w-full max-w-[500px] h-[600px] sm:h-[640px] flex items-center justify-center z-10">
                {/* Back Phone (Right detail screen) */}
                <motion.div
                  initial={{ opacity: 0, x: 60, rotate: 9 }}
                  animate={{ opacity: 1, x: 0, rotate: 7 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 sm:right-3 top-10 z-10 w-[245px] sm:w-[265px] rounded-[44px] bg-[#11130E] p-2.5 shadow-2xl border-2 border-[#11130E]"
                >
                  <div className="rounded-[36px] bg-[#FCFBF8] overflow-hidden text-[#17170F] text-[11px] pb-3.5 select-none shadow-inner">
                    {/* Status Bar */}
                    <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[10px] font-semibold text-gray-500">
                      <span>9:41</span>
                      <div className="w-16 h-3.5 rounded-full bg-[#11130E] -mt-0.5" />
                      <div className="flex items-center gap-1 text-[8px]">●●●</div>
                    </div>

                    {/* Header */}
                    <div className="px-3.5 pt-1.5 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>MacBook Air</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" />
                    </div>

                    {/* Tabs */}
                    <div className="px-3.5 pt-1 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#E5F2D0] text-[#3E6C15] font-bold text-[10px]">
                        Overview
                      </span>
                      <span className="text-gray-400 text-[10px] font-medium px-2">Contributions</span>
                    </div>

                    {/* Amount & Progress */}
                    <div className="px-3.5 pt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="font-display font-extrabold text-[17px] tracking-tight">₦345,600</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                        <span>of ₦480,000</span>
                        <span className="font-bold text-[#8CC63F]">72%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-[#8CC63F] rounded-full w-[72%]" />
                      </div>
                    </div>

                    {/* Three Mini Metric Boxes */}
                    <div className="grid grid-cols-3 gap-1.5 px-3.5 pt-3">
                      <div className="bg-[#F4F3EE] p-2 rounded-xl text-center">
                        <p className="font-bold text-[10px]">₦7,077</p>
                        <p className="text-[8px] text-gray-500">per day</p>
                      </div>
                      <div className="bg-[#F4F3EE] p-2 rounded-xl text-center">
                        <p className="font-bold text-[10px]">19</p>
                        <p className="text-[8px] text-gray-500">days left</p>
                      </div>
                      <div className="bg-[#F4F3EE] p-2 rounded-xl text-center">
                        <p className="font-bold text-[9px]">12 Jun, 2026</p>
                        <p className="text-[8px] text-gray-500">deadline</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="px-3.5 pt-3">
                      <p className="text-[10px] font-bold text-gray-700 mb-1.5">Recent activity</p>
                      <div className="space-y-1.5">
                        {[
                          { name: "Amaka", time: "Just now", amount: "+₦5,000", tag: "Just now", img: AVATAR_PHOTOS[0] },
                          { name: "Bayo", time: "30 mins ago", amount: "+₦3,000", tag: "30 mins ago", img: AVATAR_PHOTOS[1] },
                          { name: "Chinedu", time: "2 hours ago", amount: "+₦2,000", tag: "2 hours ago", img: AVATAR_PHOTOS[2] },
                          { name: "You", time: "Yesterday", amount: "+₦7,000", tag: "Yesterday", img: AVATAR_PHOTOS[3] },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[9px] py-0.5">
                            <div className="flex items-center gap-1.5">
                              <img src={item.img} alt={item.name} className="w-5 h-5 rounded-full object-cover shadow-2xs" />
                              <div>
                                <p className="font-bold text-gray-800 leading-none">{item.name}</p>
                                <p className="text-gray-400 text-[8px]">{item.time}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#6fa62f]">{item.amount}</p>
                              <p className="text-gray-400 text-[7px]">{item.tag}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Money Button */}
                    <div className="px-3.5 pt-3">
                      <div className="w-full py-2 rounded-full bg-[#8CC63F] text-[#17170F] font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-xs">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add money</span>
                      </div>
                    </div>

                    {/* Home bar */}
                    <div className="w-20 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
                  </div>
                </motion.div>

                {/* Front Phone (Left dashboard screen) */}
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 sm:left-2 top-0 z-20 w-[265px] sm:w-[285px] rounded-[46px] bg-[#11130E] p-3 shadow-2xl border-2 border-[#11130E]"
                >
                  <div className="rounded-[38px] bg-[#FAF9F5] overflow-hidden text-[#17170F] select-none shadow-inner">
                    {/* Status Bar */}
                    <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[10px] font-semibold text-gray-600">
                      <span>9:41</span>
                      <div className="w-20 h-4 rounded-full bg-[#11130E] -mt-1" />
                      <Bell className="w-3.5 h-3.5 text-gray-600" />
                    </div>

                    <div className="px-4 pt-2 pb-3 space-y-3">
                      {/* Greeting */}
                      <p className="text-[11px] text-gray-500 font-medium">Good morning, Tolu 👋</p>

                      {/* Total Saved Card */}
                      <div className="rounded-2xl bg-white p-3 border border-[#EBE8DE] shadow-2xs">
                        <p className="text-[9px] text-gray-400 font-medium">Total saved across goals</p>
                        <p className="font-display font-extrabold text-xl text-[#17170F] tracking-tight mt-0.5">
                          ₦345,600
                        </p>
                        <p className="text-[9px] font-bold text-[#8CC63F] mt-0.5">Across 3 goals</p>
                      </div>

                      {/* Your Goals Header */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[11px] font-bold text-[#17170F]">Your goals</span>
                        <span className="text-[9px] font-bold text-[#8CC63F] cursor-pointer">View all</span>
                      </div>

                      {/* Goal Card 1: MacBook Air */}
                      <div className="rounded-2xl bg-white p-3 border border-[#EBE8DE] shadow-2xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-[11px] text-[#17170F]">MacBook Air</p>
                            <p className="font-extrabold text-[10px] text-[#17170F] mt-1">
                              ₦345,600 <span className="text-gray-400 font-normal">/ ₦480,000</span>
                            </p>
                          </div>
                          {/* Realistic Laptop graphic */}
                          <div className="w-12 h-8 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-gray-100 shadow-2xs">
                            <svg viewBox="0 0 48 32" className="w-full h-full" fill="none">
                              <rect x="6" y="2" width="36" height="23" rx="2.5" fill="#1C1E21" stroke="#A6ACB5" strokeWidth="1.5" />
                              <rect x="8" y="4" width="32" height="19" rx="1" fill="#4B77BE" />
                              <path d="M 12 18 Q 24 10, 36 15" stroke="#E26A6A" strokeWidth="3" fill="none" />
                              <path d="M 2 26 L 46 26 L 43 28 L 5 28 Z" fill="#D3D7DC" stroke="#A6ACB5" strokeWidth="1" />
                            </svg>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full bg-[#8CC63F] rounded-full w-[72%]" />
                          </div>
                          <span className="text-[9px] font-bold text-gray-500">72%</span>
                        </div>

                        {/* Sub stats */}
                        <div className="flex items-center justify-between text-[8px] text-gray-500 pt-1 border-t border-gray-50">
                          <div>
                            <span className="font-bold text-gray-800">₦7,077</span> / day
                            <p className="text-[7px] text-gray-400">Daily target</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-800">19 days left</span>
                            <p className="text-[7px] text-gray-400">Due 12 Jun, 2026</p>
                          </div>
                        </div>
                      </div>

                      {/* Goal Card 2: Department Projector */}
                      <div className="rounded-2xl bg-white p-3 border border-[#EBE8DE] shadow-2xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-[11px] text-[#17170F]">Department Projector</p>
                            <p className="font-extrabold text-[10px] text-[#17170F] mt-1">
                              ₦180,000 <span className="text-gray-400 font-normal">/ ₦300,000</span>
                            </p>
                          </div>
                          {/* Realistic Projector graphic */}
                          <div className="w-12 h-8 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-gray-100 shadow-2xs">
                            <svg viewBox="0 0 48 28" className="w-full h-full" fill="none">
                              <rect x="4" y="6" width="40" height="18" rx="3" fill="#EAECEE" stroke="#BDC3C7" strokeWidth="1.2" />
                              <circle cx="34" cy="15" r="5.5" fill="#2C3E50" stroke="#7F8C8D" strokeWidth="1.5" />
                              <circle cx="34" cy="15" r="2.5" fill="#3498DB" />
                              <rect x="8" y="10" width="16" height="2" rx="1" fill="#BDC3C7" />
                              <rect x="8" y="14" width="16" height="2" rx="1" fill="#BDC3C7" />
                              <rect x="8" y="18" width="10" height="2" rx="1" fill="#BDC3C7" />
                            </svg>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full bg-[#F3C449] rounded-full w-[60%]" />
                          </div>
                          <span className="text-[9px] font-bold text-gray-500">60%</span>
                        </div>

                        {/* Avatar stack */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[8px] text-gray-400">8 contributors</span>
                          <div className="flex -space-x-1.5 ml-auto">
                            {AVATAR_PHOTOS.slice(0, 3).map((src, idx) => (
                              <img key={idx} src={src} alt="user" className="w-4 h-4 rounded-full border border-white object-cover shadow-2xs" />
                            ))}
                            <span className="w-4 h-4 rounded-full bg-gray-200 text-[7px] flex items-center justify-center font-bold">
                              +3
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="bg-white border-t border-[#EBE8DE] px-4 py-2 flex items-center justify-between text-gray-400 text-[10px]">
                      <div className="flex flex-col items-center text-[#8CC63F]">
                        <span className="text-xs">🏠</span>
                        <span className="text-[8px] font-bold">Home</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs">🎯</span>
                        <span className="text-[8px]">Goals</span>
                      </div>
                      {/* Floating Add Button */}
                      <div className="w-8 h-8 rounded-full bg-[#8CC63F] text-[#17170F] flex items-center justify-center font-bold text-sm -mt-4 shadow-md border-2 border-white">
                        +
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs">👥</span>
                        <span className="text-[8px]">People</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs">👤</span>
                        <span className="text-[8px]">Profile</span>
                      </div>
                    </div>

                    {/* Home bar */}
                    <div className="w-20 h-1 bg-gray-300 rounded-full mx-auto my-1.5" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST & FEATURE BADGES BAR ───────────────── */}
        <section id="features" className="mx-auto max-w-7xl px-6 md:px-12 -mt-6 sm:-mt-10 mb-4 sm:mb-8">
          <FadeUp>
            <div className="rounded-[28px] border border-[#E7E5DC] bg-[#FAF8F3] grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5DC] shadow-2xs">
              {[
                {
                  icon: <ShieldCheck className="h-8 w-8 stroke-[1.3] text-[#17170F]" />,
                  title: "Secure & regulated",
                  body: "Powered by BMONI\nNigeria's licensed rail.",
                },
                {
                  icon: <Users className="h-8 w-8 stroke-[1.3] text-[#17170F]" />,
                  title: "No account needed",
                  body: "Anyone can contribute\nwith a bank transfer.",
                },
                {
                  icon: <Lock className="h-8 w-8 stroke-[1.3] text-[#17170F]" />,
                  title: "Fair when plans change",
                  body: "Emergency refunds are\nsafe and proportional.",
                },
                {
                  icon: <Zap className="h-8 w-8 stroke-[1.3] text-[#17170F]" />,
                  title: "Built for students",
                  body: "Simple, transparent,\nand affordable.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex items-center gap-4 px-6 py-5 lg:py-6">
                  <div className="shrink-0 text-[#17170F]">{icon}</div>
                  <div>
                    <p className="text-sm font-bold text-[#17170F] leading-tight">{title}</p>
                    <p className="text-xs text-[#595B52] mt-0.5 whitespace-pre-line leading-snug font-normal">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* ── HOW IT WORKS SECTION ─────────────────────── */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 md:px-12 py-8">
          <FadeUp>
            <p className="text-xs font-bold text-[#8CC63F] uppercase tracking-widest mb-2">
              HOW IT WORKS
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#17170F] tracking-tight">
              Your goal. Your plan. Your win.
            </h2>
          </FadeUp>

          <div className="mt-14 relative">
            {/* Dashed Connecting Line for Desktop */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-px border-t-2 border-dashed border-[#D5D4CA] z-0"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-5 relative z-10">
              {[
                {
                  step: 1,
                  badgeBg: "bg-[#8CC63F]",
                  circleBg: "bg-[#f3f8e8] text-[#8CC63F] border-2 border-[#e4f1cb]",
                  icon: (
                    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="20" cy="20" r="16" />
                      <circle cx="20" cy="20" r="10" strokeDasharray="3 3" />
                      <circle cx="20" cy="20" r="4" fill="currentColor" />
                    </svg>
                  ),
                  title: "Create your goal",
                  desc: "Tell us what you want, how much it costs, and your deadline.",
                },
                {
                  step: 2,
                  badgeBg: "bg-[#F3C449]",
                  circleBg: "bg-[#fdf7e7] text-[#F3C449] border-2 border-[#fbeecb]",
                  icon: (
                    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="10" y="8" width="20" height="24" rx="4" />
                      <rect x="14" y="12" width="12" height="4" rx="1" fill="currentColor" opacity="0.3" />
                      <circle cx="15" cy="21" r="1.5" fill="currentColor" />
                      <circle cx="20" cy="21" r="1.5" fill="currentColor" />
                      <circle cx="25" cy="21" r="1.5" fill="currentColor" />
                      <circle cx="15" cy="26" r="1.5" fill="currentColor" />
                      <circle cx="20" cy="26" r="1.5" fill="currentColor" />
                      <circle cx="25" cy="26" r="1.5" fill="currentColor" />
                    </svg>
                  ),
                  title: "Get your plan",
                  desc: "We calculate how much you need to save daily, weekly, or monthly.",
                },
                {
                  step: 3,
                  badgeBg: "bg-[#8CC63F]",
                  circleBg: "bg-[#f3f8e8] text-[#8CC63F] border-2 border-[#e4f1cb]",
                  icon: (
                    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="8" y="12" width="24" height="18" rx="3" />
                      <path d="M8 17 C 8 13, 12 11, 28 11" />
                      <circle cx="25" cy="21" r="2" fill="currentColor" />
                    </svg>
                  ),
                  title: "Start saving",
                  desc: "Fund it yourself or share your link. Anyone can contribute.",
                },
                {
                  step: 4,
                  badgeBg: "bg-[#EE6F57]",
                  circleBg: "bg-[#fef1ee] text-[#EE6F57] border-2 border-[#fadfd6]",
                  icon: (
                    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="16" cy="16" r="5" />
                      <path d="M9 28 C 9 24, 12 22, 16 22 C 20 22, 23 24, 23 28" />
                      <circle cx="26" cy="14" r="4" />
                      <path d="M23 25 C 24 23, 26 22, 29 22 C 32 22, 34 23, 34 26" />
                    </svg>
                  ),
                  title: "Hit your target",
                  desc: "We pay out to the admin (group goals) or to you (individual goals).",
                },
                {
                  step: 5,
                  badgeBg: "bg-[#8CC63F]",
                  circleBg: "bg-[#f3f8e8] text-[#8CC63F] border-2 border-[#e4f1cb]",
                  icon: (
                    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 7 L 23 11 L 28 10 L 29 15 L 34 17 L 32 22 L 35 26 L 31 29 L 31 34 L 26 33 L 23 37 L 20 34 L 17 37 L 14 33 L 9 34 L 9 29 L 5 26 L 8 22 L 6 17 L 11 15 L 12 10 L 17 11 Z" />
                      <path d="M15 20 L 18 23 L 25 16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: "Need to change plan?",
                  desc: "Get group approval and refunds are shared fairly, based on contributions.",
                },
              ].map(({ step, badgeBg, circleBg, icon, title, desc }, i) => (
                <FadeUp key={step} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    {/* Big circular icon with numbered pill */}
                    <div className="relative mb-5">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xs ${circleBg}`}>
                        {icon}
                      </div>
                      <span
                        className={`absolute -bottom-1 -left-1 w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs ${badgeBg}`}
                      >
                        {step}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-bold text-[#17170F] tracking-tight">{title}</h3>
                    <p className="text-xs text-[#595B52] mt-1.5 leading-relaxed max-w-[200px] font-normal">
                      {desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── GROUP GOALS SECTION ──────────────────────── */}
        <section id="groups" className="mx-auto max-w-7xl px-6 md:px-12 py-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Side: Floating Layered Demo Cards */}
            <div className="lg:col-span-6 relative flex items-center justify-center p-4">
              {/* Green Sparkle / Burst Doodles */}
              <div aria-hidden="true" className="absolute -top-4 left-6 text-[#8CC63F]">
                <svg viewBox="0 0 32 32" className="w-8 h-8" fill="currentColor">
                  <path d="M16 2 L17 12 L27 13 L18 18 L21 28 L14 21 L6 26 L11 17 L2 14 L12 11 Z" opacity="0.6" />
                </svg>
              </div>
              <div aria-hidden="true" className="absolute -bottom-4 right-10 text-[#8CC63F]">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="relative w-full max-w-[480px]">
                {/* Card 1: Department Projector (Base Card) */}
                <FadeUp className="relative z-10 w-[88%] sm:w-[82%] rounded-2xl border border-[#EBE8DE] bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#17170F]">Department Projector</span>
                  </div>
                  <p className="text-[10px] text-[#EE6F57] font-semibold mb-3">Group goal</p>

                  {/* Projector 3D visual */}
                  <div className="my-3 py-2 flex items-center justify-center bg-[#FAFAF7] rounded-xl">
                    <div className="text-4xl py-2">📽️</div>
                  </div>

                  {/* Amount & Progress */}
                  <div className="flex items-baseline justify-between mt-3 text-xs">
                    <span className="font-extrabold text-[#17170F]">₦180,000</span>
                    <span className="text-gray-400">/ ₦300,000</span>
                    <span className="font-bold text-gray-500 ml-auto">60%</span>
                  </div>

                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-[#F3C449] rounded-full w-[60%]" />
                  </div>

                  {/* Contributors */}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">8 contributors</span>
                    <div className="flex -space-x-2">
                      {AVATAR_PHOTOS.map((src, i) => (
                        <img key={i} src={src} alt="contributor" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      ))}
                      <span className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white text-[9px] flex items-center justify-center font-bold text-gray-600">
                        +3
                      </span>
                    </div>
                  </div>
                </FadeUp>

                {/* Card 2: Emergency Withdrawal (Overlapping Card on right) */}
                <FadeUp delay={0.2} className="absolute -right-2 sm:right-0 top-16 z-20 w-[68%] sm:w-[62%] rounded-2xl border border-[#EBE8DE] bg-white p-5 shadow-lift">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#17170F] mb-1">
                    <Lock className="w-3.5 h-3.5 text-[#EE6F57]" />
                    <span>Emergency withdrawal</span>
                  </div>
                  <p className="text-[10px] text-[#595B52] mb-2.5">4 of 6 people have agreed</p>

                  {/* Voting Dots */}
                  <div className="flex items-center gap-2 mb-4">
                    {[true, true, true, true, false, false].map((voted, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full ${voted ? "bg-[#2A9D8F]" : "bg-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Refund Breakdown */}
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Refund breakdown
                  </p>
                  <div className="space-y-2 text-[11px]">
                    {[
                      { name: "Amaka", amount: "₦45,000", img: AVATAR_PHOTOS[0] },
                      { name: "Tolu (you)", amount: "₦37,500", img: AVATAR_PHOTOS[1] },
                      { name: "Bayo", amount: "₦32,500", img: AVATAR_PHOTOS[2] },
                      { name: "Chinedu", amount: "₦27,000", img: AVATAR_PHOTOS[3] },
                    ].map(({ name, amount, img }, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                        <div className="flex items-center gap-2">
                          <img src={img} alt={name} className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-[#17170F] font-medium text-[11px]">{name}</span>
                        </div>
                        <span className="font-extrabold text-[#17170F] text-[11px]">{amount}</span>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </div>

            {/* Right Side: Copy & Celebratory Students Illustration */}
            <div className="lg:col-span-6 space-y-6">
              <FadeUp>
                <p className="text-xs font-bold text-[#8CC63F] uppercase tracking-widest mb-2">
                  GROUP GOALS
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#17170F] leading-tight tracking-tight">
                  Stronger together.<br />
                  <span className="text-[#8CC63F]">Fairer together.</span>
                </h2>
                <p className="text-[15px] text-[#595B52] leading-relaxed mt-4 max-w-lg font-normal">
                  Pool money for shared goals with friends, classmates, or your department.
                  Everyone contributes. Everyone has a say. If plans change, everyone gets
                  their fair share back.
                </p>

                <div className="pt-4">
                  <Link
                    href="/dashboard"
                    id="group-goal-btn"
                    className="inline-flex items-center gap-2 rounded-full bg-[#17170F] text-white px-7 py-3.5 text-sm font-bold hover:bg-black transition-all shadow-sm"
                  >
                    <span>Create a group goal</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Link>
                </div>
              </FadeUp>

              {/* Vector art illustration of celebratory Nigerian students */}
              <FadeUp delay={0.2} className="pt-4">
                <div className="relative w-full max-w-sm flex items-center justify-center">
                  <svg viewBox="0 0 340 180" className="w-full h-auto" fill="none">
                    {/* Sparkle burst above students */}
                    <g transform="translate(230, 20)">
                      <line x1="0" y1="-12" x2="0" y2="12" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="-12" y1="0" x2="12" y2="0" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="-8" y1="-8" x2="8" y2="8" stroke="#8CC63F" strokeWidth="2" strokeLinecap="round" />
                      <line x1="-8" y1="8" x2="8" y2="-8" stroke="#8CC63F" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* Student 1 (Yellow hoodie) */}
                    <g>
                      <circle cx="65" cy="85" r="16" fill="#6A381F" />
                      <path d="M 52 75 Q 65 65 78 75 Q 65 72 52 75 Z" fill="#17170F" />
                      {/* Body */}
                      <path d="M 40 160 L 50 108 Q 65 102 80 108 L 90 160 Z" fill="#F4C430" />
                      {/* Arm raised */}
                      <path d="M 80 115 L 105 95" stroke="#F4C430" strokeWidth="12" strokeLinecap="round" />
                      <circle cx="108" cy="92" r="6" fill="#6A381F" />
                    </g>

                    {/* Student 2 (White t-shirt) */}
                    <g>
                      <circle cx="130" cy="95" r="15" fill="#582C18" />
                      <path d="M 118 85 Q 130 76 142 85 Z" fill="#17170F" />
                      {/* Body */}
                      <path d="M 110 160 L 118 116 Q 130 112 142 116 L 150 160 Z" fill="#FFFFFF" stroke="#E0DFD5" strokeWidth="2" />
                      {/* Arm */}
                      <path d="M 118 122 L 105 100" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
                    </g>

                    {/* Student 3 (Guy with raised high five) */}
                    <g>
                      <circle cx="195" cy="85" r="16" fill="#6A381F" />
                      <path d="M 182 74 Q 195 66 208 74 Z" fill="#17170F" />
                      {/* Body */}
                      <path d="M 175 160 L 182 108 Q 195 104 208 108 L 215 160 Z" fill="#FFFFFF" stroke="#E0DFD5" strokeWidth="2" />
                      {/* Arm reaching to high five */}
                      <path d="M 204 112 L 225 50" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
                      <circle cx="228" cy="45" r="6" fill="#6A381F" />
                    </g>

                    {/* Student 4 (Girl in green top) */}
                    <g>
                      <circle cx="260" cy="92" r="15" fill="#4B2717" />
                      {/* Long hair */}
                      <path d="M 248 85 Q 260 75 272 85 L 274 120 L 246 120 Z" fill="#17170F" />
                      <circle cx="260" cy="92" r="14" fill="#4B2717" />
                      {/* Body */}
                      <path d="M 245 160 L 250 114 Q 260 110 270 114 L 275 160 Z" fill="#8CC63F" />
                      {/* Raised hands */}
                      <path d="M 252 118 L 236 75" stroke="#8CC63F" strokeWidth="10" strokeLinecap="round" />
                      <circle cx="234" cy="70" r="5" fill="#4B2717" />
                    </g>
                  </svg>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER CTA BANNER ──────────────────────────── */}
      <footer className="mt-16 bg-[#11130E] text-white relative overflow-hidden">
        {/* Subtle line-art sketch watermarks */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-10 flex items-center justify-between px-12">
          {/* Laptop sketch */}
          <svg viewBox="0 0 100 80" className="w-24 h-20 text-white stroke-current fill-none stroke-[1.5]">
            <rect x="20" y="15" width="60" height="40" rx="3" />
            <path d="M 10 60 L 90 60 L 80 65 L 20 65 Z" />
          </svg>
          {/* Pencil sketch */}
          <svg viewBox="0 0 80 80" className="w-16 h-16 text-white stroke-current fill-none stroke-[1.5]">
            <path d="M 20 60 L 60 20 L 68 28 L 28 68 Z" />
            <path d="M 20 60 L 15 65 L 28 68 Z" />
          </svg>
          {/* Graduation Cap sketch */}
          <svg viewBox="0 0 100 80" className="w-24 h-20 text-white stroke-current fill-none stroke-[1.5]">
            <polygon points="50,15 90,35 50,55 10,35" />
            <path d="M 25 43 L 25 60 Q 50 72 75 60 L 75 43" />
            <path d="M 90 35 L 90 55" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              We're building things{" "}
              <span className="relative inline-block text-[#8CC63F] italic font-serif">
                worth it.
                {/* Underline scribble */}
                <svg viewBox="0 0 120 12" className="absolute -bottom-2 left-0 w-full" fill="none">
                  <path d="M 2 8 Q 30 2, 60 7 T 118 4" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mt-3 font-normal">
              Join thousands of students hitting their goals — one step at a time.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            <Link
              href="/dashboard"
              id="footer-start-btn"
              className="inline-flex items-center gap-2 rounded-full bg-[#8CC63F] text-[#17170F] px-7 py-3.5 text-sm font-bold hover:bg-[#7db835] transition-all shadow-md"
            >
              <span>Start your first goal</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>
            <p className="text-[11px] text-white/40 font-normal">It's free to start.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

