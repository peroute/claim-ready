import { Download, Sparkles, Upload } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Upload,
    title: "Upload",
    body: "Drop your damage video and policy PDF.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Analyze",
    body: "AI detects items, matches coverage, drafts the FNOL.",
  },
  {
    n: "03",
    icon: Download,
    title: "Export",
    body: "Review, edit, and download a submission-ready PDF.",
  },
];

export function HowItWorks() {
  return (
    <section className="container py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
          How it works
        </p>
        <h2 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Three steps. Under{" "}
          <span className="font-serif italic text-teal-300">three minutes</span>.
        </h2>
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Connecting gradient line — desktop only */}
        <div
          aria-hidden
          className="absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent md:block"
        />
        <div
          aria-hidden
          className="absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 md:block"
          style={{
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />

        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }) => (
            <li
              key={n}
              className="glass-card relative flex flex-col items-center rounded-2xl p-7 text-center"
            >
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-teal-500/30 blur-xl"
                />
                <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-navy-600 to-navy-800 text-white ring-1 ring-white/10">
                  <Icon className="h-6 w-6 text-teal-300" strokeWidth={2.25} />
                </span>
              </div>
              <p className="mt-5 text-xs font-mono font-semibold tracking-widest text-teal-300/80">
                STEP {n}
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
