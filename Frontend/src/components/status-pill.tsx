import { cn } from "@/lib/utils";

export type StatusKind =
  | "available"
  | "completed"
  | "valid"
  | "on-trip"
  | "dispatched"
  | "active"
  | "in-shop"
  | "warning"
  | "pending"
  | "suspended"
  | "cancelled"
  | "expired"
  | "retired"
  | "draft"
  | "off-duty";

const MAP: Record<StatusKind, { label?: string; tone: "available" | "active" | "warning" | "danger" | "neutral" }> = {
  available: { tone: "available" },
  completed: { tone: "available" },
  valid: { tone: "available" },
  "on-trip": { label: "On Trip", tone: "active" },
  dispatched: { tone: "active" },
  active: { tone: "active" },
  "in-shop": { label: "In Shop", tone: "warning" },
  warning: { tone: "warning" },
  pending: { tone: "warning" },
  suspended: { tone: "warning" },
  cancelled: { tone: "danger" },
  expired: { tone: "danger" },
  retired: { tone: "danger" },
  draft: { tone: "neutral" },
  "off-duty": { label: "Off Duty", tone: "neutral" },
};

const TONE_CLASS: Record<string, string> = {
  available: "bg-status-available-bg text-status-available",
  active: "bg-status-active-bg text-status-active",
  warning: "bg-status-warning-bg text-status-warning",
  danger: "bg-status-danger-bg text-status-danger",
  neutral: "bg-status-neutral-bg text-status-neutral",
};

export function StatusPill({
  status,
  children,
  className,
}: {
  status: StatusKind;
  children?: React.ReactNode;
  className?: string;
}) {
  const cfg = MAP[status];
  const label = children ?? cfg.label ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={cn("status-pill", TONE_CLASS[cfg.tone], className)}>
      <span
        className={cn("h-1.5 w-1.5 rounded-full")}
        style={{ backgroundColor: "currentColor" }}
      />
      {label}
    </span>
  );
}
