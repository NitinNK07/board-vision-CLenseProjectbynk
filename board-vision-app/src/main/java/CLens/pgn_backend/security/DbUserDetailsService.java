package CLens.pgn_backend.security;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Enterprise implementation of DbUserDetailsService.
 * Provides core functionality and business logic.
 */
@Service
public class DbUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    public DbUserDetailsService(UserRepository repo) { this.repo = repo; }

    /**

     * Executes the loadUserByUsername operation.

     */

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = repo.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException("User not found: " + email)
        );
        return new org.springframework.security.core.userdetails.User(
                u.getEmail(),
                u.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
        );
    }
}
