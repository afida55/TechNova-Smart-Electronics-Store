package com.technova.shop.service.impl;
import com.technova.shop.dto.ChangePasswordRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.technova.shop.dto.UpdateProfileRequest;
import com.technova.shop.entity.User;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.UserMapper;
import com.technova.shop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    private final PasswordEncoder passwordEncoder;


    // ============================================================
    // USER SIDE
    // ============================================================

    @Override
    public User getProfile(Long userId) {

        User user = userMapper.findById(userId);

        if (user == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        user.setPassword(null);

        return user;
    }


    @Override
    public User updateProfile(
            Long userId,
            UpdateProfileRequest request
    ) {

        User user = userMapper.findById(userId);

        if (user == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        if (request == null) {
            throw new BusinessException(
                    "Profile information is required"
            );
        }

        if (request.getUsername() == null ||
                request.getUsername().trim().isEmpty()) {

            throw new BusinessException(
                    "Username is required"
            );
        }

        String username =
                request.getUsername().trim();

        if (userMapper.countByUsernameExcludingId(
                username,
                userId
        ) > 0) {

            throw new BusinessException(
                    "Username is already taken"
            );
        }

        if (request.getEmail() != null &&
                !request.getEmail().trim().isEmpty() &&
                userMapper.countByEmailExcludingId(
                        request.getEmail().trim(),
                        userId
                ) > 0) {

            throw new BusinessException(
                    "Email is already registered"
            );
        }

        user.setUsername(username);

        user.setEmail(
                request.getEmail() == null
                        ? null
                        : request.getEmail().trim()
        );

        user.setPhone(
                request.getPhone() == null
                        ? null
                        : request.getPhone().trim()
        );

        userMapper.update(user);

        user.setPassword(null);

        return user;
    }


    // ============================================================
    // SAVED SHIPPING ADDRESS
    // ============================================================

    @Override
    public User updateShippingAddress(
            Long userId,
            User shippingAddress
    ) {

        User existing =
                userMapper.findById(userId);

        if (existing == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        if (shippingAddress == null) {
            throw new BusinessException(
                    "Shipping information is required"
            );
        }

        String receiverName =
                shippingAddress.getReceiverName() == null
                        ? ""
                        : shippingAddress.getReceiverName().trim();

        if (receiverName.isEmpty()) {
            throw new BusinessException(
                    "Receiver name is required"
            );
        }

        String receiverPhone =
                shippingAddress.getReceiverPhone() == null
                        ? ""
                        : shippingAddress.getReceiverPhone().trim();

        if (receiverPhone.isEmpty()) {
            throw new BusinessException(
                    "Receiver phone is required"
            );
        }

        String shippingStreet =
                shippingAddress.getShippingStreet() == null
                        ? ""
                        : shippingAddress.getShippingStreet().trim();

        if (shippingStreet.isEmpty()) {
            throw new BusinessException(
                    "Shipping street is required"
            );
        }

        String shippingCity =
                shippingAddress.getShippingCity() == null
                        ? ""
                        : shippingAddress.getShippingCity().trim();

        if (shippingCity.isEmpty()) {
            throw new BusinessException(
                    "Shipping city is required"
            );
        }

        String shippingZip =
                shippingAddress.getShippingZip() == null
                        ? ""
                        : shippingAddress.getShippingZip().trim();

        if (shippingZip.isEmpty()) {
            throw new BusinessException(
                    "Shipping ZIP / postal code is required"
            );
        }

        User update = new User();

        update.setId(userId);

        update.setReceiverName(
                receiverName
        );

        update.setReceiverPhone(
                receiverPhone
        );

        update.setShippingStreet(
                shippingStreet
        );

        update.setShippingCity(
                shippingCity
        );

        update.setShippingZip(
                shippingZip
        );

        int affected =
                userMapper.updateShippingAddress(update);

        if (affected == 0) {
            throw new BusinessException(
                    404,
                    "Shipping address could not be saved"
            );
        }

        User updated =
                userMapper.findById(userId);

        if (updated == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        updated.setPassword(null);

        return updated;
    }


    // ============================================================
    // SAVED PAYMENT INFORMATION
    // ============================================================

    @Override
    public User updatePaymentDetails(
            Long userId,
            User paymentDetails
    ) {

        // --------------------------------------------------------
        // Find active user
        // --------------------------------------------------------

        User existing =
                userMapper.findById(userId);

        if (existing == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        // --------------------------------------------------------
        // Validate request
        // --------------------------------------------------------

        if (paymentDetails == null) {
            throw new BusinessException(
                    "Payment information is required"
            );
        }

        // --------------------------------------------------------
        // Payment method
        // --------------------------------------------------------

        String paymentMethod =
                paymentDetails.getSavedPaymentMethod() == null
                        ? ""
                        : paymentDetails.getSavedPaymentMethod()
                        .trim()
                        .toLowerCase();

        if (paymentMethod.isEmpty()) {
            throw new BusinessException(
                    "Payment method is required"
            );
        }

        if (!paymentMethod.equals("card") &&
                !paymentMethod.equals("wallet") &&
                !paymentMethod.equals("cod")) {

            throw new BusinessException(
                    "Invalid payment method"
            );
        }

        // --------------------------------------------------------
        // Card information
        // --------------------------------------------------------

        String cardName =
                paymentDetails.getSavedCardName() == null
                        ? null
                        : paymentDetails.getSavedCardName().trim();

        String cardLast4 =
                paymentDetails.getSavedCardLast4() == null
                        ? null
                        : paymentDetails.getSavedCardLast4().trim();

        String cardExpiry =
                paymentDetails.getSavedCardExpiry() == null
                        ? null
                        : paymentDetails.getSavedCardExpiry().trim();

        // --------------------------------------------------------
        // Validate card
        // --------------------------------------------------------

        if (paymentMethod.equals("card")) {

            if (cardName == null ||
                    cardName.isEmpty()) {

                throw new BusinessException(
                        "Cardholder name is required"
                );
            }

            if (cardLast4 == null ||
                    !cardLast4.matches("\\d{4}")) {

                throw new BusinessException(
                        "Invalid card information"
                );
            }

            if (cardExpiry == null ||
                    !cardExpiry.matches("\\d{2}/\\d{2}")) {

                throw new BusinessException(
                        "Invalid card expiry"
                );
            }

        } else {

            cardName = null;
            cardLast4 = null;
            cardExpiry = null;
        }

        // --------------------------------------------------------
        // Prepare update
        // --------------------------------------------------------

        User update =
                new User();

        update.setId(userId);

        update.setSavedPaymentMethod(
                paymentMethod
        );

        update.setSavedCardName(
                cardName
        );

        update.setSavedCardLast4(
                cardLast4
        );

        update.setSavedCardExpiry(
                cardExpiry
        );

        // --------------------------------------------------------
        // SAVE
        // --------------------------------------------------------

        int affected =
                userMapper.updatePaymentDetails(update);

        if (affected == 0) {
            throw new BusinessException(
                    404,
                    "Payment information could not be saved"
            );
        }

        // --------------------------------------------------------
        // Return updated user
        // --------------------------------------------------------

        User updated =
                userMapper.findById(userId);

        if (updated == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        updated.setPassword(null);

        return updated;
    }


    // ============================================================
    // ADMIN SIDE
    // ============================================================

    @Override
    public List<User> getAllUsers() {

        List<User> users =
                userMapper.findAll();

        for (User user : users) {
            user.setPassword(null);
        }

        return users;
    }


    @Override
    public List<User> getDeletedUsers() {

        List<User> users =
                userMapper.findDeleted();

        for (User user : users) {
            user.setPassword(null);
        }

        return users;
    }


    // ============================================================
    // ADMIN - CREATE USER / ADMIN
    // ============================================================

    @Override
    public User createUserByAdmin(User user) {

        if (user == null) {
            throw new BusinessException(
                    "User information is required"
            );
        }

        String username =
                user.getUsername() == null
                        ? ""
                        : user.getUsername().trim();

        if (username.isEmpty()) {
            throw new BusinessException(
                    "Username is required"
            );
        }

        String password =
                user.getPassword() == null
                        ? ""
                        : user.getPassword();

        if (password.isEmpty()) {
            throw new BusinessException(
                    "Password is required"
            );
        }

        if (password.length() < 6) {
            throw new BusinessException(
                    "Password must be at least 6 characters"
            );
        }

        String email =
                user.getEmail() == null
                        ? null
                        : user.getEmail().trim();

        if (email != null && email.isEmpty()) {
            email = null;
        }

        String phone =
                user.getPhone() == null
                        ? null
                        : user.getPhone().trim();

        if (phone != null && phone.isEmpty()) {
            phone = null;
        }

        String role =
                user.getRole() == null
                        ? "USER"
                        : user.getRole()
                        .trim()
                        .toUpperCase();

        if (!role.equals("USER") &&
                !role.equals("ADMIN")) {

            throw new BusinessException(
                    "Invalid user role"
            );
        }

        if (userMapper.countByUsername(username) > 0) {

            throw new BusinessException(
                    "Username already exists"
            );
        }

        if (email != null &&
                userMapper.countByEmail(email) > 0) {

            throw new BusinessException(
                    "Email already exists"
            );
        }

        User newUser =
                new User();

        newUser.setUsername(username);

        newUser.setPassword(
                passwordEncoder.encode(password)
        );

        newUser.setEmail(email);

        newUser.setPhone(phone);

        newUser.setRole(role);

        newUser.setIsDeleted(false);

        int affected =
                userMapper.insertByAdmin(newUser);

        if (affected == 0) {
            throw new BusinessException(
                    "User could not be created"
            );
        }

        newUser.setPassword(null);

        return newUser;
    }


    // ============================================================
    // ADMIN - UPDATE USER
    // ============================================================

    @Override
    public User updateUser(
            Long id,
            User user
    ) {

        User existing =
                userMapper.findById(id);

        if (existing == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        if (user == null) {
            throw new BusinessException(
                    "User information is required"
            );
        }

        if (user.getUsername() == null ||
                user.getUsername().trim().isEmpty()) {

            throw new BusinessException(
                    "Username is required"
            );
        }

        String username =
                user.getUsername().trim();

        if (userMapper.countByUsernameExcludingId(
                username,
                id
        ) > 0) {

            throw new BusinessException(
                    "Username is already taken"
            );
        }

        String email =
                user.getEmail() == null
                        ? null
                        : user.getEmail().trim();

        if (email != null &&
                !email.isEmpty() &&
                userMapper.countByEmailExcludingId(
                        email,
                        id
                ) > 0) {

            throw new BusinessException(
                    "Email is already registered"
            );
        }

        if (email != null &&
                email.isEmpty()) {

            email = null;
        }

        String phone =
                user.getPhone() == null
                        ? null
                        : user.getPhone().trim();

        if (phone != null &&
                phone.isEmpty()) {

            phone = null;
        }

        String role =
                user.getRole() == null
                        ? existing.getRole()
                        : user.getRole()
                        .trim()
                        .toUpperCase();

        if (role == null ||
                (!role.equals("USER") &&
                        !role.equals("ADMIN"))) {

            throw new BusinessException(
                    "Invalid user role"
            );
        }

        User updateUser =
                new User();

        updateUser.setId(id);

        updateUser.setUsername(
                username
        );

        updateUser.setEmail(
                email
        );

        updateUser.setPhone(
                phone
        );

        updateUser.setRole(
                role
        );

        int affected =
                userMapper.update(updateUser);

        if (affected == 0) {
            throw new BusinessException(
                    404,
                    "User could not be updated"
            );
        }

        User updated =
                userMapper.findById(id);

        if (updated == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        updated.setPassword(null);

        return updated;
    }


    // ============================================================
    // ADMIN - SOFT DELETE USER
    // ============================================================

    @Override
    public void deleteUser(Long id) {

        User existing =
                userMapper.findById(id);

        if (existing == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        int affected =
                userMapper.deleteById(id);

        if (affected == 0) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }
    }


    // ============================================================
    // ADMIN - RESTORE USER
    // ============================================================

    @Override
    public void restoreUser(Long id) {

        User existing =
                userMapper.findAnyById(id);

        if (existing == null) {
            throw new BusinessException(
                    404,
                    "User not found"
            );
        }

        if (!Boolean.TRUE.equals(
                existing.getIsDeleted()
        )) {

            throw new BusinessException(
                    "User is already active"
            );
        }

        int affected =
                userMapper.restoreById(id);

        if (affected == 0) {
            throw new BusinessException(
                    404,
                    "User could not be restored"
            );
        }
    }

    @Override
    public void changePassword(
            Long userId,
            ChangePasswordRequest request
    ) {
        User user =
                userMapper.findById(userId);

        if (user == null) {
            throw new RuntimeException(
                    "User not found."
            );
        }

        if (
                request.getCurrentPassword() == null ||
                        request.getCurrentPassword().isBlank()
        ) {
            throw new RuntimeException(
                    "Current password is required."
            );
        }

        if (
                request.getNewPassword() == null ||
                        request.getNewPassword().isBlank()
        ) {
            throw new RuntimeException(
                    "New password is required."
            );
        }

        if (
                request.getNewPassword().length() < 6
        ) {
            throw new RuntimeException(
                    "New password must be at least 6 characters."
            );
        }

        if (
                !passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                )
        ) {
            throw new RuntimeException(
                    "Current password is incorrect."
            );
        }

        if (
                passwordEncoder.matches(
                        request.getNewPassword(),
                        user.getPassword()
                )
        ) {
            throw new RuntimeException(
                    "New password must be different from your current password."
            );
        }

        String encodedPassword =
                passwordEncoder.encode(
                        request.getNewPassword()
                );

        int affected =
                userMapper.updatePassword(
                        userId,
                        encodedPassword
                );

        if (affected == 0) {
            throw new RuntimeException(
                    "Unable to update password."
            );
        }
    }
}