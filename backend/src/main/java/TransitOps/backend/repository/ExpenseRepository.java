package TransitOps.backend.repository;
import TransitOps.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByVehicleId(Long vehicleId);

    List<Expense> findByTripId(Long tripId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.vehicle.id = :vehicleId")
    BigDecimal sumAmountByVehicle(@Param("vehicleId") Long vehicleId);
}
