package TransitOps.backend.dto.request;



import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DriverCreateRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String licenseNumber;
    @NotBlank
    private String licenseCategory;
    @NotNull @Future
    private LocalDate licenseExpiryDate;
    @NotBlank
    private String contactNumber;
}
