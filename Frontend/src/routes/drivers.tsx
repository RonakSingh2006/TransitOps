import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { StatusPill, type StatusKind } from "../components/status-pill";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../components/ui/dialog";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api/client";
import { useState, useEffect } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/drivers",
  component: DriversPage,
});

interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  category: string;
  licenseExpiry: string;
  phone: string;
  tripRate: string;
  safetyScore: number;
  safetyTone: string;
  status: string;
}

const SAFETY_TONE: Record<string, string> = {
  green: "bg-status-available-bg text-status-available",
  amber: "bg-status-warning-bg text-status-warning",
  gray: "bg-status-neutral-bg text-status-neutral",
};

const loadDrivers = (set: (d: Driver[]) => void) => api.get<Driver[]>("/drivers").then(set);

function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [active, setActive] = useState("Available");

  const load = () => loadDrivers(setDrivers);

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <AppLayout><div className="p-8 text-muted-foreground">Loading drivers...</div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="Drivers & Safety Roster Management"
        subtitle="License validity, safety score and duty state."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10"><Plus className="h-4 w-4 mr-1" /> Add Driver</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>Fill in the driver details below. Trip rate, safety score and status are assigned dynamically.</DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); await api.post("/drivers", Object.fromEntries(fd)); setDialogOpen(false); load(); }} className="space-y-4">
                <div className="space-y-1.5"><Label htmlFor="dname">Driver Name</Label><Input id="dname" name="name" placeholder="e.g. Rajesh" required /></div>
                <div className="space-y-1.5"><Label htmlFor="dlic">License No.</Label><Input id="dlic" name="licenseNo" placeholder="e.g. DL-12345" required /></div>
                <div className="space-y-1.5"><Label htmlFor="dcat">Category</Label><Input id="dcat" name="category" placeholder="e.g. LMV, HMV" required /></div>
                <div className="space-y-1.5"><Label htmlFor="dexp">License Expiry</Label><Input id="dexp" name="licenseExpiry" type="month" placeholder="MM/YYYY" required /></div>
                <div className="space-y-1.5"><Label htmlFor="dphone">Contact Number</Label><Input id="dphone" name="phone" placeholder="e.g. 98765xxxxx" required /></div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Driver</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead><TableHead>License No.</TableHead><TableHead>Category</TableHead><TableHead>Expiry</TableHead><TableHead>Contact</TableHead><TableHead>Trip Rate</TableHead><TableHead>Safety Score</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-semibold">{r.name}</TableCell>
                <TableCell className="font-mono">{r.licenseNo}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell className={cn(r.licenseExpiry.includes("EXPIRED") && "text-status-danger font-semibold")}>{r.licenseExpiry}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{r.phone}</TableCell>
                <TableCell className="tabular-nums">{r.tripRate}</TableCell>
                <TableCell>
                  <span className={cn("status-pill", SAFETY_TONE[r.safetyTone] || "bg-status-neutral-bg text-status-neutral")}>★ {r.safetyScore.toFixed(1)}</span>
                </TableCell>
                <TableCell><StatusPill status={r.status as StatusKind} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card className="mt-5 p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mr-1">Quick status</span>
        {["Available", "On Trip", "Off Duty", "Suspended"].map((s) => (
          <Button key={s} size="sm" variant={active === s ? "default" : "outline"} onClick={() => setActive(s)} className="h-8">{s}</Button>
        ))}
      </Card>
    </AppLayout>
  );
}