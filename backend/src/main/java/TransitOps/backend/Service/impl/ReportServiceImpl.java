package TransitOps.backend.Service.impl;



import TransitOps.backend.entity.*;
import TransitOps.backend.exception.ResourceNotFoundException;
import TransitOps.backend.repository.FuelLogRepository;
import TransitOps.backend.repository.MaintenanceLogRepository;
import TransitOps.backend.repository.TripRepository;
import TransitOps.backend.repository.VehicleRepository;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl {

    private final VehicleRepository vehicleRepo;
    private final FuelLogRepository fuelRepo;
    private final MaintenanceLogRepository maintenanceRepo;
    private final TripRepository tripRepo;

    public Map<String, Object> getVehicleFinancialReport(Long vehicleId) {
        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        BigDecimal totalFuelCost = fuelRepo.sumCostByVehicleId(vehicleId);
        BigDecimal totalMaintenanceCost = maintenanceRepo.sumCostByVehicleId(vehicleId);
        BigDecimal totalOperationalCost = totalFuelCost.add(totalMaintenanceCost);

        Double totalDistanceDouble = tripRepo.sumDistanceByVehicle(vehicleId);
        BigDecimal totalDistance = totalDistanceDouble != null ? BigDecimal.valueOf(totalDistanceDouble) : BigDecimal.ZERO;
        BigDecimal totalLiters = fuelRepo.sumLitersByVehicleId(vehicleId);

        BigDecimal fuelEfficiency = BigDecimal.ZERO;
        if (totalLiters.compareTo(BigDecimal.ZERO) > 0) {
            fuelEfficiency = totalDistance.divide(totalLiters, 2, RoundingMode.HALF_UP);
        }

        // ROI = - (Operational Cost) / Acquisition Cost (Assuming Revenue is 0 for base calculation as flagged in docs)
        BigDecimal roi = BigDecimal.ZERO;
        if (vehicle.getAcquisitionCost().compareTo(BigDecimal.ZERO) > 0) {
            roi = BigDecimal.ZERO.subtract(totalOperationalCost)
                    .divide(vehicle.getAcquisitionCost(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        Map<String, Object> report = new HashMap<>();
        report.put("vehicleId", vehicleId);
        report.put("totalOperationalCost", totalOperationalCost);
        report.put("fuelEfficiency", fuelEfficiency);
        report.put("roiPercentage", roi);

        return report;
    }
}
