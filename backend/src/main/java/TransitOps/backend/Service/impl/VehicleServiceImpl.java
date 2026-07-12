package TransitOps.backend.Service.impl;



import TransitOps.backend.Service.VehicleService;
import TransitOps.backend.dto.request.vehicle.VehicleCreateRequest;
import TransitOps.backend.entity.Vehicle;
import TransitOps.backend.enums.VehicleStatus;
import TransitOps.backend.exception.BusinessRuleViolationException;
import TransitOps.backend.exception.ResourceNotFoundException;
import TransitOps.backend.repository.VehicleRepository;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    @Transactional
    public Vehicle createVehicle(VehicleCreateRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BusinessRuleViolationException("Registration number already exists.");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .nameModel(request.getNameModel())

                .maxLoadCapacity(request.getMaxLoadCapacity())
                .acquisitionCost(request.getAcquisitionCost()) // Assuming mapping here
                .region(request.getRegion())
                .status(VehicleStatus.AVAILABLE)
                .odometer(BigDecimal.ZERO)
                .build();

        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
    }
}