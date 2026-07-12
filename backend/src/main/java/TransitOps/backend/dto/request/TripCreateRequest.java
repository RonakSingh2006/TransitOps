package TransitOps.backend.dto.request;

import com.transitops.validation.ValidCargoWeight;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCreateRequest {

    @NotBlank(message = "Source is required")
    @Size(max = 150)
    private String source;

    @NotBlank(message = "Destination is required")
    @Size(max = 150)
    private String destination;

    @NotNull(message = "Vehicle is required")
    private Long vehicleId;

    @NotNull(message = "Driver is required")
    private Long driverId;

    @NotNull(message = "Cargo weight is required")
    @ValidCargoWeight
    private BigDecimal cargoWeight;

    @NotNull(message = "Planned distance is required")
    @Positive(message = "Planned distance must be positive")
    private BigDecimal plannedDistance;
}
