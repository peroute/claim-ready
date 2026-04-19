"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Receipt,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { InventoryTable } from "@/components/review/inventory-table";
import {
  VideoPanel,
  type VideoPanelHandle,
} from "@/components/review/video-panel";
import {
  ApiError,
  getPacket,
  regeneratePacket,
  type ClaimPacketJSON,
  type InventoryItem,
} from "@/lib/api";
import { formatCurrency, shortClaimId, sumValues } from "@/lib/format";
import { fallbackIntake, loadIntake } from "@/lib/intake-storage";

interface PageProps {
  params: { id: string };
}

export default function ReviewPage({ params }: PageProps) {
  const router = useRouter();
  const [packet, setPacket] = useState<ClaimPacketJSON | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoRef = useRef<VideoPanelHandle>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getPacket(params.id);
        if (cancelled) return;
        setPacket(p);
        setItems(p.items);
        if (p.items.length > 0) setSelectedItemId(p.items[0].item_id);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load claim packet.";
        setLoadError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // ---- mutations -----------------------------------------------------------

  function updateItem(itemId: string, patch: Partial<InventoryItem>) {
    setItems((prev) =>
      prev.map((it) => (it.item_id === itemId ? { ...it, ...patch } : it)),
    );
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((it) => it.item_id !== itemId));
    setSelectedItemId((prev) => (prev === itemId ? null : prev));
  }

  function selectItem(item: InventoryItem) {
    setSelectedItemId(item.item_id);
    videoRef.current?.seek(item.first_seen_sec);
  }

  // ---- submit --------------------------------------------------------------

  async function handleRegenerate() {
    if (!packet || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const intake =
      packet.intake ??
      loadIntake(params.id) ??
      fallbackIntake(packet.incident_date);

    try {
      await regeneratePacket(params.id, items, intake);
      router.push(`/claim/${params.id}/packet`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to regenerate packet.";
      setSubmitError(msg);
      setSubmitting(false);
    }
  }

  // ---- derived stats -------------------------------------------------------

  const receiptCount = items.filter((i) => i.proof_attached).length;
  const estTotal = sumValues(items);
  const verifiedTotal = sumValues(items, { verifiedOnly: true });

  return (
    <div className="min-h-screen">
      <ReviewHeader
        claimId={params.id}
        incidentDate={packet?.incident_date}
        canSubmit={!!packet && !submitting}
        submitting={submitting}
        onSubmit={handleRegenerate}
      />

      <main className="container py-12">
        {loadError ? (
          <LoadErrorPanel
            message={loadError}
            onRetry={() => router.push("/")}
          />
        ) : !packet ? (
          <LoadingState />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <section>
              <header>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
                  Step 2 of 3
                </p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  <span className="font-serif font-normal italic text-teal-300 [text-shadow:0_0_30px_rgba(20,184,166,0.35)]">
                    Review
                  </span>{" "}
                  detected items
                </h1>
                <p className="mt-3 max-w-2xl text-slate-400">
                  Delete duplicates, fill in values, and mark which items you
                  have receipts for. The final packet regenerates from your
                  edits.
                </p>
              </header>

              <SummaryStats
                itemCount={items.length}
                receiptCount={receiptCount}
                estTotal={estTotal}
                verifiedTotal={verifiedTotal}
              />

              {items.length === 0 ? (
                <EmptyState />
              ) : (
                <InventoryTable
                  claimId={params.id}
                  items={items}
                  selectedItemId={selectedItemId}
                  onSelect={selectItem}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              )}

              {submitError && (
                <p
                  role="alert"
                  className="mt-6 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {submitError}
                </p>
              )}
            </section>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <VideoPanel
                ref={videoRef}
                claimId={params.id}
                selectedItem={
                  items.find((i) => i.item_id === selectedItemId) ?? null
                }
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header bar
// ---------------------------------------------------------------------------

function ReviewHeader({
  claimId,
  incidentDate,
  canSubmit,
  submitting,
  onSubmit,
}: {
  claimId: string;
  incidentDate: string | undefined;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Logo variant="dark" />
        <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-slate-300">
            {shortClaimId(claimId)}
          </span>
          {incidentDate && (
            <>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="text-slate-400">{incidentDate}</span>
            </>
          )}
        </div>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="group relative h-10 overflow-hidden rounded-xl bg-gradient-to-r from-navy-600 to-teal-600 px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(20,184,166,0.35)] transition-all hover:shadow-[0_0_45px_rgba(20,184,166,0.55)] hover:brightness-110 disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
          />
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating…
            </>
          ) : (
            <>
              Generate final packet
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function SummaryStats({
  itemCount,
  receiptCount,
  estTotal,
  verifiedTotal,
}: {
  itemCount: number;
  receiptCount: number;
  estTotal: number;
  verifiedTotal: number;
}) {
  const stats = [
    {
      label: itemCount === 1 ? "item detected" : "items detected",
      value: itemCount.toString(),
    },
    { label: "with receipts", value: receiptCount.toString() },
    { label: "Est. total", value: formatCurrency(estTotal) },
    { label: "Verified", value: formatCurrency(verifiedTotal), accent: true },
  ];
  return (
    <dl className="glass-card mt-8 grid grid-cols-2 gap-2 rounded-2xl p-2 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03]"
        >
          <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            {s.label}
          </dt>
          <dd
            className={
              s.accent
                ? "mt-1 text-2xl font-extrabold tabular-nums text-teal-300 [text-shadow:0_0_24px_rgba(20,184,166,0.4)]"
                : "mt-1 text-2xl font-extrabold tabular-nums text-white"
            }
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Empty / loading / error
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="glass-card mt-6 flex flex-col items-center rounded-2xl border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
      <Receipt className="h-8 w-8 text-slate-500" />
      <p className="mt-4 font-semibold text-white">No items detected</p>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        This usually means the video had no clear narration of damaged items.
        You can still generate a packet, or upload a new video.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin text-teal-300" />
        <span className="text-sm">Loading claim packet…</span>
      </div>
    </div>
  );
}

function LoadErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="glass-card mx-auto mt-12 max-w-xl rounded-2xl border-red-400/30 bg-red-500/5 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <div>
          <p className="font-semibold text-red-200">
            Couldn&rsquo;t load claim
          </p>
          <p className="mt-1 break-words text-sm text-red-300/90">{message}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-6 border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
      >
        Back to upload
      </Button>
    </div>
  );
}
