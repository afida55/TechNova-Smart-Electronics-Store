package com.technova.shop.service.impl;

import com.technova.shop.dto.AuthResponse;
import com.technova.shop.dto.LoginRequest;
import com.technova.shop.dto.RegisterRequest;
import com.technova.shop.entity.User;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.UserMapper;
import com.technova.shop.service.AuthService;
import com.technova.shop.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // Check whether username already exists
        if (userMapper.countByUsername(request.getUsername()) > 0) {
            throw new BusinessException("Username is already taken");
        }

        // Check whether email already exists
        if (userMapper.countByEmail(request.getEmail()) > 0) {
            throw new BusinessException("Email is already registered");
        }

        // Create new user
        User user = new User();

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());

        // Every newly registered account is a normal USER
        user.setRole("USER");

        userMapper.insert(user);

        // Generate JWT with user ID, username and role
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // Find user by username
        User user = userMapper.findByUsername(request.getUsername());

        // Validate username and password
        if (user == null ||
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )) {

            throw new BusinessException(
                    401,
                    "Incorrect username or password"
            );
        }

        // Generate JWT with user ID, username and role
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }
}