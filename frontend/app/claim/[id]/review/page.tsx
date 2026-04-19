"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  ImageIcon,
  Loader2,
  Receipt,
  Trash2,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ApiError,
  getPacket,
  type ClaimPacketJSON,
  type InventoryItem,
} from "@/lib/api";
import { formatCurrency, shortClaimId, sumValues } from "@/lib/format";

interface PageProps {
  params: { id: string };
}

export default function ReviewPage({ params }: PageProps) {
  const router = useRouter();
  const [packet, setPacket] = useState<ClaimPacketJSON | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getPacket(params.id);
        if (cancelled) return;
        setPacket(p);
        setItems(p.items);
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

  const receiptCount = items.filter((i) => i.proof_attached).length;
  const estTotal = sumValues(items);
  const verifiedTotal = sumValues(items, { verifiedOnly: true });

  return (
    <div className="min-h-screen">
      <ReviewHeader
        claimId={params.id}
        incidentDate={packet?.incident_date}
        canSubmit={!!packet}
        onSubmit={() => {
          /* Wired in commit 8 (regenerate + route to packet). */
        }}
      />

      <main className="container py-10">
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
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Review detected items
                </h1>
                <p className="mt-2 max-w-2xl text-slate-600">
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
                <InventoryTable items={items} />
              )}
            </section>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <VideoPanelPlaceholder />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header bar — sticky
// ---------------------------------------------------------------------------

function ReviewHeader({
  claimId,
  incidentDate,
  canSubmit,
  onSubmit,
}: {
  claimId: string;
  incidentDate: string | undefined;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Logo />
        <div className="hidden text-sm text-slate-600 md:block">
          <span className="font-medium text-slate-900">
            Claim {shortClaimId(claimId)}
          </span>
          {incidentDate && (
            <>
              <span className="mx-2 text-slate-300">•</span>
              <span>{incidentDate}</span>
            </>
          )}
        </div>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="bg-navy-600 text-white hover:bg-navy-700 disabled:bg-navy-600/40"
        >
          Generate final packet
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Summary stats row
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
    {
      label: "with receipts",
      value: receiptCount.toString(),
    },
    {
      label: "Est. total",
      value: formatCurrency(estTotal),
    },
    {
      label: "Verified",
      value: formatCurrency(verifiedTotal),
      accent: true,
    },
  ];

  return (
    <dl className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="px-3 py-2">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {s.label}
          </dt>
          <dd
            className={
              s.accent
                ? "mt-1 text-xl font-bold tabular-nums text-teal-600"
                : "mt-1 text-xl font-bold tabular-nums text-slate-900"
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
// Inventory table — read-only render in this commit; commit 8 wires edits
// ---------------------------------------------------------------------------

function InventoryTable({ items }: { items: InventoryItem[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-14 text-xs font-semibold uppercase tracking-wide text-slate-500">
              #
            </TableHead>
            <TableHead className="w-[110px] text-xs font-semibold uppercase tracking-wide text-slate-500">
              Frame
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Item
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Damage
            </TableHead>
            <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wide text-slate-500">
              Value
            </TableHead>
            <TableHead className="w-[100px] text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Receipt
            </TableHead>
            <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wide text-slate-500">
              Policy
            </TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => (
            <TableRow
              key={item.item_id}
              className="border-t border-slate-100 align-top"
            >
              <TableCell className="pt-5 text-sm font-medium tabular-nums text-slate-400">
                {(i + 1).toString().padStart(2, "0")}
              </TableCell>

              <TableCell className="py-4">
                <Thumbnail item={item} />
              </TableCell>

              <TableCell className="py-4">
                <div className="flex items-start gap-1.5">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  {item.brand_recognized && (
                    <BadgeCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-teal-500"
                      aria-label="Brand recognized"
                    />
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="mt-1.5 bg-slate-100 font-medium capitalize text-slate-700 hover:bg-slate-100"
                >
                  {item.category}
                </Badge>
              </TableCell>

              <TableCell className="max-w-xs py-4 text-sm text-slate-600">
                <p className="line-clamp-2">
                  {item.damage_observed || (
                    <span className="italic text-slate-400">
                      No damage noted
                    </span>
                  )}
                </p>
              </TableCell>

              <TableCell className="py-4 text-sm text-slate-700 tabular-nums">
                {formatCurrency(item.estimated_value)}
              </TableCell>

              <TableCell className="py-4 text-center">
                <div className="inline-flex">
                  <Checkbox
                    checked={item.proof_attached}
                    disabled
                    aria-label="Receipt attached"
                  />
                </div>
              </TableCell>

              <TableCell className="py-4 text-xs text-slate-500">
                {item.policy_citations.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.policy_citations.map((sid) => (
                      <span
                        key={sid}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600"
                      >
                        §{sid}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="italic text-slate-400">none</span>
                )}
              </TableCell>

              <TableCell className="py-4">
                <button
                  type="button"
                  disabled
                  aria-label="Remove item (enabled in commit 8)"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Thumbnail({ item }: { item: InventoryItem }) {
  // thumbnail_base64 lands in commit 9 (backend addition); until then
  // render a typed placeholder so the layout reads correctly.
  if (item.thumbnail_base64) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`data:image/jpeg;base64,${item.thumbnail_base64}`}
        alt={item.name}
        className="h-[60px] w-20 rounded-lg object-cover ring-1 ring-slate-200"
      />
    );
  }
  return (
    <div className="grid h-[60px] w-20 place-items-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-slate-200">
      <ImageIcon className="h-5 w-5" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty / loading / error states
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <Receipt className="h-8 w-8 text-slate-300" />
      <p className="mt-4 font-semibold text-slate-900">No items detected</p>
      <p className="mt-1 max-w-sm text-sm text-slate-600">
        This usually means the video had no clear narration of damaged items.
        You can still generate a packet, or upload a new video.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
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
    <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 shadow-card">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="font-semibold text-red-900">
            Couldn&rsquo;t load claim
          </p>
          <p className="mt-1 break-words text-sm text-red-800">{message}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-6 border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
      >
        Back to upload
      </Button>
    </div>
  );
}

function VideoPanelPlaceholder() {
  // Real <video> player + frame seek wire up in commit 9 alongside the
  // backend video endpoint.
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Source video
      </p>
      <div className="mt-3 aspect-video w-full rounded-xl bg-slate-100" />
      <p className="mt-3 text-xs text-slate-500">
        Inline player and timeline-sync land in the next pass.
      </p>
    </div>
  );
}
