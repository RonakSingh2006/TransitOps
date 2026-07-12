import { createRootRoute, createRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { AlertCircle, ShieldCheck, Truck, BarChart3, Route as RouteIcon } from "lucide-react";
import { useRole, type Role } from "../lib/role-context";
import { api, setToken } from "../lib/api/client";

export const Route = createRootRoute({ component: () => <Outlet /> });

export const IndexRoute = createRoute({
  getParentRoute: () => Route, path: "/", component: AuthPage,
});

export default function AuthPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<Role>("Fleet Manager");
  const [loginError, setLoginError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [email, setEmail] = useState("fleet@transitops.in");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name: string; role: string } }>("/auth/login", { email, password });
      setToken(res.token);
      // Store user info for header display
      localStorage.setItem("userName", res.user.name);
      localStorage.setItem("userEmail", res.user.email);
      // Map DB role (e.g. "Fleet_Manager") to UI role (e.g. "Fleet Manager")
      const dbRole = res.user.role.replace(/_/g, " ");
      setRole(selectedRole);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrMsg(err.message || "Login failed");
      setLoginError(true);
      setTimeout(() => setLoginError(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="relative overflow-hidden bg-sidebar text-sidebar-foreground p-10 lg:p-14 flex flex-col">
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(60% 60% at 20% 15%, oklch(0.4 0.15 255 / 0.35), transparent), radial-gradient(50% 50% at 90% 90%, oklch(0.55 0.18 165 / 0.18), transparent)" }} />
        <div className="relative z-10 flex flex-col items-start">
          <img src="/logo.svg" alt="TransitOps" className="h-26" />
          <div className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60 mt-1">Smart Transport Operations Platform</div>
        </div>
        <div className="relative z-10 mt-auto space-y-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60 mb-3">One login · Four roles</div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight max-w-md">Retire the spreadsheet.<br />Run the depot.</h2>
            <p className="mt-4 text-sm text-sidebar-foreground/70 max-w-md">Unified command surface for fleet health, dispatch pipelines, driver compliance and operational spend — engineered for logistics operators.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: Truck, label: "Fleet Manager", desc: "Assets & workshop" },
              { icon: RouteIcon, label: "Dispatcher", desc: "Trips & routing" },
              { icon: ShieldCheck, label: "Safety Officer", desc: "Drivers & compliance" },
              { icon: BarChart3, label: "Financial Analyst", desc: "Fuel & BI" },
            ].map((f) => (
              <div key={f.label} className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3.5 py-3">
                <f.icon className="h-4 w-4 text-sidebar-primary" />
                <div className="mt-2 text-[13px] font-semibold">{f.label}</div>
                <div className="text-[11px] text-sidebar-foreground/60">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center p-6 lg:p-12 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border shadow-sm p-8 relative">
            {loginError && (
              <div className="absolute -right-3 top-24 hidden xl:block w-64">
                <div className="rounded-lg border border-status-danger/40 bg-status-danger-bg text-status-danger p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="text-[12px] leading-snug">
                      <div className="font-semibold">Invalid credentials.</div>
                      <div>{errMsg}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Sign in to your depot</h1>
              <p className="text-sm text-muted-foreground mt-1">Use your operator credentials to access TransitOps.</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5"><Label htmlFor="email">Work email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <div className="space-y-1.5">
                <Label>Sign in as</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] as Role[]).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground"><Checkbox defaultChecked /> Remember me</label>
                <a className="text-status-active font-medium hover:underline cursor-pointer">Forgot password?</a>
              </div>
              <Button type="submit" className="w-full h-11 text-[15px] font-semibold" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
          <div className="mt-6 rounded-xl border bg-card/50 p-4 text-[11.5px] text-muted-foreground leading-relaxed">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-foreground mb-2">Post-login access scope</div>
            <div className="grid grid-cols-1 gap-1">
              <div><span className="font-semibold text-foreground">Fleet Manager</span> → Fleet, Maintenance</div>
              <div><span className="font-semibold text-foreground">Dispatcher</span> → Dashboard, Trips</div>
              <div><span className="font-semibold text-foreground">Safety Officer</span> → Drivers, Compliance</div>
              <div><span className="font-semibold text-foreground">Financial Analyst</span> → Fuel & Expenses, Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}