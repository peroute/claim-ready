import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Hide the wordmark and show only the icon. */
  iconOnly?: boolean;
  /** "dark" inverts wordmark colors for dark surfaces. Defaults to "light". */
  variant?: "light" | "dark";
}

/**
 * Brand mark — navy shield + "Claim-ready" wordmark.
 *
 * `variant="dark"` is for the dark hero/landing surface; "light" is for
 * the existing review/packet pages until they're themed.
 */
export function Logo({ className, iconOnly = false, variant = "light" }: LogoProps) {
  const isDark = variant === "dark";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg text-white",
          isDark
            ? "bg-gradient-to-br from-navy-500 to-navy-700 shadow-[0_0_20px_rgba(20,184,166,0.25)] ring-1 ring-white/10"
            : "bg-navy-600 shadow-sm",
        )}
      >
        <Shield className="h-4 w-4" strokeWidth={2.5} />
      </span>
      {!iconOnly && (
        <span
          className={cn(
            "text-base font-bold tracking-tight",
            isDark ? "text-white" : "text-navy-700",
          )}
        >
          Claim-ready
        </span>
      )}
    </div>
  );
}
