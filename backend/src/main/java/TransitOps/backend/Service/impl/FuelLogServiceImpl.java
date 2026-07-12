package TransitOps.backend.Service.impl;



import TransitOps.backend.dto.request.FuelLogRequest;
import TransitOps.backend.entity.Trip;
import TransitOps.backend.entity.Vehicle;
import TransitOps.backend.exception.ResourceNotFoundException;
import TransitOps.backend.repository.FuelLogRepository;
import TransitOps.backend.repository.TripRepository;
import TransitOps.backend.repository.VehicleRepository;

import TransitOps.backend.entity.FuelLog;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FuelLogServiceImpl {

    private final FuelLogRepository fuelLogRepo;
    private final VehicleRepository vehicleRepo;
    private final TripRepository tripRepo;

    public FuelLog createFuelLog(FuelLogRequest request) {
        Vehicle vehicle = vehicleRepo.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepo.findById(request.getTripId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trip", request.getTripId()));
        }

        FuelLog log = FuelLog.builder()
                .vehicle(vehicle)
                .trip(trip)
                .liters(request.getLiters())
                .cost(request.getCost())
                .logDate(request.getLogDate())
                .odometerReading(request.getOdometerReading())
                .build();

        return fuelLogRepo.save(log);
    }
}
