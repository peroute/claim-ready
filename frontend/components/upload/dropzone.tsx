"use client";

import { useCallback } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  label: string;
  /** Hint shown under the label, e.g. ".mp4, .mov · max 500 MB". */
  hint: string;
  accept: Accept;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function Dropzone({
  label,
  hint,
  accept,
  file,
  onChange,
  disabled = false,
}: DropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept,
      maxFiles: 1,
      multiple: false,
      disabled: disabled || !!file,
      onDrop,
    });

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-300">{label}</p>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatBytes(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all",
            isDragActive
              ? "border-teal-400 bg-teal-500/10 shadow-[inset_0_0_30px_rgba(20,184,166,0.18)]"
              : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]",
            isDragReject && "border-red-400/70 bg-red-500/10",
            disabled && "pointer-events-none opacity-60",
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud
            className={cn(
              "h-6 w-6",
              isDragActive ? "text-teal-300" : "text-slate-500",
            )}
            strokeWidth={2}
          />
          <p className="mt-3 text-sm font-medium text-slate-200">
            {isDragActive ? "Drop to attach" : "Drag and drop or click"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
      )}
    </div>
  );
}
