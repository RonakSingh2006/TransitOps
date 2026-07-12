package TransitOps.backend.repository;
import TransitOps.backend.entity.Role;
import TransitOps.backend.enums.RoleType;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}