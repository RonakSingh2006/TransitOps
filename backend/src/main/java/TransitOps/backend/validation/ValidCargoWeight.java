package TransitOps.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * DTO-level structural check: cargo weight must be positive and non-null.
 * The REAL cross-field rule (cargo weight <= vehicle's max load capacity)
 * requires reading the Vehicle from the DB, so it cannot be expressed as a
 * simple annotation -- it is enforced in TripServiceImpl.createTrip() via
 * StatusTransitionValidator.assertCargoWithinCapacity().
 */
@Documented
@Constraint(validatedBy = ValidCargoWeightValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCargoWeight {
    String message() default "Cargo weight must be a positive number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

