package TransitOps.backend.constants;

public final class SecurityConstants {

    private SecurityConstants() {
    }

    public static final String AUTH_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String ROLE_PREFIX = "ROLE_";

    // NOTE: /api/auth/register is intentionally NOT public — per the architecture doc
    // it is a Fleet-Manager-only action (Fleet Managers onboard other users). The very
    // first Fleet Manager account is created via the Flyway seed migration (V2__seed_roles.sql).
    public static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/login",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };
}