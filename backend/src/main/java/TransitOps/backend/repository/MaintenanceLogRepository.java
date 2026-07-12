package TransitOps.backend.repository;

import TransitOps.backend.entity.MaintenanceLog;
import TransitOps.backend.enums.MaintenanceStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {

    List<MaintenanceLog> findByVehicleId(Long vehicleId);

    Optional<MaintenanceLog> findFirstByVehicleIdAndStatus(Long vehicleId, MaintenanceStatus status);

    long countByStatus(MaintenanceStatus status);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicle(@Param("vehicleId") Long vehicleId);
    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(@Param("vehicleId") Long vehicleId);
}

