import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { StatusPill, type StatusKind } from "../components/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Plus, Fuel } from "lucide-react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: ExpensesPage,
});

const FUEL = [
  { veh: "VAN-05", date: "05 Jul 2026", liters: "42 L", cost: "3,150" },
  { veh: "TRUCK-11", date: "06 Jul 2026", liters: "110 L", cost: "8,400" },
  { veh: "MINI-08", date: "06 Jul 2026", liters: "28 L", cost: "2,050" },
];

const EXP: { trip: string; veh: string; toll: string; misc: string; maint: string; total: string; status: StatusKind }[] = [
  { trip: "TR001", veh: "VAN-05", toll: "120", misc: "0", maint: "0", total: "120", status: "available" },
  { trip: "TR002", veh: "TRK-12", toll: "340", misc: "150", maint: "18,000", total: "18,490", status: "completed" },
];

function ExpensesPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Fuel Ledger & Expense Audit"
        subtitle="Track fuel intake and per-trip operational spend."
        actions={
          <>
            <Button variant="outline" className="h-10">
              <Fuel className="h-4 w-4 mr-1" /> Log Fuel Receipt
            </Button>
            <Button className="h-10">
              <Plus className="h-4 w-4 mr-1" /> Add Expense
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold">Fuel Logs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Refuel events per vehicle</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Total Cost (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FUEL.map((r) => (
                <TableRow key={r.veh + r.date}>
                  <TableCell className="font-mono font-semibold">{r.veh}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell className="tabular-nums">{r.liters}</TableCell>
                  <TableCell className="tabular-nums">{r.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold">Ancillary Operating Expenses</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tolls, miscellaneous outlays and maintenance overhead per trip
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Toll (₹)</TableHead>
                <TableHead>Misc (₹)</TableHead>
                <TableHead>Maintenance (₹)</TableHead>
                <TableHead>Total (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXP.map((r) => (
                <TableRow key={r.trip}>
                  <TableCell className="font-mono font-semibold">{r.trip}</TableCell>
                  <TableCell>{r.veh}</TableCell>
                  <TableCell className="tabular-nums">{r.toll}</TableCell>
                  <TableCell className="tabular-nums">{r.misc}</TableCell>
                  <TableCell className="tabular-nums">{r.maint}</TableCell>
                  <TableCell className="tabular-nums font-semibold">{r.total}</TableCell>
                  <TableCell>
                    <StatusPill status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-primary text-primary-foreground">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">
              Auto-Calculated
            </div>
            <div className="text-sm mt-1 opacity-90">
              Total Operational Cost = Fuel + Maintenance Overhead
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight tabular-nums">₹ 34,070</div>
        </Card>
      </div>
    </AppLayout>
  );
}