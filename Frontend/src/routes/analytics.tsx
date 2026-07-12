import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { api } from "../lib/api/client";
import { useState, useEffect } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

interface AnalyticsReport {
  kpis: { label: string; value: string; accent: string }[];
  revenue: { m: string; v: number }[];
  costliestAssets: { model: string; registration: string; roi: string }[];
  totalVehicles: number;
}

function AnalyticsPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsReport>("/analytics/reports").then(setReport).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><div className="p-8 text-muted-foreground">Loading analytics...</div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="Strategic Reports & BI Analytics"
        subtitle="Executive intelligence across operations, revenue and ROI."
        actions={
          <a href="/api/analytics/export/csv" download>
            <Button variant="outline" className="h-10">Export CSV</Button>
          </a>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {report?.kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className={cn("mt-2 text-3xl font-black tracking-tight", k.accent)}>{k.value}</div>
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mb-6 mt-1">
        <span className="font-semibold text-foreground">ROI Formula:</span> (Revenue − (Maintenance + Fuel)) / Acquisition Cost
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
            {(report?.revenue ?? []).map((r) => (
              <div key={r.m} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full relative flex flex-col justify-end h-56">
                  <div className="w-full rounded-t-md bg-status-active/85 hover:bg-status-active transition-colors" style={{ height: `${r.v}%` }} />
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">{r.m}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold">Vehicle ROI Rankings</h3>
          <p className="text-xs text-muted-foreground mt-0.5">By operational efficiency</p>
          <div className="mt-6 space-y-5">
            {(report?.costliestAssets ?? []).map((r) => (
              <div key={r.registration}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-mono font-semibold">{r.model}</span>
                  <span className={cn("tabular-nums", parseFloat(r.roi) > 0 ? "text-status-available" : "text-status-danger")}>{r.roi}%</span>
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