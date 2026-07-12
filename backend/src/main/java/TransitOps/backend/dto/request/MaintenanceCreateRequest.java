package TransitOps.backend.dto.request;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceCreateRequest {
    @NotNull
    private Long vehicleId;
    @NotBlank
    private String maintenanceType;
    private String description;
    @NotNull @Positive
    private BigDecimal cost;
    @NotNull
    private LocalDate startDate;
}