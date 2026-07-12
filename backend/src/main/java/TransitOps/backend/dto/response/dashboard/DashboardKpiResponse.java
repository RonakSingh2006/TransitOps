package TransitOps.backend.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardKpiResponse {
    private long activeVehicles;
    private long availableVehicles;
    private long vehiclesInMaintenance;
    private long activeTrips;
    private long pendingTrips;
    private double fleetUtilizationPercentage;
}
