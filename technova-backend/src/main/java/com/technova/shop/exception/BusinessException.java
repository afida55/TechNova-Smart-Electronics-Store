package com.technova.shop.exception;

import lombok.Getter;

/** Thrown by the service layer for expected business-rule failures (bad login, out of stock, etc). */
@Getter
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
