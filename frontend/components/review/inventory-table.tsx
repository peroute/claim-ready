"use client";

import { useState } from "react";
import { BadgeCheck, ImageIcon, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTimestamp } from "@/lib/format";
import { getFrameUrl, type InventoryItem } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface InventoryTableProps {
  claimId: string;
  items: InventoryItem[];
  selectedItemId: string | null;
  onSelect: (item: InventoryItem) => void;
  onUpdate: (itemId: string, patch: Partial<InventoryItem>) => void;
  onRemove: (itemId: string) => void;
}

export function InventoryTable({
  claimId,
  items,
  selectedItemId,
  onSelect,
  onUpdate,
  onRemove,
}: InventoryTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(itemId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  return (
    <>
      <div className="glass-card mt-6 overflow-hidden rounded-2xl">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow className="border-b-white/10 bg-white/[0.02] hover:bg-white/[0.02]">
              <TableHead className="w-14 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                #
              </TableHead>
              <TableHead className="w-[110px] text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Frame
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Item
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Damage
              </TableHead>
              <TableHead className="w-[150px] text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Value
              </TableHead>
              <TableHead className="w-[100px] text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Receipt
              </TableHead>
              <TableHead className="w-[140px] text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Policy
              </TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => {
              const isSelected = item.item_id === selectedItemId;
              const isExpanded = expanded.has(item.item_id);
              return (
                <TableRow
                  key={item.item_id}
                  onClick={() => onSelect(item)}
                  className={cn(
                    "cursor-pointer border-t border-white/5 align-top transition-colors",
                    isSelected
                      ? "border-l-2 border-l-teal-400 bg-teal-500/10 hover:bg-teal-500/15"
                      : "hover:bg-white/[0.04]",
                  )}
                >
                  <TableCell className="pt-5 text-sm font-medium tabular-nums text-slate-500">
                    {(i + 1).toString().padStart(2, "0")}
                  </TableCell>

                  <TableCell className="py-4">
                    <Thumbnail claimId={claimId} item={item} />
                    <p className="mt-1.5 text-[11px] tabular-nums text-slate-500">
                      {formatTimestamp(item.first_seen_sec)}
                    </p>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-start gap-1.5">
                      <p className="font-semibold text-white">{item.name}</p>
                      {item.brand_recognized && (
                        <BadgeCheck
                          className="mt-0.5 h-4 w-4 shrink-0 text-teal-300 [filter:drop-shadow(0_0_4px_rgba(20,184,166,0.6))]"
                          aria-label="Brand recognized"
                        />
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className="mt-1.5 border border-white/10 bg-white/[0.04] font-medium capitalize text-slate-300 hover:bg-white/[0.06]"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>

                  <TableCell
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(item.item_id);
                    }}
                    className="max-w-xs cursor-text py-4 text-sm text-slate-300"
                  >
                    {item.damage_observed ? (
                      <p className={cn(!isExpanded && "line-clamp-2")}>
                        {item.damage_observed}
                      </p>
                    ) : (
                      <p className="italic text-slate-500">No damage noted</p>
                    )}
                    {item.damage_observed &&
                      item.damage_observed.length > 100 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.item_id);
                          }}
                          className="mt-1 text-xs font-medium text-teal-300 hover:text-teal-200 hover:underline"
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      )}
                  </TableCell>

                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="py-4"
                  >
                    <ValueInput
                      value={item.estimated_value}
                      onChange={(v) =>
                        onUpdate(item.item_id, {
                          estimated_value: v,
                          value_source: v == null ? "unknown" : "user_input",
                        })
                      }
                    />
                  </TableCell>

                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="py-4 text-center"
                  >
                    <div className="inline-flex">
                      <Checkbox
                        checked={item.proof_attached}
                        onCheckedChange={(v) =>
                          onUpdate(item.item_id, {
                            proof_attached: v === true,
                          })
                        }
                        aria-label={`Mark receipt for ${item.name}`}
                        className="border-white/20 data-[state=checked]:border-teal-400 data-[state=checked]:bg-teal-500 data-[state=checked]:text-white"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="py-4 text-xs text-slate-400">
                    {item.policy_citations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.policy_citations.map((sid) => (
                          <span
                            key={sid}
                            className="rounded-md border border-teal-400/20 bg-teal-500/10 px-1.5 py-0.5 font-mono text-[11px] text-teal-200"
                          >
                            §{sid}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-slate-500">none</span>
                    )}
                  </TableCell>

                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="py-4"
                  >
                    <button
                      type="button"
                      onClick={() => onRemove(item.item_id)}
                      aria-label={`Remove ${item.name}`}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-all hover:bg-red-500/15 hover:text-red-300 hover:shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Cell subcomponents
// ---------------------------------------------------------------------------

function ValueInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  // Local string state lets the user type "1" before "12" without React
  // truncating to 1 mid-keystroke. We coerce on every change.
  const display = value == null || Number.isNaN(value) ? "" : String(value);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      onChange(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed) || parsed < 0) return;
    onChange(parsed);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
        $
      </span>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={display}
        onChange={handle}
        placeholder="0.00"
        className="h-9 rounded-md border-white/10 bg-white/[0.03] pl-6 pr-2 text-right tabular-nums text-slate-100 placeholder:text-slate-600 focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400/30 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function Thumbnail({ claimId, item }: { claimId: string; item: InventoryItem }) {
  // Pick the middle source frame — same heuristic the PDF template uses.
  const frameId =
    item.source_frame_ids.length > 0
      ? item.source_frame_ids[Math.floor(item.source_frame_ids.length / 2)]
      : null;

  const [errored, setErrored] = useState(false);

  if (frameId && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={getFrameUrl(claimId, frameId)}
        alt={item.name}
        loading="lazy"
        onError={() => setErrored(true)}
        className="h-[60px] w-20 rounded-lg object-cover ring-1 ring-white/10 transition-all hover:ring-teal-400/40"
      />
    );
  }
  return (
    <div className="grid h-[60px] w-20 place-items-center rounded-lg bg-white/[0.03] text-slate-500 ring-1 ring-white/10">
      <ImageIcon className="h-5 w-5" />
    </div>
  );
}
