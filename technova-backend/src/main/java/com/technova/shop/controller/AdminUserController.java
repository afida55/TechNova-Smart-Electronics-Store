package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.entity.User;
import com.technova.shop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;


    // ============================================================
    // ACTIVE USERS
    // ============================================================

    @GetMapping
    public ApiResponse<List<User>> getAllUsers() {

        return ApiResponse.success(
                userService.getAllUsers()
        );
    }


    // ============================================================
    // DELETED USERS
    // ============================================================

    @GetMapping("/deleted")
    public ApiResponse<List<User>> getDeletedUsers() {

        return ApiResponse.success(
                userService.getDeletedUsers()
        );
    }


    // ============================================================
    // CREATE USER / ADMIN
    // ============================================================

    @PostMapping
    public ApiResponse<User> createUser(
            @RequestBody User user
    ) {

        return ApiResponse.success(
                "User created successfully",
                userService.createUserByAdmin(user)
        );
    }


    // ============================================================
    // UPDATE USER
    // ============================================================

    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(
            @PathVariable Long id,
            @RequestBody User user
    ) {

        return ApiResponse.success(
                "User updated",
                userService.updateUser(
                        id,
                        user
                )
        );
    }


    // ============================================================
    // SOFT DELETE USER
    // ============================================================

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(
            @PathVariable Long id
    ) {

        userService.deleteUser(id);

        return ApiResponse.success(
                null
        );
    }


    // ============================================================
    // RESTORE USER
    // ============================================================

    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restoreUser(
            @PathVariable Long id
    ) {

        userService.restoreUser(id);

        return ApiResponse.success(
                null
        );
    }
}