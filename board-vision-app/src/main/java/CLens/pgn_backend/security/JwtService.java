package CLens.pgn_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${app.jwt.secret:defaultSecretKeyForDevelopmentPleaseChangeThisToAReallyLongSecretKeyInProduction1234567890}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:60}") // Default to 60 minutes
    private long jwtExpirationInMinutes;
    
    @Value("${app.jwt.refresh.expiration:1440}") // Default to 24 hours (1440 minutes)
    private long jwtRefreshExpirationInMinutes;

    private Key key() {
        // Validate and decode the secret key from base64
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret cannot be null or empty. Please set the JWT_SECRET environment variable.");
        }
        byte[] keyBytes;
        try {
            // Try to decode as base64 first
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (IllegalArgumentException e) {
            // If base64 decoding fails, use the plain text secret
            keyBytes = jwtSecret.getBytes();
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * Generate access token with default expiration
     */
    public String generateToken(String subject, Map<String, Object> claims) {
        return generateToken(subject, claims, null, false);
    }
    
    /**
     * Generate access token with custom expiration
     */
    public String generateToken(String subject, Map<String, Object> claims, Long minutes) {
        return generateToken(subject, claims, minutes, false);
    }
    
    /**
     * Generate refresh token
     */
    public String generateRefreshToken(String subject) {
        return generateToken(subject, Map.of("type", "refresh"), jwtRefreshExpirationInMinutes, true);
    }

    /**
     * Generate token with specified expiration
     * @param subject typically the user's email
     * @param claims additional claims to include
     * @param minutes expiration time in minutes (uses default if null)
     * @param isRefreshToken true if this is a refresh token
     */
    public String generateToken(String subject, Map<String, Object> claims, Long minutes, boolean isRefreshToken) {
        long expirationMinutes = minutes != null ? minutes :
            (isRefreshToken ? jwtRefreshExpirationInMinutes : jwtExpirationInMinutes);

        if (expirationMinutes <= 0) {
            throw new IllegalArgumentException("Expiration time must be positive");
        }

        long now = System.currentTimeMillis();

        // Create a mutable copy of claims to avoid UnsupportedOperationException
        Map<String, Object> mutableClaims = new java.util.HashMap<>(claims);
        
        // Add token type claim if not present
        if (!mutableClaims.containsKey("type")) {
            mutableClaims.put("type", isRefreshToken ? "refresh" : "access");
        }

        return Jwts.builder()
                .setClaims(mutableClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMinutes * 60_000))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract subject (email) from token
     */
    public String extractSubject(String jwt) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(jwt).getBody().getSubject();
    }

    /**
     * Validate token (checks signature and expiration)
     */
    public boolean isValid(String jwt) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(jwt);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Check if token is expired
     */
    public boolean isExpired(String jwt) {
        try {
            Date expiration = Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(jwt).getBody().getExpiration();
            return expiration.before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return true; // Treat invalid tokens as expired
        }
    }
    
    /**
     * Get token type (access or refresh)
     */
    public String getTokenType(String jwt) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(jwt).getBody();
            return claims.get("type", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Extract all claims from token
     */
    public Claims extractAllClaims(String jwt) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(jwt)
                .getBody();
    }
    
    /**
     * Get remaining time before token expiration (in seconds)
     */
    public long getRemainingTimeSeconds(String jwt) {
        try {
            Date expiration = Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(jwt).getBody().getExpiration();
            long remaining = (expiration.getTime() - System.currentTimeMillis()) / 1000;
            return Math.max(0, remaining);
        } catch (JwtException | IllegalArgumentException e) {
            return 0;
        }
    }
}
