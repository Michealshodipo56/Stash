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
    <div className="min-h-screen text-[#17170F] font-sans selection:bg-[#d0e8a4] selection:text-[#17170F] overflow-x-hidden">
      {/* ── TOP SECTION WRAPPER (#FAF9F5) ──────────────── */}
      <div className="bg-[#FAF9F5] relative">
        {/* ── HEADER / NAVIGATION ────────────────────────── */}
        <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 md:px-12 py-4 flex items-center justify-between gap-6">
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

        <main className="space-y-10 md:space-y-12">
          {/* ── HERO SECTION ─────────────────────────────── */}
          <section className="relative mx-auto max-w-7xl px-6 md:px-12 pt-3 sm:pt-6 pb-4 sm:pb-6 overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-6 z-10 space-y-6 pt-1 sm:pt-3">
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
                      Trusted across Nigeria
                      <br />
                      <span className="text-[#17170F] font-bold">for every goal</span>
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
          <section id="features" className="mx-auto max-w-7xl px-6 md:px-12 pb-10">
            <FadeUp>
              <div className="rounded-[28px] border border-[#E7E5DC] bg-[#FAF8F3] grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5DC] shadow-2xs">
                {[
                  {
                    icon: (
                      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#17170F] fill-none stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 16 3 L 6 7.5 V 15 C 6 21.5 10.3 27.5 16 29 C 21.7 27.5 26 21.5 26 15 V 7.5 L 16 3 Z" />
                        <path d="M 11.5 15.5 L 14.5 18.5 L 20.5 12.5" />
                      </svg>
                    ),
                    title: "Secure & regulated",
                    body: "Powered by BMONI\nNigeria's licensed rail.",
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#17170F] fill-none stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="11" r="4.5" />
                        <path d="M 4.5 24.5 C 4.5 20.5 8 18 12 18 C 16 18 19.5 20.5 19.5 24.5" />
                        <circle cx="22" cy="10" r="3.5" />
                        <path d="M 19.5 17.5 C 21 17 23 17 25 18.5 C 27 19.8 27.5 22 27.5 24.5" />
                      </svg>
                    ),
                    title: "No account needed",
                    body: "Anyone can contribute\nwith a bank transfer.",
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#17170F] fill-none stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="7" y="13" width="18" height="14" rx="3.5" />
                        <path d="M 11 13 V 9.5 C 11 6.5 13.2 4.5 16 4.5 C 18.8 4.5 21 6.5 21 9.5 V 13" />
                        <circle cx="16" cy="19.5" r="1.5" fill="#17170F" />
                        <path d="M 16 21 V 23.5" />
                      </svg>
                    ),
                    title: "Fair when plans change",
                    body: "Emergency refunds are\nsafe and proportional.",
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#17170F] fill-none stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="17,3 7,17 15,17 15,29 25,15 17,15" />
                      </svg>
                    ),
                    title: "Built for real goals",
                    body: "Simple, transparent,\nand automated.",
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
        </main>
      </div>

      {/* ── BOTTOM SECTION WRAPPER (#F5F2EA) ───────────── */}
      <div className="bg-[#F5F2EA] border-t border-[#ECEAE0] pt-14 pb-16 relative">
        <div className="space-y-16 md:space-y-20">
          {/* ── HOW IT WORKS SECTION ─────────────────────── */}
          <section id="how-it-works" className="mx-auto max-w-7xl px-6 md:px-12">
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
                className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-px border-t-2 border-dashed border-[#CFCEBF] z-0"
              />

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-5 relative z-10">
                {[
                  {
                    step: 1,
                    badgeBg: "bg-[#8CC63F]",
                    circleBg: "bg-[#f1f8e8] text-[#8CC63F] border-2 border-[#d9ecc1]",
                    icon: (
                      /* Target / Bullseye with arrow SVG */
                      <svg viewBox="0 0 44 44" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="20" cy="24" r="14" />
                        <circle cx="20" cy="24" r="8" strokeDasharray="3 2" />
                        <circle cx="20" cy="24" r="2.5" fill="currentColor" />
                        {/* Arrow striking center */}
                        <path d="M 36 8 L 22 22" stroke="#17170F" strokeWidth="2.4" />
                        <path d="M 33 6 L 38 7 L 37 12" stroke="#17170F" strokeWidth="2.4" />
                        <path d="M 30 14 L 34 10" stroke="#17170F" strokeWidth="1.8" />
                      </svg>
                    ),
                    title: "Create your goal",
                    desc: "Tell us what you want, how much it costs, and your deadline.",
                  },
                  {
                    step: 2,
                    badgeBg: "bg-[#F3C449]",
                    circleBg: "bg-[#fdf7e7] text-[#F3C449] border-2 border-[#f9e8be]",
                    icon: (
                      /* Pocket Calculator SVG */
                      <svg viewBox="0 0 44 44" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="11" y="8" width="22" height="28" rx="4" />
                        <rect x="15" y="12" width="14" height="6" rx="1.5" fill="currentColor" opacity="0.25" />
                        <circle cx="16" cy="23" r="1.5" fill="currentColor" />
                        <circle cx="22" cy="23" r="1.5" fill="currentColor" />
                        <circle cx="28" cy="23" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="28" r="1.5" fill="currentColor" />
                        <circle cx="22" cy="28" r="1.5" fill="currentColor" />
                        <circle cx="28" cy="28" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="32" r="1.5" fill="currentColor" />
                        <rect x="21" y="31.5" width="8" height="2" rx="1" fill="currentColor" />
                      </svg>
                    ),
                    title: "Get your plan",
                    desc: "We calculate how much you need to save daily, weekly, or monthly.",
                  },
                  {
                    step: 3,
                    badgeBg: "bg-[#8CC63F]",
                    circleBg: "bg-[#f1f8e8] text-[#8CC63F] border-2 border-[#d9ecc1]",
                    icon: (
                      /* Leather Wallet with Card SVG */
                      <svg viewBox="0 0 44 44" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="8" y="13" width="28" height="20" rx="3.5" />
                        <path d="M 12 13 V 10 C 12 8.5 13.5 7.5 15 7.5 H 32 C 33.5 7.5 35 8.5 35 10 V 13" />
                        <path d="M 26 19 H 36 V 27 H 26 C 24 27 24 19 26 19 Z" fill="currentColor" opacity="0.2" />
                        <circle cx="30" cy="23" r="1.8" fill="currentColor" />
                      </svg>
                    ),
                    title: "Start saving",
                    desc: "Fund it yourself or share your link. Anyone can contribute.",
                  },
                  {
                    step: 4,
                    badgeBg: "bg-[#EE6F57]",
                    circleBg: "bg-[#fef1ee] text-[#EE6F57] border-2 border-[#f7d6cd]",
                    icon: (
                      /* Target with Finish Flag / Trophy SVG */
                      <svg viewBox="0 0 44 44" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 12 36 V 8" strokeWidth="2.5" />
                        <path d="M 12 9 C 18 6, 22 13, 28 10 C 31 8.5, 33 9.5, 33 9.5 L 31 22 C 31 22, 28 20.5, 25 22 C 19 25, 15 18, 12 21" fill="currentColor" opacity="0.25" />
                        <circle cx="12" cy="8" r="2" fill="currentColor" />
                        <path d="M 8 36 H 18" strokeWidth="2.5" />
                      </svg>
                    ),
                    title: "Hit your target",
                    desc: "We pay out to the admin (group goals) or to you (individual goals).",
                  },
                  {
                    step: 5,
                    badgeBg: "bg-[#8CC63F]",
                    circleBg: "bg-[#f1f8e8] text-[#8CC63F] border-2 border-[#d9ecc1]",
                    hasSparkle: true,
                    icon: (
                      /* Rosette Ribbon Seal with Checkmark SVG */
                      <svg viewBox="0 0 44 44" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="22" cy="18" r="11" />
                        <path d="M 17 18 L 20.5 21.5 L 27 15" strokeWidth="2.4" />
                        <path d="M 16 28 L 13 37 L 20 33.5 L 22 36" />
                        <path d="M 28 28 L 31 37 L 24 33.5" />
                      </svg>
                    ),
                    title: "Need to change plan?",
                    desc: "Get group approval and refunds are shared fairly, based on contributions.",
                  },
                ].map(({ step, badgeBg, circleBg, hasSparkle, icon, title, desc }, i) => (
                  <FadeUp key={step} delay={i * 0.1}>
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                      {/* Big circular icon with numbered pill */}
                      <div className="relative mb-5">
                        {/* 3-Ray Green Sparkle Doodle above Step 5 */}
                        {hasSparkle && (
                          <div aria-hidden="true" className="absolute -top-4 -right-2 text-[#8CC63F]">
                            <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
                              <path d="M 6 18 L 2 6" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M 14 18 L 14 4" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M 22 18 L 26 6" stroke="#8CC63F" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}

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
          <section id="groups" className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Side: Floating Layered Demo Cards */}
              <div className="lg:col-span-6 relative flex items-center justify-center p-2 sm:p-4">
                {/* Green Doodle Rays above the cards */}
                <div aria-hidden="true" className="absolute -top-3 left-1/3 text-[#8CC63F]">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                    <path d="M 6 18 L 2 4" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 14 18 L 18 6" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="relative w-full max-w-[490px] min-h-[400px] flex items-center">
                  {/* Card 1: Department Projector (Base Tilted Card) */}
                  <FadeUp className="relative z-10 w-[78%] sm:w-[74%] rounded-[32px] border border-[#ECEAE2] bg-white p-6 shadow-xl -rotate-[4deg]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-[#17170F]">Department Projector</span>
                    </div>
                    <p className="text-[10px] text-[#EE6F57] font-semibold mb-3">Group goal</p>

                    {/* Projector graphic */}
                    <div className="my-2 py-3 flex items-center justify-center bg-white rounded-2xl">
                      <div className="w-28 h-18 flex items-center justify-center">
                        <svg viewBox="0 0 72 44" className="w-full h-full" fill="none">
                          <rect x="6" y="8" width="60" height="28" rx="4" fill="#F8F9FA" stroke="#D1D5DB" strokeWidth="1.8" />
                          <rect x="10" y="36" width="8" height="3" rx="1.5" fill="#4B5563" />
                          <rect x="54" y="36" width="8" height="3" rx="1.5" fill="#4B5563" />
                          <circle cx="50" cy="22" r="9" fill="#1F2937" stroke="#9CA3AF" strokeWidth="2" />
                          <circle cx="50" cy="22" r="4.5" fill="#3B82F6" />
                          <circle cx="48" cy="20" r="1.5" fill="white" />
                          <rect x="14" y="14" width="22" height="2.5" rx="1" fill="#E5E7EB" />
                          <rect x="14" y="20" width="22" height="2.5" rx="1" fill="#E5E7EB" />
                          <rect x="14" y="26" width="14" height="2.5" rx="1" fill="#E5E7EB" />
                        </svg>
                      </div>
                    </div>

                    {/* Amount & Progress */}
                    <div className="flex items-baseline justify-between mt-3 text-xs">
                      <span className="font-extrabold text-[#17170F]">₦180,000</span>
                      <span className="text-gray-400 text-[10px]">/ ₦300,000</span>
                      <span className="font-bold text-gray-600 ml-auto text-[11px]">60%</span>
                    </div>

                    <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-[#F3C449] rounded-full w-[60%]" />
                    </div>

                    {/* Contributors */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-gray-500 text-[10px]">8 contributors</span>
                      <div className="flex -space-x-1.5 ml-auto">
                        {AVATAR_PHOTOS.slice(0, 4).map((src, i) => (
                          <img key={i} src={src} alt="contributor" className="w-5 h-5 rounded-full border border-white object-cover shadow-2xs" />
                        ))}
                        <span className="w-5 h-5 rounded-full bg-gray-100 border border-white text-[8px] flex items-center justify-center font-bold text-gray-600">
                          +3
                        </span>
                      </div>
                    </div>
                  </FadeUp>

                  {/* Card 2: Emergency Withdrawal (Overlapping Card on right) */}
                  <FadeUp delay={0.15} className="absolute right-0 sm:right-2 top-8 z-20 w-[66%] sm:w-[62%] rounded-[28px] border border-[#ECEAE2] bg-white p-5 shadow-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#17170F] mb-0.5">
                      <span className="p-1 rounded-md bg-coral-50 text-coral-500 border border-coral-200">
                        <Lock className="w-3 h-3 text-[#EE6F57]" />
                      </span>
                      <span>Emergency withdrawal</span>
                    </div>
                    <p className="text-[10px] text-[#595B52] mb-3">4 of 6 people have agreed</p>

                    {/* Voting Dots */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {[true, true, true, true, false, false].map((voted, idx) => (
                        <span
                          key={idx}
                          className={`w-3 h-3 rounded-full ${voted ? "bg-[#8CC63F]" : "bg-[#EAE8DF]"}`}
                        />
                      ))}
                    </div>

                    {/* Refund Breakdown */}
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
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
                            <img src={img} alt={name} className="w-4 h-4 rounded-full object-cover shadow-2xs" />
                            <span className="text-[#17170F] font-medium text-[11px]">{name}</span>
                          </div>
                          <span className="font-extrabold text-[#17170F] text-[11px]">{amount}</span>
                        </div>
                      ))}
                    </div>
                  </FadeUp>
                </div>
              </div>

              {/* Right Side: Copy & Celebratory Group Illustration */}
              <div className="lg:col-span-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <FadeUp className="space-y-5 max-w-md">
                  <p className="text-xs font-bold text-[#8CC63F] uppercase tracking-widest">
                    GROUP GOALS
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#17170F] leading-[1.1] tracking-tight">
                    Stronger together.<br />
                    <span className="text-[#8CC63F]">Fairer together.</span>
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-[#595B52] leading-relaxed font-normal">
                    Pool money for shared goals with friends, colleagues, or your community.
                    Everyone contributes. Everyone has a say. If plans change, everyone gets
                    their fair share back.
                  </p>

                  <div className="pt-2">
                    <Link
                      href="/goals/new"
                      id="group-goal-btn"
                      className="inline-flex items-center gap-2 rounded-full bg-[#11130E] text-white px-7 py-3.5 text-xs sm:text-sm font-bold hover:bg-black transition-all shadow-sm group"
                    >
                      <span>Create a group goal</span>
                      <ArrowRight className="h-4 w-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </FadeUp>

                {/* Celebratory Group Illustration with Sparkle Doodle */}
                <FadeUp delay={0.2} className="shrink-0 relative flex flex-col items-center justify-center">
                  {/* Green Starburst Doodle above high five */}
                  <div aria-hidden="true" className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#8CC63F]">
                    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                      <line x1="16" y1="2" x2="16" y2="10" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="16" y1="22" x2="16" y2="30" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="2" y1="16" x2="10" y2="16" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="22" y1="16" x2="30" y2="16" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="6" y1="6" x2="12" y2="12" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="20" y1="20" x2="26" y2="26" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="6" y1="26" x2="12" y2="20" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1="20" y1="12" x2="26" y2="6" stroke="#8CC63F" strokeWidth="2.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <img
                    src="/images/pe1.webp"
                    alt="Friends and group members celebrating goal completion together"
                    className="w-[240px] sm:w-[280px] h-auto object-contain select-none"
                  />
                </FadeUp>
              </div>
            </div>
          </section>

          {/* ── FOOTER CTA BANNER ──────────────────────────── */}
          <section className="mx-auto max-w-7xl px-6 md:px-12 pt-6">
            <footer className="bg-[#11130E] text-white rounded-[32px] sm:rounded-[40px] relative overflow-hidden shadow-xl">
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

              <div className="px-8 sm:px-14 py-14 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
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
                    Join thousands hitting their goals — one step at a time.
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
          </section>
        </div>
      </div>
    </div>
  );
}

