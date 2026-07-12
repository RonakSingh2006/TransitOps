import { createRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { StatusPill } from "../components/status-pill";
import { AlertOctagon, MapPin, Check, Eye } from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api/client";
import { TripDetail } from "./tripdetail";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trips",
  component: TripsPage,
});

const STAGES = ["Draft", "Dispatched", "Completed", "Cancelled"];

interface LiveTrip {
  id: string;
  tripCode: string;
  target: string;
  route: string;
  status: string;
  counter: string;
}

interface AvailVehicle { id: string; model: string; registration: string; maxCapacity: string }
interface AvailDriver { id: string; name: string; licenseNo: string }

function TripsPage() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [cargoStr, setCargoStr] = useState("450");
  const cargo = parseInt(cargoStr) || 0;
  const [liveTrips, setLiveTrips] = useState<LiveTrip[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<AvailVehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<AvailDriver[]>([]);
  const [tripCode, setTripCode] = useState("");
  const [source, setSource] = useState("Gandhinagar Depot");
  const [dest, setDest] = useState("Ahmedabad Hub");
  const [distance, setDistance] = useState("38");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTrips = () =>
    api.get<any[]>("/trips").then((trips) => {
      setLiveTrips(
        trips.slice(0, 5).map((t: any) => ({
          id: t.id,
          tripCode: t.tripCode,
          target: `${t.vehicle?.model ?? "Unassigned"} / ${t.driver?.name ?? "Unassigned"}`,
          route: `${t.sourceDepot} → ${t.destinationHub}`,
          status: t.status,
          counter: t.status === "dispatched" ? `${t.eta ?? "In transit"}` : t.status === "completed" ? "Completed" : t.status === "cancelled" ? "Cancelled" : "Awaiting dispatch",
        }))
      );
    });

  const loadAvailable = () => Promise.all([
    api.get<AvailVehicle[]>("/trips/available-vehicles"),
    api.get<AvailDriver[]>("/trips/available-drivers"),
  ]).then(([v, d]) => { setAvailableVehicles(v); setAvailableDrivers(d); });

  useEffect(() => { loadTrips().catch(console.error); loadAvailable().catch(console.error); }, []);

  const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
  const maxCapKg = selectedVehicle ? parseInt(selectedVehicle.maxCapacity.replace(/[^0-9]/g, "")) : 999999;
  const overloaded = !isNaN(maxCapKg) && cargo > maxCapKg;

  const handleCreateAndDispatch = async () => {
    if (!tripCode) { alert("Enter a trip code"); return; }
    if (!selectedVehicleId) { alert("Select a vehicle"); return; }
    if (!selectedDriverId) { alert("Select a driver"); return; }
    if (overloaded) { alert("Cargo weight exceeds vehicle capacity"); return; }
    setCreating(true);
    try {
      // Create trip as draft
      const trip = await api.post<any>("/trips", {
        tripCode, sourceDepot: source, destinationHub: dest,
        cargoWeight: cargo || undefined, plannedDistance: parseInt(distance) || undefined,
      });
      // Dispatch it
      await api.post(`/trips/${trip.id}/dispatch`, {
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
      });
      await loadTrips();
      await loadAvailable();
      setTripCode(""); setSelectedVehicleId(""); setSelectedDriverId("");
      setCargoStr("450"); setSource("Gandhinagar Depot"); setDest("Ahmedabad Hub"); setDistance("38");
    } catch (err: any) { alert(err.message); } finally { setCreating(false); }
  };

  // Show trip detail view
  if (view === "detail" && selectedTripId) {
    return (
      <AppLayout>
        <TripDetail tripId={selectedTripId} onBack={() => { setView("list"); setSelectedTripId(null); }} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Mission Control · Trip Dispatcher" subtitle="Create trips by selecting vehicle, driver, source, destination and cargo weight." />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,50fr)_minmax(0,50fr)] gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn("grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold shrink-0", i === 0 ? "bg-status-available text-white" : "bg-muted text-muted-foreground")}>
                  {i === 0 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div className="min-w-0"><div className={cn("text-[11px] font-semibold truncate", i === 0 ? "text-foreground" : "text-muted-foreground")}>{s}</div></div>
                {i < STAGES.length - 1 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Trip Code</Label><Input value={tripCode} onChange={e => setTripCode(e.target.value)} placeholder="e.g. TR010" required /></div>
            <div className="space-y-1.5"><Label>Source Depot</Label><Input value={source} onChange={e => setSource(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Destination Hub</Label><Input value={dest} onChange={e => setDest(e.target.value)} /></div>

            {/* Vehicle selector - only shows available vehicles */}
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger><SelectValue placeholder={availableVehicles.length === 0 ? "No vehicles available" : "Select vehicle"} /></SelectTrigger>
                <SelectContent>
                  {availableVehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.model} ({v.registration}) · Cap: {v.maxCapacity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Driver selector - only shows available drivers */}
            <div className="space-y-1.5">
              <Label>Driver</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger><SelectValue placeholder={availableDrivers.length === 0 ? "No drivers available" : "Select driver"} /></SelectTrigger>
                <SelectContent>
                  {availableDrivers.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.licenseNo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5"><Label>Cargo Weight (kg)</Label><Input type="number" value={cargoStr} onChange={e => setCargoStr(e.target.value)} className={cn(overloaded && "border-status-danger focus-visible:ring-status-danger")} /></div>
            <div className="space-y-1.5"><Label>Planned Distance (km)</Label><Input type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
          </div>
          {overloaded && (
            <div className="mt-5 rounded-lg border border-status-danger/40 bg-status-danger-bg p-4 text-status-danger">
              <div className="flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="text-sm leading-snug">
                  <div className="font-semibold">Capacity exceeded — dispatch blocked</div>
                  <div className="mt-1 text-[13px]">Vehicle Capacity: <span className="font-mono font-semibold">{selectedVehicle?.maxCapacity ?? "—"}</span> · Cargo: <span className="font-mono font-semibold">{cargo} kg</span> · Over by <span className="font-mono font-semibold">{cargo - maxCapKg} kg</span></div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setCargoStr("450"); setTripCode(""); setSelectedVehicleId(""); setSelectedDriverId(""); }}>Reset</Button>
            <Button disabled={overloaded || !tripCode || !selectedVehicleId || !selectedDriverId || creating} onClick={handleCreateAndDispatch}>
              {creating ? "Creating & Dispatching..." : "Dispatch Trip"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Live Board</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click "Open ticket" to view/complete/cancel a trip</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-status-active font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-status-active animate-pulse" />live
            </span>
          </div>
          <div className="space-y-3">
            {liveTrips.map((t) => (
              <div key={t.id} className="rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{t.tripCode}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.target}</span>
                    </div>
                    <div className="mt-2 text-sm flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{t.route}</span>
                    </div>
                  </div>
                  <StatusPill status={t.status as any} />
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t.counter}</span>
                  <Button variant="link" size="sm" className="text-status-active p-0 h-auto flex items-center gap-1" onClick={() => { setSelectedTripId(t.id); setView("detail"); }}>
                    <Eye className="h-3 w-3" /> Open ticket
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Lifecycle:</span> Draft → Dispatch (auto-assigns On Trip) → Complete (restores Available) or Cancel
      </div>
    </AppLayout>
  );
}