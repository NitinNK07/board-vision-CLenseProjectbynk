
package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/auth")
public class AuthMeController {

    private final UserService users;
    private final ScanService scans;

    public AuthMeController(UserService users, ScanService scans) {
        this.users = users;
        this.scans = scans;
    }

    @PostConstruct
    public void init() {
        System.out.println("[AuthMeController] Controller initialized!");
    }

    @GetMapping("/me")
    public Object me() {
        System.out.println("[AuthMeController] /me endpoint called");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[AuthMeController] Authentication: " + auth);
        System.out.println("[AuthMeController] Auth name: " + auth.getName());
        
        String email = auth.getName();
        User u = users.findByEmail(email);
        System.out.println("[AuthMeController] User found: " + u.getEmail());

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

