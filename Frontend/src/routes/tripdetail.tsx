// This component is rendered inline within the trips page
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { StatusPill } from "../components/status-pill";
import { api } from "../lib/api/client";
import { useState, useEffect } from "react";
import { MapPin, Truck, User, ArrowLeft } from "lucide-react";

interface TripData {
  id: string;
  tripCode: string;
  sourceDepot: string;
  destinationHub: string;
  cargoWeight: number | null;
  plannedDistance: number | null;
  finalOdometer: string | null;
  fuelConsumed: string | null;
  eta: string | null;
  status: string;
  vehicle: { id: string; model: string; registration: string; maxCapacity: string } | null;
  driver: { id: string; name: string; licenseNo: string } | null;
}

export function TripDetail({ tripId, onBack }: { tripId: string; onBack: () => void }) {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => api.get<TripData>(`/trips/${tripId}`).then(setTrip);

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, [tripId]);

  const handleComplete = async () => {
    if (!finalOdometer) { alert("Enter final odometer reading"); return; }
    setActionLoading(true);
    try {
      await api.put(`/trips/${tripId}`, { finalOdometer, fuelConsumed: fuelConsumed || "0" });
      await api.post(`/trips/${tripId}/complete`);
      await load();
    } catch (err: any) { alert(err.message); } finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    setActionLoading(true);
    try {
      await api.post(`/trips/${tripId}/cancel`);
      await load();
    } catch (err: any) { alert(err.message); } finally { setActionLoading(false); }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading trip...</div>;
  if (!trip) return <div className="p-8 text-muted-foreground">Trip not found</div>;

  const isDispatched = trip.status === "dispatched";
  const isDraft = trip.status === "draft";
  const isCompleted = trip.status === "completed";
  const isCancelled = trip.status === "cancelled";

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" className="gap-2 h-9" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back to Trips
        </Button>
      </div>
      <div className="text-2xl font-bold tracking-tight mb-1">Trip {trip.tripCode}</div>
      <p className="text-sm text-muted-foreground mb-6">
        Status: <StatusPill status={trip.status as any} />
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Trip Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{trip.sourceDepot}</div>
                <div className="text-xs text-muted-foreground">→ {trip.destinationHub}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Cargo:</span> {trip.cargoWeight ?? "—"} kg</div>
              <div><span className="text-muted-foreground">Distance:</span> {trip.plannedDistance ?? "—"} km</div>
              <div><span className="text-muted-foreground">ETA:</span> {trip.eta ?? "—"}</div>
              <div><span className="text-muted-foreground">Status:</span> <StatusPill status={trip.status as any} /></div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Assigned Resources</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{trip.vehicle?.model ?? "Unassigned"}</div>
                <div className="text-xs text-muted-foreground">{trip.vehicle?.registration ?? "—"} · Capacity: {trip.vehicle?.maxCapacity ?? "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{trip.driver?.name ?? "Unassigned"}</div>
                <div className="text-xs text-muted-foreground">License: {trip.driver?.licenseNo ?? "—"}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {isDispatched && (
        <Card className="p-6 mt-6">
          <h3 className="font-semibold mb-4">Complete Trip</h3>
          <p className="text-xs text-muted-foreground mb-4">Enter final odometer reading and fuel consumed. Vehicle & Driver will return to Available.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div className="space-y-1.5"><Label>Final Odometer (KM)</Label><Input type="number" value={finalOdometer} onChange={e => setFinalOdometer(e.target.value)} placeholder="e.g. 74500" /></div>
            <div className="space-y-1.5"><Label>Fuel Consumed (L)</Label><Input type="number" value={fuelConsumed} onChange={e => setFuelConsumed(e.target.value)} placeholder="e.g. 45" /></div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleComplete} disabled={actionLoading || !finalOdometer}>{actionLoading ? "Processing..." : "Complete Trip"}</Button>
            <Button variant="outline" className="text-status-danger border-status-danger/40 hover:bg-status-danger-bg" onClick={handleCancel} disabled={actionLoading}>Cancel Trip</Button>
          </div>
        </Card>
      )}

      {isDraft && (
        <Card className="p-6 mt-6">
          <h3 className="font-semibold mb-4">Draft Trip</h3>
          <p className="text-xs text-muted-foreground">This trip is still in draft. Go back to dispatch it.</p>
          <Button variant="outline" className="text-status-danger border-status-danger/40 mt-4" onClick={handleCancel} disabled={actionLoading}>Cancel Draft</Button>
        </Card>
      )}

      {isCompleted && (
        <Card className="p-6 mt-6 border-status-available/30">
          <h3 className="font-semibold text-status-available">✓ Trip Completed</h3>
          <p className="text-xs text-muted-foreground mt-1">Vehicle & Driver returned to Available.</p>
          {trip.finalOdometer && <p className="text-sm mt-2">Final Odometer: <span className="font-semibold">{trip.finalOdometer} km</span> · Fuel: <span className="font-semibold">{trip.fuelConsumed ?? "—"} L</span></p>}
        </Card>
      )}

      {isCancelled && (
        <Card className="p-6 mt-6 border-status-danger/30">
          <h3 className="font-semibold text-status-danger">✕ Trip Cancelled</h3>
          <p className="text-xs text-muted-foreground mt-1">Vehicle & Driver restored to Available.</p>
        </Card>
      )}
    </div>
  );
}