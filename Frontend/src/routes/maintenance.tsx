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
import { ArrowRight } from "lucide-react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/maintenance",
  component: MaintenancePage,
});

const LOGS: { veh: string; svc: string; cost: string; status: StatusKind }[] = [
  { veh: "VAN-05", svc: "Oil Change", cost: "2,500", status: "in-shop" },
  { veh: "TRUCK-11", svc: "Engine Repair", cost: "18,000", status: "completed" },
  { veh: "MINI-03", svc: "Tyre Replace", cost: "6,200", status: "in-shop" },
];

function MaintenancePage() {
  return (
    <AppLayout>
      <PageHeader
        title="Lifecycle Maintenance Log"
        subtitle="Workshop tickets and vehicle downtime records."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">New Service Ticket</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Input defaultValue="VAN-05" />
            </div>
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Input defaultValue="Oil Change" />
            </div>
            <div className="space-y-1.5">
              <Label>Cost (₹)</Label>
              <Input type="number" defaultValue={2500} />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input defaultValue="07/07/2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Input defaultValue="Active" />
            </div>
            <Button className="w-full h-11 mt-2">Save Ticket Entry</Button>
          </div>

          <div className="mt-6 rounded-xl border bg-muted/40 p-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
              State Transitions
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <StatusPill status="available" />
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground italic">create active record</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <StatusPill status="in-shop" />
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status="in-shop" />
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground italic">close (not retired)</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <StatusPill status="available" />
              </div>
            </div>
            
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold">Active Service Diagnostic Logs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current workshop tickets and their operational cost
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Action</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOGS.map((l) => (
                <TableRow key={l.veh + l.svc}>
                  <TableCell className="font-mono font-semibold">{l.veh}</TableCell>
                  <TableCell>{l.svc}</TableCell>
                  <TableCell className="tabular-nums">{l.cost}</TableCell>
                  <TableCell>
                    <StatusPill status={l.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">3 open tickets</span>
            <span className="font-semibold">
              Total workshop spend: <span className="font-mono">₹ 26,700</span>
            </span>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}