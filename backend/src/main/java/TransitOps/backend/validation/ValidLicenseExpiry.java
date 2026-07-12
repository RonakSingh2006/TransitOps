package TransitOps.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Structural check only: ensures the supplied license expiry date is a real,
 * non-null date. It intentionally does NOT reject past dates at this layer --
 * a driver's license CAN already be expired when their profile is first entered
 * into the system (e.g. migrating existing records); the *assignment* rule
 * ("cannot assign a driver with an expired license to a trip") is a business
 * rule enforced in TripServiceImpl / StatusTransitionValidator, not here.
 */
@Documented
@Constraint(validatedBy = ValidLicenseExpiryValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidLicenseExpiry {
    String message() default "License expiry date must be a valid date";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

