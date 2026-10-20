package com.technova.shop.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key() {
        // Hash the configured secret into a valid 256-bit HMAC key
        return Keys.hmacShaKeyFor(sha256(secret));
    }

    private byte[] sha256(String input) {
        try {
            java.security.MessageDigest digest =
                    java.security.MessageDigest.getInstance("SHA-256");

            return digest.digest(input.getBytes());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Generate JWT containing user ID, username and role.
     */
    public String generateToken(
            Long userId,
            String username,
            String role
    ) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parse and validate JWT.
     */
    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Get user ID from JWT.
     */
    public Long getUserId(String token) {
        return Long.valueOf(
                parseToken(token).getSubject()
        );
    }

    /**
     * Get role from JWT.
     */
    public String getRole(String token) {
        return parseToken(token)
                .get("role", String.class);
    }
}