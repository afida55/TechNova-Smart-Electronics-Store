package com.technova.shop.service.impl;

import com.technova.shop.dto.CartItemView;
import com.technova.shop.entity.Cart;
import com.technova.shop.entity.Product;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.CartMapper;
import com.technova.shop.mapper.ProductMapper;
import com.technova.shop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartMapper cartMapper;
    private final ProductMapper productMapper;


    // ============================================================
    // GET CART
    // ============================================================

    @Override
    public List<CartItemView> getCart(Long userId) {
        return cartMapper.findViewByUserId(userId);
    }


    // ============================================================
    // ADD TO CART
    // ============================================================

    @Override
    @Transactional
    public void addToCart(
            Long userId,
            Long productId,
            int quantity
    ) {

        if (quantity < 1) {
            throw new BusinessException(
                    400,
                    "Quantity must be at least 1"
            );
        }

        Product product =
                productMapper.findById(productId);

        if (product == null) {
            throw new BusinessException(
                    404,
                    "Product not found"
            );
        }

        if (product.getStock() < quantity) {
            throw new BusinessException(
                    "Not enough stock available"
            );
        }

        Cart existing =
                cartMapper.findByUserAndProduct(
                        userId,
                        productId
                );

        if (existing != null) {

            int newQty =
                    existing.getQuantity()
                            + quantity;

            if (newQty > product.getStock()) {
                throw new BusinessException(
                        "Not enough stock available"
                );
            }

            cartMapper.updateQuantity(
                    existing.getId(),
                    userId,
                    newQty
            );

        } else {

            Cart cart = new Cart();

            cart.setUserId(userId);
            cart.setProductId(productId);
            cart.setQuantity(quantity);

            cartMapper.insert(cart);
        }
    }


    // ============================================================
    // UPDATE CART QUANTITY
    // ============================================================

    @Override
    @Transactional
    public void updateQuantity(
            Long userId,
            Long cartItemId,
            int quantity
    ) {

        // Quantity must be at least 1
        if (quantity < 1) {
            throw new BusinessException(
                    400,
                    "Quantity must be at least 1"
            );
        }


        // IMPORTANT:
        // cartItemId is the ID of the cart row.
        //
        // Do NOT use:
        // findByUserAndProduct(userId, cartItemId)
        //
        // because that method expects a PRODUCT ID.
        Cart cartItem =
                cartMapper.findById(
                        cartItemId,
                        userId
                );


        // Cart item does not belong to this user
        // or does not exist
        if (cartItem == null) {
            throw new BusinessException(
                    404,
                    "Cart item not found"
            );
        }


        // Get the product belonging to this cart item
        Product product =
                productMapper.findById(
                        cartItem.getProductId()
                );


        if (product == null) {
            throw new BusinessException(
                    404,
                    "Product not found"
            );
        }


        // Make sure requested quantity
        // does not exceed available stock
        if (quantity > product.getStock()) {
            throw new BusinessException(
                    "Cannot set quantity to "
                            + quantity
                            + ". Only "
                            + product.getStock()
                            + " units available in stock."
            );
        }


        // Update the cart row
        int updated =
                cartMapper.updateQuantity(
                        cartItemId,
                        userId,
                        quantity
                );


        // Make sure the database actually
        // updated the cart row
        if (updated == 0) {
            throw new BusinessException(
                    404,
                    "Cart item not found"
            );
        }
    }


    // ============================================================
    // REMOVE CART ITEM
    // ============================================================

    @Override
    @Transactional
    public void removeItem(
            Long userId,
            Long cartItemId
    ) {

        int deleted =
                cartMapper.delete(
                        cartItemId,
                        userId
                );

        if (deleted == 0) {
            throw new BusinessException(
                    404,
                    "Cart item not found"
            );
        }
    }
}