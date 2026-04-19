import { Logo } from "@/components/brand/logo";

const STACK = [
  "Gemini 2.5",
  "OpenAI Whisper",
  "OpenCLIP",
  "ChromaDB",
  "FastAPI",
  "Next.js",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="container flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-3">
          <Logo variant="dark" />
          <span className="hidden text-xs text-slate-500 md:inline">
            Built for Hook &lsquo;Em Hacks 2026
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs text-slate-500">
          {STACK.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-2">
              <span className="text-slate-400">{s}</span>
              {i < STACK.length - 1 && (
                <span aria-hidden className="h-1 w-1 rounded-full bg-slate-700" />
              )}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
