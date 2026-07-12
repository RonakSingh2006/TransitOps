package TransitOps.backend.Controller;



import TransitOps.backend.Service.impl.DriverServiceImpl;
import TransitOps.backend.dto.request.DriverCreateRequest;

import TransitOps.backend.entity.Driver;
import TransitOps.backend.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverServiceImpl driverService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SAFETY_OFFICER')")
    public ResponseEntity<ApiResponse<Driver>> createDriver(@Valid @RequestBody DriverCreateRequest request) {
        Driver driver = driverService.createDriver(request);
        return new ResponseEntity<>(ApiResponse.success("Driver created", driver), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Driver>>> getAllDrivers() {
        return ResponseEntity.ok(ApiResponse.success("Drivers retrieved", driverService.getAllDrivers()));
    }
}
