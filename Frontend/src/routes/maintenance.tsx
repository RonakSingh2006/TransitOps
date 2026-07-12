"use client";

import { useState } from "react";
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
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/maintenance",
  component: MaintenancePage,
});

type LogEntry = { veh: string; svc: string; cost: string; status: StatusKind };

const INITIAL_LOGS: LogEntry[] = [
  { veh: "VAN-05", svc: "Oil Change", cost: "2,500", status: "in-shop" },
  { veh: "TRUCK-11", svc: "Engine Repair", cost: "18,000", status: "completed" },
  { veh: "MINI-03", svc: "Tyre Replace", cost: "6,200", status: "in-shop" },
];

function MaintenancePage() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [veh, setVeh] = useState("VAN-05");
  const [svc, setSvc] = useState("Oil Change");
  const [cost, setCost] = useState("2500");
  const [date, setDate] = useState("07/07/2026");
  const [status, setStatus] = useState("Active");

  function handleSave() {
    const newEntry: LogEntry = {
      veh,
      svc,
      cost: Number(cost).toLocaleString("en-IN"),
      status: "in-shop",
    };
    setLogs((prev) => [...prev, newEntry]);
    setVeh("");
    setSvc("");
    setCost("");
    setDate("");
    setStatus("Active");
  }

  const openTickets = logs.filter((l) => l.status === "in-shop").length;
  const totalCost = logs.reduce((sum, l) => {
    const num = parseInt(l.cost.replace(/,/g, ""), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

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
              <Input
                value={veh}
                onChange={(e) => setVeh(e.target.value)}
                placeholder="e.g. VAN-05"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Input
                value={svc}
                onChange={(e) => setSvc(e.target.value)}
                placeholder="e.g. Oil Change"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cost (₹)</Label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 2500"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Input value={status} disabled className="bg-muted/50" />
            </div>
            <Button className="w-full h-11 mt-2" onClick={handleSave}>
              Save Ticket Entry
            </Button>
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
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No service tickets yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono font-semibold">{l.veh}</TableCell>
                    <TableCell>{l.svc}</TableCell>
                    <TableCell className="tabular-nums">{l.cost}</TableCell>
                    <TableCell>
                      {l.status === "in-shop" ? (
                        <div className="flex items-center gap-2">
                          <StatusPill status={l.status} />
                          <button
                            onClick={() =>
                              setLogs((prev) =>
                                prev.map((entry, idx) =>
                                  idx === i ? { ...entry, status: "completed" as StatusKind } : entry
                                )
                              )
                            }
                            className="text-status-active hover:text-status-active/80 transition-colors"
                            title="Mark as completed"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <StatusPill status={l.status} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{openTickets} open ticket{openTickets !== 1 ? "s" : ""}</span>
            <span className="font-semibold">
              Total workshop spend: <span className="font-mono">₹ {totalCost.toLocaleString("en-IN")}</span>
            </span>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}