package TransitOps.backend.Controller;


import TransitOps.backend.dto.request.MaintenanceCreateRequest;
import TransitOps.backend.entity.MaintenanceLog;
import TransitOps.backend.response.ApiResponse;
import TransitOps.backend.Service.impl.MaintenanceServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceServiceImpl maintenanceService;

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceLog>> createLog(@Valid @RequestBody MaintenanceCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Maintenance created", maintenanceService.createMaintenanceLog(request)));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceLog>> closeLog(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Maintenance closed", maintenanceService.closeMaintenanceLog(id)));
    }
}
;