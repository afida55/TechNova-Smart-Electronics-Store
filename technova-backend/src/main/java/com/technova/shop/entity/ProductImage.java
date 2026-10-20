package com.technova.shop.entity;

import lombok.Data;

@Data
public class ProductImage {

    private Long id;

    private Long productId;

    private String color;

    private String image;

    private Boolean isPrimary;
}