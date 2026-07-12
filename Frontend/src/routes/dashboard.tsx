"use client";

import { useState } from "react";
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

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

type Trip = {
  id: string;
  vehicle: string;
  driver: string;
  status: StatusKind;
  eta: string;
  vehicleType: string;
  region: string;
};

const TRIPS: Trip[] = [
  { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "on-trip", eta: "45 min", vehicleType: "Van", region: "East" },
  { id: "TR002", vehicle: "TRK-12", driver: "John", status: "completed", eta: "—", vehicleType: "Truck", region: "West" },
  { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "dispatched", eta: "1h 10m", vehicleType: "Mini", region: "North" },
  { id: "TR004", vehicle: "—", driver: "—", status: "draft", eta: "Awaiting vehicle", vehicleType: "Van", region: "East" },
];

function DashboardPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrips = TRIPS.filter((t) => {
    const matchType = typeFilter === "All" || t.vehicleType === typeFilter;
    const matchStatus =
      statusFilter === "All" ||
      t.status === statusFilter.toLowerCase().replace(/\s+/g, "-");
    const matchRegion = regionFilter === "All" || t.region === regionFilter;
    const matchSearch =
      !searchQuery ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchRegion && matchSearch;
  });

  const activeTrips = filteredTrips.filter(
    (t) => t.status === "on-trip" || t.status === "dispatched"
  ).length;
  const pendingTrips = filteredTrips.filter((t) => t.status === "draft").length;
  const completedTrips = filteredTrips.filter((t) => t.status === "completed").length;

  const fleetDist = [
    { label: "Available", pct: 60, cls: "bg-status-available" },
    { label: "On Trip", pct: 30, cls: "bg-status-active" },
    { label: "In Shop", pct: 8, cls: "bg-status-warning" },
    { label: "Retired", pct: 2, cls: "bg-status-danger/60" },
  ];

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

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Vehicle Type: All</SelectItem>
            <SelectItem value="Van">Vehicle Type: Van</SelectItem>
            <SelectItem value="Truck">Vehicle Type: Truck</SelectItem>
            <SelectItem value="Mini">Vehicle Type: Mini</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Status: All</SelectItem>
            <SelectItem value="On Trip">Status: On Trip</SelectItem>
            <SelectItem value="Completed">Status: Completed</SelectItem>
            <SelectItem value="Dispatched">Status: Dispatched</SelectItem>
            <SelectItem value="Draft">Status: Draft</SelectItem>
          </SelectContent>
        </Select>

        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Region: All</SelectItem>
            <SelectItem value="East">Region: East</SelectItem>
            <SelectItem value="West">Region: West</SelectItem>
            <SelectItem value="North">Region: North</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips by ID, vehicle, driver…"
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <Card className="p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-active" />
          <div className="pl-2">
            <div className="text-2xl font-black tracking-tight">{activeTrips}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 leading-tight">
              Active Trips
            </div>
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-available" />
          <div className="pl-2">
            <div className="text-2xl font-black tracking-tight">{completedTrips}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 leading-tight">
              Completed Trips
            </div>
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-neutral" />
          <div className="pl-2">
            <div className="text-2xl font-black tracking-tight">{pendingTrips}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 leading-tight">
              Pending Trips
            </div>
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <div className="pl-2">
            <div className="text-2xl font-black tracking-tight">26</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 leading-tight">
              Drivers On Duty
            </div>
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden col-span-2 md:col-span-1">
          <div className="pl-1">
            <div className="text-2xl font-black tracking-tight">60%</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Fleet Utilization</div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-status-available" style={{ width: "60%" }} />
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
                {filteredTrips.length !== TRIPS.length && ` (filtered from ${TRIPS.length})`}
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
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No trips match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono font-semibold">{t.id}</TableCell>
                    <TableCell>{t.vehicle}</TableCell>
                    <TableCell>{t.driver}</TableCell>
                    <TableCell>
                      <StatusPill status={t.status} />
                    </TableCell>
                    <TableCell className="text-right">{t.eta}</TableCell>
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
            {fleetDist.map((r) => (
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
            Total assets tracked <span className="font-semibold text-foreground">42</span> · Depot GJ4
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}