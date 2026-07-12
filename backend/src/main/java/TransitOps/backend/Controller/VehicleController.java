package TransitOps.backend.Controller;



import TransitOps.backend.Service.VehicleService;
import TransitOps.backend.dto.request.vehicle.VehicleCreateRequest;
import TransitOps.backend.entity.Vehicle;
import TransitOps.backend.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')") // Enforcing RBAC at controller level
    public ResponseEntity<ApiResponse<Vehicle>> createVehicle(@Valid @RequestBody VehicleCreateRequest request) {
        Vehicle savedVehicle = vehicleService.createVehicle(request);
        return new ResponseEntity<>(ApiResponse.success("Vehicle created successfully", savedVehicle), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAllVehicles() {
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved", vehicleService.getAllVehicles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved", vehicleService.getVehicleById(id)));
    }
}
