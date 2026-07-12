package TransitOps.backend.repository;

import TransitOps.backend.entity.FuelLog;
import TransitOps.backend.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {

    List<FuelLog> findByVehicleId(Long vehicleId);

    List<FuelLog> findByTripId(Long tripId);

    @Query("SELECT COALESCE(SUM(f.liters), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumLitersByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT COALESCE(SUM(f.cost), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicle(@Param("vehicleId") Long vehicleId);
    @Query("SELECT COALESCE(SUM(f.liters), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumLitersByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT COALESCE(SUM(f.cost), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(@Param("vehicleId") Long vehicleId);
}

// Do the same in MaintenanceLogRepository



