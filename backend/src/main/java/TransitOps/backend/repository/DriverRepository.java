package TransitOps.backend.repository;

import TransitOps.backend.entity.Driver;
import TransitOps.backend.enums.DriverStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long>, JpaSpecificationExecutor<Driver> {

    boolean existsByLicenseNumber(String licenseNumber);

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    long countByStatus(DriverStatus status);

    List<Driver> findByStatus(DriverStatus status);

    List<Driver> findByLicenseExpiryDateBetween(LocalDate start, LocalDate end);
}

