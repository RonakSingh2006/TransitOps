import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { StatusPill, type StatusKind } from "../components/status-pill";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { api } from "../lib/api/client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/maintenance",
  component: MaintenancePage,
});

interface MaintRecord {
  id: string;
  vehicle: { id: string; model: string } | null;
  vehicleId: string;
  serviceType: string;
  cost: string;
  status: string;
}
interface Vehicle { id: string; model: string; registration: string; status: string }

function MaintenancePage() {
  const [records, setRecords] = useState<MaintRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("Oil Change");
  const [cost, setCost] = useState("2500");
  const [date, setDate] = useState("2026-07-07");

  const load = () => Promise.all([
    api.get<MaintRecord[]>("/maintenance"),
    api.get<Vehicle[]>("/vehicles"),
  ]).then(([r, v]) => { setRecords(r); setVehicles(v); });

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    try {
      await api.post("/maintenance", { vehicleId, serviceType, cost, date });
      setVehicleId(""); setServiceType("Oil Change"); setCost("2500"); setDate("2026-07-07");
      await load();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <AppLayout><div className="p-8 text-muted-foreground">Loading maintenance...</div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader title="Lifecycle Maintenance Log" subtitle="Workshop tickets and vehicle downtime records." />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">New Service Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.filter(v => v.status !== "retired").map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.model} ({v.registration})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Service Type</Label><Input value={serviceType} onChange={e => setServiceType(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label>Cost (₹)</Label><Input type="number" value={cost} onChange={e => setCost(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <Button type="submit" className="w-full h-11 mt-2" disabled={!vehicleId}>Save Ticket Entry</Button>
          </form>
          <div className="mt-6 rounded-xl border bg-muted/40 p-4">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">State Transitions</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <StatusPill status="available" /><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground italic">create active record</span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /><StatusPill status="in-shop" />
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status="in-shop" /><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground italic">close (not retired)</span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /><StatusPill status="available" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b"><h3 className="font-semibold">Active Service Diagnostic Logs</h3><p className="text-xs text-muted-foreground mt-0.5">Current workshop tickets and their operational cost</p></div>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Service Action</TableHead><TableHead>Cost (₹)</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{records.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-mono font-semibold">{l.vehicle?.model ?? "—"}</TableCell>
                <TableCell>{l.serviceType}</TableCell>
                <TableCell className="tabular-nums">{l.cost}</TableCell>
                <TableCell><StatusPill status={(l.status === "Completed" ? "completed" : "in-shop") as StatusKind} /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{records.length} open tickets</span>
            <span className="font-semibold">Total workshop spend: <span className="font-mono">₹ {records.reduce((a, r) => a + (parseInt(r.cost.replace(/,/g, "")) || 0), 0).toLocaleString("en-IN")}</span></span>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}