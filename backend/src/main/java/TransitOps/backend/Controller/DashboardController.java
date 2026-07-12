package TransitOps.backend.Controller;



import TransitOps.backend.dto.response.dashboard.DashboardKpiResponse;
import TransitOps.backend.enums.TripStatus;
import TransitOps.backend.enums.VehicleStatus;
import TransitOps.backend.repository.TripRepository;
import TransitOps.backend.repository.VehicleRepository;
import TransitOps.backend.response.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<DashboardKpiResponse>> getDashboardKpis() {

        long totalActiveFleet = vehicleRepository.countByStatusNot(VehicleStatus.RETIRED);
        long onTripVehicles = vehicleRepository.countByStatus(VehicleStatus.ON_TRIP);

        double utilization = totalActiveFleet > 0 ?
                ((double) onTripVehicles / totalActiveFleet) * 100 : 0.0;

        DashboardKpiResponse kpis = DashboardKpiResponse.builder()
                .activeVehicles(totalActiveFleet)
                .availableVehicles(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE))
                .vehiclesInMaintenance(vehicleRepository.countByStatus(VehicleStatus.IN_SHOP))
                .activeTrips(tripRepository.countByStatus(TripStatus.DISPATCHED))
                .pendingTrips(tripRepository.countByStatus(TripStatus.DRAFT))
                .fleetUtilizationPercentage(Math.round(utilization * 100.0) / 100.0)
                .build();

        return ResponseEntity.ok(ApiResponse.success("KPIs retrieved successfully", kpis));
    }
}
