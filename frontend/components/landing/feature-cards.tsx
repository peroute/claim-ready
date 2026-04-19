import {
  FileCheck,
  FileText,
  Headphones,
  Image as ImageIcon,
  PlayCircle,
  Video,
} from "lucide-react";

/**
 * Bento-style feature grid: first card spans two columns and shows
 * the multimodal pipeline as a chain of glass chips.
 */
export function FeatureCards() {
  return (
    <section className="container py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
          What it does
        </p>
        <h2 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          One pipeline.{" "}
          <span className="font-serif italic text-teal-300">
            Every modality.
          </span>
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Vision, speech, and policy text fused into one structured packet —
          cited, verifiable, ready to send.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-card glow-ring relative overflow-hidden rounded-2xl p-8 lg:col-span-2">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
                Multimodal pipeline
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Video, audio, image, and policy — fused.
              </h3>
              <p className="mt-3 text-sm text-slate-400">
                Whisper transcribes the walkthrough. CLIP indexes the frames.
                Gemini fuses both with your policy and writes the packet.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {[
              { icon: Video, label: "Video frames" },
              { icon: Headphones, label: "Whisper transcript" },
              { icon: ImageIcon, label: "CLIP embeddings" },
              { icon: FileText, label: "Policy sections" },
              { icon: FileCheck, label: "Final packet" },
            ].map(({ icon: Icon, label }, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="group relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 backdrop-blur-xl">
                  <span className="absolute inset-0 -z-10 rounded-xl bg-teal-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/30">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-medium text-slate-200">
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden h-px w-6 bg-gradient-to-r from-teal-400/50 to-transparent sm:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card glow-ring relative overflow-hidden rounded-2xl p-8">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-500/10 text-teal-300 ring-1 ring-inset ring-teal-400/30">
            <FileCheck className="h-6 w-6 animate-pulse-slow" />
          </span>
          <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
            Policy-aware
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Cites the exact sections of your policy that cover each item.
            No generic boilerplate — only what your contract actually says.
          </p>
        </div>

        <div className="glass-card glow-ring relative overflow-hidden rounded-2xl p-8">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-500/10 text-teal-300 ring-1 ring-inset ring-teal-400/30">
            <PlayCircle className="h-6 w-6 animate-pulse-slow" />
          </span>
          <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
            Evidence-linked
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Every item links back to the second of video where it was shown,
            so an adjuster can verify the claim in one click.
          </p>
        </div>
      </div>
    </section>
  );
}
