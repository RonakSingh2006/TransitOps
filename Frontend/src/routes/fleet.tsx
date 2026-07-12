import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
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
import { Plus, Search, AlertTriangle } from "lucide-react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fleet",
  component: FleetPage,
});

const ROWS: {
  reg: string;
  model: string;
  type: string;
  cap: string;
  odo: string;
  cost: string;
  status: StatusKind;
}[] = [
  { reg: "GJ01AB4521", model: "VAN-05", type: "Van", cap: "500 kg", odo: "74,000", cost: "6,20,000", status: "available" },
  { reg: "GJ01AB9981", model: "TRUCK-11", type: "Truck", cap: "5 Ton", odo: "1,82,000", cost: "24,50,000", status: "on-trip" },
  { reg: "GJ01AB1120", model: "MINI-03", type: "Mini", cap: "1 Ton", odo: "66,000", cost: "4,10,000", status: "in-shop" },
  { reg: "GJ01AB0008", model: "VAN-09", type: "Van", cap: "750 kg", odo: "2,41,900", cost: "5,90,000", status: "retired" },
];

function FleetPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Vehicle Registry"
        subtitle="Master asset database — unique registration enforced."
      />

      <Card className="p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search registration number (e.g. GJ01AB…)" className="pl-9 h-10" />
        </div>
        <div className="text-xs text-muted-foreground hidden md:block">
          <span className="font-semibold text-foreground">{ROWS.length}</span> vehicles ·{" "}
          <span className="font-semibold text-foreground">1</span> retired
        </div>
        <Button className="h-10">
          <Plus className="h-4 w-4 mr-1" /> Add Vehicle
        </Button>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration No.</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Max Capacity</TableHead>
              <TableHead>Odometer (KM)</TableHead>
              <TableHead>Acquisition Cost (₹)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.reg}>
                <TableCell className="font-mono font-semibold">{r.reg}</TableCell>
                <TableCell className="font-medium">{r.model}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.cap}</TableCell>
                <TableCell className="tabular-nums">{r.odo}</TableCell>
                <TableCell className="tabular-nums">{r.cost}</TableCell>
                <TableCell>
                  <StatusPill status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      
    </AppLayout>
  );
}