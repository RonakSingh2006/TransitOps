package TransitOps.backend.dto.request;



import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FuelLogRequest {
    @NotNull
    private Long vehicleId;
    private Long tripId;
    @NotNull @Positive
    private BigDecimal liters;
    @NotNull @Positive
    private BigDecimal cost;
    @NotNull
    private LocalDate logDate;
    private BigDecimal odometerReading;
}
