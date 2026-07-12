import { createRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { StatusPill } from "../components/status-pill";
import { AlertOctagon, MapPin, Check } from "lucide-react";
import { cn } from "../lib/utils";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trips",
  component: TripsPage,
});

const STAGES = ["Draft", "Dispatched", "Completed", "Cancelled"];

function TripsPage() {
  const [cargo, setCargo] = useState(700);
  const capacity = 500;
  const overloaded = cargo > capacity;

  return (
    <AppLayout>
      <PageHeader
        title="Mission Control · Trip Dispatcher"
        subtitle="Assign, dispatch and monitor delivery lifecycles."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] gap-6">
        {/* Left — form */}
        <Card className="p-6">
          {/* Stage tracker */}
          <div className="flex items-center gap-2 mb-6">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold shrink-0",
                    i === 0
                      ? "bg-status-available text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i === 0 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div className="min-w-0">
                  <div className={cn("text-[11px] font-semibold truncate", i === 0 ? "text-foreground" : "text-muted-foreground")}>
                    {s}
                  </div>
                </div>
                {i < STAGES.length - 1 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Source Depot</Label>
              <Input defaultValue="Gandhinagar Depot" />
            </div>
            <div className="space-y-1.5">
              <Label>Destination Hub</Label>
              <Input defaultValue="Ahmedabad Hub" />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle</Label>
              <Select defaultValue="van05">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="van05">VAN-05 · 500 kg capacity</SelectItem>
                  <SelectItem value="trk04">TRUCK-04 · 3 Ton</SelectItem>
                  <SelectItem value="mini08">MINI-08 · 1 Ton</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Driver</Label>
              <Select defaultValue="alex">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alex">Alex</SelectItem>
                  <SelectItem value="priya">Priya</SelectItem>
                  <SelectItem value="suresh">Suresh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cargo Weight (kg)</Label>
              <Input
                type="number"
                value={cargo}
                onChange={(e) => setCargo(Number(e.target.value) || 0)}
                className={cn(overloaded && "border-status-danger focus-visible:ring-status-danger")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Planned Distance (km)</Label>
              <Input type="number" defaultValue={38} />
            </div>
          </div>

          {overloaded && (
            <div className="mt-5 rounded-lg border border-status-danger/40 bg-status-danger-bg p-4 text-status-danger">
              <div className="flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="text-sm leading-snug">
                  <div className="font-semibold">Capacity exceeded — dispatch blocked</div>
                  <div className="mt-1 text-[13px]">
                    Vehicle Capacity: <span className="font-mono font-semibold">{capacity} kg</span> ·
                    Cargo Weight: <span className="font-mono font-semibold">{cargo} kg</span> · Over
                    by <span className="font-mono font-semibold">{cargo - capacity} kg</span>.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button disabled={overloaded}>
              {overloaded ? "Dispatch (disabled)" : "Dispatch Trip"}
            </Button>
          </div>
        </Card>

        {/* Right — live board */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Live Board</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Active dispatch pipeline</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-status-active font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-status-active animate-pulse" />
              live
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "TR001",
                target: "VAN-05 / ALEX",
                route: "Gandhinagar Depot → Ahmedabad Hub",
                status: "dispatched" as const,
                counter: "45 min ETA",
              },
              {
                id: "TR004",
                target: "TRUCK-04 / SURESH",
                route: "Vatva Industrial Area → Sanand Warehouse",
                status: "draft" as const,
                counter: "Awaiting driver",
              },
              {
                id: "TR006",
                target: "Unassigned",
                route: "Mansa → Kalol Depot",
                status: "cancelled" as const,
                counter: "Vehicle went to shop",
              },
            ].map((t) => (
              <div key={t.id} className="rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{t.id}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t.target}
                      </span>
                    </div>
                    <div className="mt-2 text-sm flex items-center gap-1.5 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{t.route}</span>
                    </div>
                  </div>
                  <StatusPill status={t.status} />
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t.counter}</span>
                  <a className="text-status-active font-medium hover:underline cursor-pointer">
                    Open ticket →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">On Complete:</span> odometer → fuel log →
        expenses → Vehicle & Driver returned to <em>Available</em>.
      </div>
    </AppLayout>
  );
}