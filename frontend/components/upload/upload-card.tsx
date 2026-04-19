"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dropzone } from "@/components/upload/dropzone";
import { ApiError, createClaim, type IntakePayload } from "@/lib/api";
import { saveIntake } from "@/lib/intake-storage";

const CAUSES = [
  "Water",
  "Fire",
  "Theft",
  "Storm",
  "Impact",
  "Other",
] as const;
type Cause = (typeof CAUSES)[number] | "";

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Shared input class — keeps the dark glass look consistent across
// Input / Select trigger and survives shadcn's defaults.
const FIELD_CLASSES =
  "h-11 rounded-lg border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-500 " +
  "focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400/30 focus-visible:ring-offset-0";

export function UploadCard() {
  const router = useRouter();

  const [claimantName, setClaimantName] = useState("");
  const [incidentDate, setIncidentDate] = useState<string>(yesterdayISO);
  const [cause, setCause] = useState<Cause>("");
  const [location, setLocation] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [policy, setPolicy] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      !!claimantName.trim() &&
      !!incidentDate &&
      !!cause &&
      !!location.trim() &&
      !!video &&
      !!policy &&
      !submitting,
    [claimantName, incidentDate, cause, location, video, policy, submitting],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !video || !policy) return;

    setSubmitting(true);
    setError(null);

    const intake: IntakePayload = {
      claimant_name: claimantName.trim(),
      incident_date: incidentDate,
      cause,
      location: location.trim(),
    };

    const formData = new FormData();
    formData.append("video", video);
    formData.append("policy", policy);
    formData.append("intake", JSON.stringify(intake));

    try {
      const { claim_id } = await createClaim(formData);
      saveIntake(claim_id, intake);
      router.push(`/claim/${claim_id}/processing`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Upload failed. Check that the API server is running.";
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card relative w-full self-center overflow-hidden rounded-2xl p-8 shadow-[0_30px_80px_-30px_rgba(20,184,166,0.25)]"
    >
      {/* Subtle inner highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent"
      />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
          Start a claim
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
          Ready to <span className="font-serif italic text-teal-300">start</span>?
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          We&rsquo;ll generate the inventory, citations, and FNOL letter for you.
        </p>

        <div className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="claimant_name" className="text-slate-300">
                Claimant name
              </Label>
              <Input
                id="claimant_name"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className={FIELD_CLASSES}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incident_date" className="text-slate-300">
                Incident date
              </Label>
              <Input
                id="incident_date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className={`${FIELD_CLASSES} [color-scheme:dark]`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cause" className="text-slate-300">
                Cause of damage
              </Label>
              <Select
                value={cause}
                onValueChange={(v) => setCause(v as Cause)}
              >
                <SelectTrigger id="cause" className={FIELD_CLASSES}>
                  <SelectValue placeholder="Select a cause" />
                </SelectTrigger>
                <SelectContent>
                  {CAUSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Living room"
                className={FIELD_CLASSES}
              />
            </div>
          </div>

          <div className="grid gap-4 pt-2">
            <Dropzone
              label="Damage video"
              hint="MP4 or MOV"
              accept={{
                "video/mp4": [".mp4"],
                "video/quicktime": [".mov"],
              }}
              file={video}
              onChange={setVideo}
              disabled={submitting}
            />
            <Dropzone
              label="Policy PDF"
              hint="PDF"
              accept={{ "application/pdf": [".pdf"] }}
              file={policy}
              onChange={setPolicy}
              disabled={submitting}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="group relative mt-8 h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-navy-600 to-teal-600 text-base font-semibold text-white shadow-[0_0_30px_rgba(20,184,166,0.35)] transition-all hover:shadow-[0_0_50px_rgba(20,184,166,0.55)] hover:brightness-110 disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100"
        >
          {/* Shimmer sweep */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
          />
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              Start claim
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
