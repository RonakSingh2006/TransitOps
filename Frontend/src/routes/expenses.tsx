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
import { Plus, Fuel } from "lucide-react";
import { useState } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: ExpensesPage,
});

type FuelRow = {
  veh: string;
  date: string;
  liters: string;
  cost: string;
};

type ExpRow = {
  trip: string;
  veh: string;
  toll: string;
  misc: string;
  maint: string;
  total: string;
  status: StatusKind;
};

function ExpensesPage() {
  const [fuelRows, setFuelRows] = useState<FuelRow[]>([
    { veh: "VAN-05", date: "05 Jul 2026", liters: "42 L", cost: "3,150" },
    { veh: "TRUCK-11", date: "06 Jul 2026", liters: "110 L", cost: "8,400" },
    { veh: "MINI-08", date: "06 Jul 2026", liters: "28 L", cost: "2,050" },
  ]);

  const [expRows, setExpRows] = useState<ExpRow[]>([
    { trip: "TR001", veh: "VAN-05", toll: "120", misc: "0", maint: "0", total: "120", status: "available" },
    { trip: "TR002", veh: "TRK-12", toll: "340", misc: "150", maint: "18,000", total: "18,490", status: "completed" },
  ]);

  const [fuelDialog, setFuelDialog] = useState(false);
  const [expDialog, setExpDialog] = useState(false);

  // Fuel form state
  const [fuelVeh, setFuelVeh] = useState("");
  const [fuelDate, setFuelDate] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  // Expense form state
  const [expTrip, setExpTrip] = useState("");
  const [expVeh, setExpVeh] = useState("");
  const [expToll, setExpToll] = useState("");
  const [expMisc, setExpMisc] = useState("");
  const [expMaint, setExpMaint] = useState("");

  const totalOpCost =
    fuelRows.reduce((acc, r) => acc + parseInt(r.cost.replace(/,/g, ""), 10), 0) +
    expRows.reduce((acc, r) => acc + parseInt(r.total.replace(/,/g, ""), 10), 0);

  function handleAddFuel(e: React.FormEvent) {
    e.preventDefault();
    setFuelRows((prev) => [
      ...prev,
      { veh: fuelVeh, date: fuelDate, liters: `${fuelLiters} L`, cost: parseInt(fuelCost).toLocaleString("en-IN") },
    ]);
    setFuelVeh("");
    setFuelDate("");
    setFuelLiters("");
    setFuelCost("");
    setFuelDialog(false);
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const toll = parseInt(expToll) || 0;
    const misc = parseInt(expMisc) || 0;
    const maint = parseInt(expMaint) || 0;
    const total = toll + misc + maint;
    setExpRows((prev) => [
      ...prev,
      {
        trip: expTrip,
        veh: expVeh,
        toll: toll.toLocaleString("en-IN"),
        misc: misc.toLocaleString("en-IN"),
        maint: maint.toLocaleString("en-IN"),
        total: total.toLocaleString("en-IN"),
        status: "available" as StatusKind,
      },
    ]);
    setExpTrip("");
    setExpVeh("");
    setExpToll("");
    setExpMisc("");
    setExpMaint("");
    setExpDialog(false);
  }

  return (
    <AppLayout>
      <PageHeader
        title="Fuel Ledger & Expense Audit"
        subtitle="Track fuel intake and per-trip operational spend."
        actions={
          <>
            <Dialog open={fuelDialog} onOpenChange={setFuelDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Fuel className="h-4 w-4 mr-1" /> Log Fuel Receipt
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log Fuel Receipt</DialogTitle>
                  <DialogDescription>
                    Record a fuel refill event for a vehicle.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddFuel} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fuel-veh">Vehicle</Label>
                    <Input id="fuel-veh" placeholder="e.g. VAN-05" value={fuelVeh} onChange={(e) => setFuelVeh(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fuel-date">Date</Label>
                    <Input id="fuel-date" type="date" value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fuel-liters">Liters</Label>
                    <Input id="fuel-liters" type="number" min="1" placeholder="e.g. 42" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fuel-cost">Total Cost (₹)</Label>
                    <Input id="fuel-cost" type="number" min="1" placeholder="e.g. 3150" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} required />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setFuelDialog(false)}>Cancel</Button>
                    <Button type="submit">Log Receipt</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={expDialog} onOpenChange={setExpDialog}>
              <DialogTrigger asChild>
                <Button className="h-10">
                  <Plus className="h-4 w-4 mr-1" /> Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Ancillary Expense</DialogTitle>
                  <DialogDescription>
                    Record toll, miscellaneous or maintenance costs for a trip.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-trip">Trip ID</Label>
                    <Input id="exp-trip" placeholder="e.g. TR010" value={expTrip} onChange={(e) => setExpTrip(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-veh">Vehicle</Label>
                    <Input id="exp-veh" placeholder="e.g. VAN-05" value={expVeh} onChange={(e) => setExpVeh(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="exp-toll">Toll (₹)</Label>
                      <Input id="exp-toll" type="number" min="0" placeholder="0" value={expToll} onChange={(e) => setExpToll(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exp-misc">Misc (₹)</Label>
                      <Input id="exp-misc" type="number" min="0" placeholder="0" value={expMisc} onChange={(e) => setExpMisc(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exp-maint">Maint (₹)</Label>
                      <Input id="exp-maint" type="number" min="0" placeholder="0" value={expMaint} onChange={(e) => setExpMaint(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setExpDialog(false)}>Cancel</Button>
                    <Button type="submit">Add Expense</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
              {fuelRows.map((r, i) => (
                <TableRow key={i}>
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
              {expRows.map((r, i) => (
                <TableRow key={i}>
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
          <div className="text-3xl font-black tracking-tight tabular-nums">
            ₹ {totalOpCost.toLocaleString("en-IN")}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}