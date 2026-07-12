import { StrictMode } from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { RoleProvider } from "./lib/role-context";
import { Route as rootRoute, IndexRoute } from "./routes/SignIn";
import { Route as dashboardRoute } from "./routes/dashboard";
import { Route as driversRoute } from "./routes/drivers";

const routeTree = rootRoute.addChildren([IndexRoute, dashboardRoute, driversRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <StrictMode>
      <RoleProvider>
        <RouterProvider router={router} />
      </RoleProvider>
    </StrictMode>
  );
}

export default App;