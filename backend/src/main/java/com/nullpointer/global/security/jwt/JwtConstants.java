package com.nullpointer.global.security.jwt;

import lombok.Getter;

@Getter
public enum JwtConstants {

    HEADER_PREFIX("Bearer "),
    AUTHORIZATION_HEADER("Authorization"),

    // Claim Keys
    CLAIM_USER_ID("userId"),
    CLAIM_TYPE("type"),

    // Token Types
    TYPE_ACCESS("ACCESS"),
    TYPE_REFRESH("REFRESH");

    private final String value;

    JwtConstants(String value) {
        this.value = value;
    }

}
