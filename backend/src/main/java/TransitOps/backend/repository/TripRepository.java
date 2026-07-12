package TransitOps.backend.repository;

import TransitOps.backend.entity.Trip;
import TransitOps.backend.enums.TripStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long>, JpaSpecificationExecutor<Trip> {

    long countByStatus(TripStatus status);

    List<Trip> findByVehicleIdAndStatus(Long vehicleId, TripStatus status);

    List<Trip> findByVehicleId(Long vehicleId);

    List<Trip> findByDriverId(Long driverId);

    @Query("SELECT COALESCE(SUM(t.actualDistance), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    BigDecimal sumActualDistanceByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT COALESCE(SUM(t.revenue), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    BigDecimal sumRevenueByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT SUM(t.actualDistance) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    Double sumDistanceByVehicle(Long vehicleId);
}