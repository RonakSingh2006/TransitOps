package TransitOps.backend.Service;

import TransitOps.backend.dto.request.vehicle.VehicleCreateRequest;
import TransitOps.backend.entity.Vehicle;

import java.util.List;

public interface VehicleService {
    Vehicle createVehicle(VehicleCreateRequest request);
    List<Vehicle> getAllVehicles();
    Vehicle getVehicleById(Long id);
}
