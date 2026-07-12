package TransitOps.backend.Controller;



import TransitOps.backend.Service.impl.TripServiceImpl;
import TransitOps.backend.dto.response.TripResponse;
import TransitOps.backend.entity.Trip;
import TransitOps.backend.response.ApiResponse;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripServiceImpl tripService;

    @PatchMapping("/{id}/dispatch")
    @PreAuthorize("hasAnyRole('DRIVER', 'FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<TripResponse>> dispatchTrip(@PathVariable Long id) {
        TripResponse dispatchedTrip = tripService.dispatchTrip(id);
        return ResponseEntity.ok(ApiResponse.success("Trip dispatched successfully", dispatchedTrip));
    }
}
