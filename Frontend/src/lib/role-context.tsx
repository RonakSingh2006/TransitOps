import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

export const ROLES: Role[] = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

type ModuleKey = "dashboard" | "fleet" | "drivers" | "trips" | "maintenance" | "expenses" | "analytics" | "settings";

// Permission matrix based on brief
export const ROLE_ACCESS: Record<Role, ModuleKey[]> = {
  "Fleet Manager": ["dashboard", "fleet", "maintenance", "settings"],
  Dispatcher: ["dashboard", "fleet", "trips", "settings"],
  "Safety Officer": ["dashboard", "drivers", "trips", "settings"],
  "Financial Analyst": ["dashboard", "expenses", "analytics", "settings"],
};

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
  canAccess: (m: ModuleKey) => boolean;
}

const Ctx = createContext<RoleCtx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Fleet Manager");
  const canAccess = (m: ModuleKey) => ROLE_ACCESS[role].includes(m);
  return <Ctx.Provider value={{ role, setRole, canAccess }}>{children}</Ctx.Provider>;
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRole outside RoleProvider");
  return c;
}
