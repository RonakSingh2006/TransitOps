package TransitOps.backend.repository;

import TransitOps.backend.entity.Vehicle;
import TransitOps.backend.enums.VehicleStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    boolean existsByRegistrationNumber(String registrationNumber);

    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    long countByStatus(VehicleStatus status);

    long countByStatusNot(VehicleStatus status);

    java.util.List<Vehicle> findByStatus(VehicleStatus status);
}

