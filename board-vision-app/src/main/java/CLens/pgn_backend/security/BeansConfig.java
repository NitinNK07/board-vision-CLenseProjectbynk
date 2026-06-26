package CLens.pgn_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Enterprise implementation of BeansConfig.
 * Provides core functionality and business logic.
 */
@Configuration
public class BeansConfig {
    /**
     * Executes the passwordEncoder operation.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
