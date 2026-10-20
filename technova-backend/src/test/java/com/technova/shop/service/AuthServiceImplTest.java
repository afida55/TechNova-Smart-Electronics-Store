package com.technova.shop.service;

import com.technova.shop.dto.AuthResponse;
import com.technova.shop.dto.LoginRequest;
import com.technova.shop.dto.RegisterRequest;
import com.technova.shop.entity.User;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.UserMapper;
import com.technova.shop.service.impl.AuthServiceImpl;
import com.technova.shop.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserMapper userMapper;

    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtUtil = new JwtUtil();
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtil, "secret", "test-secret");
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3600000L);
        authService = new AuthServiceImpl(userMapper, passwordEncoder, jwtUtil);
    }

    @Test
    void registerRejectsDuplicateUsername() {
        when(userMapper.countByUsername("alice")).thenReturn(1);

        RegisterRequest req = new RegisterRequest();
        req.setUsername("alice");
        req.setPassword("password123");
        req.setPhone("13800000000");
        req.setEmail("alice@example.com");

        assertThrows(BusinessException.class, () -> authService.register(req));
    }

    @Test
    void loginFailsWithWrongPassword() {
        User stored = new User();
        stored.setId(1L);
        stored.setUsername("alice");
        stored.setPassword(passwordEncoder.encode("correct-password"));

        when(userMapper.findByUsername("alice")).thenReturn(stored);

        LoginRequest req = new LoginRequest();
        req.setUsername("alice");
        req.setPassword("wrong-password");

        assertThrows(BusinessException.class, () -> authService.login(req));
    }

    @Test
    void loginSucceedsAndReturnsToken() {
        User stored = new User();
        stored.setId(1L);
        stored.setUsername("alice");
        stored.setPassword(passwordEncoder.encode("correct-password"));

        when(userMapper.findByUsername("alice")).thenReturn(stored);

        LoginRequest req = new LoginRequest();
        req.setUsername("alice");
        req.setPassword("correct-password");

        AuthResponse response = authService.login(req);
        assertNotNull(response.getToken());
        assertEquals(1L, response.getUserId());
    }
}
