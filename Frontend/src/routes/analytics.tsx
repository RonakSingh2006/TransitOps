import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { cn } from "../lib/utils";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const KPIS = [
  { label: "Fuel Efficiency", value: "8.4 km/l", accent: "text-status-active" },
  { label: "Fleet Utilization", value: "81%", accent: "text-status-available" },
  { label: "Total Operational Cost", value: "₹ 34,070", accent: "text-status-warning" },
  { label: "Vehicle ROI", value: "14.2%", accent: "text-primary" },
];

const REVENUE = [
  { m: "Jan", v: 48 },
  { m: "Feb", v: 62 },
  { m: "Mar", v: 55 },
  { m: "Apr", v: 78 },
  { m: "May", v: 71 },
  { m: "Jun", v: 88 },
  { m: "Jul", v: 95 },
];

const COST_ASSETS = [
  { id: "TRUCK-11", pct: 90, cls: "bg-[oklch(0.65_0.19_25)]" },
  { id: "MINI-03", pct: 45, cls: "bg-[oklch(0.7_0.16_70)]" },
  { id: "VAN-05", pct: 15, cls: "bg-status-active" },
];

function AnalyticsPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Strategic Reports & BI Analytics"
        subtitle="Executive intelligence across operations, revenue and ROI."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {KPIS.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {k.label}
            </div>
            <div className={cn("mt-2 text-3xl font-black tracking-tight", k.accent)}>
              {k.value}
            </div>
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mb-6 mt-1">
        <span className="font-semibold text-foreground">ROI Formula:</span> (Revenue − (Maintenance
        + Fuel)) / Acquisition Cost
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,60fr)_minmax(0,40fr)] gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">Monthly Platform Revenue Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Rolling 7-month view</p>
            </div>
            <div className="text-xs text-muted-foreground">
              Peak <span className="font-semibold text-foreground">₹ 9.5 L</span> · Jul
            </div>
          </div>
          <div className="h-64 mt-6 flex items-end justify-between gap-4 px-1">
            {REVENUE.map((r) => (
              <div key={r.m} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full relative flex flex-col justify-end h-56">
                  <div
                    className="w-full rounded-t-md bg-status-active/85 hover:bg-status-active transition-colors"
                    style={{ height: `${r.v}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">{r.m}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold">Top Costliest Fleet Assets</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Rolling 30-day operational spend</p>
          <div className="mt-6 space-y-5">
            {COST_ASSETS.map((r) => (
              <div key={r.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-mono font-semibold">{r.id}</span>
                  <span className="text-muted-foreground tabular-nums">{r.pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", r.cls)}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-5 border-t text-xs text-muted-foreground">
            Ranked by combined Fuel + Maintenance overhead
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}