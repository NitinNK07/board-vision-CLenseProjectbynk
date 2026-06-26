package CLens.pgn_backend.controller;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.service.UserService;
import CLens.pgn_backend.service.ScanService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Enterprise implementation of ScanController.
 * Provides core functionality and business logic.
 */
@RestController
@RequestMapping("/scan")
public class ScanController {

    private final UserService users;
    private final ScanService scans;

    public ScanController(UserService users, ScanService scans) {
        this.users = users;
        this.scans = scans;
    }

    @GetMapping("/allowance")
    public ScanService.Allowance allowance() {
        User u = currentUser();
        return scans.getAllowance(u);
    }

    @PostMapping("/watch-ad")
    public ScanService.Allowance watchAd() {
        User u = currentUser();
        
        // Grant 1 ad credit for watching an ad
        ScanService.Allowance allowance = scans.grantAd(u, 1);
        return allowance;
    }

    // helper
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return users.findByEmail(email);
    }
}

