package com.nullpointer.global.common.enums;

import lombok.Getter;

@Getter
public enum RedisKeyType {

    EMAIL_VERIFICATION("np:auth:email:%s"), // 5분 (밀리초)
    REFRESH_TOKEN("np:auth:refresh:%s"), // 2주
    BLACKLIST("np:auth:blacklist:%s");

    private final String pattern;

    RedisKeyType(String pattern) {
        this.pattern = pattern;
    }

    /**
     * Redis Key 생성
     * ex) RedisKeyType.REFRESH_TOKEN.getKey(1L) -> "np:auth:refresh:1"
     */
    public String getKey(Object... args) {
        return String.format(pattern, args);
    }

}
