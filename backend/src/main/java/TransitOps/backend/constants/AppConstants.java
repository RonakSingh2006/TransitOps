package TransitOps.backend.constants;

public final class AppConstants {

    private AppConstants() {
    }

    // Default pagination
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "ASC";

    // Defaults
    public static final double DEFAULT_SAFETY_SCORE = 100.0;
    public static final double ZERO_ODOMETER = 0.0;

    // Messages
    public static final String SUCCESS = "SUCCESS";
    public static final String VEHICLE_NOT_FOUND = "Vehicle not found with id: %d";
    public static final String DRIVER_NOT_FOUND = "Driver not found with id: %d";
    public static final String TRIP_NOT_FOUND = "Trip not found with id: %d";
    public static final String MAINTENANCE_NOT_FOUND = "Maintenance record not found with id: %d";
    public static final String USER_NOT_FOUND = "User not found with email: %s";
    public static final String ROLE_NOT_FOUND = "Role not found: %s";

    // CSV
    public static final String CSV_CONTENT_TYPE = "text/csv";
}