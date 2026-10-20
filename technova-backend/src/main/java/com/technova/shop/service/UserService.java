package com.technova.shop.service;

import com.technova.shop.dto.UpdateProfileRequest;
import com.technova.shop.entity.User;
import com.technova.shop.dto.ChangePasswordRequest;
import java.util.List;

public interface UserService {

    // ============================================================
    // USER SIDE
    // ============================================================

    User getProfile(Long userId);

    User updateProfile(
            Long userId,
            UpdateProfileRequest request
    );

    // ============================================================
    // SAVED SHIPPING ADDRESS
    // ============================================================

    User updateShippingAddress(
            Long userId,
            User shippingAddress
    );

    // ============================================================
    // SAVED PAYMENT INFORMATION
    // ============================================================

    User updatePaymentDetails(
            Long userId,
            User paymentDetails
    );

    // ============================================================
    // ADMIN SIDE
    // ============================================================

    List<User> getAllUsers();

    List<User> getDeletedUsers();

    User createUserByAdmin(User user);

    User updateUser(
            Long id,
            User user
    );

    void deleteUser(Long id);

    void restoreUser(Long id);
    void changePassword(Long userId, ChangePasswordRequest request);
}