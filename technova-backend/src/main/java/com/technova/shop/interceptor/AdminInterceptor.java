package com.technova.shop.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.technova.shop.dto.ApiResponse;
import com.technova.shop.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AdminInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) throws Exception {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return reject(
                    response,
                    401,
                    "Missing or invalid Authorization header"
            );
        }

        String token = header.substring(7);

        try {
            // Validate token
            jwtUtil.parseToken(token);

            // Check user's role
            String role = jwtUtil.getRole(token);

            if (!"ADMIN".equalsIgnoreCase(role)) {
                return reject(
                        response,
                        403,
                        "Access denied. Admin role required."
                );
            }

            return true;

        } catch (Exception e) {
            return reject(
                    response,
                    401,
                    "Invalid or expired token"
            );
        }
    }

    private boolean reject(
            HttpServletResponse response,
            int status,
            String message
    ) throws Exception {

        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");

        response.getWriter().write(
                objectMapper.writeValueAsString(
                        ApiResponse.error(status, message)
                )
        );

        return false;
    }
}