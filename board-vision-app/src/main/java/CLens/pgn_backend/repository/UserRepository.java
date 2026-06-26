package CLens.pgn_backend.repository;

import CLens.pgn_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Enterprise implementation of UserRepository.
 * Provides core functionality and business logic.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
}
