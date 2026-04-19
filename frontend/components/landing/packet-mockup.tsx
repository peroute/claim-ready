import { CheckCircle2, FileText, Sparkles } from "lucide-react";

/**
 * Faked packet preview rendered as HTML/CSS (no PDF, no real data).
 * Tilted -2deg with the float animation; this is the hero proof-of-product.
 */
export function PacketMockup() {
  return (
    <div
      className="relative w-full max-w-2xl"
      // Perspective wrapper so the rotate feels three-dimensional.
      style={{ perspective: "1500px" }}
    >
      {/* Soft teal halo behind the mockup */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[2rem] bg-teal-500/15 blur-3xl"
      />

      <div
        className="animate-float overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white text-slate-900 shadow-[0_40px_80px_-20px_rgba(20,184,166,0.35),0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-white/10 transition-transform duration-700 hover:rotate-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Browser-chrome strip */}
        <div className="flex items-center gap-1.5 border-b border-slate-200/80 bg-slate-50/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-[10px] font-medium tracking-wide text-slate-400">
            packet.pdf — Claim #d3343d52
          </span>
        </div>

        {/* Navy banner */}
        <div className="bg-navy-600 px-7 py-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300">
            Claim-ready
          </p>
          <p className="mt-1 font-serif text-2xl tracking-tight">
            Property Damage Claim Packet
          </p>
          <p className="mt-1 text-[11px] text-white/70">
            April 18, 2026 · Hedi Bouassida · Water damage
          </p>
        </div>

        {/* Body */}
        <div className="space-y-5 px-7 py-6 text-[12px] leading-relaxed">
          {/* Incident summary box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-600">
              Incident summary
            </p>
            <p className="mt-1.5 text-slate-700">
              On April 18, 2026, water damage occurred in the living room
              following a pipe burst. Water was observed leaking from the
              ceiling, affecting electronics and furniture below.
            </p>
          </div>

          {/* Inventory table */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-navy-600">
              Itemized inventory
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-100/70 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Item</th>
                    <th className="px-3 py-2 text-left font-semibold">Damage</th>
                    <th className="px-3 py-2 text-right font-semibold">Value</th>
                    <th className="px-3 py-2 text-center font-semibold">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      name: "Hisense TV",
                      cat: "Electronics",
                      damage: "Water on screen",
                      value: "$549",
                      proof: true,
                    },
                    {
                      name: "Lenovo Legion Slim 5",
                      cat: "Electronics",
                      damage: "Liquid in keyboard",
                      value: "$1,299",
                      proof: true,
                    },
                    {
                      name: "Pixel Buds Pro",
                      cat: "Electronics",
                      damage: "Submerged",
                      value: "$189",
                      proof: false,
                    },
                  ].map((row) => (
                    <tr key={row.name} className="bg-white">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-900">
                          {row.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{row.cat}</p>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{row.damage}</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-900">
                        {row.value}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.proof ? (
                          <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-teal-500" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Citations */}
          <div className="flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2.5">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
            <p className="text-[11px] text-teal-900">
              <span className="font-semibold">Cited:</span> Section 02 — What
              Your Renters Policy Covers · Section 04 — Personal Property Limits
            </p>
          </div>

          {/* Generated footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-teal-500" />
              Generated by Claim-ready · 2 min 09 sec
            </span>
            <span>Page 1 of 4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
