"use client";

import { useState } from "react";
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

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fleet",
  component: FleetPage,
});

type Vehicle = {
  reg: string;
  model: string;
  type: string;
  cap: string;
  odo: string;
  cost: string;
  status: StatusKind;
};

const INITIAL_ROWS: Vehicle[] = [
  { reg: "GJ01AB4521", model: "VAN-05", type: "Van", cap: "500 kg", odo: "74,000", cost: "6,20,000", status: "available" },
  { reg: "GJ01AB9981", model: "TRUCK-11", type: "Truck", cap: "5 Ton", odo: "1,82,000", cost: "24,50,000", status: "on-trip" },
  { reg: "GJ01AB1120", model: "MINI-03", type: "Mini", cap: "1 Ton", odo: "66,000", cost: "4,10,000", status: "in-shop" },
  { reg: "GJ01AB0008", model: "VAN-09", type: "Van", cap: "750 kg", odo: "2,41,900", cost: "5,90,000", status: "retired" },
];

const emptyForm: Vehicle = {
  reg: "",
  model: "",
  type: "Van",
  cap: "",
  odo: "",
  cost: "",
  status: "available",
};

function FleetPage() {
  const [rows, setRows] = useState<Vehicle[]>(INITIAL_ROWS);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Vehicle>({ ...emptyForm });

  const filtered = rows.filter((r) => {
    const matchType = typeFilter === "All" || r.type === typeFilter;
    const matchStatus =
      statusFilter === "All" ||
      r.status === statusFilter.toLowerCase().replace(/\s+/g, "-");
    const matchSearch =
      !searchQuery ||
      r.reg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const retiredCount = rows.filter((r) => r.status === "retired").length;

  function handleAdd() {
    setRows((prev) => [...prev, { ...form, reg: form.reg.toUpperCase() }]);
    setDialogOpen(false);
    setForm({ ...emptyForm });
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setForm({ ...emptyForm });
  }

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
              <TableRow key={r.reg}>
                <TableCell className="font-mono font-semibold">{r.reg}</TableCell>
                <TableCell className="font-medium">{r.model}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.cap}</TableCell>
                <TableCell className="tabular-nums">{r.odo}</TableCell>
                <TableCell className="tabular-nums">{r.cost}</TableCell>
                <TableCell>
                  <StatusPill status={r.status} />
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
                value={form.reg}
                onChange={(e) => setForm({ ...form, reg: e.target.value })}
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
                value={form.cap}
                onChange={(e) => setForm({ ...form, cap: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odo">Odometer (KM)</Label>
              <Input
                id="odo"
                placeholder="0"
                value={form.odo}
                onChange={(e) => setForm({ ...form, odo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Acquisition Cost (₹)</Label>
              <Input
                id="cost"
                placeholder="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as StatusKind })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on-trip">On Trip</SelectItem>
                  <SelectItem value="in-shop">In Shop</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}