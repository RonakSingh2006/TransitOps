import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicles";
import driverRoutes from "./routes/drivers";
import tripRoutes from "./routes/trips";
import fuelRoutes from "./routes/fuel";
import expenseRoutes from "./routes/expenses";
import maintenanceRoutes from "./routes/maintenance";
import dashboardRoutes from "./routes/dashboard";
import analyticsRoutes from "./routes/analytics";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 TransitOps API running on http://localhost:${PORT}`);
});