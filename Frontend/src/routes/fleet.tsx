"use client";

import { useState, useEffect } from "react";
import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./SignIn";
import { AppLayout, PageHeader } from "../components/app-layout";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { StatusPill, type StatusKind } from "../components/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Plus, Search } from "lucide-react";
import { api } from "../lib/api/client";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fleet",
  component: FleetPage,
});

type Vehicle = {
  id: string;
  registration: string;
  model: string;
  type: string;
  maxCapacity: string;
  odometer: string;
  acquisitionCost: string;
  status: string;
};

const emptyForm = {
  registration: "",
  model: "",
  type: "Van",
  maxCapacity: "",
  odometer: "",
  acquisitionCost: "",
};

function FleetPage() {
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => api.get<Vehicle[]>("/vehicles").then(setRows);

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)); }, []);

  const filtered = rows.filter((r) => {
    const matchType = typeFilter === "All" || r.type === typeFilter;
    const matchStatus =
      statusFilter === "All" ||
      r.status === statusFilter.toLowerCase().replace(/\s+/g, "-");
    const matchSearch =
      !searchQuery ||
      r.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const retiredCount = rows.filter((r) => r.status === "retired").length;

  async function handleAdd() {
    if (!form.registration || !form.model || !form.maxCapacity || !form.odometer || !form.acquisitionCost) {
      alert("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await api.post("/vehicles", {
        ...form,
        registration: form.registration.toUpperCase(),
      });
      await load();
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setForm(emptyForm);
  }

  if (loading) return <AppLayout><div className="p-8 text-muted-foreground">Loading fleet...</div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="Vehicle Registry"
        subtitle="Master asset database — unique registration enforced."
      />

      <Card className="p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search registration number (e.g. GJ01AB…)"
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 h-10">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Type: All</SelectItem>
            <SelectItem value="Van">Type: Van</SelectItem>
            <SelectItem value="Truck">Type: Truck</SelectItem>
            <SelectItem value="Mini">Type: Mini</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Status: All</SelectItem>
            <SelectItem value="Available">Status: Available</SelectItem>
            <SelectItem value="On Trip">Status: On Trip</SelectItem>
            <SelectItem value="In Shop">Status: In Shop</SelectItem>
            <SelectItem value="Retired">Status: Retired</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-xs text-muted-foreground hidden md:block">
          <span className="font-semibold text-foreground">{rows.length}</span> vehicles ·
          {filtered.length !== rows.length && (
            <> <span className="font-semibold text-foreground">{filtered.length}</span> shown ·</>
          )}{" "}
          <span className="font-semibold text-foreground">{retiredCount}</span> retired
        </div>

        <Button className="h-10" onClick={() => setDialogOpen(true)}>
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
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono font-semibold">{r.registration}</TableCell>
                <TableCell className="font-medium">{r.model}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.maxCapacity}</TableCell>
                <TableCell className="tabular-nums">{r.odometer}</TableCell>
                <TableCell className="tabular-nums">{r.acquisitionCost}</TableCell>
                <TableCell>
                  <StatusPill status={r.status as StatusKind} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Fill in the details below to register a new vehicle in the fleet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reg">Registration No.</Label>
              <Input
                id="reg"
                placeholder="GJ01AB9999"
                value={form.registration}
                onChange={(e) => setForm({ ...form, registration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="VAN-05"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Mini">Mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cap">Max Capacity</Label>
              <Input
                id="cap"
                placeholder="500 kg"
                value={form.maxCapacity}
                onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odo">Odometer (KM)</Label>
              <Input
                id="odo"
                placeholder="0"
                value={form.odometer}
                onChange={(e) => setForm({ ...form, odometer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Acquisition Cost (₹)</Label>
              <Input
                id="cost"
                placeholder="0"
                value={form.acquisitionCost}
                onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Saving..." : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}