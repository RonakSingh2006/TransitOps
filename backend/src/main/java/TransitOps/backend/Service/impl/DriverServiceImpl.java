package TransitOps.backend.Service.impl;



import TransitOps.backend.dto.request.DriverCreateRequest;
import TransitOps.backend.enums.DriverStatus;
import TransitOps.backend.exception.BusinessRuleViolationException;
import TransitOps.backend.exception.ResourceNotFoundException;
import TransitOps.backend.repository.DriverRepository;

import TransitOps.backend.entity.Driver;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl {

    private final DriverRepository driverRepository;

    @Transactional
    public Driver createDriver(DriverCreateRequest request) {
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new BusinessRuleViolationException("License number already registered.");
        }

        Driver driver = Driver.builder()
                .name(request.getName())
                .licenseNumber(request.getLicenseNumber())
                .licenseCategory(request.getLicenseCategory())
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .contactNumber(request.getContactNumber())
                .status(DriverStatus.AVAILABLE)
                .safetyScore(new BigDecimal("100.00"))
                .build();

        return driverRepository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
    }
}
