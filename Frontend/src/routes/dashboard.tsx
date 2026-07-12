import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { StatusPill } from "../components/status-pill";
import { cn } from "../lib/utils";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const KPIS = [
  { label: "Active Vehicles", value: "53", accent: "bg-status-active" },
  { label: "Available Vehicles", value: "42", accent: "bg-status-available" },
  { label: "In Maintenance", value: "05", accent: "bg-status-warning" },
  { label: "Active Trips", value: "18", accent: "bg-status-active" },
  { label: "Pending Trips", value: "09", accent: "bg-status-neutral" },
  { label: "Drivers On Duty", value: "26", accent: "bg-primary" },
];

function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time operational health across the depot."
      />

      {/* Filter strip */}
      <Card className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
          Filters
        </span>
        {[
          { label: "Vehicle Type", opts: ["All", "Van", "Truck", "Mini"] },
          { label: "Status", opts: ["All", "Available", "On Trip", "In Shop"] },
          { label: "Region", opts: ["All", "East", "West", "North"] },
        ].map((f) => (
          <Select key={f.label} defaultValue={f.opts[0]}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              {f.opts.map((o) => (
                <SelectItem key={o} value={o}>
                  {f.label}: {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {KPIS.map((k) => (
          <Card key={k.label} className="p-4 relative overflow-hidden">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", k.accent)} />
            <div className="pl-2">
              <div className="text-2xl font-black tracking-tight">{k.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 leading-tight">
                {k.label}
              </div>
            </div>
          </Card>
        ))}
        <Card className="p-4 relative overflow-hidden col-span-2 md:col-span-1">
          <div className="pl-1">
            <div className="text-2xl font-black tracking-tight">81%</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
              Fleet Utilization
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-status-available" style={{ width: "81%" }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Split content */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent Trips</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live dispatcher pipeline snapshot
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Updated just now</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono font-semibold">TR001</TableCell>
                <TableCell>VAN-05</TableCell>
                <TableCell>Alex</TableCell>
                <TableCell>
                  <StatusPill status="on-trip" />
                </TableCell>
                <TableCell className="text-right">45 min</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-semibold">TR002</TableCell>
                <TableCell>TRK-12</TableCell>
                <TableCell>John</TableCell>
                <TableCell>
                  <StatusPill status="completed" />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-semibold">TR003</TableCell>
                <TableCell>MINI-08</TableCell>
                <TableCell>Priya</TableCell>
                <TableCell>
                  <StatusPill status="dispatched" />
                </TableCell>
                <TableCell className="text-right">1h 10m</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-semibold">TR004</TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell>
                  <StatusPill status="draft" />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">Awaiting vehicle</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Fleet Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live asset utilization breakdown
          </p>
          <div className="mt-6 space-y-5">
            {[
              { label: "Available", pct: 60, cls: "bg-status-available" },
              { label: "On Trip", pct: 30, cls: "bg-status-active" },
              { label: "In Shop", pct: 8, cls: "bg-status-warning" },
              { label: "Retired", pct: 2, cls: "bg-status-danger/60" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-muted-foreground tabular-nums">{r.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", r.cls)}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t text-xs text-muted-foreground">
            Total assets tracked <span className="font-semibold text-foreground">72</span> · Depot
            GJ4
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}