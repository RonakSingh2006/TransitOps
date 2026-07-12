package TransitOps.backend.Controller;



import TransitOps.backend.Service.impl.FuelLogServiceImpl;
import TransitOps.backend.dto.request.FuelLogRequest;
import TransitOps.backend.response.ApiResponse;

import TransitOps.backend.entity.FuelLog;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fuel-logs")
@RequiredArgsConstructor
public class FuelLogController {

    private final FuelLogServiceImpl fuelLogService;

    @PostMapping
    public ResponseEntity<ApiResponse<FuelLog>> logFuel(@Valid @RequestBody FuelLogRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Fuel logged", fuelLogService.createFuelLog(request)));
    }
}
