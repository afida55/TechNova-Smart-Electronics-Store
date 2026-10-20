package com.technova.shop.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.technova.shop.dto.ApiResponse;
import com.technova.shop.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Reads "Authorization: Bearer <token>", validates it, and stashes the
 * authenticated userId on the request so controllers can read it.
 */
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return reject(response, "Missing or invalid Authorization header");
        }
        String token = header.substring(7);
        try {
            Long userId = jwtUtil.getUserId(token);
            request.setAttribute("userId", userId);
            return true;
        } catch (Exception e) {
            return reject(response, "Invalid or expired token");
        }
    }

    private boolean reject(HttpServletResponse response, String message) throws Exception {
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(401, message)));
        return false;
    }
}
