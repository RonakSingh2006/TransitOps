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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Plus, Fuel } from "lucide-react";
import { api } from "../lib/api/client";
import { useState, useEffect } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: ExpensesPage,
});

interface FuelRow { id: string; vehicle: { id: string; model: string } | null; date: string; liters: string; cost: string }
interface ExpRow { id: string; trip: { id: string; tripCode: string } | null; vehicle: { id: string; model: string } | null; toll: string; misc: string; maint: string; total: string }
interface V { id: string; model: string; registration: string }
interface T { id: string; tripCode: string }

function ExpensesPage() {
  const [fuelRows, setFuelRows] = useState<FuelRow[]>([]);
  const [expRows, setExpRows] = useState<ExpRow[]>([]);
  const [vehicles, setVehicles] = useState<V[]>([]);
  const [trips, setTrips] = useState<T[]>([]);

  const [fuelDialog, setFuelDialog] = useState(false);
  const [fVehicleId, setFVehicleId] = useState("");
  const [fDate, setFDate] = useState("");
  const [fLiters, setFLiters] = useState("");
  const [fCost, setFCost] = useState("");

  const [expDialog, setExpDialog] = useState(false);
  const [eTripId, setETripId] = useState("");
  const [eVehicleId, setEVehicleId] = useState("");
  const [eToll, setEToll] = useState("0");
  const [eMisc, setEMisc] = useState("0");
  const [eMaint, setEMaint] = useState("0");

  const [loading, setLoading] = useState(true);
  const [savingFuel, setSavingFuel] = useState(false);
  const [savingExp, setSavingExp] = useState(false);

  const load = () => Promise.all([
    api.get<FuelRow[]>("/fuel"),
    api.get<ExpRow[]>("/expenses"),
    api.get<V[]>("/vehicles"),
    api.get<T[]>("/trips"),
  ]).then(([f, e, v, t]) => { setFuelRows(f); setExpRows(e); setVehicles(v); setTrips(t); });

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fVehicleId || !fDate || !fLiters || !fCost) return;
    setSavingFuel(true);
    try {
      await api.post("/fuel", { vehicleId: fVehicleId, date: fDate, liters: fLiters, cost: fCost });
      setFVehicleId(""); setFDate(""); setFLiters(""); setFCost("");
      setFuelDialog(false);
      await load();
    } catch (err: any) { alert(err.message); } finally { setSavingFuel(false); }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eTripId || !eVehicleId) return;
    setSavingExp(true);
    try {
      await api.post("/expenses", { tripId: eTripId, vehicleId: eVehicleId, toll: eToll, misc: eMisc, maint: eMaint });
      setETripId(""); setEVehicleId(""); setEToll("0"); setEMisc("0"); setEMaint("0");
      setExpDialog(false);
      await load();
    } catch (err: any) { alert(err.message); } finally { setSavingExp(false); }
  };

  const totalOpCost =
    fuelRows.reduce((acc, r) => acc + (parseInt(r.cost.replace(/,/g, "")) || 0), 0) +
    expRows.reduce((acc, r) => acc + (parseInt(r.total.replace(/,/g, "")) || 0), 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-muted-foreground">Loading expenses...</div>
      </AppLayout>
    );
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
                  <DialogDescription>Record a fuel refill event for a vehicle.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddFuel} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Vehicle</Label>
                    <Select value={fVehicleId} onValueChange={setFVehicleId}>
                      <SelectTrigger>
                        <SelectValue placeholder={vehicles.length === 0 ? "No vehicles" : "Select vehicle"} />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.model} ({v.registration})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Liters</Label>
                    <Input type="number" min="1" value={fLiters} onChange={(e) => setFLiters(e.target.value)} placeholder="e.g. 42" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total Cost (Rs)</Label>
                    <Input type="number" min="1" value={fCost} onChange={(e) => setFCost(e.target.value)} placeholder="e.g. 3150" required />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setFuelDialog(false)}>Cancel</Button>
                    <Button type="submit" disabled={savingFuel || !fVehicleId}>
                      {savingFuel ? "Saving..." : "Log Receipt"}
                    </Button>
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
                  <DialogDescription>Record toll, miscellaneous or maintenance costs for a trip.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Trip</Label>
                    <Select value={eTripId} onValueChange={setETripId}>
                      <SelectTrigger>
                        <SelectValue placeholder={trips.length === 0 ? "No trips" : "Select trip"} />
                      </SelectTrigger>
                      <SelectContent>
                        {trips.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.tripCode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Vehicle</Label>
                    <Select value={eVehicleId} onValueChange={setEVehicleId}>
                      <SelectTrigger>
                        <SelectValue placeholder={vehicles.length === 0 ? "No vehicles" : "Select vehicle"} />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.model} ({v.registration})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Toll (Rs)</Label>
                      <Input type="number" min="0" value={eToll} onChange={(e) => setEToll(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Misc (Rs)</Label>
                      <Input type="number" min="0" value={eMisc} onChange={(e) => setEMisc(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Maint (Rs)</Label>
                      <Input type="number" min="0" value={eMaint} onChange={(e) => setEMaint(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setExpDialog(false)}>Cancel</Button>
                    <Button type="submit" disabled={savingExp || !eTripId || !eVehicleId}>
                      {savingExp ? "Saving..." : "Add Expense"}
                    </Button>
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
                <TableHead>Total Cost (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono font-semibold">{r.vehicle?.model ?? r.id}</TableCell>
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
            <p className="text-xs text-muted-foreground mt-0.5">Tolls, miscellaneous outlays and maintenance overhead per trip</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Toll (Rs)</TableHead>
                <TableHead>Misc (Rs)</TableHead>
                <TableHead>Maintenance (Rs)</TableHead>
                <TableHead>Total (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono font-semibold">{r.trip?.tripCode ?? r.id}</TableCell>
                  <TableCell>{r.vehicle?.model ?? r.id}</TableCell>
                  <TableCell className="tabular-nums">{r.toll}</TableCell>
                  <TableCell className="tabular-nums">{r.misc}</TableCell>
                  <TableCell className="tabular-nums">{r.maint}</TableCell>
                  <TableCell className="tabular-nums font-semibold">{r.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card className="p-5 flex items-center justify-between bg-primary text-primary-foreground">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">Auto-Calculated</div>
            <div className="text-sm mt-1 opacity-90">Total Operational Cost = Fuel + Maintenance Overhead</div>
          </div>
          <div className="text-3xl font-black tracking-tight tabular-nums">
            Rs {totalOpCost.toLocaleString("en-IN")}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}