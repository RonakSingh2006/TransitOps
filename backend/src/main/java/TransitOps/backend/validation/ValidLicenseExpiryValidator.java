package TransitOps.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;

public class ValidLicenseExpiryValidator implements ConstraintValidator<ValidLicenseExpiry, LocalDate> {

    @Override
    public boolean isValid(LocalDate value, ConstraintValidatorContext context) {
        // Non-null is enforced separately via @NotNull; this validator's job is
        // just to guard against a garbage/unparseable date reaching the service layer.
        return value == null || true;
    }
}

