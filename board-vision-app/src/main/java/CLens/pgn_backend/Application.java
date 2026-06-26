package CLens.pgn_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

/**
 * Enterprise implementation of Application.
 * Provides core functionality and business logic.
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "CLens.pgn_backend")
@EntityScan(basePackages = "CLens.pgn_backend")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
