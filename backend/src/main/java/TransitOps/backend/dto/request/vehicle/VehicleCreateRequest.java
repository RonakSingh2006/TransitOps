package TransitOps.backend.dto.request.vehicle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VehicleCreateRequest {
    @NotBlank
    private String registrationNumber;
    @NotBlank
    private String nameModel;

    @NotNull @Positive
    private BigDecimal maxLoadCapacity;
    @NotNull @Positive
    private BigDecimal acquisitionCost;
    private String region;
}
