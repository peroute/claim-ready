import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { UploadCard } from "@/components/upload/upload-card";
import { PacketMockup } from "@/components/landing/packet-mockup";
import { FeatureCards } from "@/components/landing/feature-cards";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "Claim-ready — Turn your damage video into a claim packet",
};

export default function LandingPage() {
  return (
    <main className="relative">
      {/* ─── Top nav ────────────────────────────────────────────── */}
      <header className="container flex items-center justify-between pt-8">
        <Logo variant="dark" />
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 backdrop-blur md:inline-flex">
            <span className="font-mono text-teal-300">v1.0</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            Built for Hook &lsquo;Em Hacks 2026
          </span>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="container flex min-h-[88vh] flex-col items-center justify-center pt-16 text-center">
        {/* eyebrow pill */}
        <div
          className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl"
          style={{ animationDelay: "0ms", opacity: 0 }}
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-300" />
          Multimodal AI · Search & Generation
        </div>

        <h1
          className="mt-7 max-w-4xl animate-fade-in-up text-balance text-6xl font-extrabold leading-[1.05] tracking-tight text-white lg:text-7xl"
          style={{ animationDelay: "120ms", opacity: 0 }}
        >
          Turn your damage video into a{" "}
          <span className="font-serif text-[1.05em] font-normal italic text-teal-300 [text-shadow:0_0_40px_rgba(20,184,166,0.35)]">
            claim packet
          </span>
          .
        </h1>

        <p
          className="mt-6 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-slate-400 md:text-xl"
          style={{ animationDelay: "240ms", opacity: 0 }}
        >
          AI watches your walkthrough, cites your policy, and generates a
          submission-ready packet in under 3 minutes.
        </p>

        <div
          className="mt-10 flex animate-fade-in-up flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "360ms", opacity: 0 }}
        >
          <Link
            href="#start"
            className="group inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-navy-600 to-teal-600 px-7 text-base font-semibold text-white shadow-[0_0_40px_rgba(20,184,166,0.35)] transition-all hover:shadow-[0_0_60px_rgba(20,184,166,0.55)] hover:brightness-110"
          >
            <span className="relative">Start your claim</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#how"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-base font-medium text-slate-200 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.06]"
          >
            <PlayCircle className="h-4 w-4 text-teal-300" />
            See how it works
          </Link>
        </div>

        {/* ─── Floating mockup ─────────────────────────────── */}
        <div
          className="mt-20 flex w-full animate-fade-in-up justify-center"
          style={{ animationDelay: "500ms", opacity: 0 }}
        >
          <PacketMockup />
        </div>
      </section>

      {/* ─── Bento features ────────────────────────────────────── */}
      <FeatureCards />

      {/* ─── How it works ──────────────────────────────────────── */}
      <div id="how">
        <HowItWorks />
      </div>

      {/* ─── Upload section ────────────────────────────────────── */}
      <section id="start" className="container py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
            Try it now
          </p>
          <h2 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Ready to{" "}
            <span className="font-serif italic text-teal-300">start</span>?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Drop a damage walkthrough and your policy. We&rsquo;ll handle the rest.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <UploadCard />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
