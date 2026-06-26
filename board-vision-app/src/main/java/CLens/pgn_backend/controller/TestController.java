
package CLens.pgn_backend.controller;

import CLens.pgn_backend.service.*;
import CLens.pgn_backend.entity.*;
import CLens.pgn_backend.repository.*;
import CLens.pgn_backend.dto.*;
import CLens.pgn_backend.enums.Role;

import org.springframework.web.bind.annotation.*;

@RestController
// CORS handled globally by SecurityConfig
/**
 * Enterprise implementation of TestController.
 * Provides core functionality and business logic.
 */
@RequestMapping("/test")
public class TestController {

    /**

     * Executes the testConnection operation.

     */

    @GetMapping("/connection")
    public String testConnection() {
        return "Connection successful! Backend is accessible from mobile app.";
    }
    
    /**
    
     * Executes the echo operation.
    
     */
    
    @PostMapping("/echo")
    public String echo(@RequestBody String data) {
        return "Received: " + data;
    }
}
