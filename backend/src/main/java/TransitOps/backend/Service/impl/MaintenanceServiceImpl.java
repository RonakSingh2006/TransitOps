package TransitOps.backend.Service.impl;



import TransitOps.backend.dto.request.MaintenanceCreateRequest;
import TransitOps.backend.entity.Vehicle;
import TransitOps.backend.enums.MaintenanceStatus;
import TransitOps.backend.enums.VehicleStatus;
import TransitOps.backend.exception.BusinessRuleViolationException;
import TransitOps.backend.exception.ResourceNotFoundException;
import TransitOps.backend.repository.MaintenanceLogRepository;
import TransitOps.backend.repository.VehicleRepository;

import TransitOps.backend.entity.*;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl {

    private final MaintenanceLogRepository maintenanceRepo;
    private final VehicleRepository vehicleRepo;

    @Transactional
    public MaintenanceLog createMaintenanceLog(MaintenanceCreateRequest request) {
        Vehicle vehicle = vehicleRepo.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
            throw new BusinessRuleViolationException("Cannot send a vehicle to maintenance while it is on a trip.");
        }

        // Automatic Status Flip
        vehicle.setStatus(VehicleStatus.IN_SHOP);
        vehicleRepo.save(vehicle);

        MaintenanceLog log = MaintenanceLog.builder()
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .cost(request.getCost())
                .startDate(request.getStartDate())
                .status(MaintenanceStatus.OPEN)
                .build();

        return maintenanceRepo.save(log);
    }

    @Transactional
    public MaintenanceLog closeMaintenanceLog(Long id) {
        MaintenanceLog log = maintenanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceLog", id));

        if (log.getStatus() == MaintenanceStatus.CLOSED) {
            throw new BusinessRuleViolationException("Maintenance log is already closed.");
        }

        log.setStatus(MaintenanceStatus.CLOSED);
        log.setEndDate(LocalDate.now());

        // Restore Vehicle Status
        Vehicle vehicle = log.getVehicle();
        if (vehicle.getStatus() != VehicleStatus.RETIRED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepo.save(vehicle);
        }

        return maintenanceRepo.save(log);
    }
}