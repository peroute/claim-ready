"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  getPacket,
  getPdfUrl,
  type ClaimPacketJSON,
} from "@/lib/api";
import { formatCurrency, shortClaimId } from "@/lib/format";

interface PageProps {
  params: { id: string };
}

export default function PacketPage({ params }: PageProps) {
  const router = useRouter();
  const [packet, setPacket] = useState<ClaimPacketJSON | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getPacket(params.id);
        if (cancelled) return;
        setPacket(p);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load packet metadata.";
        setLoadError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Logo variant="dark" />
          <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-slate-300">
              {shortClaimId(params.id)}
            </span>
            {packet?.incident_date && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <span className="text-slate-400">{packet.incident_date}</span>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/claim/${params.id}/review`)}
            className="border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to edit
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl py-16">
        {loadError ? (
          <LoadErrorPanel
            message={loadError}
            onBack={() => router.push(`/claim/${params.id}/review`)}
          />
        ) : !packet ? (
          <LoadingState />
        ) : (
          <>
            <SuccessHeader />

            <StatsRow
              itemCount={packet.items.length}
              estTotal={packet.total_estimated_value}
              verifiedTotal={packet.verified_value}
            />

            <PdfPreview claimId={params.id} />

            <ActionRow claimId={params.id} />

            <p className="mt-12 text-center text-sm text-slate-500">
              Ready to submit? Attach this packet when filing your claim with
              your insurer.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function SuccessHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Glowing teal checkmark with two stacked halos for depth */}
      <span className="relative grid h-20 w-20 place-items-center">
        <span
          aria-hidden
          className="absolute inset-[-30%] rounded-full bg-teal-500/25 blur-3xl"
        />
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse-slow rounded-full bg-teal-500/30 blur-xl"
        />
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-[0_0_40px_rgba(20,184,166,0.6)] ring-1 ring-white/20">
          <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
        </span>
      </span>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
        Packet generated
      </p>
      <h1 className="mt-3 animate-fade-in-up text-balance text-5xl font-extrabold tracking-tight text-white md:text-6xl">
        Your claim is{" "}
        <span className="font-serif font-normal italic text-teal-300 [text-shadow:0_0_30px_rgba(20,184,166,0.4)]">
          ready
        </span>
        .
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 md:text-lg">
        Review the packet below. You can download it now or jump back to edit
        the inventory.
      </p>
    </div>
  );
}

function StatsRow({
  itemCount,
  estTotal,
  verifiedTotal,
}: {
  itemCount: number;
  estTotal: number;
  verifiedTotal: number;
}) {
  const stats = [
    { label: "Items documented", value: itemCount.toString() },
    { label: "Total estimated value", value: formatCurrency(estTotal) },
    {
      label: "Verified amount",
      value: formatCurrency(verifiedTotal),
      accent: true,
    },
  ];
  return (
    <dl className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-0.5"
        >
          {/* Subtle teal sheen on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 to-teal-500/0 opacity-0 transition-opacity duration-500 group-hover:from-teal-500/[0.04] group-hover:to-transparent group-hover:opacity-100"
          />
          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            {s.label}
          </dt>
          <dd
            className={
              s.accent
                ? "mt-2 text-3xl font-extrabold tabular-nums text-teal-300 [text-shadow:0_0_28px_rgba(20,184,166,0.4)]"
                : "mt-2 text-3xl font-extrabold tabular-nums text-white"
            }
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PdfPreview({ claimId }: { claimId: string }) {
  return (
    <div className="relative mt-12">
      {/* Soft teal halo behind the preview card */}
      <div
        aria-hidden
        className="absolute inset-x-8 -bottom-8 -top-2 -z-10 rounded-[2rem] bg-teal-500/10 blur-3xl"
      />
      <div className="glass-card relative overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(20,184,166,0.4)]">
        {/* Faux browser-chrome strip so the iframe feels presented, not embedded */}
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 font-mono text-[10px] tracking-wide text-slate-500">
            packet.pdf
          </span>
        </div>
        <iframe
          src={getPdfUrl(claimId)}
          title="Claim packet PDF"
          className="aspect-[8.5/11] w-full bg-white"
        />
      </div>
    </div>
  );
}

function ActionRow({ claimId }: { claimId: string }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Button
        asChild
        size="lg"
        className="group relative h-12 overflow-hidden rounded-xl bg-gradient-to-r from-navy-600 to-teal-600 px-7 text-base font-semibold text-white shadow-[0_0_40px_rgba(20,184,166,0.4)] transition-all hover:shadow-[0_0_60px_rgba(20,184,166,0.6)] hover:brightness-110"
      >
        <a
          href={getPdfUrl(claimId)}
          download={`claim_${shortClaimId(claimId)}.pdf`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
          />
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="h-12 rounded-xl border-white/15 bg-white/[0.04] px-6 text-base font-medium text-slate-200 backdrop-blur-xl hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
      >
        <Link href={`/claim/${claimId}/review`}>
          <ArrowLeft className="h-4 w-4" />
          Back to edit
        </Link>
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin text-teal-300" />
        <span className="text-sm">Loading packet…</span>
      </div>
    </div>
  );
}

function LoadErrorPanel({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="glass-card mx-auto mt-12 max-w-xl rounded-2xl border-red-400/30 bg-red-500/5 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <div>
          <p className="font-semibold text-red-200">
            Couldn&rsquo;t load packet
          </p>
          <p className="mt-1 break-words text-sm text-red-300/90">{message}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="mt-6 border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
      >
        Back to review
      </Button>
    </div>
  );
}
