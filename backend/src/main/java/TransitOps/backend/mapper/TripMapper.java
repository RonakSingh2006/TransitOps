package TransitOps.backend.mapper;

import TransitOps.backend.dto.response.TripResponse;

import TransitOps.backend.entity.Trip;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TripMapper {

    @Mapping(target = "vehicleId", source = "vehicle.id")
    @Mapping(target = "vehicleRegistrationNumber", source = "vehicle.registrationNumber")
    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "driverName", source = "driver.name")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.name")
    TripResponse toResponse(Trip trip);
}
