"use client";

import { useState, useEffect } from "react";
import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
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
import { StatusPill, type StatusKind } from "../components/status-pill";
import { cn } from "../lib/utils";
import { Search } from "lucide-react";
import { api } from "../lib/api/client";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

interface DashboardStats {
  kpis: { label: string; value: string; accent: string }[];
  fleetUtilization: number;
  totalAssets: number;
  fleetDistribution: { label: string; pct: number; cls: string }[];
}

interface Trip {
  id: string;
  tripCode: string;
  vehicle?: { model: string } | null;
  driver?: { name: string } | null;
  status: string;
  eta?: string | null;
  sourceDepot: string;
  destinationHub: string;
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>("/dashboard/stats"),
      api.get<Trip[]>("/trips"),
    ]).then(([s, t]) => {
      setStats(s);
      setTrips(t);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredTrips = trips.filter((t) => {
    const matchStatus =
      statusFilter === "All" ||
      t.status === statusFilter.toLowerCase().replace(/\s+/g, "-");
    const matchSearch =
      !searchQuery ||
      t.tripCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.vehicle?.model ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.driver?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeTrips = filteredTrips.filter(
    (t) => t.status === "dispatched"
  ).length;
  const pendingTrips = filteredTrips.filter((t) => t.status === "draft").length;
  const completedTrips = filteredTrips.filter((t) => t.status === "completed").length;

  if (loading) return <AppLayout><div className="p-8 text-muted-foreground">Loading dashboard...</div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time operational health across the depot."
      />

      <Card className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
          Filters
        </span>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Status: All</SelectItem>
            <SelectItem value="Dispatched">Status: Dispatched</SelectItem>
            <SelectItem value="Completed">Status: Completed</SelectItem>
            <SelectItem value="Draft">Status: Draft</SelectItem>
            <SelectItem value="Cancelled">Status: Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips by code, vehicle, driver…"
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {stats?.kpis.map((k) => (
          <Card key={k.label} className="p-4 relative overflow-hidden">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", k.accent)} />
            <div className="pl-2">
              <div className="text-2xl font-black tracking-tight">{k.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 leading-tight">{k.label}</div>
            </div>
          </Card>
        ))}
        <Card className="p-4 relative overflow-hidden col-span-2 md:col-span-1">
          <div className="pl-1">
            <div className="text-2xl font-black tracking-tight">{stats?.fleetUtilization ?? 0}%</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Fleet Utilization</div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-status-available" style={{ width: `${stats?.fleetUtilization ?? 0}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent Trips</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredTrips.length} trip{filteredTrips.length !== 1 ? "s" : ""} found
                {filteredTrips.length !== trips.length && ` (filtered from ${trips.length})`}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Updated just now</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip Code</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No trips match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono font-semibold">{t.tripCode}</TableCell>
                    <TableCell>{t.vehicle?.model ?? "—"}</TableCell>
                    <TableCell>{t.driver?.name ?? "—"}</TableCell>
                    <TableCell>
                      <StatusPill status={t.status as StatusKind} />
                    </TableCell>
                    <TableCell className="text-right">{t.eta ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Fleet Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live asset utilization breakdown</p>
          <div className="mt-6 space-y-5">
            {(stats?.fleetDistribution ?? []).map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-muted-foreground tabular-nums">{r.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full", r.cls)} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t text-xs text-muted-foreground">
            Total assets tracked <span className="font-semibold text-foreground">{stats?.totalAssets ?? 0}</span> · Depot GJ4
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}