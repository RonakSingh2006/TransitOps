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
import { Plus, Fuel } from "lucide-react";
import { api } from "../lib/api/client";
import { useState, useEffect } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: ExpensesPage,
});

interface FuelRow { id: string; vehicle: { id: string; model: string } | null; date: string; liters: string; cost: string }
interface ExpRow { id: string; trip: { id: string; tripCode: string } | null; vehicle: { id: string; model: string } | null; toll: string; misc: string; maint: string; total: string; status: string }

function ExpensesPage() {
  const [fuelRows, setFuelRows] = useState<FuelRow[]>([]);
  const [expRows, setExpRows] = useState<ExpRow[]>([]);

  // Fuel dialog state
  const [fuelDialog, setFuelDialog] = useState(false);
  const [fVehicleId, setFVehicleId] = useState("");
  const [fDate, setFDate] = useState("");
  const [fLiters, setFLiters] = useState("");
  const [fCost, setFCost] = useState("");

  // Expense dialog state
  const [expDialog, setExpDialog] = useState(false);
  const [eTripId, setETripId] = useState("");
  const [eVehicleId, setEVehicleId] = useState("");
  const [eToll, setEToll] = useState("0");
  const [eMisc, setEMisc] = useState("0");
  const [eMaint, setEMaint] = useState("0");

  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([
    api.get<FuelRow[]>("/fuel"),
    api.get<ExpRow[]>("/expenses"),
  ]).then(([f, e]) => { setFuelRows(f); setExpRows(e); });

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fVehicleId || !fDate || !fLiters || !fCost) return;
    try {
      await api.post("/fuel", { vehicleId: fVehicleId, date: fDate, liters: fLiters, cost: fCost });
      setFVehicleId(""); setFDate(""); setFLiters(""); setFCost("");
      setFuelDialog(false);
      await load();
    } catch (err: any) { alert(err.message); }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eTripId || !eVehicleId) return;
    try {
      await api.post("/expenses", { tripId: eTripId, vehicleId: eVehicleId, toll: eToll, misc: eMisc, maint: eMaint });
      setETripId(""); setEVehicleId(""); setEToll("0"); setEMisc("0"); setEMaint("0");
      setExpDialog(false);
      await load();
    } catch (err: any) { alert(err.message); }
  };

  const totalOpCost =
    fuelRows.reduce((acc, r) => acc + (parseInt(r.cost.replace(/,/g, "")) || 0), 0) +
    expRows.reduce((acc, r) => acc + (parseInt(r.total.replace(/,/g, "")) || 0), 0);

  if (loading) return <AppLayout><div className="p-8 text-muted-foreground">Loading expenses...</div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader title="Fuel Ledger & Expense Audit" subtitle="Track fuel intake and per-trip operational spend."
        actions={<>
          <Dialog open={fuelDialog} onOpenChange={setFuelDialog}>
            <DialogTrigger asChild><Button variant="outline" className="h-10"><Fuel className="h-4 w-4 mr-1" /> Log Fuel Receipt</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Log Fuel Receipt</DialogTitle><DialogDescription>Record a fuel refill event for a vehicle.</DialogDescription></DialogHeader>
              <form onSubmit={handleAddFuel} className="space-y-4">
                <div className="space-y-1.5"><Label>Vehicle ID</Label><Input value={fVehicleId} onChange={e => setFVehicleId(e.target.value)} placeholder="Vehicle ID from fleet" required /></div>
                <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={fDate} onChange={e => setFDate(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label>Liters</Label><Input type="number" min="1" value={fLiters} onChange={e => setFLiters(e.target.value)} placeholder="e.g. 42" required /></div>
                <div className="space-y-1.5"><Label>Total Cost (₹)</Label><Input type="number" min="1" value={fCost} onChange={e => setFCost(e.target.value)} placeholder="e.g. 3150" required /></div>
                <div className="flex items-center justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setFuelDialog(false)}>Cancel</Button><Button type="submit">Log Receipt</Button></div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={expDialog} onOpenChange={setExpDialog}>
            <DialogTrigger asChild><Button className="h-10"><Plus className="h-4 w-4 mr-1" /> Add Expense</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Add Ancillary Expense</DialogTitle><DialogDescription>Record toll, miscellaneous or maintenance costs for a trip.</DialogDescription></DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-1.5"><Label>Trip ID</Label><Input value={eTripId} onChange={e => setETripId(e.target.value)} placeholder="Trip ID (must exist in DB)" required /></div>
                <div className="space-y-1.5"><Label>Vehicle ID</Label><Input value={eVehicleId} onChange={e => setEVehicleId(e.target.value)} placeholder="Vehicle ID" required /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5"><Label>Toll (₹)</Label><Input type="number" min="0" value={eToll} onChange={e => setEToll(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Misc (₹)</Label><Input type="number" min="0" value={eMisc} onChange={e => setEMisc(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Maint (₹)</Label><Input type="number" min="0" value={eMaint} onChange={e => setEMaint(e.target.value)} /></div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setExpDialog(false)}>Cancel</Button><Button type="submit">Add Expense</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </>}
      />
      <div className="space-y-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b"><h3 className="font-semibold">Fuel Logs</h3><p className="text-xs text-muted-foreground mt-0.5">Refuel events per vehicle</p></div>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Date</TableHead><TableHead>Liters</TableHead><TableHead>Total Cost (₹)</TableHead></TableRow></TableHeader>
            <TableBody>{fuelRows.map(r => (
              <TableRow key={r.id}><TableCell className="font-mono font-semibold">{r.vehicle?.model ?? r.id}</TableCell><TableCell>{r.date}</TableCell><TableCell className="tabular-nums">{r.liters}</TableCell><TableCell className="tabular-nums">{r.cost}</TableCell></TableRow>
            ))}</TableBody>
          </Table>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b"><h3 className="font-semibold">Ancillary Operating Expenses</h3><p className="text-xs text-muted-foreground mt-0.5">Tolls, miscellaneous outlays and maintenance overhead per trip</p></div>
          <Table>
            <TableHeader><TableRow><TableHead>Trip ID</TableHead><TableHead>Vehicle</TableHead><TableHead>Toll (₹)</TableHead><TableHead>Misc (₹)</TableHead><TableHead>Maintenance (₹)</TableHead><TableHead>Total (₹)</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{expRows.map(r => (
              <TableRow key={r.id}><TableCell className="font-mono font-semibold">{r.trip?.tripCode ?? r.id}</TableCell><TableCell>{r.vehicle?.model ?? r.id}</TableCell><TableCell className="tabular-nums">{r.toll}</TableCell><TableCell className="tabular-nums">{r.misc}</TableCell><TableCell className="tabular-nums">{r.maint}</TableCell><TableCell className="tabular-nums font-semibold">{r.total}</TableCell><TableCell><StatusPill status={r.status as StatusKind} /></TableCell></TableRow>
            ))}</TableBody>
          </Table>
        </Card>
        <Card className="p-5 flex items-center justify-between bg-primary text-primary-foreground">
          <div><div className="text-[10px] uppercase tracking-[0.18em] opacity-70">Auto-Calculated</div><div className="text-sm mt-1 opacity-90">Total Operational Cost = Fuel + Maintenance Overhead</div></div>
          <div className="text-3xl font-black tracking-tight tabular-nums">₹ {totalOpCost.toLocaleString("en-IN")}</div>
        </Card>
      </div>
    </AppLayout>
  );
}