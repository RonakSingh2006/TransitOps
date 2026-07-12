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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Check, Minus, Eye } from "lucide-react";
import { useState } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

type Cell = "check" | "dash" | "view";
const MATRIX: { role: string; cells: Cell[] }[] = [
  { role: "Fleet Manager", cells: ["check", "check", "dash", "dash", "check"] },
  { role: "Dispatcher", cells: ["view", "dash", "check", "dash", "dash"] },
  { role: "Safety Officer", cells: ["dash", "check", "view", "dash", "dash"] },
  { role: "Financial Analyst", cells: ["view", "dash", "dash", "check", "check"] },
];
const COLS = ["Fleet", "Drivers", "Trips", "Fuel & Expenses", "BI Analytics"];

function renderCell(c: Cell) {
  if (c === "check") return <Check className="h-4 w-4 text-status-available" />;
  if (c === "dash") return <Minus className="h-4 w-4 text-muted-foreground/50" />;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-active bg-status-active-bg px-2 py-0.5 rounded-full">
      <Eye className="h-3 w-3" /> view
    </span>
  );
}

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [depot, setDepot] = useState("Gandhinagar Depot GJ4");
  const [currency, setCurrency] = useState("inr");
  const [distanceUnit, setDistanceUnit] = useState("km");

  const handleSave = () => {
    localStorage.setItem("settings", JSON.stringify({ depot, currency, distanceUnit }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <PageHeader title="System Configurations & RBAC" subtitle="Global depot preferences and role-based access matrix." />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">General Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Depot Facility Name</Label><Input value={depot} onChange={e => setDepot(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Operational Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">INR (₹)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Distance Unit</Label>
              <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers</SelectItem>
                  <SelectItem value="mi">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full h-11 mt-2" onClick={handleSave}>
              {saved ? "✓ Configuration Saved" : "Save Configuration Changes"}
            </Button>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b"><h3 className="font-semibold">RBAC Permission Matrix</h3><p className="text-xs text-muted-foreground mt-0.5">Module access by operational role</p></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                {COLS.map((c) => (<TableHead key={c} className="text-center">{c}</TableHead>))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MATRIX.map((r) => (
                <TableRow key={r.role}>
                  <TableCell className="font-semibold">{r.role}</TableCell>
                  {r.cells.map((c, i) => (
                    <TableCell key={i} className="text-center"><div className="flex justify-center">{renderCell(c)}</div></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t bg-muted/30 text-[11px] text-muted-foreground flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-status-available" /> Full access</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-status-active" /> Read-only</span>
            <span className="flex items-center gap-1.5"><Minus className="h-3.5 w-3.5 text-muted-foreground/60" /> No access</span>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}