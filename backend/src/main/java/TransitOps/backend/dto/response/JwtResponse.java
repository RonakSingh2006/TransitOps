package TransitOps.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JwtResponse {
    private String accessToken;
    private String tokenType;
    private String role;
    private String name;
}