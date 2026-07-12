package TransitOps.backend.Service.impl;



import TransitOps.backend.dto.request.TripCompleteRequest;
import TransitOps.backend.dto.response.TripResponse;
import TransitOps.backend.entity.Driver;
import TransitOps.backend.entity.Trip;
import TransitOps.backend.entity.User;
import TransitOps.backend.entity.Vehicle;
import TransitOps.backend.enums.DriverStatus;
import TransitOps.backend.enums.TripStatus;
import TransitOps.backend.enums.VehicleStatus;
import TransitOps.backend.exception.BusinessRuleViolationException;
import TransitOps.backend.exception.GlobalExceptionHandler;
import TransitOps.backend.exception.ResourceNotFoundException;
import TransitOps.backend.mapper.TripMapper;
import TransitOps.backend.repository.*;
import TransitOps.backend.repository.DriverRepository;
import TransitOps.backend.repository.TripRepository;
import TransitOps.backend.repository.UserRepository;
import TransitOps.backend.repository.VehicleRepository;
import TransitOps.backend.security.SecurityUtils;
import TransitOps.backend.util.StatusTransitionValidator;




import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Trip lifecycle: DRAFT -> DISPATCHED -> COMPLETED
 *                              \-> CANCELLED
 * Every transition is validated by StatusTransitionValidator and runs inside
 * a single @Transactional boundary so trip + vehicle + driver updates are atomic.
 */
@Service
@RequiredArgsConstructor
public class TripServiceImpl  {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final TripMapper tripMapper;
    private final StatusTransitionValidator validator;


    @Transactional
    public TripResponse createTrip(Trip request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicle().getId())
                .orElseThrow(() -> GlobalExceptionHandler.of("Vehicle", request.getVehicle().getId()));
        Driver driver = driverRepository.findById(request.getDriver().getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Driver",request.getDriver().getId()));

        // Retired/In-Shop vehicles must never appear in dispatch selection, checked here too
        // (defense in depth beyond the /available endpoint filtering).
        validator.assertVehicleNotInDispatchBlockedState(vehicle);
        validator.assertCargoWithinCapacity(request.getCargoWeight(), vehicle.getMaxLoadCapacity());

        User currentUser = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        Trip trip = Trip.builder()
                .source(request.getSource())
                .destination(request.getDestination())
                .vehicle(vehicle)
                .driver(driver)
                .cargoWeight(request.getCargoWeight())
                .plannedDistance(request.getPlannedDistance())
                .status(TripStatus.DRAFT)
                .createdBy(currentUser)
                .build();

        Trip saved = tripRepository.save(trip);
        return tripMapper.toResponse(saved);
    }


    @Transactional
    public TripResponse dispatchTrip(Long tripId) {
        Trip trip = findTripOrThrow(tripId);
        validator.assertLegalTripTransition(trip.getStatus(), TripStatus.DISPATCHED);

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // Re-validate against LIVE state -- vehicle/driver may have changed since the trip was drafted.
        validator.assertVehicleAvailableForDispatch(vehicle);
        validator.assertDriverAvailableForDispatch(driver);
        validator.assertCargoWithinCapacity(trip.getCargoWeight(), vehicle.getMaxLoadCapacity());

        vehicle.setStatus(VehicleStatus.ON_TRIP);
        driver.setStatus(DriverStatus.ON_TRIP);

        trip.setStartOdometer(vehicle.getOdometer());
        trip.setStatus(TripStatus.DISPATCHED);
        trip.setDispatchedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);
        driverRepository.save(driver);
        Trip saved = tripRepository.save(trip);

        return tripMapper.toResponse(saved);
    }


    @Transactional
    public TripResponse completeTrip(Long tripId, TripCompleteRequest request) {
        Trip trip = findTripOrThrow(tripId);
        validator.assertLegalTripTransition(trip.getStatus(), TripStatus.COMPLETED);

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        if (trip.getStartOdometer() != null && request.getEndOdometer().compareTo(trip.getStartOdometer()) < 0) {
            throw new BusinessRuleViolationException("End odometer cannot be less than the start odometer");
        }

        trip.setEndOdometer(request.getEndOdometer());
        trip.setFuelConsumed(request.getFuelConsumed());
        trip.setRevenue(request.getRevenue());
        if (trip.getStartOdometer() != null) {
            trip.setActualDistance(request.getEndOdometer().subtract(trip.getStartOdometer()));
        }
        trip.setStatus(TripStatus.COMPLETED);
        trip.setCompletedAt(LocalDateTime.now());

        vehicle.setOdometer(request.getEndOdometer());
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        driver.setStatus(DriverStatus.AVAILABLE);

        vehicleRepository.save(vehicle);
        driverRepository.save(driver);
        Trip saved = tripRepository.save(trip);

        return tripMapper.toResponse(saved);
    }


    @Transactional
    public TripResponse cancelTrip(Long tripId) {
        Trip trip = findTripOrThrow(tripId);
        validator.assertLegalTripTransition(trip.getStatus(), TripStatus.CANCELLED);

        boolean wasDispatched = trip.getStatus() == TripStatus.DISPATCHED;

        trip.setStatus(TripStatus.CANCELLED);

        if (wasDispatched) {
            Vehicle vehicle = trip.getVehicle();
            Driver driver = trip.getDriver();
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            driver.setStatus(DriverStatus.AVAILABLE);
            vehicleRepository.save(vehicle);
            driverRepository.save(driver);
        }

        Trip saved = tripRepository.save(trip);
        return tripMapper.toResponse(saved);
    }


    @Transactional(readOnly = true)
    public TripResponse getTripById(Long tripId) {
        return tripMapper.toResponse(findTripOrThrow(tripId));
    }


    @Transactional(readOnly = true)
    public Page<TripResponse> getAllTrips(TripStatus status, Pageable pageable) {
        Specification<Trip> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return tripRepository.findAll(spec, pageable).map(tripMapper::toResponse);
    }

    private Trip findTripOrThrow(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> ResourceNotFoundException.of("Trip", tripId));
    }
}
