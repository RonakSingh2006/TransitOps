import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route as RouteIcon,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useRole, ROLES, type Role } from "../lib/role-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" as const },
  { to: "/fleet", label: "Fleet", icon: Truck, module: "fleet" as const },
  { to: "/drivers", label: "Drivers", icon: Users, module: "drivers" as const },
  { to: "/trips", label: "Trips", icon: RouteIcon, module: "trips" as const },
  { to: "/maintenance", label: "Maintenance", icon: Wrench, module: "maintenance" as const },
  { to: "/expenses", label: "Fuel & Expenses", icon: Receipt, module: "expenses" as const },
  { to: "/analytics", label: "Analytics", icon: BarChart3, module: "analytics" as const },
  { to: "/settings", label: "Settings", icon: Settings, module: "settings" as const },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole, canAccess } = useRole();

  return (
    <div className="flex min-h-screen w-full bg-[oklch(0.985_0.005_255)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex flex-col items-start">
            <img src="/logo.svg" alt="TransitOps" className="h-20" />
            <div className="text-[10.5px] uppercase tracking-wider text-sidebar-foreground/60 leading-tight mt-0.5">
              Smart Transport Ops
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.filter((item) => canAccess(item.module)).map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                search={{}}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary/15 text-white ring-1 ring-sidebar-primary/40"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
          <div>v1.4.2 · Depot GJ4</div>
          <div className="mt-0.5">© TransitOps 2026</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 shrink-0 bg-background border-b flex items-center gap-4 px-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles, drivers, trips…"
              className="pl-9 h-9 bg-muted/60 border-transparent focus-visible:bg-background"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-md hover:bg-muted">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-status-danger" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border hover:bg-muted transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
                    RK
                  </AvatarFallback>
                </Avatar>
                <div className="text-left leading-tight">
                  <div className="text-[13px] font-semibold">Raven K.</div>
                  <div className="text-[10.5px] text-muted-foreground">{role}</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Signed in as <span className="font-semibold text-foreground capitalize">{role}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" search={{}}>Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
