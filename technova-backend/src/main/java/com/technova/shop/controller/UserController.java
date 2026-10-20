package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.dto.ChangePasswordRequest;
import com.technova.shop.dto.UpdateProfileRequest;
import com.technova.shop.entity.User;
import com.technova.shop.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    // ============================================================
    // GET CURRENT USER PROFILE
    // ============================================================

    @GetMapping("/me")
    public ApiResponse<User> getProfile(
            HttpServletRequest req
    ) {

        return ApiResponse.success(
                userService.getProfile(
                        userId(req)
                )
        );
    }


    // ============================================================
    // UPDATE CURRENT USER PROFILE
    // ============================================================

    @PutMapping("/me")
    public ApiResponse<User> updateProfile(
            HttpServletRequest req,
            @Valid @RequestBody UpdateProfileRequest body
    ) {

        return ApiResponse.success(
                "Profile updated",
                userService.updateProfile(
                        userId(req),
                        body
                )
        );
    }


    // ============================================================
    // UPDATE / SAVE SHIPPING ADDRESS
    // ============================================================

    @PutMapping("/me/shipping-address")
    public ApiResponse<User> updateShippingAddress(
            HttpServletRequest req,
            @RequestBody User body
    ) {

        return ApiResponse.success(
                "Shipping address saved",
                userService.updateShippingAddress(
                        userId(req),
                        body
                )
        );
    }


    // ============================================================
    // CHANGE PASSWORD
    // ============================================================

    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(
            HttpServletRequest req,
            @Valid @RequestBody ChangePasswordRequest body
    ) {

        userService.changePassword(
                userId(req),
                body
        );

        return ApiResponse.success(
                "Password changed successfully",
                null
        );
    }


    // ============================================================
    // UPDATE / SAVE PAYMENT INFORMATION
    // ============================================================

    @PutMapping("/me/payment-details")
    public ApiResponse<User> updatePaymentDetails(
            HttpServletRequest req,
            @RequestBody User body
    ) {

        return ApiResponse.success(
                "Payment information saved",
                userService.updatePaymentDetails(
                        userId(req),
                        body
                )
        );
    }


    // ============================================================
    // GET USER ID FROM JWT AUTH INTERCEPTOR
    // ============================================================

    private Long userId(
            HttpServletRequest req
    ) {

        return (Long) req.getAttribute("userId");
    }
}