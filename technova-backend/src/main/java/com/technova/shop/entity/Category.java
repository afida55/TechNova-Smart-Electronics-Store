package com.technova.shop.entity;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Category {

    private Long id;
    private String name;
    private Long parentId;

    // false = active, true = deleted
    private Boolean isDeleted;

    // transient - populated only when building the category tree
    private List<Category> children = new ArrayList<>();
}