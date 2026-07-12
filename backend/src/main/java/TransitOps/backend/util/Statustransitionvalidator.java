package TransitOps.backend.util;



import TransitOps.backend.entity.Driver;
import TransitOps.backend.entity.Vehicle;
import TransitOps.backend.enums.DriverStatus;
import TransitOps.backend.enums.TripStatus;
import TransitOps.backend.enums.VehicleStatus;
import TransitOps.backend.exception.BusinessRuleViolationException;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

/**
 * Centralizes every status-based guard so TripServiceImpl / MaintenanceServiceImpl
 * stay declarative. Two kinds of checks live here:
 *  1. Legal state-machine transitions for Trip status.
 *  2. Cross-entity business rules (vehicle/driver availability, license validity, cargo weight).
 */
@Component
public class StatusTransitionValidator {

    private static final Map<TripStatus, Set<TripStatus>> ALLOWED_TRIP_TRANSITIONS = Map.of(
            TripStatus.DRAFT, Set.of(TripStatus.DISPATCHED, TripStatus.CANCELLED),
            TripStatus.DISPATCHED, Set.of(TripStatus.COMPLETED, TripStatus.CANCELLED),
            TripStatus.COMPLETED, Set.of(),
            TripStatus.CANCELLED, Set.of()
    );

    public void assertLegalTripTransition(TripStatus from, TripStatus to) {
        Set<TripStatus> allowed = ALLOWED_TRIP_TRANSITIONS.getOrDefault(from, Set.of());
        if (!allowed.contains(to)) {
            throw new BusinessRuleViolationException(
                    "Cannot transition trip from " + from + " to " + to);
        }
    }

    public void assertVehicleAvailableForDispatch(Vehicle vehicle) {
        if (vehicle.getStatus() == VehicleStatus.RETIRED) {
            throw new BusinessRuleViolationException("Vehicle " + vehicle.getRegistrationNumber() + " is retired and cannot be dispatched");
        }
        if (vehicle.getStatus() == VehicleStatus.IN_SHOP) {
            throw new BusinessRuleViolationException("Vehicle " + vehicle.getRegistrationNumber() + " is in maintenance and cannot be dispatched");
        }
        if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
            throw new BusinessRuleViolationException("Vehicle " + vehicle.getRegistrationNumber() + " is already on another trip");
        }
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BusinessRuleViolationException("Vehicle " + vehicle.getRegistrationNumber() + " is not available");
        }
    }

    public void assertDriverAvailableForDispatch(Driver driver) {
        if (driver.getStatus() == DriverStatus.SUSPENDED) {
            throw new BusinessRuleViolationException("Driver " + driver.getName() + " is suspended and cannot be assigned");
        }
        if (driver.getStatus() == DriverStatus.ON_TRIP) {
            throw new BusinessRuleViolationException("Driver " + driver.getName() + " is already on another trip");
        }
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new BusinessRuleViolationException("Driver " + driver.getName() + " is not available");
        }
        if (driver.getLicenseExpiryDate() != null && driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessRuleViolationException("Driver " + driver.getName() + " has an expired license");
        }
    }

    public void assertCargoWithinCapacity(BigDecimal cargoWeight, BigDecimal maxLoadCapacity) {
        if (cargoWeight == null || maxLoadCapacity == null) {
            throw new BusinessRuleViolationException("Cargo weight and vehicle capacity must be provided");
        }
        if (cargoWeight.compareTo(maxLoadCapacity) > 0) {
            throw new BusinessRuleViolationException(
                    "Cargo weight (" + cargoWeight + "kg) exceeds vehicle capacity (" + maxLoadCapacity + "kg)");
        }
    }

    public void assertVehicleNotInDispatchBlockedState(Vehicle vehicle) {
        if (vehicle.getStatus() == VehicleStatus.RETIRED || vehicle.getStatus() == VehicleStatus.IN_SHOP) {
            throw new BusinessRuleViolationException(
                    "Vehicle " + vehicle.getRegistrationNumber() + " is " + vehicle.getStatus() + " and cannot appear in dispatch selection");
        }
    }
}
