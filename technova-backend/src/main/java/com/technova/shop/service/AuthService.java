package com.technova.shop.service;

import com.technova.shop.dto.AuthResponse;
import com.technova.shop.dto.LoginRequest;
import com.technova.shop.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}