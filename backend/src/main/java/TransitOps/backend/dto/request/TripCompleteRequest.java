package TransitOps.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCompleteRequest {

    @NotNull(message = "End odometer reading is required")
    @PositiveOrZero
    private BigDecimal endOdometer;

    @NotNull(message = "Fuel consumed is required")
    @PositiveOrZero
    private BigDecimal fuelConsumed;

    /** Optional freight revenue collected for this trip, used for Vehicle ROI reporting. */
    @PositiveOrZero
    private BigDecimal revenue;
}

