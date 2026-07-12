package TransitOps.backend.Controller;

import TransitOps.backend.Service.impl.ReportServiceImpl;
import TransitOps.backend.response.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportServiceImpl reportService;

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('FINANCIAL_ANALYST', 'FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVehicleReport(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(ApiResponse.success("Report generated", reportService.getVehicleFinancialReport(vehicleId)));
    }
}
