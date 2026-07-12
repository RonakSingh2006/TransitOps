package TransitOps.backend.dto.response;



import TransitOps.backend.enums.TripStatus;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripResponse {

    private Long id;
    private String source;
    private String destination;

    private Long vehicleId;
    private String vehicleRegistrationNumber;

    private Long driverId;
    private String driverName;

    private BigDecimal cargoWeight;
    private BigDecimal plannedDistance;
    private BigDecimal actualDistance;
    private BigDecimal startOdometer;
    private BigDecimal endOdometer;
    private BigDecimal fuelConsumed;
    private BigDecimal revenue;

    private TripStatus status;

    private Long createdById;
    private String createdByName;

    private LocalDateTime dispatchedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}