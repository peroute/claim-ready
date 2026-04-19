import { FileCheck, Shield, Zap } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const FEATURES = [
  {
    icon: Zap,
    title: "Fast processing",
    body: "Complete claim documentation in minutes, not hours.",
  },
  {
    icon: FileCheck,
    title: "Policy-aligned",
    body: "Automatic coverage matching with relevant citations.",
  },
  {
    icon: Shield,
    title: "Professional output",
    body: "FNOL letter and itemized inventory ready for submission.",
  },
];

export default function LandingPage() {
  return (
    <main className="container py-16 md:py-24">
      <div className="grid gap-12 md:gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        {/* LEFT — pitch column */}
        <section className="flex flex-col">
          <Logo />

          <h1 className="mt-10 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
            Turn your damage video into a claim packet.
          </h1>

          <p className="mt-6 max-w-xl text-xl leading-relaxed text-slate-600">
            AI-generated inventory, policy citations, and an FNOL letter ready
            to send — in under 3 minutes.
          </p>

          <ul className="mt-12 space-y-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600 ring-1 ring-inset ring-navy-100">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-slate-600">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-16 text-sm text-slate-500">
            Built at Hook &lsquo;Em Hacks 2026. Powered by Gemini 2.5 and CLIP.
          </p>
        </section>

        {/* RIGHT — upload card placeholder; real form lands in commit 5 */}
        <section className="flex">
          <div className="w-full self-center rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-widest text-navy-600">
              Start a claim
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Upload your video and policy
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The intake form, dual file dropzones, and submit flow ship in the
              next commit.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-32 rounded-xl border-2 border-dashed border-slate-200" />
              <div className="h-32 rounded-xl border-2 border-dashed border-slate-200" />
              <div className="h-12 rounded-lg bg-navy-600/30" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
