package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;

/**
 * Enterprise implementation of AuthMeController.
 * Provides core functionality and business logic.
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthMeController {

    private final UserService users;
    private final ScanService scans;

    public AuthMeController(UserService users, ScanService scans) {
        this.users = users;
        this.scans = scans;
    }

    /**

     * Executes the init operation.

     */

    @PostConstruct
    public void init() {
        log.info("[AuthMeController] Controller initialized!");
    }

    /**

     * Executes the me operation.

     */

    @GetMapping("/me")
    public Object me() {
        log.info("[AuthMeController] /me endpoint called");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("[AuthMeController] Authentication: {}", auth);
        log.info("[AuthMeController] Auth name: {}", auth.getName());
        
        String email = auth.getName();
        User u = users.findByEmail(email);
        log.info("[AuthMeController] User found: {}", u.getEmail());

        var allowance = scans.getAllowance(u);

        return new Object() {
            public String email = u.getEmail();
            public String name = u.getName();
            public String role = u.getRole().name();
            public String phoneNumber = u.getPhoneNumber();
            public Boolean emailVerified = u.isEmailVerified();
            public Boolean phoneVerified = u.isPhoneVerified();
            public Object balance = allowance;
        };
    }
}

