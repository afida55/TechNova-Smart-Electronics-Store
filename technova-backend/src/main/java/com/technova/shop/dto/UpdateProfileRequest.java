package com.technova.shop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Email format is invalid")
    private String email;

    private String phone;
}
