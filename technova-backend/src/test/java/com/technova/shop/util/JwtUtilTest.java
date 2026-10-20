package com.technova.shop.util;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();

        ReflectionTestUtils.setField(
                jwtUtil,
                "secret",
                "test-secret-key-for-unit-tests"
        );

        ReflectionTestUtils.setField(
                jwtUtil,
                "expirationMs",
                3600000L
        );
    }

    @Test
    void generatedTokenContainsCorrectUserId() {

        String token = jwtUtil.generateToken(
                42L,
                "alice",
                "USER"
        );

        assertEquals(
                42L,
                jwtUtil.getUserId(token)
        );
    }

    @Test
    void parsedClaimsContainUsername() {

        String token = jwtUtil.generateToken(
                7L,
                "bob",
                "USER"
        );

        Claims claims = jwtUtil.parseToken(token);

        assertEquals(
                "bob",
                claims.get("username")
        );
    }

    @Test
    void parsedClaimsContainRole() {

        String token = jwtUtil.generateToken(
                5L,
                "admin",
                "ADMIN"
        );

        assertEquals(
                "ADMIN",
                jwtUtil.getRole(token)
        );
    }
}