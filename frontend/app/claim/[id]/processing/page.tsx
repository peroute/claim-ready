"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useClaimStatus } from "@/lib/use-claim-status";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

const STAGES = [
  { key: "ingesting_video", label: "Extracting frames and transcribing audio" },
  { key: "ingesting_policy", label: "Parsing policy document" },
  { key: "building_index", label: "Indexing for semantic search" },
  { key: "detecting_inventory", label: "Detecting damaged items" },
  { key: "searching_policy", label: "Matching policy coverage" },
  { key: "generating_packet", label: "Rendering claim packet" },
] as const;

type StageStatus = "done" | "current" | "pending" | "error";

function stageStatus(
  index: number,
  currentIndex: number,
  isComplete: boolean,
  isError: boolean,
): StageStatus {
  if (isComplete) return "done";
  if (isError) {
    if (index < currentIndex) return "done";
    if (index === currentIndex) return "error";
    return "pending";
  }
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  return "pending";
}

export default function ProcessingPage({ params }: PageProps) {
  const router = useRouter();
  const { status, error } = useClaimStatus(params.id);

  const stage = status?.stage ?? "queued";
  const percent = Math.max(0, Math.min(100, status?.percent ?? 0));
  const isError = stage === "error";
  const isComplete = stage === "complete";
  const errorMessage = status?.message ?? error ?? null;

  const currentIndex = useMemo(() => {
    const idx = STAGES.findIndex((s) => s.key === stage);
    if (idx === -1) {
      // Stage we don't know about (queued, complete, error) — derive from %.
      if (percent >= 90) return STAGES.length - 1;
      if (percent <= 0) return 0;
      const ratio = percent / 100;
      return Math.min(STAGES.length - 1, Math.floor(ratio * STAGES.length));
    }
    return idx;
  }, [stage, percent]);

  useEffect(() => {
    if (!isComplete) return;
    const t = setTimeout(() => {
      router.push(`/claim/${params.id}/review`);
    }, 600);
    return () => clearTimeout(t);
  }, [isComplete, params.id, router]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />

      <header className="container relative flex items-center py-6">
        <Logo variant="dark" />
      </header>

      <main className="container relative flex justify-center pb-24 pt-8">
        <div className="w-full max-w-2xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
              Working on it
            </p>
            <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Processing your{" "}
              <span className="font-serif font-normal italic text-teal-300 [text-shadow:0_0_30px_rgba(20,184,166,0.35)]">
                claim
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
              This usually takes 2–3 minutes. We&rsquo;re analyzing your video,
              matching coverage, and generating your packet.
            </p>
          </div>

          {isError ? (
            <ErrorPanel
              message={errorMessage ?? "An unknown error occurred."}
              onRetry={() => router.push("/")}
            />
          ) : (
            <>
              <ProgressBlock
                percent={percent}
                message={
                  status?.message ??
                  (error ? "Reconnecting to server…" : "Queued…")
                }
              />

              <ol className="glass-card mt-10 space-y-1 rounded-2xl p-3">
                {STAGES.map((s, i) => (
                  <StageRow
                    key={s.key}
                    label={s.label}
                    status={stageStatus(i, currentIndex, isComplete, false)}
                  />
                ))}
              </ol>

              {error && !isError && (
                <p className="mt-4 text-center text-xs text-slate-500">
                  Last status check failed — retrying automatically.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function ProgressBlock({
  percent,
  message,
}: {
  percent: number;
  message: string;
}) {
  return (
    <div className="mt-12">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-slate-300">{message}</p>
        <p className="text-sm font-semibold tabular-nums text-teal-300">
          {Math.round(percent)}%
        </p>
      </div>
      <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-navy-500 via-teal-500 to-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.55)] transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        >
          {/* Continuous shimmer sweep */}
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </div>
      </div>
    </div>
  );
}

function StageRow({
  label,
  status,
}: {
  label: string;
  status: StageStatus;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border-l-2 border-transparent px-4 py-3 transition-all",
        status === "current" &&
          "border-l-teal-400 bg-teal-500/10 shadow-[inset_0_0_30px_rgba(20,184,166,0.08)]",
        status === "error" && "border-l-red-400 bg-red-500/10",
      )}
    >
      <StageIcon status={status} />
      <span
        className={cn(
          "text-sm transition-colors",
          status === "done" && "text-slate-300",
          status === "current" && "font-medium text-white",
          status === "pending" && "text-slate-500",
          status === "error" && "font-medium text-red-300",
        )}
      >
        {label}
      </span>
      {status === "current" && (
        <span
          aria-hidden
          className="ml-auto h-2 w-2 animate-pulse-slow rounded-full bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.8)]"
        />
      )}
    </li>
  );
}

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "done") {
    return (
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-teal-300 [filter:drop-shadow(0_0_6px_rgba(20,184,166,0.5))]"
      />
    );
  }
  if (status === "current") {
    return (
      <span className="relative grid h-5 w-5 shrink-0 place-items-center">
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse-slow rounded-full bg-teal-500/30 blur-md"
        />
        <Loader2 className="relative h-5 w-5 animate-spin text-teal-300" />
      </span>
    );
  }
  if (status === "error") {
    return <XCircle className="h-5 w-5 shrink-0 text-red-400" />;
  }
  return <Circle className="h-5 w-5 shrink-0 text-slate-600" />;
}

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="glass-card mt-12 rounded-2xl border-red-400/30 bg-red-500/5 p-6">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-red-200">Pipeline failed</p>
          <p className="mt-1 break-words text-sm text-red-300/90">{message}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-6 border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
      >
        Try again
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Decorative starfield — pure CSS twinkles, no JS, no extra deps.
// 24 dots positioned + sized + delayed semi-randomly. Pre-computed so the
// component is server-renderable without hydration mismatch.
// ---------------------------------------------------------------------------

const STARS = [
  { top: "8%",  left: "12%", size: 1.5, delay: 0,    duration: 4 },
  { top: "14%", left: "78%", size: 1,   delay: 1.2,  duration: 5 },
  { top: "22%", left: "32%", size: 2,   delay: 2.4,  duration: 6 },
  { top: "30%", left: "88%", size: 1,   delay: 0.8,  duration: 4.5 },
  { top: "38%", left: "5%",  size: 1.5, delay: 3.1,  duration: 5.5 },
  { top: "44%", left: "62%", size: 1,   delay: 1.7,  duration: 4 },
  { top: "52%", left: "20%", size: 2,   delay: 0.4,  duration: 6 },
  { top: "58%", left: "92%", size: 1,   delay: 2.1,  duration: 5 },
  { top: "66%", left: "48%", size: 1.5, delay: 3.6,  duration: 4.5 },
  { top: "72%", left: "8%",  size: 1,   delay: 1.3,  duration: 5.5 },
  { top: "78%", left: "70%", size: 2,   delay: 0.6,  duration: 6 },
  { top: "84%", left: "25%", size: 1,   delay: 2.8,  duration: 4 },
  { top: "90%", left: "85%", size: 1.5, delay: 1.0,  duration: 5 },
  { top: "5%",  left: "55%", size: 1,   delay: 3.4,  duration: 5.5 },
  { top: "18%", left: "45%", size: 1,   delay: 0.2,  duration: 4.5 },
  { top: "26%", left: "70%", size: 1.5, delay: 2.6,  duration: 6 },
  { top: "42%", left: "38%", size: 1,   delay: 1.5,  duration: 4 },
  { top: "55%", left: "75%", size: 2,   delay: 0.9,  duration: 5.5 },
  { top: "63%", left: "15%", size: 1,   delay: 3.2,  duration: 5 },
  { top: "70%", left: "55%", size: 1.5, delay: 2.0,  duration: 4.5 },
  { top: "82%", left: "60%", size: 1,   delay: 0.5,  duration: 6 },
  { top: "11%", left: "92%", size: 1,   delay: 2.3,  duration: 4 },
  { top: "35%", left: "50%", size: 1,   delay: 3.8,  duration: 5.5 },
  { top: "48%", left: "10%", size: 1.5, delay: 1.1,  duration: 5 },
];

function Starfield() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {STARS.map((s, i) => {
        const isTeal = i % 4 === 0;
        return (
          <span
            key={i}
            className="absolute rounded-full animate-pulse-slow"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: isTeal
                ? "rgba(20, 184, 166, 0.8)"
                : "rgba(255, 255, 255, 0.7)",
              boxShadow: isTeal
                ? "0 0 6px rgba(20, 184, 166, 0.6)"
                : "0 0 4px rgba(255, 255, 255, 0.4)",
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
