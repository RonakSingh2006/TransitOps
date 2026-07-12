import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { StatusPill, type StatusKind } from "../components/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Plus, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/drivers",
  component: DriversPage,
});

type Row = {
  name: string;
  lic: string;
  cat: string;
  expiry: string;
  expired?: boolean;
  phone: string;
  rate: string;
  safety: number;
  safetyTone: "green" | "amber" | "gray";
  status: StatusKind;
};

const ROWS: Row[] = [
  { name: "Alex", lic: "DL-88213", cat: "LMV", expiry: "12/2028", phone: "98765xxxxx", rate: "96%", safety: 9.2, safetyTone: "green", status: "available" },
  { name: "John", lic: "DL-44120", cat: "HMV", expiry: "03/2025 EXPIRED", expired: true, phone: "98220xxxxx", rate: "81%", safety: 7.1, safetyTone: "amber", status: "suspended" },
  { name: "Priya", lic: "DL-77031", cat: "LMV", expiry: "08/2029", phone: "99110xxxxx", rate: "99%", safety: 9.8, safetyTone: "green", status: "on-trip" },
  { name: "Suresh", lic: "DL-90045", cat: "HMV", expiry: "01/2027", phone: "97440xxxxx", rate: "88%", safety: 8.4, safetyTone: "gray", status: "off-duty" },
];

const SAFETY_TONE: Record<"green" | "amber" | "gray", string> = {
  green: "bg-status-available-bg text-status-available",
  amber: "bg-status-warning-bg text-status-warning",
  gray: "bg-status-neutral-bg text-status-neutral",
};

function DriversPage() {
  const [active, setActive] = useState("Available");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <AppLayout>
      <PageHeader
        title="Drivers & Safety Roster Management"
        subtitle="License validity, safety score and duty state."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10">
                <Plus className="h-4 w-4 mr-1" /> Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>
                  Fill in the driver details below. Trip rate, safety score and status are assigned
                  dynamically.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDialogOpen(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="driver-name">Driver Name</Label>
                  <Input id="driver-name" placeholder="e.g. Rajesh" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lic-no">License No.</Label>
                  <Input id="lic-no" placeholder="e.g. DL-12345" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="e.g. LMV, HMV" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiry">License Expiry</Label>
                  <Input id="expiry" type="month" placeholder="MM/YYYY" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input id="phone" placeholder="e.g. 98765xxxxx" required />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
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
              <TableHead>Driver</TableHead>
              <TableHead>License No.</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Trip Rate</TableHead>
              <TableHead>Safety Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-semibold">{r.name}</TableCell>
                <TableCell className="font-mono">{r.lic}</TableCell>
                <TableCell>{r.cat}</TableCell>
                <TableCell className={cn(r.expired && "text-status-danger font-semibold")}>
                  {r.expiry}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{r.phone}</TableCell>
                <TableCell className="tabular-nums">{r.rate}</TableCell>
                <TableCell>
                  <span className={cn("status-pill", SAFETY_TONE[r.safetyTone])}>
                    ★ {r.safety.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusPill status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="mt-5 p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mr-1">
          Quick status
        </span>
        {["Available", "On Trip", "Off Duty", "Suspended"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={active === s ? "default" : "outline"}
            onClick={() => setActive(s)}
            className="h-8"
          >
            {s}
          </Button>
        ))}
      </Card>

      
    </AppLayout>
  );
}